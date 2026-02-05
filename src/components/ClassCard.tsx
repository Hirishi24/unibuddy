import { Clock, MapPin, Check, X, Lock, Ban } from "lucide-react";
import { ClassBlock } from "@/data/timetable";
import { isToday, isBefore, startOfDay } from "date-fns";

interface ClassCardProps {
  block: ClassBlock;
  status: "present" | "absent" | null;
  onMarkPresent: () => void;
  onMarkAbsent: () => void;
  selectedDate: Date;
  onCourseClick?: (course: string) => void;
  cancelledReason?: string; // If set, class is cancelled
}

const ClassCard = ({ block, status, onMarkPresent, onMarkAbsent, selectedDate, onCourseClick, cancelledReason }: ClassCardProps) => {
  // Format time in 24-hour format
  const formatTime = (time: string) => {
    return time; // Already in HH:MM format
  };

  // Get end time display - classes end at :50
  const getEndTimeDisplay = () => {
    const [hours] = block.endTime.split(":");
    return `${hours.padStart(2, "0")}:50`;
  };

  const getDurationLabel = () => {
    if (block.duration === 1) return "1 hour";
    return `${block.duration} hours`;
  };

  // Check if attendance can be marked
  const canMarkAttendance = () => {
    const now = new Date();
    const today = startOfDay(now);
    const selectedDay = startOfDay(selectedDate);
    
    // If selected date is in the past, allow marking
    if (isBefore(selectedDay, today)) {
      return true;
    }
    
    // If selected date is today, check if class has ended
    if (isToday(selectedDate)) {
      const [endHours] = block.endTime.split(":");
      const classEndHour = parseInt(endHours);
      const classEndMinutes = 50; // Classes end at :50
      const currentHour = now.getHours();
      const currentMinutes = now.getMinutes();
      
      // Allow marking if current time is past class end time (:50)
      return currentHour > classEndHour || (currentHour === classEndHour && currentMinutes >= classEndMinutes);
    }
    
    // Future dates - don't allow marking
    return false;
  };

  const isLocked = !canMarkAttendance();
  const isCancelled = !!cancelledReason;

  // Get time remaining message for locked classes
  const getLockedMessage = () => {
    if (!isToday(selectedDate)) {
      return "Class not completed yet";
    }
    const [endHours] = block.endTime.split(":");
    return `Available after ${endHours}:50`;
  };

  return (
    <div
      className={`bg-card rounded-lg p-4 card-shadow transition-all duration-200 animate-scale-in border border-border ${
        isCancelled
          ? "opacity-60 border-warning/50"
          : status === "present"
          ? "ring-2 ring-success/50"
          : status === "absent"
          ? "ring-2 ring-danger/50"
          : ""
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 
              className="font-semibold text-foreground text-lg cursor-pointer hover:text-primary transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onCourseClick?.(block.course);
              }}
            >
              {block.course}
            </h3>
            {block.isLab && (
              <span className="text-xs bg-purple-500/20 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full font-bold">
                L
              </span>
            )}
            {block.isOE && (
              <span className="text-xs bg-orange-500/20 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full font-bold">
                OE
              </span>
            )}
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
              {getDurationLabel()}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{block.courseTitle}</p>
          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatTime(block.startTime)} - {getEndTimeDisplay()}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {block.room}
            </span>
          </div>
        </div>
        {status && (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              status === "present"
                ? "bg-success/10 text-success"
                : "bg-danger/10 text-danger"
            }`}
          >
            {status === "present" ? "Present" : "Absent"}
          </span>
        )}
      </div>

      {isCancelled ? (
        <div className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-warning/10 text-warning text-sm border border-warning/30">
          <Ban className="h-4 w-4" />
          <span className="font-medium">Cancelled</span>
          <span className="text-warning/80">• {cancelledReason}</span>
        </div>
      ) : isLocked ? (
        <div className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-muted text-muted-foreground text-sm">
          <Lock className="h-4 w-4" />
          <span>{getLockedMessage()}</span>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={onMarkPresent}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
              status === "present"
                ? "bg-success text-success-foreground"
                : "bg-success/10 text-success hover:bg-success/20"
            }`}
          >
            <Check className="h-4 w-4" />
            Present
          </button>
          <button
            onClick={onMarkAbsent}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
              status === "absent"
                ? "bg-danger text-danger-foreground"
                : "bg-danger/10 text-danger hover:bg-danger/20"
            }`}
          >
            <X className="h-4 w-4" />
            Absent
          </button>
        </div>
      )}
    </div>
  );
};

export default ClassCard;
