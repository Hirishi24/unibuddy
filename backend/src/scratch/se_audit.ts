
import { parseISO, isAfter, addDays, format } from "date-fns";

const SEMESTER_END = "2026-05-04";

// Swaps from academicCalendar.ts
const swaps = {
  "2026-04-27": "Friday"
};

// SE Schedule based on the portal data
const schedule = {
  "Monday": 2,
  "Tuesday": 1,
  "Wednesday": 0,
  "Thursday": 0,
  "Friday": 2
};

function runAudit(courseCode: string, currentPortalCount: number) {
  const today = new Date("2026-04-26"); // Today is Sunday
  const end = parseISO(SEMESTER_END);
  let date = addDays(today, 1); // Start counting from tomorrow
  let futureTotal = 0;
  const audit = [];

  while (!isAfter(date, end)) {
    const dateStr = format(date, "yyyy-MM-dd");
    let dayName = format(date, "EEEE");
    let note = "Normal Day";

    // Apply Swap
    if (swaps[dateStr]) {
      note = `SWAP: Following ${swaps[dateStr]} Timetable`;
      dayName = swaps[dateStr];
    }

    const hours = schedule[dayName] || 0;
    if (hours > 0) {
      futureTotal += hours;
      audit.push({
        Date: dateStr,
        Schedule: dayName,
        Hours: hours,
        Event: note,
        Running_Total: currentPortalCount + futureTotal
      });
    }
    date = addDays(date, 1);
  }

  console.log(`\n--- ORACLE AUDIT: ${courseCode} ---`);
  console.log(`Current Portal Count: ${currentPortalCount}`);
  console.log(`Future Predicted Classes: ${futureTotal}`);
  console.log(`FINAL PROJECTED SEMESTER TOTAL: ${currentPortalCount + futureTotal}`);
  console.table(audit);
}

runAudit("CSE 306", 61);
