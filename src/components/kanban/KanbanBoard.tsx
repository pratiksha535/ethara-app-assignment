"use client";

import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import KanbanColumn from "./KanbanColumn";
import type { ClientTask } from "@/types";

interface KanbanBoardProps {
  tasks: ClientTask[];
  onDragEnd: (result: DropResult) => void;
  onTaskClick: (task: ClientTask) => void;
  onAddTask: (status: string) => void;
}

const columns = [
  { id: "todo", title: "To Do", color: "bg-blue-500" },
  { id: "in_progress", title: "In Progress", color: "bg-amber-500" },
  { id: "done", title: "Done", color: "bg-green-500" },
];

export default function KanbanBoard({ tasks, onDragEnd, onTaskClick, onAddTask }: KanbanBoardProps) {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((col) => (
          <KanbanColumn
            key={col.id}
            id={col.id}
            title={col.title}
            color={col.color}
            tasks={tasks
              .filter((t) => t.status === col.id)
              .sort((a, b) => a.order - b.order)}
            onTaskClick={onTaskClick}
            onAddTask={() => onAddTask(col.id)}
          />
        ))}
      </div>
    </DragDropContext>
  );
}
