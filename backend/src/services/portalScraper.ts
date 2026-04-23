import axios, { AxiosInstance } from 'axios';
import * as cheerio from 'cheerio';
import { solveCaptcha } from './captchaSolver.js';

export interface ScrapeResult {
  profile: any;
  attendance: any[];
  timetable: any[];
  subjects: any[];
  cgpa: any;
  source: "Live Portal" | "Local Cache";
}

export class PortalScraper {
  private static instance: PortalScraper;
  private client: AxiosInstance;
  private jsessionid: string = '';
  private baseURL: string = 'https://student.srmap.edu.in/srmapstudentcorner';
  private keepAliveInterval: any = null;

  public static getInstance(): PortalScraper {
    if (!PortalScraper.instance) {
      PortalScraper.instance = new PortalScraper();
    }
    return PortalScraper.instance;
  }

  constructor() {
    this.client = axios.create({
      baseURL: this.baseURL,
      withCredentials: true,
      headers: {
        "Host": "student.srmap.edu.in",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1"
      }
    });
  }

  private startKeepAlive() {
    if (this.keepAliveInterval) clearInterval(this.keepAliveInterval);
    
    console.log("BEAT: Starting Session Heartbeat (2 min intervals)");
    this.keepAliveInterval = setInterval(async () => {
      if (!this.jsessionid) return;
      try {
        await this.client.get('/HRDSystem', {
          headers: { 'Cookie': `JSESSIONID=${this.jsessionid}` }
        });
        console.log(`BEAT: Portal session kept alive at ${new Date().toLocaleTimeString()}`);
      } catch (err: any) {
        console.warn("BEAT: Keep-alive ping failed. Session might be lost.");
      }
    }, 2 * 60 * 1000); // 2 minutes
  }

