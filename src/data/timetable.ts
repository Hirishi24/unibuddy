export interface ClassSlot {
  id: string;
  time: string;
  course: string;
  room: string;
}

export type DayName = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";

export interface Timetable {
  [day: string]: ClassSlot[];
}

// A block is a group of consecutive same-course classes (treated as one attendance entry)
export interface ClassBlock {
  blockId: string;
  course: string;
  room: string;
  startTime: string;
  endTime: string;
  duration: number; // in hours
  slotIds: string[];
}

export const timetable: Timetable = {
  Monday: [
    { id: "mon1", time: "09:00", course: "LBA 253/S", room: "S607" },
    { id: "mon2", time: "10:00", course: "CSE 455", room: "S412" },
    { id: "mon3", time: "11:00", course: "CSE 455", room: "S412" },
    { id: "mon4", time: "13:00", course: "CSE 456", room: "C707" },
    { id: "mon5", time: "14:00", course: "CSE 306", room: "C707" },
    { id: "mon6", time: "15:00", course: "CSE 306", room: "C707" },
    { id: "mon7", time: "16:00", course: "CSE 423", room: "C702" },
  ],
  Tuesday: [
    { id: "tue1", time: "09:00", course: "LBA 253/S", room: "S607" },
    { id: "tue2", time: "10:00", course: "CSE 304", room: "C707" },
    { id: "tue3", time: "11:00", course: "CSE 304", room: "C707" },
    { id: "tue4", time: "12:00", course: "CSE 455", room: "C707" },
    { id: "tue5", time: "15:00", course: "CSE 306", room: "C1006" },
    { id: "tue6", time: "16:00", course: "CSE 423", room: "C702" },
  ],
  Wednesday: [
    { id: "wed1", time: "09:00", course: "LBA 253/S", room: "S607" },
    { id: "wed2", time: "13:00", course: "CSE 304", room: "C707" },
    { id: "wed3", time: "14:00", course: "CSE 455", room: "C707" },
    { id: "wed4", time: "15:00", course: "CSE 455", room: "C707" },
  ],
  Thursday: [
    { id: "thu1", time: "09:00", course: "CSE 423", room: "C705" },
    { id: "thu2", time: "10:00", course: "SEC 176", room: "C707" },
    { id: "thu3", time: "11:00", course: "SEC 176", room: "C707" },
    { id: "thu4", time: "12:00", course: "SEC 176", room: "C707" },
    { id: "thu5", time: "14:00", course: "CSE 456", room: "S613" },
    { id: "thu6", time: "15:00", course: "CSE 456", room: "S613" },
  ],
  Friday: [
    { id: "fri1", time: "09:00", course: "CSE 423", room: "C705" },
    { id: "fri2", time: "10:00", course: "CSE 423", room: "C705" },
    { id: "fri3", time: "11:00", course: "CSE 306", room: "C707" },
    { id: "fri4", time: "12:00", course: "CSE 306", room: "C707" },
    { id: "fri5", time: "14:00", course: "CSE 456", room: "C707" },
    { id: "fri6", time: "15:00", course: "CSE 456", room: "C707" },
  ],
};

export const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export const getCurrentDay = (): string => {
  const dayIndex = new Date().getDay();
  if (dayIndex === 0 || dayIndex === 6) {
    return "Monday";
  }
  return days[dayIndex - 1];
};

// Get all unique courses
export const getAllCourses = (): string[] => {
  const courses = new Set<string>();
  Object.values(timetable).forEach((dayClasses) => {
    dayClasses.forEach((slot) => courses.add(slot.course));
  });
  return Array.from(courses).sort();
};

// Helper to check if two times are consecutive (1 hour apart)
const areConsecutive = (time1: string, time2: string): boolean => {
  const hour1 = parseInt(time1.split(":")[0]);
  const hour2 = parseInt(time2.split(":")[0]);
  return hour2 - hour1 === 1;
};

// Group consecutive same-course classes into blocks
export const getBlocksForDay = (day: DayName): ClassBlock[] => {
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
    } else {
      // Save previous block and start new one
      if (currentBlock) {
        blocks.push(currentBlock);
      }
      currentBlock = {
        blockId: `block_${slot.id}`,
        course: slot.course,
        room: slot.room,
        startTime: slot.time,
        endTime: slot.time,
        duration: 1,
        slotIds: [slot.id],
      };
    }
  }

  // Don't forget the last block
  if (currentBlock) {
    blocks.push(currentBlock);
  }

  return blocks;
};

// Get all blocks across all days (for counting per course)
export const getAllBlocks = (): ClassBlock[] => {
  const allBlocks: ClassBlock[] = [];
  for (const day of days as DayName[]) {
    allBlocks.push(...getBlocksForDay(day));
  }
  return allBlocks;
};
