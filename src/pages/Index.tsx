import { GraduationCap, RotateCcw } from "lucide-react";
import { timetable, DayName } from "@/data/timetable";
import { useAttendance } from "@/hooks/useAttendance";
import DashboardStats from "@/components/DashboardStats";
import DailySchedule from "@/components/DailySchedule";
import SubjectBreakdown from "@/components/SubjectBreakdown";
import AttendanceCalendar from "@/components/AttendanceCalendar";
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

  const selectedDayName = getDayNameFromDate(selectedDate);
  const isWeekend = !selectedDayName;

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all attendance data?")) {
      resetAllAttendance();
    }
  };

  const handleMarkAttendance = (classId: string, status: "present" | "absent") => {
    markAttendance(classId, status, selectedDate);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-primary text-primary-foreground py-6 px-4 mb-6">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Smart Attendance</h1>
                <p className="text-sm opacity-80">
                  Track your attendance, stay above 75%
                </p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Reset all data"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
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
              {isWeekend && (
                <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                  Weekend
                </span>
              )}
            </div>
            
            {isWeekend ? (
              <div className="flex items-center justify-center h-48 text-muted-foreground">
                <p>No classes on weekends</p>
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