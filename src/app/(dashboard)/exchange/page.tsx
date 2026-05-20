"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/header";
import { DashboardShell, PageHeader } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Mail, ExternalLink, Search, RefreshCw, HardDrive, AlertTriangle } from "lucide-react";

interface Mailbox {
  userPrincipalName: string;
  displayName: string;
  isDeleted: boolean;
  prohibitSendQuotaBytes: number;
  prohibitSendReceiveQuotaBytes: number;
  storageUsedBytes: number;
  itemCount: number;
  lastActivityDate?: string;
}

interface Stats {
  total: number;
  totalStorageBytes: number;
  fullMailboxes: number;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const gb = bytes / 1_073_741_824;
  if (gb >= 1) return `${gb.toFixed(1)} GB`;
  const mb = bytes / 1_048_576;
  return `${mb.toFixed(0)} MB`;
}

function UsageBar({ used, quota }: { used: number; quota: number }) {
  if (!quota) return <span className="text-muted-foreground text-xs">—</span>;
  const pct = Math.min((used / quota) * 100, 100);
  const color = pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-emerald-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden min-w-[60px]">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-muted-foreground tabular-nums w-8 text-right">
        {Math.round(pct)}%
      </span>
    </div>
  );
}

export default function ExchangePage() {
  const [mailboxes, setMailboxes] = useState<Mailbox[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchMailboxes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/graph/exchange");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMailboxes(data.mailboxes ?? []);
      setStats(data.stats ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load mailbox data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMailboxes(); }, [fetchMailboxes]);

  const filtered = mailboxes.filter((m) => {
    const q = search.toLowerCase();
    return (
      m.displayName.toLowerCase().includes(q) ||
      m.userPrincipalName.toLowerCase().includes(q)
    );
  });

  const hasData = mailboxes.length > 0;

  return (
    <>
      <Header title="Exchange" subtitle="Exchange Online" />
      <DashboardShell>
        <PageHeader
          title="Exchange Online"
          description="Mailbox usage and storage across your organization"
        />

        {/* Stats bar */}
        {stats && hasData && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs text-muted-foreground">Total Mailboxes</p>
              <p className="text-2xl font-semibold tabular-nums mt-1">{stats.total.toLocaleString()}</p>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs text-muted-foreground">Total Storage Used</p>
              <p className="text-2xl font-semibold tabular-nums mt-1">{formatBytes(stats.totalStorageBytes)}</p>
            </div>
            <div className="rounded-xl border bg-card p-4 sm:col-span-1 col-span-2">
              <p className="text-xs text-muted-foreground">Near/Over Quota</p>
              <p className={`text-2xl font-semibold tabular-nums mt-1 ${stats.fullMailboxes > 0 ? "text-red-600" : ""}`}>
                {stats.fullMailboxes}
              </p>
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search mailboxes…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" onClick={fetchMailboxes}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open("https://admin.exchange.microsoft.com", "_blank")}
          >
            <ExternalLink className="w-4 h-4" />
            Exchange Admin Center
          </Button>
          {!loading && hasData && (
            <span className="text-sm text-muted-foreground ml-auto">
              {filtered.length} of {mailboxes.length} mailboxes
            </span>
          )}
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Table */}
        {(loading || hasData) ? (
          <div className="rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">Mailbox</th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden md:table-cell w-28">Items</th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3 w-28">Used</th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell w-40">Storage</th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell w-32">Last Active</th>
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
                  : filtered.map((m) => {
                      const pct = m.prohibitSendReceiveQuotaBytes > 0
                        ? (m.storageUsedBytes / m.prohibitSendReceiveQuotaBytes) * 100
                        : 0;
                      return (
                        <tr key={m.userPrincipalName} className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                                <Mail className="w-4 h-4 text-blue-600" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium truncate">{m.displayName}</p>
                                <p className="text-xs text-muted-foreground truncate">{m.userPrincipalName}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell text-muted-foreground tabular-nums w-28">
                            {m.itemCount.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 w-28">
                            {pct >= 90 ? (
                              <Badge variant="destructive" className="gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                {Math.round(pct)}%
                              </Badge>
                            ) : pct >= 70 ? (
                              <Badge variant="warning">{Math.round(pct)}%</Badge>
                            ) : (
                              <span className="text-muted-foreground text-xs tabular-nums">
                                {pct > 0 ? `${Math.round(pct)}%` : "—"}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell w-40">
                            <UsageBar used={m.storageUsedBytes} quota={m.prohibitSendReceiveQuotaBytes} />
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {formatBytes(m.storageUsedBytes)}
                              {m.prohibitSendReceiveQuotaBytes > 0 && ` / ${formatBytes(m.prohibitSendReceiveQuotaBytes)}`}
                            </p>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground text-xs w-32">
                            {m.lastActivityDate ?? "—"}
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>

            {!loading && filtered.length === 0 && (
              <div className="p-12 text-center text-sm text-muted-foreground">
                {search ? "No mailboxes match your search." : "No mailbox data available."}
              </div>
            )}
          </div>
        ) : (
          /* Fallback if Graph reporting API isn't available */
          <div className="rounded-xl border border-dashed p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto">
              <HardDrive className="w-6 h-6 text-blue-500" />
            </div>
            <p className="font-medium">Mailbox report unavailable</p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              The mailbox usage report requires the <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">Reports.Read.All</code> permission.
              Grant it in Entra ID, or manage mailboxes directly in the Exchange Admin Center.
            </p>
            <Button onClick={() => window.open("https://admin.exchange.microsoft.com", "_blank")}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Exchange Admin Center
            </Button>
          </div>
        )}
      </DashboardShell>
    </>
  );
}
