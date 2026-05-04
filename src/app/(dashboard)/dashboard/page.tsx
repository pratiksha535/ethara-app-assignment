"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ListTodo, Clock, CheckCircle2, AlertTriangle, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import StatCard from "@/components/charts/StatCard";
import StatusPieChart from "@/components/charts/StatusPieChart";
import ProjectBarChart from "@/components/charts/ProjectBarChart";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import type { TaskStatus, TaskPriority } from "@/types";

interface DashboardStats {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
  overdue: number;
}

interface ChartData {
  byStatus: { status: string; count: number }[];
  byProject: { name: string; count: number }[];
  byPriority: { priority: string; count: number }[];
}

interface RecentTask {
  _id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: { _id: string; name: string; email: string } | null;
  project: { _id: string; name: string };
  updatedAt: string;
}

interface OverdueTask {
  _id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: { _id: string; name: string; email: string } | null;
  project: { _id: string; name: string };
  dueDate: string;
}

const statusBadge = {
  todo: { variant: "info" as const, label: "To Do" },
  in_progress: { variant: "warning" as const, label: "In Progress" },
  done: { variant: "success" as const, label: "Done" },
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({ total: 0, todo: 0, inProgress: 0, done: 0, overdue: 0 });
  const [charts, setCharts] = useState<ChartData>({ byStatus: [], byProject: [], byPriority: [] });
  const [recent, setRecent] = useState<RecentTask[]>([]);
  const [overdue, setOverdue] = useState<OverdueTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, chartsRes, recentRes, overdueRes] = await Promise.all([
        fetch("/api/dashboard/stats"),
        fetch("/api/dashboard/charts"),
        fetch("/api/dashboard/recent"),
        fetch("/api/dashboard/overdue"),
      ]);

      if (!statsRes.ok || !chartsRes.ok || !recentRes.ok || !overdueRes.ok) {
        setError(true);
        return;
      }

      setStats(await statsRes.json());
      setCharts(await chartsRes.json());
      const recentData = await recentRes.json();
      setRecent(recentData.tasks);
      const overdueData = await overdueRes.json();
      setOverdue(overdueData.tasks);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-slate-600 font-medium">Failed to load dashboard data</p>
          <button
            onClick={() => { setError(false); setLoading(true); fetchData(); }}
            className="mt-3 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-slate-600 mt-1">Overview of your tasks and projects</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Tasks" value={stats.total} icon={ListTodo} color="text-indigo-600" bgColor="bg-indigo-50" />
        <StatCard title="In Progress" value={stats.inProgress} icon={Clock} color="text-amber-600" bgColor="bg-amber-50" />
        <StatCard title="Completed" value={stats.done} icon={CheckCircle2} color="text-green-600" bgColor="bg-green-50" />
        <StatCard title="Overdue" value={stats.overdue} icon={AlertTriangle} color="text-red-600" bgColor="bg-red-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Task Status</h3>
          <StatusPieChart data={charts.byStatus} />
        </Card>
        <Card className="p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Tasks per Project</h3>
          <ProjectBarChart data={charts.byProject} />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              Overdue Tasks
            </h3>
          </div>
          {overdue.length === 0 ? (
            <p className="text-sm text-slate-500 py-4 text-center">No overdue tasks</p>
          ) : (
            <div className="space-y-2">
              {overdue.slice(0, 5).map((task) => (
                <Link
                  key={task._id}
                  href={`/projects/${task.project._id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-red-50 hover:bg-red-100 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{task.title}</p>
                    <p className="text-xs text-slate-500">{task.project.name}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <span className="text-xs text-red-600 font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Recent Activity</h3>
          {recent.length === 0 ? (
            <p className="text-sm text-slate-500 py-4 text-center">No recent activity</p>
          ) : (
            <div className="space-y-2">
              {recent.slice(0, 10).map((task) => (
                <Link
                  key={task._id}
                  href={`/projects/${task.project._id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {task.assignee && <Avatar name={task.assignee.name} size="sm" />}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{task.title}</p>
                      <p className="text-xs text-slate-500">{task.project.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <Badge variant={statusBadge[task.status]?.variant || "default"}>
                      {statusBadge[task.status]?.label || task.status}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
