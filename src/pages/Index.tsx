import { GraduationCap, RotateCcw, CalendarOff, PartyPopper, Moon, Download, Upload, Sparkles, LogIn, UserPlus, ChevronDown } from "lucide-react";
import { getNoClassReason, getNoClassMessage } from "@/data/academicCalendar";
import { useAttendance } from "@/hooks/useAttendance";
import DailySchedule from "@/components/DailySchedule";
import SubjectBreakdown from "@/components/SubjectBreakdown";
import AcademicCalendar from "@/components/AttendanceCalendar";
import CourseStatsModal from "@/components/CourseStatsModal";
import OngoingClass from "@/components/OngoingClass";
import { GooeyMenu } from "@/components/GooeyMenu";
import { format } from "date-fns";
import { useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { SwitchMode } from "@/components/ui/switch-mode";

declare global {
  interface Window {
    profileTimer: any;
  }
}

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
    dataSource,
    profile,
    isLoading: dataLoading,
  } = useAttendance();

  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

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

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
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

      {/* ─── FLOATING GLASS NAV ─── */}
      <nav style={{
        position: "sticky", top: 12, zIndex: 40,
        maxWidth: 1280, margin: "0 auto",
        padding: "0 20px",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 20px",
          background: "var(--glass-bg-strong)",
          backdropFilter: "var(--glass-blur)",
          WebkitBackdropFilter: "var(--glass-blur)",
          border: "1px solid var(--glass-border)",
          borderRadius: 16,
          boxShadow: "var(--shadow-card)",
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36,
              background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent) / 0.8))",
              borderRadius: 11,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 10px hsl(var(--primary) / 0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
            }}>
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: "hsl(var(--foreground))" }}>
                  Unibuddy
                </span>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 3,
                  background: "hsl(var(--primary) / 0.15)", border: "1px solid hsl(var(--primary) / 0.28)",
                  borderRadius: 99, padding: "1px 7px", fontSize: 9, fontWeight: 700,
                  color: "hsl(var(--primary))", letterSpacing: "0.06em", textTransform: "uppercase" as const,
                }}>
                  <Sparkles size={7} /> Beta
                </span>
              </div>
              <p style={{ fontSize: 11, color: "hsl(var(--muted-foreground))", margin: 0, display: "flex", alignItems: "center", gap: 5 }}>
                Track your attendance 
                <span style={{ fontSize: 9, opacity: 0.5 }}>•</span>
                <span style={{ 
                  color: dataSource === "Live Portal" ? "hsl(145 65% 55%)" : "hsl(40 95% 62%)",
                  fontWeight: 600
                }}>
                  {dataSource}
                </span>
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {profile ? (
              <div 
                onMouseEnter={() => {
                  if (window.profileTimer) clearTimeout(window.profileTimer);
                  setIsProfileOpen(true);
                }}
                onMouseLeave={() => {
                  window.profileTimer = setTimeout(() => setIsProfileOpen(false), 250);
                }}
              >
                <DropdownMenu open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                  <DropdownMenuTrigger asChild>
                    <button style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "4px 12px 4px 6px",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 99,
                      cursor: "pointer"
                    }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: "50%",
                        background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent) / 0.8))",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        border: "1px solid rgba(255,255,255,0.2)",
                        boxShadow: "0 2px 8px hsl(var(--primary) / 0.3)"
                      }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: "white" }}>
                          {profile.name?.charAt(0) || "S"}
                        </span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "white", lineHeight: 1.2 }}>
                          {profile.name?.split(' ')[0] || "Student"}
                        </span>
                        <span style={{ fontSize: 10, fontWeight: 500, color: "rgba(255,255,255,0.4)", letterSpacing: "0.02em" }}>
                          {profile.regNo || "AP23..."}
                        </span>
                      </div>
                      <ChevronDown size={12} style={{ opacity: 0.4, marginLeft: 2 }} />
                    </button>
                  </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  sideOffset={-4}
                  onMouseEnter={() => {
                    if (window.profileTimer) clearTimeout(window.profileTimer);
                    setIsProfileOpen(true);
                  }}
                  onMouseLeave={() => {
                    window.profileTimer = setTimeout(() => setIsProfileOpen(false), 250);
                  }}
                  className="w-64 backdrop-blur-3xl"
                  style={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 16, padding: 8, color: "var(--popover-foreground)", boxShadow: "var(--shadow-card-hover)" }}
                >
                  <GooeyMenu 
                    data={[
                      {
                        key: 'reg',
                        label: 'Registration',
                        value: profile.regNo || 'AP23...',
                        labelClass: 'text-[10px] text-muted-foreground',
                        valueClass: 'bg-muted border border-border px-2 py-0.5 rounded-full text-foreground/90 font-mono'
                      },
                      {
                        key: 'sem',
                        label: 'Current Term',
                        value: profile.semester || 'Semester 4',
                        labelClass: 'text-[10px] text-muted-foreground',
                      },
                      {
                        key: 'sec',
                        label: 'Section',
                        value: profile.section || 'A',
                        labelClass: 'text-[10px] text-muted-foreground',
                        valueClass: 'text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/10'
                      },
                      {
                        key: 'prog',
                        label: 'Program',
                        value: profile.program || 'B.Tech CSE',
                        labelClass: 'text-[10px] text-muted-foreground',
                      }
                    ]} 
                  />
                  <DropdownMenuSeparator style={{ background: "rgba(255,255,255,0.05)", margin: "8px 4px" }} />
                  <DropdownMenuItem 
                    onClick={handleLogout} 
                    className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold text-red-500/80 hover:bg-red-500/10 hover:text-red-500 rounded-lg cursor-pointer transition-colors"
                  >
                     Log out
                     <RotateCcw size={12} />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            ) : (
              <DropdownMenu>
                <div style={{ display: "flex", borderRadius: 10, overflow: "hidden" }}>
                  {/* Primary action */}
                  <button
                    onClick={() => navigate("/login")}
                    style={{
                      display: "flex", alignItems: "center", gap: 5,
                      padding: "6px 14px",
                      background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))",
                      border: "none", borderRight: "1px solid rgba(0,0,0,0.25)",
                      color: "white", fontSize: 12, fontWeight: 700,
                      cursor: "pointer",
                      transition: "filter 0.15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.filter = "brightness(1.15)"}
                    onMouseLeave={e => e.currentTarget.style.filter = "brightness(1)"}
                  >
                    <LogIn size={13} />
                    Login
                  </button>
                  {/* Dropdown trigger */}
                  <DropdownMenuTrigger asChild>
                    <button
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        padding: "6px 8px",
                        background: "linear-gradient(135deg, hsl(var(--primary) / 0.9), hsl(var(--accent) / 0.9))",
                        border: "none",
                        color: "white",
                        cursor: "pointer",
                        transition: "filter 0.15s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.filter = "brightness(1.2)"}
                      onMouseLeave={e => e.currentTarget.style.filter = "brightness(1)"}
                    >
                      <ChevronDown size={14} />
                    </button>
                  </DropdownMenuTrigger>
                </div>
                <DropdownMenuContent
                  align="end"
                  sideOffset={8}
                  className="min-w-[160px]"
                  style={{
                    background: "hsl(0 5% 8%)",
                    border: "1px solid rgba(220,30,30,0.2)",
                    borderRadius: 12,
                    boxShadow: "0 12px 40px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,80,80,0.08)",
                    backdropFilter: "blur(32px)",
                    padding: 6,
                  }}
                >
                  <DropdownMenuLabel style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", padding: "4px 8px" }}>
                    Account
                  </DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => navigate("/login")}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, color: "rgba(255,255,255,0.85)", cursor: "pointer", fontSize: 13 }}
                  >
                    <LogIn size={14} style={{ color: "hsl(0 88% 60%)" }} />
                    Login
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate("/login")}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, color: "rgba(255,255,255,0.85)", cursor: "pointer", fontSize: 13 }}
                  >
                    <UserPlus size={14} style={{ color: "hsl(145 62% 52%)" }} />
                    Register
                  </DropdownMenuItem>
                  <DropdownMenuSeparator style={{ background: "rgba(255,255,255,0.06)", margin: "4px 0" }} />
                  <DropdownMenuItem
                    onClick={() => navigate("/")}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, color: "rgba(255,255,255,0.45)", cursor: "pointer", fontSize: 12 }}
                  >
                    Continue as Guest
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}


            <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.08)", margin: "0 2px" }} />

            {[
              { icon: <Download className="h-3.5 w-3.5" />, onClick: handleExport, title: "Export" },
              { icon: <Upload className="h-3.5 w-3.5" />, onClick: handleImportClick, title: "Import" },
              { icon: <RotateCcw className="h-3.5 w-3.5" />, onClick: handleReset, title: "Reset" },
            ].map((btn, i) => (
              <button
                key={i}
                onClick={btn.onClick}
                title={btn.title}
                style={{
                  width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
                  background: "var(--glass-bg)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: 8, color: "hsl(var(--muted-foreground))",
                  cursor: "pointer", transition: "all 0.2s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(220,30,30,0.12)";
                  e.currentTarget.style.borderColor = "rgba(220,30,30,0.28)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.85)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.45)";
                }}
              >
                {btn.icon}
              </button>
            ))}

            <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.08)", margin: "0 2px" }} />

            {/* Theme toggle */}
            <SwitchMode width={56} height={28} />

            <input
              type="file" ref={fileInputRef}
              onChange={handleFileChange} accept=".xlsx,.xls" className="hidden"
            />
          </div>
        </div>
      </nav>

      {/* ─── MAIN ─── */}
      <main className="container mx-auto max-w-7xl px-5 pb-10 pt-6 space-y-6">

        {/* ── Quick Stats Strip ── */}
        <div className="grid grid-cols-2 gap-4 animate-fade-up" style={{ animationDelay: "0.05s" }}>
          {[
            {
              label: "Safe Subjects",
              value: `${safeSubjects}/${subjectStats.length}`,
              sub: "≥ 75% attendance",
              col: "hsl(var(--primary))",
            },
            {
              label: "Selected",
              value: format(selectedDate, "d MMM"),
              sub: format(selectedDate, "EEEE"),
              col: "hsl(var(--accent))",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="glass"
              style={{ padding: "16px 18px", textAlign: "center" }}
            >
              <p style={{ fontSize: 11, fontWeight: 600, color: "hsl(var(--muted-foreground))", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                {stat.label}
              </p>
              <p style={{ fontSize: 26, fontWeight: 800, color: stat.col, lineHeight: 1, marginBottom: 4 }}>
                {stat.value}
              </p>
              <p style={{ fontSize: 11, color: "hsl(var(--muted-foreground) / 0.8)" }}>{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Ongoing Class Banner ── */}
        <OngoingClass blocks={blocksForDate} selectedDate={selectedDate} />

        {/* ── Calendar + Schedule ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <div className="flex flex-col">
            <AcademicCalendar
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              markedDates={markedDates}
              getDateSummary={getDateSummary}
            />
          </div>
          
          <div className="glass flex flex-col" style={{ padding: "20px" }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "hsl(var(--foreground) / 0.9)", marginBottom: 2 }}>
                  {format(selectedDate, "EEEE")}
                </h3>
                <p style={{ fontSize: 11, color: "hsl(var(--muted-foreground))" }}>
                  {format(selectedDate, "MMMM d, yyyy")}
                </p>
              </div>
              {hasClasses && blocksForDate.length > 0 && (
                <span className="glass-pill" style={{ background: "rgba(168,130,255,0.15)", borderColor: "rgba(168,130,255,0.3)", color: "hsl(265 80% 75%)" }}>
                  {blocksForDate.reduce((s, b) => s + b.duration, 0)} hrs
                </span>
              )}
            </div>

            <div className="flex-1 flex flex-col justify-center">
              {!hasClasses ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
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
                <div className="flex items-center justify-center py-8">
                  <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 14 }}>No classes scheduled</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Scroll Hint ── */}
        <div className="flex flex-col items-center justify-center py-6 animate-fade-up" style={{ animationDelay: "0.2s" }}>
          <div className="h-px w-20 bg-gradient-to-r from-transparent via-red-500/20 to-transparent mb-4" />
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 flex items-center gap-2">
            <span className="animate-bounce">↓</span> Scroll down to view attendance <span className="animate-bounce">↓</span>
          </p>
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