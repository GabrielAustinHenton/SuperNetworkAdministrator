"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  UsersRound,
  MonitorSmartphone,
  ShieldAlert,
  ShieldCheck,
  Mail,
  MessageSquare,
  FolderOpen,
  Cloud,
  Zap,
  Server,
  ClipboardList,
  LayoutDashboard,
  Settings,
  ChevronLeft,
  ChevronRight,
  Network,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  "layout-dashboard": LayoutDashboard,
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
  settings: Settings,
};

export interface NavItem {
  id: string;
  name: string;
  icon: string;
  href: string;
  enabled: boolean;
}

interface SidebarProps {
  navItems: NavItem[];
  orgName: string;
}

export function Sidebar({ navItems, orgName }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const enabledItems = navItems.filter((item) => item.enabled);

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 shrink-0",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo / Org Name */}
      <div className="flex items-center h-16 px-4 border-b border-sidebar-border gap-3 shrink-0">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary shrink-0">
          <Network className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-sidebar-foreground truncate">
              {orgName || "Super Net Admin"}
            </p>
            <p className="text-xs text-sidebar-foreground/50 truncate">Admin Console</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {/* Dashboard always shown */}
        <SidebarItem
          href="/dashboard"
          icon="layout-dashboard"
          label="Dashboard"
          active={pathname === "/dashboard"}
          collapsed={collapsed}
        />

        <div className="my-2 h-px bg-sidebar-border" />

        {enabledItems.map((item) => (
          <SidebarItem
            key={item.id}
            href={item.href}
            icon={item.icon}
            label={item.name}
            active={pathname.startsWith(item.href)}
            collapsed={collapsed}
          />
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-2 border-t border-sidebar-border space-y-1">
        <SidebarItem
          href="/settings"
          icon="settings"
          label="Settings"
          active={pathname === "/settings"}
          collapsed={collapsed}
        />

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors text-sm"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 shrink-0" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 shrink-0" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

function SidebarItem({
  href,
  icon,
  label,
  active,
  collapsed,
}: {
  href: string;
  icon: string;
  label: string;
  active: boolean;
  collapsed: boolean;
}) {
  const Icon = ICON_MAP[icon] ?? LayoutDashboard;

  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
      )}
    >
      <Icon className="w-4 h-4 shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}
