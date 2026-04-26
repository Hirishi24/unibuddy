// API configuration and service functions for Class Buddy

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Types
export interface AttendanceByDate {
  [dateKey: string]: {
    [blockId: string]: 'present' | 'absent' | null;
  };
}

export interface SubjectStats {
  course: string;
  totalBlocks: number;
  attended: number;
  percentage: number;
  canBunk: number;
  mustAttend: number;
  status: 'safe' | 'danger' | 'neutral';
}

export interface Holiday {
  date: string;
  name: string;
  day: string;
}

export interface ClassBlock {
  blockId: string;
  course: string;
  room: string;
  startTime: string;
  endTime: string;
  duration: number;
  slotIds: string[];
}

export interface SemesterSettings {
  semester_start: string;
  semester_end: string;
  target_percentage: number;
}

// Generic fetch wrapper with error handling
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// ==================== ATTENDANCE API ====================

export const attendanceApi = {
  // Get all attendance records
  getAll: () => apiFetch<AttendanceByDate>('/attendance'),

  // Get attendance for a specific date
  getByDate: (date: string) => 
    apiFetch<{ [blockId: string]: 'present' | 'absent' }>(`/attendance/${date}`),

  // Mark attendance for a block
  mark: (date: string, blockId: string, status: 'present' | 'absent') =>
    apiFetch<{ success: boolean }>('/attendance', {
      method: 'POST',
      body: JSON.stringify({ date, blockId, status }),
    }),

  // Clear attendance for a specific block
  clear: (date: string, blockId: string) =>
    apiFetch<{ success: boolean; deleted: boolean }>(`/attendance/${date}/${blockId}`, {
      method: 'DELETE',
    }),

  // Reset all attendance
  resetAll: () =>
    apiFetch<{ success: boolean; deletedCount: number }>('/attendance', {
      method: 'DELETE',
    }),

  // Bulk import attendance (for migration from localStorage)
  bulkImport: (attendanceByDate: AttendanceByDate) =>
    apiFetch<{ success: boolean; recordsImported: number }>('/attendance/bulk', {
      method: 'POST',
      body: JSON.stringify({ attendanceByDate }),
    }),

  // Get attendance statistics
  getStats: () => apiFetch<SubjectStats[]>('/attendance/stats/summary'),
};

// ==================== TIMETABLE API ====================

export const timetableApi = {
  // Get full timetable
  getAll: () => apiFetch<{ [day: string]: any[] }>('/timetable'),

  // Get blocks for a specific day
  getBlocksForDay: (day: string) => apiFetch<ClassBlock[]>(`/timetable/day/${day}`),

  // Get all blocks grouped by day
  getAllBlocks: () => apiFetch<{ [day: string]: ClassBlock[] }>('/timetable/blocks'),

  // Get all courses
  getCourses: () => apiFetch<Array<{ code: string; name: string | null }>>('/timetable/courses'),

  // Add a new slot
  addSlot: (slot: {
    slotId: string;
    day: string;
    time: string;
    courseCode: string;
    room: string;
  }) =>
    apiFetch<{ success: boolean }>('/timetable/slot', {
      method: 'POST',
      body: JSON.stringify(slot),
    }),

  // Update a slot
  updateSlot: (slotId: string, updates: Partial<{
    day: string;
    time: string;
    courseCode: string;
    room: string;
  }>) =>
    apiFetch<{ success: boolean }>(`/timetable/slot/${slotId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  // Delete a slot
  deleteSlot: (slotId: string) =>
    apiFetch<{ success: boolean; deleted: boolean }>(`/timetable/slot/${slotId}`, {
      method: 'DELETE',
    }),

  // Bulk import timetable
  bulkImport: (timetable: { [day: string]: any[] }) =>
    apiFetch<{ success: boolean; slotsImported: number }>('/timetable/bulk', {
      method: 'POST',
      body: JSON.stringify({ timetable }),
    }),
};

// ==================== CALENDAR API ====================

export const calendarApi = {
  // Get all holidays
  getHolidays: () => apiFetch<Holiday[]>('/calendar/holidays'),

  // Check if a date is a holiday
  checkHoliday: (date: string) =>
    apiFetch<{ isHoliday: boolean; holiday: Holiday | null }>(`/calendar/holiday/${date}`),

  // Add a holiday
  addHoliday: (holiday: Holiday) =>
    apiFetch<{ success: boolean }>('/calendar/holiday', {
      method: 'POST',
      body: JSON.stringify(holiday),
    }),

  // Remove a holiday
  removeHoliday: (date: string) =>
    apiFetch<{ success: boolean; deleted: boolean }>(`/calendar/holiday/${date}`, {
      method: 'DELETE',
    }),

  // Get semester settings
  getSemesterSettings: () => apiFetch<SemesterSettings>('/calendar/semester'),

  // Update semester settings
  updateSemesterSettings: (settings: {
    semesterStart: string;
    semesterEnd: string;
    targetPercentage?: number;
  }) =>
    apiFetch<{ success: boolean }>('/calendar/semester', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),

  // Check if a date has classes
  checkDate: (date: string) =>
    apiFetch<{
      hasClasses: boolean;
      reason: 'has_classes' | 'holiday' | 'weekend' | 'before_semester' | 'after_semester';
      message: string | null;
      name?: string;
      day?: string;
    }>(`/calendar/check-date/${date}`),
};

// ==================== HEALTH CHECK ====================

export const healthCheck = () =>
  apiFetch<{ status: string; timestamp: string; version: string }>('/health');

// ==================== MIGRATION HELPER ====================

// Helper to migrate data from localStorage to backend
export async function migrateFromLocalStorage(): Promise<{
  success: boolean;
  message: string;
}> {
  const STORAGE_KEY = 'student-attendance-data-v3';
  
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return { success: true, message: 'No localStorage data to migrate' };
    }

    const attendanceByDate = JSON.parse(saved);
    const result = await attendanceApi.bulkImport(attendanceByDate);

    if (result.success) {
      // Optionally clear localStorage after successful migration
      // localStorage.removeItem(STORAGE_KEY);
      return { 
        success: true, 
        message: `Successfully migrated ${result.recordsImported} attendance records` 
      };
    }

    return { success: false, message: 'Migration failed' };
  } catch (error) {
    console.error('Migration error:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error during migration' 
    };
  }
}
