
import { parseISO, isAfter, addDays, format } from "date-fns";

const SEMESTER_START = "2026-01-05";
const SEMESTER_END = "2026-05-04";

const holidays = [
  "2026-01-13", "2026-01-14", "2026-01-15", "2026-01-16",
  "2026-01-26", "2026-03-03", "2026-03-19", "2026-03-20",
  "2026-03-27", "2026-04-03", "2026-04-14"
];

const seSchedule = {
  "Monday": 2,
  "Tuesday": 1,
  "Friday": 2
};

function generateTimeline(courseCode: string) {
  const start = parseISO(SEMESTER_START);
  const end = parseISO(SEMESTER_END);
  let date = start;
  let total = 0;
  const timeline = [];

  while (!isAfter(date, end)) {
    const dateStr = format(date, "yyyy-MM-dd");
    const dayName = format(date, "EEEE");
    
    if (holidays.includes(dateStr)) {
      // Skip holiday
    } else if (seSchedule[dayName]) {
      const hours = seSchedule[dayName];
      total += hours;
      timeline.push({
        date: dateStr,
        day: dayName,
        hours: hours,
        cumulative: total
      });
    }
    date = addDays(date, 1);
  }

  console.log(`FULL ORACLE TIMELINE FOR ${courseCode}`);
  console.log(`Total Classes: ${total}`);
  console.table(timeline);
}

generateTimeline("CSE 306");
