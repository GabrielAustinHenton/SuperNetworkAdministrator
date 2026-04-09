import { Header } from "@/components/layout/header";
import { DashboardShell, PageHeader } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Zap, ExternalLink } from "lucide-react";

export const metadata = { title: "Power Automate" };

export default function FlowsPage() {
  return (
    <>
      <Header title="Power Automate" />
      <DashboardShell>
        <PageHeader title="Power Automate" description="Manage automation flows across your organization" />
        <div className="rounded-xl border border-dashed p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto">
            <Zap className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <p className="font-medium">Power Automate Admin Center</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              View and manage flows, connectors, and environments for your organization.
            </p>
          </div>
          <Button onClick={() => window.open("https://make.powerautomate.com", "_blank")}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Open Power Automate
          </Button>
        </div>
      </DashboardShell>
    </>
  );
}
