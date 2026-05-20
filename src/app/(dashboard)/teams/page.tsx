"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/header";
import { DashboardShell, PageHeader } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, RefreshCw, Users, ExternalLink, Lock, Globe } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Team {
  id: string;
  displayName: string;
  description?: string;
  mail?: string;
  createdDateTime?: string;
  visibility?: string;
  isDynamic: boolean;
  memberCount: number | null;
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/graph/teams");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTeams(data.teams);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load teams");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTeams(); }, [fetchTeams]);

  const filtered = teams.filter((t) => {
    const q = search.toLowerCase();
    return (
      t.displayName.toLowerCase().includes(q) ||
      (t.description ?? "").toLowerCase().includes(q) ||
      (t.mail ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <>
      <Header title="Teams" subtitle="Microsoft Teams" />
      <DashboardShell>
        <PageHeader
          title="Teams Administration"
          description="All Microsoft Teams in your organization"
        />

        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search teams…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" onClick={fetchTeams}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open("https://admin.teams.microsoft.com", "_blank")}
          >
            <ExternalLink className="w-4 h-4" />
            Teams Admin Center
          </Button>
          {!loading && (
            <span className="text-sm text-muted-foreground ml-auto">
              {filtered.length} of {teams.length} teams
            </span>
          )}
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
                <th className="text-left font-medium text-muted-foreground px-4 py-3">Team</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Email</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden md:table-cell w-28">Members</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-3 w-28">Visibility</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell w-32">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading
                ? [...Array(8)].map((_, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3" colSpan={5}>
                        <div className="h-8 bg-muted/50 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                : filtered.map((team) => (
                    <tr key={team.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                            <Users className="w-4 h-4 text-violet-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{team.displayName}</p>
                            {team.description && (
                              <p className="text-xs text-muted-foreground truncate max-w-xs">
                                {team.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs">
                        {team.mail ?? "—"}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell w-28">
                        {team.memberCount !== null ? (
                          <span className="font-medium tabular-nums">{team.memberCount}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 w-28">
                        {team.visibility?.toLowerCase() === "private" ? (
                          <Badge variant="muted" className="gap-1">
                            <Lock className="w-3 h-3" />
                            Private
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <Globe className="w-3 h-3" />
                            {team.visibility ?? "Public"}
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs w-32">
                        {formatDate(team.createdDateTime)}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>

          {!loading && filtered.length === 0 && (
            <div className="p-12 text-center text-sm text-muted-foreground">
              {search ? "No teams match your search." : "No teams found."}
            </div>
          )}
        </div>
      </DashboardShell>
    </>
  );
}
