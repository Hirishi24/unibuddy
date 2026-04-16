import { useState, useEffect } from "react";
import { GraduationCap, Eye, EyeOff, Lock, Hash, ArrowRight, Sparkles, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [applicationNumber, setApplicationNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate auth — replace with real logic
    await new Promise((r) => setTimeout(r, 1500));
    setIsLoading(false);
    navigate("/");
  };

  const handleGuest = () => navigate("/");

  return (
    <div className="login-root">
      {/* Animated gradient background */}
      <div
        className="login-bg"
        style={{
          background: `radial-gradient(ellipse at ${mousePos.x}% ${mousePos.y}%, hsl(265 85% 25% / 0.9) 0%, hsl(220 80% 15% / 0.95) 40%, hsl(190 60% 10%) 100%)`,
        }}
      />

      {/* Floating orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="orb orb-4" />

      {/* Grid overlay */}
      <div className="grid-overlay" />

      {/* Login card */}
      <div className="login-center">
        <div className="glass-card">
          {/* Inner shine border */}
          <div className="glass-shine" />

          {/* Logo */}
          <div className="logo-section">
            <div className="logo-ring">
              <div className="logo-inner">
                <GraduationCap className="logo-icon" />
              </div>
            </div>
            <div className="logo-badge">
              <Sparkles size={10} />
              <span>UniBuddy</span>
            </div>
          </div>

          {/* Heading */}
          <div className="heading-section">
            <h1 className="login-title">Welcome back</h1>
            <p className="login-subtitle">Sign in to track your attendance</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="login-form">
            {/* Application Number field */}
            <div>
              <label style={{
                display: "block", fontSize: 13, fontWeight: 700,
                color: "rgba(255,255,255,0.7)", marginBottom: 8,
              }}>
                Application Number / Register Number
              </label>
              <div className={`field-wrapper ${focusedField === "appnum" ? "field-focused" : ""}`}>
                <div className="field-icon">
                  <Hash size={16} />
                </div>
                <input
                  id="login-appnum"
                  type="text"
                  placeholder="Enter Application Number / Register Number"
                  value={applicationNumber}
                  onChange={(e) => setApplicationNumber(e.target.value)}
                  onFocus={() => setFocusedField("appnum")}
                  onBlur={() => setFocusedField(null)}
                  className="glass-input"
                  required
                  autoComplete="username"
                />
                <div className="field-glow" />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label style={{
                display: "block", fontSize: 13, fontWeight: 700,
                color: "rgba(255,255,255,0.7)", marginBottom: 8,
              }}>
                Password
              </label>
              <div className={`field-wrapper ${focusedField === "password" ? "field-focused" : ""}`}>
              <div className="field-icon">
                <Lock size={16} />
              </div>
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                className="glass-input"
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
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
              <div className="field-glow" />
              </div>
            </div>

            {/* Forgot password */}
            <div className="forgot-row">
              <a href="#" className="forgot-link">Forgot password?</a>
            </div>

            {/* Submit */}
            <button
              id="login-submit-btn"
              type="submit"
              className={`login-btn ${isLoading ? "login-btn-loading" : ""}`}
              disabled={isLoading}
            >
              <span className="btn-bg" />
              <span className="btn-shimmer" />
              <span className="btn-content">
                {isLoading ? (
                  <>
                    <span className="spinner" />
                    <span>Signing in…</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={16} className="btn-arrow" />
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className="divider">
            <span className="divider-line" />
            <span className="divider-text">or continue with</span>
            <span className="divider-line" />
          </div>

          {/* Social buttons */}
          <div className="social-row">
            <button id="google-login-btn" className="social-btn" type="button">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Google</span>
            </button>
            <button id="github-login-btn" className="social-btn" type="button">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
              <span>GitHub</span>
            </button>
          </div>

          {/* Sign up */}
          <p className="signup-text">
            Don't have an account?{" "}
            <a href="#" className="signup-link">Create one free</a>
          </p>

          {/* Guest divider */}
          <div className="guest-divider">
            <span className="divider-line" />
            <span className="divider-text">just exploring?</span>
            <span className="divider-line" />
          </div>

          {/* Guest button */}
          <button
            id="guest-access-btn"
            type="button"
            className="guest-btn"
            onClick={handleGuest}
          >
            <Zap size={15} className="guest-btn-icon" />
            <span>Continue without login</span>
          </button>
        </div>

        {/* Bottom tagline */}
        <p className="bottom-tagline">
          Trusted by 10,000+ students to keep their attendance on track 🎓
        </p>
      </div>

      <style>{`
        /* ──────────────────────────────────────────────
           ROOT & BACKGROUND
        ────────────────────────────────────────────── */
        .login-root {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          font-family: 'Inter', system-ui, sans-serif;
        }

        .login-bg {
          position: absolute;
          inset: 0;
          transition: background 0.15s ease;
          z-index: 0;
        }

        .grid-overlay {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px);
          background-size: 60px 60px;
          z-index: 1;
        }

        /* ──────────────────────────────────────────────
           FLOATING ORBS
        ────────────────────────────────────────────── */
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          z-index: 1;
          animation: floatOrb 8s ease-in-out infinite;
          pointer-events: none;
        }

        .orb-1 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, hsl(265 80% 55% / 0.4) 0%, transparent 70%);
          top: -15%; left: -10%;
          animation-delay: 0s;
        }

        .orb-2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, hsl(200 90% 50% / 0.35) 0%, transparent 70%);
          bottom: -15%; right: -5%;
          animation-delay: -3s;
        }

        .orb-3 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, hsl(320 75% 55% / 0.3) 0%, transparent 70%);
          top: 30%; right: 10%;
          animation-delay: -5s;
        }

        .orb-4 {
          width: 250px; height: 250px;
          background: radial-gradient(circle, hsl(160 70% 45% / 0.25) 0%, transparent 70%);
          bottom: 20%; left: 8%;
          animation-delay: -2s;
        }

        @keyframes floatOrb {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%  { transform: translate(30px, -20px) scale(1.05); }
          66%  { transform: translate(-20px, 15px) scale(0.97); }
        }

        /* ──────────────────────────────────────────────
           CENTER CONTAINER
        ────────────────────────────────────────────── */
        .login-center {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          padding: 16px;
          width: 100%;
          max-width: 440px;
        }

        /* ──────────────────────────────────────────────
           GLASS CARD
        ────────────────────────────────────────────── */
        .glass-card {
          position: relative;
          width: 100%;
          background: linear-gradient(
            135deg,
            rgba(255,255,255,0.13) 0%,
            rgba(255,255,255,0.06) 50%,
            rgba(255,255,255,0.10) 100%
          );
          backdrop-filter: blur(40px) saturate(180%);
          -webkit-backdrop-filter: blur(40px) saturate(180%);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 28px;
          padding: 44px 40px 36px;
          box-shadow:
            0 8px 32px rgba(0,0,0,0.4),
            0 2px 8px rgba(0,0,0,0.2),
            inset 0 1px 0 rgba(255,255,255,0.25),
            inset 0 -1px 0 rgba(255,255,255,0.06);
          overflow: hidden;
          animation: cardIn 0.7s cubic-bezier(0.34,1.56,0.64,1) both;
        }

        @keyframes cardIn {
          from { opacity:0; transform: translateY(32px) scale(0.96); }
          to   { opacity:1; transform: translateY(0) scale(1); }
        }

        /* Shine sweep on hover */
        .glass-shine {
          position: absolute;
          top: -50%; left: -50%;
          width: 200%; height: 200%;
          background: conic-gradient(
            from 0deg at 50% 50%,
            transparent 0deg,
            rgba(255,255,255,0.03) 60deg,
            rgba(255,255,255,0.08) 90deg,
            rgba(255,255,255,0.03) 120deg,
            transparent 180deg
          );
          animation: shine 6s linear infinite;
          pointer-events: none;
        }

        @keyframes shine {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        /* ──────────────────────────────────────────────
           LOGO
        ────────────────────────────────────────────── */
        .logo-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          margin-bottom: 24px;
          animation: fadeUp 0.6s 0.15s both;
        }

        .logo-ring {
          width: 72px; height: 72px;
          border-radius: 22px;
          background: linear-gradient(135deg, hsl(265 80% 60%), hsl(220 80% 55%));
          padding: 2px;
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.15),
            0 8px 24px hsl(265 80% 40% / 0.5),
            0 0 40px hsl(265 80% 50% / 0.2);
        }

        .logo-inner {
          width: 100%; height: 100%;
          background: rgba(10,8,30,0.65);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo-icon {
          width: 34px; height: 34px;
          color: white;
          filter: drop-shadow(0 0 8px rgba(255,255,255,0.4));
        }

        .logo-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 100px;
          padding: 3px 10px;
          font-size: 11px;
          font-weight: 600;
          color: rgba(255,255,255,0.75);
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        /* ──────────────────────────────────────────────
           HEADING
        ────────────────────────────────────────────── */
        .heading-section {
          text-align: center;
          margin-bottom: 28px;
          animation: fadeUp 0.6s 0.2s both;
        }

        .login-title {
          font-size: 28px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.5px;
          margin: 0 0 6px;
          background: linear-gradient(135deg, #fff 40%, rgba(255,255,255,0.6) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .login-subtitle {
          font-size: 14px;
          color: rgba(255,255,255,0.45);
          margin: 0;
          font-weight: 400;
        }

        /* ──────────────────────────────────────────────
           FORM & FIELDS
        ────────────────────────────────────────────── */
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
          animation: fadeUp 0.6s 0.25s both;
        }

        .field-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 14px;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          overflow: hidden;
        }

        .field-wrapper.field-focused {
          background: rgba(255,255,255,0.09);
          border-color: rgba(168,130,255,0.6);
          box-shadow: 0 0 0 3px rgba(168,130,255,0.12), 0 2px 12px rgba(0,0,0,0.15);
        }

        .field-glow {
          display: none;
        }

        .field-icon {
          padding: 0 14px 0 16px;
          color: rgba(255,255,255,0.35);
          flex-shrink: 0;
          display: flex;
          align-items: center;
          transition: color 0.2s;
        }

        .field-focused .field-icon {
          color: hsl(265 80% 70%);
        }

        .glass-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          padding: 15px 0;
          font-size: 14.5px;
          font-weight: 500;
          color: rgba(255,255,255,0.9);
          font-family: inherit;
          caret-color: hsl(265 80% 70%);
          min-width: 0;
        }

        .glass-input::placeholder {
          color: rgba(255,255,255,0.28);
          font-weight: 400;
        }

        .show-pass-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0 16px;
          color: rgba(255,255,255,0.35);
          display: flex;
          align-items: center;
          transition: color 0.2s;
          flex-shrink: 0;
        }

        .show-pass-btn:hover {
          color: rgba(255,255,255,0.7);
        }

        /* ──────────────────────────────────────────────
           FORGOT
        ────────────────────────────────────────────── */
        .forgot-row {
          display: flex;
          justify-content: flex-end;
          margin-top: -4px;
        }

        .forgot-link {
          font-size: 12.5px;
          color: hsl(265 80% 70%);
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s, opacity 0.2s;
          opacity: 0.8;
        }

        .forgot-link:hover {
          opacity: 1;
          color: hsl(265 80% 80%);
        }

        /* ──────────────────────────────────────────────
           SUBMIT BUTTON
        ────────────────────────────────────────────── */
        .login-btn {
          position: relative;
          width: 100%;
          padding: 15px;
          border: none;
          border-radius: 14px;
          cursor: pointer;
          font-family: inherit;
          font-size: 15px;
          font-weight: 700;
          color: white;
          letter-spacing: 0.01em;
          overflow: hidden;
          margin-top: 4px;
          transition: transform 0.15s, box-shadow 0.15s;
        }

        .btn-bg {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, hsl(265 80% 55%), hsl(220 80% 52%), hsl(265 80% 60%));
          background-size: 200% 200%;
          animation: gradientShift 4s ease infinite;
          z-index: 0;
        }

        .btn-shimmer {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255,255,255,0.15) 50%,
            transparent 100%
          );
          transform: translateX(-100%);
          transition: transform 0s;
          z-index: 1;
        }

        .login-btn:not(.login-btn-loading):hover .btn-shimmer {
          animation: shimmerSlide 0.5s ease forwards;
        }

        @keyframes shimmerSlide {
          from { transform: translateX(-100%); }
          to   { transform: translateX(100%); }
        }

        @keyframes gradientShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .btn-content {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .login-btn:not(.login-btn-loading):hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px hsl(265 80% 40% / 0.5), 0 0 40px hsl(265 80% 50% / 0.2);
        }

        .login-btn:not(.login-btn-loading):active {
          transform: translateY(0px);
        }

        .login-btn.login-btn-loading {
          cursor: not-allowed;
          opacity: 0.8;
        }

        .btn-arrow {
          transition: transform 0.2s;
        }

        .login-btn:not(.login-btn-loading):hover .btn-arrow {
          transform: translateX(3px);
        }

        /* Spinner */
        .spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* ──────────────────────────────────────────────
           DIVIDER
        ────────────────────────────────────────────── */
        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 24px 0 20px;
          animation: fadeUp 0.6s 0.3s both;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.08);
        }

        .divider-text {
          font-size: 12px;
          color: rgba(255,255,255,0.3);
          white-space: nowrap;
          font-weight: 500;
        }

        /* ──────────────────────────────────────────────
           SOCIAL BUTTONS
        ────────────────────────────────────────────── */
        .social-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          animation: fadeUp 0.6s 0.35s both;
        }

        .social-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          padding: 13px 16px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 12px;
          font-family: inherit;
          font-size: 13.5px;
          font-weight: 600;
          color: rgba(255,255,255,0.75);
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s, transform 0.15s, color 0.2s;
        }

        .social-btn:hover {
          background: rgba(255,255,255,0.11);
          border-color: rgba(255,255,255,0.2);
          transform: translateY(-1px);
          color: rgba(255,255,255,0.95);
        }

        .social-btn:active {
          transform: translateY(0);
        }

        /* ──────────────────────────────────────────────
           SIGN UP
        ────────────────────────────────────────────── */
        .signup-text {
          text-align: center;
          font-size: 13px;
          color: rgba(255,255,255,0.35);
          margin-top: 22px;
          animation: fadeUp 0.6s 0.4s both;
        }

        /* ──────────────────────────────────────────────
           GUEST ACCESS
        ────────────────────────────────────────────── */
        .guest-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 20px 0 16px;
          animation: fadeUp 0.6s 0.45s both;
        }

        .guest-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 13px;
          background: transparent;
          border: 1.5px dashed rgba(255,255,255,0.14);
          border-radius: 14px;
          font-family: inherit;
          font-size: 13.5px;
          font-weight: 600;
          color: rgba(255,255,255,0.45);
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s, color 0.2s, transform 0.15s;
          animation: fadeUp 0.6s 0.5s both;
        }

        .guest-btn:hover {
          background: rgba(255,255,255,0.055);
          border-color: rgba(255,255,255,0.26);
          color: rgba(255,255,255,0.75);
          transform: translateY(-1px);
        }

        .guest-btn:active { transform: translateY(0); }

        .guest-btn-icon {
          color: hsl(265 80% 70%);
          transition: transform 0.2s;
        }

        .guest-btn:hover .guest-btn-icon {
          transform: scale(1.15);
        }

        .signup-link {
          color: hsl(265 80% 70%);
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s;
        }

        .signup-link:hover {
          color: hsl(265 80% 82%);
        }

        /* ──────────────────────────────────────────────
           BOTTOM TAGLINE
        ────────────────────────────────────────────── */
        .bottom-tagline {
          font-size: 12px;
          color: rgba(255,255,255,0.25);
          text-align: center;
          animation: fadeUp 0.6s 0.5s both;
          font-weight: 400;
        }

        /* ──────────────────────────────────────────────
           SHARED ANIMATION
        ────────────────────────────────────────────── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ──────────────────────────────────────────────
           RESPONSIVE
        ────────────────────────────────────────────── */
        @media (max-width: 480px) {
          .glass-card { padding: 36px 24px 28px; border-radius: 22px; }
          .login-title { font-size: 24px; }
        }
      `}</style>
    </div>
  );
};

export default Login;
