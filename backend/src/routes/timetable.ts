import { Router, Request, Response } from 'express';
import db from '../db/database.js';

const router = Router();

// Types
interface TimetableSlot {
  slot_id: string;
  day: string;
  time: string;
  course_code: string;
  room: string;
}

interface ClassBlock {
  blockId: string;
  course: string;
  room: string;
  startTime: string;
  endTime: string;
  duration: number;
  slotIds: string[];
}

// Helper to check if two times are consecutive (1 hour apart)
const areConsecutive = (time1: string, time2: string): boolean => {
  const hour1 = parseInt(time1.split(":")[0]);
  const hour2 = parseInt(time2.split(":")[0]);
  return hour2 - hour1 === 1;
};

// Group consecutive same-course classes into blocks
const groupIntoBlocks = (slots: TimetableSlot[]): ClassBlock[] => {
  if (slots.length === 0) return [];

  // Sort by time
  const sortedSlots = [...slots].sort((a, b) => {
    const hourA = parseInt(a.time.split(":")[0]);
    const hourB = parseInt(b.time.split(":")[0]);
    return hourA - hourB;
  });

  const blocks: ClassBlock[] = [];
  let currentBlock: ClassBlock | null = null;

  for (const slot of sortedSlots) {
    if (
      currentBlock &&
      currentBlock.course === slot.course_code &&
      areConsecutive(currentBlock.endTime, slot.time)
    ) {
      // Extend current block
      currentBlock.endTime = slot.time;
      currentBlock.duration++;
      currentBlock.slotIds.push(slot.slot_id);
    } else {
      // Save previous block and start new one
      if (currentBlock) {
        blocks.push(currentBlock);
      }
      currentBlock = {
        blockId: `block_${slot.slot_id}`,
        course: slot.course_code,
        room: slot.room,
        startTime: slot.time,
        endTime: slot.time,
        duration: 1,
        slotIds: [slot.slot_id],
      };
    }
  }

  // Don't forget the last block
  if (currentBlock) {
    blocks.push(currentBlock);
  }

  return blocks;
};

// GET /api/timetable - Get full timetable
router.get('/', (req: Request, res: Response) => {
  try {
    const userId = req.query.userId || 1;

    const slots = db.prepare(`
      SELECT slot_id, day, time, course_code, room
      FROM timetable_slots
      WHERE user_id = ?
      ORDER BY day, time
    `).all(userId) as TimetableSlot[];

    // Group by day
    const timetable: { [day: string]: any[] } = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
    };

    for (const slot of slots) {
      if (timetable[slot.day]) {
        timetable[slot.day].push({
          id: slot.slot_id,
          time: slot.time,
          course: slot.course_code,
          room: slot.room,
        });
      }
    }

    res.json(timetable);
  } catch (error) {
    console.error('Error fetching timetable:', error);
    res.status(500).json({ error: 'Failed to fetch timetable' });
  }
});

// GET /api/timetable/day/:day - Get timetable for a specific day
router.get('/day/:day', (req: Request, res: Response) => {
  try {
    const { day } = req.params;
    const userId = req.query.userId || 1;

    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    if (!validDays.includes(day)) {
      return res.status(400).json({ error: 'Invalid day. Must be Monday-Friday' });
    }

    const slots = db.prepare(`
      SELECT slot_id, day, time, course_code, room
      FROM timetable_slots
      WHERE user_id = ? AND day = ?
      ORDER BY time
    `).all(userId, day) as TimetableSlot[];

    // Return as blocks
    const blocks = groupIntoBlocks(slots);

    res.json(blocks);
  } catch (error) {
    console.error('Error fetching timetable for day:', error);
    res.status(500).json({ error: 'Failed to fetch timetable for day' });
  }
});

// GET /api/timetable/blocks - Get all blocks for all days
router.get('/blocks', (req: Request, res: Response) => {
  try {
    const userId = req.query.userId || 1;

    const slots = db.prepare(`
      SELECT slot_id, day, time, course_code, room
      FROM timetable_slots
      WHERE user_id = ?
      ORDER BY day, time
    `).all(userId) as TimetableSlot[];

    // Group by day first
    const slotsByDay: { [day: string]: TimetableSlot[] } = {};
    for (const slot of slots) {
      if (!slotsByDay[slot.day]) {
        slotsByDay[slot.day] = [];
      }
      slotsByDay[slot.day].push(slot);
    }

    // Convert to blocks for each day
    const blocksByDay: { [day: string]: ClassBlock[] } = {};
    for (const [day, daySlots] of Object.entries(slotsByDay)) {
      blocksByDay[day] = groupIntoBlocks(daySlots);
    }

    res.json(blocksByDay);
  } catch (error) {
    console.error('Error fetching blocks:', error);
    res.status(500).json({ error: 'Failed to fetch blocks' });
  }
});

