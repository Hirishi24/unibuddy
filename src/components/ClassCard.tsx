import { Clock, MapPin, Check, X, Lock } from "lucide-react";
import { ClassBlock } from "@/data/timetable";
import { isToday, isBefore, startOfDay } from "date-fns";

interface ClassCardProps {
  block: ClassBlock;
  status: "present" | "absent" | null;
  onMarkPresent: () => void;
  onMarkAbsent: () => void;
  selectedDate: Date;
  onCourseClick?: (course: string) => void;
}

const ClassCard = ({ block, status, onMarkPresent, onMarkAbsent, selectedDate, onCourseClick }: ClassCardProps) => {
  const getEndTimeDisplay = () => {
    const [hours] = block.endTime.split(":");
    return `${hours.padStart(2, "0")}:50`;
  };

  const getDurationLabel = () =>
    block.duration === 1 ? "1 hr" : `${block.duration} hrs`;

  const canMarkAttendance = () => {
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

  const isLocked = !canMarkAttendance();

  const getLockedMessage = () => {
    if (!isToday(selectedDate)) return "Class not completed yet";
    const [h] = block.endTime.split(":");
    return `Available after ${h}:50`;
  };

  const statusColor =
    status === "present"
      ? { ring: "rgba(52,199,89,0.35)", glow: "rgba(52,199,89,0.12)" }
      : status === "absent"
      ? { ring: "rgba(255,69,58,0.35)",  glow: "rgba(255,69,58,0.12)" }
      : { ring: "transparent",           glow: "transparent" };

  return (
    <div
      className="animate-scale-in"
      style={{
        background: "var(--glass-bg)",
        backdropFilter: "var(--glass-blur)",
        WebkitBackdropFilter: "var(--glass-blur)",
        border: `1px solid ${status ? statusColor.ring : "var(--glass-border)"}`,
        borderRadius: 16,
        padding: "16px",
        marginBottom: 10,
        boxShadow: status
          ? `0 0 0 1px ${statusColor.ring}, 0 4px 20px ${statusColor.glow}`
          : "var(--shadow-card)",
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}
    >
      {/* Top row */}
      <div className="flex justify-between items-start mb-3">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <h3
              onClick={() => onCourseClick?.(block.course)}
              style={{
                fontSize: 15, fontWeight: 800, color: "hsl(var(--foreground) / 0.95)",
                cursor: "pointer", transition: "color 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "hsl(265 80% 65%)")}
              onMouseLeave={e => (e.currentTarget.style.color = "hsl(var(--foreground) / 0.95)")}
            >
              {block.course}
            </h3>
            {block.isLab && (
              <span style={{
                fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 99,
                background: "rgba(168,130,255,0.18)", border: "1px solid rgba(168,130,255,0.3)",
                color: "hsl(265 80% 72%)",
              }}>LAB</span>
            )}
            {block.isOE && (
              <span style={{
                fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 99,
                background: "rgba(255,165,0,0.18)", border: "1px solid rgba(255,165,0,0.28)",
                color: "hsl(40 95% 65%)",
              }}>OE</span>
            )}
            <span style={{
              fontSize: 10, fontWeight: 600, padding: "1px 7px", borderRadius: 99,
              background: "var(--muted)", border: "1px solid var(--border)",
              color: "hsl(var(--muted-foreground))",
            }}>{getDurationLabel()}</span>
          </div>
          <p style={{ fontSize: 12, color: "hsl(var(--muted-foreground))", marginBottom: 6 }}>
            {block.courseTitle}
          </p>
          <div style={{ display: "flex", gap: 14, fontSize: 12, color: "hsl(var(--muted-foreground) / 0.8)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Clock size={12} />
              {block.startTime} – {getEndTimeDisplay()}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <MapPin size={12} />
              {block.room}
            </span>
          </div>
        </div>
        {status && (
          <span style={{
            fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99,
            background: status === "present" ? "rgba(52,199,89,0.18)" : "rgba(255,69,58,0.18)",
            border: `1px solid ${status === "present" ? "rgba(52,199,89,0.3)" : "rgba(255,69,58,0.3)"}`,
            color: status === "present" ? "hsl(145 65% 58%)" : "hsl(0 75% 65%)",
            flexShrink: 0,
          }}>
            {status === "present" ? "Present" : "Absent"}
          </span>
        )}
      </div>

      {/* Action buttons */}
      {isLocked ? (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          padding: "10px 16px", borderRadius: 12,
          background: "var(--muted)", border: "1px solid var(--border)",
          fontSize: 12, color: "hsl(var(--muted-foreground))",
        }}>
          <Lock size={13} />
          <span>{getLockedMessage()}</span>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 8 }}>
          {/* Present */}
          <button
            onClick={onMarkPresent}
            style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              padding: "10px", borderRadius: 12, fontSize: 13, fontWeight: 700,
              border: "1px solid",
              cursor: "pointer", transition: "all 0.15s",
              background: status === "present" ? "rgba(52,199,89,0.28)" : "rgba(52,199,89,0.10)",
              borderColor: status === "present" ? "rgba(52,199,89,0.5)" : "rgba(52,199,89,0.22)",
              color: "hsl(145 65% 58%)",
            }}
          >
            <Check size={14} /> Present
          </button>
          {/* Absent */}
          <button
            onClick={onMarkAbsent}
            style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              padding: "10px", borderRadius: 12, fontSize: 13, fontWeight: 700,
              border: "1px solid",
              cursor: "pointer", transition: "all 0.15s",
              background: status === "absent" ? "rgba(255,69,58,0.28)" : "rgba(255,69,58,0.10)",
              borderColor: status === "absent" ? "rgba(255,69,58,0.5)" : "rgba(255,69,58,0.22)",
              color: "hsl(0 75% 65%)",
            }}
          >
            <X size={14} /> Absent
          </button>
        </div>
      )}
    </div>
  );
};

export default ClassCard;
