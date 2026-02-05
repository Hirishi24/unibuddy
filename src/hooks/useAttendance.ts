import { useState, useEffect, useCallback } from "react";
import { getAllCourses, DayName, getBlocksForDay, ClassBlock, courseTitles, courseMetadata, CourseMetadata } from "@/data/timetable";
import { getCourseStartDate, isLabCancelledDay } from "@/data/academicCalendar";
import { format, parseISO, isValid } from "date-fns";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// Attendance is stored per block (not per individual slot)
export interface DailyAttendanceRecord {
  [blockId: string]: "present" | "absent" | null;
}

export interface AttendanceByDate {
  [dateKey: string]: DailyAttendanceRecord;
}

export interface SubjectStats {
  course: string;
  totalBlocks: number; // attended + missed so far
  attended: number;
  percentage: number;
  canBunk: number;
  mustAttend: number;
  status: "safe" | "danger" | "neutral";
}

// Extended stats for detailed course view
export interface DetailedCourseStats {
  course: string;
  courseTitle: string;
  rooms: string[];
  // Semester totals
  semesterTotal: number;
  odAllowed: number;
  classesAfterOd: number;
  minRequiredFor75: number;
  minRequired: number; // 60% of classesAfterOd (with max OD)
  // Current progress
  classesHeld: number; // classes that have occurred
  attended: number;
  missed: number;
  currentPercentage: number;
  // Bunk calculations (without OD)
  canBunkWithoutOd: number;
  mustAttendFor75: number;
  // With OD calculations
  canBunkWithOd: number;
  effectiveAttendance: number; // if max OD is used
  // Projections
  remainingClasses: number;
  projectedFinalPercentage: number; // if all remaining attended
  projectedWorstPercentage: number; // if all remaining missed
  safetyMargin: number; // classes above 75% threshold
  status: "safe" | "warning" | "danger" | "critical";
}

