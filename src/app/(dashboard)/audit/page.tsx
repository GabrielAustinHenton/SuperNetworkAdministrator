"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/header";
import { DashboardShell, PageHeader } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

interface AuditEntry {
  id: string;
  action: string;
  targetType: string;
  targetId: string | null;
  targetName: string | null;
  performedBy: string;
  details: string | null;
  success: boolean;
  errorMessage: string | null;
  createdAt: string;
}

const ACTION_LABELS: Record<string, string> = {
  "user.create": "Created user",
  "user.enable": "Enabled user",
  "user.disable": "Disabled user",
  "user.delete": "Deleted user",
  "user.revokeSignInSessions": "Revoked sign-in sessions",
};

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/audit?limit=100");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setLogs(data.logs);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  return (
    <>
      <Header title="Audit Log" />
      <DashboardShell>
        <PageHeader
          title="Audit Log"
          description="Complete record of all admin actions performed in this console"
          actions={
            <Button variant="outline" size="sm" onClick={fetchLogs}>
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          }
        />

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left font-medium text-muted-foreground px-4 py-3 w-36">Time</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-3">Action</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Target</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Performed By</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-3 w-20">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading
                ? [...Array(8)].map((_, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3" colSpan={5}>
                        <div className="h-6 bg-muted/50 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                : logs.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {formatDateTime(log.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium">
                          {ACTION_LABELS[log.action] ?? log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                        {log.targetName ?? log.targetId ?? "—"}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs">
                        {log.performedBy}
                      </td>
                      <td className="px-4 py-3">
                        {log.success ? (
                          <div className="flex items-center gap-1 text-emerald-600">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span className="text-xs">OK</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-red-500">
                            <XCircle className="w-3.5 h-3.5" />
                            <span className="text-xs">Failed</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>

          {!loading && logs.length === 0 && (
            <div className="p-12 text-center text-sm text-muted-foreground">
              No audit entries yet. Actions you take in this console will appear here.
            </div>
          )}
        </div>

        {total > logs.length && (
          <p className="text-center text-sm text-muted-foreground">
            Showing {logs.length} of {total} entries.
          </p>
        )}
      </DashboardShell>
    </>
  );
}
