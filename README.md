# TaskFlow — Team Task Manager

A full-stack web app for team task management with Kanban boards, dashboards, and role-based access control.

## Features

- **Authentication** — Signup/Login with JWT
- **Projects** — Create, manage, and collaborate on projects
- **Kanban Board** — Drag-and-drop task management (To Do → In Progress → Done)
- **Team Management** — Invite members by email, assign Admin/Member roles
- **Dashboard** — Stats, charts (pie + bar), overdue tasks, recent activity
- **Role-Based Access** — Admins manage projects and members; Members manage their own tasks

## Tech Stack

- **Frontend & Backend:** Next.js 14 (App Router), TypeScript
- **Database:** MongoDB Atlas (Mongoose ODM)
- **Auth:** JWT (httpOnly cookies) + bcrypt
- **UI:** Tailwind CSS, Framer Motion, Lucide Icons
- **Charts:** Recharts
- **Kanban:** @hello-pangea/dnd
- **Deployment:** Railway

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (free tier works)

### Setup

1. Clone the repo:
   ```bash
   git clone <repo-url>
   cd taskflow
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local`:
   ```env
   MONGODB_URI=your-mongodb-atlas-connection-string
   JWT_SECRET=your-secret-key-min-32-characters
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. Run the dev server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Deployment (Railway)

1. Push code to GitHub
2. Connect repo to Railway
3. Set environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `NEXT_PUBLIC_APP_URL` (your Railway URL)
4. Railway auto-detects Next.js and deploys

## API Endpoints

### Auth
- `POST /api/auth/register` — Create account
- `POST /api/auth/login` — Sign in
- `POST /api/auth/logout` — Sign out
- `GET /api/auth/me` — Current user

### Projects
- `GET /api/projects` — List projects
- `POST /api/projects` — Create project
- `GET /api/projects/:id` — Get project
- `PUT /api/projects/:id` — Update project (Admin)
- `DELETE /api/projects/:id` — Delete project (Admin)

### Members
- `POST /api/projects/:id/members` — Add member (Admin)
- `PUT /api/projects/:id/members/:userId` — Change role (Admin)
- `DELETE /api/projects/:id/members/:userId` — Remove member (Admin)

### Tasks
- `GET /api/projects/:id/tasks` — List tasks
- `POST /api/projects/:id/tasks` — Create task
- `PUT /api/tasks/:id` — Update task
- `PATCH /api/tasks/:id/order` — Reorder (Kanban)
- `DELETE /api/tasks/:id` — Delete task (Admin)

### Dashboard
- `GET /api/dashboard/stats` — Summary counts
- `GET /api/dashboard/charts` — Chart data
- `GET /api/dashboard/recent` — Recent tasks
- `GET /api/dashboard/overdue` — Overdue tasks
