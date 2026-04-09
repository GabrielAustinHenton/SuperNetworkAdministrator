import Link from "next/link";
import {
  Users, UsersRound, MonitorSmartphone, ShieldAlert,
  ShieldCheck, Mail, MessageSquare, FolderOpen,
  Cloud, Zap, Server, ClipboardList, ArrowRight, LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrgModuleState } from "@/types/modules";

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

const CATEGORY_COLORS: Record<string, string> = {
  identity: "bg-blue-50 text-blue-600",
  devices: "bg-violet-50 text-violet-600",
  security: "bg-red-50 text-red-600",
  productivity: "bg-emerald-50 text-emerald-600",
  azure: "bg-sky-50 text-sky-600",
  automation: "bg-amber-50 text-amber-600",
};

interface ModuleCardProps {
  module: OrgModuleState;
}

export function ModuleCard({ module }: ModuleCardProps) {
  const Icon = ICON_MAP[module.icon] ?? Users;
  const colorClass = CATEGORY_COLORS[module.category] ?? "bg-muted text-muted-foreground";

  return (
    <Link
      href={module.href}
      className="group flex flex-col rounded-xl border bg-card p-5 hover:shadow-md transition-all hover:border-primary/30"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", colorClass)}>
          <Icon className="w-5 h-5" />
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
      </div>
      <p className="font-semibold text-sm">{module.name}</p>
      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{module.description}</p>
    </Link>
  );
}

interface ModuleGridProps {
  modules: OrgModuleState[];
  className?: string;
}

export function ModuleGrid({ modules, className }: ModuleGridProps) {
  const enabled = modules.filter((m) => m.enabled);

  if (enabled.length === 0) {
    return (
      <div className={cn("rounded-xl border border-dashed p-12 text-center", className)}>
        <p className="text-muted-foreground text-sm">
          No modules enabled. Visit{" "}
          <Link href="/settings" className="text-primary underline underline-offset-2">
            Settings
          </Link>{" "}
          to enable dashboard modules.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4", className)}>
      {enabled.map((mod) => (
        <ModuleCard key={mod.id} module={mod} />
      ))}
    </div>
  );
}
