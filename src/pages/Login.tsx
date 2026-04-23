import { useState, useEffect } from "react";
import { GraduationCap, Eye, EyeOff, Lock, Hash, ArrowRight, Zap, Shield, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SwitchMode from "@/components/ui/switch-mode";
import { useToast } from "@/hooks/use-toast";
import { setStoredSession, clearStoredSession } from "@/lib/storage";

const Login = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [applicationNumber, setApplicationNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: (e.clientX / window.innerWidth) * 100, y: (e.clientY / window.innerHeight) * 100 });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch("http://localhost:3001/api/auth/login", {
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

        navigate("/");
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
    navigate("/");
  };

  const pad = (n: number) => String(n).padStart(2, "0");
  const timeStr = `${pad(time.getHours())}:${pad(time.getMinutes())}:${pad(time.getSeconds())}`;
  const dateStr = time.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="login-root">
      {/* Dynamic bg */}
      <div className="login-bg" style={{
        background: `radial-gradient(ellipse at ${mousePos.x}% ${mousePos.y}%, var(--login-glow) 0%, var(--login-glow-soft) 40%, var(--background-hex) 100%)`,
      }} />

      {/* Grid */}
      <div className="login-grid" />

      {/* Theme toggle (Top Right) */}
      <div className="login-theme-toggle">
        <SwitchMode width={52} height={26} />
      </div>

      {/* Scanline effect */}
      <div className="scanline" />

      {/* Orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* ── Floating brand pill (replaces top bar) ── */}
      <div className="floating-pill">
        <div className="fp-dot" />
        <span>UNIBUDDY</span>
        <span className="fp-sep">·</span>
        <span className="fp-time">{timeStr}</span>
      </div>

      {/* ── Split layout ── */}
      <div className="login-layout">

        {/* LEFT PANEL — BRANDING */}
        <div className="brand-panel">
          <div className="brand-content">
            {/* Logo */}
            <div className="brand-logo-wrap">
              <div className="brand-logo-ring">
                <div className="brand-logo-inner">
                  <GraduationCap size={36} style={{ color: "white", filter: "drop-shadow(0 0 12px hsl(var(--primary) / 0.6))" }} />
                </div>
              </div>
              <div className="brand-logo-glow" />
            </div>

            <div className="brand-title-group">
              <h1 className="brand-title">Uni<span>buddy</span></h1>
              <p className="brand-tagline">SRMAP Attendance Intelligence</p>
            </div>

            {/* Feature bullets */}
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

            {/* Date display */}
            <div className="brand-date">
              <div className="brand-date-inner">
                <span className="brand-date-time">{timeStr}</span>
                <span className="brand-date-label">{dateStr}</span>
              </div>
            </div>
          </div>

          {/* Decorative vertical line */}
          <div className="brand-vline" />
        </div>

        {/* RIGHT PANEL — FORM */}
        <div className="form-panel">
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
            <p className="form-footer-note">
              🔒 Your credentials are used only to authenticate. We don't store them.
            </p>
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
          --background-hex: #0a0a0a;
          --login-glow: hsl(0 85% 18% / 0.85);
          --login-glow-soft: hsl(0 70% 10% / 0.9);
          --orb-glow-1: hsl(0 90% 40% / 0.35);
          --orb-glow-2: hsl(0 75% 30% / 0.28);
          --orb-glow-3: hsl(15 80% 35% / 0.22);
          transition: background 0.4s ease;
        }

        :root:not(.dark) .login-root {
          --background-hex: #f8f9fa;
          --login-glow: hsl(0 85% 90% / 0.85);
          --login-glow-soft: hsl(0 70% 95% / 0.9);
          --orb-glow-1: hsl(0 80% 90% / 0.6);
          --orb-glow-2: hsl(15 70% 92% / 0.5);
          --orb-glow-3: hsl(0 60% 94% / 0.4);
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

        .scanline {
          position: absolute; top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, hsl(var(--primary) / 0.18), transparent);
          z-index: 2;
          animation: scanMove 6s linear infinite;
          pointer-events: none;
        }

        @keyframes scanMove {
          from { top: -2px; }
          to   { top: 100%; }
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
          animation: redPulseAlt 2s ease-in-out infinite;
        }

        @keyframes redPulseAlt {
          0%,100% { opacity:1; }
          50% { opacity:0.4; }
        }

        .fp-sep { color: rgba(255,255,255,0.12); }
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
          animation: redPulseAlt 3s ease-in-out infinite;
          pointer-events: none;
        }

        /* Title */
        .brand-title-group { display: flex; flex-direction: column; gap: 6px; }

        .brand-title {
          font-size: 48px; font-weight: 900;
          color: hsl(var(--foreground));
          letter-spacing: -2px;
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
          from { opacity:0; transform: translateX(30px) scale(0.96); }
          to   { opacity:1; transform: translateX(0) scale(1); }
        }

        /* Shine */
        .form-card-shine {
          position: absolute; top:-50%; left:-50%;
          width:200%; height:200%;
          background: conic-gradient(
            from 0deg at 50% 50%,
            transparent 0deg,
            rgba(255,80,80,0.03) 60deg,
            rgba(255,80,80,0.06) 90deg,
            rgba(255,80,80,0.02) 120deg,
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
          color: rgba(255,255,255,0.3);
          display: flex; align-items: center;
          transition: color 0.2s; flex-shrink: 0;
        }

        .show-pass-btn:hover { color: rgba(255,255,255,0.65); }

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
          font-size: 11px; color: rgba(255,255,255,0.20);
          margin-top: 18px;
          animation: fadeUp 0.5s 0.45s both;
          line-height: 1.5;
        }

        @keyframes fadeUp {
          from { opacity:0; transform: translateY(10px); }
          to   { opacity:1; transform: translateY(0); }
        }

        /* ═══════════ RESPONSIVE ═══════════ */
        @media (max-width: 768px) {
          .brand-panel { display: none; }
          .form-panel { width: 100%; padding: 24px 20px; }
          .form-card { padding: 32px 24px 28px; }
          .login-layout { justify-content: center; }
        }
      `}</style>
    </div>
  );
};

export default Login;
