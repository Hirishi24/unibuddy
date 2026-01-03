import { days } from "@/data/timetable";

interface DaySelectorProps {
  selectedDay: string;
  onSelectDay: (day: string) => void;
}

const DaySelector = ({ selectedDay, onSelectDay }: DaySelectorProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
      {days.map((day) => (
        <button
          key={day}
          onClick={() => onSelectDay(day)}
          className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all duration-200 ${
            selectedDay === day
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-card text-foreground hover:bg-secondary card-shadow"
          }`}
        >
          {day}
        </button>
      ))}
    </div>
  );
};

export default DaySelector;
