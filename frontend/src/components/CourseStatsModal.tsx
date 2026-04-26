import { DetailedCourseStats } from "@/hooks/useAttendance";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle2,
  XCircle, Target, Calendar, Clock, Shield, Zap,
} from "lucide-react";

interface CourseStatsModalProps {
  stats: DetailedCourseStats | null;
  open: boolean;
  onClose: () => void;
}

const CourseStatsModal = ({ stats, open, onClose }: CourseStatsModalProps) => {
  if (!stats) return null;

  const pct = stats.currentPercentage;

  const statusMeta = {
    safe:     { color: "hsl(145 65% 55%)", bg: "rgba(52,199,89,0.15)",  border: "rgba(52,199,89,0.28)",  icon: <CheckCircle2 size={18} style={{ color: "hsl(145 65% 55%)" }} />,  msg: pct >= 85 ? "Excellent! Comfortable buffer." : "Good! Be a bit careful." },
    warning:  { color: "hsl(40 95% 62%)",  bg: "rgba(255,165,0,0.14)",  border: "rgba(255,165,0,0.28)",  icon: <AlertTriangle size={18} style={{ color: "hsl(40 95% 62%)" }} />,   msg: "Warning! Attendance getting low." },
    danger:   { color: "hsl(0 72% 62%)",   bg: "rgba(255,69,58,0.14)",  border: "rgba(255,69,58,0.28)",  icon: <AlertTriangle size={18} style={{ color: "hsl(0 72% 62%)" }} />,    msg: "Danger! Take immediate action." },
    critical: { color: "hsl(0 72% 58%)",   bg: "rgba(255,30,30,0.16)",  border: "rgba(255,30,30,0.28)",  icon: <XCircle size={18} style={{ color: "hsl(0 72% 58%)" }} />,           msg: "Critical! Immediate action required." },
    nodata:   { color: "hsl(var(--muted-foreground))", bg: "hsl(var(--muted))", border: "hsl(var(--border))", icon: null, msg: "No classes held yet." },
  };

  const key = stats.classesHeld === 0 ? "nodata" : (stats.status as keyof typeof statusMeta) || "nodata";
  const meta = statusMeta[key] || statusMeta.nodata;

  const progColor = pct >= 75 ? "hsl(145 65% 52%)" : pct >= 65 ? "hsl(40 95% 58%)" : "hsl(0 72% 58%)";

  const StatCard = ({
    icon, label, value, subtext, col,
  }: { icon: React.ReactNode; label: string; value: string; subtext: string; col?: string }) => (
    <div style={{
      background: "var(--muted)",
      border: "1px solid var(--border)",
      borderRadius: 14, padding: "14px 16px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
        {icon}
        <span style={{ fontSize: 11, color: "hsl(var(--muted-foreground))", fontWeight: 600 }}>{label}</span>
      </div>
      <p style={{ fontSize: 18, fontWeight: 800, color: col || "hsl(var(--foreground))", lineHeight: 1, marginBottom: 3 }}>
        {value}
      </p>
      <p style={{ fontSize: 11, color: "hsl(var(--muted-foreground))" }}>{subtext}</p>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-lg max-h-[90vh] overflow-y-auto"
        style={{
          background: "var(--background)",
          border: "1px solid var(--border)",
          borderRadius: 22,
          boxShadow: "var(--shadow-card)",
          backdropFilter: "var(--glass-blur)",
          color: "hsl(var(--foreground))",
          padding: "28px",
        }}
      >
        <DialogHeader style={{ marginBottom: 20 }}>
          <DialogTitle style={{ display: "flex", alignItems: "center", gap: 10, lineHeight: 1.2 }}>
            {meta.icon}
            <div>
              <span style={{ fontSize: 18, fontWeight: 800, color: "hsl(var(--foreground))" }}>
                {stats.course}
              </span>
              <p style={{ fontSize: 12, fontWeight: 400, color: "hsl(var(--muted-foreground))", marginTop: 2 }}>
                {stats.courseTitle}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* ── Attendance percentage bar ── */}
          <div id="tour-attendance-pct">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>

              <span style={{ fontSize: 13, fontWeight: 600, color: "hsl(var(--muted-foreground))" }}>Current Attendance</span>
              <span style={{ fontSize: 28, fontWeight: 900, color: meta.color, lineHeight: 1 }}>
                {pct.toFixed(1)}%
              </span>
            </div>

            {/* Progress track */}
            <div style={{ position: "relative", height: 10, background: "hsl(var(--muted))", borderRadius: 99, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 99,
                width: `${Math.min(pct, 100)}%`,
                background: `linear-gradient(90deg, ${progColor}, ${progColor}99)`,
                transition: "width 0.8s cubic-bezier(0.34,1.26,0.64,1)",
                boxShadow: `0 0 10px ${progColor}66`,
              }} />
              {/* 75% marker */}
              <div style={{
                position: "absolute", top: 0, bottom: 0, left: "75%",
                width: 2, background: "hsl(var(--foreground) / 0.4)", borderRadius: 2,
              }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
              <p style={{ fontSize: 12, color: meta.color }}>{meta.msg}</p>
              <span style={{ fontSize: 11, color: "hsl(var(--muted-foreground))" }}>Target: 75%</span>
            </div>
          </div>

          {/* ── Quick stats ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <StatCard
              icon={<Calendar size={14} style={{ color: "hsl(265 80% 70%)" }} />}
              label="Classes Held"
              value={`${stats.classesHeld} / ${stats.semesterTotal}`}
              subtext={`${stats.remainingClasses} remaining`}
            />
            <StatCard
              icon={<CheckCircle2 size={14} style={{ color: "hsl(145 65% 55%)" }} />}
              label="Attended"
              value={`${stats.attended} hrs`}
              subtext={`${stats.missed} missed`}
              col="hsl(145 65% 58%)"
            />
            <StatCard
              icon={<Target size={14} style={{ color: "hsl(265 80% 70%)" }} />}
              label="Need to Attend"
              value={`${Math.max(0, stats.mustAttendFor75)} hrs`}
              subtext={stats.mustAttendFor75 > 0 ? "to reach 75%" : "75% achieved ✓"}
              col={stats.mustAttendFor75 > 0 ? "hsl(0 72% 62%)" : "hsl(145 65% 55%)"}
            />
            <StatCard
              icon={<Shield size={14} style={{ color: "hsl(40 95% 62%)" }} />}
              label="OD/ML Allowed"
              value={`${stats.odMlAllowed} hrs`}
              subtext="15% relaxation"
              col="hsl(40 95% 62%)"
            />
          </div>

          {/* ── Bunk Estimation ── */}
          <div id="tour-bunk-stats" style={{
            background: "hsl(var(--muted))",
            border: "1px solid hsl(var(--border))",
            borderRadius: 16, padding: "18px",
          }}>

            <h3 style={{ fontSize: 13, fontWeight: 700, color: "hsl(var(--foreground) / 0.85)", display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
              <Zap size={14} style={{ color: "hsl(40 95% 62%)" }} />
              Bunk Estimation
            </h3>

            {/* HIGH-VISIBILITY NEED TO ATTEND HIGHLIGHT */}
            {stats.mustAttendFor75 > 0 && (
              <div style={{ 
                background: "linear-gradient(135deg, rgba(239,68,68,0.2) 0%, rgba(239,68,68,0.1) 100%)", 
                border: "1px solid rgba(239,68,68,0.4)",
                boxShadow: "0 4px 15px rgba(239,68,68,0.2), inset 0 0 10px rgba(239,68,68,0.1)",
                borderRadius: 12, 
                padding: "16px", 
                marginBottom: 16,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center"
              }}>
                <p style={{ fontSize: 10, color: "#ef4444", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
                  Critical Action Required
                </p>
                <div style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: 16, fontWeight: 600, color: "rgba(255,255,255,0.7)", display: "block", marginBottom: 4 }}>Need to Attend</span>
                  <span style={{ fontSize: 42, fontWeight: 900, color: "white", textShadow: "0 0 15px rgba(239,68,68,0.6)", lineHeight: 1 }}>
                    {stats.mustAttendFor75}h
                  </span>
                </div>

                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>
                  You must attend these hours to reach your 75% target for whole semester
                </p>

              </div>
            )}


            {/* Max bunks info */}
            <div style={{ background: "hsl(var(--muted))", borderRadius: 12, padding: "12px 14px", marginBottom: 12 }}>
              {[
                { label: "Max bunks for 75%", val: `${stats.semesterTotal - stats.minRequiredFor75} hrs`, col: "hsl(var(--foreground) / 0.8)" },
                { label: "Already missed",    val: `${stats.missed} hrs`,                                col: "hsl(0 72% 62%)" },
              ].map(r => (
                <div key={r.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, lastChild: { marginBottom: 0 } }}>
                  <span style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>{r.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: r.col }}>{r.val}</span>
                </div>
              ))}
            </div>

            {/* Without OD/ML */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "hsl(var(--foreground) / 0.7)" }}>
                  Remaining bunks (no OD/ML)
                </span>
                <span style={{
                  fontSize: 20, fontWeight: 900,
                  color: stats.canBunkWithoutOdMl > 0 ? "hsl(145 65% 55%)" : "hsl(0 72% 62%)",
                }}>
                  {stats.canBunkWithoutOdMl} hrs
                </span>
              </div>
              <p style={{ fontSize: 11, color: "hsl(var(--muted-foreground))", marginTop: 3 }}>
                {stats.canBunkWithoutOdMl > 0
                  ? `You can still miss ${stats.canBunkWithoutOdMl} more hour(s) and stay at 75%`
                  : `Need to attend ${stats.mustAttendFor75} more hours`}
              </p>
            </div>

            {/* With OD/ML */}
            <div style={{ paddingTop: 12, borderTop: "1px solid hsl(var(--border))" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "hsl(var(--foreground) / 0.7)" }}>
                  Remaining bunks (with OD/ML)
                </span>
                <span style={{
                  fontSize: 20, fontWeight: 900,
                  color: stats.canBunkWithOdMl > 0 ? "hsl(145 65% 55%)" : "hsl(40 95% 62%)",
                }}>
                  {stats.canBunkWithOdMl} hrs
                </span>
              </div>
              <p style={{ fontSize: 11, color: "hsl(var(--muted-foreground))", marginTop: 3 }}>
                Max with OD/ML = {stats.semesterTotal - stats.minRequiredFor75 + stats.odMlAllowed} hrs
              </p>
            </div>

            {/* Action / Safety callout */}
            {stats.mustAttendFor75 > 0 && (
              <div style={{
                marginTop: 12,
                background: "rgba(255,69,58,0.12)", border: "1px solid rgba(255,69,58,0.25)",
                borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 8,
              }}>
                <TrendingDown size={14} style={{ color: "hsl(0 72% 62%)", flexShrink: 0 }} />
                <p style={{ fontSize: 12, color: "hsl(var(--foreground) / 0.75)" }}>
                  Attend <strong style={{ color: "hsl(0 72% 68%)" }}>{stats.mustAttendFor75}</strong> more hours to reach 75%.
                </p>
              </div>
            )}
            {stats.safetyMargin > 0 && (
              <div style={{
                marginTop: 12,
                background: "rgba(52,199,89,0.10)", border: "1px solid rgba(52,199,89,0.22)",
                borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 8,
              }}>
                <TrendingUp size={14} style={{ color: "hsl(145 65% 55%)", flexShrink: 0 }} />
                <p style={{ fontSize: 12, color: "hsl(var(--foreground) / 0.75)" }}>
                  You are <strong style={{ color: "hsl(145 65% 58%)" }}>{stats.safetyMargin}</strong> hours above the 75% threshold.
                </p>
              </div>
            )}
          </div>

          {/* ── Projections ── */}
          {stats.classesHeld > 0 && stats.remainingClasses > 0 && (
            <div>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "hsl(var(--foreground) / 0.85)", display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                <Clock size={14} style={{ color: "hsl(265 80% 70%)" }} />
                Semester Projections
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div style={{ background: "rgba(52,199,89,0.10)", border: "1px solid rgba(52,199,89,0.2)", borderRadius: 12, padding: "14px" }}>
                  <p style={{ fontSize: 11, color: "hsl(var(--muted-foreground))", marginBottom: 4 }}>If attend all (Best Case)</p>
                  <p style={{ fontSize: 22, fontWeight: 900, color: "hsl(145 65% 55%)" }}>
                    {stats.projectedFinalPercentage.toFixed(1)}%
                  </p>
                </div>
                <div style={{ background: "rgba(255,69,58,0.10)", border: "1px solid rgba(255,69,58,0.2)", borderRadius: 12, padding: "14px" }}>
                  <p style={{ fontSize: 11, color: "hsl(var(--muted-foreground))", marginBottom: 4 }}>If miss all (Worst Case)</p>
                  <p style={{ fontSize: 22, fontWeight: 900, color: "hsl(0 72% 62%)" }}>
                    {stats.projectedWorstPercentage.toFixed(1)}%
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* ── Rooms ── */}
          <div style={{ paddingTop: 12, borderTop: "1px solid hsl(var(--border))", fontSize: 11, color: "hsl(var(--muted-foreground))" }}>
            Rooms: {stats.rooms.join(", ")}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CourseStatsModal;
