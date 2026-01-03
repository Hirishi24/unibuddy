import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, isSameDay } from "date-fns";

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
  const getDayContent = (day: Date) => {
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

  return (
    <div className="bg-card rounded-xl p-4 card-shadow animate-fade-in">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
        Attendance Calendar
      </h3>
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={(date) => date && onSelectDate(date)}
        className="rounded-md pointer-events-auto"
        modifiers={{
          hasAttendance: markedDates,
        }}
        modifiersClassNames={{
          hasAttendance: "font-bold",
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
      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-success" />
          <span>≥75% attended</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-danger" />
          <span>&lt;75% attended</span>
        </div>
      </div>
    </div>
  );
};

export default AttendanceCalendar;