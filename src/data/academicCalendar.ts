// Academic Calendar for Even Semester 2025-26
// Semester: January 5, 2026 - May 4, 2026

export interface Holiday {
  date: string; // format: YYYY-MM-DD
  name: string;
  day: string;
}

export interface ExamPeriod {
  startDate: string; // format: YYYY-MM-DD
  endDate: string; // format: YYYY-MM-DD
  name: string;
}

// Course-specific start dates (for late registrations)
export interface CourseStartDate {
  course: string;
  startDate: string; // format: YYYY-MM-DD
}

export const SEMESTER_START = "2026-01-05";
export const SEMESTER_END = "2026-05-04";

// Courses with late registration (different start date than semester start)
export const courseStartDates: CourseStartDate[] = [
  { course: "FLC 120", startDate: "2026-01-30" }, // Registered on Jan 30, 2026
];

// Get the start date for a specific course (defaults to SEMESTER_START)
export const getCourseStartDate = (course: string): string => {
  const customStart = courseStartDates.find((c) => c.course === course);
  return customStart ? customStart.startDate : SEMESTER_START;
};

// Exam periods when classes are cancelled
export const examPeriods: ExamPeriod[] = [
  {
    startDate: "2026-03-09",
    endDate: "2026-03-13",
    name: "Mid-Term Examinations/Assessments",
  },
];

export const holidays: Holiday[] = [
  { date: "2026-01-14", name: "Bhogi", day: "Wednesday" },
  { date: "2026-01-15", name: "Makara Sankranthi", day: "Thursday" },
  { date: "2026-01-16", name: "Kanuma", day: "Friday" },
  { date: "2026-01-26", name: "Republic Day", day: "Monday" },
  { date: "2026-03-03", name: "Holi", day: "Tuesday" },
  { date: "2026-03-19", name: "Ugadi", day: "Thursday" },
  { date: "2026-03-20", name: "Ramzan (EID-UL-FITR)", day: "Friday" },
  { date: "2026-03-27", name: "Sri Rama Navami", day: "Friday" },
  { date: "2026-04-03", name: "Good Friday", day: "Friday" },
  { date: "2026-04-14", name: "Dr. B.R Ambedkar's Birthday", day: "Tuesday" },
];

// Check if a date is within the semester
export const isWithinSemester = (dateStr: string): boolean => {
  return dateStr >= SEMESTER_START && dateStr <= SEMESTER_END;
};

// Get holiday info for a specific date
export const getHolidayInfo = (dateStr: string): Holiday | null => {
  return holidays.find((h) => h.date === dateStr) || null;
};

// Get the reason why there's no class on a given date
export type NoClassReason = 
  | { type: "holiday"; name: string }
  | { type: "weekend"; day: "Saturday" | "Sunday" }
  | { type: "exam_period"; name: string }
  | { type: "before_semester" }
  | { type: "after_semester" }
  | { type: "has_classes" };

// Check if a date falls within an exam period
export const getExamPeriodInfo = (dateStr: string): ExamPeriod | null => {
  return examPeriods.find((e) => dateStr >= e.startDate && dateStr <= e.endDate) || null;
};

// Helper to format date as YYYY-MM-DD using local timezone
const formatDateLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getNoClassReason = (date: Date): NoClassReason => {
  const dateStr = formatDateLocal(date);
  const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

  // Check if outside semester
  if (dateStr < SEMESTER_START) {
    return { type: "before_semester" };
  }
  if (dateStr > SEMESTER_END) {
    return { type: "after_semester" };
  }

  // Check if it's a holiday
  const holiday = getHolidayInfo(dateStr);
  if (holiday) {
    return { type: "holiday", name: holiday.name };
  }

  // Check if weekend
  if (dayOfWeek === 0) {
    return { type: "weekend", day: "Sunday" };
  }
  if (dayOfWeek === 6) {
    return { type: "weekend", day: "Saturday" };
  }

  // Check if it's during an exam period
  const examPeriod = getExamPeriodInfo(dateStr);
  if (examPeriod) {
    return { type: "exam_period", name: examPeriod.name };
  }

  // Has classes
  return { type: "has_classes" };
};

// Format the no-class message for display
export const getNoClassMessage = (date: Date): string | null => {
  const reason = getNoClassReason(date);

  switch (reason.type) {
    case "holiday":
      return `Holiday: ${reason.name}`;
    case "weekend":
      return `${reason.day} - No classes`;
    case "exam_period":
      return `${reason.name} - Classes Cancelled`;
    case "before_semester":
      return "Date is before semester start (Jan 5)";
    case "after_semester":
      return "Date is after semester end (May 4)";
    case "has_classes":
      return null;
  }
};
