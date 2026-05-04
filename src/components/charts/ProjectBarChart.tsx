"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ProjectBarChartProps {
  data: { name: string; count: number }[];
}

export default function ProjectBarChart({ data }: ProjectBarChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[250px] text-slate-400 text-sm">
        No project data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94A3B8" />
        <YAxis tick={{ fontSize: 12 }} stroke="#94A3B8" allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="count" fill="#4F46E5" radius={[4, 4, 0, 0]} name="Tasks" />
      </BarChart>
    </ResponsiveContainer>
  );
}
