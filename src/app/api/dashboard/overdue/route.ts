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

    const tasks = await Task.find({
      project: { $in: projectIds },
      status: { $ne: "done" },
      $and: [{ dueDate: { $lt: new Date() } }, { dueDate: { $ne: null } }],
    })
      .populate("assignee", "name email")
      .populate("project", "name")
      .sort({ dueDate: 1 });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
