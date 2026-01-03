import { useState, useEffect, useCallback } from "react";
import { getAllCourses, DayName, getBlocksForDay, ClassBlock } from "@/data/timetable";
import { format, parseISO, isValid } from "date-fns";

// Attendance is stored per block (not per individual slot)
export interface DailyAttendanceRecord {
  [blockId: string]: "present" | "absent" | null;
}

export interface AttendanceByDate {
  [dateKey: string]: DailyAttendanceRecord;
}

export interface SubjectStats {
  course: string;
  totalBlocks: number;
  attended: number;
  percentage: number;
  canBunk: number;
  mustAttend: number;
  status: "safe" | "danger" | "neutral";
}

const STORAGE_KEY = "student-attendance-data-v3";

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
    (blockId: string, status: "present" | "absent", date: Date = selectedDate) => {
      const dateKey = getDateKey(date);
      setAttendanceByDate((prev) => ({
        ...prev,
        [dateKey]: {
          ...prev[dateKey],
          [blockId]: status,
        },
      }));
    },
    [selectedDate]
  );

  const clearAttendance = useCallback((blockId: string, date: Date = selectedDate) => {
    const dateKey = getDateKey(date);
    setAttendanceByDate((prev) => {
      const dayData = { ...prev[dateKey] };
      delete dayData[blockId];
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

  // Calculate stats per course (blocks, not individual slots)
  const getSubjectStats = useCallback((): SubjectStats[] => {
    const courses = getAllCourses();
    const courseStats: Record<string, { attended: number; total: number }> = {};

    courses.forEach((course) => {
      courseStats[course] = { attended: 0, total: 0 };
    });

    // Iterate through all dates and count attendance per course (by blocks)
    Object.entries(attendanceByDate).forEach(([dateKey, dayRecord]) => {
      const date = parseISO(dateKey);
      if (!isValid(date)) return;

      const dayName = getDayNameFromDate(date);
      if (!dayName) return;

      const blocks = getBlocksForDay(dayName);
      blocks.forEach((block) => {
        const status = dayRecord[block.blockId];
        if (status === "present") {
          courseStats[block.course].attended++;
          courseStats[block.course].total++;
        } else if (status === "absent") {
          courseStats[block.course].total++;
        }
      });
    });

    return courses.map((course) => {
      const stats = courseStats[course];
      const percentage = stats.total > 0 ? (stats.attended / stats.total) * 100 : 0;

      // Calculate bunk status per course
      let canBunk = 0;
      let mustAttend = 0;
      let status: "safe" | "danger" | "neutral" = "neutral";

      if (stats.total > 0) {
        if (percentage >= 75) {
          status = "safe";
          // How many can be missed: attended / (total + x) >= 0.75
          canBunk = Math.floor(stats.attended / 0.75 - stats.total);
          canBunk = Math.max(0, canBunk);
        } else {
          status = "danger";
          // How many must attend: (attended + x) / (total + x) >= 0.75
          mustAttend = Math.ceil(3 * stats.total - 4 * stats.attended);
          mustAttend = Math.max(0, mustAttend);
        }
      }

      return {
        course,
        totalBlocks: stats.total,
        attended: stats.attended,
        percentage,
        canBunk,
        mustAttend,
        status,
      };
    });
  }, [attendanceByDate]);

  // Get worst course status for overall bunk message
  const calculateBunkStatus = useCallback(() => {
    const stats = getSubjectStats();
    const coursesWithData = stats.filter((s) => s.totalBlocks > 0);

    if (coursesWithData.length === 0) {
      return {
        canBunk: 0,
        mustAttend: 0,
        status: "neutral" as const,
        message: "Start marking attendance to see bunk status",
        currentPercentage: 0,
        worstCourse: null as string | null,
      };
    }

    // Find the course with lowest percentage (worst case)
    const worstCourse = coursesWithData.reduce((prev, curr) =>
      curr.percentage < prev.percentage ? curr : prev
    );

    if (worstCourse.status === "danger") {
      return {
        canBunk: 0,
        mustAttend: worstCourse.mustAttend,
        status: "danger" as const,
        message: `${worstCourse.course}: Attend ${worstCourse.mustAttend} class${worstCourse.mustAttend > 1 ? "es" : ""} to reach 75%`,
        currentPercentage: worstCourse.percentage,
        worstCourse: worstCourse.course,
      };
    }

    // Find course with minimum bunks allowed
    const minBunkCourse = coursesWithData.reduce((prev, curr) =>
      curr.canBunk < prev.canBunk ? curr : prev
    );

    return {
      canBunk: minBunkCourse.canBunk,
      mustAttend: 0,
      status: "safe" as const,
      message:
        minBunkCourse.canBunk > 0
          ? `${minBunkCourse.course}: Can bunk ${minBunkCourse.canBunk} class${minBunkCourse.canBunk > 1 ? "es" : ""}`
          : `${minBunkCourse.course}: Attend next class to stay above 75%`,
      currentPercentage: minBunkCourse.percentage,
      worstCourse: minBunkCourse.course,
    };
  }, [getSubjectStats]);

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

  // Get attendance summary for a specific date (counts blocks)
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

  // Get blocks for a date
  const getBlocksForDate = useCallback((date: Date): ClassBlock[] => {
    const dayName = getDayNameFromDate(date);
    if (!dayName) return [];
    return getBlocksForDay(dayName);
  }, []);

  return {
    attendanceByDate,
    selectedDate,
    setSelectedDate,
    markAttendance,
    clearAttendance,
    resetAllAttendance,
    getAttendanceForDate,
    getSubjectStats,
    calculateBunkStatus,
    getMarkedDates,
    getDateSummary,
    getBlocksForDate,
  };
};