const STORAGE_KEY = "student-attendance-data-v3";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
const USE_BACKEND = import.meta.env.VITE_USE_BACKEND === "true";

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
  const [isLoading, setIsLoading] = useState(false);

  // Fetch from backend on mount if enabled
  useEffect(() => {
    if (USE_BACKEND) {
      setIsLoading(true);
      fetch(`${API_URL}/attendance`)
        .then((res) => res.json())
        .then((data) => {
          if (data && typeof data === "object") {
            setAttendanceByDate(data);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          }
        })
        .catch((err) => console.error("Failed to fetch from backend:", err))
        .finally(() => setIsLoading(false));
    }
  }, []);

  // Save to localStorage whenever attendance changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(attendanceByDate));
  }, [attendanceByDate]);

  const getDateKey = (date: Date): string => format(date, "yyyy-MM-dd");

  const markAttendance = useCallback(
    (blockId: string, status: "present" | "absent", date: Date = selectedDate) => {
      const dateKey = getDateKey(date);
      
      // Update local state immediately
      setAttendanceByDate((prev) => ({
        ...prev,
        [dateKey]: {
          ...prev[dateKey],
          [blockId]: status,
        },
      }));

      // Sync to backend if enabled
      if (USE_BACKEND) {
        fetch(`${API_URL}/attendance`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: dateKey, blockId, status }),
        }).catch((err) => console.error("Failed to sync to backend:", err));
      }
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

    // Sync to backend if enabled
    if (USE_BACKEND) {
      fetch(`${API_URL}/attendance/${dateKey}/${blockId}`, {
        method: "DELETE",
      }).catch((err) => console.error("Failed to delete from backend:", err));
    }
  }, [selectedDate]);

  const resetAllAttendance = useCallback(() => {
    setAttendanceByDate({});
    
    // Sync to backend if enabled
    if (USE_BACKEND) {
      fetch(`${API_URL}/attendance`, {
        method: "DELETE",
      }).catch((err) => console.error("Failed to reset on backend:", err));
    }
  }, []);

  const getAttendanceForDate = useCallback((date: Date): DailyAttendanceRecord => {
    const dateKey = getDateKey(date);
    return attendanceByDate[dateKey] || {};
  }, [attendanceByDate]);

  // Calculate stats per course (in hours, not blocks)
  const getSubjectStats = useCallback((): SubjectStats[] => {
    const courses = getAllCourses();
    const courseStats: Record<string, { attended: number; total: number }> = {};

    courses.forEach((course) => {
      courseStats[course] = { attended: 0, total: 0 };
    });

    // Iterate through all dates and count attendance per course (by hours)
    Object.entries(attendanceByDate).forEach(([dateKey, dayRecord]) => {
      const date = parseISO(dateKey);
      if (!isValid(date)) return;

      const dayName = getDayNameFromDate(date);
      if (!dayName) return;

      const blocks = getBlocksForDay(dayName);
      blocks.forEach((block) => {
        // Skip if date is before course start date (e.g., late registration)
        const courseStart = getCourseStartDate(block.course);
        if (dateKey < courseStart) return;

        const status = dayRecord[block.blockId];
        // Count hours (duration) instead of blocks
        if (status === "present") {
          courseStats[block.course].attended += block.duration;
          courseStats[block.course].total += block.duration;
        } else if (status === "absent") {
          courseStats[block.course].total += block.duration;
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

  // Get blocks for a date (filters out courses that haven't started yet)
  const getBlocksForDate = useCallback((date: Date): ClassBlock[] => {
    const dayName = getDayNameFromDate(date);
    if (!dayName) return [];
    
    const dateStr = format(date, "yyyy-MM-dd");
    const allBlocks = getBlocksForDay(dayName);
    
    // Filter out courses that haven't started yet (e.g., late registrations)
    // Note: Labs on lab-cancelled days are still returned, but marked in UI as cancelled
    return allBlocks.filter((block) => {
      const courseStart = getCourseStartDate(block.course);
      return dateStr >= courseStart;
    });
  }, []);

  // Export attendance to Excel - Comprehensive export with all stats
  const exportToExcel = useCallback(() => {
    const wb = XLSX.utils.book_new();
    const exportDate = format(new Date(), "yyyy-MM-dd HH:mm");

    // ==================== SHEET 1: Overview ====================
    const allStats = getAllCourses().map(course => {
      const detailed = courseMetadata[course];
      const stats = getSubjectStats().find(s => s.course === course);
      const courseStart = getCourseStartDate(course);
      
      return {
        "Course Code": course,
        "Course Title": courseTitles[course] || course,
        "Start Date": courseStart,
        "Total Semester Hours": detailed?.totalClasses || 0,
        "Classes Held": stats?.totalBlocks || 0,
        "Present": stats?.attended || 0,
        "Absent": (stats?.totalBlocks || 0) - (stats?.attended || 0),
        "Attendance %": stats ? `${stats.percentage.toFixed(2)}%` : "0.00%",
        "OD Allowed": detailed?.odAllowed || 0,
        "Min Required (75%)": detailed ? Math.ceil(detailed.totalClasses * 0.75) : 0,
        "Can Bunk": stats?.canBunk || 0,
        "Must Attend": stats?.mustAttend || 0,
        "Status": stats?.status?.toUpperCase() || "NEUTRAL",
      };
    });
    
    const overviewWs = XLSX.utils.json_to_sheet(allStats);
    // Set column widths
    overviewWs['!cols'] = [
      { wch: 12 }, { wch: 45 }, { wch: 12 }, { wch: 18 },
      { wch: 12 }, { wch: 8 }, { wch: 8 }, { wch: 14 },
      { wch: 12 }, { wch: 18 }, { wch: 10 }, { wch: 12 }, { wch: 10 }
    ];
    XLSX.utils.book_append_sheet(wb, overviewWs, "Overview");

    // ==================== SHEET 2: Daily Attendance Log ====================
    const attendanceRows: any[] = [];
    
    // Sort dates chronologically
    const sortedDates = Object.keys(attendanceByDate).sort();
    
    sortedDates.forEach((dateKey) => {
      const dayRecord = attendanceByDate[dateKey];
      const date = parseISO(dateKey);
      if (!isValid(date)) return;
      
      const dayName = getDayNameFromDate(date);
      if (!dayName) return;
      
      const blocks = getBlocksForDay(dayName);
      blocks.forEach((block) => {
        // Skip if before course start date
        const courseStart = getCourseStartDate(block.course);
        if (dateKey < courseStart) return;
        
        const status = dayRecord[block.blockId];
        if (status) {
          attendanceRows.push({
            "Date": dateKey,
            "Day": dayName,
            "Course": block.course,
            "Course Title": courseTitles[block.course] || block.course,
            "Time": `${block.startTime} - ${block.endTime}:59`,
            "Duration (hrs)": block.duration,
            "Type": block.isLab ? "Lab" : "Theory",
            "Room": block.room,
            "Status": status.charAt(0).toUpperCase() + status.slice(1),
          });
        }
      });
    });

    const attendanceWs = XLSX.utils.json_to_sheet(
      attendanceRows.length > 0 ? attendanceRows : [{ Message: "No attendance marked yet" }]
    );
    attendanceWs['!cols'] = [
      { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 40 },
      { wch: 15 }, { wch: 14 }, { wch: 8 }, { wch: 8 }, { wch: 10 }
    ];
    XLSX.utils.book_append_sheet(wb, attendanceWs, "Daily Log");

    // ==================== SHEET 3: Date-wise Summary ====================
    const dateSummaryRows: any[] = [];
    
    sortedDates.forEach((dateKey) => {
      const dayRecord = attendanceByDate[dateKey];
      const date = parseISO(dateKey);
      if (!isValid(date)) return;
      
      const dayName = getDayNameFromDate(date);
      if (!dayName) return;
      
      let totalHours = 0;
      let presentHours = 0;
      let absentHours = 0;
      const coursesAttended: string[] = [];
      const coursesMissed: string[] = [];
      
      const blocks = getBlocksForDay(dayName);
      blocks.forEach((block) => {
        const courseStart = getCourseStartDate(block.course);
        if (dateKey < courseStart) return;
        
        const status = dayRecord[block.blockId];
        if (status) {
          totalHours += block.duration;
          if (status === "present") {
            presentHours += block.duration;
            if (!coursesAttended.includes(block.course)) coursesAttended.push(block.course);
          } else {
            absentHours += block.duration;
            if (!coursesMissed.includes(block.course)) coursesMissed.push(block.course);
          }
        }
      });
      
      if (totalHours > 0) {
        dateSummaryRows.push({
          "Date": dateKey,
          "Day": dayName,
          "Total Hours": totalHours,
          "Present": presentHours,
          "Absent": absentHours,
          "Day %": `${((presentHours / totalHours) * 100).toFixed(2)}%`,
          "Courses Attended": coursesAttended.join(", ") || "-",
          "Courses Missed": coursesMissed.join(", ") || "-",
        });
      }
    });

    const dateSummaryWs = XLSX.utils.json_to_sheet(
      dateSummaryRows.length > 0 ? dateSummaryRows : [{ Message: "No data" }]
    );
    dateSummaryWs['!cols'] = [
      { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 10 },
      { wch: 10 }, { wch: 10 }, { wch: 35 }, { wch: 35 }
    ];
    XLSX.utils.book_append_sheet(wb, dateSummaryWs, "Date Summary");

    // ==================== SHEET 4: Import Data (for backup/restore) ====================
    const rawRows = Object.entries(attendanceByDate).flatMap(([dateKey, dayRecord]) =>
      Object.entries(dayRecord).map(([blockId, status]) => ({
        Date: dateKey,
        BlockId: blockId,
        Status: status,
      }))
    );
    const rawWs = XLSX.utils.json_to_sheet(rawRows.length > 0 ? rawRows : [{ Message: "No data" }]);
    rawWs['!cols'] = [{ wch: 12 }, { wch: 20 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, rawWs, "Import Data");

    // ==================== SHEET 5: Export Info ====================
    const infoRows = [
      { "Field": "Export Date", "Value": exportDate },
      { "Field": "Semester Start", "Value": "2026-01-05" },
      { "Field": "Semester End", "Value": "2026-05-04" },
      { "Field": "Total Courses", "Value": getAllCourses().length },
      { "Field": "Days with Attendance", "Value": Object.keys(attendanceByDate).length },
      { "Field": "", "Value": "" },
      { "Field": "HOW TO IMPORT", "Value": "Use the 'Import Data' sheet to restore attendance" },
      { "Field": "Required Columns", "Value": "Date, BlockId, Status" },
      { "Field": "Date Format", "Value": "YYYY-MM-DD (e.g., 2026-02-05)" },
      { "Field": "Status Values", "Value": "present or absent" },
    ];
    const infoWs = XLSX.utils.json_to_sheet(infoRows);
    infoWs['!cols'] = [{ wch: 20 }, { wch: 50 }];
    XLSX.utils.book_append_sheet(wb, infoWs, "Info");

    // Save file
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    saveAs(blob, `Unibuddy_Attendance_${format(new Date(), "yyyy-MM-dd")}.xlsx`);
  }, [attendanceByDate, getSubjectStats]);

  // Import attendance from Excel
  const importFromExcel = useCallback((file: File): Promise<{ success: boolean; message: string }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          
          // Try sheets in order of preference: Import Data > RawData > first sheet
          let sheetName = "Import Data";
          if (!workbook.SheetNames.includes(sheetName)) {
            sheetName = workbook.SheetNames.includes("RawData") ? "RawData" : workbook.SheetNames[0];
          }
          
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet);
          
          if (jsonData.length === 0) {
            resolve({ success: false, message: "No data found in Excel file" });
            return;
          }
          
          const newAttendance: AttendanceByDate = {};
          
          jsonData.forEach((row: any) => {
            // Support both raw format and attendance format
            const dateKey = row.Date || row.date;
            const blockId = row.BlockId || row["Block ID"] || row.blockId;
            let status = row.Status || row.status;
            
            if (dateKey && blockId && status) {
              status = status.toLowerCase();
              if (status === "present" || status === "absent") {
                if (!newAttendance[dateKey]) {
                  newAttendance[dateKey] = {};
                }
                newAttendance[dateKey][blockId] = status;
              }
            }
          });
          
          const recordCount = Object.keys(newAttendance).length;
          if (recordCount === 0) {
            resolve({ success: false, message: "No valid attendance records found" });
            return;
          }
          
          // Merge with existing data
          setAttendanceByDate((prev) => {
            const merged = { ...prev };
            Object.entries(newAttendance).forEach(([dateKey, dayRecord]) => {
              merged[dateKey] = { ...merged[dateKey], ...dayRecord };
            });
            return merged;
          });
          
          resolve({ success: true, message: `Imported ${recordCount} days of attendance data` });
        } catch (error) {
          console.error("Import error:", error);
          resolve({ success: false, message: "Failed to parse Excel file" });
        }
      };
      
      reader.onerror = () => {
        resolve({ success: false, message: "Failed to read file" });
      };
      
      reader.readAsArrayBuffer(file);
    });
  }, []);

  // Get detailed stats for a specific course (for bunk estimation modal)
  const getDetailedCourseStats = useCallback((course: string): DetailedCourseStats | null => {
    const meta = courseMetadata[course];
    if (!meta) return null;

    // Get course start date (for late registrations)
    const courseStart = getCourseStartDate(course);

    // Calculate current attendance for this course
    let attended = 0;
    let missed = 0;

    Object.entries(attendanceByDate).forEach(([dateKey, dayRecord]) => {
      // Skip dates before course start date
      if (dateKey < courseStart) return;

      const date = parseISO(dateKey);
      if (!isValid(date)) return;

      const dayName = getDayNameFromDate(date);
      if (!dayName) return;

      const blocks = getBlocksForDay(dayName);
      blocks.forEach((block) => {
        if (block.course === course) {
          const status = dayRecord[block.blockId];
          if (status === "present") {
            attended += block.duration;
          } else if (status === "absent") {
            missed += block.duration;
          }
        }
      });
    });

    const classesHeld = attended + missed;
    const remainingClasses = meta.totalClasses - classesHeld;
    const currentPercentage = classesHeld > 0 ? (attended / classesHeld) * 100 : 0;

    // Required for 75% of total semester classes
    const requiredFor75 = Math.ceil(meta.totalClasses * 0.75);
    
    // SIMPLE BUNK CALCULATION:
    // Max bunks allowed for semester = Total - Required for 75%
    const maxBunksAllowed = meta.totalClasses - requiredFor75;
    
    // Remaining bunks = Max bunks - Already missed
    const canBunkWithoutOd = Math.max(0, maxBunksAllowed - missed);
    
    // How many more must attend to reach 75%
    const mustAttendFor75 = Math.max(0, requiredFor75 - attended);

    // With OD calculations
    // If using max OD, need only 60% of (totalClasses - odAllowed) = minRequired
    // So max bunks with OD = totalClasses - minRequired
    const maxBunksWithOd = meta.totalClasses - meta.minRequired;
    const canBunkWithOd = Math.max(0, maxBunksWithOd - missed);
    
    // Effective attendance if OD is maxed out
    const effectiveAttendance = classesHeld > 0 
      ? ((attended + Math.min(missed, meta.odAllowed)) / classesHeld) * 100 
      : 0;

    // Projections
    const projectedFinalPercentage = meta.totalClasses > 0 
      ? ((attended + remainingClasses) / meta.totalClasses) * 100 
      : 0;
    const projectedWorstPercentage = meta.totalClasses > 0 
      ? (attended / meta.totalClasses) * 100 
      : 0;

    // Safety margin: how many hours above the 75% threshold
    const safetyMargin = attended - Math.ceil(classesHeld * 0.75);

    // Determine status
    let status: "safe" | "warning" | "danger" | "critical";
    if (currentPercentage >= 85) {
      status = "safe";
    } else if (currentPercentage >= 75) {
      status = "warning";
    } else if (currentPercentage >= 65) {
      status = "danger";
    } else {
      status = "critical";
    }

    // If no data yet, neutral
    if (classesHeld === 0) {
      status = "safe";
    }

    return {
      course,
      courseTitle: courseTitles[course] || course,
      rooms: meta.rooms,
      semesterTotal: meta.totalClasses,
      odAllowed: meta.odAllowed,
      classesAfterOd: meta.classesAfterOd,
      minRequiredFor75: requiredFor75,
      minRequired: meta.minRequired,
      classesHeld,
      attended,
      missed,
      currentPercentage,
      canBunkWithoutOd,
      mustAttendFor75,
      canBunkWithOd,
      effectiveAttendance,
      remainingClasses,
      projectedFinalPercentage,
      projectedWorstPercentage,
      safetyMargin,
      status,
    };
  }, [attendanceByDate]);

  // Get all courses with their metadata
  const getAllDetailedStats = useCallback((): DetailedCourseStats[] => {
    return getAllCourses()
      .map((course) => getDetailedCourseStats(course))
      .filter((stats): stats is DetailedCourseStats => stats !== null);
  }, [getDetailedCourseStats]);

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
    exportToExcel,
    importFromExcel,
    getDetailedCourseStats,
    getAllDetailedStats,
  };
};