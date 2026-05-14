"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/header";
import { DashboardShell, PageHeader } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  UserPlus, Search, MoreHorizontal, UserX, UserCheck,
  LogOut, Trash2, RefreshCw, Mail, Building,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, getInitials, formatRelativeTime } from "@/lib/utils";
import type { GraphUser } from "@/types/graph";

export default function UsersPage() {
  const [users, setUsers] = useState<GraphUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/graph/users");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUsers(data.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filtered = users.filter(
    (u) =>
      u.displayName.toLowerCase().includes(search.toLowerCase()) ||
      u.userPrincipalName.toLowerCase().includes(search.toLowerCase()) ||
      (u.department ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const handleAction = async (userId: string, action: string) => {
    setActionLoading(userId + action);
    try {
      const res = await fetch(`/api/graph/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error("Action failed");
      await fetchUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId: string, name: string) => {
    if (!confirm(`Permanently delete ${name}? This cannot be undone.`)) return;
    setActionLoading(userId + "delete");
    try {
      const res = await fetch(`/api/graph/users/${userId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      await fetchUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <>
      <Header
        title="Users"
        subtitle="Entra ID / Azure AD"
        actions={
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <UserPlus className="w-4 h-4" />
            New User
          </Button>
        }
      />
      <DashboardShell>
        <PageHeader
          title="User Management"
          description="Create, enable, disable, and manage Entra ID accounts"
        />

        {/* Search + filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search users, departments…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" onClick={fetchUsers}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground ml-auto">
            {filtered.length} of {users.length} users
          </span>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* User table */}
        <div className="rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left font-medium text-muted-foreground px-4 py-3">User</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden md:table-cell w-36">Department</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell w-32">Last Sign-In</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-3 w-24">Status</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell w-24">Source</th>
                <th className="w-10 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading
                ? [...Array(8)].map((_, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3" colSpan={6}>
                        <div className="h-8 bg-muted/50 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                : filtered.map((user) => (
                    <tr key={user.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                              {getInitials(user.displayName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{user.displayName}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {user.userPrincipalName}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-muted-foreground w-36 text-sm truncate max-w-[144px]">
                        {user.department ?? "—"}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs w-32">
                        {formatRelativeTime(user.signInActivity?.lastSignInDateTime)}
                      </td>
                      <td className="px-4 py-3 w-24">
                        <Badge variant={user.accountEnabled ? "success" : "muted"}>
                          {user.accountEnabled ? "Active" : "Disabled"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell w-24">
                        <Badge variant={user.onPremisesSyncEnabled ? "info" : "secondary"}>
                          {user.onPremisesSyncEnabled ? "On-Prem" : "Cloud"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              disabled={actionLoading?.startsWith(user.id)}
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {user.accountEnabled ? (
                              <DropdownMenuItem
                                onClick={() => handleAction(user.id, "disable")}
                              >
                                <UserX className="mr-2 h-4 w-4" />
                                Disable Account
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => handleAction(user.id, "enable")}
                              >
                                <UserCheck className="mr-2 h-4 w-4" />
                                Enable Account
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleAction(user.id, "revokeSignInSessions")}
                            >
                              <LogOut className="mr-2 h-4 w-4" />
                              Revoke Sessions
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDelete(user.id, user.displayName)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>

          {!loading && filtered.length === 0 && (
            <div className="p-12 text-center text-sm text-muted-foreground" >
              {search ? "No users match your search." : "No users found."}
            </div>
          )}
        </div>
      </DashboardShell>

      {/* Create User Dialog */}
      <CreateUserDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={fetchUsers}
      />
    </>
  );
}

// ─── Create User Dialog ───────────────────────────────────────────────────────

function CreateUserDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({
    displayName: "",
    firstName: "",
    lastName: "",
    upnPrefix: "",
    upnDomain: "",
    password: "",
    jobTitle: "",
    department: "",
    usageLocation: "US",
    forceChangePassword: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (patch: Partial<typeof form>) =>
    setForm((f) => ({ ...f, ...patch }));

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const upn = `${form.upnPrefix}@${form.upnDomain}`;
      const res = await fetch("/api/graph/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: form.displayName || `${form.firstName} ${form.lastName}`,
          userPrincipalName: upn,
          mailNickname: form.upnPrefix,
          password: form.password,
          forceChangePasswordNextSignIn: form.forceChangePassword,
          jobTitle: form.jobTitle || undefined,
          department: form.department || undefined,
          usageLocation: form.usageLocation || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onClose();
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Creates an Entra ID account. The user will receive a temporary password.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>First Name</Label>
              <Input
                value={form.firstName}
                onChange={(e) => {
                  update({
                    firstName: e.target.value,
                    displayName: `${e.target.value} ${form.lastName}`.trim(),
                    upnPrefix:
                      form.upnPrefix ||
                      e.target.value.toLowerCase().replace(/\s+/g, "."),
                  });
                }}
                placeholder="Jane"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Last Name</Label>
              <Input
                value={form.lastName}
                onChange={(e) =>
                  update({
                    lastName: e.target.value,
                    displayName: `${form.firstName} ${e.target.value}`.trim(),
                  })
                }
                placeholder="Smith"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Username (UPN)</Label>
            <div className="flex items-center gap-1">
              <Input
                value={form.upnPrefix}
                onChange={(e) => update({ upnPrefix: e.target.value })}
                placeholder="jane.smith"
                className="flex-1"
              />
              <span className="text-muted-foreground">@</span>
              <Input
                value={form.upnDomain}
                onChange={(e) => update({ upnDomain: e.target.value })}
                placeholder="contoso.com"
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Temporary Password</Label>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => update({ password: e.target.value })}
              placeholder="Min. 8 chars, upper + lower + number + symbol"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Job Title</Label>
              <Input
                value={form.jobTitle}
                onChange={(e) => update({ jobTitle: e.target.value })}
                placeholder="Software Engineer"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Department</Label>
              <Input
                value={form.department}
                onChange={(e) => update({ department: e.target.value })}
                placeholder="Engineering"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Usage Location (ISO 2-letter)</Label>
            <Input
              value={form.usageLocation}
              onChange={(e) => update({ usageLocation: e.target.value.toUpperCase() })}
              placeholder="US"
              maxLength={2}
              className="uppercase"
            />
            <p className="text-xs text-muted-foreground">
              Required for license assignment (e.g., US, GB, CA)
            </p>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Creating…" : "Create User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
