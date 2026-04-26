import fs from 'fs/promises';
import path from 'path';

const STORAGE_BASE = path.join(process.cwd(), 'storage');
const USERS_PATH = path.join(STORAGE_BASE, 'users');
const SECTIONS_PATH = path.join(STORAGE_BASE, 'sections');

export class StorageService {
  private static instance: StorageService;

  private constructor() {
    this.ensureDirs();
  }

  private async ensureDirs() {
    try {
      await fs.mkdir(USERS_PATH, { recursive: true });
      await fs.mkdir(SECTIONS_PATH, { recursive: true });
      console.log("Vault directories verified at: " + STORAGE_BASE);
    } catch (err) {
      console.error("Failed to create vault directories:", err);
    }
  }

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  /**
   * Saves a user's data to their private vault.
   */
  async saveUser(regNo: string, data: any) {
    const filePath = path.join(USERS_PATH, `${regNo.toUpperCase()}.json`);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    console.log(`Vaulted user data for ${regNo} at: ${filePath}`);
  }

  /**
   * Saves a section's shared timetable.
   */
  async saveSection(section: string, timetable: any) {
    if (!section) return;
    const safeSection = section.replace(/[^a-z0-9]/gi, '_').toUpperCase();
    const filePath = path.join(SECTIONS_PATH, `${safeSection}.json`);
    await fs.writeFile(filePath, JSON.stringify(timetable, null, 2));
    console.log(`Vaulted section timetable: ${safeSection}`);
  }

  /**
   * Loads a user's data from the vault.
   */
  async getUser(regNo: string) {
    try {
      const filePath = path.join(USERS_PATH, `${regNo.toUpperCase()}.json`);
      const raw = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  /**
   * Loads a section's shared timetable.
   */
  async getSection(section: string) {
    try {
      const safeSection = section.replace(/[^a-z0-9]/gi, '_').toUpperCase();
      const filePath = path.join(SECTIONS_PATH, `${safeSection}.json`);
      const raw = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
}
