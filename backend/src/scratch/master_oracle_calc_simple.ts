
import { parseISO, isAfter, addDays, format } from "date-fns";
import { holidays, calendarOverrides, SEMESTER_START, SEMESTER_END, getEffectiveDay, isBlockCancelled } from "../data/globalAcademicCalendar";

// Define the standard weekly schedule for the user
const schedule = {
  "Monday": [
    { course: "LBA 253", hours: 1 },
    { course: "CSE 455", hours: 2 }, // Lab
    { course: "CSE 456", hours: 1 },
    { course: "CSE 306", hours: 2 },
    { course: "CSE 423", hours: 1 }
  ],
  "Tuesday": [
    { course: "LBA 253", hours: 1 },
    { course: "CSE 304", hours: 2 },
    { course: "CSE 455", hours: 1 },
    { course: "CSE 306", hours: 1 },
    { course: "CSE 423", hours: 1 }
  ],
  "Wednesday": [
    { course: "LBA 253", hours: 1 },
    { course: "CSE 304", hours: 1 },
    { course: "CSE 455", hours: 2 }
  ],
  "Thursday": [
    { course: "SEC 176", hours: 3 },
    { course: "CSE 456", hours: 2 } // Lab
  ],
  "Friday": [
    { course: "CSE 306", hours: 2 }, // Lab
    { course: "CSE 456", hours: 2 }
  ]
};

function calculateAll() {
  const results = {};
  
  const start = parseISO(SEMESTER_START);
  const end = parseISO(SEMESTER_END);
  let date = start;

  while (!isAfter(date, end)) {
    const effectiveDay = getEffectiveDay(date);
    
    if (effectiveDay && schedule[effectiveDay]) {
      schedule[effectiveDay].forEach(entry => {
        const slots = entry.hours;
        
        for (let i = 0; i < slots; i++) {
           // Basic slot check
           results[entry.course] = (results[entry.course] || 0) + 1;
        }
      });
    }
    date = addDays(date, 1);
  }

  // Deduct for cancellations manually in this simplified script for precision
  calendarOverrides.forEach(o => {
    if (o.type === "cancelled") {
      const dateObj = parseISO(o.date);
      const dayName = format(dateObj, "EEEE");
      if (schedule[dayName]) {
        schedule[dayName].forEach(entry => {
           results[entry.course] -= entry.hours;
        });
      }
    }
  });

  console.log("\n--- OFFICIAL ORACLE SEMESTER TOTALS (ALL SUBJECTS) ---");
  const sorted = Object.entries(results).sort((a,b) => b[1] - a[1]);
  console.table(sorted.map(([code, total]) => ({
    "Subject Code": code,
    "Total Slots": total
  })));
}

calculateAll();
