
import { parseISO, isAfter, addDays, format } from "date-fns";
import { holidays, calendarOverrides, SEMESTER_START, SEMESTER_END, getEffectiveDay, isBlockCancelled } from "../data/globalAcademicCalendar";
import { timetable, getAllCourses } from "../data/timetable";

function calculateAll() {
  const allCourses = getAllCourses();
  const results = {};
  
  allCourses.forEach(course => results[course] = 0);

  const start = parseISO(SEMESTER_START);
  const end = parseISO(SEMESTER_END);
  let date = start;

  while (!isAfter(date, end)) {
    const effectiveDay = getEffectiveDay(date);
    
    if (effectiveDay) {
      const daySlots = timetable[effectiveDay] || [];
      
      daySlots.forEach((slot, index) => {
        const startTime = slot.time;
        // Mocking endTime as 1 hour later
        const hour = parseInt(startTime.split(":")[0]);
        const endTime = `${(hour + 1).toString().padStart(2, "0")}:00`;
        
        if (!isBlockCancelled(date, startTime, endTime, slot.isLab)) {
          results[slot.course] = (results[slot.course] || 0) + 1;
        }
      });
    }
    date = addDays(date, 1);
  }

  console.log("\n--- OFFICIAL ORACLE SEMESTER TOTALS (ALL SUBJECTS) ---");
  console.table(Object.entries(results).map(([code, total]) => ({
    "Subject Code": code,
    "Total Slots": total
  })));
}

calculateAll();
