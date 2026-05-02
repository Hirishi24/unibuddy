export type DayName = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';

export interface ClassBlock {
  blockId: string;
  course: string;
  courseTitle: string;
  room: string;
  startTime: string;
  endTime: string;
  duration: number;
  slotIds: string[];
  isLab: boolean;
  isOE: boolean;
  faculty: string;
}

export interface AttendanceEntry {
  courseCode: string;
  courseTitle: string;
  attendedHours: string;
  totalHours: string;
  odHours: string;
}

export interface TimetableSubject {
  code: string;
  room: string;
  faculty: string;
  isLab?: boolean;
}

export interface TimetableDay {
  day: string;
  startTimeOffset: number;
  subjects: TimetableSubject[];
}

export interface Profile {
  name?: string;
  regNo?: string;
  program?: string;
  semester?: string;
  section?: string;
  cgpa?: string;
  [key: string]: any;
}

export interface ScrapedData {
  profile: Profile;
  attendance: AttendanceEntry[];
  timetable: TimetableDay[];
  subjects: any[];
  cgpa: any;
  source: string;
  lastUpdated: string;
}

export interface SubjectStats {
  course: string;
  title: string;
  conducted: number;
  attended: number;
  absent: number;
  od: number;
  semesterTotal: number;
  percentage: number;
  currentPercentage: number;
  projectedFinalPercentage: number;
  projectedWorstPercentage: number;
  canBunk: number;
  mustAttend: number;
  status: 'safe' | 'warning' | 'danger';
}

export interface DailyAttendanceRecord {
  [blockId: string]: 'present' | 'absent' | null;
}

export interface AttendanceByDate {
  [dateKey: string]: DailyAttendanceRecord;
}
