import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import Project from "@/models/Project";
import User from "@/models/User";
import { addMemberSchema } from "@/lib/validations";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const result = addMemberSchema.safeParse(body);

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
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const memberEntry = project.members.find(
      (m: { user: { toString(): string }; role: string }) =>
        m.user.toString() === currentUser._id.toString()
    );
    if (!memberEntry || memberEntry.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const userToAdd = await User.findOne({ email: result.data.email });
    if (!userToAdd) {
      return NextResponse.json({ error: "User not found with that email" }, { status: 404 });
    }

    const alreadyMember = project.members.some(
      (m: { user: { toString(): string } }) =>
        m.user.toString() === userToAdd._id.toString()
    );
    if (alreadyMember) {
      return NextResponse.json({ error: "User is already a member" }, { status: 400 });
    }

    project.members.push({ user: userToAdd._id, role: result.data.role });
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
