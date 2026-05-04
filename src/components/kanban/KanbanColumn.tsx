"use client";

import { Droppable } from "@hello-pangea/dnd";
import { Plus } from "lucide-react";
import TaskCard from "./TaskCard";
import type { ClientTask } from "@/types";

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: ClientTask[];
  color: string;
  onTaskClick: (task: ClientTask) => void;
  onAddTask: () => void;
}

export default function KanbanColumn({ id, title, tasks, color, onTaskClick, onAddTask }: KanbanColumnProps) {
  return (
    <div className="flex-1 min-w-[300px]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${color}`} />
          <h3 className="font-semibold text-slate-700 text-sm">{title}</h3>
          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={onAddTask}
          className="p-1 rounded hover:bg-slate-200 transition-colors"
        >
          <Plus className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`space-y-2 min-h-[200px] p-2 rounded-lg transition-colors ${
              snapshot.isDraggingOver ? "bg-indigo-50" : "bg-slate-100"
            }`}
          >
            {tasks.map((task, index) => (
              <TaskCard
                key={task._id}
                task={task}
                index={index}
                onClick={() => onTaskClick(task)}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
