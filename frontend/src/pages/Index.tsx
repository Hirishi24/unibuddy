import { GraduationCap, RotateCcw, CalendarOff, PartyPopper, Moon, Download, Upload, LogIn, UserPlus, ChevronDown, CalendarClock, Sparkles } from "lucide-react";
import { getNoClassReason, getNoClassMessage } from "@/data/globalAcademicCalendar";
import { useAttendance } from "@/hooks/useAttendance";
import DailySchedule from "@/components/DailySchedule";
import SubjectBreakdown from "@/components/SubjectBreakdown";
import AcademicCalendar from "@/components/AttendanceCalendar";
import CourseStatsModal from "@/components/CourseStatsModal";
import OngoingClass from "@/components/OngoingClass";
import { GooeyMenu } from "@/components/GooeyMenu";
import { UserTour } from "@/components/UserTour";

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

  return (
    <div className="min-h-screen" style={{ background: "var(--col-bg)" }}>
      <UserTour />

      <nav style={{ position: "sticky", top: 12, zIndex: 40, maxWidth: 1280, margin: "0 auto", padding: "0 20px" }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 20px", background: "var(--glass-bg-strong)",
          backdropFilter: "var(--glass-blur)", WebkitBackdropFilter: "var(--glass-blur)",
          border: "1px solid var(--glass-border)", borderRadius: 16, boxShadow: "var(--shadow-card)",
        }}>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 10px hsl(var(--primary) / 0.3)", overflow: "hidden" }}>
              <img src="/favicon.png" alt="Unibuddy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 16, fontWeight: 900, color: "hsl(var(--foreground))", letterSpacing: "-0.02em" }}>Unibuddy</span>
                <div style={{ 
                  padding: "4px 12px", 
                  background: "hsl(var(--primary) / 0.15)", 
                  border: "1px solid hsl(var(--primary) / 0.3)", 
                  borderRadius: 10, 
                  fontSize: 13, fontWeight: 800, color: "hsl(var(--primary))",
                  display: "flex", alignItems: "center", gap: 6,
                  boxShadow: "0 2px 10px rgba(0,0,0,0.2)"
                }}>
                  <CalendarClock size={14} className="opacity-70" />
                  {format(selectedDate, "EEE, d MMM")}
                </div>
              </div>
              <p style={{ fontSize: 11, color: "hsl(var(--muted-foreground))", margin: 0, opacity: 0.8 }}>Dashboard • {dataSource}</p>
            </div>

          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {profile ? (
              <div>
                <DropdownMenu open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                  <DropdownMenuTrigger asChild>
                    <button 
                      onClick={() => setIsProfileOpen(prev => !prev)}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 12px 4px 6px", background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))", borderRadius: 99, cursor: "pointer", transition: "all 0.2s" }}
                    >
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent) / 0.8))", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid hsl(var(--primary) / 0.3)", boxShadow: "0 2px 8px hsl(var(--primary) / 0.3)" }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: "white" }}>{profile.name?.charAt(0) || "S"}</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "hsl(var(--foreground))", lineHeight: 1.2 }}>{profile.name || "Student"}</span>
                        <span style={{ fontSize: 10, fontWeight: 500, color: "hsl(var(--muted-foreground))" }}>{profile.regNo || "AP23..."}</span>
                      </div>
                      <ChevronDown size={12} style={{ opacity: 0.4, marginLeft: 2, transition: "transform 0.2s", transform: isProfileOpen ? "rotate(180deg)" : "rotate(0)" }} />
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
              <button onClick={() => navigate("/login")} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:brightness-110 trans-all"><LogIn size={14}/> Login</button>
            )}
            <div style={{ display: "flex", gap: 6 }}>
              {[
                { icon: <Download size={14}/>, onClick: handleExport, title: "Export" },
                { icon: <Upload size={14}/>, onClick: handleImportClick, title: "Import" },
                { icon: <RotateCcw size={14}/>, onClick: handleReset, title: "Reset" },
              ].map((btn, i) => (
                <button key={i} onClick={btn.onClick} title={btn.title} className="w-8 h-8 flex items-center justify-center rounded-lg border border-border bg-muted hover:bg-primary/10 hover:text-primary trans-all">
                  {btn.icon}
                </button>
              ))}
            </div>
            <SwitchMode width={56} height={28} />
          </div>
        </div>
      </nav>

      <main className="container mx-auto max-w-7xl px-5 pb-10 pt-6 space-y-6">
        <div id="tour-summary-stats" className="animate-fade-up">
          <div className="glass p-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1" style={{ color: "hsl(var(--muted-foreground))" }}>Academic Safety</p>
              <p className="text-2xl font-black text-primary">
                {safeSubjects} <span className="font-medium text-lg" style={{ color: "hsl(var(--muted-foreground))" }}>/ {subjectStats.length} Subjects Safe</span>
              </p>
            </div>

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
      </main>

      <CourseStatsModal stats={selectedCourse ? getDetailedCourseStats(selectedCourse) : null} open={courseModalOpen} onClose={() => setCourseModalOpen(false)} />
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".xlsx,.xls" className="hidden" />
    </div>
  );
};

export default Index;
