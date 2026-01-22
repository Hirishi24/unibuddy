import { GraduationCap, RotateCcw, CalendarOff, PartyPopper, Moon, Download, Upload } from "lucide-react";
import { getNoClassReason, getNoClassMessage } from "@/data/academicCalendar";
import { useAttendance } from "@/hooks/useAttendance";
import DailySchedule from "@/components/DailySchedule";
import SubjectBreakdown from "@/components/SubjectBreakdown";
import AttendanceCalendar from "@/components/AttendanceCalendar";
import ThemeToggle from "@/components/ThemeToggle";
import CourseStatsModal from "@/components/CourseStatsModal";
import OngoingClass from "@/components/OngoingClass";
import { format } from "date-fns";
import { useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const {
    selectedDate,
    setSelectedDate,
    markAttendance,
    resetAllAttendance,
    getAttendanceForDate,
    getSubjectStats,
    calculateBunkStatus,
    getMarkedDates,
    getDateSummary,
    getBlocksForDate,
    exportToExcel,
    importFromExcel,
    getDetailedCourseStats,
  } = useAttendance();

  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [courseModalOpen, setCourseModalOpen] = useState(false);

  const subjectStats = getSubjectStats();
  const markedDates = getMarkedDates();
  const currentAttendance = getAttendanceForDate(selectedDate);
  const blocksForDate = getBlocksForDate(selectedDate);

  // Check for no-class reason (holiday, weekend, or out of semester)
  const noClassReason = getNoClassReason(selectedDate);
  const noClassMessage = getNoClassMessage(selectedDate);
  const hasClasses = noClassReason.type === "has_classes";

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all attendance data?")) {
      resetAllAttendance();
    }
  };

  const handleMarkAttendance = (blockId: string, status: "present" | "absent") => {
    markAttendance(blockId, status, selectedDate);
  };

  const handleCourseClick = (course: string) => {
    setSelectedCourse(course);
    setCourseModalOpen(true);
  };

  const handleExport = () => {
    exportToExcel();
    toast({
      title: "Exported!",
      description: "Attendance data saved to Excel file",
    });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const result = await importFromExcel(file);
      toast({
        title: result.success ? "Imported!" : "Import Failed",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
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
                <h1 className="text-xl font-bold">Unibuddy</h1>
                <p className="text-sm opacity-80">
                  Track your attendance, stay above 75%
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                onClick={handleExport}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Export to Excel"
              >
                <Download className="h-5 w-5" />
              </button>
              <button
                onClick={handleImportClick}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Import from Excel"
              >
                <Upload className="h-5 w-5" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".xlsx,.xls"
                className="hidden"
              />
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
        {/* Ongoing Class Banner */}
        <OngoingClass blocks={blocksForDate} selectedDate={selectedDate} />

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
              {hasClasses && blocksForDate.length > 0 && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                  {blocksForDate.reduce((sum, block) => sum + block.duration, 0)} hrs
                </span>
              )}
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
            ) : blocksForDate.length > 0 ? (
              <DailySchedule
                blocks={blocksForDate}
                attendance={currentAttendance}
                onMarkAttendance={handleMarkAttendance}
                selectedDate={selectedDate}
                onCourseClick={handleCourseClick}
              />
            ) : (
              <div className="flex items-center justify-center h-48 text-muted-foreground">
                <p>No classes scheduled</p>
              </div>
            )}
          </div>
        </div>

        {/* Subject Breakdown */}
        <SubjectBreakdown stats={subjectStats} getDetailedCourseStats={getDetailedCourseStats} />
      </main>

      {/* Course Stats Modal for daily schedule clicks */}
      <CourseStatsModal
        stats={selectedCourse ? getDetailedCourseStats(selectedCourse) : null}
        open={courseModalOpen}
        onClose={() => setCourseModalOpen(false)}
      />
    </div>
  );
};

export default Index;