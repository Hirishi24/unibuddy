import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { SEMESTER_START, SEMESTER_END, getNoClassReason, holidays } from "@/data/academicCalendar";

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
  const semesterEnd = parseISO(SEMESTER_END);

  const getDayContent = (day: Date) => {
    const reason = getNoClassReason(day);
    
    // Show holiday indicator
    if (reason.type === "holiday") {
      return (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
          <div className="w-1.5 h-1.5 rounded-full bg-warning" />
        </div>
      );
    }

    const summary = getDateSummary(day);
    const hasAttendance = summary.present > 0 || summary.absent > 0;
    
    if (!hasAttendance) return null;

    const total = summary.present + summary.absent;
    const percentage = (summary.present / total) * 100;

    return (
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
        {percentage >= 75 ? (
          <div className="w-1.5 h-1.5 rounded-full bg-success" />
        ) : (
          <div className="w-1.5 h-1.5 rounded-full bg-danger" />
        )}
      </div>
    );
  };

  // Get holiday dates for styling
  const holidayDates = holidays.map((h) => parseISO(h.date));

  return (
    <div className="bg-card rounded-xl p-4 card-shadow animate-fade-in border border-border">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
        Attendance Calendar
      </h3>
      <p className="text-xs text-muted-foreground mb-3">
        Semester: Jan 5 - May 4, 2026
      </p>
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={(date) => date && onSelectDate(date)}
        className="rounded-md pointer-events-auto"
        defaultMonth={semesterStart}
        fromDate={semesterStart}
        toDate={semesterEnd}
        modifiers={{
          hasAttendance: markedDates,
          holiday: holidayDates,
        }}
        modifiersClassNames={{
          hasAttendance: "font-bold",
          holiday: "text-warning",
        }}
        components={{
          DayContent: ({ date }) => (
            <div className="relative w-full h-full flex items-center justify-center">
              <span>{format(date, "d")}</span>
              {getDayContent(date)}
            </div>
          ),
        }}
      />
      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-success" />
          <span>≥75%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-danger" />
          <span>&lt;75%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-warning" />
          <span>Holiday</span>
        </div>
      </div>
    </div>
  );
};

export default AttendanceCalendar;