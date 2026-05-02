import { useState } from "react";
import { GraduationCap, ChevronRight, X } from "lucide-react";

export interface SubjectMark {
  courseCode: string;
  courseTitle: string;
  ca1?: number | null;
  ca1Max?: number;
  ca2?: number | null;
  ca2Max?: number;
  cae?: number | null;
  caeMax?: number;
  assignment?: number | null;
  assignmentMax?: number;
  total?: number | null;
  totalMax?: number;
  grade?: string;
}

interface Props {
  marks: SubjectMark[];
  cgpa?: string;
}

const gradeColor = (grade?: string): string => {
  if (!grade) return "hsl(var(--muted-foreground))";
  const g = grade.trim().toUpperCase();
  if (g === "O") return "#34d399";
  if (g === "A+") return "#60a5fa";
  if (g === "A") return "#818cf8";
  if (g === "B+") return "#fbbf24";
  if (g === "B") return "#fb923c";
  if (g === "C") return "#f87171";
  return "hsl(var(--muted-foreground))";
};

const gradePoints = (grade?: string): string => {
  if (!grade) return "—";
  const map: Record<string, string> = { O: "10", "A+": "9", A: "8", "B+": "7", B: "6", C: "5", F: "0" };
  return map[grade.trim().toUpperCase()] ?? "—";
};

const fmt = (v?: number | null) => (v == null ? "—" : String(v));
const pct = (v?: number | null, max?: number) =>
  v == null || !max ? "—" : `${Math.round((v / max) * 100)}%`;

const ScoreBox = ({ label, value, max, color }: { label: string; value?: number | null; max?: number; color: string }) => (
  <div style={{
    flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
    padding: "12px 8px", borderRadius: 14,
    border: `1px solid ${color}30`, background: `${color}0d`, gap: 2,
  }}>
    <span style={{ fontSize: 20, fontWeight: 900, color }}>{fmt(value)}</span>
    <span style={{ fontSize: 10, color: "hsl(var(--muted-foreground))" }}>/{max ?? "—"}</span>
    <span style={{ fontSize: 9, fontWeight: 800, color: "hsl(var(--muted-foreground))", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 2 }}>{label}</span>
  </div>
);

const DetailModal = ({ mark, onClose }: { mark: SubjectMark; onClose: () => void }) => {
  const gc = gradeColor(mark.grade);
  const totalPct = mark.total != null && mark.totalMax ? (mark.total / mark.totalMax) * 100 : 0;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 560,
          background: "hsl(var(--card))", borderTopLeftRadius: 28, borderTopRightRadius: 28,
          border: "1px solid hsl(var(--border))", borderBottom: "none",
          padding: "24px 24px 40px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: "hsl(var(--foreground))", marginBottom: 4 }}>{mark.courseTitle}</h3>
            <span style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>{mark.courseCode}</span>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 10, background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Grade", val: mark.grade ?? "—", color: gc },
            { label: "Points", val: gradePoints(mark.grade), color: gc },
            { label: "Score %", val: pct(mark.total, mark.totalMax), color: gc },
          ].map(({ label, val, color }) => (
            <div key={label} style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
              padding: "14px 8px", borderRadius: 18,
              border: `1px solid ${color}30`, background: `${color}10`,
            }}>
              <span style={{ fontSize: 26, fontWeight: 900, color }}>{val}</span>
              <span style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", marginTop: 4, fontWeight: 600 }}>{label}</span>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 10, fontWeight: 800, color: "hsl(var(--muted-foreground))", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Component Breakdown</p>
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          <ScoreBox label="CA1" value={mark.ca1} max={mark.ca1Max} color="#60a5fa" />
          <ScoreBox label="CA2" value={mark.ca2} max={mark.ca2Max} color="#a78bfa" />
          <ScoreBox label="CAE" value={mark.cae} max={mark.caeMax} color="#6366f1" />
          {mark.assignmentMax ? <ScoreBox label="Assign" value={mark.assignment} max={mark.assignmentMax} color="#fbbf24" /> : null}
        </div>

        <p style={{ fontSize: 10, fontWeight: 800, color: "hsl(var(--muted-foreground))", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Total</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
          <span style={{ fontSize: 32, fontWeight: 900, color: "hsl(var(--foreground))" }}>{fmt(mark.total)}</span>
          <span style={{ fontSize: 14, color: "hsl(var(--muted-foreground))" }}>out of {mark.totalMax ?? "—"}</span>
        </div>
        <div style={{ height: 8, borderRadius: 4, background: "hsl(var(--muted))", overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: 4, width: `${Math.min(totalPct, 100)}%`, background: gc, transition: "width 0.6s ease" }} />
        </div>
      </div>
    </div>
  );
};

