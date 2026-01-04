import { Database } from 'bun:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../data/attendance.db');

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath, { create: true });

// Enable foreign keys
db.exec('PRAGMA foreign_keys = ON');

// Create a wrapper to make bun:sqlite API compatible with better-sqlite3 API
const dbWrapper = {
  exec: (sql: string) => db.exec(sql),
  prepare: (sql: string) => {
    const stmt = db.prepare(sql);
    return {
      run: (...params: any[]) => stmt.run(...params),
      get: (...params: any[]) => stmt.get(...params),
      all: (...params: any[]) => stmt.all(...params),
    };
  },
  transaction: <T>(fn: (data: T) => any) => {
    return (data: T) => {
      db.exec('BEGIN TRANSACTION');
      try {
        const result = fn(data);
        db.exec('COMMIT');
        return result;
      } catch (error) {
        db.exec('ROLLBACK');
        throw error;
      }
    };
  },
  close: () => db.close(),
};

export default dbWrapper;
