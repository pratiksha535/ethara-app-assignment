import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import Project from "@/models/Project";
import Task from "@/models/Task";
import { createTaskSchema } from "@/lib/validations";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await dbConnect();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const project = await Project.findById(id);
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const isMember = project.members.some(
      (m: { user: { toString(): string } }) => m.user.toString() === user._id.toString()
    );
    if (!isMember) return NextResponse.json({ error: "Access denied" }, { status: 403 });

    const tasks = await Task.find({ project: id })
      .populate("assignee", "name email")
      .populate("createdBy", "name email")
      .sort({ order: 1, createdAt: -1 });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const result = createTaskSchema.safeParse(body);

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

    const project = await Project.findById(id);
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const isMember = project.members.some(
      (m: { user: { toString(): string } }) => m.user.toString() === user._id.toString()
    );
    if (!isMember) return NextResponse.json({ error: "Access denied" }, { status: 403 });

    const taskCount = await Task.countDocuments({ project: id, status: "todo" });

    const task = await Task.create({
      ...result.data,
      dueDate: result.data.dueDate ? new Date(result.data.dueDate) : null,
      assignee: result.data.assignee || null,
      project: id,
      createdBy: user._id,
      status: "todo",
      order: taskCount,
    });

    const populated = await Task.findById(task._id)
      .populate("assignee", "name email")
      .populate("createdBy", "name email");

    return NextResponse.json({ task: populated }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
