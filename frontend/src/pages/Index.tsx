import { GraduationCap, RotateCcw, CalendarOff, PartyPopper, Moon, Download, Upload, LogIn, ChevronDown, CalendarClock } from "lucide-react";
import { getNoClassReason, getNoClassMessage } from "@/data/globalAcademicCalendar";
import { useAttendance } from "@/hooks/useAttendance";
import DailySchedule from "@/components/DailySchedule";
import SubjectBreakdown from "@/components/SubjectBreakdown";
import MarksBreakdown from "@/components/MarksBreakdown";
import AcademicCalendar from "@/components/AttendanceCalendar";
import CourseStatsModal from "@/components/CourseStatsModal";
import OngoingClass from "@/components/OngoingClass";
import { GooeyMenu } from "@/components/GooeyMenu";
import { UserTour } from "@/components/UserTour";
import { getStoredData } from "@/storage.ts";

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
  
  // Show blocks if it's a normal class day OR a swapped day OR a cancelled day (to show cancelled cards)
  const shouldShowSchedule = noClassReason.type === "has_classes" || noClassReason.type === "day_swap" || noClassReason.type === "cancelled";


  const handleReset = () => {
    if (window.confirm("Reset all attendance data?")) resetAllAttendance();
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
    toast({ title: "Logged out", description: "All session data cleared locally." });
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
      case "weekend": return <Moon className="h-10 w-10 mb-3" style={{ color: "hsl(var(--muted-foreground) / 0.5)" }} />;
      default:        return <CalendarOff className="h-10 w-10 mb-3" style={{ color: "hsl(var(--muted-foreground) / 0.4)" }} />;
    }
  };

  const safeSubjects = subjectStats.filter(s => s.percentage >= 75).length;

  const storedData = getStoredData() as any;
  const marks = storedData?.marks ?? [];
  const cgpa = storedData?.cgpa ?? profile?.cgpa ?? "";

  return (
    <div className="min-h-screen" style={{ background: "var(--col-bg)" }}>
      <UserTour />

      <nav className="sticky top-3 z-40 w-full max-w-7xl mx-auto px-3 sm:px-5">
        <div className="flex items-center justify-between p-2 sm:p-3 sm:px-5 glass-strong rounded-2xl shadow-card">

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 10px hsl(var(--primary) / 0.3)", overflow: "hidden" }}>
              <img src="/favicon.png" alt="Unibuddy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-sm sm:text-base font-black text-foreground tracking-tighter">Unibuddy</span>
                  <div className="hidden xs:flex items-center gap-1.5 px-2 py-1 bg-primary/10 border border-primary/20 rounded-lg text-[10px] sm:text-xs font-bold text-primary shadow-sm">
                    <CalendarClock size={12} className="opacity-70" />
                    {format(selectedDate, "EEE, d MMM")}
                  </div>
                </div>
                <p className="hidden sm:block text-[10px] text-muted-foreground opacity-70">Dashboard • {dataSource}</p>
            </div>

          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {profile ? (
              <div>
                <DropdownMenu open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                  <DropdownMenuTrigger asChild>
                    <button 
                      onClick={() => setIsProfileOpen(prev => !prev)}
                      className="flex items-center gap-2 p-1 pr-3 sm:pr-4 bg-muted border border-border rounded-full hover:bg-muted/80 transition-all"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent/80 flex items-center justify-center border border-primary/30 shadow-sm">
                        <span className="text-xs font-black text-white">{profile.name?.charAt(0) || "S"}</span>
                      </div>
                      <div className="hidden md:flex flex-col items-start">
                        <span className="text-xs font-bold text-foreground leading-none">{profile.name || "Student"}</span>
                        <span className="text-[9px] font-medium text-muted-foreground">{profile.regNo || "AP23..."}</span>
                      </div>
                      <ChevronDown size={12} className={`opacity-40 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end" sideOffset={6} className="w-64"
                    style={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 16, padding: 8, color: "hsl(var(--popover-foreground))", boxShadow: "var(--shadow-card-hover)", backdropFilter: "blur(20px)" }}
                  >
                    <GooeyMenu 
                      data={[
                        { key: 'reg', label: 'Registration', value: profile.regNo || 'AP23...', labelClass: 'text-[10px] text-muted-foreground', valueClass: 'bg-muted border border-border px-2 py-0.5 rounded-full font-mono' },
                        { key: 'sem', label: 'Current Term', value: profile.semester || 'Semester 4', labelClass: 'text-[10px] text-muted-foreground' },
                        { key: 'sec', label: 'Section', value: profile.section || 'A', labelClass: 'text-[10px] text-muted-foreground', valueClass: 'text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/10' },
                        { key: 'prog', label: 'Program', value: profile.program || 'B.Tech CSE', labelClass: 'text-[10px] text-muted-foreground' }
                      ]} 
                    />
                    <DropdownMenuSeparator style={{ background: "hsl(var(--border))", margin: "8px 4px" }} />
                    <DropdownMenuItem 
                      onClick={handleLogout} 
                      className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold text-red-500/80 hover:bg-red-500/10 hover:text-red-500 rounded-lg cursor-pointer"
                    >
                       Log out
                       <RotateCcw size={12} />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
            <button onClick={() => navigate("/")} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:brightness-110 trans-all"><LogIn size={14}/> Login</button>
            )}
            <div className="hidden sm:flex gap-2">
              {[
                { icon: <Download size={14}/>, onClick: handleExport, title: "Export" },
                { icon: <Upload size={14}/>, onClick: handleImportClick, title: "Import" },
                { icon: <RotateCcw size={14}/>, onClick: handleReset, title: "Reset" },
              ].map((btn, i) => (
                <button key={i} onClick={btn.onClick} title={btn.title} className="w-8 h-8 flex items-center justify-center rounded-lg border border-border bg-muted hover:bg-primary/10 hover:text-primary transition-all">
                  {btn.icon}
                </button>
              ))}
            </div>
            <SwitchMode width={56} height={28} />
          </div>
        </div>
      </nav>

      <main className="container mx-auto max-w-7xl px-3 sm:px-5 pb-10 pt-4 sm:pt-6 space-y-4 sm:space-y-6">
        <div id="tour-summary-stats" className="animate-fade-up">
          <div className="glass p-4 sm:p-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1" style={{ color: "hsl(var(--muted-foreground))" }}>Academic Safety</p>
              <p className="text-2xl font-black text-primary leading-none">
                {safeSubjects} <span className="font-medium text-lg" style={{ color: "hsl(var(--muted-foreground))" }}>/ {subjectStats.length} Safe</span>
              </p>
              <p className="text-[11px] mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
                {safeSubjects === subjectStats.length && subjectStats.length > 0
                  ? "All subjects above 75% ✓"
                  : subjectStats.length === 0
                  ? "Mark attendance to track"
                  : `${subjectStats.length - safeSubjects} need attention`}
              </p>
            </div>
            {cgpa && (
              <div className="flex flex-col items-end shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "hsl(var(--muted-foreground))" }}>CGPA</span>
                <span className="text-3xl font-black" style={{ color: "#34d399", lineHeight: 1 }}>{cgpa}</span>
              </div>
            )}
          </div>
        </div>

        <div id="tour-ongoing-class"><OngoingClass blocks={blocksForDate} selectedDate={selectedDate} /></div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div id="tour-calendar"><AcademicCalendar selectedDate={selectedDate} onSelectDate={setSelectedDate} markedDates={markedDates} getDateSummary={getDateSummary} /></div>
          <div className="glass p-5 flex flex-col min-h-[400px]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-foreground/90">{format(selectedDate, "EEEE")}</h3>
                  {noClassReason?.type === "day_swap" && noClassReason.effectiveDay && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 animate-fade-in">
                      <RotateCcw size={10} className="text-blue-400" />
                      <span className="text-[10px] font-bold text-blue-300 uppercase tracking-wider">
                        (Following {noClassReason.effectiveDay})
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{format(selectedDate, "MMMM d, yyyy")}</p>
              </div>
            </div>


            <div className="flex-1">
              {(shouldShowSchedule && blocksForDate.length > 0) ? (
                <>
                  {/* RELOCATED DAY SWAP ALERT */}
                  {noClassReason?.type === "day_swap" && noClassReason.effectiveDay && (
                    <div className="mb-4 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-500/10 border border-blue-500/20 animate-fade-in shadow-[0_4px_20px_rgba(59,130,246,0.1)]">
                        <RotateCcw size={12} className="text-blue-400" />
                        <span className="text-[11px] font-black text-blue-300 tracking-[0.2em] uppercase">
                            Day Order Change: Following {noClassReason.effectiveDay} Timetable
                        </span>
                    </div>
                  )}
                  <DailySchedule blocks={blocksForDate} attendance={currentAttendance} onMarkAttendance={handleMarkAttendance} selectedDate={selectedDate} onCourseClick={handleCourseClick} />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center h-full">
                  {getNoClassIcon()}
                  <p className="font-bold text-foreground/60">{noClassReason.type === "has_classes" ? "Relax, no classes!" : noClassMessage}</p>
                </div>
              )}
            </div>

          </div>
        </div>
        <div id="tour-subject-breakdown"><SubjectBreakdown stats={subjectStats} getDetailedCourseStats={getDetailedCourseStats} /></div>
        {marks.length > 0 && (
          <div id="tour-marks">
            <MarksBreakdown marks={marks} cgpa={cgpa ? String(cgpa) : undefined} />
          </div>
        )}
      </main>

      <CourseStatsModal stats={selectedCourse ? getDetailedCourseStats(selectedCourse) : null} open={courseModalOpen} onClose={() => setCourseModalOpen(false)} />
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".xlsx,.xls" className="hidden" />
    </div>
  );
};

export default Index;
