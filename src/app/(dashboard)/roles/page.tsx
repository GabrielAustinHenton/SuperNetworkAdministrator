import { Header } from "@/components/layout/header";
import { DashboardShell, PageHeader } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ExternalLink } from "lucide-react";

export const metadata = { title: "Admin Roles" };

export default function RolesPage() {
  return (
    <>
      <Header title="Admin Roles" subtitle="Entra ID" />
      <DashboardShell>
        <PageHeader
          title="Admin Roles"
          description="View and manage Entra ID directory roles and privileged access assignments"
        />
        <div className="rounded-xl border border-dashed p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <p className="font-medium">Role Management</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              View active role assignments and manage privileged access in the Entra ID portal.
            </p>
          </div>
          <Button onClick={() => window.open("https://entra.microsoft.com/#view/Microsoft_AAD_IAM/RolesManagementMenuBlade/~/AllRoles", "_blank")}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Open Roles in Entra ID
          </Button>
        </div>
      </DashboardShell>
    </>
  );
}
