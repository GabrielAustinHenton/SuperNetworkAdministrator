import { Header } from "@/components/layout/header";
import { DashboardShell, PageHeader } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Cloud, ExternalLink } from "lucide-react";

export const metadata = { title: "Azure" };

const AZURE_PORTALS = [
  { name: "Azure Portal", url: "https://portal.azure.com", desc: "Full Azure resource management" },
  { name: "Cost Management", url: "https://portal.azure.com/#view/Microsoft_Azure_CostManagement", desc: "Budgets, cost analysis, and billing" },
  { name: "Virtual Machines", url: "https://portal.azure.com/#view/HubsExtension/BrowseResource/resourceType/Microsoft.Compute%2FvirtualMachines", desc: "Manage VMs and scale sets" },
  { name: "App Services", url: "https://portal.azure.com/#view/HubsExtension/BrowseResource/resourceType/Microsoft.Web%2Fsites", desc: "Web apps and API apps" },
];

export default function AzurePage() {
  return (
    <>
      <Header title="Azure" subtitle="Azure Portal" />
      <DashboardShell>
        <PageHeader title="Azure Resources" description="Quick access to Azure subscriptions, resource groups, and key services" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {AZURE_PORTALS.map((p) => (
            <div key={p.name} className="rounded-xl border bg-card p-5 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-sky-50 flex items-center justify-center shrink-0">
                  <Cloud className="w-5 h-5 text-sky-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.desc}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => window.open(p.url, "_blank")}>
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </DashboardShell>
    </>
  );
}
