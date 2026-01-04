# Class Buddy Backend

A Node.js/Express backend API for the Class Buddy attendance tracker application with SQLite database storage.

## Features

- 📊 **Attendance Tracking** - Store and retrieve attendance records per class block
- 📅 **Timetable Management** - CRUD operations for class schedules
- 🎉 **Holiday Calendar** - Manage holidays and semester settings
- 💾 **Persistent Storage** - SQLite database for data persistence
- 🔄 **Migration Support** - Import data from localStorage

## Prerequisites

- Node.js 18+ or Bun
- npm, yarn, or bun package manager

## Installation

```bash
cd backend

# Using npm
npm install

# Using bun (recommended)
bun install
```

## Running the Server

```bash
# Development mode (with hot reload)
bun run dev
# or
npm run dev

# Production mode
bun run build
bun run start
```

The server will start on `http://localhost:3001`

## API Endpoints

### Health Check
- `GET /api/health` - Server health status

### Attendance
- `GET /api/attendance` - Get all attendance records
- `GET /api/attendance/:date` - Get attendance for a specific date
- `POST /api/attendance` - Mark attendance for a block
- `POST /api/attendance/bulk` - Bulk import attendance records
- `DELETE /api/attendance` - Reset all attendance
- `DELETE /api/attendance/:date/:blockId` - Clear specific attendance
- `GET /api/attendance/stats/summary` - Get attendance statistics per course

### Timetable
- `GET /api/timetable` - Get full timetable
- `GET /api/timetable/day/:day` - Get blocks for a specific day
- `GET /api/timetable/blocks` - Get all blocks grouped by day
- `GET /api/timetable/courses` - Get all unique courses
- `POST /api/timetable/slot` - Add a new slot
- `PUT /api/timetable/slot/:slotId` - Update a slot
- `DELETE /api/timetable/slot/:slotId` - Delete a slot
- `POST /api/timetable/bulk` - Bulk import timetable

### Calendar
- `GET /api/calendar/holidays` - Get all holidays
- `GET /api/calendar/holiday/:date` - Check if a date is a holiday
- `POST /api/calendar/holiday` - Add a new holiday
- `DELETE /api/calendar/holiday/:date` - Remove a holiday
- `GET /api/calendar/semester` - Get semester settings
- `PUT /api/calendar/semester` - Update semester settings
- `GET /api/calendar/check-date/:date` - Check if a date has classes

## Database

The SQLite database is automatically created at `backend/data/attendance.db` with the following tables:

- `users` - User accounts (for future multi-user support)
- `courses` - Course information
- `timetable_slots` - Class schedule slots
- `attendance` - Attendance records
- `holidays` - Holiday dates
- `semester_settings` - Semester configuration

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port |

## Example API Usage

### Mark Attendance
```bash
curl -X POST http://localhost:3001/api/attendance \
  -H "Content-Type: application/json" \
  -d '{"date": "2026-01-05", "blockId": "block_mon1", "status": "present"}'
```

### Get All Attendance
```bash
curl http://localhost:3001/api/attendance
```

### Get Timetable for a Day
```bash
curl http://localhost:3001/api/timetable/day/Monday
```

## Connecting Frontend

To enable backend in the frontend, create a `.env` file in the frontend root:

```env
VITE_USE_BACKEND=true
VITE_API_URL=http://localhost:3001/api
```

Then use the `useAttendanceWithBackend` hook instead of `useAttendance`.

## Project Structure

```
backend/
├── data/                  # SQLite database (auto-created)
├── src/
│   ├── db/
│   │   ├── database.ts    # Database connection
│   │   └── init.ts        # Schema & seed data
│   ├── routes/
│   │   ├── attendance.ts  # Attendance endpoints
│   │   ├── calendar.ts    # Calendar endpoints
│   │   └── timetable.ts   # Timetable endpoints
│   └── index.ts           # Server entry point
├── package.json
└── tsconfig.json
```

## License

MIT
