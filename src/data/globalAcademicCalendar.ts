
/**
 * GLOBAL ACADEMIC CALENDAR
 * Source: Official SRM AP Even Semester 2025-26 Working Day Grid
 */
import { parseISO, isAfter, format } from "date-fns";

export const GLOBAL_CALENDAR_NAME = "SRM AP Even Semester 2025-26";
export const SEMESTER_START = "2026-01-05";
export const SEMESTER_END = "2026-05-04"; 


export interface Holiday {
  date: string;
  name: string;
  day: string;
}

export const holidays: Holiday[] = [
  { date: "2026-01-14", name: "Bhogi", day: "Wednesday" },
  { date: "2026-01-15", name: "Makar Sankranti", day: "Thursday" },
  { date: "2026-01-16", name: "Kanuma", day: "Friday" },
  { date: "2026-01-26", name: "Republic Day", day: "Monday" },
  { date: "2026-03-03", name: "Holi", day: "Tuesday" },
  { date: "2026-03-19", name: "Ugadi", day: "Thursday" },
  { date: "2026-03-20", name: "Ramzan (EID-UL-FITR)", day: "Friday" },
  { date: "2026-03-27", name: "Sri Rama Navami", day: "Friday" },
  { date: "2026-04-03", name: "Good Friday", day: "Friday" },
  { date: "2026-04-14", name: "Dr. B.R Ambedkar's Birthday", day: "Tuesday" }
];

export interface CalendarOverride {
  date: string;
  type: "cancelled" | "day_swap";
  reason?: string;
  followsDay?: string; 
}

export const calendarOverrides: CalendarOverride[] = [
  // INFINITUS 2026
  { date: "2026-02-26", type: "cancelled", reason: "INFINITUS 2026" },
  { date: "2026-02-27", type: "cancelled", reason: "INFINITUS 2026" },
  
  // Mid-Term Examinations
  { date: "2026-03-09", type: "cancelled", reason: "Mid-Term Examinations" },
  { date: "2026-03-10", type: "cancelled", reason: "Mid-Term Examinations" },
  { date: "2026-03-11", type: "cancelled", reason: "Mid-Term Examinations" },
  { date: "2026-03-12", type: "cancelled", reason: "Mid-Term Examinations" },
  { date: "2026-03-13", type: "cancelled", reason: "Mid-Term Examinations" },

  // Research Day
  { date: "2026-04-20", type: "cancelled", reason: "Research Day Presentations" },

  // Day Swaps
  { date: "2026-04-22", type: "day_swap", followsDay: "Friday", reason: "Following Friday Timetable" },
  { date: "2026-04-27", type: "day_swap", followsDay: "Friday", reason: "Following Friday Timetable" }
];


const formatDateLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getEffectiveDay = (date: Date): string | null => {
  const dateStr = formatDateLocal(date);
  const dayOfWeek = date.getDay(); // 0 = Sun, 6 = Sat

  // Holidays
  if (holidays.some(h => h.date === dateStr)) return null;
  
  // Weekends
  if (dayOfWeek === 0 || dayOfWeek === 6) return null;

  // Swaps
  const override = calendarOverrides.find(o => o.date === dateStr);
  if (override && override.type === "day_swap" && override.followsDay) {
    return override.followsDay;
  }

  // Normal Day
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[dayOfWeek];
};

export const getSwapInfo = (date: Date): CalendarOverride | null => {
  const dateStr = formatDateLocal(date);
  return calendarOverrides.find(o => o.date === dateStr && o.type === "day_swap") || null;
};

export const getNoClassMessage = (date: Date): string | null => {
  const reason = getNoClassReason(date);
  if (reason.type === "holiday") return reason.name || "Holiday";
  if (reason.type === "weekend") return `${reason.day} (Weekend)`;
  if (reason.type === "cancelled") return reason.reason || "Classes Cancelled";
  return null;
};

export const getNoClassReason = (date: Date): { type: string; name?: string; day?: string; reason?: string } => {
  const dateStr = formatDateLocal(date);
  const dayOfWeek = date.getDay();

  const holiday = holidays.find(h => h.date === dateStr);
  if (holiday) return { type: "holiday", name: holiday.name };

  const override = calendarOverrides.find(o => o.date === dateStr && o.type === "cancelled");
  if (override) return { type: "cancelled", reason: override.reason };

  if (dayOfWeek === 0) return { type: "weekend", day: "Sunday" };
  if (dayOfWeek === 6) return { type: "weekend", day: "Saturday" };

  return { type: "has_classes" };
};

export const isBlockCancelled = (date: Date, startTime: string, endTime: string, isLab: boolean): string | null => {
  const dateStr = formatDateLocal(date);
  const override = calendarOverrides.find(o => o.date === dateStr && o.type === "cancelled");
  return override ? override.reason || "Classes Cancelled" : null;
};



