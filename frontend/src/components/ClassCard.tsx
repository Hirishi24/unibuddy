import { Clock, MapPin, Check, X, Lock, Ban, User, Beaker, BookOpen, RotateCcw } from "lucide-react";
import { ClassBlock } from "@/shared/types";

import { isToday, isBefore, startOfDay } from "date-fns";
import { isBlockCancelled, getSwapInfo } from "@/data/globalAcademicCalendar";


interface ClassCardProps {
  block: ClassBlock;
  status: "present" | "absent" | null;
  onMarkPresent: () => void;
  onMarkAbsent: () => void;
  selectedDate: Date;
  onCourseClick?: (course: string) => void;
}

const ClassCard = ({ block, status, onMarkPresent, onMarkAbsent, selectedDate, onCourseClick }: ClassCardProps) => {
  const cancellationReason = isBlockCancelled(selectedDate, block.startTime, block.endTime, block.isLab);

  const getEndTimeDisplay = () => {
    const [hours] = block.endTime.split(":");
    return `${hours.padStart(2, "0")}:50`;
  };

  const canMarkAttendance = () => {
    if (cancellationReason) return false;
    const now = new Date();
    const today = startOfDay(now);
    const selectedDay = startOfDay(selectedDate);
    if (isBefore(selectedDay, today)) return true;
    if (isToday(selectedDate)) {
      const [endHours] = block.endTime.split(":");
      return (
        now.getHours() > parseInt(endHours) ||
        (now.getHours() === parseInt(endHours) && now.getMinutes() >= 50)
      );
    }
    return false;
  };

  const isLocked = !canMarkAttendance() && !cancellationReason;

  const getLockedMessage = () => {
    if (cancellationReason) return cancellationReason;
    if (!isToday(selectedDate)) return "Pending Session";
    const [h] = block.endTime.split(":");
    return `Unlocks @ ${h}:50`;
  };

  const swapInfo = getSwapInfo(selectedDate);

  const accentColor = block.isLab ? "hsl(265 80% 65%)" : "hsl(215 90% 60%)";
  const glassBg = status === "present" ? "rgba(52,199,89,0.08)" : status === "absent" ? "rgba(255,69,58,0.08)" : "var(--glass-bg-strong)";
  const glassBorder = status === "present" ? "rgba(52,199,89,0.3)" : status === "absent" ? "rgba(255,69,58,0.3)" : "var(--glass-border)";

  return (
    <div
      className="animate-scale-in group"
      style={{
        background: glassBg,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: `1px solid ${glassBorder}`,
        borderRadius: 24,
        padding: "20px",
        marginBottom: 14,
        position: "relative",
        overflow: "hidden",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: status ? `0 10px 40px -10px ${status === "present" ? "rgba(52,199,89,0.2)" : "rgba(255,69,58,0.2)"}` : "var(--shadow-card)",
      }}
    >
      {/* Dynamic Side Accent */}
      <div style={{
          position: "absolute", top: 0, left: 0, width: 4, height: "100%",
          background: cancellationReason ? "hsl(var(--muted))" : accentColor,
          boxShadow: `2px 0 10px ${cancellationReason ? "transparent" : accentColor}44`
      }} />

      <div className="flex justify-between items-start mb-4">
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* HEADER: Subject Name First */}
          <h3
             style={{
               fontSize: 18, fontWeight: 900, color: "hsl(var(--foreground))",
               letterSpacing: "-0.01em", marginBottom: 2,
               textTransform: "capitalize",
               textDecoration: cancellationReason ? "line-through" : "none",
               opacity: cancellationReason ? 0.5 : 1
             }}
          >
            {block.courseTitle}
          </h3>
          
          {/* SUB-HEADER: Course Code */}
          <div className="flex items-center gap-2 mb-4">
            <span 
               onClick={() => onCourseClick?.(block.course)}
               style={{ 
                 fontSize: 12, fontWeight: 700, color: accentColor, 
                 cursor: "pointer", background: `${accentColor}15`, 
                 padding: "2px 8px", borderRadius: 6
               }}
            >
              {block.course}
            </span>
            <div style={{ width: 1, height: 10, background: "hsl(var(--border))" }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: "hsl(var(--muted-foreground))" }}>

               {block.duration} Hr Session
            </span>
          </div>


          {/* DETAILS ROW: Location & Faculty */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "hsl(var(--foreground) / 0.8)" }}>
                <div style={{ background: "hsl(var(--muted))", padding: 6, borderRadius: 8 }}>
                   <Clock size={14} className="text-blue-400" />
                </div>
                <span className="font-bold">{block.startTime} – {getEndTimeDisplay()}</span>
            </div>


            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "hsl(var(--foreground) / 0.8)" }}>
                <div style={{ background: "hsl(var(--muted))", padding: 6, borderRadius: 8 }}>
                   <MapPin size={14} className="text-emerald-400" />
                </div>
                <span className="font-bold">{block.room}</span>
            </div>

            {block.faculty && block.faculty !== "TBA" && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "hsl(var(--foreground) / 0.8)" }}>
                  <div style={{ background: "hsl(var(--muted))", padding: 6, borderRadius: 8 }}>
                     <User size={14} className="text-purple-400" />
                  </div>
                  <span className="font-bold underline decoration-dotted underline-offset-4 text-purple-200">
                    {block.faculty}
                  </span>
              </div>
            )}
          </div>
        </div>

        {/* STATUS & TYPE TAGS */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="flex gap-1">
             {block.isLab ? (
               <span style={{
                 fontSize: 9, fontWeight: 900, padding: "3px 8px", borderRadius: 8,
                 background: "rgba(168,130,255,0.2)", color: "hsl(265 80% 80%)",
                 border: "1px solid rgba(168,130,255,0.4)"
               }}>LAB</span>
             ) : (
               <span style={{
                 fontSize: 9, fontWeight: 900, padding: "3px 8px", borderRadius: 8,
                 background: "rgba(60,130,255,0.2)", color: "hsl(215 90% 80%)",
                 border: "1px solid rgba(60,130,255,0.4)"
               }}>THEORY</span>
             )}
          </div>

          {status && (
            <div style={{
              padding: "4px 12px", borderRadius: 10, fontSize: 11, fontWeight: 800,
              background: status === "present" ? "rgba(52,199,89,0.2)" : "rgba(255,69,58,0.2)",
              color: status === "present" ? "#34d399" : "#f87171",
              border: `1px solid ${status === "present" ? "rgba(52,199,89,0.3)" : "rgba(255,69,58,0.3)"}`,
              textTransform: "uppercase"
            }}>
              {status}
            </div>
          )}
        </div>
      </div>

      {/* ACTION PANEL */}
      <div className="mt-4">
        {cancellationReason ? (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "14px", borderRadius: 16, background: "rgba(255,69,58,0.06)",
            border: "1px solid rgba(255,69,58,0.15)", fontSize: 12, color: "#f87171", fontWeight: 700
          }}>
            <Ban size={14} />
            <span>CLASS WAS CANCELLED: {cancellationReason}</span>
          </div>
        ) : isLocked ? (


          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "14px", borderRadius: 16, background: "hsl(var(--muted))",
            border: "1px solid hsl(var(--border))", fontSize: 12, color: "hsl(var(--muted-foreground))",
            fontWeight: 600
          }}>
            <Lock size={14} className="opacity-40" />
            <span>{getLockedMessage()}</span>
          </div>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={onMarkPresent}
              className="flex-1 py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-black transition-all hover:brightness-110 active:scale-95 shadow-lg shadow-emerald-900/10"
              style={{
                background: status === "present" ? "rgba(52,199,89,0.35)" : "hsl(var(--muted))",
                border: `1px solid ${status === "present" ? "#10b981" : "hsl(var(--border))"}`,
                color: status === "present" ? "#34d399" : "hsl(var(--foreground) / 0.9)",
              }}
            >
              <Check size={18} strokeWidth={3} /> PRESENT
            </button>
            <button
              onClick={onMarkAbsent}
              className="flex-1 py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-black transition-all hover:brightness-110 active:scale-95 shadow-lg shadow-red-900/10"
              style={{
                background: status === "absent" ? "rgba(255,69,58,0.35)" : "hsl(var(--muted))",
                border: `1px solid ${status === "absent" ? "#ef4444" : "hsl(var(--border))"}`,
                color: status === "absent" ? "#f87171" : "hsl(var(--foreground) / 0.9)",
              }}
            >
              <X size={18} strokeWidth={3} /> ABSENT
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassCard;
