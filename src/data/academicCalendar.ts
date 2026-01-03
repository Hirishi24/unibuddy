// Academic Calendar for Even Semester 2025-26
// Semester: January 5, 2026 - May 4, 2026

export interface Holiday {
  date: string; // format: YYYY-MM-DD
  name: string;
  day: string;
}

export const SEMESTER_START = "2026-01-05";
export const SEMESTER_END = "2026-05-04";

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
  | { type: "before_semester" }
  | { type: "after_semester" }
  | { type: "has_classes" };

export const getNoClassReason = (date: Date): NoClassReason => {
  const dateStr = date.toISOString().split("T")[0];
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
    case "before_semester":
      return "Date is before semester start (Jan 5)";
    case "after_semester":
      return "Date is after semester end (May 4)";
    case "has_classes":
      return null;
  }
};
