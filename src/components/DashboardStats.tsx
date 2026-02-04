import { TrendingUp, TrendingDown, AlertTriangle, Calculator } from "lucide-react";

interface DashboardStatsProps {
  bunkStatus: {
    canBunk: number;
    mustAttend: number;
    status: "safe" | "danger" | "neutral";
    message: string;
    currentPercentage: number;
    worstCourse: string | null;
  };
}

const DashboardStats = ({ bunkStatus }: DashboardStatsProps) => {
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
    <div className="mb-6">
      {/* Bunk Status Card */}
      <div className="bg-card rounded-xl p-6 card-shadow animate-fade-in border border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Bunk Calculator (Per Course)
            </h3>
          </div>
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
          {bunkStatus.status === "neutral" && (
            <span className="text-4xl font-bold text-muted-foreground">—</span>
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
        {bunkStatus.worstCourse && (
          <p className="text-xs text-muted-foreground mt-2">
            Based on {bunkStatus.currentPercentage.toFixed(2)}% in {bunkStatus.worstCourse}
          </p>
        )}
      </div>
    </div>
  );
};

export default DashboardStats;