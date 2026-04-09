"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/header";
import { DashboardShell, PageHeader } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, RefreshCw, UsersRound } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { GraphGroup } from "@/types/graph";

function getGroupType(group: GraphGroup): string {
  if (group.groupTypes?.includes("Unified")) return "Microsoft 365";
  if (group.securityEnabled && !group.mailEnabled) {
    return group.membershipRule ? "Dynamic Security" : "Security";
  }
  if (group.mailEnabled && group.securityEnabled) return "Mail-Enabled Security";
  if (group.mailEnabled) return "Distribution";
  return "Security";
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<GraphGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/graph/groups");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setGroups(data.groups);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load groups");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGroups(); }, [fetchGroups]);

  const filtered = groups.filter((g) =>
    g.displayName.toLowerCase().includes(search.toLowerCase()) ||
    (g.description ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Header title="Groups" subtitle="Entra ID" />
      <DashboardShell>
        <PageHeader
          title="Group Management"
          description="Microsoft 365, security, distribution, and dynamic groups"
        />

        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search groups…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" onClick={fetchGroups}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground ml-auto">
            {filtered.length} of {groups.length} groups
          </span>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left font-medium text-muted-foreground px-4 py-3">Group</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Type</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Created</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Sync</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading
                ? [...Array(6)].map((_, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3" colSpan={4}>
                        <div className="h-8 bg-muted/50 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                : filtered.map((group) => (
                    <tr key={group.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <UsersRound className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{group.displayName}</p>
                            {group.mail && (
                              <p className="text-xs text-muted-foreground">{group.mail}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <Badge variant="outline">{getGroupType(group)}</Badge>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs">
                        {formatDate(group.createdDateTime)}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {group.onPremisesSyncEnabled ? (
                          <Badge variant="info">On-Prem Synced</Badge>
                        ) : (
                          <Badge variant="muted">Cloud</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
          {!loading && filtered.length === 0 && (
            <div className="p-12 text-center text-sm text-muted-foreground">
              {search ? "No groups match your search." : "No groups found."}
            </div>
          )}
        </div>
      </DashboardShell>
    </>
  );
}
