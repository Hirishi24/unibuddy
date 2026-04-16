import { Calendar } from "@/components/ui/calendar";
import { format, parseISO } from "date-fns";
import { SEMESTER_START, SEMESTER_END, getNoClassReason, holidays } from "@/data/academicCalendar";
import { CalendarDays } from "lucide-react";

interface AttendanceCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  markedDates: Date[];
  getDateSummary: (date: Date) => { present: number; absent: number };
}

const AttendanceCalendar = ({
  selectedDate,
  onSelectDate,
  markedDates,
  getDateSummary,
}: AttendanceCalendarProps) => {
  const semesterStart = parseISO(SEMESTER_START);
  const semesterEnd   = parseISO(SEMESTER_END);

  const getDayContent = (day: Date) => {
    const reason = getNoClassReason(day);
    if (reason.type === "holiday" || reason.type === "weekend") {
      return (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: "hsl(40 95% 58%)" }} />
        </div>
      );
    }
    const summary = getDateSummary(day);
    if (summary.present === 0 && summary.absent === 0) return null;
    const pct = (summary.present / (summary.present + summary.absent)) * 100;
    return (
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
        <div style={{
          width: 5, height: 5, borderRadius: "50%",
          background: pct >= 75 ? "hsl(145 65% 55%)" : "hsl(0 72% 62%)",
        }} />
      </div>
    );
  };

  const holidayDates = holidays.map((h) => parseISO(h.date));

  return (
    <div className="glass" style={{ padding: "20px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <CalendarDays size={16} style={{ color: "hsl(265 80% 70%)" }} />
        <h3 style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>
          Attendance Calendar
        </h3>
      </div>
      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.32)", marginBottom: 12 }}>
        Semester: Jan 5 – May 4, 2026
      </p>

      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={(date) => date && onSelectDate(date)}
        className="pointer-events-auto"
        defaultMonth={new Date()}
        fromDate={semesterStart}
        toDate={semesterEnd}
        weekStartsOn={1}
        modifiers={{ hasAttendance: markedDates, holiday: holidayDates }}
        modifiersClassNames={{ hasAttendance: "font-bold", holiday: "" }}
        components={{
          DayContent: ({ date }) => (
            <div className="relative w-full h-full flex items-center justify-center">
              <span>{format(date, "d")}</span>
              {getDayContent(date)}
            </div>
          ),
        }}
      />

      {/* Legend */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        {[
          { col: "hsl(145 65% 55%)", label: "≥ 75%" },
          { col: "hsl(0 72% 62%)",   label: "< 75%" },
          { col: "hsl(40 95% 58%)",  label: "Holiday / Weekend" },
        ].map(({ col, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "rgba(255,255,255,0.38)" }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: col, flexShrink: 0 }} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttendanceCalendar;