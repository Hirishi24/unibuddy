import { parseISO, isAfter, addDays, format } from "date-fns";

import { getEffectiveDay, isBlockCancelled, SEMESTER_START, SEMESTER_END } from "../data/globalAcademicCalendar";

export interface SubjectProjection {
  [courseCode: string]: number;
}

/**
 * Calculates the total number of classes for each subject for the entire semester.
 * Takes the student's personal timetable and current portal attendance as input.
 */
export function calculateSemesterTotals(personalTimetable: any[], portalAttendance: any[] = []): SubjectProjection {
  const totals: SubjectProjection = {};

  if (!personalTimetable || personalTimetable.length === 0) {
    return totals;
  }

  // Helper to normalize codes for fuzzy matching (removes suffixes like (L), (T))
  const normalize = (c: string) => (c || "").split("(")[0].trim().toUpperCase();

  const start = parseISO(SEMESTER_START);
  const end = parseISO(SEMESTER_END);
  let date = start;

  while (!isAfter(date, end)) {
    const effectiveDay = getEffectiveDay(date);
    
    // If effectiveDay is null, it's a holiday or weekend (0 classes)
    if (effectiveDay) {
      const dayMatch = effectiveDay.toLowerCase().substring(0, 3);
      
      // Filter for all slots belonging to the EFFECTIVE day
      const dayDataRows = personalTimetable.filter((d: any) => 
        d.day.toLowerCase().startsWith(dayMatch)
      );

      dayDataRows.forEach((dayData) => {
        if (dayData && dayData.subjects) {
          dayData.subjects.forEach((subjectObj: any, slotIndex: number) => {
            const courseCode = typeof subjectObj === 'string' ? subjectObj.trim() : subjectObj?.code?.trim();
            
            if (courseCode && courseCode !== "-") {
              const isLab = courseCode.toLowerCase().includes("(l)") || courseCode.toLowerCase().includes("lab");
              const actualSlotIndex = (dayData.startTimeOffset || 0) + slotIndex;
              const startTime = `${(9 + actualSlotIndex).toString().padStart(2, "0")}:00`;
              const endTime = `${(10 + actualSlotIndex).toString().padStart(2, "0")}:00`;

              
              // This handles both full-day and partial cancellations
              if (!isBlockCancelled(date, startTime, endTime, isLab)) {
                const normCode = normalize(courseCode);
                totals[normCode] = (totals[normCode] || 0) + 1;
              }
            }
          });
        }
      });
    }
    date = addDays(date, 1);
  }

  return totals;
}



