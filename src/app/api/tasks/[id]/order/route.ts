import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import Project from "@/models/Project";
import Task from "@/models/Task";
import { reorderTaskSchema } from "@/lib/validations";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const result = reorderTaskSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.issues },
        { status: 400 }
      );
    }

    await dbConnect();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const task = await Task.findById(id);
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    const project = await Project.findById(task.project);
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const memberEntry = project.members.find(
      (m: { user: { toString(): string }; role: string }) =>
        m.user.toString() === user._id.toString()
    );
    if (!memberEntry) return NextResponse.json({ error: "Access denied" }, { status: 403 });

    const isAdmin = memberEntry.role === "admin";
    const isCreator = task.createdBy.toString() === user._id.toString();
    if (!isAdmin && !isCreator) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    task.status = result.data.status;
    task.order = result.data.order;
    await task.save();

    const updated = await Task.findById(id)
      .populate("assignee", "name email")
      .populate("createdBy", "name email");

    return NextResponse.json({ task: updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
