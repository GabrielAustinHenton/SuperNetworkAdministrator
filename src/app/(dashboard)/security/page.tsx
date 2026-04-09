"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/header";
import { DashboardShell, PageHeader } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, ShieldAlert, ShieldCheck } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import type { GraphSecurityAlert } from "@/types/graph";

const SEVERITY_VARIANT: Record<string, "destructive" | "warning" | "info" | "muted" | "secondary"> = {
  high: "destructive",
  medium: "warning",
  low: "info",
  informational: "muted",
  unknown: "secondary",
};

export default function SecurityPage() {
  const [alerts, setAlerts] = useState<GraphSecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/graph/security");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAlerts(data.alerts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load alerts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  const filtered = filter === "all"
    ? alerts
    : alerts.filter((a) => a.severity === filter || a.status === filter);

  const high = alerts.filter((a) => a.severity === "high").length;
  const medium = alerts.filter((a) => a.severity === "medium").length;
  const active = alerts.filter((a) => a.status !== "resolved").length;

  return (
    <>
      <Header title="Security" subtitle="Microsoft Defender" />
      <DashboardShell>
        <PageHeader
          title="Security Alerts"
          description="Active Microsoft Defender and Entra ID security alerts for your tenant"
          actions={
            <Button variant="outline" size="sm" onClick={fetchAlerts}>
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          }
        />

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "High Severity", value: high, color: "bg-red-50 text-red-700", icon: ShieldAlert },
            { label: "Medium Severity", value: medium, color: "bg-amber-50 text-amber-700", icon: ShieldAlert },
            { label: "Active Alerts", value: active, color: "bg-blue-50 text-blue-700", icon: ShieldCheck },
          ].map((t) => (
            <div key={t.label} className={`rounded-xl border p-4 flex items-start gap-3 ${t.color}`}>
              <t.icon className="w-5 h-5 mt-0.5 shrink-0" />
              <div>
                <p className="text-2xl font-bold">{loading ? "—" : t.value}</p>
                <p className="text-sm">{t.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {["all", "high", "medium", "low", "inProgress", "resolved"].map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
              className="capitalize"
            >
              {f === "all" ? "All Alerts" : f}
            </Button>
          ))}
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
            {error.includes("permission") && (
              <p className="mt-1 font-medium">
                Ensure SecurityEvents.Read.All is granted in your App Registration.
              </p>
            )}
          </div>
        )}

        <div className="space-y-3">
          {loading
            ? [...Array(5)].map((_, i) => (
                <div key={i} className="rounded-xl border p-4 h-20 animate-pulse bg-muted/30" />
              ))
            : filtered.length === 0
            ? (
                <div className="rounded-xl border border-dashed p-12 text-center text-sm text-muted-foreground">
                  {loading ? "Loading…" : alerts.length === 0
                    ? "No security alerts. Your tenant is looking clean!"
                    : "No alerts match the current filter."}
                </div>
              )
            : filtered.map((alert) => (
                <div key={alert.id} className="rounded-xl border bg-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={SEVERITY_VARIANT[alert.severity] ?? "secondary"} className="capitalize">
                          {alert.severity}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {alert.status}
                        </Badge>
                        {alert.category && (
                          <Badge variant="muted">{alert.category}</Badge>
                        )}
                      </div>
                      <p className="font-semibold mt-2 text-sm">{alert.title}</p>
                      {alert.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {alert.description}
                        </p>
                      )}
                      {alert.userStates && alert.userStates.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Affected: {alert.userStates.map((u) => u.userPrincipalName).join(", ")}
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                      {formatRelativeTime(alert.createdDateTime)}
                    </p>
                  </div>
                </div>
              ))
          }
        </div>
      </DashboardShell>
    </>
  );
}
