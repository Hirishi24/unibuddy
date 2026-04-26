
import { parseISO, isAfter, addDays, format } from "date-fns";

const SEMESTER_START = "2026-01-05";
const SEMESTER_END = "2026-05-04";

const holidays = [
  { date: "2026-01-13", name: "Bhogi" },
  { date: "2026-01-14", name: "Sankranti" },
  { date: "2026-01-15", name: "Kanuma" },
  { date: "2026-01-16", name: "Kanuma (Extended)" },
  { date: "2026-01-26", name: "Republic Day" },
  { date: "2026-03-03", name: "Holi" },
  { date: "2026-03-19", name: "Ugadi" },
  { date: "2026-03-20", name: "Ramzan (EID-UL-FITR)" },
  { date: "2026-03-27", name: "Sri Rama Navami" },
  { date: "2026-04-03", name: "Good Friday" },
  { date: "2026-04-14", name: "Ambedkar's Birthday" }
];

const overrides = [
  { date: "2026-02-26", type: "cancelled", reason: "INFINITUS 2026" },
  { date: "2026-02-27", type: "cancelled", reason: "INFINITUS 2026" },
  { date: "2026-03-09", type: "cancelled", reason: "Mid-Term Exams" },
  { date: "2026-03-10", type: "cancelled", reason: "Mid-Term Exams" },
  { date: "2026-03-11", type: "cancelled", reason: "Mid-Term Exams" },
  { date: "2026-03-12", type: "cancelled", reason: "Mid-Term Exams" },
  { date: "2026-03-13", type: "cancelled", reason: "Mid-Term Exams" },
  { date: "2026-04-20", type: "cancelled", reason: "Research Day (Partial)" },
  { date: "2026-04-27", type: "day_swap", follows: "Friday" }
];

function printMasterCalendar() {
  console.log("--- MASTER ACADEMIC CALENDAR (JAN - MAY 2026) ---");
  
  const start = parseISO(SEMESTER_START);
  const end = parseISO(SEMESTER_END);
  let date = start;
  const list = [];

  while (!isAfter(date, end)) {
    const dateStr = format(date, "yyyy-MM-dd");
    const holiday = holidays.find(h => h.date === dateStr);
    const override = overrides.find(o => o.date === dateStr);
    const dayOfWeek = date.getDay(); // 0 = Sun, 6 = Sat

    if (holiday || override || dayOfWeek === 0 || dayOfWeek === 6) {
      list.push({
        Date: dateStr,
        Type: holiday ? "HOLIDAY" : override ? override.type.toUpperCase() : "WEEKEND",
        Description: holiday ? holiday.name : override ? (override.reason || `Swapped to ${override.follows}`) : format(date, "EEEE")
      });
    }
    date = addDays(date, 1);
  }

  console.table(list);
}

printMasterCalendar();
