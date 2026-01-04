import { Router, Request, Response } from 'express';
import db from '../db/database.js';

const router = Router();

// Types
interface AttendanceRecord {
  id: number;
  user_id: number;
  date: string;
  block_id: string;
  status: 'present' | 'absent';
}

interface AttendanceByDate {
  [dateKey: string]: {
    [blockId: string]: 'present' | 'absent' | null;
  };
}

// GET /api/attendance - Get all attendance records for a user
router.get('/', (req: Request, res: Response) => {
  try {
    const userId = req.query.userId || 1;
    
    const records = db.prepare(`
      SELECT date, block_id, status 
      FROM attendance 
      WHERE user_id = ?
      ORDER BY date DESC
    `).all(userId) as AttendanceRecord[];

    // Transform to frontend format
    const attendanceByDate: AttendanceByDate = {};
    for (const record of records) {
      if (!attendanceByDate[record.date]) {
        attendanceByDate[record.date] = {};
      }
      attendanceByDate[record.date][record.block_id] = record.status;
    }

    res.json(attendanceByDate);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ error: 'Failed to fetch attendance records' });
  }
});

// GET /api/attendance/:date - Get attendance for a specific date
router.get('/:date', (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    const userId = req.query.userId || 1;

    const records = db.prepare(`
      SELECT block_id, status 
      FROM attendance 
      WHERE user_id = ? AND date = ?
    `).all(userId, date) as AttendanceRecord[];

    const attendance: { [blockId: string]: 'present' | 'absent' } = {};
    for (const record of records) {
      attendance[record.block_id] = record.status;
    }

    res.json(attendance);
  } catch (error) {
    console.error('Error fetching attendance for date:', error);
    res.status(500).json({ error: 'Failed to fetch attendance for date' });
  }
});

// POST /api/attendance - Mark attendance for a block
router.post('/', (req: Request, res: Response) => {
  try {
    const { date, blockId, status, userId = 1 } = req.body;

    if (!date || !blockId || !status) {
      return res.status(400).json({ error: 'Missing required fields: date, blockId, status' });
    }

    if (!['present', 'absent'].includes(status)) {
      return res.status(400).json({ error: 'Status must be "present" or "absent"' });
    }

    const stmt = db.prepare(`
      INSERT INTO attendance (user_id, date, block_id, status, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id, date, block_id) 
      DO UPDATE SET status = excluded.status, updated_at = CURRENT_TIMESTAMP
    `);

    stmt.run(userId, date, blockId, status);

    res.json({ success: true, date, blockId, status });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ error: 'Failed to mark attendance' });
  }
});

// POST /api/attendance/bulk - Bulk import attendance (for migration from localStorage)
router.post('/bulk', (req: Request, res: Response) => {
  try {
    const { attendanceByDate, userId = 1 } = req.body;

    if (!attendanceByDate || typeof attendanceByDate !== 'object') {
      return res.status(400).json({ error: 'Invalid attendance data' });
    }

    const stmt = db.prepare(`
      INSERT INTO attendance (user_id, date, block_id, status, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id, date, block_id) 
      DO UPDATE SET status = excluded.status, updated_at = CURRENT_TIMESTAMP
    `);

    const insertMany = db.transaction((data: AttendanceByDate) => {
      let count = 0;
      for (const [date, blocks] of Object.entries(data)) {
        for (const [blockId, status] of Object.entries(blocks)) {
          if (status === 'present' || status === 'absent') {
            stmt.run(userId, date, blockId, status);
            count++;
          }
        }
      }
      return count;
    });

    const count = insertMany(attendanceByDate);
    res.json({ success: true, recordsImported: count });
  } catch (error) {
    console.error('Error bulk importing attendance:', error);
    res.status(500).json({ error: 'Failed to bulk import attendance' });
  }
});

// DELETE /api/attendance/:date/:blockId - Clear attendance for a specific block
router.delete('/:date/:blockId', (req: Request, res: Response) => {
  try {
    const { date, blockId } = req.params;
    const userId = req.query.userId || 1;

    const stmt = db.prepare(`
      DELETE FROM attendance 
      WHERE user_id = ? AND date = ? AND block_id = ?
    `);

    const result = stmt.run(userId, date, blockId);

    res.json({ success: true, deleted: result.changes > 0 });
  } catch (error) {
    console.error('Error clearing attendance:', error);
    res.status(500).json({ error: 'Failed to clear attendance' });
  }
});

// DELETE /api/attendance - Reset all attendance for a user
router.delete('/', (req: Request, res: Response) => {
  try {
    const userId = req.query.userId || 1;

    const stmt = db.prepare(`
      DELETE FROM attendance WHERE user_id = ?
    `);

    const result = stmt.run(userId);

    res.json({ success: true, deletedCount: result.changes });
  } catch (error) {
    console.error('Error resetting attendance:', error);
    res.status(500).json({ error: 'Failed to reset attendance' });
  }
});

// GET /api/attendance/stats - Get attendance statistics per course
router.get('/stats/summary', (req: Request, res: Response) => {
  try {
    const userId = req.query.userId || 1;

    // Get all attendance records with course info
    const records = db.prepare(`
      SELECT 
        a.date,
        a.block_id,
        a.status,
        ts.course_code
      FROM attendance a
      LEFT JOIN timetable_slots ts ON SUBSTR(a.block_id, 7) = ts.slot_id
      WHERE a.user_id = ?
    `).all(userId) as Array<{
      date: string;
      block_id: string;
      status: string;
      course_code: string;
    }>;

    // Calculate stats per course
    const courseStats: { [course: string]: { attended: number; total: number } } = {};

    for (const record of records) {
      const course = record.course_code || 'Unknown';
      if (!courseStats[course]) {
        courseStats[course] = { attended: 0, total: 0 };
      }
      courseStats[course].total++;
      if (record.status === 'present') {
        courseStats[course].attended++;
      }
    }

    // Calculate percentages and bunk status
    const stats = Object.entries(courseStats).map(([course, data]) => {
      const percentage = data.total > 0 ? (data.attended / data.total) * 100 : 0;
      let canBunk = 0;
      let mustAttend = 0;
      let status: 'safe' | 'danger' | 'neutral' = 'neutral';

      if (data.total > 0) {
        if (percentage >= 75) {
          status = 'safe';
          canBunk = Math.floor(data.attended / 0.75 - data.total);
          canBunk = Math.max(0, canBunk);
        } else {
          status = 'danger';
          mustAttend = Math.ceil(3 * data.total - 4 * data.attended);
          mustAttend = Math.max(0, mustAttend);
        }
      }

      return {
        course,
        totalBlocks: data.total,
        attended: data.attended,
        percentage,
        canBunk,
        mustAttend,
        status,
      };
    });

    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch attendance stats' });
  }
});

export default router;
