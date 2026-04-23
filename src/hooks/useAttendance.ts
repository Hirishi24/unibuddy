import { useState, useEffect, useCallback } from "react";
import { getAllCourses, DayName, getBlocksForDay, ClassBlock, courseTitles, courseMetadata, CourseMetadata } from "@/data/timetable";
import { format, parseISO, isValid } from "date-fns";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { getStoredSession, getStoredData, setStoredData, getStoredProfile, setStoredProfile } from "@/lib/storage";

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
  odMlAllowed: number;
  classesAfterOdMl: number;
  minRequiredFor75: number;
  minRequired: number; // 60% of classesAfterOdMl (with max OD/ML)
  // Current progress
  classesHeld: number; // classes that have occurred
  attended: number;
  missed: number;
  currentPercentage: number;
  // Bunk calculations (without OD/ML)
  canBunkWithoutOdMl: number;
  mustAttendFor75: number;
  // With OD/ML calculations
  canBunkWithOdMl: number;
  effectiveAttendance: number; // if max OD/ML is used
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
  const [profile, setProfile] = useState<Profile | null>(() => getStoredProfile());

  const [dataSource, setDataSource] = useState<"Live Portal" | "Local Cache" | "Local Storage">("Local Storage");

  // Fetch from backend or portal on mount
  useEffect(() => {
    const session = getStoredSession();
    const cachedData = getStoredData();

    if (session) {
      setIsLoading(true);
      fetch("http://localhost:3001/api/scrape/fetch", {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${session.accessToken}`,
          "Content-Type": "application/json"
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.attendance) {
          // Use data from portal
          setDataSource("Live Portal");
          if (data.profile) {
            setProfile(data.profile);
            setStoredProfile(data.profile);
          }
          // Optionally merge with local attendance if needed, but here we prioritize portal
          console.log("Hydrated with live portal data", data);
          setStoredData(data);
        } else if (cachedData) {
          setDataSource("Local Cache");
          if (cachedData.profile) setProfile(cachedData.profile);
          console.log("Using cached portal data");
        }
      })
      .catch(err => {
        console.error("Portal fetch failed, falling back to cache", err);
        if (cachedData) {
          setDataSource("Local Cache");
        }
      })
      .finally(() => setIsLoading(false));
    } else if (USE_BACKEND) {
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
    
    // Automation: If portal data exists, override with live stats
    const portalData = getStoredData();
    if (portalData && portalData.attendance && portalData.attendance.length > 0) {
      return portalData.attendance.map((a: any) => {
        const percentage = a.percentage;
        let canBunk = 0;
        let mustAttend = 0;
        let status: "safe" | "danger" | "neutral" = "neutral";

        if (percentage >= 75) {
          status = "safe";
          canBunk = Math.floor(a.attendedHours / 0.75 - a.totalHours);
          canBunk = Math.max(0, canBunk);
        } else {
          status = "danger";
          mustAttend = Math.ceil(3 * a.totalHours - 4 * a.attendedHours);
          mustAttend = Math.max(0, mustAttend);
        }

        return {
          course: a.courseCode,
          courseTitle: a.courseTitle,
          totalBlocks: a.totalHours,
          attended: a.attendedHours,
          percentage,
          canBunk,
          mustAttend,
          status,
        };
      });
    }

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
        message: "Start marking attendance to see estimation status",
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
          ? `${minBunkCourse.course}: You can skip ${minBunkCourse.canBunk} class${minBunkCourse.canBunk > 1 ? "es" : ""}`
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

  // Export attendance to Excel
  const exportToExcel = useCallback(() => {
    const rows: any[] = [];
    
    // Create rows for each attendance record
    Object.entries(attendanceByDate).forEach(([dateKey, dayRecord]) => {
      const date = parseISO(dateKey);
      if (!isValid(date)) return;
      
      const dayName = getDayNameFromDate(date);
      if (!dayName) return;
      
      const blocks = getBlocksForDay(dayName);
      blocks.forEach((block) => {
        const status = dayRecord[block.blockId];
        if (status) {
          rows.push({
            Date: dateKey,
            Day: dayName,
            "Block ID": block.blockId,
            "Course Code": block.course,
            "Course Title": courseTitles[block.course] || block.course,
            Time: block.time,
            Duration: block.duration,
            Room: block.room,
            Status: status.charAt(0).toUpperCase() + status.slice(1),
          });
        }
      });
    });

    // Sort by date
    rows.sort((a, b) => a.Date.localeCompare(b.Date));

    // Create summary sheet
    const stats = getSubjectStats();
    const summaryRows = stats.map((s) => ({
      "Course Code": s.course,
      "Course Title": courseTitles[s.course] || s.course,
      "Total Hours": s.totalBlocks,
      "Attended Hours": s.attended,
      "Percentage": `${s.percentage.toFixed(1)}%`,
      "Can Bunk": s.canBunk,
      "Must Attend": s.mustAttend,
      "Status": s.status.toUpperCase(),
    }));

    // Create workbook with multiple sheets
    const wb = XLSX.utils.book_new();
    
    // Attendance sheet
    const attendanceWs = XLSX.utils.json_to_sheet(rows.length > 0 ? rows : [{ Message: "No attendance data yet" }]);
    XLSX.utils.book_append_sheet(wb, attendanceWs, "Attendance");
    
    // Summary sheet
    const summaryWs = XLSX.utils.json_to_sheet(summaryRows.length > 0 ? summaryRows : [{ Message: "No data" }]);
    XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

    // Raw data sheet (for import)
    const rawRows = Object.entries(attendanceByDate).flatMap(([dateKey, dayRecord]) =>
      Object.entries(dayRecord).map(([blockId, status]) => ({
        Date: dateKey,
        BlockId: blockId,
        Status: status,
      }))
    );
    const rawWs = XLSX.utils.json_to_sheet(rawRows.length > 0 ? rawRows : [{ Message: "No data" }]);
    XLSX.utils.book_append_sheet(wb, rawWs, "RawData");

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
          
          // Try to find RawData sheet first (preferred), otherwise use Attendance sheet
          let sheetName = workbook.SheetNames.includes("RawData") ? "RawData" : workbook.SheetNames[0];
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
    const portalData = getStoredData();
    let attended = 0;
    let missed = 0;
    let totalClasses = 0;
    let rooms: string[] = [];

    // AUTOMATION: Try to get data from Portal first
    const portalCourse = portalData?.attendance?.find((a: any) => a.courseCode === course);
    
    if (portalCourse) {
      attended = portalCourse.attendedHours;
      totalClasses = portalCourse.totalHours;
      missed = totalClasses - attended;
      rooms = courseMetadata[course]?.rooms || ["TBA"];
    } else {
      // Fallback to manual calculation
      const meta = courseMetadata[course];
      if (!meta) return null;
      rooms = meta.rooms;
      totalClasses = meta.totalClasses;

      Object.entries(attendanceByDate).forEach(([dateKey, dayRecord]) => {
        const date = parseISO(dateKey);
        if (!isValid(date)) return;
        const dayName = getDayNameFromDate(date);
        if (!dayName) return;
        getBlocksForDay(dayName).forEach((block) => {
          if (block.course === course) {
            const status = dayRecord[block.blockId];
            if (status === "present") attended += block.duration;
            else if (status === "absent") missed += block.duration;
          }
        });
      });
    }

    const classesHeld = attended + missed;
    const meta = courseMetadata[course] || { 
      totalClasses: totalClasses || 45, 
      odMlAllowed: Math.ceil((totalClasses || 45) * 0.15), 
      minRequired: Math.ceil((totalClasses || 45) * 0.6) 
    };
    
    const semesterTotal = meta.totalClasses || totalClasses;
    const remainingClasses = Math.max(0, semesterTotal - classesHeld);
    const currentPercentage = classesHeld > 0 ? (attended / classesHeld) * 100 : 0;

    // Analytics calculations
    const requiredFor75 = Math.ceil(semesterTotal * 0.75);
    const maxBunksAllowed = semesterTotal - requiredFor75;
    const canBunkWithoutOdMl = Math.max(0, maxBunksAllowed - missed);
    const mustAttendFor75 = Math.max(0, requiredFor75 - attended);
    
    const maxBunksWithOdMl = semesterTotal - meta.minRequired;
    const canBunkWithOdMl = Math.max(0, maxBunksWithOdMl - missed);
    
    const projectedFinalPercentage = semesterTotal > 0 
      ? ((attended + remainingClasses) / semesterTotal) * 100 
      : 0;
    const safetyMargin = attended - Math.ceil(classesHeld * 0.75);

    let status: "safe" | "warning" | "danger" | "critical";
    if (currentPercentage >= 85) status = "safe";
    else if (currentPercentage >= 75) status = "warning";
    else if (currentPercentage >= 65) status = "danger";
    else status = "critical";

    return {
      course,
      courseTitle: portalCourse?.courseTitle || courseTitles[course] || course,
      rooms,
      semesterTotal,
      odMlAllowed: meta.odMlAllowed,
      classesAfterOdMl: semesterTotal - meta.odMlAllowed,
      minRequiredFor75: requiredFor75,
      minRequired: meta.minRequired,
      classesHeld,
      attended,
      missed,
      currentPercentage,
      canBunkWithoutOdMl,
      mustAttendFor75,
      canBunkWithOdMl,
      effectiveAttendance: classesHeld > 0 ? ((attended + Math.min(missed, meta.odMlAllowed)) / classesHeld) * 100 : 0,
      remainingClasses,
      projectedFinalPercentage,
      projectedWorstPercentage: semesterTotal > 0 ? (attended / semesterTotal) * 100 : 0,
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
    profile,
    isLoading
  };
};