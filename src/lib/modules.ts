import type { ModuleDefinition, ServiceDefinition } from "@/types/modules";

// ─── Available Services ─────────────────────────────────────────────────────

export const SERVICES: ServiceDefinition[] = [
  {
    id: "m365",
    name: "Microsoft 365",
    description: "Users, groups, licenses, and identity management via Entra ID",
    icon: "layout-grid",
    defaultEnabled: true,
  },
  {
    id: "intune",
    name: "Microsoft Intune",
    description: "Endpoint management, device compliance, and app deployment",
    icon: "monitor-smartphone",
    defaultEnabled: true,
  },
  {
    id: "exchange",
    name: "Exchange Online",
    description: "Mailbox management, mail flow rules, and email administration",
    icon: "mail",
    defaultEnabled: true,
  },
  {
    id: "teams",
    name: "Microsoft Teams",
    description: "Teams administration, channels, and meeting policies",
    icon: "message-square",
    defaultEnabled: false,
  },
  {
    id: "sharepoint",
    name: "SharePoint Online",
    description: "Sites, document libraries, and sharing settings",
    icon: "folder-open",
    defaultEnabled: false,
  },
  {
    id: "azure",
    name: "Azure",
    description: "Azure subscriptions, resources, and cost management",
    icon: "cloud",
    defaultEnabled: false,
  },
  {
    id: "power-automate",
    name: "Power Automate",
    description: "Automation flows and connectors",
    icon: "zap",
    defaultEnabled: false,
  },
  {
    id: "local-ad",
    name: "On-Premises Active Directory",
    description: "Hybrid AD Connect sync status and on-prem objects",
    icon: "server",
    defaultEnabled: false,
  },
];

// ─── Module Registry ────────────────────────────────────────────────────────
// Each module maps to a dashboard panel and sidebar nav item.
// requiredServices controls which setup wizard services activate a module.

export const MODULES: ModuleDefinition[] = [
  // Identity / Entra
  {
    id: "entra-users",
    name: "Users",
    description: "Create, edit, disable, and manage Entra ID user accounts",
    icon: "users",
    category: "identity",
    requiredScopes: ["User.ReadWrite.All", "Directory.Read.All"],
    requiredServices: ["m365"],
    defaultEnabled: true,
    href: "/users",
  },
  {
    id: "entra-groups",
    name: "Groups",
    description: "Manage Microsoft 365 groups, security groups, and dynamic groups",
    icon: "users-round",
    category: "identity",
    requiredScopes: ["Group.ReadWrite.All"],
    requiredServices: ["m365"],
    defaultEnabled: true,
    href: "/groups",
  },
  {
    id: "entra-roles",
    name: "Admin Roles",
    description: "View and assign Entra ID directory roles and privileged access",
    icon: "shield-check",
    category: "identity",
    requiredScopes: ["RoleManagement.Read.All"],
    requiredServices: ["m365"],
    defaultEnabled: true,
    href: "/roles",
  },
  // Devices / Intune
  {
    id: "intune-devices",
    name: "Devices",
    description: "View enrolled devices, compliance status, and take remote actions",
    icon: "monitor-smartphone",
    category: "devices",
    requiredScopes: ["DeviceManagementManagedDevices.ReadWrite.All"],
    requiredServices: ["intune"],
    defaultEnabled: true,
    href: "/devices",
  },
  // Security
  {
    id: "security-alerts",
    name: "Security Alerts",
    description: "Microsoft Defender alerts, risky users, and sign-in anomalies",
    icon: "shield-alert",
    category: "security",
    requiredScopes: ["SecurityEvents.Read.All", "AuditLog.Read.All"],
    requiredServices: ["m365"],
    defaultEnabled: true,
    href: "/security",
  },
  // Exchange
  {
    id: "exchange-mailboxes",
    name: "Exchange / Mail",
    description: "Mailbox management, shared mailboxes, and mail flow",
    icon: "mail",
    category: "productivity",
    requiredScopes: ["Mail.ReadBasic.All"],
    requiredServices: ["exchange"],
    defaultEnabled: true,
    href: "/exchange",
  },
  // Teams
  {
    id: "teams-admin",
    name: "Teams",
    description: "Manage Teams, channels, and meeting policies",
    icon: "message-square",
    category: "productivity",
    requiredScopes: ["Team.ReadBasic.All"],
    requiredServices: ["teams"],
    defaultEnabled: false,
    href: "/teams",
  },
  // SharePoint
  {
    id: "sharepoint-sites",
    name: "SharePoint",
    description: "Manage SharePoint sites and document libraries",
    icon: "folder-open",
    category: "productivity",
    requiredScopes: ["Sites.Read.All"],
    requiredServices: ["sharepoint"],
    defaultEnabled: false,
    href: "/sharepoint",
  },
  // Azure
  {
    id: "azure-resources",
    name: "Azure Resources",
    description: "View Azure subscriptions, resource groups, and costs",
    icon: "cloud",
    category: "azure",
    requiredScopes: [],
    requiredServices: ["azure"],
    defaultEnabled: false,
    href: "/azure",
  },
  // Power Automate
  {
    id: "power-automate-flows",
    name: "Power Automate",
    description: "View and manage automation flows across the organization",
    icon: "zap",
    category: "automation",
    requiredScopes: [],
    requiredServices: ["power-automate"],
    defaultEnabled: false,
    href: "/flows",
  },
  // Hybrid AD
  {
    id: "hybrid-ad-sync",
    name: "AD Connect Sync",
    description: "Monitor on-premises AD sync status and hybrid objects",
    icon: "server",
    category: "identity",
    requiredScopes: ["Directory.Read.All"],
    requiredServices: ["local-ad"],
    defaultEnabled: false,
    href: "/ad-sync",
  },
  // Audit
  {
    id: "audit-log",
    name: "Audit Log",
    description: "Complete record of all admin actions performed in this app",
    icon: "clipboard-list",
    category: "security",
    requiredScopes: [],
    requiredServices: ["m365"],
    defaultEnabled: true,
    href: "/audit",
  },
];

export function getModuleById(id: string): ModuleDefinition | undefined {
  return MODULES.find((m) => m.id === id);
}

export function getModulesForServices(serviceIds: string[]): ModuleDefinition[] {
  return MODULES.filter((m) =>
    m.requiredServices.some((s) => serviceIds.includes(s))
  );
}

export function getServiceById(id: string): ServiceDefinition | undefined {
  return SERVICES.find((s) => s.id === id);
}
