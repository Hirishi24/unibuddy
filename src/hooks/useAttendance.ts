import { useState, useEffect, useCallback } from "react";
import { timetable, getAllCourses, DayName } from "@/data/timetable";
import { format, parseISO, isValid } from "date-fns";

export interface DailyAttendanceRecord {
  [classId: string]: "present" | "absent" | null;
}

export interface AttendanceByDate {
  [dateKey: string]: DailyAttendanceRecord;
}

export interface SubjectStats {
  course: string;
  totalClasses: number;
  attended: number;
  percentage: number;
}

const STORAGE_KEY = "student-attendance-data-v2";

// Helper to get day name from date
const getDayNameFromDate = (date: Date): DayName | null => {
  const dayIndex = date.getDay();
  const days: (DayName | null)[] = [null, "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", null];
  return days[dayIndex];
};

export const useAttendance = () => {
  const [attendanceByDate, setAttendanceByDate] = useState<AttendanceByDate>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {};
      }
    }
    return {};
  });

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Save to localStorage whenever attendance changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(attendanceByDate));
  }, [attendanceByDate]);

  const getDateKey = (date: Date): string => format(date, "yyyy-MM-dd");

  const markAttendance = useCallback(
    (classId: string, status: "present" | "absent", date: Date = selectedDate) => {
      const dateKey = getDateKey(date);
      setAttendanceByDate((prev) => ({
        ...prev,
        [dateKey]: {
          ...prev[dateKey],
          [classId]: status,
        },
      }));
    },
    [selectedDate]
  );

  const clearAttendance = useCallback((classId: string, date: Date = selectedDate) => {
    const dateKey = getDateKey(date);
    setAttendanceByDate((prev) => {
      const dayData = { ...prev[dateKey] };
      delete dayData[classId];
      return {
        ...prev,
        [dateKey]: dayData,
      };
    });
  }, [selectedDate]);

  const resetAllAttendance = useCallback(() => {
    setAttendanceByDate({});
  }, []);

  const getAttendanceForDate = useCallback((date: Date): DailyAttendanceRecord => {
    const dateKey = getDateKey(date);
    return attendanceByDate[dateKey] || {};
  }, [attendanceByDate]);

  // Calculate overall stats across all dates
  const getOverallStats = useCallback(() => {
    let totalMarked = 0;
    let totalPresent = 0;

    Object.values(attendanceByDate).forEach((dayRecord) => {
      Object.values(dayRecord).forEach((status) => {
        if (status === "present" || status === "absent") {
          totalMarked++;
          if (status === "present") totalPresent++;
        }
      });
    });

    const percentage = totalMarked > 0 ? (totalPresent / totalMarked) * 100 : 0;
    return { totalMarked, totalPresent, percentage };
  }, [attendanceByDate]);

  const getSubjectStats = useCallback((): SubjectStats[] => {
    const courses = getAllCourses();
    const courseStats: Record<string, { attended: number; total: number }> = {};

    courses.forEach((course) => {
      courseStats[course] = { attended: 0, total: 0 };
    });

    // Iterate through all dates and count attendance per course
    Object.entries(attendanceByDate).forEach(([dateKey, dayRecord]) => {
      const date = parseISO(dateKey);
      if (!isValid(date)) return;

      const dayName = getDayNameFromDate(date);
      if (!dayName || !timetable[dayName]) return;

      timetable[dayName].forEach((slot) => {
        const status = dayRecord[slot.id];
        if (status === "present") {
          courseStats[slot.course].attended++;
          courseStats[slot.course].total++;
        } else if (status === "absent") {
          courseStats[slot.course].total++;
        }
      });
    });

    return courses.map((course) => {
      const stats = courseStats[course];
      const percentage = stats.total > 0 ? (stats.attended / stats.total) * 100 : 0;
      return {
        course,
        totalClasses: stats.total,
        attended: stats.attended,
        percentage,
      };
    });
  }, [attendanceByDate]);

  // 75% rule calculations based on OD/ML (actual attendance)
  const calculateBunkStatus = useCallback(() => {
    const { totalMarked, totalPresent, percentage } = getOverallStats();

    if (totalMarked === 0) {
      return {
        canBunk: 0,
        mustAttend: 0,
        status: "neutral" as const,
        message: "Start marking attendance to see bunk status",
        currentPercentage: 0,
      };
    }

    if (percentage >= 75) {
      // Calculate how many can be missed while staying at or above 75%
      // (totalPresent) / (totalMarked + x) >= 0.75
      // totalPresent >= 0.75 * (totalMarked + x)
      // totalPresent / 0.75 >= totalMarked + x
      // x <= (totalPresent / 0.75) - totalMarked
      const canBunk = Math.floor(totalPresent / 0.75 - totalMarked);
      return {
        canBunk: Math.max(0, canBunk),
        mustAttend: 0,
        status: "safe" as const,
        message:
          canBunk > 0
            ? `You can bunk ${canBunk} class${canBunk > 1 ? "es" : ""} and stay above 75%`
            : "Attend next class to maintain 75%",
        currentPercentage: percentage,
      };
    } else {
      // Calculate how many must be attended to reach 75%
      // (totalPresent + x) / (totalMarked + x) >= 0.75
      // totalPresent + x >= 0.75 * totalMarked + 0.75x
      // 0.25x >= 0.75 * totalMarked - totalPresent
      // x >= (0.75 * totalMarked - totalPresent) / 0.25
      // x >= 3 * totalMarked - 4 * totalPresent
      const mustAttend = Math.ceil(3 * totalMarked - 4 * totalPresent);
      return {
        canBunk: 0,
        mustAttend: Math.max(0, mustAttend),
        status: "danger" as const,
        message:
          mustAttend > 0
            ? `Attend next ${mustAttend} class${mustAttend > 1 ? "es" : ""} to reach 75%`
            : "You're at exactly 75%",
        currentPercentage: percentage,
      };
    }
  }, [getOverallStats]);

  // Get dates that have any attendance marked
  const getMarkedDates = useCallback((): Date[] => {
    return Object.keys(attendanceByDate)
      .filter((dateKey) => {
        const record = attendanceByDate[dateKey];
        return Object.values(record).some((status) => status === "present" || status === "absent");
      })
      .map((dateKey) => parseISO(dateKey))
      .filter(isValid);
  }, [attendanceByDate]);

  // Get attendance summary for a specific date
  const getDateSummary = useCallback((date: Date): { present: number; absent: number } => {
    const record = getAttendanceForDate(date);
    let present = 0;
    let absent = 0;
    Object.values(record).forEach((status) => {
      if (status === "present") present++;
      if (status === "absent") absent++;
    });
    return { present, absent };
  }, [getAttendanceForDate]);

  return {
    attendanceByDate,
    selectedDate,
    setSelectedDate,
    markAttendance,
    clearAttendance,
    resetAllAttendance,
    getAttendanceForDate,
    getOverallStats,
    getSubjectStats,
    calculateBunkStatus,
    getMarkedDates,
    getDateSummary,
  };
};