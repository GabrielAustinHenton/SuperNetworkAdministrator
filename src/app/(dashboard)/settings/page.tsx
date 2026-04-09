"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/header";
import { DashboardShell, PageHeader } from "@/components/layout/dashboard-shell";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Users, UsersRound, MonitorSmartphone, ShieldAlert,
  ShieldCheck, Mail, MessageSquare, FolderOpen,
  Cloud, Zap, Server, ClipboardList, LucideIcon,
  CheckCircle2, Loader2, ExternalLink,
} from "lucide-react";
import { MODULES } from "@/lib/modules";
import type { ModuleCategory } from "@/types/modules";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, LucideIcon> = {
  users: Users,
  "users-round": UsersRound,
  "monitor-smartphone": MonitorSmartphone,
  "shield-alert": ShieldAlert,
  "shield-check": ShieldCheck,
  mail: Mail,
  "message-square": MessageSquare,
  "folder-open": FolderOpen,
  cloud: Cloud,
  zap: Zap,
  server: Server,
  "clipboard-list": ClipboardList,
};

const CATEGORY_LABELS: Record<ModuleCategory, string> = {
  identity: "Identity & Access",
  devices: "Endpoint Management",
  security: "Security",
  productivity: "Productivity",
  azure: "Azure",
  automation: "Automation",
};

const CATEGORY_ORDER: ModuleCategory[] = [
  "identity",
  "security",
  "devices",
  "productivity",
  "azure",
  "automation",
];

interface ModuleState {
  moduleId: string;
  enabled: boolean;
}

export default function SettingsPage() {
  const [moduleStates, setModuleStates] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchModules = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings/modules");
      const data = await res.json();
      const stateMap: Record<string, boolean> = {};

      // Start with defaults
      MODULES.forEach((m) => { stateMap[m.id] = m.defaultEnabled; });

      // Override with DB values
      (data.modules as ModuleState[]).forEach((m) => {
        stateMap[m.moduleId] = m.enabled;
      });

      setModuleStates(stateMap);
    } catch {
      setError("Failed to load module settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchModules(); }, [fetchModules]);

  const toggleModule = async (moduleId: string, enabled: boolean) => {
    setSaving(moduleId);
    setError(null);

    // Optimistic update
    setModuleStates((prev) => ({ ...prev, [moduleId]: enabled }));

    try {
      const res = await fetch("/api/settings/modules", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleId, enabled }),
      });
      if (!res.ok) throw new Error("Failed to save");

      setSaved(moduleId);
      setTimeout(() => setSaved(null), 2000);
    } catch {
      // Revert on failure
      setModuleStates((prev) => ({ ...prev, [moduleId]: !enabled }));
      setError("Failed to save setting. Please try again.");
    } finally {
      setSaving(null);
    }
  };

  // Group modules by category
  const modulesByCategory = CATEGORY_ORDER.reduce<Record<string, typeof MODULES>>((acc, cat) => {
    acc[cat] = MODULES.filter((m) => m.category === cat);
    return acc;
  }, {});

  return (
    <>
      <Header title="Settings" />
      <DashboardShell className="max-w-3xl">
        <PageHeader
          title="Settings"
          description="Configure your dashboard, manage module visibility, and customize your admin console"
        />

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Dashboard Modules */}
        <section className="space-y-4">
          <div>
            <h3 className="font-semibold text-base">Dashboard Modules</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Toggle which sections appear in your sidebar and dashboard. Changes take
              effect immediately — no restart required.
            </p>
          </div>

          {CATEGORY_ORDER.map((category) => {
            const mods = modulesByCategory[category];
            if (!mods?.length) return null;

            return (
              <div key={category} className="rounded-xl border overflow-hidden">
                <div className="px-4 py-2.5 bg-muted/30 border-b">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {CATEGORY_LABELS[category]}
                  </p>
                </div>
                <div className="divide-y">
                  {mods.map((mod) => {
                    const Icon = ICON_MAP[mod.icon] ?? Users;
                    const enabled = moduleStates[mod.id] ?? mod.defaultEnabled;
                    const isSaving = saving === mod.id;
                    const wasSaved = saved === mod.id;

                    return (
                      <div
                        key={mod.id}
                        className="flex items-center gap-4 px-4 py-3"
                      >
                        <div
                          className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                            enabled
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          <Icon className="w-4 h-4" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className={cn("text-sm font-medium", !enabled && "text-muted-foreground")}>
                            {mod.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {mod.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {wasSaved && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          )}
                          {isSaving ? (
                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                          ) : (
                            <Switch
                              checked={enabled}
                              onCheckedChange={(v) => toggleModule(mod.id, v)}
                              disabled={loading}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </section>

        <Separator />

        {/* Portal Quick Links */}
        <section className="space-y-4">
          <div>
            <h3 className="font-semibold text-base">Microsoft Admin Portals</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Quick access to the native Microsoft admin portals for features not yet
              integrated into this console.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { name: "Microsoft 365 Admin", url: "https://admin.microsoft.com" },
              { name: "Entra ID (Azure AD)", url: "https://entra.microsoft.com" },
              { name: "Intune / Endpoint", url: "https://intune.microsoft.com" },
              { name: "Exchange Admin", url: "https://admin.exchange.microsoft.com" },
              { name: "Security (Defender)", url: "https://security.microsoft.com" },
              { name: "Azure Portal", url: "https://portal.azure.com" },
              { name: "Power Automate", url: "https://make.powerautomate.com" },
              { name: "SharePoint Admin", url: "https://admin.microsoft.com/sharepoint" },
            ].map((portal) => (
              <button
                key={portal.name}
                onClick={() => window.open(portal.url, "_blank")}
                className="flex items-center justify-between gap-2 px-4 py-3 rounded-lg border text-sm hover:bg-muted/50 transition-colors text-left group"
              >
                <span className="font-medium">{portal.name}</span>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>
            ))}
          </div>
        </section>

        <Separator />

        {/* Danger zone */}
        <section className="space-y-4">
          <div>
            <h3 className="font-semibold text-base text-destructive">Danger Zone</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Irreversible actions. Proceed with care.
            </p>
          </div>
          <div className="rounded-xl border border-destructive/30 p-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Re-run Setup Wizard</p>
              <p className="text-xs text-muted-foreground">
                Reconfigure your tenant ID, services, and environment type.
                This will not delete any data.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-destructive/50 text-destructive hover:bg-destructive/5 shrink-0"
              onClick={async () => {
                if (!confirm("This will reset setup. Continue?")) return;
                await fetch("/api/setup", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ reset: true }),
                }).catch(() => {});
                window.location.href = "/setup";
              }}
            >
              Reset Setup
            </Button>
          </div>
        </section>
      </DashboardShell>
    </>
  );
}
