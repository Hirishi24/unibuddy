export interface ClassSlot {
  id: string;
  time: string;
  course: string;
  room: string;
  isLab?: boolean;
  isOE?: boolean;
}

export type DayName = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";

export interface Timetable {
  [day: string]: ClassSlot[];
}

// A block is a group of consecutive same-course classes (treated as one attendance entry)
export interface ClassBlock {
  blockId: string;
  course: string;
  courseTitle: string;
  room: string;
  startTime: string;
  endTime: string;
  duration: number; // in hours
  slotIds: string[];
  isLab: boolean;
  isOE: boolean;
  faculty: string;
}

// Course code to title mapping
export const courseTitles: Record<string, string> = {
  "CSE 304": "Automata and Compilers Design",
  "CSE 306": "Software Engineering and Project Management",
  "CSE 423": "Natural Language Processing",
  "CSE 455": "Artificial Intelligence",
  "CSE 456": "Digital Image Processing",
  "LBA 253": "Artificial Intelligence (AI) and Ethics",
  "SEC 176": "Generative AI - II",
};

// Faculty information per course
export const courseFaculty: Record<string, string> = {
  "CSE 304": "Mr. V R P S Sastry Yadavilli",
  "CSE 306": "Mr. Ramesh Sahoo",
  "CSE 423": "Dr. Yandrapati Prakash Babu",
  "CSE 455": "Dr. Ananya Mahanti, Dr. Tabiya Manzoor",
  "CSE 456": "Dr. Anila Makkapati, Mr. Madhusudan Naik",
  "LBA 253": "Dr. Idris Hassan Bhat",
  "SEC 176": "Mr. Careerskill",
};

// Total semester classes per course (excluding weekends, holidays, and exam periods)
// Mid-Term Exams: March 9-13, 2026 (Mon-Fri) - Classes cancelled
// OD/ML relaxation: 15% of total classes can be used as OD/ML
// Required attendance: 75% (or 60% of remaining after using max OD/ML)
export interface CourseMetadata {
  totalClasses: number;
  odMlAllowed: number; // 15% of total
  classesAfterOdMl: number; // total - odMlAllowed
  minRequired: number; // 60% of classesAfterOdMl (= 75% if no OD/ML used)
  rooms: string[];
}

// Classes cancelled during Mid-Term Exams (March 9-13):
// LBA 253: 3 hrs (Mon+Tue+Wed), CSE 455: 5 hrs, CSE 456: 5 hrs
// CSE 306: 5 hrs, CSE 423: 2 hrs, CSE 304: 3 hrs, SEC 176: 3 hrs
export const courseMetadata: Record<string, CourseMetadata> = {
  "LBA 253": {
    totalClasses: 45, // 48 - 3 (mid-term exam week)
    odMlAllowed: 7,
    classesAfterOdMl: 38,
    minRequired: 23,
    rooms: ["S607"],
  },
  "CSE 455": {
    totalClasses: 76, // 81 - 5 (mid-term exam week)
    odMlAllowed: 12,
    classesAfterOdMl: 64,
    minRequired: 39,
    rooms: ["S412", "C707"],
  },
  "CSE 456": {
    totalClasses: 73, // 78 - 5 (mid-term exam week)
    odMlAllowed: 11,
    classesAfterOdMl: 62,
    minRequired: 38,
    rooms: ["C707", "S613"],
  },
  "CSE 306": {
    totalClasses: 74, // 79 - 5 (mid-term exam week)
    odMlAllowed: 11,
    classesAfterOdMl: 63,
    minRequired: 38,
    rooms: ["C707", "C1006", "V601"],
  },
  "CSE 423": {
    totalClasses: 30, // 32 - 2 (mid-term exam week)
    odMlAllowed: 5,
    classesAfterOdMl: 25,
    minRequired: 15,
    rooms: ["C702"],
  },
  "CSE 304": {
    totalClasses: 45, // 48 - 3 (mid-term exam week)
    odMlAllowed: 7,
    classesAfterOdMl: 38,
    minRequired: 23,
    rooms: ["C707"],
  },
  "SEC 176": {
    totalClasses: 42, // 45 - 3 (mid-term exam week)
    odMlAllowed: 7,
    classesAfterOdMl: 35,
    minRequired: 21,
    rooms: ["C707"],
  },
};

// Get course title from course code
export const getCourseTitle = (courseCode: string): string => {
  return courseTitles[courseCode] || courseCode;
};

export const timetable: Timetable = {
  Monday: [
    { id: "mon1", time: "09:00", course: "LBA 253", room: "S607", isOE: true },
    { id: "mon2", time: "10:00", course: "CSE 455", room: "S412", isLab: true },
    { id: "mon3", time: "11:00", course: "CSE 455", room: "S412", isLab: true },
    { id: "mon4", time: "13:00", course: "CSE 456", room: "C707" },
    { id: "mon5", time: "14:00", course: "CSE 306", room: "C707" },
    { id: "mon6", time: "15:00", course: "CSE 306", room: "C707" },
    { id: "mon7", time: "16:00", course: "CSE 423", room: "C702" },
  ],
  Tuesday: [
    { id: "tue1", time: "09:00", course: "LBA 253", room: "S607", isOE: true },
    { id: "tue2", time: "10:00", course: "CSE 304", room: "C707" },
    { id: "tue3", time: "11:00", course: "CSE 304", room: "C707" },
    { id: "tue4", time: "12:00", course: "CSE 455", room: "C707" },
    { id: "tue5", time: "15:00", course: "CSE 306", room: "C1006" },
    { id: "tue6", time: "16:00", course: "CSE 423", room: "C702" },
  ],
  Wednesday: [
    { id: "wed1", time: "09:00", course: "LBA 253", room: "S607", isOE: true },
    { id: "wed2", time: "13:00", course: "CSE 304", room: "C707" },
    { id: "wed3", time: "14:00", course: "CSE 455", room: "C707" },
    { id: "wed4", time: "15:00", course: "CSE 455", room: "C707" },
  ],
  Thursday: [
    { id: "thu1", time: "10:00", course: "SEC 176", room: "C707" },
    { id: "thu2", time: "11:00", course: "SEC 176", room: "C707" },
    { id: "thu3", time: "12:00", course: "SEC 176", room: "C707" },
    { id: "thu4", time: "14:00", course: "CSE 456", room: "S613", isLab: true },
    { id: "thu5", time: "15:00", course: "CSE 456", room: "S613", isLab: true },
  ],
  Friday: [
    { id: "fri1", time: "10:00", course: "CSE 306", room: "V601", isLab: true },
    { id: "fri2", time: "11:00", course: "CSE 306", room: "V601", isLab: true },
    { id: "fri3", time: "14:00", course: "CSE 456", room: "C707" },
    { id: "fri4", time: "15:00", course: "CSE 456", room: "C707" },
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
      // If any slot in the block is a lab, mark the block as lab
      if (slot.isLab) {
        currentBlock.isLab = true;
      }
    } else {
      // Save previous block and start new one
      if (currentBlock) {
        blocks.push(currentBlock);
      }
      currentBlock = {
        blockId: `block_${slot.id}`,
        course: slot.course,
        courseTitle: getCourseTitle(slot.course),
        room: slot.room,
        startTime: slot.time,
        endTime: slot.time,
        duration: 1,
        slotIds: [slot.id],
        isLab: slot.isLab || false,
        isOE: slot.isOE || false,
        faculty: courseFaculty[slot.course] || "TBA",
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
