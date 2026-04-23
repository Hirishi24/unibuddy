import { useEffect, useState } from "react";
import { ClassBlock } from "@/data/timetable";
import { Clock, MapPin, Coffee, CalendarClock, User, Beaker, BookOpen } from "lucide-react";
import { format } from "date-fns";

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

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const today = new Date();
    const isToday =
      selectedDate.getDate() === today.getDate() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getFullYear() === today.getFullYear();

    if (!isToday || blocks.length === 0) { setStatus({ type: "none" }); return; }

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

    const sorted = [...blocks].sort((a, b) => parseTime(a.startTime).getTime() - parseTime(b.startTime).getTime());

    for (const block of sorted) {
      const start = parseTime(block.startTime);
      const end   = getActualEnd(block);
      if (now >= start && now < end) {
        setStatus({ type: "ongoing", currentClass: block, timeLeft: fmt(end.getTime() - now.getTime()) });
        foundOngoing = true; break;
      }
      if (now < start && !nextClass) nextClass = block;
    }

    if (!foundOngoing) {
      if (nextClass) {
        const start = parseTime(nextClass.startTime);
        setStatus({ type: "upcoming", nextClass, timeUntil: fmt(start.getTime() - now.getTime()) });
      } else {
        setStatus({ type: "done" });
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
      <span style={{ display: "flex", alignItems: "center", gap: 4, color: "hsl(var(--muted-foreground) / 0.8)" }}>
        <User size={12} /> {block.faculty}
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
      <div style={{ fontSize: 11, color: "hsl(var(--muted-foreground) / 0.6)", fontFamily: "monospace", marginTop: 6 }}>
        {format(currentTime, "HH:mm:ss")}
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
  };

  // All done
  if (status.type === "done") return (
    <div style={{
      ...cardBase,
      background: "rgba(52,199,89,0.08)",
      border: "1px solid rgba(52,199,89,0.22)",
      boxShadow: "0 4px 24px rgba(52,199,89,0.08)",
    }} className="animate-fade-in">
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 12, flexShrink: 0,
          background: "rgba(52,199,89,0.18)", border: "1px solid rgba(52,199,89,0.28)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Coffee size={17} style={{ color: "hsl(145 65% 55%)" }} />
        </div>
        <div>
          <p style={{ fontWeight: 700, color: "hsl(var(--foreground) / 0.9)", fontSize: 14 }}>All done for today! 🎉</p>
          <p style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>No more classes scheduled</p>
        </div>
        <div style={{ marginLeft: "auto", fontSize: 12, color: "hsl(var(--muted-foreground) / 0.6)", fontFamily: "monospace" }}>
          {format(currentTime, "HH:mm:ss")}
        </div>
      </div>
    </div>
  );

  // Upcoming
  if (status.type === "upcoming" && status.nextClass) return (
    <div style={{
      ...cardBase,
      background: "rgba(255,165,0,0.08)",
      border: "1px solid rgba(255,165,0,0.22)",
      boxShadow: "0 4px 24px rgba(255,165,0,0.07)",
    }} className="animate-fade-in">
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
            <CalendarClock size={15} style={{ color: "hsl(40 95% 62%)", flexShrink: 0 }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: "hsl(40 95% 62%)", letterSpacing: "0.07em", textTransform: "uppercase" }}>
              Next Class
            </span>
            <TypeBadge block={status.nextClass} />
            <span style={{
              fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 99,
              background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.11)",
              color: "rgba(255,255,255,0.45)",
            }}>
              {status.nextClass.duration} {status.nextClass.duration > 1 ? "hrs" : "hr"}
            </span>
          </div>
          <h3 style={{ fontSize: 17, fontWeight: 800, color: "hsl(var(--foreground))", marginBottom: 2 }}>
            {status.nextClass.course}
          </h3>
          <p style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>{status.nextClass.courseTitle}</p>
          <ClassMeta block={status.nextClass} />
        </div>
        <TimerBox value={status.timeUntil!} label="until start" color="hsl(40 95% 62%)" />
      </div>
    </div>
  );

  // Ongoing
  if (status.type === "ongoing" && status.currentClass) return (
    <div style={{
      ...cardBase,
      background: "rgba(168,130,255,0.09)",
      border: "1px solid rgba(168,130,255,0.28)",
      boxShadow: "0 4px 24px rgba(120,80,255,0.14)",
    }} className="animate-fade-in">
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
            {/* Live indicator */}
            <div style={{ position: "relative", width: 16, height: 16, flexShrink: 0 }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%",
                background: "hsl(265 80% 65%)",
                position: "absolute", top: 4, left: 4,
                animation: "pulse 1.5s ease-in-out infinite",
              }} />
              <div style={{
                width: 16, height: 16, borderRadius: "50%",
                background: "rgba(168,130,255,0.25)",
                position: "absolute", top: 0, left: 0,
                animation: "ping 1.5s cubic-bezier(0,0,0.2,1) infinite",
              }} />
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: "hsl(265 80% 72%)", letterSpacing: "0.07em", textTransform: "uppercase" }}>
              Ongoing Class
            </span>
            <TypeBadge block={status.currentClass} />
            <span style={{
              fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 99,
              background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.11)",
              color: "rgba(255,255,255,0.45)",
            }}>
              {status.currentClass.duration} {status.currentClass.duration > 1 ? "hrs" : "hr"}
            </span>
          </div>
          <h3 style={{ fontSize: 17, fontWeight: 800, color: "hsl(var(--foreground))", marginBottom: 2 }}>
            {status.currentClass.course}
          </h3>
          <p style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>{status.currentClass.courseTitle}</p>
          <ClassMeta block={status.currentClass} />
        </div>
        <TimerBox value={status.timeLeft!} label="left" color="hsl(265 80% 72%)" />
      </div>
    </div>
  );

  return null;
};

export default OngoingClass;
