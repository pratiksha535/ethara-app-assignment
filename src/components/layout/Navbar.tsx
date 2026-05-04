"use client";

import { useAuth } from "@/context/AuthContext";
import Avatar from "@/components/ui/Avatar";

export default function Navbar() {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-30">
      <div />
      <div className="flex items-center gap-3">
        {user && (
          <>
            <span className="text-sm text-slate-600">{user.name}</span>
            <Avatar name={user.name} size="sm" />
          </>
        )}
      </div>
    </header>
  );
}
