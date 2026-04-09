import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";
import { Sidebar, type NavItem } from "@/components/layout/sidebar";
import { MODULES } from "@/lib/modules";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // Load org + enabled modules
  const org = await db.organization.findFirst({
    include: { modules: true },
  });

  if (!org?.setupComplete) redirect("/setup");

  // Merge DB module states with the static module definitions
  const navItems: NavItem[] = MODULES.map((mod) => {
    const dbState = org.modules.find((m) => m.moduleId === mod.id);
    return {
      id: mod.id,
      name: mod.name,
      icon: mod.icon,
      href: mod.href,
      enabled: dbState?.enabled ?? mod.defaultEnabled,
    };
  });

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar navItems={navItems} orgName={org.name} />
      <div className="flex flex-col flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