// GET /api/timetable/courses - Get all unique courses
router.get('/courses', (req: Request, res: Response) => {
  try {
    const userId = req.query.userId || 1;

    const courses = db.prepare(`
      SELECT DISTINCT code, name
      FROM courses
      WHERE user_id = ?
      ORDER BY code
    `).all(userId) as Array<{ code: string; name: string | null }>;

    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// POST /api/timetable/slot - Add a new slot
router.post('/slot', (req: Request, res: Response) => {
  try {
    const { slotId, day, time, courseCode, room, userId = 1 } = req.body;

    if (!slotId || !day || !time || !courseCode || !room) {
      return res.status(400).json({ 
        error: 'Missing required fields: slotId, day, time, courseCode, room' 
      });
    }

    // Insert or update slot
    const stmt = db.prepare(`
      INSERT INTO timetable_slots (slot_id, day, time, course_code, room, user_id)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(slot_id) 
      DO UPDATE SET day = excluded.day, time = excluded.time, 
                    course_code = excluded.course_code, room = excluded.room
    `);

    stmt.run(slotId, day, time, courseCode, room, userId);

    // Also ensure course exists
    db.prepare(`
      INSERT OR IGNORE INTO courses (code, user_id) VALUES (?, ?)
    `).run(courseCode, userId);

    res.json({ success: true, slotId, day, time, courseCode, room });
  } catch (error) {
    console.error('Error adding slot:', error);
    res.status(500).json({ error: 'Failed to add slot' });
  }
});

// PUT /api/timetable/slot/:slotId - Update a slot
router.put('/slot/:slotId', (req: Request, res: Response) => {
  try {
    const { slotId } = req.params;
    const { day, time, courseCode, room, userId = 1 } = req.body;

    const stmt = db.prepare(`
      UPDATE timetable_slots 
      SET day = COALESCE(?, day),
          time = COALESCE(?, time),
          course_code = COALESCE(?, course_code),
          room = COALESCE(?, room)
      WHERE slot_id = ? AND user_id = ?
    `);

    const result = stmt.run(day, time, courseCode, room, slotId, userId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Slot not found' });
    }

    res.json({ success: true, slotId });
  } catch (error) {
    console.error('Error updating slot:', error);
    res.status(500).json({ error: 'Failed to update slot' });
  }
});

// DELETE /api/timetable/slot/:slotId - Delete a slot
router.delete('/slot/:slotId', (req: Request, res: Response) => {
  try {
    const { slotId } = req.params;
    const userId = req.query.userId || 1;

    const stmt = db.prepare(`
      DELETE FROM timetable_slots WHERE slot_id = ? AND user_id = ?
    `);

    const result = stmt.run(slotId, userId);

    res.json({ success: true, deleted: result.changes > 0 });
  } catch (error) {
    console.error('Error deleting slot:', error);
    res.status(500).json({ error: 'Failed to delete slot' });
  }
});

// POST /api/timetable/bulk - Bulk import timetable
router.post('/bulk', (req: Request, res: Response) => {
  try {
    const { timetable, userId = 1 } = req.body;

    if (!timetable || typeof timetable !== 'object') {
      return res.status(400).json({ error: 'Invalid timetable data' });
    }

    const insertSlot = db.prepare(`
      INSERT INTO timetable_slots (slot_id, day, time, course_code, room, user_id)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(slot_id) 
      DO UPDATE SET day = excluded.day, time = excluded.time, 
                    course_code = excluded.course_code, room = excluded.room
    `);

    const insertCourse = db.prepare(`
      INSERT OR IGNORE INTO courses (code, user_id) VALUES (?, ?)
    `);

    const importTimetable = db.transaction((data: any) => {
      let count = 0;
      const courses = new Set<string>();

      for (const [day, slots] of Object.entries(data)) {
        if (Array.isArray(slots)) {
          for (const slot of slots as any[]) {
            insertSlot.run(slot.id, day, slot.time, slot.course, slot.room, userId);
            courses.add(slot.course);
            count++;
          }
        }
      }

      // Insert unique courses
      for (const course of courses) {
        insertCourse.run(course, userId);
      }

      return count;
    });

    const count = importTimetable(timetable);
    res.json({ success: true, slotsImported: count });
  } catch (error) {
    console.error('Error bulk importing timetable:', error);
    res.status(500).json({ error: 'Failed to bulk import timetable' });
  }
});

export default router;
