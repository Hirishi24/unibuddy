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
    <div className="flex-shrink-0 text-right">
      <div 
        className="p-2 sm:p-3 sm:px-4 rounded-xl sm:rounded-2xl backdrop-blur-md"
        style={{
          background: `${color}18`,
          border: `1px solid ${color}35`,
        }}
      >
        <div 
          className="text-lg sm:text-2xl font-black tabular-nums leading-none"
          style={{ color }}
        >
          {value}
        </div>
        <div 
          className="text-[8px] sm:text-[10px] font-bold mt-1 uppercase tracking-tight"
          style={{ color: `${color}cc` }}
        >
          {label}
        </div>
      </div>
    </div>
  );

  const cardClasses = "glass p-4 sm:p-5 mb-5 relative overflow-hidden animate-fade-up";

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
    <div 
      className={`${cardClasses} border-opacity-40`}
      style={{
        background: status.timeLeft ? "rgba(255,69,58,0.06)" : "rgba(52,199,89,0.08)",
        borderColor: status.timeLeft ? "rgba(255,69,58,0.2)" : "rgba(52,199,89,0.2)",
      }}
    >
      <SwapBanner />
      <div className="flex items-center gap-3 sm:gap-4">
        <div 
          className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center"
          style={{
            background: status.timeLeft ? "rgba(255,69,58,0.12)" : "rgba(52,199,89,0.12)",
          }}
        >
          {status.timeLeft ? <Ban size={18} style={{ color: "hsl(0 75% 65%)" }} /> : <Coffee size={18} style={{ color: "hsl(145 65% 55%)" }} />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-foreground/90 text-sm sm:text-base truncate">
            {status.timeLeft ? "Currently Cancelled" : "All done for today! 🎉"}
          </p>
          <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
            {status.timeLeft || "No more classes scheduled"}
          </p>
        </div>
        <div className="hidden xs:block text-[10px] text-muted-foreground/50 font-mono">
          {format(currentTime, "HH:mm:ss")}
        </div>
      </div>
    </div>
  );

  if (status.type === "upcoming" && status.nextClass) return (
    <div className={`${cardClasses} bg-primary/5 border-primary/20 shadow-primary/5`}>
      <SwapBanner />
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <CalendarClock size={14} className="text-primary" />
            <span className="text-[9px] font-black text-primary uppercase tracking-wider">Next Class</span>
            <TypeBadge block={status.nextClass} />
          </div>
          <h3 className="text-base sm:text-xl font-black text-foreground tracking-tight truncate">{status.nextClass.course}</h3>
          <ClassMeta block={status.nextClass} />
        </div>
        <TimerBox value={status.timeUntil!} label="until start" color="hsl(var(--primary))" />
      </div>
    </div>
  );

  if (status.type === "ongoing" && status.currentClass) return (
    <div className={`${cardClasses} bg-accent/5 border-accent/20 shadow-accent/5`}>
      <SwapBanner />
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_10px_hsl(var(--accent))]" />
            <span className="text-[9px] font-black text-accent uppercase tracking-wider">Ongoing Class</span>
            <TypeBadge block={status.currentClass} />
          </div>
          <h3 className="text-base sm:text-xl font-black text-foreground tracking-tight truncate">{status.currentClass.course}</h3>
          <ClassMeta block={status.currentClass} />
        </div>
        <TimerBox value={status.timeLeft!} label="left" color="hsl(var(--accent))" />
      </div>
    </div>
  );

  return null;
};

export default OngoingClass;
