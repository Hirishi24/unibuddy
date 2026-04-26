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
    const postPage = async (id: string) => {
      // 1. "Warm Up" the specific report session by hitting the resource dispatcher
      await this.client.get(`/students/report/studentreportresources.jsp?ids=${id}`, {
        headers: { "Cookie": `JSESSIONID=${this.jsessionid}` }
      });

      // 2. Perform the actual POST fetch
      return this.client.post(
        "/students/report/studentreportresources.jsp",
        new URLSearchParams({ ids: id }).toString(),
        { 
            headers: { 
                "Content-Type": "application/x-www-form-urlencoded",
                "Cookie": `JSESSIONID=${this.jsessionid}`,
                "X-Requested-With": "XMLHttpRequest",
                "Referer": "https://student.srmap.edu.in/srmapstudentcorner/HRDSystem"
            } 
        }
      );
    };

    console.log("Starting parallel data fetch with session warming...");
    const fetchStart = Date.now();

    const [resAttendance, resTimetable, resProfile, resDashboard] = await Promise.all([
        postPage("3"),
        postPage("10"),
        postPage("1"),
        this.client.get('/HRDSystem', { headers: { 'Cookie': `JSESSIONID=${this.jsessionid}` } }),
    ]);

    // Validation: If any response looks like a login page, the session is dead
    if (resAttendance.data.includes("txtUserName") || resAttendance.data.includes("Login")) {
      console.error("FAIL: Session expired during fetch. Data is invalid.");
      throw new Error("SESSION_EXPIRED");
    }

    const fetchEnd = Date.now();
    console.log(`All data components received in ${((fetchEnd - fetchStart) / 1000).toFixed(2)}s.`);



    console.log("Parsing Attendance...");
    const $attendance = cheerio.load(resAttendance.data);
    const attendance: any[] = [];
    
    // Find the right table (it might not have an ID in AJAX responses)
    let $table = $attendance("table#tblSubjectWiseAttendance");
    if ($table.length === 0) {
      $table = $attendance("table").filter((_, el) => $attendance(el).text().includes("Course Code"));
    }

    // FIXED INDICES based on portal screenshot
    const codeIdx = 0;
    const titleIdx = 1;
    const totalIdx = 2;   // Classes Conducted
    const presentIdx = 3; // Present(P)
    const absentIdx = 4; // Absent(A)
    const odIdx = 5;     // OD/ML Taken
    const pctIdx = 8;    // Attendance %


    $table.find("tr").each((i, row) => {
      const td = $attendance(row).find("td");
      // Check for a data row (usually has the subject code)
      if (td.length >= 8 && !td.eq(codeIdx).text().includes("Subject Code")) {
        const rowData = td.map((_, el) => $attendance(el).text().trim()).get();
        
        const totalVal = parseInt(rowData[totalIdx]) || 0;
        const attendedVal = parseInt(rowData[presentIdx]) || 0;
        const absentVal = parseInt(rowData[absentIdx]) || 0;
        const odVal = parseInt(rowData[odIdx]) || 0;
        const percentageVal = parseFloat(rowData[pctIdx]) || 0;

        // Smart Room Detection (Checking all columns for room-like codes)
        const roomRegex = /\b(ALC|S\d{3}|F\d{3}|G\d{3}|E\d{3}|M\d{3}|AUDI|CL-\d|LAB-\d)\b/i;
        let detectedRoom = "TBA";
        for (const cell of rowData) {
          const match = cell.match(roomRegex);
          if (match) { detectedRoom = match[0]; break; }
        }

        attendance.push({
          courseCode: rowData[codeIdx],
          courseTitle: rowData[titleIdx],
          faculty: "Portal Faculty", 
          totalHours: totalVal,
          attendedHours: attendedVal,
          odHours: odVal,
          room: detectedRoom, 
          percentage: percentageVal,
          allColumns: rowData 
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
    let lastDay = "";

    $timetable("tr").slice(2).each((i, row) => {
      const td = $timetable(row).find("td");
      if (td.length > 3) {
        // Find which column contains the day name (e.g., "Mon" or "Monday")
        let dayIndex = -1;
        const dayPatterns = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
        for (let j = 0; j < 3; j++) {
           const text = td.eq(j).text().trim().toLowerCase();
           if (dayPatterns.some(p => text.startsWith(p))) {
             dayIndex = j;
             break;
           }
        }

        let day = lastDay;
        let subjectsStartIndex = 0;

        if (dayIndex !== -1) {
          day = td.eq(dayIndex).text().trim();
          lastDay = day;
          subjectsStartIndex = dayIndex + 1;
        } else {
          // If no day name found, it might be an afternoon row for the lastDay
          // In this case, the subjects usually start from index 1 or 2
          // We'll check for cells that have content
          subjectsStartIndex = 1; 
        }

        if (day) {
          const subjects: any[] = [];
          td.slice(subjectsStartIndex).each((_, el) => {

            const $cell = $timetable(el);
            const raw = $cell.text().trim();
            const colSpan = parseInt($cell.attr("colspan") || "1");
            
            for (let c = 0; c < colSpan; c++) {
              if (!raw || raw === "-" || raw.length < 3) {
                subjects.push(null);
              } else {
                const parts = raw.split(/[\n/|]/).map(p => p.trim()).filter(Boolean);
                subjects.push({
                  raw: raw,
                  code: parts[0],
                  room: parts[1] || "TBA",
                  faculty: parts[2] || "TBA"
                });
              }
            }
          });

          // If dayIndex is -1, it's an afternoon row, so we start after slot 4
          const startTimeOffset = dayIndex === -1 ? 4 : 0;
          timetable.push({ day, subjects, startTimeOffset });
        }

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
