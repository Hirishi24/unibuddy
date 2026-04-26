import { parseISO, addDays, isAfter, format } from "date-fns";
import { getEffectiveDay, isBlockCancelled, SEMESTER_START, SEMESTER_END } from "../src/data/globalAcademicCalendar";
import fs from "fs";

const timetable = JSON.parse(fs.readFileSync("./storage/sections/P.json", "utf-8"));

const start = parseISO(SEMESTER_START);
const end = parseISO(SEMESTER_END);

const totals: Record<string, number> = {};

const normalize = (c: string) => {
  if (!c) return "";
  return c.split("(")[0].trim().toUpperCase();
};

let date = start;
while (!isAfter(date, end)) {
  const effectiveDay = getEffectiveDay(date);
  
  if (effectiveDay) {
    const dayMatch = effectiveDay.toLowerCase().substring(0, 3);
    const dayDataRows = timetable.filter((d: any) => d.day.toLowerCase().startsWith(dayMatch));

    dayDataRows.forEach((dayData: any) => {
      dayData.subjects.forEach((subjectObj: any, slotIndex: number) => {
        const courseCode = typeof subjectObj === 'string' ? subjectObj.trim() : subjectObj?.code?.trim();
        const norm = normalize(courseCode);
        
        if (norm && norm !== "-" && norm.length > 2 && !norm.includes("L-T-P") && !norm.includes("FACULTY")) {
          const isLab = norm.toLowerCase().includes("(l)") || norm.toLowerCase().includes("lab");
          const actualSlotIndex = (dayData.startTimeOffset || 0) + slotIndex;
          const startTime = `${(9 + actualSlotIndex).toString().padStart(2, "0")}:00`;
          const endTime = `${(10 + actualSlotIndex).toString().padStart(2, "0")}:00`;

          if (!isBlockCancelled(date, startTime, endTime, isLab)) {
            totals[norm] = (totals[norm] || 0) + 1;
          }
        }
      });
    });
  }
  date = addDays(date, 1);
}

console.log("\n>>> OFFICIAL ORACLE TOTALS (SECTION P) <<<");
Object.entries(totals).sort().forEach(([code, total]) => {
  console.log(`${code}: ${total}`);
});
