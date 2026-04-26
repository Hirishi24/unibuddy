import { ClassBlock } from "@/shared/types";

import ClassCard from "./ClassCard";
import { DailyAttendanceRecord } from "@/hooks/useAttendance";

interface DailyScheduleProps {
  blocks: ClassBlock[];
  attendance: DailyAttendanceRecord;
  onMarkAttendance: (blockId: string, status: "present" | "absent") => void;
  selectedDate: Date;
  onCourseClick?: (course: string) => void;
}

const DailySchedule = ({ blocks, attendance, onMarkAttendance, selectedDate, onCourseClick }: DailyScheduleProps) => {
  if (blocks.length === 0) return null;

  return (
    <div style={{ maxHeight: 420, overflowY: "auto", paddingRight: 2 }}>
      {blocks.map((block, index) => (
        <div key={block.blockId} style={{ animationDelay: `${index * 0.06}s` }}>
          <ClassCard
            block={block}
            status={attendance[block.blockId] || null}
            onMarkPresent={() => onMarkAttendance(block.blockId, "present")}
            onMarkAbsent={() => onMarkAttendance(block.blockId, "absent")}
            selectedDate={selectedDate}
            onCourseClick={onCourseClick}
          />
        </div>
      ))}
    </div>
  );
};

export default DailySchedule;
