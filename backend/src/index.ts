import express from 'express';
import cors from 'cors';
import { initializeDatabase, seedTimetable, seedHolidays } from './db/init.js';
import attendanceRoutes from './routes/attendance.js';
import timetableRoutes from './routes/timetable.js';
import calendarRoutes from './routes/calendar.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Initialize database
try {
  initializeDatabase();
  seedTimetable();
  seedHolidays();
} catch (error) {
  console.error('Database initialization error:', error);
}

// Routes
app.use('/api/attendance', attendanceRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/calendar', calendarRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Class Buddy Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      attendance: '/api/attendance',
      timetable: '/api/timetable',
      calendar: '/api/calendar'
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server with explicit host binding
const server = app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`
╔════════════════════════════════════════════╗
║   Class Buddy Backend Server               ║
║   Running on http://localhost:${PORT}         ║
╚════════════════════════════════════════════╝

Available endpoints:
  GET    /api/health              - Health check
  
  GET    /api/attendance          - Get all attendance
  GET    /api/attendance/:date    - Get attendance for date
  POST   /api/attendance          - Mark attendance
  POST   /api/attendance/bulk     - Bulk import attendance
  DELETE /api/attendance          - Reset all attendance
  GET    /api/attendance/stats/summary - Get statistics
  
  GET    /api/timetable           - Get full timetable
  GET    /api/timetable/day/:day  - Get blocks for day
  GET    /api/timetable/blocks    - Get all blocks
  GET    /api/timetable/courses   - Get all courses
  POST   /api/timetable/slot      - Add slot
  POST   /api/timetable/bulk      - Bulk import timetable
  
  GET    /api/calendar/holidays   - Get all holidays
  GET    /api/calendar/semester   - Get semester settings
  PUT    /api/calendar/semester   - Update semester settings
  GET    /api/calendar/check-date/:date - Check if date has classes
  `);
});

// Keep the process alive
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

export default app;
