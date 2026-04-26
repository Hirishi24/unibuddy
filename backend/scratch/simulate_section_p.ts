import { parseISO, addDays, isAfter, format } from "date-fns";
import { getEffectiveDay, isBlockCancelled, SEMESTER_START, SEMESTER_END } from "../src/data/globalAcademicCalendar";

import fs from "fs";

const timetable = JSON.parse(fs.readFileSync("./storage/sections/P.json", "utf-8"));

const start = parseISO(SEMESTER_START);
const end = parseISO(SEMESTER_END);
let date = start;
let total = 0;

const normalize = (c: string) => (c || "").split("(")[0].trim().toUpperCase();

console.log(`Simulating Section P for CSE 304...`);

while (!isAfter(date, end)) {
  const effectiveDay = getEffectiveDay(date);
  
  if (effectiveDay) {
    const dayMatch = effectiveDay.toLowerCase().substring(0, 3);
    const dayDataRows = timetable.filter((d: any) => d.day.toLowerCase().startsWith(dayMatch));

    dayDataRows.forEach((dayData: any) => {
      dayData.subjects.forEach((subjectObj: any, slotIndex: number) => {
        const courseCode = typeof subjectObj === 'string' ? subjectObj.trim() : subjectObj?.code?.trim();
        
        if (courseCode && normalize(courseCode) === "CSE 304") {
          const isLab = courseCode.toLowerCase().includes("(l)") || courseCode.toLowerCase().includes("lab");
          const actualSlotIndex = (dayData.startTimeOffset || 0) + slotIndex;
          const startTime = `${(9 + actualSlotIndex).toString().padStart(2, "0")}:00`;
          const endTime = `${(10 + actualSlotIndex).toString().padStart(2, "0")}:00`;

          if (!isBlockCancelled(date, startTime, endTime, isLab)) {
            total++;
          }
        }
      });
    });
  }
  date = addDays(date, 1);
}

console.log(`\n>>> FINAL ORACLE TOTAL FOR CSE 304 (SECTION P): ${total} <<<`);
