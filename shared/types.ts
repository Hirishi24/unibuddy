export type DayName = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";

export interface User {
  id: number;
  username: string;
  email?: string;
  isGuest?: boolean;
}

export interface Course {
  id: number;
  code: string;
  name?: string;
  userId: number;
}

export interface ClassSlot {
  id: string;
  time: string;
  course: string;
  room: string;
  isLab?: boolean;
  isOE?: boolean;
}

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

export interface AttendanceRecord {
  id?: number;
  userId: number;
  date: string; // ISO string or YYYY-MM-DD
  blockId: string;
  status: 'present' | 'absent';
}

export interface Holiday {
  id: number;
  date: string;
  name: string;
  day: string;
}

export interface SemesterSettings {
  id: number;
  userId: number;
  semesterStart: string;
  semesterEnd: string;
  targetPercentage: number;
}

export interface Timetable {
  [day: string]: ClassSlot[];
}
