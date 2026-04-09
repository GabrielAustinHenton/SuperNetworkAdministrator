import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";
import { getDashboardStats } from "@/lib/graph";
import { Header } from "@/components/layout/header";
import { DashboardShell, PageHeader } from "@/components/layout/dashboard-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { ModuleGrid } from "@/components/dashboard/module-card";
import { MODULES } from "@/lib/modules";
import type { OrgModuleState } from "@/types/modules";
import { Users, MonitorSmartphone, UsersRound, ShieldAlert } from "lucide-react";

export const metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

async function Stats({ accessToken }: { accessToken: string }) {
  const stats = await getDashboardStats(accessToken).catch(() => null);

  if (!stats) {
    return (
      <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
        Could not load stats — check your Microsoft Graph permissions.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard label="Total Users" value={stats.totalUsers} icon={Users} color="blue" />
      <StatCard
        label="Active Users"
        value={stats.activeUsers}
        icon={Users}
        color="green"
        trend={
          stats.disabledUsers > 0
            ? { value: `${stats.disabledUsers} disabled`, positive: false }
            : undefined
        }
      />
      <StatCard
        label="Total Devices"
        value={stats.totalDevices}
        icon={MonitorSmartphone}
        color="purple"
        trend={
          stats.nonCompliantDevices > 0
            ? {
                value: `${stats.nonCompliantDevices} non-compliant`,
                positive: false,
              }
            : { value: "All compliant", positive: true }
        }
      />
      <StatCard label="Groups" value={stats.totalGroups} icon={UsersRound} color="amber" />
    </div>
  );
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const org = await db.organization.findFirst({ include: { modules: true } });

  const modules: OrgModuleState[] = MODULES.map((mod) => {
    const dbState = org?.modules.find((m) => m.moduleId === mod.id);
    return {
      ...mod,
      enabled: dbState?.enabled ?? mod.defaultEnabled,
      position: dbState?.position ?? 0,
    };
  }).sort((a, b) => a.position - b.position);

  return (
    <>
      <Header title="Dashboard" subtitle={`Welcome back, ${session?.user?.name?.split(" ")[0] ?? "Admin"}`} />
      <DashboardShell>
        <PageHeader
          title="Overview"
          description="Your Microsoft environment at a glance"
        />

        {session?.accessToken && (
          <Suspense
            fallback={
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="rounded-xl border bg-card p-5 h-24 animate-pulse" />
                ))}
              </div>
            }
          >
            <Stats accessToken={session.accessToken} />
          </Suspense>
        )}

        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Management Modules
          </h3>
          <ModuleGrid modules={modules} />
        </div>

        {!session?.accessToken && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <strong>Session warning:</strong> Your Microsoft token may have expired.{" "}
            <a href="/api/auth/signout" className="underline">
              Sign out and sign back in
            </a>{" "}
            to restore full access.
          </div>
        )}
      </DashboardShell>
    </>
  );
}
