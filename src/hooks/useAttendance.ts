import { useState, useEffect, useCallback } from "react";
import { timetable, getAllCourses, getTotalClassesPerCourse } from "@/data/timetable";

export interface AttendanceRecord {
  [classId: string]: "present" | "absent" | null;
}

export interface SubjectStats {
  course: string;
  totalClasses: number;
  attended: number;
  percentage: number;
}

const STORAGE_KEY = "student-attendance-data";

export const useAttendance = () => {
  const [attendance, setAttendance] = useState<AttendanceRecord>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  });

  // Save to localStorage whenever attendance changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(attendance));
  }, [attendance]);

  const markAttendance = useCallback(
    (classId: string, status: "present" | "absent") => {
      setAttendance((prev) => ({
        ...prev,
        [classId]: status,
      }));
    },
    []
  );

  const clearAttendance = useCallback((classId: string) => {
    setAttendance((prev) => {
      const next = { ...prev };
      delete next[classId];
      return next;
    });
  }, []);

  const resetAllAttendance = useCallback(() => {
    setAttendance({});
  }, []);

  // Calculate stats
  const getOverallStats = useCallback(() => {
    let totalMarked = 0;
    let totalPresent = 0;

    Object.values(attendance).forEach((status) => {
      if (status === "present" || status === "absent") {
        totalMarked++;
        if (status === "present") totalPresent++;
      }
    });

    const percentage = totalMarked > 0 ? (totalPresent / totalMarked) * 100 : 0;
    return { totalMarked, totalPresent, percentage };
  }, [attendance]);

  const getSubjectStats = useCallback((): SubjectStats[] => {
    const courses = getAllCourses();
    const classesPerCourse = getTotalClassesPerCourse();

    return courses.map((course) => {
      let attended = 0;
      let markedClasses = 0;

      // Count attendance for this course
      Object.entries(timetable).forEach(([_, dayClasses]) => {
        dayClasses.forEach((slot) => {
          if (slot.course === course) {
            const status = attendance[slot.id];
            if (status === "present") {
              attended++;
              markedClasses++;
            } else if (status === "absent") {
              markedClasses++;
            }
          }
        });
      });

      const totalClasses = markedClasses || classesPerCourse[course];
      const percentage = markedClasses > 0 ? (attended / markedClasses) * 100 : 0;

      return {
        course,
        totalClasses: markedClasses,
        attended,
        percentage,
      };
    });
  }, [attendance]);

  // 75% rule calculations
  const calculateBunkStatus = useCallback(() => {
    const { totalMarked, totalPresent, percentage } = getOverallStats();

    if (totalMarked === 0) {
      return {
        canBunk: 0,
        mustAttend: 0,
        status: "neutral" as const,
        message: "Start marking attendance to see bunk status",
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
            ? `You can safely bunk ${canBunk} class${canBunk > 1 ? "es" : ""}`
            : "Attend next class to maintain 75%",
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
      };
    }
  }, [getOverallStats]);

  return {
    attendance,
    markAttendance,
    clearAttendance,
    resetAllAttendance,
    getOverallStats,
    getSubjectStats,
    calculateBunkStatus,
  };
};
