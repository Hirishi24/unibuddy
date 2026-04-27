import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const ENCRYPTION_KEY = process.env.JWT_SECRET || 'unibuddy-vault-encryption-key-32-chars-long!';
// Ensure key is exactly 32 bytes for AES-256
const HASHED_KEY = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();

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

  private encrypt(text: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, HASHED_KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    // Format: iv:authTag:encryptedContent
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  private decrypt(content: string): string {
    const [ivHex, authTagHex, encryptedText] = content.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, HASHED_KEY, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  /**
   * Saves a user's data to their private vault.
   */
  async saveUser(regNo: string, data: any) {
    const filePath = path.join(USERS_PATH, `${regNo.toUpperCase()}.json`);
    const jsonStr = JSON.stringify(data);
    const encryptedData = this.encrypt(jsonStr);
    await fs.writeFile(filePath, encryptedData);
    console.log(`[VAULT-SECURE] Encrypted & Vaulted data for ${regNo}`);
  }

  /**
   * Saves a section's shared timetable.
   */
  async saveSection(section: string, timetable: any) {
    if (!section) return;
    const safeSection = section.replace(/[^a-z0-9]/gi, '_').toUpperCase();
    const filePath = path.join(SECTIONS_PATH, `${safeSection}.json`);
    const jsonStr = JSON.stringify(timetable);
    const encryptedData = this.encrypt(jsonStr);
    await fs.writeFile(filePath, encryptedData);
    console.log(`[VAULT-SECURE] Encrypted & Vaulted section: ${safeSection}`);
  }

  /**
   * Loads a user's data from the vault.
   */
  async getUser(regNo: string) {
    try {
      const filePath = path.join(USERS_PATH, `${regNo.toUpperCase()}.json`);
      const encryptedData = await fs.readFile(filePath, 'utf-8');
      
      // If the file is plain JSON (legacy), migrate it or just parse it
      if (encryptedData.trim().startsWith('{')) {
        console.log(`[VAULT-MIGRATE] Migrating legacy plain-text data for ${regNo}`);
        return JSON.parse(encryptedData);
      }

      const decrypted = this.decrypt(encryptedData);
      return JSON.parse(decrypted);
    } catch (err) {
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
      const encryptedData = await fs.readFile(filePath, 'utf-8');

      if (encryptedData.trim().startsWith('{')) {
        return JSON.parse(encryptedData);
      }

      const decrypted = this.decrypt(encryptedData);
      return JSON.parse(decrypted);
    } catch {
      return null;
    }
  }
}
