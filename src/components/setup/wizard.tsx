"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Network, CheckCircle2, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { SERVICES } from "@/lib/modules";
import type { ServiceId, EnvironmentType } from "@/types/modules";
import {
  Users, MonitorSmartphone, Mail, MessageSquare,
  FolderOpen, Cloud, Zap, Server
} from "lucide-react";

const SERVICE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "layout-grid": Network,
  "monitor-smartphone": MonitorSmartphone,
  mail: Mail,
  "message-square": MessageSquare,
  "folder-open": FolderOpen,
  cloud: Cloud,
  zap: Zap,
  server: Server,
  users: Users,
};

const STEPS = [
  { id: "welcome", label: "Welcome" },
  { id: "tenant", label: "Tenant" },
  { id: "services", label: "Services" },
  { id: "environment", label: "Environment" },
  { id: "complete", label: "Complete" },
];

interface WizardState {
  orgName: string;
  tenantId: string;
  clientId: string;
  enabledServices: ServiceId[];
  environment: EnvironmentType;
}

export function SetupWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<WizardState>({
    orgName: "",
    tenantId: "",
    clientId: "",
    enabledServices: ["m365", "intune", "exchange"],
    environment: "cloud",
  });

  const update = (patch: Partial<WizardState>) =>
    setState((s) => ({ ...s, ...patch }));

  const toggleService = (id: ServiceId) => {
    setState((s) => ({
      ...s,
      enabledServices: s.enabledServices.includes(id)
        ? s.enabledServices.filter((x) => x !== id)
        : [...s.enabledServices, id],
    }));
  };

  const canNext = () => {
    if (step === 1) {
      return state.orgName.trim() && state.tenantId.trim() && state.clientId.trim();
    }
    if (step === 2) return state.enabledServices.length > 0;
    return true;
  };

  const handleComplete = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Setup failed");
      }
      setStep(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Setup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Network className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-xl font-bold">Super Network Administrator</span>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                  i < step
                    ? "bg-primary text-white"
                    : i === step
                    ? "bg-white text-slate-900"
                    : "bg-white/10 text-white/40"
                )}
              >
                {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "w-8 h-px",
                    i < step ? "bg-primary" : "bg-white/20"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Welcome to Super Network Administrator</h2>
              <p className="text-muted-foreground">
                This setup wizard will configure your Microsoft 365 and Azure
                environment. You&apos;ll need:
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {[
                  "An Azure AD / Entra ID App Registration with admin consent",
                  "Your Azure Tenant ID and Client ID",
                  "Global Administrator or equivalent role",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800">
                <strong>Before you begin:</strong> Create an App Registration in{" "}
                <span className="font-mono">entra.microsoft.com</span> and grant
                the Microsoft Graph API permissions listed in{" "}
                <span className="font-mono">.env.example</span>.
              </div>
            </div>
          )}

          {/* Step 1: Tenant Config */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-2xl font-bold">Tenant Configuration</h2>
              <p className="text-muted-foreground text-sm">
                Enter your organization details and Azure AD app registration info.
              </p>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="orgName">Organization Name</Label>
                  <Input
                    id="orgName"
                    placeholder="Contoso Ltd."
                    value={state.orgName}
                    onChange={(e) => update({ orgName: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tenantId">Tenant ID</Label>
                  <Input
                    id="tenantId"
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    value={state.tenantId}
                    onChange={(e) => update({ tenantId: e.target.value })}
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Found in Entra ID &gt; Overview &gt; Directory (tenant) ID
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="clientId">Application (Client) ID</Label>
                  <Input
                    id="clientId"
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    value={state.clientId}
                    onChange={(e) => update({ clientId: e.target.value })}
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Found in your App Registration &gt; Overview
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Services */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-2xl font-bold">Select Your Services</h2>
              <p className="text-muted-foreground text-sm">
                Choose which Microsoft services your organization uses. This
                customizes your dashboard. You can change this later in Settings.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SERVICES.map((service) => {
                  const Icon = SERVICE_ICONS[service.icon] ?? Network;
                  const enabled = state.enabledServices.includes(service.id);
                  return (
                    <button
                      key={service.id}
                      onClick={() => toggleService(service.id)}
                      className={cn(
                        "flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all",
                        enabled
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground/30"
                      )}
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                          enabled ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                        )}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{service.name}</p>
                        <p className="text-xs text-muted-foreground leading-snug">
                          {service.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Environment */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-2xl font-bold">Environment Type</h2>
              <p className="text-muted-foreground text-sm">
                Select how your Active Directory is deployed.
              </p>
              <div className="space-y-3">
                {[
                  {
                    id: "cloud" as EnvironmentType,
                    label: "Cloud Only",
                    desc: "All users and devices are managed exclusively in Entra ID / Microsoft 365. No on-premises AD.",
                  },
                  {
                    id: "hybrid" as EnvironmentType,
                    label: "Hybrid (Recommended for most orgs)",
                    desc: "On-premises AD synced to Entra ID via Azure AD Connect. Users exist in both places.",
                  },
                  {
                    id: "onprem" as EnvironmentType,
                    label: "On-Premises Only",
                    desc: "Primary identity is on-premises Active Directory with limited or no Entra ID integration.",
                  },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => update({ environment: opt.id })}
                    className={cn(
                      "w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all",
                      state.environment === opt.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground/30"
                    )}
                  >
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5",
                        state.environment === opt.id
                          ? "border-primary"
                          : "border-muted-foreground/40"
                      )}
                    >
                      {state.environment === opt.id && (
                        <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{opt.label}</p>
                      <p className="text-xs text-muted-foreground">{opt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
              {error && (
                <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-sm text-red-700">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Complete */}
          {step === 4 && (
            <div className="space-y-5 text-center">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold">You&apos;re all set!</h2>
              <p className="text-muted-foreground">
                Your organization has been configured. Sign in with your Azure AD
                account to start managing your Microsoft environment.
              </p>
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 text-sm text-amber-800 text-left">
                <strong>Next step:</strong> Make sure your{" "}
                <span className="font-mono">.env.local</span> file has{" "}
                <span className="font-mono">AZURE_AD_CLIENT_ID</span>,{" "}
                <span className="font-mono">AZURE_AD_CLIENT_SECRET</span>, and{" "}
                <span className="font-mono">AZURE_AD_TENANT_ID</span> set, then
                restart the server.
              </div>
              <Button
                className="w-full"
                onClick={() => router.push("/login")}
              >
                Go to Sign In
              </Button>
            </div>
          )}

          {/* Navigation */}
          {step < 4 && (
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="ghost"
                onClick={() => setStep((s) => s - 1)}
                disabled={step === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              {step < 3 ? (
                <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext()}>
                  Continue
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={handleComplete} disabled={loading}>
                  {loading ? "Saving…" : "Complete Setup"}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