  public stopKeepAlive() {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
      console.log("BEAT: Session Heartbeat stopped.");
    }
  }

  async login(username: string, password: string): Promise<{ sessionId: string }> {
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      attempts++;
      try {
        console.log(`\n--- SRM AP Login Attempt ${attempts} ---`);
        
        // 1. Initial hit to set cookies
        const loginPage = await this.client.get('/StudentLoginPage');
        const setCookie = loginPage.headers['set-cookie'];
        if (setCookie) {
          this.jsessionid = setCookie[0].split(';')[0].split('=')[1];
        }
        console.log(`Step 1: JSessionID established`);

        // 2. Fetch captcha
        console.log(`Step 2: Fetching captcha image...`);
        const captchaRes = await this.client.get('/captchas', {
          responseType: 'arraybuffer',
          headers: { 'Cookie': `JSESSIONID=${this.jsessionid}` }
        });
        const captchaBase64 = Buffer.from(captchaRes.data, 'binary').toString('base64');

        // 3. Solve captcha
        console.log(`Step 3: Solving captcha...`);
        const captchaSolution = await solveCaptcha(captchaBase64).catch(err => {
          console.error("Captcha solver error:", err.message);
          return null;
        });

        if (!captchaSolution) {
          console.warn("Retrying due to captcha solving issue...");
          continue;
        }
        console.log(`Captcha solution: ${captchaSolution}`);

        // 4. Submit login payload
        // The SRM AP portal uses txtUserName, txtAuthKey, and ccode
        const payload = new URLSearchParams({
          'txtUserName': username,
          'txtAuthKey': password,
          'ccode': captchaSolution.trim().toUpperCase()
        });

        console.log(`Step 4: Submitting credentials to /StudentLoginToPortal`);
        const loginRes = await this.client.post('/StudentLoginToPortal', payload.toString(), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': `JSESSIONID=${this.jsessionid}`,
            'Origin': 'https://student.srmap.edu.in',
            'Referer': 'https://student.srmap.edu.in/srmapstudentcorner/StudentLoginPage'
          },
          maxRedirects: 0,
          validateStatus: (status) => status >= 200 && status < 400,
        });

        // 5. Verify success (check for JSESSIONID update or Logout in body)
        const postLoginCookies = loginRes.headers['set-cookie'];
        if (postLoginCookies) {
          const sidMatch = postLoginCookies.find(c => c.includes('JSESSIONID'));
          if (sidMatch) {
            this.jsessionid = sidMatch.split(';')[0].split('=')[1];
          }
        }

        // Check if we are logged in by hitting the HRDSystem page
        const dashboard = await this.client.get('/HRDSystem', {
          headers: { 'Cookie': `JSESSIONID=${this.jsessionid}` }
        });

        if (dashboard.data.includes('Logout')) {
          console.log("SUCCESS: Login successful and verified via dashboard!");
          this.startKeepAlive();
          return { sessionId: this.jsessionid };
        } else {
          console.warn(`Attempt ${attempts} failed: Invalid credentials or incorrect captcha.`);
        }
      } catch (error: any) {
        console.error(`Attempt ${attempts} failed: ${error.message}`);
      }
    }

    throw new Error('MAX_LOGIN_ATTEMPTS_REACHED');
  }

  async fetchAllData(): Promise<Omit<ScrapeResult, 'source'>> {
    const postPage = (id: string) =>
      this.client.post(
        "/students/report/studentreportresources.jsp",
        new URLSearchParams({ ids: id }).toString(),
        { 
            headers: { 
                "Content-Type": "application/x-www-form-urlencoded",
                "Cookie": `JSESSIONID=${this.jsessionid}`,
                "X-Requested-With": "XMLHttpRequest",
                "Referer": `${this.baseURL}/HRDSystem`
            } 
        }
      );

    console.log("Starting parallel data fetch...");
    const fetchStart = Date.now();

    const [resAttendance, resTimetable, resProfile, resDashboard] = await Promise.all([
        postPage("3").then(r => { console.log("✅ Attendance data received"); return r; }),
        postPage("10").then(r => { console.log("✅ Timetable data received"); return r; }),
        postPage("1").then(r => { console.log("✅ Profile data received"); return r; }),
        this.client.get('/HRDSystem', { headers: { 'Cookie': `JSESSIONID=${this.jsessionid}` } }).then(r => { console.log("✅ Dashboard data received"); return r; }),
    ]);

    const fetchEnd = Date.now();
    console.log(`All data components received in ${((fetchEnd - fetchStart) / 1000).toFixed(2)}s. Starting parse...`);


    console.log("Parsing Attendance...");
    const $attendance = cheerio.load(resAttendance.data);
    const attendance: any[] = [];
    
    // Find the right table (it might not have an ID in AJAX responses)
    let $table = $attendance("table#tblSubjectWiseAttendance");
    if ($table.length === 0) {
      $table = $attendance("table").filter((_, el) => $attendance(el).text().includes("Course Code"));
    }

    $table.find("tr").each((i, row) => {
      const td = $attendance(row).find("td");
      // Header or empty row check
      if (td.length >= 8 && !td.eq(0).text().includes("Course Code")) {
        attendance.push({
          courseCode: td.eq(0).text().trim(),
          courseTitle: td.eq(1).text().trim(),
          totalHours: parseInt(td.eq(2).text().trim()) || 0,
          attendedHours: parseInt(td.eq(3).text().trim()) || 0,
          percentage: parseFloat(td.eq(td.length - 1).text().trim()) || 0,
        });
      }
    });
    console.log(`Parsed ${attendance.length} attendance records`);

    console.log("Parsing Profile...");
    const $profile = cheerio.load(resProfile.data);
    const profile: any = {};
    $profile("table.table-striped tr").each((_, row) => {
      const td = $profile(row).find("td");
      if (td.length === 3) {
        const key = td.eq(0).text().trim();
        const val = td.eq(2).text().trim();
        
        if (/Student Name/i.test(key)) profile.name = val;
        else if (/Register No/i.test(key)) profile.regNo = val;
        else if (/Institution/i.test(key)) profile.institution = val;
        else if (/Semester/i.test(key)) profile.semester = val;
        else if (/Program \/ Section/i.test(key)) {
          const [program, section] = val.split("/").map(v => v.trim());
          profile.program = program;
          profile.section = section?.replace(/['"]+/g, "");
        }
      }
    });

    // Profile Picture (extracted from the raw HTML of the main portal page)
    const picMatch = resDashboard.data.match(/<div class="profile_pic">[\s\S]*?<img src="([^"]+)"/i);
    if (picMatch) {
      profile.picture = `https://student.srmap.edu.in${picMatch[1]}`;
    }

    console.log("Profile parsed");

    console.log("Parsing Timetable...");
    const $timetable = cheerio.load(resTimetable.data);
    const timetable: any[] = [];
    $timetable("tr").slice(2).each((i, row) => {
      const td = $timetable(row).find("td");
      if (td.length > 1) {
        timetable.push({
          day: td.eq(0).text().trim(),
          subjects: td.slice(1).map((_, el) => $timetable(el).text().trim()).get()
        });
      }
    });
    console.log(`Parsed ${timetable.length} timetable days`);

    return {
      profile,
      attendance,
      timetable,
      subjects: attendance.map(a => ({ code: a.courseCode, title: a.courseTitle })),
    };
  }
}
