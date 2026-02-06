
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addDays, subDays } from "date-fns";

interface GanttControlsProps {
  startDate: Date;
  daysToShow: number;
  onPreviousPeriod: () => void;
  onNextPeriod: () => void;
  onToday: () => void;
  onChangeDaysToShow: (days: string) => void;
}

export default function GanttControls({
  startDate,
  daysToShow,
  onPreviousPeriod,
  onNextPeriod,
  onToday,
  onChangeDaysToShow
}: GanttControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <h2 className="text-2xl font-bold">Gantt Chart</h2>
      
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={onPreviousPeriod}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" onClick={onToday}>
          Vandaag
        </Button>
        <Button variant="outline" size="icon" onClick={onNextPeriod}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        <Select defaultValue={String(daysToShow)} onValueChange={onChangeDaysToShow}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Dagen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 dagen</SelectItem>
            <SelectItem value="14">14 dagen</SelectItem>
            <SelectItem value="30">30 dagen</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
