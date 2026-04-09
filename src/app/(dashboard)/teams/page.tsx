import { Header } from "@/components/layout/header";
import { DashboardShell, PageHeader } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { MessageSquare, ExternalLink } from "lucide-react";

export const metadata = { title: "Teams" };

export default function TeamsPage() {
  return (
    <>
      <Header title="Teams" subtitle="Microsoft Teams" />
      <DashboardShell>
        <PageHeader title="Teams Administration" description="Manage Teams, channels, and meeting policies" />
        <div className="rounded-xl border border-dashed p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-violet-50 flex items-center justify-center mx-auto">
            <MessageSquare className="w-6 h-6 text-violet-500" />
          </div>
          <div>
            <p className="font-medium">Microsoft Teams Admin Center</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              Manage Teams policies, meetings, apps, and telephony from the Teams Admin Center.
            </p>
          </div>
          <Button onClick={() => window.open("https://admin.teams.microsoft.com", "_blank")}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Open Teams Admin Center
          </Button>
        </div>
      </DashboardShell>
    </>
  );
}
