
import { format } from "date-fns";
import { nl } from "date-fns/locale";

interface GanttHeaderProps {
  dates: Date[];
}

export default function GanttHeader({ dates }: GanttHeaderProps) {
  return (
    <div className="flex border-b">
      {dates.map(date => (
        <div 
          key={date.toISOString()} 
          className="gantt-cell w-20"
        >
          <div className="p-1 text-center">
            <div className="text-xs">{format(date, 'EEE', { locale: nl })}</div>
            <div className="text-xs font-medium">{format(date, 'd MMM', { locale: nl })}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
