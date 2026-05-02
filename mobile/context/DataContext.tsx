import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import {
  ScrapedData,
  SubjectStats,
  AttendanceByDate,
  DailyAttendanceRecord,
  ClassBlock,
} from '../types';
import { GUEST_DATA } from '../lib/guestData';
import { fetchPortalData } from '../lib/api';
import {
  getEffectiveDay,
  SEMESTER_END,
  isBlockCancelled,
  calendarOverrides,
  holidays,
} from '../lib/academicCalendar';
import { getBlocksForDay, normalizeCode, getDateKey } from '../lib/timetableUtils';

const ATT_KEY = 'unibuddy_attendance_v3';
const DATA_KEY = 'unibuddy_scraped_data';

interface DataContextValue {
  data: ScrapedData | null;
  attendanceByDate: AttendanceByDate;
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  lastUpdated: string | null;
  subjectStats: SubjectStats[];
  fetchData: () => Promise<void>;
  markAttendance: (blockId: string, status: 'present' | 'absent', date?: Date) => void;
  getAttendanceForDate: (date: Date) => DailyAttendanceRecord;
  getBlocksForSelectedDay: (date: Date) => ClassBlock[];
  resetAttendance: () => void;
}

const DataContext = createContext<DataContextValue | null>(null);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const { session, isGuest } = useAuth();
  const [data, setData] = useState<ScrapedData | null>(null);
  const [attendanceByDate, setAttendanceByDate] = useState<AttendanceByDate>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const hydrate = async () => {
      setIsLoading(true);
      try {
        const [storedData, storedAtt] = await Promise.all([
          AsyncStorage.getItem(DATA_KEY),
          AsyncStorage.getItem(ATT_KEY),
        ]);
        if (storedData) setData(JSON.parse(storedData));
        if (storedAtt) setAttendanceByDate(JSON.parse(storedAtt));
      } catch (_) {}
      setIsLoading(false);
    };

    if (isGuest) {
      setData(GUEST_DATA);
      setIsLoading(false);
    } else if (session) {
      hydrate();
    } else {
      setData(null);
      setIsLoading(false);
    }
  }, [session, isGuest]);

  const fetchData = useCallback(async () => {
    if (!session?.accessToken || isGuest) return;
    setIsFetching(true);
    setError(null);
    try {
      const result = await fetchPortalData(session.accessToken);
      if (result.attendance) {
        setData(result);
        await AsyncStorage.setItem(DATA_KEY, JSON.stringify(result));
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to fetch data');
    } finally {
      setIsFetching(false);
    }
  }, [session, isGuest]);

  useEffect(() => {
    if (session?.accessToken && !isGuest) {
      fetchData();
    }
  }, [session?.accessToken]);

  const semesterTotals = useMemo(() => {
    if (!data?.attendance || !data?.timetable) return {};
    const totals: Record<string, number> = {};
    const att = data.attendance;
    att.forEach((a) => {
      totals[normalizeCode(a.courseCode)] = Number(a.totalHours) || 0;
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(SEMESTER_END);
    let cursor = new Date(today);

    while (cursor <= end) {
      const effectiveDay = getEffectiveDay(cursor);
      if (effectiveDay) {
        const blocks = getBlocksForDay(effectiveDay, data.timetable, data.attendance);
        blocks.forEach((block) => {
          if (!isBlockCancelled(cursor)) {
            const norm = normalizeCode(block.course);
            if (totals[norm] !== undefined) {
              totals[norm] = (totals[norm] || 0) + block.duration;
            }
          }
        });
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    return totals;
  }, [data]);

  const subjectStats = useMemo<SubjectStats[]>(() => {
    if (!data?.attendance) return [];
    return data.attendance
      .filter((a) => {
        const code = (a.courseCode || '').toLowerCase();
        return code && !code.includes('subject code') && !code.includes('registration');
      })
      .map((a) => {
        const attended = (Number(a.attendedHours) || 0) + (Number(a.odHours) || 0);
        const od = Number(a.odHours) || 0;
        const totalHeld = Number(a.totalHours) || 0;
        const normCode = normalizeCode(a.courseCode);
        const hybridTotal = semesterTotals[normCode] || totalHeld || 0;
        const futureClasses = Math.max(0, hybridTotal - totalHeld);
        const currentPct = totalHeld > 0 ? (attended / totalHeld) * 100 : 0;
        const semesterPct = hybridTotal > 0 ? (attended / hybridTotal) * 100 : 0;
        const target75 = Math.ceil(0.75 * hybridTotal);
        const mustAttend = Math.max(0, target75 - attended);
        const maxBunks = Math.floor(0.25 * hybridTotal);
        const totalAbsent = Math.max(0, totalHeld - attended);
        const canBunk = Math.max(0, maxBunks - totalAbsent);
        const projectedFinal =
          hybridTotal > 0 ? ((attended + futureClasses) / hybridTotal) * 100 : 0;

        let status: 'safe' | 'warning' | 'danger' = 'danger';
        if (semesterPct >= 75) status = 'safe';
        else if (projectedFinal >= 75) status = 'warning';

        return {
          course: a.courseCode,
          title: a.courseTitle,
          conducted: totalHeld,
          attended,
          absent: totalAbsent,
          od,
          semesterTotal: hybridTotal,
          percentage: semesterPct,
          currentPercentage: currentPct,
          projectedFinalPercentage: projectedFinal,
          projectedWorstPercentage: semesterPct,
          canBunk,
          mustAttend,
          status,
        };
      });
  }, [data, semesterTotals]);

  const markAttendance = useCallback(
    (blockId: string, status: 'present' | 'absent', date: Date = new Date()) => {
      const key = getDateKey(date);
      setAttendanceByDate((prev) => {
        const next = { ...prev, [key]: { ...prev[key], [blockId]: status } };
        AsyncStorage.setItem(ATT_KEY, JSON.stringify(next)).catch(() => {});
        return next;
      });
    },
    []
  );

  const getAttendanceForDate = useCallback(
    (date: Date): DailyAttendanceRecord => {
      return attendanceByDate[getDateKey(date)] || {};
    },
    [attendanceByDate]
  );

  const getBlocksForSelectedDay = useCallback(
    (date: Date): ClassBlock[] => {
      if (!data?.timetable) return [];
      const effectiveDay = getEffectiveDay(date);
      if (!effectiveDay) return [];
      return getBlocksForDay(effectiveDay, data.timetable, data.attendance || []);
    },
    [data]
  );

  const resetAttendance = useCallback(() => {
    setAttendanceByDate({});
    AsyncStorage.removeItem(ATT_KEY).catch(() => {});
  }, []);

  return (
    <DataContext.Provider
      value={{
        data,
        attendanceByDate,
        isLoading,
        isFetching,
        error,
        lastUpdated: data?.lastUpdated || null,
        subjectStats,
        fetchData,
        markAttendance,
        getAttendanceForDate,
        getBlocksForSelectedDay,
        resetAttendance,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside DataProvider');
  return ctx;
};
