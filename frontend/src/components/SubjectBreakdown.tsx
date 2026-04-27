import { useState } from "react";
import { SubjectStats, DetailedCourseStats } from "@/hooks/useAttendance";
import { BookOpen, ChevronRight, TrendingUp } from "lucide-react";
import CourseStatsModal from "./CourseStatsModal";
import { courseTitles } from "@/utils/timetableUtils";
import { ClassBlock } from "@/shared/types";


interface SubjectBreakdownProps {
  stats: SubjectStats[];
  getDetailedCourseStats: (course: string) => DetailedCourseStats | null;
}

const SubjectBreakdown = ({ stats, getDetailedCourseStats }: SubjectBreakdownProps) => {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const sortedStats = [...stats].sort((a, b) => a.course.localeCompare(b.course));

  const getPercentageColor = (pct: number, hasData: boolean) => {
    if (!hasData) return "hsl(var(--muted-foreground) / 0.5)";
    if (pct >= 75) return "hsl(145 65% 55%)";
    if (pct >= 65) return "hsl(40 95% 62%)";
    return "hsl(0 72% 62%)";
  };

  const handleRowClick = (course: string) => {
    setSelectedCourse(course);
    setModalOpen(true);
  };

  const selectedStats = selectedCourse ? getDetailedCourseStats(selectedCourse) : null;

  const allEmpty = stats.every((s) => s.totalBlocks === 0);

  return (
    <div className="glass" style={{ overflow: "hidden" }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "18px 20px",
        borderBottom: "1px solid var(--border)",
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: "linear-gradient(135deg, hsl(230 85% 58%), hsl(265 75% 58%))",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 10px rgba(99,102,241,0.35)",
          flexShrink: 0,
        }}>

          <BookOpen size={15} style={{ color: "white" }} />
        </div>
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "hsl(var(--foreground) / 0.9)" }}>
            Course Wise Breakdown
          </h2>
          <p style={{ fontSize: 11, color: "hsl(var(--muted-foreground))" }}>
            Click any row for detailed estimation
          </p>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <TrendingUp size={16} style={{ color: "hsl(var(--muted-foreground) / 0.3)" }} />
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }} className="glass-table">
          <thead>
            <tr>
              <th className="text-left">Course</th>
              <th className="text-center hidden md:table-cell">Conducted</th>
              <th className="text-center hidden sm:table-cell">Attended</th>
              <th className="text-center hidden lg:table-cell">Absent</th>
              <th className="text-center hidden lg:table-cell">OD</th>
              <th className="text-center">%</th>
              <th className="text-center">Status</th>
              <th className="text-right">Bunks</th>
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody>
            {sortedStats.map((subject, index) => {

              const hasData = subject.totalBlocks > 0;
              const detailed = getDetailedCourseStats(subject.course);
              const pctColor = getPercentageColor(subject.percentage, hasData);
              const bunksLeft = detailed?.canBunkWithoutOdMl ?? 0;
              const maxBunks = detailed
                ? detailed.semesterTotal - detailed.minRequiredFor75
                : 0;
              const bunkPct = maxBunks > 0 ? bunksLeft / maxBunks : 0;
              const bunkColor =
                bunkPct <= 0 ? "hsl(0 72% 62%)"
                : bunkPct < 0.3 ? "hsl(0 72% 62%)"
                : bunkPct < 0.5 ? "hsl(40 95% 62%)"
                : "hsl(145 65% 55%)";

              return (
                <tr
                  key={subject.course}
                  id={index === 0 ? "tour-expand-row" : undefined}
                  onClick={() => handleRowClick(subject.course)}

                  style={{ cursor: "pointer", transition: "background 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--glass-bg-hover)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  {/* Course name */}
                  <td>
                    <div>
                      <span style={{ fontWeight: 700, color: "hsl(var(--foreground))", display: "block" }}>
                        {subject.course}
                      </span>
                      <span style={{ fontSize: 11, color: "hsl(var(--muted-foreground))" }}>
                        {subject.title || courseTitles[subject.course] || ""}
                      </span>

                    </div>
                  </td>
                  {/* Conducted */}
                  <td className="text-center text-muted-foreground whitespace-nowrap hidden md:table-cell">
                    {hasData ? `${subject.conducted} / ${subject.totalBlocks}` : "—"}
                  </td>
                  {/* Attended */}
                  <td className="text-center text-muted-foreground hidden sm:table-cell">
                    {hasData ? subject.attended : "—"}
                  </td>
                  {/* Absent */}
                  <td className="text-center text-danger hidden lg:table-cell">
                    {hasData ? subject.absent : "—"}
                  </td>
                  {/* OD */}
                  <td className="text-center text-muted-foreground hidden lg:table-cell">
                    {hasData ? subject.od : "—"}
                  </td>
                  {/* % */}
                  <td className="text-center">
                    <span className="font-black text-xs sm:text-sm" style={{ color: pctColor }}>
                      {hasData ? `${subject.percentage.toFixed(1)}%` : "—"}
                    </span>
                  </td>
                  {/* Status */}
                  <td className="text-center">
                    {detailed && hasData ? (
                      <div className="flex justify-center">
                        {subject.status === "safe" && (
                          <div className="px-1.5 sm:px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 text-[9px] sm:text-[10px] font-black uppercase tracking-wider">
                            SAFE
                          </div>
                        )}
                        {subject.status === "warning" && (
                          <div className="px-1.5 sm:px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 text-[9px] sm:text-[10px] font-black uppercase tracking-wider">
                            WARN
                          </div>
                        )}
                        {subject.status === "danger" && (
                          <div className="px-1.5 sm:px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-500 text-[9px] sm:text-[10px] font-black uppercase tracking-wider">
                            DANGER
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="opacity-20">—</span>
                    )}
                  </td>
                  {/* Bunks left */}
                  <td style={{ textAlign: "right" }}>
                    {detailed ? (
                      <span style={{ fontWeight: 700, fontSize: 13 }}>
                        <span style={{ color: "hsl(var(--muted-foreground))", fontSize: 11 }}>{bunksLeft}/</span>
                        <span style={{ color: bunkColor }}>{maxBunks}</span>
                      </span>
                    ) : (
                      <span style={{ color: "hsl(var(--muted-foreground) / 0.3)" }}>—</span>
                    )}
                  </td>
                  {/* Arrow */}
                  <td style={{ paddingRight: 12 }}>
                    <ChevronRight size={14} style={{ color: "hsl(var(--muted-foreground) / 0.4)" }} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {allEmpty && (
        <div style={{ padding: "28px 20px", textAlign: "center", color: "hsl(var(--muted-foreground))", fontSize: 13 }}>
          Mark attendance to see subject-wise breakdown
        </div>
      )}

      {/* Footer */}
      <div style={{
        padding: "12px 20px",
        borderTop: "1px solid var(--border)",
        background: "var(--muted)",
        fontSize: 11, color: "hsl(var(--muted-foreground))", textAlign: "center",
      }}>
        Click any course row to see detailed estimation & projections
      </div>

      <CourseStatsModal
        stats={selectedStats}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};

export default SubjectBreakdown;
