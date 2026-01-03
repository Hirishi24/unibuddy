import { GraduationCap, RotateCcw, CalendarOff, PartyPopper, Moon } from "lucide-react";
import { timetable, DayName } from "@/data/timetable";
import { getNoClassReason, getNoClassMessage } from "@/data/academicCalendar";
import { useAttendance } from "@/hooks/useAttendance";
import DashboardStats from "@/components/DashboardStats";
import DailySchedule from "@/components/DailySchedule";
import SubjectBreakdown from "@/components/SubjectBreakdown";
import AttendanceCalendar from "@/components/AttendanceCalendar";
import ThemeToggle from "@/components/ThemeToggle";
import { format } from "date-fns";

const Index = () => {
  const {
    selectedDate,
    setSelectedDate,
    markAttendance,
    resetAllAttendance,
    getAttendanceForDate,
    getOverallStats,
    getSubjectStats,
    calculateBunkStatus,
    getMarkedDates,
    getDateSummary,
  } = useAttendance();

  const overallStats = getOverallStats();
  const subjectStats = getSubjectStats();
  const bunkStatus = calculateBunkStatus();
  const markedDates = getMarkedDates();
  const currentAttendance = getAttendanceForDate(selectedDate);

  // Get day name from selected date
  const getDayNameFromDate = (date: Date): DayName | null => {
    const dayIndex = date.getDay();
    const days: (DayName | null)[] = [null, "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", null];
    return days[dayIndex];
  };

  // Check for no-class reason (holiday, weekend, or out of semester)
  const noClassReason = getNoClassReason(selectedDate);
  const noClassMessage = getNoClassMessage(selectedDate);
  const hasClasses = noClassReason.type === "has_classes";

  const selectedDayName = hasClasses ? getDayNameFromDate(selectedDate) : null;

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all attendance data?")) {
      resetAllAttendance();
    }
  };

  const handleMarkAttendance = (classId: string, status: "present" | "absent") => {
    markAttendance(classId, status, selectedDate);
  };

  // Get appropriate icon for no-class reason
  const getNoClassIcon = () => {
    switch (noClassReason.type) {
      case "holiday":
        return <PartyPopper className="h-12 w-12 text-warning mb-3" />;
      case "weekend":
        return <Moon className="h-12 w-12 text-muted-foreground mb-3" />;
      default:
        return <CalendarOff className="h-12 w-12 text-muted-foreground mb-3" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-primary text-primary-foreground py-6 px-4 mb-6">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-background/20 rounded-lg">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Smart Attendance</h1>
                <p className="text-sm opacity-80">
                  Track your attendance, stay above 75%
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                onClick={handleReset}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Reset all data"
              >
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-4xl px-4 pb-8">
        {/* Dashboard Stats */}
        <DashboardStats
          percentage={overallStats.percentage}
          totalMarked={overallStats.totalMarked}
          totalPresent={overallStats.totalPresent}
          bunkStatus={bunkStatus}
        />

        {/* Calendar and Schedule Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Calendar */}
          <AttendanceCalendar
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            markedDates={markedDates}
            getDateSummary={getDateSummary}
          />

          {/* Daily Schedule */}
          <div className="bg-card rounded-xl p-4 card-shadow border border-border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                {format(selectedDate, "EEEE, MMM d")}
              </h3>
              {!hasClasses && noClassReason.type === "holiday" && (
                <span className="text-xs bg-warning/20 text-warning px-2 py-1 rounded-full font-medium">
                  Holiday
                </span>
              )}
              {!hasClasses && noClassReason.type === "weekend" && (
                <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                  Weekend
                </span>
              )}
            </div>
            
            {!hasClasses ? (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                {getNoClassIcon()}
                <p className="text-foreground font-medium mb-1">No Classes</p>
                <p className="text-sm text-muted-foreground">{noClassMessage}</p>
              </div>
            ) : selectedDayName && timetable[selectedDayName] ? (
              <DailySchedule
                day={selectedDayName}
                attendance={currentAttendance}
                onMarkAttendance={handleMarkAttendance}
              />
            ) : (
              <div className="flex items-center justify-center h-48 text-muted-foreground">
                <p>No classes scheduled</p>
              </div>
            )}
          </div>
        </div>

        {/* Subject Breakdown */}
        <SubjectBreakdown stats={subjectStats} />
      </main>
    </div>
  );
};

export default Index;