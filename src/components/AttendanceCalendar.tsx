import { Calendar } from "@/components/ui/calendar";
import { format, parseISO, isSameDay } from "date-fns";
import { SEMESTER_START, SEMESTER_END, getNoClassReason, holidays } from "@/data/academicCalendar";
import { CalendarDays } from "lucide-react";
import { useMemo } from "react";

interface AttendanceCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  markedDates: Date[];
  getDateSummary: (date: Date) => { present: number; absent: number };
}

const AcademicCalendar = ({
  selectedDate,
  onSelectDate,
  markedDates,
  getDateSummary,
}: AttendanceCalendarProps) => {
  const semesterStart = parseISO(SEMESTER_START);
  const semesterEnd = parseISO(SEMESTER_END);
  const holidayDates = useMemo(() => holidays.map((h) => parseISO(h.date)), []);

  // Determine dot color for each day
  const getDotInfo = (day: Date): { color: string } | null => {
    const reason = getNoClassReason(day);
    if (reason.type === "holiday") return { color: "#f5a623" };
    if (reason.type === "weekend") return { color: "#f5a623" };
    const summary = getDateSummary(day);
    if (summary.present === 0 && summary.absent === 0) return null;
    const pct = (summary.present / (summary.present + summary.absent)) * 100;
    return { color: pct >= 75 ? "#34c759" : "#e53e3e" };
  };

  return (
    <div className="att-cal-wrapper">
      {/* Header */}
      <div className="att-cal-header">
        <div className="att-cal-icon">
          <CalendarDays size={15} />
        </div>
        <div>
          <h3 className="att-cal-title">Academic Calendar</h3>
          <p className="att-cal-sub">Semester: Jan 5 – May 4, 2026</p>
        </div>
      </div>

      {/* Calendar */}
      <div className="att-cal-body">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && onSelectDate(date)}
          defaultMonth={new Date()}
          fromDate={semesterStart}
          toDate={semesterEnd}
          weekStartsOn={1}
          showOutsideDays={false}
          modifiers={{ hasAttendance: markedDates, holiday: holidayDates }}
          components={{
            DayButton: ({ day, modifiers, ...props }) => {
              const dot = getDotInfo(day.date);
              const isSelected = modifiers.selected;
              const isToday = isSameDay(day.date, new Date());
              return (
                <button
                  {...props}
                  className="att-day-btn"
                  data-selected={isSelected || undefined}
                  data-today={isToday || undefined}
                >
                  <span>{format(day.date, "d")}</span>
                  {dot && (
                    <span
                      className="att-day-dot"
                      style={{
                        background: isSelected ? "rgba(255,255,255,0.85)" : dot.color,
                        boxShadow: isSelected ? "none" : `0 0 4px ${dot.color}`,
                      }}
                    />
                  )}
                </button>
              );
            },
          }}
        />
      </div>

      {/* Legend */}
      <div className="att-cal-legend">
        {[
          { col: "#34c759", label: "≥ 75%" },
          { col: "#e53e3e", label: "< 75%" },
          { col: "#f5a623", label: "Holiday" },
        ].map(({ col, label }) => (
          <div key={label} className="att-cal-legend-item">
            <span className="att-cal-legend-dot" style={{ background: col, boxShadow: `0 0 5px ${col}55` }} />
            {label}
          </div>
        ))}
      </div>

      <style>{`
        .att-cal-wrapper {
          background: var(--glass-bg);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          border: 1px solid var(--glass-border);
          border-radius: 20px;
          box-shadow: var(--shadow-card);
          overflow: hidden;
          width: 100%;
        }

        .att-cal-header {
          display: flex; align-items: center; gap: 10px;
          padding: 16px 20px 12px;
          border-bottom: 1px solid var(--border);
        }

        .att-cal-icon {
          width: 30px; height: 30px; border-radius: 9px;
          background: linear-gradient(135deg, hsl(0 88% 48%), hsl(15 85% 44%));
          display: flex; align-items: center; justify-content: center;
          color: white; flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(200,20,20,0.35);
        }

        .att-cal-title {
          font-size: 13px; font-weight: 700; margin: 0;
          color: hsl(var(--foreground));
        }

        .att-cal-sub {
          font-size: 10.5px; margin: 0;
          color: hsl(var(--muted-foreground));
        }

        .att-cal-body {
          padding: 8px 12px 4px;
        }

        .att-cal-body [data-slot="calendar"] {
          background: transparent !important;
          width: 100% !important;
          --cell-size: 40px;
        }

        .att-cal-body [class*="caption_label"] {
          color: hsl(var(--foreground)) !important;
          font-weight: 800 !important;
          font-size: 14px !important;
        }

        .att-cal-body [class*="button_previous"],
        .att-cal-body [class*="button_next"] {
          color: hsl(var(--foreground) / 0.45) !important;
          border: 1px solid var(--border) !important;
          background: var(--muted) !important;
          border-radius: 8px !important;
        }

        .att-cal-body [class*="weekday"] {
          color: hsl(var(--foreground) / 0.3) !important;
          font-size: 11px !important;
          font-weight: 700 !important;
        }

        /* Day button styling */
        .att-day-btn {
          position: relative;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          width: 100%; aspect-ratio: 1;
          border: 1px solid transparent;
          border-radius: 12px;
          background: transparent;
          color: hsl(var(--foreground) / 0.7);
          font-size: 13px; font-weight: 500;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .att-day-btn:hover {
          background: rgba(220,30,30,0.08);
          border-color: rgba(220,30,30,0.2);
          color: hsl(var(--foreground));
        }

        .att-day-btn[data-today] {
          background: rgba(220,30,30,0.06);
          border-color: rgba(220,30,30,0.25);
          color: hsl(0 88% 55%);
          font-weight: 800;
        }

        .att-day-btn[data-selected] {
          background: linear-gradient(135deg, hsl(0 88% 48%), hsl(15 85% 44%)) !important;
          border-color: rgba(220,30,30,0.7) !important;
          color: white !important;
          font-weight: 800;
          box-shadow: 0 4px 15px rgba(220,30,30,0.5);
        }

        .att-day-dot {
          position: absolute;
          bottom: 4px; left: 50%;
          transform: translateX(-50%);
          width: 5px; height: 5px;
          border-radius: 50%;
        }

        /* Legend */
        .att-cal-legend {
          display: flex; flex-wrap: wrap; gap: 14px;
          padding: 12px 20px 16px;
          border-top: 1px solid var(--border);
          background: rgba(0,0,0,0.1);
        }

        .att-cal-legend-item {
          display: flex; align-items: center; gap: 6px;
          font-size: 10px; font-weight: 600;
          color: hsl(var(--foreground) / 0.4);
        }

        .att-cal-legend-dot {
          width: 7px; height: 7px; border-radius: 50%;
        }
      `}</style>
    </div>
  );
};

export default AcademicCalendar;