import db from './database.js';

// Initialize database tables
export function initializeDatabase() {
  // Users table (for future multi-user support)
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert default user if not exists
  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (id, username) VALUES (1, 'default')
  `);
  insertUser.run();

  // Courses table
  db.exec(`
    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT,
      user_id INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Timetable slots table
  db.exec(`
    CREATE TABLE IF NOT EXISTS timetable_slots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slot_id TEXT UNIQUE NOT NULL,
      day TEXT NOT NULL,
      time TEXT NOT NULL,
      course_code TEXT NOT NULL,
      room TEXT NOT NULL,
      user_id INTEGER DEFAULT 1,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Attendance records table
  db.exec(`
    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER DEFAULT 1,
      date TEXT NOT NULL,
      block_id TEXT NOT NULL,
      status TEXT CHECK(status IN ('present', 'absent')) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, date, block_id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Holidays table
  db.exec(`
    CREATE TABLE IF NOT EXISTS holidays (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      day TEXT NOT NULL
    )
  `);

  // Semester settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS semester_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER DEFAULT 1,
      semester_start TEXT NOT NULL,
      semester_end TEXT NOT NULL,
      target_percentage REAL DEFAULT 75.0,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Insert default semester if not exists
  const insertSemester = db.prepare(`
    INSERT OR IGNORE INTO semester_settings (id, user_id, semester_start, semester_end) 
    VALUES (1, 1, '2026-01-05', '2026-05-04')
  `);
  insertSemester.run();

  console.log('✅ Database tables initialized');
}

// Seed default timetable data
export function seedTimetable() {
  const timetable = {
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

  const insertSlot = db.prepare(`
    INSERT OR REPLACE INTO timetable_slots (slot_id, day, time, course_code, room, user_id)
    VALUES (?, ?, ?, ?, ?, 1)
  `);

  const insertCourse = db.prepare(`
    INSERT OR IGNORE INTO courses (code, user_id)
    VALUES (?, 1)
  `);

  const courses = new Set<string>();

  for (const [day, slots] of Object.entries(timetable)) {
    for (const slot of slots) {
      insertSlot.run(slot.id, day, slot.time, slot.course, slot.room);
      courses.add(slot.course);
    }
  }

  // Insert unique courses
  for (const course of courses) {
    insertCourse.run(course);
  }

  console.log('✅ Default timetable seeded');
}

// Seed holidays
export function seedHolidays() {
  const holidays = [
    { date: "2026-01-14", name: "Bhogi", day: "Wednesday" },
    { date: "2026-01-15", name: "Makara Sankranthi", day: "Thursday" },
    { date: "2026-01-16", name: "Kanuma", day: "Friday" },
    { date: "2026-01-26", name: "Republic Day", day: "Monday" },
    { date: "2026-03-03", name: "Holi", day: "Tuesday" },
    { date: "2026-03-19", name: "Ugadi", day: "Thursday" },
    { date: "2026-03-20", name: "Ramzan (EID-UL-FITR)", day: "Friday" },
    { date: "2026-03-27", name: "Sri Rama Navami", day: "Friday" },
    { date: "2026-04-03", name: "Good Friday", day: "Friday" },
    { date: "2026-04-14", name: "Dr. B.R Ambedkar's Birthday", day: "Tuesday" },
  ];

  const insertHoliday = db.prepare(`
    INSERT OR REPLACE INTO holidays (date, name, day)
    VALUES (?, ?, ?)
  `);

  for (const holiday of holidays) {
    insertHoliday.run(holiday.date, holiday.name, holiday.day);
  }

  console.log('✅ Holidays seeded');
}

// Run initialization
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase();
  seedTimetable();
  seedHolidays();
  console.log('🚀 Database initialization complete!');
}
