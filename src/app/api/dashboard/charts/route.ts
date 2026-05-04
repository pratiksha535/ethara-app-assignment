import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import Project from "@/models/Project";
import Task from "@/models/Task";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();

    const projects = await Project.find({ "members.user": user._id }).select("_id name");
    const projectIds = projects.map((p) => p._id);

    const [byStatus, byProject, byPriority] = await Promise.all([
      Task.aggregate([
        { $match: { project: { $in: projectIds } } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Task.aggregate([
        { $match: { project: { $in: projectIds } } },
        { $group: { _id: "$project", count: { $sum: 1 } } },
      ]),
      Task.aggregate([
        { $match: { project: { $in: projectIds } } },
        { $group: { _id: "$priority", count: { $sum: 1 } } },
      ]),
    ]);

    const byProjectWithNames = byProject.map((item: { _id: unknown; count: number }) => {
      const project = projects.find((p) => p._id.toString() === item._id?.toString());
      return { name: project?.name || "Unknown", count: item.count };
    });

    return NextResponse.json({
      byStatus: byStatus.map((s: { _id: string; count: number }) => ({ status: s._id, count: s.count })),
      byProject: byProjectWithNames,
      byPriority: byPriority.map((p: { _id: string; count: number }) => ({ priority: p._id, count: p.count })),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
