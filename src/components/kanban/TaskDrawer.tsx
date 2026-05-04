"use client";

import { useState, useEffect } from "react";
import Drawer from "@/components/ui/Drawer";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Avatar from "@/components/ui/Avatar";
import type { ClientTask, ClientMember } from "@/types";

interface TaskDrawerProps {
  task: ClientTask | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, data: Record<string, unknown>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  members: ClientMember[];
  isAdmin: boolean;
  currentUserId: string;
}

export default function TaskDrawer({
  task, isOpen, onClose, onSave, onDelete, members, isAdmin, currentUserId,
}: TaskDrawerProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [assignee, setAssignee] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState("todo");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const canEdit = isAdmin || task?.createdBy?._id === currentUserId;

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setPriority(task.priority);
      setAssignee(task.assignee?._id || "");
      setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "");
      setStatus(task.status);
      setError("");
    }
  }, [task]);

  const handleSave = async () => {
    if (!task) return;
    setError("");
    setSaving(true);
    try {
      await onSave(task._id, {
        title,
        description,
        priority,
        assignee: assignee || null,
        dueDate: dueDate || null,
        status,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save task");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!task || !confirm("Delete this task?")) return;
    try {
      await onDelete(task._id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task");
    }
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={canEdit ? "Edit Task" : "Task Details"}>
      {task && (
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
          )}
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={!canEdit}
          />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Description</label>
            <textarea
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none disabled:bg-slate-50"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={!canEdit}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">Status</label>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={!canEdit}
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">Priority</label>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                disabled={!canEdit}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Assignee</label>
            <select
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              disabled={!canEdit}
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.user._id} value={m.user._id}>{m.user.name}</option>
              ))}
            </select>
          </div>
          <Input
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            disabled={!canEdit}
          />

          <div className="pt-2 border-t border-slate-200">
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
              <span>Created by</span>
              <Avatar name={task.createdBy.name} size="sm" />
              <span>{task.createdBy.name}</span>
            </div>
          </div>

          {canEdit && (
            <div className="flex gap-3">
              <Button onClick={handleSave} loading={saving} className="flex-1">Save Changes</Button>
              {isAdmin && (
                <Button variant="danger" onClick={handleDelete}>Delete</Button>
              )}
            </div>
          )}
        </div>
      )}
    </Drawer>
  );
}
