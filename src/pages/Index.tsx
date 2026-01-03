import { useState } from "react";
import { GraduationCap, RotateCcw } from "lucide-react";
import { getCurrentDay } from "@/data/timetable";
import { useAttendance } from "@/hooks/useAttendance";
import DashboardStats from "@/components/DashboardStats";
import DaySelector from "@/components/DaySelector";
import DailySchedule from "@/components/DailySchedule";
import SubjectBreakdown from "@/components/SubjectBreakdown";

const Index = () => {
  const [selectedDay, setSelectedDay] = useState(getCurrentDay());
  const {
    attendance,
    markAttendance,
    resetAllAttendance,
    getOverallStats,
    getSubjectStats,
    calculateBunkStatus,
  } = useAttendance();

  const overallStats = getOverallStats();
  const subjectStats = getSubjectStats();
  const bunkStatus = calculateBunkStatus();

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all attendance data?")) {
      resetAllAttendance();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-primary text-primary-foreground py-6 px-4 mb-6">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-foreground/20 rounded-lg">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Smart Attendance</h1>
                <p className="text-sm text-primary-foreground/80">
                  Track your attendance, stay above 75%
                </p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="p-2 hover:bg-primary-foreground/20 rounded-lg transition-colors"
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

        {/* Day Selector */}
        <div className="mb-4">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Daily Schedule
          </h2>
          <DaySelector selectedDay={selectedDay} onSelectDay={setSelectedDay} />
        </div>

        {/* Daily Schedule */}
        <div className="mb-8">
          <DailySchedule
            day={selectedDay}
            attendance={attendance}
            onMarkAttendance={markAttendance}
          />
        </div>

        {/* Subject Breakdown */}
        <SubjectBreakdown stats={subjectStats} />
      </main>
    </div>
  );
};

export default Index;
