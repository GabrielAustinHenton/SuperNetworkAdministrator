"use client";

import { Header } from "@/components/layout/header";
import { DashboardShell, PageHeader } from "@/components/layout/dashboard-shell";
import { Mail, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ExchangePage() {
  return (
    <>
      <Header title="Exchange" subtitle="Exchange Online" />
      <DashboardShell>
        <PageHeader
          title="Exchange Administration"
          description="Mailbox management and mail flow settings"
        />

        {/* Quick-launch cards for Exchange admin portals */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              title: "Exchange Admin Center",
              description: "Manage mailboxes, mail flow rules, and transport settings",
              url: "https://admin.exchange.microsoft.com",
              icon: Mail,
            },
            {
              title: "Mail Flow Dashboard",
              description: "Message trace, connectors, and anti-spam policies",
              url: "https://admin.exchange.microsoft.com/#/mailflow",
              icon: Mail,
            },
            {
              title: "Recipients",
              description: "Manage mailboxes, contacts, groups, and shared mailboxes",
              url: "https://admin.exchange.microsoft.com/#/recipients",
              icon: Mail,
            },
          ].map((card) => (
            <div key={card.title} className="rounded-xl border bg-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                  <card.icon className="w-5 h-5 text-blue-600" />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(card.url, "_blank")}
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1" />
                  Open
                </Button>
              </div>
              <div>
                <p className="font-semibold text-sm">{card.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-dashed p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto">
            <Mail className="w-6 h-6 text-blue-500" />
          </div>
          <p className="font-medium">Exchange Online Administration</p>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Full mailbox management, shared mailboxes, and mail flow controls are available
            in the Exchange Admin Center. Deep inline integration requires Exchange
            administrator PowerShell permissions beyond Microsoft Graph.
          </p>
          <Button onClick={() => window.open("https://admin.exchange.microsoft.com", "_blank")}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Open Exchange Admin Center
          </Button>
        </div>
      </DashboardShell>
    </>
  );
}
