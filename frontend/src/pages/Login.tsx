import { useState, useEffect } from "react";
import { GraduationCap, Eye, EyeOff, Lock, Hash, ArrowRight, Zap, Shield, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SwitchMode from "@/components/ui/switch-mode";
import { useToast } from "@/hooks/use-toast";
import { setStoredSession, clearStoredSession } from "@/storage.ts";

const Login = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [applicationNumber, setApplicationNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: (e.clientX / window.innerWidth) * 100, y: (e.clientY / window.innerHeight) * 100 });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);



  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      let API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
      if (!API_URL.endsWith("/api")) {
        API_URL = `${API_URL.replace(/\/$/, '')}/api`;
      }
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: applicationNumber,
          password: password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Store session
        setStoredSession({
          accessToken: data.accessToken,
          sessionId: data.sessionId,
          sessionTime: data.sessionTime,
        });
        
        // Initial fetch call could happen here or in app init
        toast({
          title: "Authenticated!",
          description: "Fetching your portal data...",
        });

        navigate("/dashboard");
      } else {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: data.message || "Invalid credentials",
        });
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Failed to connect to backend scraper. Is it running?",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuest = () => {
    clearStoredSession();
    localStorage.setItem("is-guest", "true");
    
    // Hardcode start time to 3:00 PM (15:00) 
    // Formula is: (9 + startTimeOffset + idx) => (9 + 6 + 0) = 15
    const startTimeOffset = 6;
    
    const dummyData = {
      profile: {
        name: "Ramesh Sahoo(Guest)",
        regNo: "AP22110010000",
        program: "B.Tech Computer Science",
        semester: "Semester 6",
        section: "A",
        cgpa: "9.42"
      },
      attendance: [
        { courseCode: "CSE 306", courseTitle: "Software Engineering", attendedHours: "35", totalHours: "40", odHours: "0" },
        { courseCode: "CSE 312", courseTitle: "Compiler Design", attendedHours: "20", totalHours: "30", odHours: "2" },
        { courseCode: "CSE 305", courseTitle: "Computer Networks", attendedHours: "28", totalHours: "32", odHours: "1" },
        { courseCode: "CSE 304", courseTitle: "Database Management", attendedHours: "42", totalHours: "45", odHours: "0" },
        { courseCode: "MAT 202", courseTitle: "Discrete Mathematics", attendedHours: "24", totalHours: "32", odHours: "0" },
        { courseCode: "LBA 253", courseTitle: "Professional Ethics", attendedHours: "15", totalHours: "15", odHours: "0" }
      ],
      timetable: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => ({
        day,
        startTimeOffset: startTimeOffset,
        subjects: [
          { code: "CSE 306", room: "ALC-1", faculty: "Ramesh Sahoo", isLab: false },
          { code: "CSE 312", room: "A-202", faculty: "Dr. Arun Kumar", isLab: true },
          { code: "CSE 305", room: "B-105", faculty: "Prof. Sarah", isLab: false },
          { code: "-", room: "-", faculty: "-", isLab: false },
          { code: "CSE 304", room: "ALC-2", faculty: "Dr. Manish", isLab: false },
          { code: "MAT 202", room: "C-301", faculty: "Prof. David", isLab: false }
        ]
      })),
      subjects: [],
      source: "Guest Explorer Mode",
      cgpa: "9.42",
      lastUpdated: new Date().toISOString(),
      marks: [
        { courseCode: "CSE 306", courseTitle: "Software Engineering",   ca1: 27, ca1Max: 30, ca2: 25, ca2Max: 30, cae: 44, caeMax: 50, assignment: 9,  assignmentMax: 10, total: 105, totalMax: 120, grade: "O"  },
        { courseCode: "CSE 312", courseTitle: "Compiler Design",        ca1: 19, ca1Max: 30, ca2: 22, ca2Max: 30, cae: 36, caeMax: 50, assignment: 7,  assignmentMax: 10, total: 84,  totalMax: 120, grade: "A+" },
        { courseCode: "CSE 305", courseTitle: "Computer Networks",      ca1: 24, ca1Max: 30, ca2: 26, ca2Max: 30, cae: 41, caeMax: 50, assignment: 8,  assignmentMax: 10, total: 99,  totalMax: 120, grade: "O"  },
        { courseCode: "CSE 304", courseTitle: "Database Management",    ca1: 28, ca1Max: 30, ca2: 29, ca2Max: 30, cae: 47, caeMax: 50, assignment: 10, assignmentMax: 10, total: 114, totalMax: 120, grade: "O"  },
        { courseCode: "MAT 202", courseTitle: "Discrete Mathematics",   ca1: 18, ca1Max: 30, ca2: 20, ca2Max: 30, cae: 33, caeMax: 50, assignment: 6,  assignmentMax: 10, total: 77,  totalMax: 120, grade: "A"  },
        { courseCode: "LBA 253", courseTitle: "Professional Ethics",    ca1: 29, ca1Max: 30, ca2: 28, ca2Max: 30, cae: 48, caeMax: 50, assignment: 10, assignmentMax: 10, total: 115, totalMax: 120, grade: "O"  },
      ]
    };

    localStorage.setItem('unibuddy_scraped_data', JSON.stringify(dummyData));
    localStorage.setItem('unibuddy_profile', JSON.stringify(dummyData.profile));
    navigate("/dashboard");
    toast({ title: "Logged in as Guest", description: "Showing dummy academic data." });
  };

  return (
    <div className="login-root" style={isMobile ? { overflowY: "auto", overflowX: "hidden" } : {}}>
      {/* Dynamic bg */}
      <div className="login-bg" style={{
        background: `radial-gradient(ellipse at ${mousePos.x}% ${mousePos.y}%, var(--login-glow) 0%, var(--login-glow-soft) 40%, var(--background-hex) 100%)`,
      }} />

      {/* Grid */}
      <div className="login-grid" />

      {/* Header Bar — desktop only */}
      {!isMobile && (
        <div className="login-header">
          <div className="login-logo-group">
            <div className="login-logo-icon">
              <img src="/favicon.png" alt="UB" />
            </div>
            <span className="login-logo-text">Unibuddy</span>
          </div>
          <div className="login-header-actions">
            <SwitchMode width={48} height={24} />
          </div>
        </div>
      )}

      {/* Orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* ── Layout ── */}
      <div className="login-layout" style={isMobile ? {
        flexDirection: "column",
        overflowY: "auto",
        overflowX: "hidden",
        flex: 1,
      } : {}}>

        {/* LEFT PANEL — BRANDING (desktop only) */}
        {!isMobile && (
          <div className="brand-panel">
            <div className="brand-content">
              <div className="brand-logo-wrap">
                <div className="brand-logo-ring">
                  <div className="brand-logo-inner">
                    <img src="/favicon.png" alt="Unibuddy" style={{ width: "100%", height: "100%", borderRadius: 24, objectFit: "cover", filter: "drop-shadow(0 0 12px hsl(var(--primary) / 0.6))" }} />
                  </div>
                </div>
                <div className="brand-logo-glow" />
              </div>
              <div className="brand-title-group">
                <h1 className="brand-title">Uni<span>buddy</span></h1>
                <p className="brand-tagline">SRMAP Attendance Intelligence</p>
              </div>
              <div className="brand-features">
                {[
                  { icon: <Shield size={14} />, label: "Smart bunk estimation" },
                  { icon: <Zap size={14} />, label: "Real-time class tracker" },
                  { icon: <ChevronRight size={14} />, label: "75% compliance alerts" },
                ].map(({ icon, label }) => (
                  <div className="brand-feature-item" key={label}>
                    <div className="brand-feature-icon">{icon}</div>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="brand-vline" />
          </div>
        )}

        {/* FORM PANEL */}
        <div className="form-panel" style={isMobile ? {
          width: "100%",
          padding: "0 18px 48px",
          alignItems: "stretch",
          justifyContent: "flex-start",
          overflowY: "visible",
        } : {}}>

          {/* Mobile brand section */}
          {isMobile && (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              textAlign: "center", padding: "52px 0 32px", gap: 14,
              animation: "fadeUp 0.7s cubic-bezier(0.34,1.26,0.64,1) both",
              position: "relative",
            }}>
              {/* Theme toggle top-right */}
              <div style={{ position: "absolute", top: 16, right: 0 }}>
                <SwitchMode width={48} height={24} />
              </div>

              {/* Logo */}
              <div style={{ position: "relative" }}>
                <div style={{
                  width: 86, height: 86,
                  borderRadius: 26,
                  background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent) / 0.85))",
                  padding: "3px",
                  boxShadow: "0 0 0 1px hsl(var(--primary)/0.2), 0 12px 40px hsl(var(--primary)/0.55), 0 0 80px hsl(var(--primary)/0.2)",
                }}>
                  <div style={{
                    width: "100%", height: "100%",
                    background: "hsl(var(--background))",
                    borderRadius: 23,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    overflow: "hidden",
                  }}>
                    <img src="/favicon.png" alt="Unibuddy" style={{ width: "88%", height: "88%", objectFit: "cover", borderRadius: 20 }} />
                  </div>
                </div>
                {/* Glow halo */}
                <div style={{
                  position: "absolute", inset: -20,
                  background: "radial-gradient(circle, hsl(var(--primary)/0.22) 0%, transparent 65%)",
                  borderRadius: "50%",
                  animation: "indigoPulse 3s ease-in-out infinite",
                  pointerEvents: "none",
                }} />
              </div>

              {/* Title */}
              <h1 style={{
                fontSize: 42, fontWeight: 950, letterSpacing: "-2.5px",
                lineHeight: 1, margin: 0,
                color: "hsl(var(--foreground))",
              }}>
                Uni<span style={{
                  background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>buddy</span>
              </h1>

              {/* Tagline */}
              <p style={{
                fontSize: 10, fontWeight: 700, letterSpacing: "0.16em",
                textTransform: "uppercase", margin: 0,
                color: "hsl(var(--muted-foreground))",
              }}>
                SRMAP Attendance Intelligence
              </p>
            </div>
          )}

          <div className="form-card">
            <div className="form-card-shine" />

            {/* Corner accents */}
            <div className="corner corner-tl" />
            <div className="corner corner-tr" />
            <div className="corner corner-bl" />
            <div className="corner corner-br" />

            <div className="form-header">
              <p className="form-pre">STUDENT ACCESS</p>
              <h2 className="form-title">Login</h2>
              <p className="form-sub">Use your SRMAP credentials to continue</p>
            </div>

            <form onSubmit={handleLogin} className="form-body">
              {/* Application Number */}
              <div className="field-group">
                <label className="field-label">
                  Application Number / Register Number
                </label>
                <div className={`field-wrap ${focusedField === "appnum" ? "field-active" : ""}`}>
                  <Hash size={15} className="field-icon-el" />
                  <input
                    id="login-appnum"
                    type="text"
                    placeholder="Enter your register number"
                    value={applicationNumber}
                    onChange={e => setApplicationNumber(e.target.value)}
                    onFocus={() => setFocusedField("appnum")}
                    onBlur={() => setFocusedField(null)}
                    className="field-input"
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="field-group">
                <label className="field-label">Password</label>
                <div className={`field-wrap ${focusedField === "password" ? "field-active" : ""}`}>
                  <Lock size={15} className="field-icon-el" />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    className="field-input"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    id="toggle-password-visibility"
                    className="show-pass-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Forgot */}
              <div className="forgot-row">
                <a href="#" className="forgot-link">Forgot password?</a>
              </div>

              {/* Submit */}
              <button
                id="login-submit-btn"
                type="submit"
                className={`submit-btn ${isLoading ? "loading" : ""}`}
                disabled={isLoading}
              >
                <span className="submit-btn-bg" />
                <span className="submit-btn-shimmer" />
                <span className="submit-btn-content">
                  {isLoading ? (
                    <><span className="spinner" /><span>Authenticating…</span></>
                  ) : (
                    <><span>Login</span><ArrowRight size={16} className="btn-arrow" /></>
                  )}
                </span>
              </button>
            </form>

            {/* Guest separator */}
            <div className="guest-sep">
              <span className="sep-line" />
              <span className="sep-text">just exploring?</span>
              <span className="sep-line" />
            </div>

            {/* Guest button */}
            <button
              id="guest-access-btn"
              type="button"
              className="guest-btn"
              onClick={handleGuest}
            >
              <Zap size={14} className="guest-icon" />
              Continue without login
            </button>

            {/* Footer note */}
            <div style={{ marginTop: "18px", display: "flex", flexDirection: "column", gap: "6px" }}>
              <p className="form-footer-note" style={{ marginTop: 0 }}>
                🔒 Your credentials are used only to authenticate. We don't store them.
              </p>
              <p className="form-footer-note disclaimer-text" style={{ marginTop: 0, fontSize: "9px" }}>
                Disclaimer: Not affiliated with SRMAP University. Built strictly for educational project purposes and not intended for commercial usage.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        /* ═══════════ ROOT ═══════════ */
        .login-root {
          position: fixed; inset: 0;
          display: flex; flex-direction: column;
          overflow: hidden;
          font-family: 'Inter', system-ui, sans-serif;
          background: var(--background);
          --background-hex: #0d0f17;
          --login-glow: hsl(230 70% 18% / 0.85);
          --login-glow-soft: hsl(225 50% 10% / 0.9);
          --orb-glow-1: hsl(230 80% 45% / 0.3);
          --orb-glow-2: hsl(265 70% 40% / 0.22);
          --orb-glow-3: hsl(210 60% 35% / 0.18);
          transition: background 0.4s ease;
        }

        :root:not(.dark) .login-root {
          --background-hex: #f5f7fa;
          --login-glow: hsl(230 70% 94% / 0.85);
          --login-glow-soft: hsl(220 50% 96% / 0.9);
          --orb-glow-1: hsl(230 70% 92% / 0.6);
          --orb-glow-2: hsl(265 60% 93% / 0.5);
          --orb-glow-3: hsl(210 50% 94% / 0.4);
        }

        .login-bg {
          position: absolute; inset: 0;
          transition: background 0.2s ease;
          z-index: 0;
        }

        .login-grid {
          position: absolute; inset: 0; z-index: 1;
          background-image:
            linear-gradient(var(--grid-color) 1px, transparent 1px),
            linear-gradient(90deg, var(--grid-color) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        
        .login-theme-toggle {
          position: absolute;
          top: 18px; right: 24px;
          z-index: 30;
          animation: fadeUp 0.5s 0.7s both;
        }


        /* ═══════════ ORBS ═══════════ */
        .orb {
          position: absolute; border-radius: 50%;
          filter: blur(90px); z-index: 1;
          pointer-events: none;
          animation: orbDrift 10s ease-in-out infinite;
        }

        .orb-1 {
          width: 550px; height: 550px;
          background: radial-gradient(circle, var(--orb-glow-1) 0%, transparent 70%);
          top: -20%; left: -15%;
          animation-delay: 0s;
        }

        .orb-2 {
          width: 420px; height: 420px;
          background: radial-gradient(circle, var(--orb-glow-2) 0%, transparent 70%);
          bottom: -20%; right: -10%;
          animation-delay: -4s;
        }

        .orb-3 {
          width: 280px; height: 280px;
          background: radial-gradient(circle, var(--orb-glow-3) 0%, transparent 70%);
          top: 40%; right: 20%;
          animation-delay: -7s;
        }

        @keyframes orbDrift {
          0%,100% { transform: translate(0,0) scale(1); }
          33% { transform: translate(35px,-25px) scale(1.06); }
          66% { transform: translate(-20px,18px) scale(0.95); }
        }

        /* ═══════════ FLOATING PILL ═══════════ */
        .floating-pill {
          position: absolute;
          top: 18px; left: 24px;
          z-index: 20;
          display: flex; align-items: center; gap: 8px;
          padding: 6px 14px;
          background: var(--glass-bg-strong);
          backdrop-filter: var(--glass-blur);
          border: 1px solid var(--glass-border);
          border-radius: 99px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: hsl(var(--muted-foreground));
          animation: fadeUp 0.5s 0.6s both;
        }

        .fp-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: hsl(var(--primary));
          box-shadow: 0 0 6px hsl(var(--primary) / 0.7);
          animation: indigoPulse 2s ease-in-out infinite;
        }

        @keyframes indigoPulse {
          0%,100% { opacity:1; }
          50% { opacity:0.4; }
        }

        .fp-sep { color: hsl(var(--muted-foreground) / 0.3); }
        .fp-time { color: hsl(var(--primary) / 0.6); font-family: 'JetBrains Mono', monospace; letter-spacing: 0.04em; }

        /* ═══════════ LAYOUT ═══════════ */
        .login-layout {
          position: relative; z-index: 10;
          flex: 1;
          display: flex;
          overflow: hidden;
        }

        /* ═══════════ BRAND PANEL ═══════════ */
        .brand-panel {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          position: relative;
        }

        .brand-content {
          max-width: 360px;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        /* Logo */
        .brand-logo-wrap { position: relative; width: fit-content; }

        .brand-logo-ring {
          width: 88px; height: 88px;
          border-radius: 26px;
          background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent) / 0.8));
          padding: 2.5px;
          box-shadow:
            0 0 0 1px hsl(var(--primary) / 0.2),
            0 8px 32px hsl(var(--primary) / 0.4),
            0 0 60px hsl(var(--primary) / 0.1);
        }

        .brand-logo-inner {
          width: 100%; height: 100%;
          background: var(--background);
          border-radius: 24px;
          display: flex; align-items: center; justify-content: center;
          backdrop-filter: blur(10px);
        }

        .brand-logo-glow {
          position: absolute; inset: -16px;
          background: radial-gradient(circle, hsl(var(--primary) / 0.2) 0%, transparent 65%);
          border-radius: 50%;
          animation: indigoPulse 3s ease-in-out infinite;
          pointer-events: none;
        }

        /* Title */
        .brand-title-group { display: flex; flex-direction: column; gap: 6px; }

        /* --- NEW HEADER --- */
        .login-header {
          position: fixed; top: 0; left: 0; right: 0;
          height: 70px; padding: 0 24px;
          display: flex; align-items: center; justify-content: space-between;
          z-index: 100;
        }

        .login-logo-group { display: flex; align-items: center; gap: 10px; }
        .login-logo-icon { width: 32px; height: 32px; border-radius: 9px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
        .login-logo-icon img { width: 100%; height: 100%; object-fit: cover; }
        .login-logo-text { font-size: 17px; font-weight: 900; color: hsl(var(--foreground)); letter-spacing: -0.02em; }

        .brand-title {
          font-size: 44px; font-weight: 950;
          color: hsl(var(--foreground));
          letter-spacing: -2.5px;
          line-height: 1;
          margin: 0;
        }

        .brand-title span {
          background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .brand-tagline {
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.12em;
          color: hsl(var(--muted-foreground));
          text-transform: uppercase;
          margin: 0;
        }

        /* Features */
        .brand-features { display: flex; flex-direction: column; gap: 12px; }

        .brand-feature-item {
          display: flex; align-items: center; gap: 12px;
          font-size: 13px; font-weight: 500;
          color: hsl(var(--foreground) / 0.7);
        }

        .brand-feature-icon {
          width: 28px; height: 28px;
          border-radius: 8px;
          background: hsl(var(--primary) / 0.1);
          border: 1px solid hsl(var(--primary) / 0.2);
          display: flex; align-items: center; justify-content: center;
          color: hsl(var(--primary));
          flex-shrink: 0;
        }

        /* Date */
        .brand-date {
          padding: 14px 18px;
          background: hsl(var(--primary) / 0.05);
          border: 1px solid hsl(var(--primary) / 0.15);
          border-radius: 14px;
          display: flex; flex-direction: column; gap: 2px;
          width: fit-content;
        }

        .brand-date-time {
          display: block;
          font-size: 30px; font-weight: 900;
          font-family: 'JetBrains Mono', monospace;
          color: hsl(var(--primary));
          letter-spacing: 0.05em;
          line-height: 1;
        }

        .brand-date-label {
          display: block;
          font-size: 11px; font-weight: 600;
          color: hsl(var(--muted-foreground));
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        /* Vertical divider */
        .brand-vline {
          position: absolute; top: 10%; bottom: 10%;
          right: 0; width: 1px;
          background: linear-gradient(to bottom,
            transparent,
            hsl(var(--primary) / 0.25) 30%,
            hsl(var(--primary) / 0.25) 70%,
            transparent
          );
        }

        /* ═══════════ FORM PANEL ═══════════ */
        .form-panel {
          width: 480px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          padding: 32px 36px;
          overflow-y: auto;
        }

        .form-card {
          position: relative;
          width: 100%;
          background: var(--glass-bg-strong);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          border: 1px solid var(--glass-border-red);
          border-radius: 26px;
          padding: 40px 36px 32px;
          box-shadow: var(--shadow-card);
          animation: cardIn 0.7s cubic-bezier(0.34,1.56,0.64,1) both;
          overflow: hidden;
        }

        @keyframes cardIn {
          from { opacity:0; transform: translateY(20px) scale(0.98); }
          to   { opacity:1; transform: translateY(0) scale(1); }
        }

        /* Shine */
        .form-card-shine {
          position: absolute; top:-50%; left:-50%;
          width:200%; height:200%;
          background: conic-gradient(
            from 0deg at 50% 50%,
            transparent 0deg,
            rgba(99,102,241,0.03) 60deg,
            rgba(129,140,248,0.05) 90deg,
            rgba(99,102,241,0.02) 120deg,
            transparent 200deg
          );
          animation: shineRot 8s linear infinite;
          pointer-events: none;
        }

        @keyframes shineRot {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        /* Corner accents */
        .corner {
          position: absolute; width: 20px; height: 20px;
          border-color: hsl(var(--primary) / 0.4);
          border-style: solid;
        }

        .corner-tl { top: 14px; left: 14px; border-width: 1.5px 0 0 1.5px; border-radius: 4px 0 0 0; }
        .corner-tr { top: 14px; right: 14px; border-width: 1.5px 1.5px 0 0; border-radius: 0 4px 0 0; }
        .corner-bl { bottom: 14px; left: 14px; border-width: 0 0 1.5px 1.5px; border-radius: 0 0 0 4px; }
        .corner-br { bottom: 14px; right: 14px; border-width: 0 1.5px 1.5px 0; border-radius: 0 0 4px 0; }

        /* Form header */
        .form-header {
          margin-bottom: 30px;
          animation: fadeUp 0.5s 0.1s both;
        }

        .form-pre {
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.14em;
          color: hsl(var(--primary));
          text-transform: uppercase;
          margin: 0 0 8px;
          display: flex; align-items: center; gap: 6px;
        }

        .form-pre::before {
          content: '';
          width: 20px; height: 1.5px;
          background: hsl(var(--primary));
          display: inline-block;
        }

        .form-title {
          font-size: 30px; font-weight: 900;
          color: hsl(var(--foreground));
          letter-spacing: -0.5px;
          margin: 0 0 6px;
        }

        .form-sub {
          font-size: 13px;
          color: hsl(var(--muted-foreground));
          margin: 0;
        }

        /* Form body */
        .form-body {
          display: flex; flex-direction: column; gap: 16px;
          animation: fadeUp 0.5s 0.18s both;
        }

        .field-group { display: flex; flex-direction: column; gap: 7px; }

        .field-label {
          font-size: 12px; font-weight: 700;
          color: hsl(var(--foreground) / 0.7);
          letter-spacing: 0.01em;
        }

        .field-wrap {
          display: flex; align-items: center;
          background: var(--muted);
          border: 1px solid var(--border);
          border-radius: 13px;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          overflow: hidden;
        }

        .field-wrap.field-active {
          background: hsl(var(--primary) / 0.07);
          border-color: hsl(var(--primary) / 0.50);
          box-shadow: 0 0 0 3px hsl(var(--primary) / 0.10), 0 2px 12px rgba(0,0,0,0.2);
        }

        .field-icon-el {
          flex-shrink: 0;
          padding: 0 12px 0 16px;
          color: hsl(var(--muted-foreground) / 0.4);
          transition: color 0.2s;
        }

        .field-active .field-icon-el { color: hsl(var(--primary)); }

        .field-input {
          flex: 1;
          background: transparent; border: none; outline: none;
          padding: 14px 0;
          font-size: 14px; font-weight: 500;
          color: hsl(var(--foreground));
          font-family: inherit;
          caret-color: hsl(var(--primary));
          min-width: 0;
        }

        .field-input::placeholder { color: hsl(var(--muted-foreground) / 0.5); font-weight: 400; }

        .show-pass-btn {
          background: none; border: none; cursor: pointer;
          padding: 0 14px;
          color: hsl(var(--muted-foreground) / 0.5);
          display: flex; align-items: center;
          transition: color 0.2s; flex-shrink: 0;
        }

        .show-pass-btn:hover { color: hsl(var(--foreground) / 0.7); }

        /* Forgot */
        .forgot-row { display: flex; justify-content: flex-end; margin-top: -4px; }

        .forgot-link {
          font-size: 12px; color: hsl(var(--primary));
          text-decoration: none; font-weight: 600;
          opacity: 0.8; transition: opacity 0.2s;
        }

        .forgot-link:hover { opacity: 1; }

        /* Submit */
        .submit-btn {
          position: relative; width: 100%; padding: 15px;
          border: none; border-radius: 14px;
          cursor: pointer; font-family: inherit;
          font-size: 15px; font-weight: 800;
          color: white; letter-spacing: 0.02em;
          overflow: hidden; margin-top: 4px;
          transition: transform 0.15s, box-shadow 0.2s;
        }

        .submit-btn-bg {
          position: absolute; inset: 0;
          background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)));
          background-size: 200% 200%;
          animation: gradientShift 3s ease infinite;
          z-index: 0;
        }

        .submit-btn-shimmer {
          position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
          transform: translateX(-100%);
          z-index: 1;
        }

        .submit-btn:not(.loading):hover .submit-btn-shimmer {
          animation: shimmerSlide 0.5s ease forwards;
        }

        @keyframes shimmerSlide {
          from { transform: translateX(-100%); }
          to   { transform: translateX(100%); }
        }

        .submit-btn-content {
          position: relative; z-index: 2;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }

        .submit-btn:not(.loading):hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 28px hsl(var(--primary) / 0.4), 0 0 40px hsl(var(--primary) / 0.2);
        }

        .submit-btn:not(.loading):active { transform: translateY(0); }
        .submit-btn.loading { cursor: not-allowed; opacity: 0.8; }

        .btn-arrow { transition: transform 0.2s; }
        .submit-btn:not(.loading):hover .btn-arrow { transform: translateX(3px); }

        .spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        /* Guest */
        .guest-sep {
          display: flex; align-items: center; gap: 10px;
          margin: 22px 0 16px;
          animation: fadeUp 0.5s 0.35s both;
        }

        .sep-line { flex:1; height:1px; background: var(--border); }
        .sep-text { font-size: 11px; color: hsl(var(--muted-foreground)); white-space: nowrap; font-weight: 500; }

        .guest-btn {
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 7px;
          padding: 13px; background: transparent;
          border: 1.5px dashed hsl(var(--primary) / 0.28);
          border-radius: 13px;
          font-family: inherit; font-size: 13.5px; font-weight: 600;
          color: hsl(var(--foreground) / 0.4); cursor: pointer;
          transition: all 0.2s;
          animation: fadeUp 0.5s 0.4s both;
        }

        .guest-btn:hover {
          background: hsl(var(--primary) / 0.07);
          border-color: hsl(var(--primary) / 0.50);
          color: hsl(var(--foreground) / 0.8);
          transform: translateY(-1px);
        }

        .guest-icon { color: hsl(var(--primary)); transition: transform 0.2s; }
        .guest-btn:hover .guest-icon { transform: scale(1.2); }

        /* Footer note */
        .form-footer-note {
          text-align: center;
          font-size: 11px; color: hsl(var(--muted-foreground) / 0.5);
          margin-top: 18px;
          animation: fadeUp 0.5s 0.45s both;
          line-height: 1.5;
        }

        @keyframes fadeUp {
          from { opacity:0; transform: translateY(10px); }
          to   { opacity:1; transform: translateY(0); }
        }

        /* Light Theme Contrast Overrides */
        html:not(.dark) .form-footer-note,
        html:not(.dark) .disclaimer-text,
        html:not(.dark) .brand-tagline,
        html:not(.dark) .sep-text,
        html:not(.dark) .guest-btn,
        html:not(.dark) .floating-pill,
        html:not(.dark) .form-sub,
        html:not(.dark) .field-label {
          color: #000000 !important;
          opacity: 1 !important;
        }

        /* ═══════════ MOBILE BRAND (desktop: hidden) ═══════════ */
        .login-mobile-brand { display: none; }

        /* ═══════════ RESPONSIVE — MOBILE ═══════════ */
        @media (max-width: 768px) {
          /* Allow vertical scroll on mobile */
          .login-root   { overflow-y: auto; overflow-x: hidden; }

          /* Hide the desktop header bar & brand panel */
          .login-header { display: none; }
          .brand-panel  { display: none; }
          .brand-vline  { display: none; }

          /* Full-height single-column layout */
          .login-layout {
            flex-direction: column;
            justify-content: flex-start;
            overflow: visible;
          }

          /* Form panel fills screen */
          .form-panel {
            width: 100%;
            padding: 0 16px 40px;
            align-items: stretch;
            justify-content: flex-start;
            overflow-y: visible;
          }

          /* Show mobile brand block */
          .login-mobile-brand {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            padding: 52px 0 32px;
            gap: 14px;
            animation: fadeUp 0.7s cubic-bezier(0.34, 1.26, 0.64, 1) both;
            position: relative;
          }

          .login-mb-logo-wrap {
            position: relative;
            width: fit-content;
          }

          .login-mb-logo-ring {
            width: 82px; height: 82px;
            border-radius: 24px;
            background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent) / 0.85));
            padding: 3px;
            box-shadow:
              0 0 0 1px hsl(var(--primary) / 0.2),
              0 10px 36px hsl(var(--primary) / 0.55),
              0 0 70px hsl(var(--primary) / 0.18);
          }

          .login-mb-logo-inner {
            width: 100%; height: 100%;
            background: hsl(225 25% 7%);
            border-radius: 21px;
            display: flex; align-items: center; justify-content: center;
            overflow: hidden;
          }

          .login-mb-logo-glow {
            position: absolute; inset: -22px;
            background: radial-gradient(circle, hsl(var(--primary) / 0.22) 0%, transparent 65%);
            border-radius: 50%;
            animation: indigoPulse 3s ease-in-out infinite;
            pointer-events: none;
          }

          .login-mb-title {
            font-size: 40px; font-weight: 950;
            color: hsl(var(--foreground));
            letter-spacing: -2.5px; line-height: 1;
            margin: 0;
          }

          .login-mb-title span {
            background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .login-mb-tagline {
            font-size: 10px; font-weight: 700;
            letter-spacing: 0.15em; text-transform: uppercase;
            color: hsl(var(--muted-foreground));
            margin: 0;
          }

          /* Form card */
          .form-card {
            padding: 28px 22px 26px;
            border-radius: 24px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.38);
          }

          .form-title { font-size: 26px; }
          .form-sub   { font-size: 12px; }
          .corner     { display: none; }
          .submit-btn { padding: 14px; font-size: 14px; }
          .field-input { font-size: 16px; /* prevent iOS zoom */ }
        }

        @media (max-height: 700px) and (max-width: 768px) {
          .login-mobile-brand { padding: 32px 0 22px; }
          .form-header { margin-bottom: 20px; }
          .form-body   { gap: 12px; }
          .guest-sep   { margin: 14px 0 10px; }
        }
      `}</style>
    </div>
  );
};

export default Login;
