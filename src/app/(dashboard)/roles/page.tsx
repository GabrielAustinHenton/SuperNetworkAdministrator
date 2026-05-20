"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/header";
import { DashboardShell, PageHeader } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, RefreshCw, ShieldCheck, ExternalLink, ChevronDown, ChevronRight } from "lucide-react";
import { getInitials } from "@/lib/utils";

interface RoleMember {
  id: string;
  displayName: string;
  userPrincipalName?: string;
}

interface Role {
  id: string;
  displayName: string;
  description?: string;
  isBuiltIn: boolean;
  members: RoleMember[];
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/graph/roles");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRoles(data.roles);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load roles");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRoles(); }, [fetchRoles]);

  const filtered = roles.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.displayName.toLowerCase().includes(q) ||
      (r.description ?? "").toLowerCase().includes(q) ||
      r.members.some(
        (m) =>
          m.displayName.toLowerCase().includes(q) ||
          (m.userPrincipalName ?? "").toLowerCase().includes(q)
      )
    );
  });

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const totalAssignments = roles.reduce((n, r) => n + r.members.length, 0);

  return (
    <>
      <Header title="Admin Roles" subtitle="Entra ID" />
      <DashboardShell>
        <PageHeader
          title="Admin Roles"
          description="Active directory role assignments in Entra ID"
        />

        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search roles or members…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" onClick={fetchRoles}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              window.open(
                "https://entra.microsoft.com/#view/Microsoft_AAD_IAM/RolesManagementMenuBlade/~/AllRoles",
                "_blank"
              )
            }
          >
            <ExternalLink className="w-4 h-4" />
            Manage in Entra
          </Button>
          {!loading && (
            <span className="text-sm text-muted-foreground ml-auto">
              {filtered.length} roles · {totalAssignments} total assignments
            </span>
          )}
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="rounded-xl border overflow-hidden divide-y">
          {loading
            ? [...Array(6)].map((_, i) => (
                <div key={i} className="px-4 py-4">
                  <div className="h-5 bg-muted/50 rounded animate-pulse w-48" />
                  <div className="h-3 bg-muted/30 rounded animate-pulse w-64 mt-2" />
                </div>
              ))
            : filtered.map((role) => {
                const open = expanded.has(role.id);
                return (
                  <div key={role.id}>
                    <button
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors text-left"
                      onClick={() => toggle(role.id)}
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{role.displayName}</span>
                          {!role.isBuiltIn && (
                            <Badge variant="secondary" className="text-xs">Custom</Badge>
                          )}
                        </div>
                        {role.description && (
                          <p className="text-xs text-muted-foreground truncate max-w-xl mt-0.5">
                            {role.description}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant={role.members.length > 0 ? "info" : "muted"}
                        className="shrink-0"
                      >
                        {role.members.length} {role.members.length === 1 ? "member" : "members"}
                      </Badge>
                      {open ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                      )}
                    </button>

                    {open && role.members.length > 0 && (
                      <div className="bg-muted/10 border-t px-4 py-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {role.members.map((m) => (
                            <div
                              key={m.id}
                              className="flex items-center gap-2.5 rounded-lg border bg-background px-3 py-2"
                            >
                              <Avatar className="h-7 w-7 shrink-0">
                                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                  {getInitials(m.displayName)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">{m.displayName}</p>
                                {m.userPrincipalName && (
                                  <p className="text-xs text-muted-foreground truncate">
                                    {m.userPrincipalName}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {open && role.members.length === 0 && (
                      <div className="bg-muted/10 border-t px-4 py-3 text-sm text-muted-foreground text-center">
                        No members assigned to this role.
                      </div>
                    )}
                  </div>
                );
              })}

          {!loading && filtered.length === 0 && (
            <div className="p-12 text-center text-sm text-muted-foreground">
              {search ? "No roles match your search." : "No active role assignments found."}
            </div>
          )}
        </div>
      </DashboardShell>
    </>
  );
}
