import { TrendingUp, TrendingDown, AlertTriangle, Target } from "lucide-react";

interface DashboardStatsProps {
  percentage: number;
  totalMarked: number;
  totalPresent: number;
  bunkStatus: {
    canBunk: number;
    mustAttend: number;
    status: "safe" | "danger" | "neutral";
    message: string;
  };
}

const DashboardStats = ({
  percentage,
  totalMarked,
  totalPresent,
  bunkStatus,
}: DashboardStatsProps) => {
  const getPercentageClass = () => {
    if (percentage >= 75) return "attendance-percentage-safe";
    if (percentage >= 65) return "attendance-percentage-warning";
    return "attendance-percentage-danger";
  };

  const getStatusBadgeClass = () => {
    if (bunkStatus.status === "safe") return "status-badge-success";
    if (bunkStatus.status === "danger") return "status-badge-danger";
    return "bg-muted text-muted-foreground";
  };

  const getStatusIcon = () => {
    if (bunkStatus.status === "safe") return <TrendingUp className="h-5 w-5" />;
    if (bunkStatus.status === "danger") return <TrendingDown className="h-5 w-5" />;
    return <AlertTriangle className="h-5 w-5" />;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {/* Overall Attendance Card */}
      <div className="bg-card rounded-lg p-6 card-shadow animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Overall Attendance
          </h3>
          <Target className="h-5 w-5 text-primary" />
        </div>
        <div className="flex items-end gap-2">
          <span className={`text-4xl font-bold ${getPercentageClass()}`}>
            {percentage.toFixed(1)}%
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {totalPresent} of {totalMarked} classes attended
        </p>
        <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              percentage >= 75
                ? "bg-success"
                : percentage >= 65
                ? "bg-warning"
                : "bg-danger"
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
          <span>0%</span>
          <span className="font-medium">75% min</span>
          <span>100%</span>
        </div>
      </div>

      {/* Bunk Status Card */}
      <div className="bg-card rounded-lg p-6 card-shadow animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Bunk Status
          </h3>
          <div className={`p-2 rounded-full ${getStatusBadgeClass()}`}>
            {getStatusIcon()}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {bunkStatus.status === "safe" && bunkStatus.canBunk > 0 && (
            <span className="text-4xl font-bold text-success">
              {bunkStatus.canBunk}
            </span>
          )}
          {bunkStatus.status === "danger" && bunkStatus.mustAttend > 0 && (
            <span className="text-4xl font-bold text-danger">
              {bunkStatus.mustAttend}
            </span>
          )}
        </div>
        <p
          className={`text-sm mt-2 font-medium ${
            bunkStatus.status === "safe"
              ? "text-success"
              : bunkStatus.status === "danger"
              ? "text-danger"
              : "text-muted-foreground"
          }`}
        >
          {bunkStatus.message}
        </p>
        {bunkStatus.status === "safe" && (
          <p className="text-xs text-muted-foreground mt-2">
            You're above 75% — some wiggle room available!
          </p>
        )}
        {bunkStatus.status === "danger" && (
          <p className="text-xs text-muted-foreground mt-2">
            Focus on attending classes consistently.
          </p>
        )}
      </div>
    </div>
  );
};

export default DashboardStats;
