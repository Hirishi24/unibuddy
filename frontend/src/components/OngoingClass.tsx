import { useEffect, useState } from "react";
import { ClassBlock } from "@/shared/types";
import { getSwapInfo } from "@/data/globalAcademicCalendar";

import { Clock, MapPin, Coffee, CalendarClock, User, Beaker, BookOpen, Ban, Info, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { isBlockCancelled } from "@/data/globalAcademicCalendar";

interface OngoingClassProps {
  blocks: ClassBlock[];
  selectedDate: Date;
}

interface ClassStatus {
  type: "ongoing" | "upcoming" | "done" | "none";
  currentClass?: ClassBlock;
  nextClass?: ClassBlock;
  timeLeft?: string;
  timeUntil?: string;
}

const getDisplayEndTime = (block: ClassBlock): string => {
  const [hours] = block.endTime.split(":").map(Number);
  return `${hours.toString().padStart(2, "0")}:50`;
};

const OngoingClass = ({ blocks, selectedDate }: OngoingClassProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [status, setStatus] = useState<ClassStatus>({ type: "none" });

  const swapInfo = getSwapInfo(selectedDate);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const today = new Date();
    const isDateToday =
      selectedDate.getDate() === today.getDate() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getFullYear() === today.getFullYear();

    if (!isDateToday || blocks.length === 0) { setStatus({ type: "none" }); return; }

    const parseTime = (t: string): Date => {
      const [h, m] = t.split(":").map(Number);
      const d = new Date(); d.setHours(h, m, 0, 0); return d;
    };

    const getActualEnd = (block: ClassBlock): Date => {
      const [h] = block.endTime.split(":").map(Number);
      const d = new Date(); d.setHours(h, 50, 0, 0); return d;
    };

    const fmt = (ms: number): string => {
      const s = Math.floor(ms / 1000);
      const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
      if (h > 0) return `${h}h ${m}m ${sec}s`;
      if (m > 0) return `${m}m ${sec}s`;
      return `${sec}s`;
    };

    const now = currentTime;
    let foundOngoing = false;
    let nextClass: ClassBlock | null = null;
    let currentCancellation: string | null = null;

    const sorted = [...blocks].sort((a, b) => parseTime(a.startTime).getTime() - parseTime(b.startTime).getTime());

    for (const block of sorted) {
      const start = parseTime(block.startTime);
      const end   = getActualEnd(block);
      const cancelled = isBlockCancelled(selectedDate, block.startTime, block.endTime, block.isLab);

      if (now >= start && now < end) {
        if (cancelled) {
          currentCancellation = cancelled;
          continue; 
        }
        setStatus({ type: "ongoing", currentClass: block, timeLeft: fmt(end.getTime() - now.getTime()) });
        foundOngoing = true; break;
      }
      if (now < start && !nextClass && !cancelled) nextClass = block;
    }

    if (!foundOngoing) {
      if (nextClass) {
        const start = parseTime(nextClass.startTime);
        setStatus({ type: "upcoming", nextClass, timeUntil: fmt(start.getTime() - now.getTime()) });
      } else {
        setStatus({ type: "done", timeLeft: currentCancellation || undefined });
      }
    }
  }, [currentTime, blocks, selectedDate]);

  if (status.type === "none") return null;

  const TypeBadge = ({ block }: { block: ClassBlock }) => (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 3,
      fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
      background: block.isLab ? "rgba(168,130,255,0.18)" : "rgba(60,130,255,0.18)",
      border: `1px solid ${block.isLab ? "rgba(168,130,255,0.3)" : "rgba(60,130,255,0.28)"}`,
      color: block.isLab ? "hsl(265 80% 72%)" : "hsl(220 90% 72%)",
    }}>
      {block.isLab ? <><Beaker size={9} /> Lab</> : <><BookOpen size={9} /> Theory</>}
    </span>
  );

  const ClassMeta = ({ block }: { block: ClassBlock }) => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, fontSize: 12, marginTop: 6 }}>
      <span style={{ display: "flex", alignItems: "center", gap: 4, color: "hsl(var(--muted-foreground))" }}>
        <Clock size={12} /> {block.startTime} – {getDisplayEndTime(block)}
      </span>
      <span style={{ display: "flex", alignItems: "center", gap: 4, color: "hsl(var(--muted-foreground))" }}>
        <MapPin size={12} /> {block.room}
      </span>
    </div>
  );

  const TimerBox = ({ value, label, color }: { value: string; label: string; color: string }) => (
    <div style={{ textAlign: "right" }}>
      <div style={{
        background: `${color}18`,
        border: `1px solid ${color}35`,
        borderRadius: 14, padding: "10px 16px",
        backdropFilter: "blur(10px)",
      }}>
        <div style={{ fontSize: 22, fontWeight: 900, color, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ fontSize: 10, color: `${color}cc`, fontWeight: 600, marginTop: 3 }}>{label}</div>
      </div>
    </div>
  );

  const cardBase: React.CSSProperties = {
    backdropFilter: "var(--glass-blur)",
    WebkitBackdropFilter: "var(--glass-blur)",
    borderRadius: 18,
    padding: "18px 20px",
    marginBottom: 20,
    background: "var(--glass-bg-strong)",
    border: "1px solid var(--glass-border)",
    boxShadow: "var(--shadow-card)",
    position: "relative",
    overflow: "hidden"
  };

  const SwapBanner = () => {
    if (!swapInfo) return null;
    return (
      <div style={{
        margin: "-18px -20px 18px -20px",
        background: "linear-gradient(90deg, hsl(210 100% 50% / 0.15), hsl(250 100% 60% / 0.15))",
        borderBottom: "1px solid hsl(210 100% 50% / 0.2)",
        padding: "8px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        marginBottom: 18
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <RefreshCw size={12} className="text-blue-400 animate-spin-slow" />
          <span style={{ fontSize: 10, fontWeight: 800, color: "hsl(210 100% 70%)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
             Day Order Change: Following {swapInfo.followsDay} Timetable
          </span>
        </div>
        {swapInfo.reason && !swapInfo.reason.toLowerCase().includes("following") && (
          <div style={{ fontSize: 9, fontWeight: 700, color: "hsl(var(--muted-foreground))", background: "hsl(var(--muted))", padding: "2px 8px", borderRadius: 6 }}>
            {swapInfo.reason}
          </div>
        )}
      </div>


    );
  };

  if (status.type === "done") return (
    <div style={{
      ...cardBase,
      background: status.timeLeft ? "rgba(255,69,58,0.06)" : "rgba(52,199,89,0.08)",
      border: `1px solid ${status.timeLeft ? "rgba(255,69,58,0.2)" : "rgba(52,199,89,0.2)"}`,
    }} className="animate-fade-in">
      <SwapBanner />
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 12, flexShrink: 0,
          background: status.timeLeft ? "rgba(255,69,58,0.12)" : "rgba(52,199,89,0.12)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {status.timeLeft ? <Ban size={17} style={{ color: "hsl(0 75% 65%)" }} /> : <Coffee size={17} style={{ color: "hsl(145 65% 55%)" }} />}
        </div>
        <div>
          <p style={{ fontWeight: 700, color: "hsl(var(--foreground) / 0.9)", fontSize: 14 }}>
            {status.timeLeft ? "Currently Cancelled" : "All done for today! 🎉"}
          </p>
          <p style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>
            {status.timeLeft || "No more classes scheduled"}
          </p>
        </div>
        <div style={{ marginLeft: "auto", fontSize: 12, color: "hsl(var(--muted-foreground) / 0.6)", fontFamily: "monospace" }}>
          {format(currentTime, "HH:mm:ss")}
        </div>
      </div>
    </div>
  );

  if (status.type === "upcoming" && status.nextClass) return (
    <div style={{ ...cardBase, background: "hsl(var(--primary) / 0.06)", border: "1px solid hsl(var(--primary) / 0.18)" }} className="animate-fade-in">
      <SwapBanner />
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
            <CalendarClock size={15} style={{ color: "hsl(var(--primary))" }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: "hsl(var(--primary))", textTransform: "uppercase" }}>Next Class</span>
            <TypeBadge block={status.nextClass} />
          </div>
          <h3 style={{ fontSize: 17, fontWeight: 800, color: "hsl(var(--foreground))" }}>{status.nextClass.course}</h3>
          <ClassMeta block={status.nextClass} />
        </div>
        <TimerBox value={status.timeUntil!} label="until start" color="hsl(var(--primary))" />
      </div>
    </div>
  );

  if (status.type === "ongoing" && status.currentClass) return (
    <div style={{ ...cardBase, background: "rgba(168,130,255,0.09)", border: "1px solid rgba(168,130,255,0.28)" }} className="animate-fade-in">
      <SwapBanner />
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "hsl(265 80% 65%)", animation: "pulse 1.5s infinite" }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: "hsl(265 80% 72%)", textTransform: "uppercase" }}>Ongoing Class</span>
            <TypeBadge block={status.currentClass} />
          </div>
          <h3 style={{ fontSize: 17, fontWeight: 800, color: "hsl(var(--foreground))" }}>{status.currentClass.course}</h3>
          <ClassMeta block={status.currentClass} />
        </div>
        <TimerBox value={status.timeLeft!} label="left" color="hsl(265 80% 72%)" />
      </div>
    </div>
  );

  return null;
};

export default OngoingClass;
