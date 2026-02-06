
import React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";


interface CalendarControlsProps {
  title: string;
  viewMode: "day" | "week" | "month";
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onViewModeChange: (value: "day" | "week" | "month") => void;
}

export const CalendarControls = ({
  title,
  viewMode,
  onPrevious,
  onNext,
  onToday,
  onViewModeChange
}: CalendarControlsProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <h2 className="text-2xl font-bold">{title}</h2>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={onPrevious}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" onClick={onToday}>
          Vandaag
        </Button>
        <Button variant="outline" size="icon" onClick={onNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        <Select value={viewMode} onValueChange={(value) => onViewModeChange(value as "day" | "week" | "month")}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Weergave" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Dag</SelectItem>
            <SelectItem value="week">Week</SelectItem>
            <SelectItem value="month">Maand</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
