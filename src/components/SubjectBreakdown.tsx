import { useState } from "react";
import { SubjectStats, DetailedCourseStats } from "@/hooks/useAttendance";
import { BookOpen, ChevronRight, TrendingUp } from "lucide-react";
import CourseStatsModal from "./CourseStatsModal";
import { courseTitles } from "@/data/timetable";

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
          background: "linear-gradient(135deg, hsl(0 88% 48%), hsl(15 85% 44%))",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 10px rgba(200,20,20,0.4)",
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
          <TrendingUp size={16} style={{ color: "rgba(255,255,255,0.2)" }} />
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }} className="glass-table">
          <thead>
            <tr>
              {["Course", "Hours", "Attended", "%", "Need (75%)", "Bunks Left", ""].map((h, i) => (
                <th key={i} style={{ textAlign: i === 0 ? "left" : i === 5 ? "right" : "center" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedStats.map((subject) => {
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
                        {courseTitles[subject.course] || ""}
                      </span>
                    </div>
                  </td>
                  {/* Hours */}
                  <td style={{ textAlign: "center", color: "hsl(var(--muted-foreground))" }}>
                    {hasData ? subject.totalBlocks : "—"}
                  </td>
                  {/* Attended */}
                  <td style={{ textAlign: "center", color: "hsl(var(--muted-foreground))" }}>
                    {hasData ? subject.attended : "—"}
                  </td>
                  {/* % */}
                  <td style={{ textAlign: "center" }}>
                    <span style={{ fontWeight: 800, fontSize: 13, color: pctColor }}>
                      {hasData ? `${subject.percentage.toFixed(0)}%` : "—"}
                    </span>
                  </td>
                  {/* Need to attend */}
                  <td style={{ textAlign: "center" }}>
                    {detailed && hasData ? (
                      detailed.mustAttendFor75 > 0 ? (
                        <span style={{ fontWeight: 700, fontSize: 13, color: "hsl(0 72% 62%)" }}>
                          {detailed.mustAttendFor75}
                        </span>
                      ) : (
                        <span style={{ color: "hsl(145 65% 55%)", fontSize: 13 }}>✓</span>
                      )
                    ) : (
                      <span style={{ color: "hsl(var(--muted-foreground) / 0.3)" }}>—</span>
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
                    <ChevronRight size={14} style={{ color: "rgba(255,255,255,0.2)" }} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {allEmpty && (
        <div style={{ padding: "28px 20px", textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
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