export default function MarksBreakdown({ marks, cgpa }: Props) {
  const [selected, setSelected] = useState<SubjectMark | null>(null);

  if (!marks || marks.length === 0) return null;

  return (
    <div className="glass" style={{ overflow: "hidden" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "18px 20px", borderBottom: "1px solid var(--border)",
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 10, flexShrink: 0,
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 10px rgba(99,102,241,0.35)",
        }}>
          <GraduationCap size={15} style={{ color: "white" }} />
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "hsl(var(--foreground) / 0.9)" }}>Marks &amp; Grades</h2>
          <p style={{ fontSize: 11, color: "hsl(var(--muted-foreground))" }}>Click any row for component details</p>
        </div>
        {cgpa && (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "flex-end",
          }}>
            <span style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>CGPA</span>
            <span style={{ fontSize: 20, fontWeight: 900, color: "#34d399", lineHeight: 1 }}>{cgpa}</span>
          </div>
        )}
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }} className="glass-table">
          <thead>
            <tr>
              <th className="text-left">Course</th>
              <th className="text-center hidden sm:table-cell">CA1</th>
              <th className="text-center hidden sm:table-cell">CA2</th>
              <th className="text-center hidden md:table-cell">CAE</th>
              <th className="text-center">Total</th>
              <th className="text-center">Grade</th>
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody>
            {marks.map((mark) => {
              const gc = gradeColor(mark.grade);
              const totalPct = mark.total != null && mark.totalMax ? (mark.total / mark.totalMax) * 100 : 0;
              return (
                <tr
                  key={mark.courseCode}
                  onClick={() => setSelected(mark)}
                  className="cursor-pointer hover:bg-muted/30 transition-colors"
                >
                  <td>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{mark.courseTitle}</div>
                      <div style={{ fontSize: 11, color: "hsl(var(--muted-foreground))" }}>{mark.courseCode}</div>
                      <div style={{ marginTop: 4, height: 3, borderRadius: 2, background: "hsl(var(--muted))", width: "80%", overflow: "hidden" }}>
                        <div style={{ height: "100%", borderRadius: 2, width: `${Math.min(totalPct, 100)}%`, background: gc }} />
                      </div>
                    </div>
                  </td>
                  <td className="text-center hidden sm:table-cell">
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{fmt(mark.ca1)}</span>
                    <span style={{ fontSize: 10, color: "hsl(var(--muted-foreground))" }}>/{mark.ca1Max ?? "—"}</span>
                  </td>
                  <td className="text-center hidden sm:table-cell">
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{fmt(mark.ca2)}</span>
                    <span style={{ fontSize: 10, color: "hsl(var(--muted-foreground))" }}>/{mark.ca2Max ?? "—"}</span>
                  </td>
                  <td className="text-center hidden md:table-cell">
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{fmt(mark.cae)}</span>
                    <span style={{ fontSize: 10, color: "hsl(var(--muted-foreground))" }}>/{mark.caeMax ?? "—"}</span>
                  </td>
                  <td className="text-center">
                    <span style={{ fontSize: 14, fontWeight: 800 }}>{fmt(mark.total)}</span>
                    <span style={{ fontSize: 10, color: "hsl(var(--muted-foreground))" }}>/{mark.totalMax ?? "—"}</span>
                  </td>
                  <td className="text-center">
                    {mark.grade ? (
                      <span style={{
                        fontSize: 13, fontWeight: 900, padding: "3px 10px", borderRadius: 8,
                        background: `${gc}1a`, color: gc, border: `1px solid ${gc}40`,
                      }}>{mark.grade}</span>
                    ) : <span style={{ color: "hsl(var(--muted-foreground))" }}>—</span>}
                  </td>
                  <td><ChevronRight size={14} style={{ color: "hsl(var(--muted-foreground) / 0.4)" }} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selected && <DetailModal mark={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
