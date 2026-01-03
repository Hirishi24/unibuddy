import { timetable, ClassSlot } from "@/data/timetable";
import ClassCard from "./ClassCard";
import { AttendanceRecord } from "@/hooks/useAttendance";
import { Calendar } from "lucide-react";

interface DailyScheduleProps {
  day: string;
  attendance: AttendanceRecord;
  onMarkAttendance: (classId: string, status: "present" | "absent") => void;
}

const DailySchedule = ({ day, attendance, onMarkAttendance }: DailyScheduleProps) => {
  const daySchedule: ClassSlot[] = timetable[day] || [];

  if (daySchedule.length === 0) {
    return (
      <div className="bg-card rounded-lg p-8 text-center card-shadow">
        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <h3 className="font-medium text-foreground">No classes scheduled</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Enjoy your day off!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {daySchedule.map((slot, index) => (
        <div key={slot.id} style={{ animationDelay: `${index * 0.05}s` }}>
          <ClassCard
            slot={slot}
            status={attendance[slot.id] || null}
            onMarkPresent={() => onMarkAttendance(slot.id, "present")}
            onMarkAbsent={() => onMarkAttendance(slot.id, "absent")}
          />
        </div>
      ))}
    </div>
  );
};

export default DailySchedule;
