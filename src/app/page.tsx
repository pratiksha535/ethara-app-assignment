"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Users, BarChart3, Kanban } from "lucide-react";

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.push("/dashboard");
  }, [user, loading, router]);

  if (loading) return null;

  const features = [
    { icon: Kanban, title: "Kanban Boards", desc: "Drag-and-drop task management with visual workflows" },
    { icon: Users, title: "Team Collaboration", desc: "Invite members, assign roles, and work together" },
    { icon: BarChart3, title: "Analytics Dashboard", desc: "Track progress with charts and real-time stats" },
    { icon: CheckCircle2, title: "Task Tracking", desc: "Priorities, due dates, and status tracking" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50">
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-indigo-600 tracking-tight">TaskFlow</h1>
        <div className="flex gap-3">
          <Link href="/login" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Login
          </Link>
          <Link href="/register" className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            Get Started
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-20 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="text-5xl font-bold text-slate-900 tracking-tight leading-tight">
            Manage your team&apos;s tasks{" "}
            <span className="text-indigo-600">effortlessly</span>
          </h2>
          <p className="mt-6 text-lg text-slate-600 leading-relaxed">
            TaskFlow helps teams organize projects, assign tasks, and track progress
            with beautiful Kanban boards and insightful dashboards.
          </p>
          <div className="mt-10 flex gap-4 justify-center">
            <Link href="/register" className="px-8 py-3 text-base font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
              Start Free
            </Link>
            <Link href="/login" className="px-8 py-3 text-base font-medium bg-white text-slate-700 rounded-lg hover:bg-slate-50 border border-slate-300 transition-colors">
              Sign In
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <feature.icon className="w-10 h-10 text-indigo-600 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
