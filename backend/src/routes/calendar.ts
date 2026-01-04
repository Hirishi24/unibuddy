import { Router, Request, Response } from 'express';
import db from '../db/database.js';

const router = Router();

// Types
interface Holiday {
  date: string;
  name: string;
  day: string;
}

interface SemesterSettings {
  semester_start: string;
  semester_end: string;
  target_percentage: number;
}

// GET /api/calendar/holidays - Get all holidays
router.get('/holidays', (req: Request, res: Response) => {
  try {
    const holidays = db.prepare(`
      SELECT date, name, day FROM holidays ORDER BY date
    `).all() as Holiday[];

    res.json(holidays);
  } catch (error) {
    console.error('Error fetching holidays:', error);
    res.status(500).json({ error: 'Failed to fetch holidays' });
  }
});

// GET /api/calendar/holiday/:date - Check if a date is a holiday
router.get('/holiday/:date', (req: Request, res: Response) => {
  try {
    const { date } = req.params;

    const holiday = db.prepare(`
      SELECT date, name, day FROM holidays WHERE date = ?
    `).get(date) as Holiday | undefined;

    if (holiday) {
      res.json({ isHoliday: true, holiday });
    } else {
      res.json({ isHoliday: false, holiday: null });
    }
  } catch (error) {
    console.error('Error checking holiday:', error);
    res.status(500).json({ error: 'Failed to check holiday' });
  }
});

// POST /api/calendar/holiday - Add a new holiday
router.post('/holiday', (req: Request, res: Response) => {
  try {
    const { date, name, day } = req.body;

    if (!date || !name || !day) {
      return res.status(400).json({ error: 'Missing required fields: date, name, day' });
    }

    const stmt = db.prepare(`
      INSERT INTO holidays (date, name, day)
      VALUES (?, ?, ?)
      ON CONFLICT(date) DO UPDATE SET name = excluded.name, day = excluded.day
    `);

    stmt.run(date, name, day);

    res.json({ success: true, date, name, day });
  } catch (error) {
    console.error('Error adding holiday:', error);
    res.status(500).json({ error: 'Failed to add holiday' });
  }
});

// DELETE /api/calendar/holiday/:date - Remove a holiday
router.delete('/holiday/:date', (req: Request, res: Response) => {
  try {
    const { date } = req.params;

    const stmt = db.prepare(`DELETE FROM holidays WHERE date = ?`);
    const result = stmt.run(date);

    res.json({ success: true, deleted: result.changes > 0 });
  } catch (error) {
    console.error('Error deleting holiday:', error);
    res.status(500).json({ error: 'Failed to delete holiday' });
  }
});

// GET /api/calendar/semester - Get semester settings
router.get('/semester', (req: Request, res: Response) => {
  try {
    const userId = req.query.userId || 1;

    const settings = db.prepare(`
      SELECT semester_start, semester_end, target_percentage
      FROM semester_settings
      WHERE user_id = ?
    `).get(userId) as SemesterSettings | undefined;

    if (settings) {
      res.json(settings);
    } else {
      res.json({
        semester_start: '2026-01-05',
        semester_end: '2026-05-04',
        target_percentage: 75.0,
      });
    }
  } catch (error) {
    console.error('Error fetching semester settings:', error);
    res.status(500).json({ error: 'Failed to fetch semester settings' });
  }
});

// PUT /api/calendar/semester - Update semester settings
router.put('/semester', (req: Request, res: Response) => {
  try {
    const { semesterStart, semesterEnd, targetPercentage, userId = 1 } = req.body;

    const stmt = db.prepare(`
      INSERT INTO semester_settings (user_id, semester_start, semester_end, target_percentage)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(user_id) 
      DO UPDATE SET semester_start = excluded.semester_start, 
                    semester_end = excluded.semester_end,
                    target_percentage = excluded.target_percentage
    `);

    stmt.run(userId, semesterStart, semesterEnd, targetPercentage || 75.0);

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating semester settings:', error);
    res.status(500).json({ error: 'Failed to update semester settings' });
  }
});

// GET /api/calendar/check-date/:date - Check if a date has classes
router.get('/check-date/:date', (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    const userId = req.query.userId || 1;

    // Get semester settings
    const settings = db.prepare(`
      SELECT semester_start, semester_end
      FROM semester_settings
      WHERE user_id = ?
    `).get(userId) as SemesterSettings | undefined;

    const semesterStart = settings?.semester_start || '2026-01-05';
    const semesterEnd = settings?.semester_end || '2026-05-04';

    // Check if outside semester
    if (date < semesterStart) {
      return res.json({ hasClasses: false, reason: 'before_semester', message: `Date is before semester start (${semesterStart})` });
    }
    if (date > semesterEnd) {
      return res.json({ hasClasses: false, reason: 'after_semester', message: `Date is after semester end (${semesterEnd})` });
    }

    // Check if it's a holiday
    const holiday = db.prepare(`
      SELECT name FROM holidays WHERE date = ?
    `).get(date) as { name: string } | undefined;

    if (holiday) {
      return res.json({ hasClasses: false, reason: 'holiday', name: holiday.name, message: `Holiday: ${holiday.name}` });
    }

    // Check if weekend
    const dateObj = new Date(date + 'T00:00:00');
    const dayOfWeek = dateObj.getDay();

    if (dayOfWeek === 0) {
      return res.json({ hasClasses: false, reason: 'weekend', day: 'Sunday', message: 'Sunday - No classes' });
    }
    if (dayOfWeek === 6) {
      return res.json({ hasClasses: false, reason: 'weekend', day: 'Saturday', message: 'Saturday - No classes' });
    }

    // Has classes
    res.json({ hasClasses: true, reason: 'has_classes', message: null });
  } catch (error) {
    console.error('Error checking date:', error);
    res.status(500).json({ error: 'Failed to check date' });
  }
});

export default router;
