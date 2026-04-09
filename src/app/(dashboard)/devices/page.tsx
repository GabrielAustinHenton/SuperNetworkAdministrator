"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/header";
import { DashboardShell, PageHeader } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, RefreshCw, Monitor, Smartphone, Laptop } from "lucide-react";
import { formatRelativeTime, formatDate } from "@/lib/utils";
import type { GraphDevice } from "@/types/graph";

function DeviceIcon({ os }: { os?: string }) {
  const lower = os?.toLowerCase() ?? "";
  if (lower.includes("ios") || lower.includes("android")) {
    return <Smartphone className="w-4 h-4" />;
  }
  if (lower.includes("windows") || lower.includes("mac")) {
    return <Laptop className="w-4 h-4" />;
  }
  return <Monitor className="w-4 h-4" />;
}

export default function DevicesPage() {
  const [devices, setDevices] = useState<GraphDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchDevices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/graph/devices");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDevices(data.devices);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load devices");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDevices(); }, [fetchDevices]);

  const filtered = devices.filter((d) =>
    d.displayName.toLowerCase().includes(search.toLowerCase()) ||
    (d.operatingSystem ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const compliant = devices.filter((d) => d.isCompliant).length;
  const nonCompliant = devices.filter((d) => d.isCompliant === false).length;

  return (
    <>
      <Header title="Devices" subtitle="Intune / Entra ID" />
      <DashboardShell>
        <PageHeader
          title="Device Management"
          description="Enrolled devices, compliance status, and enrollment info from Intune and Entra ID"
        />

        {/* Summary tiles */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total", value: devices.length, color: "bg-blue-50 text-blue-700" },
            { label: "Compliant", value: compliant, color: "bg-emerald-50 text-emerald-700" },
            { label: "Non-Compliant", value: nonCompliant, color: "bg-red-50 text-red-700" },
          ].map((t) => (
            <div key={t.label} className={`rounded-xl border p-4 ${t.color}`}>
              <p className="text-2xl font-bold">{loading ? "—" : t.value}</p>
              <p className="text-sm mt-0.5">{t.label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search devices, OS…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" onClick={fetchDevices}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground ml-auto">
            {filtered.length} of {devices.length} devices
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
                <th className="text-left font-medium text-muted-foreground px-4 py-3">Device</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">OS</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Trust</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Registered</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-3">Compliance</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading
                ? [...Array(6)].map((_, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3" colSpan={5}>
                        <div className="h-8 bg-muted/50 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                : filtered.map((device) => (
                    <tr key={device.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                            <DeviceIcon os={device.operatingSystem} />
                          </div>
                          <div>
                            <p className="font-medium">{device.displayName}</p>
                            <p className="text-xs text-muted-foreground">
                              {device.deviceId.slice(0, 16)}…
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                        {device.operatingSystem ?? "—"}{" "}
                        {device.operatingSystemVersion && (
                          <span className="text-xs">({device.operatingSystemVersion})</span>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <Badge variant="outline">{device.trustType ?? "—"}</Badge>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs">
                        {formatDate(device.registeredDateTime)}
                      </td>
                      <td className="px-4 py-3">
                        {device.isCompliant === true && (
                          <Badge variant="success">Compliant</Badge>
                        )}
                        {device.isCompliant === false && (
                          <Badge variant="destructive">Non-Compliant</Badge>
                        )}
                        {device.isCompliant == null && (
                          <Badge variant="muted">Unknown</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
          {!loading && filtered.length === 0 && (
            <div className="p-12 text-center text-sm text-muted-foreground">
              {search ? "No devices match your search." : "No devices found. Ensure Intune is set up and devices are enrolled."}
            </div>
          )}
        </div>
      </DashboardShell>
    </>
  );
}
