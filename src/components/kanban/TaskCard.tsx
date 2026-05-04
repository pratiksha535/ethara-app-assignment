"use client";

import { Draggable } from "@hello-pangea/dnd";
import { Calendar, AlertCircle } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import type { TaskPriority, TaskStatus } from "@/types";

interface TaskCardTask {
  _id: string;
  title: string;
  priority: TaskPriority;
  assignee: { _id: string; name: string; email: string } | null;
  dueDate: string | null;
  status: TaskStatus;
}

interface TaskCardProps {
  task: TaskCardTask;
  index: number;
  onClick: () => void;
}

const priorityVariant: Record<TaskPriority, "success" | "warning" | "danger"> = {
  low: "success",
  medium: "warning",
  high: "danger",
};

const priorityBorder: Record<TaskPriority, string> = {
  low: "border-l-green-500",
  medium: "border-l-amber-500",
  high: "border-l-red-500",
};

function isOverdue(dueDate: string | null, status: TaskStatus): boolean {
  if (!dueDate || status === "done") return false;
  return new Date(dueDate) < new Date();
}

export default function TaskCard({ task, index, onClick }: TaskCardProps) {
  const overdue = isOverdue(task.dueDate, task.status);

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white rounded-lg border border-slate-200 p-3 border-l-4 ${
            priorityBorder[task.priority]
          } cursor-pointer hover:shadow-md transition-shadow ${
            snapshot.isDragging ? "shadow-lg rotate-2" : ""
          }`}
          onClick={onClick}
        >
          <p className="text-sm font-medium text-slate-900 mb-2">{task.title}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={priorityVariant[task.priority]}>
                {task.priority}
              </Badge>
              {task.dueDate && (
                <span className={`flex items-center gap-1 text-xs ${overdue ? "text-red-600 font-medium" : "text-slate-500"}`}>
                  {overdue && <AlertCircle className="w-3 h-3" />}
                  <Calendar className="w-3 h-3" />
                  {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              )}
            </div>
            {task.assignee && <Avatar name={task.assignee.name} size="sm" />}
          </div>
        </div>
      )}
    </Draggable>
  );
}
