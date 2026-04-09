import { Header } from "@/components/layout/header";
import { DashboardShell, PageHeader } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Server, ExternalLink } from "lucide-react";

export const metadata = { title: "AD Connect Sync" };

export default function AdSyncPage() {
  return (
    <>
      <Header title="AD Connect Sync" subtitle="Hybrid Identity" />
      <DashboardShell>
        <PageHeader
          title="Azure AD Connect Sync"
          description="Monitor hybrid identity sync status between on-premises Active Directory and Entra ID"
        />
        <div className="rounded-xl border border-dashed p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto">
            <Server className="w-6 h-6 text-slate-500" />
          </div>
          <div>
            <p className="font-medium">Hybrid Identity Status</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              View AD Connect sync status in Entra ID. For on-premises-only operations,
              use the Active Directory Administrative Center on your domain controller.
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => window.open("https://entra.microsoft.com/#view/Microsoft_AAD_Connect_Provisioning/ConnectMenuBlade/~/ConnectOverview", "_blank")}>
              <ExternalLink className="w-4 h-4 mr-2" />
              View Sync Status in Entra
            </Button>
          </div>
        </div>
      </DashboardShell>
    </>
  );
}
