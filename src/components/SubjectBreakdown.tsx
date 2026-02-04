import { useState } from "react";
import { SubjectStats, DetailedCourseStats } from "@/hooks/useAttendance";
import { BookOpen, ChevronRight } from "lucide-react";
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

  const getPercentageClass = (percentage: number, hasData: boolean) => {
    if (!hasData) return "text-muted-foreground";
    if (percentage >= 75) return "attendance-percentage-safe";
    if (percentage >= 65) return "attendance-percentage-warning";
    return "attendance-percentage-danger";
  };

  const handleRowClick = (course: string) => {
    setSelectedCourse(course);
    setModalOpen(true);
  };

  const selectedStats = selectedCourse ? getDetailedCourseStats(selectedCourse) : null;

  return (
    <div className="bg-card rounded-lg card-shadow overflow-hidden animate-fade-in border border-border" style={{ animationDelay: "0.2s" }}>
      <div className="p-4 border-b border-border flex items-center gap-2">
        <BookOpen className="h-5 w-5 text-primary" />
        <h2 className="font-semibold text-foreground">Course Wise Breakdown </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                Course 
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
              <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                Need to Attend  (for 75%)
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                Bunks Left
              </th>
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody>
            {sortedStats.map((subject) => {
              const hasData = subject.totalBlocks > 0;
              return (
                <tr
                  key={subject.course}
                  className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => handleRowClick(subject.course)}
                >
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">
                        {subject.course}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {courseTitles[subject.course] || ""}
                      </span>
                    </div>
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
                  <td className="py-3 px-4 text-center">
                    {(() => {
                      const detailed = getDetailedCourseStats(subject.course);
                      if (!detailed || !hasData) return <span className="text-muted-foreground">-</span>;
                      const mustAttend = detailed.mustAttendFor75;
                      return mustAttend > 0 ? (
                        <span className="text-sm font-semibold text-danger">
                          {mustAttend}
                        </span>
                      ) : (
                        <span className="text-sm text-success">-</span>
                      );
                    })()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {(() => {
                      const detailed = getDetailedCourseStats(subject.course);
                      if (!detailed) return <span className="text-muted-foreground">-</span>;
                      const bunksLeft = detailed.canBunkWithoutOd;
                      const maxBunks = detailed.semesterTotal - detailed.minRequiredFor75;
                      const percentage = maxBunks > 0 ? (bunksLeft / maxBunks) * 100 : 0;
                      const colorClass = percentage <= 0 ? 'text-danger' : percentage < 30 ? 'text-danger' : percentage < 50 ? 'text-warning' : 'text-success';
                      return (
                        <span className="text-sm font-semibold">
                          <span className="text-muted-foreground/60">{bunksLeft}/</span>
                          <span className={colorClass}>{maxBunks}</span>
                        </span>
                      );
                    })()}
                  </td>
                  <td className="py-3 pr-2">
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
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

      <div className="px-4 py-3 border-t border-border bg-muted/30">
        <p className="text-xs text-muted-foreground text-center">
          Click on any course to see detailed bunk estimation &amp; statistics
        </p>
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
