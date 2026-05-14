"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/header";
import { DashboardShell, PageHeader } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  RefreshCw, ShieldAlert, ShieldCheck, ChevronRight,
  Clock, CheckCircle2, XCircle, Loader2, User, Monitor,
  Wifi, Globe,
} from "lucide-react";
import { formatRelativeTime, formatDateTime } from "@/lib/utils";
import type { GraphSecurityAlert } from "@/types/graph";

const SEVERITY_VARIANT: Record<string, "destructive" | "warning" | "info" | "muted" | "secondary"> = {
  high: "destructive",
  medium: "warning",
  low: "info",
  informational: "muted",
  unknown: "secondary",
};

const STATUS_LABELS: Record<string, string> = {
  newAlert: "New",
  inProgress: "In Progress",
  resolved: "Resolved",
  unknown: "Unknown",
};

export default function SecurityPage() {
  const [alerts, setAlerts] = useState<GraphSecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [selected, setSelected] = useState<GraphSecurityAlert | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

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

  const handleStatusChange = async (alertId: string, status: string) => {
    setActionLoading(status);
    setActionError(null);
    try {
      const res = await fetch(`/api/graph/security/${alertId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Update local state
      setAlerts((prev) =>
        prev.map((a) => a.id === alertId ? { ...a, status: status as GraphSecurityAlert["status"] } : a)
      );
      if (selected?.id === alertId) {
        setSelected((prev) => prev ? { ...prev, status: status as GraphSecurityAlert["status"] } : null);
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to update alert");
    } finally {
      setActionLoading(null);
    }
  };

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
          {[
            { id: "all", label: "All Alerts" },
            { id: "high", label: "High" },
            { id: "medium", label: "Medium" },
            { id: "low", label: "Low" },
            { id: "inProgress", label: "In Progress" },
            { id: "resolved", label: "Resolved" },
          ].map((f) => (
            <Button
              key={f.id}
              variant={filter === f.id ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </Button>
          ))}
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-2">
          {loading
            ? [...Array(5)].map((_, i) => (
                <div key={i} className="rounded-xl border p-4 h-20 animate-pulse bg-muted/30" />
              ))
            : filtered.length === 0
            ? (
                <div className="rounded-xl border border-dashed p-12 text-center text-sm text-muted-foreground">
                  {alerts.length === 0
                    ? "No security alerts. Your tenant is looking clean!"
                    : "No alerts match the current filter."}
                </div>
              )
            : filtered.map((alert) => (
                <button
                  key={alert.id}
                  onClick={() => setSelected(alert)}
                  className="w-full rounded-xl border bg-card p-4 text-left hover:border-primary/40 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={SEVERITY_VARIANT[alert.severity] ?? "secondary"} className="capitalize">
                          {alert.severity}
                        </Badge>
                        <Badge variant="outline">
                          {STATUS_LABELS[alert.status] ?? alert.status}
                        </Badge>
                        {alert.category && (
                          <Badge variant="muted">{alert.category}</Badge>
                        )}
                      </div>
                      <p className="font-semibold mt-2 text-sm">{alert.title}</p>
                      {alert.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {alert.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <p className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatRelativeTime(alert.createdDateTime)}
                      </p>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </button>
              ))
          }
        </div>
      </DashboardShell>

      {/* Alert Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <Badge variant={SEVERITY_VARIANT[selected.severity] ?? "secondary"} className="capitalize">
                    {selected.severity}
                  </Badge>
                  <Badge variant="outline">
                    {STATUS_LABELS[selected.status] ?? selected.status}
                  </Badge>
                  {selected.category && (
                    <Badge variant="muted">{selected.category}</Badge>
                  )}
                </div>
                <DialogTitle className="text-left">{selected.title}</DialogTitle>
                <DialogDescription className="text-left">
                  Detected {formatRelativeTime(selected.createdDateTime)}
                  {selected.createdDateTime && ` — ${formatDateTime(selected.createdDateTime)}`}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                {/* Description */}
                {selected.description && (
                  <div>
                    <p className="text-sm font-medium mb-1">Description</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {selected.description}
                    </p>
                  </div>
                )}

                <Separator />

                {/* Affected machines — shown first, most useful */}
                {selected.hostStates && selected.hostStates.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Affected Machines</p>
                    <div className="space-y-2">
                      {selected.hostStates.map((h, i) => (
                        <div key={i} className="rounded-lg border bg-muted/30 p-3 text-sm space-y-1">
                          <div className="flex items-center gap-2 font-medium">
                            <Monitor className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            {h.netBiosName || h.fqdn || "Unknown device"}
                          </div>
                          {h.fqdn && h.netBiosName && (
                            <p className="text-xs text-muted-foreground pl-5">{h.fqdn}</p>
                          )}
                          {h.os && (
                            <p className="text-xs text-muted-foreground pl-5">OS: {h.os}</p>
                          )}
                          <div className="flex items-center gap-4 pl-5">
                            {h.privateIpAddress && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Wifi className="w-3 h-3" /> {h.privateIpAddress}
                              </span>
                            )}
                            {h.publicIpAddress && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Globe className="w-3 h-3" /> {h.publicIpAddress}
                              </span>
                            )}
                            {h.isAzureAdJoined && (
                              <span className="text-xs text-blue-600">Entra Joined</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Affected users */}
                {selected.userStates && selected.userStates.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Affected Users</p>
                    <div className="space-y-1">
                      {selected.userStates.map((u, i) => (
                        <div key={i} className="rounded-lg border bg-muted/30 p-3 text-sm space-y-1">
                          <div className="flex items-center gap-2 font-medium">
                            <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            {u.userPrincipalName || u.accountName}
                          </div>
                          {u.domainName && (
                            <p className="text-xs text-muted-foreground pl-5">Domain: {u.domainName}</p>
                          )}
                          {u.logonIp && (
                            <p className="text-xs text-muted-foreground pl-5">Logon IP: {u.logonIp}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Network connections */}
                {selected.networkConnections && selected.networkConnections.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Network Connections</p>
                    <div className="space-y-1">
                      {selected.networkConnections.slice(0, 5).map((n, i) => (
                        <div key={i} className="text-xs text-muted-foreground font-mono bg-muted/30 rounded px-3 py-2">
                          {n.sourceAddress && <span>{n.sourceAddress} → </span>}
                          {n.destinationAddress}
                          {n.destinationPort && <span>:{n.destinationPort}</span>}
                          {n.protocol && <span className="ml-2 text-muted-foreground/60">({n.protocol})</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Provider */}
                {selected.vendorInformation && (
                  <div>
                    <p className="text-sm font-medium mb-1">Detection Source</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Monitor className="w-3.5 h-3.5 shrink-0" />
                      {selected.vendorInformation.provider} — {selected.vendorInformation.vendor}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Actions */}
                <div>
                  <p className="text-sm font-medium mb-3">Update Status</p>
                  {actionError && (
                    <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-700 mb-3">
                      {actionError}
                    </div>
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={selected.status === "inProgress" || !!actionLoading}
                      onClick={() => handleStatusChange(selected.id, "inProgress")}
                    >
                      {actionLoading === "inProgress"
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                        : <Clock className="w-3.5 h-3.5 mr-1" />}
                      Mark In Progress
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={selected.status === "resolved" || !!actionLoading}
                      className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      onClick={() => handleStatusChange(selected.id, "resolved")}
                    >
                      {actionLoading === "resolved"
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                        : <CheckCircle2 className="w-3.5 h-3.5 mr-1" />}
                      Resolve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={selected.status === "newAlert" || !!actionLoading}
                      className="border-muted text-muted-foreground hover:bg-muted/50"
                      onClick={() => handleStatusChange(selected.id, "newAlert")}
                    >
                      {actionLoading === "newAlert"
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                        : <XCircle className="w-3.5 h-3.5 mr-1" />}
                      Reopen
                    </Button>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="ghost" onClick={() => setSelected(null)}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
