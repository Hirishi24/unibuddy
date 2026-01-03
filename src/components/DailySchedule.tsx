import { ClassBlock } from "@/data/timetable";
import ClassCard from "./ClassCard";
import { DailyAttendanceRecord } from "@/hooks/useAttendance";
import { Calendar } from "lucide-react";

interface DailyScheduleProps {
  blocks: ClassBlock[];
  attendance: DailyAttendanceRecord;
  onMarkAttendance: (blockId: string, status: "present" | "absent") => void;
}

const DailySchedule = ({ blocks, attendance, onMarkAttendance }: DailyScheduleProps) => {
  if (blocks.length === 0) {
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
    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
      {blocks.map((block, index) => (
        <div key={block.blockId} style={{ animationDelay: `${index * 0.05}s` }}>
          <ClassCard
            block={block}
            status={attendance[block.blockId] || null}
            onMarkPresent={() => onMarkAttendance(block.blockId, "present")}
            onMarkAbsent={() => onMarkAttendance(block.blockId, "absent")}
          />
        </div>
      ))}
    </div>
  );
};

export default DailySchedule;
