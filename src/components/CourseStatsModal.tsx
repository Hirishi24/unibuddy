import { DetailedCourseStats } from "@/hooks/useAttendance";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Target,
  Calendar,
  Clock,
  Shield,
  Zap,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface CourseStatsModalProps {
  stats: DetailedCourseStats | null;
  open: boolean;
  onClose: () => void;
}

const CourseStatsModal = ({ stats, open, onClose }: CourseStatsModalProps) => {
  if (!stats) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "safe":
        return "text-success";
      case "warning":
        return "text-warning";
      case "danger":
        return "text-orange-500";
      case "critical":
        return "text-danger";
      default:
        return "text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "safe":
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case "danger":
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case "critical":
        return <XCircle className="h-5 w-5 text-danger" />;
      default:
        return null;
    }
  };

  const getStatusMessage = () => {
    if (stats.classesHeld === 0) {
      return "No classes held yet. Start marking attendance!";
    }
    if (stats.currentPercentage >= 85) {
      return "Excellent! You have a comfortable buffer.";
    }
    if (stats.currentPercentage >= 75) {
      return "Good! But be careful with bunks.";
    }
    if (stats.currentPercentage >= 65) {
      return "Warning! Attendance is getting low.";
    }
    return "Critical! Immediate action required.";
  };

  const progressColor = () => {
    if (stats.currentPercentage >= 75) return "bg-success";
    if (stats.currentPercentage >= 65) return "bg-warning";
    return "bg-danger";
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getStatusIcon(stats.status)}
            <div>
              <span className="text-lg">{stats.course}</span>
              <span className="text-sm font-normal text-muted-foreground ml-2">
                {stats.courseTitle}
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Current Progress */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Current Attendance</span>
              <span className={`text-2xl font-bold ${getStatusColor(stats.status)}`}>
                {stats.currentPercentage.toFixed(2)}%
              </span>
            </div>
            <div className="relative">
              <Progress value={stats.currentPercentage} className="h-3" />
              {/* 75% marker */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-foreground/50"
                style={{ left: "75%" }}
              />
              <span
                className="absolute -top-5 text-xs text-muted-foreground"
                style={{ left: "75%", transform: "translateX(-50%)" }}
              >
                75%
              </span>
            </div>
            <p className={`text-sm ${getStatusColor(stats.status)}`}>
              {getStatusMessage()}
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={<Calendar className="h-4 w-4 text-primary" />}
              label="Classes Held"
              value={`${stats.classesHeld} / ${stats.semesterTotal}`}
              subtext={`${stats.remainingClasses} remaining`}
            />
            <StatCard
              icon={<CheckCircle2 className="h-4 w-4 text-success" />}
              label="Attended"
              value={`${stats.attended} hrs`}
              subtext={`${stats.missed} missed`}
            />
            <StatCard
              icon={<Target className="h-4 w-4 text-primary" />}
              label="Need to Attend"
              value={`${Math.max(0, stats.mustAttendFor75)} hrs`}
              subtext={stats.mustAttendFor75 > 0 ? `to reach 75%` : `75% achieved ✓`}
            />
            <StatCard
              icon={<Shield className="h-4 w-4 text-warning" />}
              label="OD Allowed"
              value={`${stats.odAllowed} hrs`}
              subtext="15% relaxation"
            />
          </div>

          {/* Bunk Estimation Section */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Zap className="h-4 w-4 text-warning" />
              Bunk Estimation
            </h3>

            {/* Max bunks info - always show */}
            <div className="bg-background/50 rounded-md p-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Max bunks allowed (for 75%)</span>
                <span className="font-semibold">
                  {stats.semesterTotal - stats.minRequiredFor75} hrs
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Already missed</span>
                <span className="font-semibold text-danger">
                  {stats.missed} hrs
                </span>
              </div>
            </div>

            {/* Without OD */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Remaining bunks (without OD)</span>
                <span
                  className={`text-lg font-bold ${
                    stats.canBunkWithoutOd > 0 ? "text-success" : "text-danger"
                  }`}
                >
                  {stats.canBunkWithoutOd} hrs
                </span>
              </div>
              {stats.canBunkWithoutOd > 0 ? (
                <p className="text-xs text-muted-foreground">
                  You can still miss {stats.canBunkWithoutOd} more hour(s) and maintain 75%
                </p>
              ) : (
                <p className="text-xs text-danger">
                  You've used all your bunks! Need to attend {stats.mustAttendFor75} more hours for 75%
                </p>
              )}
            </div>

            {/* With OD */}
            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Remaining bunks (with max OD)</span>
                <span
                  className={`text-lg font-bold ${
                    stats.canBunkWithOd > 0 ? "text-success" : "text-warning"
                  }`}
                >
                  {stats.canBunkWithOd} hrs
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Max bunks with OD = {stats.semesterTotal - stats.minRequiredFor75 + stats.odAllowed} hrs 
                (need only {stats.minRequired} of {stats.semesterTotal} hrs)
              </p>
            </div>

            {/* Must Attend */}
            {stats.mustAttendFor75 > 0 && (
              <div className="bg-danger/10 rounded-md p-3 space-y-1">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-danger" />
                  <span className="font-semibold text-danger">Action Required</span>
                </div>
                <p className="text-sm">
                  Attend <strong>{stats.mustAttendFor75}</strong> more hours to reach 75%
                  attendance.
                </p>
              </div>
            )}

            {/* Safety Margin */}
            {stats.safetyMargin > 0 && (
              <div className="bg-success/10 rounded-md p-3 space-y-1">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-success" />
                  <span className="font-semibold text-success">Safety Buffer</span>
                </div>
                <p className="text-sm">
                  You are <strong>{stats.safetyMargin}</strong> hours above the 75% threshold
                  for classes held so far.
                </p>
              </div>
            )}
          </div>

          {/* Projections */}
          {stats.classesHeld > 0 && stats.remainingClasses > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Semester Projections
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-success/10 rounded-md p-3">
                  <p className="text-muted-foreground">If you attend all remaining</p>
                  <p className="text-lg font-bold text-success">
                    {stats.projectedFinalPercentage.toFixed(2)}%
                  </p>
                </div>
                <div className="bg-danger/10 rounded-md p-3">
                  <p className="text-muted-foreground">If you miss all remaining</p>
                  <p className="text-lg font-bold text-danger">
                    {stats.projectedWorstPercentage.toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Room Info */}
          <div className="text-xs text-muted-foreground pt-2 border-t border-border">
            <span>Rooms: {stats.rooms.join(", ")}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Helper component for stat cards
const StatCard = ({
  icon,
  label,
  value,
  subtext,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext: string;
}) => (
  <div className="bg-muted/30 rounded-md p-3 space-y-1">
    <div className="flex items-center gap-2 text-muted-foreground">
      {icon}
      <span className="text-xs">{label}</span>
    </div>
    <p className="font-semibold">{value}</p>
    <p className="text-xs text-muted-foreground">{subtext}</p>
  </div>
);

export default CourseStatsModal;
