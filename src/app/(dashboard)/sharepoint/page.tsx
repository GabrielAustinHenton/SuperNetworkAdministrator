import { Header } from "@/components/layout/header";
import { DashboardShell, PageHeader } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { FolderOpen, ExternalLink } from "lucide-react";

export const metadata = { title: "SharePoint" };

export default function SharePointPage() {
  return (
    <>
      <Header title="SharePoint" subtitle="SharePoint Online" />
      <DashboardShell>
        <PageHeader title="SharePoint Administration" description="Manage sites, document libraries, and sharing settings" />
        <div className="rounded-xl border border-dashed p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
            <FolderOpen className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <p className="font-medium">SharePoint Admin Center</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              Manage site collections, external sharing policies, and storage quotas.
            </p>
          </div>
          <Button onClick={() => window.open("https://admin.microsoft.com/sharepoint", "_blank")}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Open SharePoint Admin Center
          </Button>
        </div>
      </DashboardShell>
    </>
  );
}
