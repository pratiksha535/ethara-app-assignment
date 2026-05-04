import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import Project from "@/models/Project";
import { updateMemberRoleSchema } from "@/lib/validations";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, userId } = await params;
    const body = await request.json();
    const result = updateMemberRoleSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.issues },
        { status: 400 }
      );
    }

    await dbConnect();

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const adminEntry = project.members.find(
      (m: { user: { toString(): string }; role: string }) =>
        m.user.toString() === currentUser._id.toString()
    );
    if (!adminEntry || adminEntry.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    if (project.owner.toString() === userId) {
      return NextResponse.json({ error: "Cannot change the owner's role" }, { status: 400 });
    }

    const targetMember = project.members.find(
      (m: { user: { toString(): string }; role: string }) =>
        m.user.toString() === userId
    );
    if (!targetMember) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    targetMember.role = result.data.role;
    await project.save();

    const populated = await Project.findById(id)
      .populate("members.user", "name email")
      .populate("owner", "name email");

    return NextResponse.json({ project: populated });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, userId } = await params;
    await dbConnect();

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const adminEntry = project.members.find(
      (m: { user: { toString(): string }; role: string }) =>
        m.user.toString() === currentUser._id.toString()
    );
    if (!adminEntry || adminEntry.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    if (project.owner.toString() === userId) {
      return NextResponse.json({ error: "Cannot remove the project owner" }, { status: 400 });
    }

    project.members = project.members.filter(
      (m: { user: { toString(): string } }) => m.user.toString() !== userId
    );
    await project.save();

    const populated = await Project.findById(id)
      .populate("members.user", "name email")
      .populate("owner", "name email");

    return NextResponse.json({ project: populated });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
