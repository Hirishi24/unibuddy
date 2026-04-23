"use client";

import { useState, type FC } from "react";
import { Sun, Moon } from "lucide-react";

interface SwitchModeProps {
  width?: number;
  height?: number;
  onToggle?: (isDark: boolean) => void;
}

export const SwitchMode: FC<SwitchModeProps> = ({
  width = 140,
  height = 64,
  onToggle,
}) => {
  const [isDark, setIsDark] = useState(true);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    onToggle?.(next);
    // Toggle class on <html> for theme switching
    document.documentElement.classList.toggle("dark", next);
  };

  const knobSize = height - 4;
  const iconSize = height * 0.36;
  const travel = width - knobSize - 4;

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      style={{
        position: "relative",
        width,
        height,
        borderRadius: height,
        border: `2px solid ${isDark ? "rgba(220,30,30,0.35)" : "rgba(200,200,200,0.4)"}`,
        background: isDark
          ? "linear-gradient(135deg, hsl(0 5% 8%), hsl(0 8% 12%))"
          : "linear-gradient(135deg, #f0f0f5, #e8e8ee)",
        cursor: "pointer",
        overflow: "hidden",
        outline: "none",
        padding: 0,
        transition: "border-color 0.3s, background 0.4s",
        boxShadow: isDark
          ? "0 2px 12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,80,80,0.08)"
          : "0 2px 12px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.6)",
      }}
    >
      {/* Track glow */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: height,
        background: isDark
          ? "radial-gradient(circle at 75% 50%, rgba(220,30,30,0.12), transparent 60%)"
          : "radial-gradient(circle at 25% 50%, rgba(255,200,50,0.15), transparent 60%)",
        transition: "background 0.4s",
        pointerEvents: "none",
      }} />

      {/* Sun icon (left side) */}
      <div style={{
        position: "absolute", left: 0, top: 0,
        width: knobSize + 4, height,
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1,
        transition: "opacity 0.3s",
        opacity: isDark ? 0.3 : 0,
      }}>
        <Sun size={iconSize} style={{ color: isDark ? "rgba(255,255,255,0.25)" : "#f59e0b" }} />
      </div>

      {/* Moon icon (right side) */}
      <div style={{
        position: "absolute", right: 0, top: 0,
        width: knobSize + 4, height,
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1,
        transition: "opacity 0.3s",
        opacity: isDark ? 0 : 0.35,
      }}>
        <Moon size={iconSize} style={{ color: isDark ? "rgba(255,255,255,0.85)" : "rgba(100,100,120,0.4)" }} />
      </div>

      {/* Knob */}
      <div style={{
        position: "absolute",
        top: 2,
        left: isDark ? travel : 2,
        width: knobSize,
        height: knobSize,
        borderRadius: "50%",
        background: isDark
          ? "linear-gradient(145deg, hsl(0 8% 14%), hsl(0 5% 10%))"
          : "linear-gradient(145deg, #fafafa, #ececf0)",
        border: `2px solid ${isDark ? "rgba(220,30,30,0.3)" : "rgba(200,200,200,0.5)"}`,
        boxShadow: isDark
          ? "0 2px 8px rgba(0,0,0,0.5), 0 0 12px rgba(220,30,30,0.15), inset 0 1px 0 rgba(255,255,255,0.08)"
          : "0 2px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 5,
        transition: "left 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.3s, border-color 0.3s, box-shadow 0.3s",
      }}>
        {isDark ? (
          <Moon size={iconSize} style={{
            color: "rgba(255,255,255,0.85)",
            filter: "drop-shadow(0 0 4px rgba(255,255,255,0.2))",
            transition: "all 0.3s",
          }} />
        ) : (
          <Sun size={iconSize} style={{
            color: "#f59e0b",
            filter: "drop-shadow(0 0 4px rgba(245,158,11,0.4))",
            transition: "all 0.3s",
          }} />
        )}
      </div>
    </button>
  );
};

export default SwitchMode;
