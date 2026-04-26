
import { parseISO, isAfter, addDays, format, startOfWeek } from "date-fns";

const SEMESTER_START = "2026-01-05";
const SEMESTER_END = "2026-05-04";

const holidays = [
  "2026-01-13", "2026-01-14", "2026-01-15", "2026-01-16",
  "2026-01-26", "2026-03-03", "2026-03-19", "2026-03-20",
  "2026-03-27", "2026-04-03", "2026-04-14",
  "2026-03-09", "2026-03-10", "2026-03-11", "2026-03-12", "2026-03-13"
];

const swaps = {
  "2026-04-22": "Friday",
  "2026-04-27": "Friday"
};

const schedule = {
  "Tuesday": 2,
  "Wednesday": 1
};

function generateWeeklyList(courseCode: string) {
  const start = parseISO(SEMESTER_START);
  const end = parseISO(SEMESTER_END);
  let date = start;
  const weeks = {};

  while (!isAfter(date, end)) {
    const dateStr = format(date, "yyyy-MM-dd");
    const weekStart = format(startOfWeek(date, { weekStartsOn: 1 }), "yyyy-MM-dd");
    let dayName = format(date, "EEEE");

    if (!weeks[weekStart]) weeks[weekStart] = 0;

    if (holidays.includes(dateStr)) {
      // Holiday - 0 classes
    } else {
      if (swaps[dateStr]) {
        dayName = swaps[dateStr];
      }
      const hours = schedule[dayName] || 0;
      weeks[weekStart] += hours;
    }
    date = addDays(date, 1);
  }

  console.log(`WEEKLY BREAKDOWN FOR ${courseCode}`);
  const tableData = Object.entries(weeks).map(([week, count], index) => ({
    "Week #": index + 1,
    "Week Starting": week,
    "Classes": count
  }));
  console.table(tableData);
}

generateWeeklyList("CSE 304");
