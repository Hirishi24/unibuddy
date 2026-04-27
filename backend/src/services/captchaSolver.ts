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

    const solverUrl = process.env.CAPTCHA_SOLVER_URL || 'http://localhost:6006';
    console.log(`Calling captcha solver at: ${solverUrl}/captcha`);
    const response = await axios.post(`${solverUrl}/captcha`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });

    if (response.data) {
      // response.data is the string from PlainTextResponse
      const solution = typeof response.data === 'string' ? response.data : response.data.toString();
      return solution.trim();
    }
    
    throw new Error('Captcha solver returned empty response');
  } catch (error: any) {
    console.error('Captcha solving failed:', error.message);
    throw new Error('FAILED_TO_SOLVE_CAPTCHA');
  }
}
