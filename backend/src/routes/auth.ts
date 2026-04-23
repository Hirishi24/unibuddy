import { Router } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { PortalScraper } from '../services/portalScraper.js';

const router = Router();
const scraper = PortalScraper.getInstance();
const JWT_SECRET = process.env.JWT_SECRET || 'unibuddy-secret-key';

const LoginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = LoginSchema.parse(req.body);

    console.log(`Login attempt for user: ${username}`);
    const { sessionId } = await scraper.login(username, password);

    // Generate JWT for the frontend to use in subsequent requests
    const accessToken = jwt.sign(
      { username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      accessToken,
      sessionId,
      sessionTime: new Date().toISOString(),
      message: 'Login successful'
    });

  } catch (error: any) {
    console.error('Login route error:', error.message);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Invalid input fields' });
    }

    if (error.message === 'MAX_LOGIN_ATTEMPTS_REACHED') {
      return res.status(401).json({ success: false, message: 'Portal login failed after multiple attempts (check credentials or captcha)' });
    }

    res.status(500).json({ success: false, message: 'Internal server error during authentication' });
  }
});

export default router;
