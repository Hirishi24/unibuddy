
import { ClassBlock, DayName, Timetable } from "@/shared/types";

export const days: DayName[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
export const courseTitles: Record<string, string> = {}; // Populated dynamically from portal data

// Helper to check if two times are consecutive (1 hour apart)
const areConsecutive = (time1: string, time2: string): boolean => {
  const hour1 = parseInt(time1.split(":")[0]);
  const hour2 = parseInt(time2.split(":")[0]);
  return hour2 - hour1 === 1;
};

// Group consecutive same-course classes into blocks from DYNAMIC data
export const getBlocksForDay = (day: DayName, timetable: Timetable): ClassBlock[] => {
  const slots = timetable[day] || [];
  if (slots.length === 0) return [];

  const blocks: ClassBlock[] = [];
  let currentBlock: ClassBlock | null = null;

  for (const slot of slots) {
    if (
      currentBlock &&
      currentBlock.course === slot.course &&
      areConsecutive(currentBlock.endTime, slot.time)
    ) {
      // Extend current block
      currentBlock.endTime = slot.time;
      currentBlock.duration++;
      currentBlock.slotIds.push(slot.id);
      if (slot.isLab) currentBlock.isLab = true;
    } else {
      if (currentBlock) blocks.push(currentBlock);
      currentBlock = {
        blockId: `block_${slot.id}`,
        course: slot.course,
        courseTitle: slot.course, // We can't know the title without the portal mapping
        room: slot.room,
        startTime: slot.time,
        endTime: slot.time,
        duration: 1,
        slotIds: [slot.id],
        isLab: slot.isLab || false,
        isOE: slot.isOE || false,
        faculty: "TBA", // Scraped from portal if available
      };
    }
  }

  if (currentBlock) blocks.push(currentBlock);
  return blocks;
};

export const getAllCoursesFromTimetable = (timetable: Timetable): string[] => {
  const courses = new Set<string>();
  Object.values(timetable).forEach((dayClasses) => {
    dayClasses.forEach((slot) => courses.add(slot.course));
  });
  return Array.from(courses).sort();
};
