import axios from 'axios';
import FormData from 'form-data';

export async function solveCaptcha(base64Image: string): Promise<string> {
  try {
    const formData = new FormData();
    // Convert base64 to buffer if needed, or send as if from file
    const buffer = Buffer.from(base64Image.split(',')[1] || base64Image, 'base64');
    
    formData.append('file', buffer, {
      filename: 'captcha.png',
      contentType: 'image/png',
    });

    const rawUrl = process.env.CAPTCHA_SOLVER_URL || 'http://localhost:6000';
    const cleanUrl = rawUrl.replace(/\/$/, '');
    const targetUrl = cleanUrl.endsWith('/captcha') ? cleanUrl : `${cleanUrl}/captcha`;
    
    console.log(`DEBUG: Captcha Solver Request`);
    console.log(`DEBUG: Target URL: ${targetUrl}`);
    console.log(`DEBUG: Image Buffer Size: ${buffer.length} bytes`);
    
    const response = await axios.post(targetUrl, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 15000 // 15 second timeout for AI inference
    });

    console.log(`DEBUG: Captcha Solver Response Status: ${response.status}`);
    
    if (response.data) {
      const solution = typeof response.data === 'string' ? response.data : response.data.toString();
      const finalSolution = solution.trim();
      console.log(`DEBUG: Captcha Solver Solution: [${finalSolution}]`);
      return finalSolution;
    }
    
    throw new Error('Captcha solver returned empty response');
  } catch (error: any) {
    console.error('DEBUG: Captcha Solver FAILED');
    if (error.response) {
      console.error(`DEBUG: Error Status: ${error.response.status}`);
      console.error(`DEBUG: Error Data: ${JSON.stringify(error.response.data)}`);
    } else {
      console.error(`DEBUG: Error Message: ${error.message}`);
    }
    throw new Error('FAILED_TO_SOLVE_CAPTCHA');
  }
}
