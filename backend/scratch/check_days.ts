import { parseISO, addDays, isAfter, format } from "date-fns";
import { getEffectiveDay, SEMESTER_START, SEMESTER_END } from "../src/data/globalAcademicCalendar";


const start = parseISO(SEMESTER_START);
const end = parseISO(SEMESTER_END);
let date = start;
let count = 0;

console.log(`Semester: ${SEMESTER_START} to ${SEMESTER_END}`);

while (!isAfter(date, end)) {
  const effective = getEffectiveDay(date);
  if (effective) {
    count++;
    // console.log(`${format(date, "yyyy-MM-dd")} (${effective})`);
  }
  date = addDays(date, 1);
}

console.log(`Total Working Days Found: ${count}`);
