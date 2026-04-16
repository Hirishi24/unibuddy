import { GraduationCap, RotateCcw, CalendarOff, PartyPopper, Moon, Download, Upload, Sparkles, LogIn } from "lucide-react";
import { getNoClassReason, getNoClassMessage } from "@/data/academicCalendar";
import { useAttendance } from "@/hooks/useAttendance";
import DailySchedule from "@/components/DailySchedule";
import SubjectBreakdown from "@/components/SubjectBreakdown";
import AttendanceCalendar from "@/components/AttendanceCalendar";
import CourseStatsModal from "@/components/CourseStatsModal";
import OngoingClass from "@/components/OngoingClass";
import { format } from "date-fns";
import { useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [courseModalOpen, setCourseModalOpen] = useState(false);

  const subjectStats = getSubjectStats();
  const markedDates = getMarkedDates();
  const currentAttendance = getAttendanceForDate(selectedDate);
  const blocksForDate = getBlocksForDate(selectedDate);

  const noClassReason = getNoClassReason(selectedDate);
  const noClassMessage = getNoClassMessage(selectedDate);
  const hasClasses = noClassReason.type === "has_classes";

  const handleReset = () => {
    if (window.confirm("Reset all attendance data?")) resetAllAttendance();
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
    toast({ title: "Exported!", description: "Attendance data saved to Excel file" });
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const result = await importFromExcel(file);
      toast({
        title: result.success ? "Imported!" : "Import Failed",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const getNoClassIcon = () => {
    switch (noClassReason.type) {
      case "holiday": return <PartyPopper className="h-10 w-10 mb-3" style={{ color: "hsl(40 95% 62%)" }} />;
      case "weekend": return <Moon className="h-10 w-10 mb-3" style={{ color: "rgba(255,255,255,0.4)" }} />;
      default:        return <CalendarOff className="h-10 w-10 mb-3" style={{ color: "rgba(255,255,255,0.32)" }} />;
    }
  };

  // Overview stats
  const totalPresent = subjectStats.reduce((s, x) => s + x.attended, 0);
  const totalClasses = subjectStats.reduce((s, x) => s + x.totalBlocks, 0);
  const overallPct = totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 0;
  const safeSubjects = subjectStats.filter(s => s.percentage >= 75).length;

  return (
    <div className="min-h-screen" style={{ background: "var(--col-bg)" }}>

      {/* ─── HEADER ─── */}
      <header className="gradient-primary sticky top-0 z-40 py-5 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center justify-between">

            {/* Logo */}
            <div className="flex items-center gap-3">
              <div style={{
                width: 42, height: 42,
                background: "linear-gradient(135deg, hsl(265 80% 60%), hsl(220 80% 55%))",
                borderRadius: 13,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 16px rgba(120,80,255,0.45), inset 0 1px 0 rgba(255,255,255,0.25)",
              }}>
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-white">Bunk Buddy</h1>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 3,
                    background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.16)",
                    borderRadius: 99, padding: "2px 8px", fontSize: 10, fontWeight: 700,
                    color: "rgba(255,255,255,0.65)", letterSpacing: "0.05em", textTransform: "uppercase",
                  }}>
                    <Sparkles size={8} /> Beta
                  </span>
                </div>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Track your attendance, stay above 75%
                </p>
              </div>
            </div>

            {/* Header actions */}
            <div className="flex items-center gap-1.5">
              {/* Login button */}
              <button
                onClick={() => navigate("/login")}
                title="Login"
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "7px 14px",
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: 10,
                  color: "rgba(255,255,255,0.85)",
                  fontSize: 13, fontWeight: 700,
                  cursor: "pointer",
                  transition: "background 0.2s, border-color 0.2s, transform 0.15s",
                  backdropFilter: "blur(10px)",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.18)";
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.1)";
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                }}
              >
                <LogIn size={14} />
                Login
              </button>

              {[
                { icon: <Download className="h-4 w-4" />, onClick: handleExport, title: "Export to Excel" },
                { icon: <Upload className="h-4 w-4" />,   onClick: handleImportClick, title: "Import from Excel" },
                { icon: <RotateCcw className="h-4 w-4" />, onClick: handleReset, title: "Reset all data" },
              ].map((btn, i) => (
                <button
                  key={i}
                  onClick={btn.onClick}
                  title={btn.title}
                  className="btn-glass-ghost"
                  style={{ padding: "8px", display: "flex", alignItems: "center" }}
                >
                  {btn.icon}
                </button>
              ))}
              <input
                type="file" ref={fileInputRef}
                onChange={handleFileChange} accept=".xlsx,.xls" className="hidden"
              />
            </div>
          </div>
        </div>
      </header>

      {/* ─── MAIN ─── */}
      <main className="container mx-auto max-w-5xl px-4 pb-10 pt-6 space-y-6">

        {/* ── Quick Stats Strip ── */}
        <div className="grid grid-cols-3 gap-4 animate-fade-up" style={{ animationDelay: "0.05s" }}>
          {[
            {
              label: "Overall",
              value: totalClasses > 0 ? `${overallPct}%` : "—",
              sub: `${totalPresent}/${totalClasses} hrs`,
              col: overallPct >= 75 ? "hsl(145 65% 55%)" : overallPct >= 65 ? "hsl(40 95% 62%)" : "hsl(0 72% 65%)",
            },
            {
              label: "Safe Subjects",
              value: `${safeSubjects}/${subjectStats.length}`,
              sub: "≥ 75% attendance",
              col: "hsl(265 80% 70%)",
            },
            {
              label: "Selected",
              value: format(selectedDate, "d MMM"),
              sub: format(selectedDate, "EEEE"),
              col: "hsl(220 90% 68%)",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="glass"
              style={{ padding: "16px 18px", textAlign: "center" }}
            >
              <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                {stat.label}
              </p>
              <p style={{ fontSize: 26, fontWeight: 800, color: stat.col, lineHeight: 1, marginBottom: 4 }}>
                {stat.value}
              </p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Ongoing Class Banner ── */}
        <OngoingClass blocks={blocksForDate} selectedDate={selectedDate} />

        {/* ── Calendar + Schedule ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <AttendanceCalendar
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            markedDates={markedDates}
            getDateSummary={getDateSummary}
          />

          {/* Daily Schedule */}
          <div className="glass" style={{ padding: "20px" }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.85)", marginBottom: 2 }}>
                  {format(selectedDate, "EEEE")}
                </h3>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.38)" }}>
                  {format(selectedDate, "MMMM d, yyyy")}
                </p>
              </div>
              {hasClasses && blocksForDate.length > 0 && (
                <span className="glass-pill" style={{ background: "rgba(168,130,255,0.15)", borderColor: "rgba(168,130,255,0.3)", color: "hsl(265 80% 75%)" }}>
                  {blocksForDate.reduce((s, b) => s + b.duration, 0)} hrs
                </span>
              )}
              {!hasClasses && noClassReason.type === "holiday" && (
                <span className="glass-pill" style={{ background: "rgba(255,165,0,0.15)", borderColor: "rgba(255,165,0,0.28)", color: "hsl(40 95% 65%)" }}>
                  🎉 Holiday
                </span>
              )}
              {!hasClasses && noClassReason.type === "weekend" && (
                <span className="glass-pill">
                  😴 Weekend
                </span>
              )}
            </div>

            {!hasClasses ? (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                {getNoClassIcon()}
                <p style={{ fontWeight: 700, color: "rgba(255,255,255,0.7)", marginBottom: 4 }}>No Classes</p>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>{noClassMessage}</p>
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
              <div className="flex items-center justify-center h-48">
                <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 14 }}>No classes scheduled</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Subject Breakdown ── */}
        <div className="animate-fade-up" style={{ animationDelay: "0.15s" }}>
          <SubjectBreakdown stats={subjectStats} getDetailedCourseStats={getDetailedCourseStats} />
        </div>
      </main>

      {/* Course Modal */}
      <CourseStatsModal
        stats={selectedCourse ? getDetailedCourseStats(selectedCourse) : null}
        open={courseModalOpen}
        onClose={() => setCourseModalOpen(false)}
      />
    </div>
  );
};

export default Index;