import { Clock, MapPin, Check, X } from "lucide-react";
import { ClassSlot } from "@/data/timetable";

interface ClassCardProps {
  slot: ClassSlot;
  status: "present" | "absent" | null;
  onMarkPresent: () => void;
  onMarkAbsent: () => void;
}

const ClassCard = ({ slot, status, onMarkPresent, onMarkAbsent }: ClassCardProps) => {
  const formatTime = (time: string) => {
    const [hours] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:00 ${ampm}`;
  };

  return (
    <div
      className={`bg-card rounded-lg p-4 card-shadow transition-all duration-200 animate-scale-in ${
        status === "present"
          ? "ring-2 ring-success/50"
          : status === "absent"
          ? "ring-2 ring-danger/50"
          : ""
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-foreground text-lg">{slot.course}</h3>
          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatTime(slot.time)}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {slot.room}
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
    </div>
  );
};

export default ClassCard;
