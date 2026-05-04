"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { DropResult } from "@hello-pangea/dnd";
import { Users, ArrowLeft, Settings } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import type { ClientTask, ClientMember } from "@/types";
import KanbanBoard from "@/components/kanban/KanbanBoard";
import TaskDrawer from "@/components/kanban/TaskDrawer";
import MemberPanel from "@/components/layout/MemberPanel";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Avatar from "@/components/ui/Avatar";
import Drawer from "@/components/ui/Drawer";
import Link from "next/link";

interface Project {
  _id: string;
  name: string;
  description: string;
  owner: { _id: string; name: string; email: string };
  members: ClientMember[];
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<ClientTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<ClientTask | null>(null);
  const [showTaskDrawer, setShowTaskDrawer] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskStatus, setNewTaskStatus] = useState("todo");
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState("medium");
  const [newDueDate, setNewDueDate] = useState("");
  const [newAssignee, setNewAssignee] = useState("");
  const [creating, setCreating] = useState(false);
  const [newTaskError, setNewTaskError] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [savingProject, setSavingProject] = useState(false);
  const [settingsError, setSettingsError] = useState("");
  const [deletingProject, setDeletingProject] = useState(false);

  const isAdmin = project?.members.some(
    (m) => m.user._id === user?._id && m.role === "admin"
  ) ?? false;

  const fetchProject = useCallback(async () => {
    try {
      const [projRes, tasksRes] = await Promise.all([
        fetch(`/api/projects/${projectId}`),
        fetch(`/api/projects/${projectId}/tasks`),
      ]);
      if (projRes.ok) {
        const projData = await projRes.json();
        setProject(projData.project);
      }
      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setTasks(tasksData.tasks);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const handleDragEnd = useCallback(async (result: DropResult) => {
    const { draggableId, destination, source } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId;
    const newOrder = destination.index;

    // Snapshot for revert
    const previousTasks = tasks;

    setTasks((prev) =>
      prev.map((t) =>
        t._id === draggableId ? { ...t, status: newStatus as ClientTask["status"], order: newOrder } : t
      )
    );

    const res = await fetch(`/api/tasks/${draggableId}/order`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus, order: newOrder }),
    });

    if (!res.ok) {
      setTasks(previousTasks);
    }
  }, [tasks]);

  const handleTaskClick = (task: ClientTask) => {
    setSelectedTask(task);
    setShowTaskDrawer(true);
  };

  const handleTaskSave = async (id: string, data: Record<string, unknown>) => {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error || "Failed to save task");
    }
    await fetchProject();
  };

  const handleTaskDelete = async (id: string) => {
    const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error || "Failed to delete task");
    }
    setTasks((prev) => prev.filter((t) => t._id !== id));
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewTaskError("");
    setCreating(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          priority: newPriority,
          dueDate: newDueDate || null,
          assignee: newAssignee || null,
          status: newTaskStatus,
        }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Failed to create task");
      }
      const data = await res.json();
      setTasks((prev) => [...prev, data.task]);
      setShowAddTask(false);
      setNewTitle("");
      setNewPriority("medium");
      setNewDueDate("");
      setNewAssignee("");
    } catch (err) {
      setNewTaskError(err instanceof Error ? err.message : "Failed to create task");
    } finally {
      setCreating(false);
    }
  };

  const openAddTask = (status: string) => {
    setNewTaskStatus(status);
    setShowAddTask(true);
  };

  const handleOpenSettings = () => {
    if (!project) return;
    setEditName(project.name);
    setEditDescription(project.description || "");
    setShowSettings(true);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsError("");
    setSavingProject(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, description: editDescription }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Failed to save project");
      }
      await fetchProject();
      setShowSettings(false);
    } catch (err) {
      setSettingsError(err instanceof Error ? err.message : "Failed to save project");
    } finally {
      setSavingProject(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm("Delete this project and all its tasks? This cannot be undone.")) return;
    setDeletingProject(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/projects");
      }
    } finally {
      setDeletingProject(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-20">
        <h3 className="text-lg font-medium text-slate-900">Project not found</h3>
        <Link href="/projects" className="text-indigo-600 hover:text-indigo-700 mt-2 inline-block">
          Back to projects
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/projects" className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{project.name}</h1>
            {project.description && (
              <p className="text-slate-600 mt-0.5">{project.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {project.members.slice(0, 5).map((m) => (
              <Avatar key={m.user._id} name={m.user.name} size="sm" className="ring-2 ring-white" />
            ))}
          </div>
          <button
            onClick={() => setShowMembers(true)}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            title="Members"
          >
            <Users className="w-5 h-5 text-slate-600" />
          </button>
          {isAdmin && (
            <button
              onClick={handleOpenSettings}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              title="Project Settings"
            >
              <Settings className="w-5 h-5 text-slate-600" />
            </button>
          )}
        </div>
      </div>

      <KanbanBoard
        tasks={tasks}
        onDragEnd={handleDragEnd}
        onTaskClick={handleTaskClick}
        onAddTask={openAddTask}
      />

      <TaskDrawer
        task={selectedTask}
        isOpen={showTaskDrawer}
        onClose={() => setShowTaskDrawer(false)}
        onSave={handleTaskSave}
        onDelete={handleTaskDelete}
        members={project.members}
        isAdmin={isAdmin}
        currentUserId={user?._id || ""}
      />

      <Drawer isOpen={showMembers} onClose={() => setShowMembers(false)} title="Team Members">
        <MemberPanel
          members={project.members}
          ownerId={project.owner._id}
          isAdmin={isAdmin}
          projectId={projectId}
          onMemberAdded={fetchProject}
          onMemberRemoved={fetchProject}
          onRoleChanged={fetchProject}
        />
      </Drawer>

      <Modal isOpen={showSettings} onClose={() => setShowSettings(false)} title="Project Settings">
        <form onSubmit={handleSaveProject} className="space-y-4">
          {settingsError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{settingsError}</div>
          )}
          <Input
            label="Project Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            required
            minLength={3}
          />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Description</label>
            <textarea
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              rows={3}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              maxLength={500}
            />
          </div>
          <div className="flex gap-3 justify-between">
            <Button variant="danger" type="button" onClick={handleDeleteProject} loading={deletingProject}>
              Delete Project
            </Button>
            <div className="flex gap-2">
              <Button variant="secondary" type="button" onClick={() => setShowSettings(false)}>Cancel</Button>
              <Button type="submit" loading={savingProject}>Save Changes</Button>
            </div>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showAddTask} onClose={() => setShowAddTask(false)} title="Add Task">
        <form onSubmit={handleAddTask} className="space-y-4">
          {newTaskError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{newTaskError}</div>
          )}
          <Input
            label="Title"
            placeholder="What needs to be done?"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
            minLength={3}
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">Priority</label>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <Input
              label="Due Date"
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Assignee</label>
            <select
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={newAssignee}
              onChange={(e) => setNewAssignee(e.target.value)}
            >
              <option value="">Unassigned</option>
              {project.members.map((m) => (
                <option key={m.user._id} value={m.user._id}>{m.user.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" type="button" onClick={() => setShowAddTask(false)}>Cancel</Button>
            <Button type="submit" loading={creating}>Add Task</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
