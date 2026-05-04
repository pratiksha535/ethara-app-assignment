import { Types } from "mongoose";

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMember {
  user: Types.ObjectId;
  role: "admin" | "member";
}

export interface IProject {
  _id: Types.ObjectId;
  name: string;
  description: string;
  owner: Types.ObjectId;
  members: IMember[];
  createdAt: Date;
  updatedAt: Date;
}

export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface ITask {
  _id: Types.ObjectId;
  title: string;
  description: string;
  project: Types.ObjectId;
  assignee: Types.ObjectId | null;
  createdBy: Types.ObjectId;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiError {
  error: string;
  details?: unknown[];
}

export interface DashboardStats {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
  overdue: number;
}

// Client-side DTO types used by components
export interface ClientMember {
  user: { _id: string; name: string; email: string };
  role: string;
}

export interface ClientTask {
  _id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  assignee: { _id: string; name: string; email: string } | null;
  createdBy: { _id: string; name: string; email: string };
  dueDate: string | null;
  status: TaskStatus;
  order: number;
}
