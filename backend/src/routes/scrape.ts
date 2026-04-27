import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { PortalScraper } from '../services/portalScraper.js';
import { StorageService } from '../services/storageService.js';
import { calculateSemesterTotals } from '../services/projectionEngine.js';

const router = Router();
const scraper = PortalScraper.getInstance();
const JWT_SECRET = process.env.JWT_SECRET || 'unibuddy-secret-key';

// Middleware to validate JWT
const authenticate = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

router.post('/fetch', (req, res, next) => {
  console.log(`DEBUG: Scrape fetch request received. Headers: ${JSON.stringify(req.headers)}`);
  next();
}, authenticate, async (req, res) => {
  try {
    console.log(`Fetching data for user: ${req.user.username}`);
    
    const data = await scraper.fetchAllData();
    console.log(`Scrape complete. Attendance: ${data.attendance?.length || 0}, Timetable: ${data.timetable?.length || 0}`);
    
    // Calculate server-side projections for the whole semester
    let projections = {};
    if (data.timetable) {
      projections = calculateSemesterTotals(data.timetable, data.attendance);
    }

    const responseData = {
      ...data,
      projections,
      source: "Live Portal"
    };

    // --- VAULT INTEGRATION ---
    try {
      const storage = StorageService.getInstance();
      await storage.saveUser(req.user.username, responseData);
      console.log(`Vaulted user data for ${req.user.username}`);
      
      if (data.profile?.section) {
        await storage.saveSection(data.profile.section, data.timetable);
        console.log(`Vaulted section timetable: ${data.profile.section}`);
      }
    } catch (vErr: any) {
      console.warn("Vaulting failed, but returning data anyway:", vErr.message);
    }

    console.log(`Sending response with ${JSON.stringify(responseData).length} bytes`);
    res.json(responseData);

  } catch (error: any) {
    console.error('Scrape fetch error:', error.message);
    console.error('Scrape fetch stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch data from portal. Check if session is expired.',
      error: error.message 
    });
  }
});

router.get('/refresh', authenticate, async (req, res) => {
  // Logic to re-login or extend session
  // Usually involves calling scraper.login again with stored (but secure) creds
  // or simply notifying the frontend to re-login if needed.
  res.json({
    success: true,
    message: 'Session refresh triggered'
  });
});

export default router;
