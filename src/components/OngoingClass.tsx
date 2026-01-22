import { useEffect, useState } from "react";
import { ClassBlock } from "@/data/timetable";
import { Clock, MapPin, Coffee, CalendarClock, User, Beaker, BookOpen } from "lucide-react";
import { format } from "date-fns";

interface OngoingClassProps {
  blocks: ClassBlock[];
  selectedDate: Date;
}

interface ClassStatus {
  type: "ongoing" | "upcoming" | "done" | "none";
  currentClass?: ClassBlock;
  nextClass?: ClassBlock;
  timeLeft?: string;
  timeUntil?: string;
}

// Format end time for display (classes end at :50, not :00)
// endTime in block is start of last slot, actual end is that hour + 50 minutes
const getDisplayEndTime = (block: ClassBlock): string => {
  const [hours] = block.endTime.split(":").map(Number);
  return `${hours.toString().padStart(2, "0")}:50`;
};

const OngoingClass = ({ blocks, selectedDate }: OngoingClassProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [status, setStatus] = useState<ClassStatus>({ type: "none" });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Check if selected date is today
    const today = new Date();
    const isToday =
      selectedDate.getDate() === today.getDate() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getFullYear() === today.getFullYear();

    if (!isToday || blocks.length === 0) {
      setStatus({ type: "none" });
      return;
    }

    // Parse time string (HH:MM format) and create Date object for today
    const parseTime = (timeStr: string): Date => {
      const [hours, minutes] = timeStr.split(":").map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      return date;
    };

    // Get actual end time (classes end at :50 of the last hour)
    const getActualEndTime = (block: ClassBlock): Date => {
      const [hours] = block.endTime.split(":").map(Number);
      const date = new Date();
      date.setHours(hours, 50, 0, 0); // End at :50 of the last slot hour
      return date;
    };

    const formatTimeDiff = (diffMs: number): string => {
      const totalSeconds = Math.floor(diffMs / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      
      if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
      }
      if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
      }
      return `${seconds}s`;
    };

    const now = currentTime;
    let foundOngoing = false;
    let nextClass: ClassBlock | null = null;

    // Sort blocks by start time
    const sortedBlocks = [...blocks].sort((a, b) => {
      return parseTime(a.startTime).getTime() - parseTime(b.startTime).getTime();
    });

    for (const block of sortedBlocks) {
      const startTime = parseTime(block.startTime);
      const endTime = getActualEndTime(block);

      if (now >= startTime && now < endTime) {
        // Currently in a class
        const diffMs = endTime.getTime() - now.getTime();
        setStatus({
          type: "ongoing",
          currentClass: block,
          timeLeft: formatTimeDiff(diffMs),
        });
        foundOngoing = true;
        break;
      } else if (now < startTime && !nextClass) {
        // Found upcoming class
        nextClass = block;
      }
    }

    if (!foundOngoing) {
      if (nextClass) {
        const startTime = parseTime(nextClass.startTime);
        const diffMs = startTime.getTime() - now.getTime();
        setStatus({
          type: "upcoming",
          nextClass: nextClass,
          timeUntil: formatTimeDiff(diffMs),
        });
      } else {
        // All classes are done for today
        setStatus({ type: "done" });
      }
    }
  }, [currentTime, blocks, selectedDate]);

  // Don't show anything if not today or no classes
  if (status.type === "none") {
    return null;
  }

  // All classes done for the day
  if (status.type === "done") {
    return (
      <div className="bg-gradient-to-br from-success/10 via-success/5 to-background border-2 border-success/30 rounded-xl p-4 mb-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-success/20 rounded-lg">
            <Coffee className="h-5 w-5 text-success" />
          </div>
          <div>
            <p className="font-semibold text-foreground">All done for today! 🎉</p>
            <p className="text-sm text-muted-foreground">No more classes scheduled</p>
          </div>
          <div className="ml-auto text-sm text-muted-foreground font-mono">
            {format(currentTime, "HH:mm:ss")}
          </div>
        </div>
      </div>
    );
  }

  // Upcoming class
  if (status.type === "upcoming" && status.nextClass) {
    return (
      <div className="bg-gradient-to-br from-warning/10 via-warning/5 to-background border-2 border-warning/30 rounded-xl p-4 mb-6 animate-fade-in">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CalendarClock className="h-5 w-5 text-warning" />
              <span className="text-xs font-semibold text-warning uppercase tracking-wide">
                Next Class
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.nextClass.isLab ? 'bg-purple-500/20 text-purple-500' : 'bg-blue-500/20 text-blue-500'}`}>
                {status.nextClass.isLab ? (
                  <span className="flex items-center gap-1"><Beaker className="h-3 w-3" /> Lab</span>
                ) : (
                  <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> Theory</span>
                )}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-muted text-muted-foreground">
                {status.nextClass.duration} {status.nextClass.duration > 1 ? 'hours' : 'hour'}
              </span>
            </div>
            
            <h3 className="text-lg font-bold text-foreground mb-1">
              {status.nextClass.course}
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              {status.nextClass.courseTitle}
            </p>

            <div className="flex flex-wrap items-center gap-3 text-sm mb-2">
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">
                  {status.nextClass.startTime} - {getDisplayEndTime(status.nextClass)}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{status.nextClass.room}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{status.nextClass.faculty}</span>
            </div>
          </div>

          <div className="text-right">
            <div className="bg-warning/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-warning/30">
              <div className="text-2xl font-bold text-warning tabular-nums">
                {status.timeUntil}
              </div>
              <div className="text-xs text-warning/80 font-medium">
                until start
              </div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground font-mono">
              {format(currentTime, "HH:mm:ss")}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Ongoing class
  if (status.type === "ongoing" && status.currentClass) {
    return (
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-2 border-primary/30 rounded-xl p-4 mb-6 animate-fade-in">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="relative">
                <Clock className="h-5 w-5 text-primary animate-pulse" />
                <div className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full animate-ping" />
              </div>
              <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                Ongoing Class
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.currentClass.isLab ? 'bg-purple-500/20 text-purple-500' : 'bg-blue-500/20 text-blue-500'}`}>
                {status.currentClass.isLab ? (
                  <span className="flex items-center gap-1"><Beaker className="h-3 w-3" /> Lab</span>
                ) : (
                  <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> Theory</span>
                )}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-muted text-muted-foreground">
                {status.currentClass.duration} {status.currentClass.duration > 1 ? 'hours' : 'hour'}
              </span>
            </div>
            
            <h3 className="text-lg font-bold text-foreground mb-1">
              {status.currentClass.course}
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              {status.currentClass.courseTitle}
            </p>

            <div className="flex flex-wrap items-center gap-3 text-sm mb-2">
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">
                  {status.currentClass.startTime} - {getDisplayEndTime(status.currentClass)}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{status.currentClass.room}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{status.currentClass.faculty}</span>
            </div>
          </div>

          <div className="text-right">
            <div className="bg-primary/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-primary/30">
              <div className="text-2xl font-bold text-primary tabular-nums">
                {status.timeLeft}
              </div>
              <div className="text-xs text-primary/80 font-medium">
                left
              </div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground font-mono">
              {format(currentTime, "HH:mm:ss")}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default OngoingClass;
