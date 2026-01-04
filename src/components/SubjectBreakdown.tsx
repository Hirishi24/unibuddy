import { SubjectStats } from "@/hooks/useAttendance";
import { BookOpen, TrendingUp, TrendingDown } from "lucide-react";

interface SubjectBreakdownProps {
  stats: SubjectStats[];
}

const SubjectBreakdown = ({ stats }: SubjectBreakdownProps) => {
  const sortedStats = [...stats].sort((a, b) => a.course.localeCompare(b.course));

  const getPercentageClass = (percentage: number, hasData: boolean) => {
    if (!hasData) return "text-muted-foreground";
    if (percentage >= 75) return "attendance-percentage-safe";
    if (percentage >= 65) return "attendance-percentage-warning";
    return "attendance-percentage-danger";
  };

  return (
    <div className="bg-card rounded-lg card-shadow overflow-hidden animate-fade-in border border-border" style={{ animationDelay: "0.2s" }}>
      <div className="p-4 border-b border-border flex items-center gap-2">
        <BookOpen className="h-5 w-5 text-primary" />
        <h2 className="font-semibold text-foreground">Subject Breakdown (Per Course)</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                Subject
              </th>
              <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                Hours
              </th>
              <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                Attended
              </th>
              <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                %
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                Bunk Status
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedStats.map((subject) => {
              const hasData = subject.totalBlocks > 0;
              return (
                <tr
                  key={subject.course}
                  className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="py-3 px-4">
                    <span className="font-medium text-foreground">
                      {subject.course}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-muted-foreground">
                    {hasData ? subject.totalBlocks : "-"}
                  </td>
                  <td className="py-3 px-4 text-center text-muted-foreground">
                    {hasData ? subject.attended : "-"}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`text-sm font-semibold ${getPercentageClass(
                        subject.percentage,
                        hasData
                      )}`}
                    >
                      {hasData ? `${subject.percentage.toFixed(0)}%` : "-"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {hasData ? (
                      <div className="flex items-center justify-end gap-1.5">
                        {subject.status === "safe" ? (
                          <>
                            <TrendingUp className="h-3.5 w-3.5 text-success" />
                            <span className="text-xs font-medium text-success">
                              {subject.canBunk > 0
                                ? `Can bunk ${subject.canBunk}`
                                : "At limit"}
                            </span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="h-3.5 w-3.5 text-danger" />
                            <span className="text-xs font-medium text-danger">
                              Need {subject.mustAttend}
                            </span>
                          </>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {stats.every((s) => s.totalBlocks === 0) && (
        <div className="p-6 text-center text-muted-foreground text-sm">
          Mark attendance to see subject-wise breakdown
        </div>
      )}
    </div>
  );
};

export default SubjectBreakdown;
