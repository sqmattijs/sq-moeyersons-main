
import { useState } from "react";
import { toast } from "sonner";
import { useAppStore } from "@/store/AppContext";
import { differenceInDays, addDays, format, subDays } from "date-fns";

import GanttControls from "./GanttControls";
import GanttHeader from "./GanttHeader";
import GanttProjectRow from "./GanttProjectRow";
import GanttSidebar from "./GanttSidebar";
import GanttUnscheduledTasks from "./GanttUnscheduledTasks";

export default function GanttView() {
  const { state, dispatch } = useAppStore();
  const projects = state.projects;

  const [startDate, setStartDate] = useState(new Date());
  const [daysToShow, setDaysToShow] = useState(14);
  const [selectedProjects, setSelectedProjects] = useState<string[]>(
    projects.map(project => project.id)
  );

  // Genereer datums voor de Gantt chart
  const dates = Array.from({ length: daysToShow }, (_, i) =>
    addDays(startDate, i)
  );

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDrop = (e: React.DragEvent, date: Date, projectId: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");

    // Find the task across all projects to get its duration
    let task = null;
    let sourceProjectId = null;
    for (const p of state.projects) {
      const found = p.tasks.find(t => t.id === taskId);
      if (found) {
        task = found;
        sourceProjectId = p.id;
        break;
      }
    }

    if (!task) return;

    const taskDuration = differenceInDays(task.endDate, task.startDate);
    const newStartDate = date;
    const newEndDate = addDays(date, taskDuration);

    dispatch({
      type: "MOVE_TASK",
      payload: {
        taskId,
        projectId: sourceProjectId!,
        newStartDate,
        newEndDate,
      },
    });

    toast.success(`Taak verplaatst naar ${format(date, 'dd-MM-yyyy')}`, {
      description: `Project: ${projects.find(p => p.id === projectId)?.name}`
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const toggleProject = (projectId: string) => {
    setSelectedProjects(prev => {
      if (prev.includes(projectId)) {
        return prev.filter(id => id !== projectId);
      } else {
        return [...prev, projectId];
      }
    });
  };

  const goToPreviousPeriod = () => {
    setStartDate(prev => subDays(prev, daysToShow));
  };

  const goToNextPeriod = () => {
    setStartDate(prev => addDays(prev, daysToShow));
  };

  const goToToday = () => {
    setStartDate(new Date());
  };

  const changeDaysToShow = (days: string) => {
    setDaysToShow(Number(days));
  };

  const filteredProjects = projects.filter(p => selectedProjects.includes(p.id));

  return (
    <div className="space-y-4">
      <GanttControls
        startDate={startDate}
        daysToShow={daysToShow}
        onPreviousPeriod={goToPreviousPeriod}
        onNextPeriod={goToNextPeriod}
        onToday={goToToday}
        onChangeDaysToShow={changeDaysToShow}
      />

      <div className="flex">
        {/* Project filter sidebar */}
        <GanttSidebar
          projects={projects}
          selectedProjects={selectedProjects}
          onToggleProject={toggleProject}
        />

        {/* Gantt Chart */}
        <div className="flex-1 overflow-x-auto">
          <div style={{ minWidth: `${dates.length * 80}px` }}>
            {/* Header with dates */}
            <GanttHeader dates={dates} />

            {/* Project rows */}
            {filteredProjects.map(project => (
              <GanttProjectRow
                key={project.id}
                project={project}
                startDate={startDate}
                daysToShow={daysToShow}
                dates={dates}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              />
            ))}
          </div>
        </div>
      </div>

      <GanttUnscheduledTasks onDragStart={handleDragStart} />
    </div>
  );
}
