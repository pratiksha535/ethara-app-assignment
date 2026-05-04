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

    const projects = await Project.find({ "members.user": user._id }).select("_id");
    const projectIds = projects.map((p) => p._id);

    const [total, todo, inProgress, done, overdue] = await Promise.all([
      Task.countDocuments({ project: { $in: projectIds } }),
      Task.countDocuments({ project: { $in: projectIds }, status: "todo" }),
      Task.countDocuments({ project: { $in: projectIds }, status: "in_progress" }),
      Task.countDocuments({ project: { $in: projectIds }, status: "done" }),
      Task.countDocuments({
        project: { $in: projectIds },
        status: { $ne: "done" },
        $and: [{ dueDate: { $lt: new Date() } }, { dueDate: { $ne: null } }],
      }),
    ]);

    return NextResponse.json({ total, todo, inProgress, done, overdue });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
