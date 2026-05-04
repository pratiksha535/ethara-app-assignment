"use client";

import { useState } from "react";
import { UserPlus, X, Crown, Shield } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import type { ClientMember } from "@/types";

interface MemberPanelProps {
  members: ClientMember[];
  ownerId: string;
  isAdmin: boolean;
  projectId: string;
  onMemberAdded: () => void;
  onMemberRemoved: () => void;
  onRoleChanged: () => void;
}

export default function MemberPanel({
  members, ownerId, isAdmin, projectId, onMemberAdded, onMemberRemoved, onRoleChanged,
}: MemberPanelProps) {
  const [showInvite, setShowInvite] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setShowInvite(false);
      setEmail("");
      setRole("member");
      onMemberAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to invite");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (userId: string) => {
    if (!confirm("Remove this member?")) return;
    try {
      const res = await fetch(`/api/projects/${projectId}/members/${userId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to remove member");
      }
      onMemberRemoved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove member");
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/members/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to change role");
      }
      onRoleChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change role");
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
          <button className="ml-2 text-red-400 hover:text-red-600" onClick={() => setError("")}>✕</button>
        </div>
      )}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900">Members ({members.length})</h3>
        {isAdmin && (
          <Button size="sm" onClick={() => setShowInvite(true)}>
            <UserPlus className="w-4 h-4 mr-1" /> Invite
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {members.map((m) => (
          <div key={m.user._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Avatar name={m.user.name} size="md" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-900">{m.user.name}</span>
                  {m.user._id === ownerId && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                </div>
                <p className="text-xs text-slate-500">{m.user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isAdmin && m.user._id !== ownerId ? (
                <>
                  <select
                    className="text-xs border border-slate-200 rounded px-2 py-1"
                    value={m.role}
                    onChange={(e) => handleRoleChange(m.user._id, e.target.value)}
                  >
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                  </select>
                  <button
                    onClick={() => handleRemove(m.user._id)}
                    className="p-1 rounded hover:bg-red-100 text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <Badge variant={m.role === "admin" ? "info" : "default"}>
                  {m.role === "admin" && <Shield className="w-3 h-3 mr-1" />}
                  {m.role}
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={showInvite} onClose={() => setShowInvite(false)} title="Invite Member">
        <form onSubmit={handleInvite} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
          )}
          <Input
            label="Email Address"
            type="email"
            placeholder="colleague@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Role</label>
            <select
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" type="button" onClick={() => setShowInvite(false)}>Cancel</Button>
            <Button type="submit" loading={loading}>Send Invite</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
