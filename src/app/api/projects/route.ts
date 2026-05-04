import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import Project from "@/models/Project";
import { createProjectSchema } from "@/lib/validations";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const projects = await Project.find({ "members.user": user._id })
      .populate("members.user", "name email")
      .populate("owner", "name email")
      .sort({ updatedAt: -1 });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const result = createProjectSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.issues },
        { status: 400 }
      );
    }

    await dbConnect();
    const project = await Project.create({
      ...result.data,
      owner: user._id,
      members: [{ user: user._id, role: "admin" }],
    });

    const populated = await Project.findById(project._id)
      .populate("members.user", "name email")
      .populate("owner", "name email");

    return NextResponse.json({ project: populated }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
