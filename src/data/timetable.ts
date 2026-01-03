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
  // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  if (dayIndex === 0 || dayIndex === 6) {
    return "Monday"; // Default to Monday on weekends
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

// Get total classes per course per week
export const getTotalClassesPerCourse = (): Record<string, number> => {
  const totals: Record<string, number> = {};
  Object.values(timetable).forEach((dayClasses) => {
    dayClasses.forEach((slot) => {
      totals[slot.course] = (totals[slot.course] || 0) + 1;
    });
  });
  return totals;
};
