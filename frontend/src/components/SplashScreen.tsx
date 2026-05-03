import { useEffect, useState } from "react";

const SplashScreen = ({ onDone }: { onDone: () => void }) => {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => setExiting(true), 2100);
    const doneTimer = setTimeout(() => onDone(), 2650);
    return () => { clearTimeout(exitTimer); clearTimeout(doneTimer); };
  }, [onDone]);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "hsl(225 25% 5%)",
      opacity: exiting ? 0 : 1,
      transition: exiting ? "opacity 0.55s cubic-bezier(0.4, 0, 0.2, 1)" : "none",
      pointerEvents: "all",
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      {/* Radial ambient glow */}
      <div style={{
        position: "absolute",
        width: 380, height: 380,
        background: "radial-gradient(circle, hsl(230 85% 55% / 0.16) 0%, transparent 65%)",
        borderRadius: "50%",
        animation: "sp-glow 2.5s ease-in-out infinite",
      }} />

      {/* Secondary accent glow */}
      <div style={{
        position: "absolute",
        width: 240, height: 240,
        background: "radial-gradient(circle, hsl(265 75% 55% / 0.10) 0%, transparent 65%)",
        borderRadius: "50%",
        transform: "translate(60px, 40px)",
        animation: "sp-glow 2.5s ease-in-out 1.2s infinite",
      }} />

      {/* Logo ring */}
      <div style={{
        width: 100, height: 100,
        borderRadius: 30,
        background: "linear-gradient(135deg, hsl(230 85% 60%), hsl(265 75% 64%))",
        padding: "3px",
        boxShadow: "0 0 50px hsl(230 85% 55% / 0.5), 0 0 100px hsl(230 85% 55% / 0.18), 0 20px 40px rgba(0,0,0,0.5)",
        animation: "sp-logo-in 0.65s cubic-bezier(0.34, 1.6, 0.64, 1) 0.05s both",
        position: "relative", zIndex: 1,
      }}>
        <div style={{
          width: "100%", height: "100%",
          background: "hsl(225 28% 8%)",
          borderRadius: 27,
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden",
        }}>
          <img
            src="/favicon.png"
            alt="Unibuddy"
            style={{ width: "88%", height: "88%", objectFit: "cover", borderRadius: 23 }}
          />
        </div>
      </div>

      {/* UB lettering badge */}
      <div style={{
        position: "absolute",
        top: "calc(50% - 50px + 68px)",
        left: "calc(50% + 32px)",
        width: 26, height: 26,
        borderRadius: "50%",
        background: "linear-gradient(135deg, hsl(230 85% 60%), hsl(265 75% 64%))",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 9, fontWeight: 900, color: "white",
        boxShadow: "0 0 0 2px hsl(225 25% 5%)",
        animation: "sp-logo-in 0.5s cubic-bezier(0.34, 1.6, 0.64, 1) 0.55s both",
        zIndex: 2,
      }}>UB</div>

      {/* App name */}
      <div style={{
        marginTop: 28, marginBottom: 6,
        fontSize: 38, fontWeight: 950,
        letterSpacing: "-2px", lineHeight: 1,
        color: "white",
        animation: "sp-up 0.6s cubic-bezier(0.34, 1.26, 0.64, 1) 0.28s both",
        position: "relative", zIndex: 1,
      }}>
        Uni<span style={{
          background: "linear-gradient(135deg, hsl(230 85% 72%), hsl(265 75% 74%))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}>buddy</span>
      </div>

      {/* Tagline */}
      <div style={{
        fontSize: 10, fontWeight: 700,
        letterSpacing: "0.20em",
        textTransform: "uppercase",
        color: "hsl(220 12% 40%)",
        marginBottom: 52,
        animation: "sp-up 0.5s ease 0.48s both",
        position: "relative", zIndex: 1,
      }}>
        SRMAP Attendance Intelligence
      </div>

      {/* Progress bar */}
      <div style={{
        width: 120, height: 2,
        background: "hsl(225 20% 13%)",
        borderRadius: 2,
        overflow: "hidden",
        position: "relative", zIndex: 1,
        animation: "sp-up 0.4s ease 0.58s both",
      }}>
        <div style={{
          height: "100%", borderRadius: 2,
          background: "linear-gradient(90deg, hsl(230 85% 60%), hsl(265 75% 65%))",
          animation: "sp-progress 1.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.62s both",
        }} />
      </div>

      {/* Pulsing dots */}
      <div style={{
        display: "flex", gap: 7, marginTop: 18,
        position: "relative", zIndex: 1,
        animation: "sp-up 0.4s ease 0.72s both",
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 5, height: 5, borderRadius: "50%",
            background: "hsl(230 85% 58%)",
            animation: `sp-dot 1.3s ease-in-out ${i * 0.22}s infinite`,
          }} />
        ))}
      </div>

      <style>{`
        @keyframes sp-logo-in {
          from { opacity: 0; transform: scale(0.35) rotate(-15deg); }
          to   { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes sp-up {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes sp-progress {
          from { width: 0%; }
          to   { width: 100%; }
        }
        @keyframes sp-dot {
          0%, 100% { opacity: 0.2; transform: scale(0.75); }
          50%       { opacity: 1;   transform: scale(1.25); }
        }
        @keyframes sp-glow {
          0%, 100% { transform: scale(1);    opacity: 0.7; }
          50%       { transform: scale(1.12); opacity: 1;   }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
