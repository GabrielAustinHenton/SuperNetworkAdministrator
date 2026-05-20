import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getGraphClient } from "@/lib/graph";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const client = getGraphClient(session.accessToken);

    // Mailbox usage detail report (last 7 days, returns CSV-like JSON)
    // Requires Reports.Read.All — if unavailable falls back to null
    const reportRes = await client
      .api("/reports/getMailboxUsageDetail(period='D7')")
      .header("Accept", "application/json")
      .responseType("json" as never)
      .get()
      .catch(() => null);

    // If report returns CSV text, parse it
    let mailboxes: {
      userPrincipalName: string;
      displayName: string;
      isDeleted: boolean;
      prohibitSendQuotaBytes: number;
      prohibitSendReceiveQuotaBytes: number;
      storageUsedBytes: number;
      itemCount: number;
      lastActivityDate?: string;
    }[] = [];

    if (reportRes && typeof reportRes === "string") {
      // CSV response — parse it
      const lines = (reportRes as string).trim().split("\n");
      if (lines.length > 1) {
        const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
        const idx = (name: string) => headers.findIndex((h) => h.toLowerCase().includes(name.toLowerCase()));
        const upnIdx = idx("User Principal Name");
        const nameIdx = idx("Display Name");
        const deletedIdx = idx("Is Deleted");
        const sendQuotaIdx = idx("Prohibit Send Quota");
        const sendRecvQuotaIdx = idx("Prohibit Send/Receive Quota");
        const storageIdx = idx("Storage Used");
        const itemIdx = idx("Item Count");
        const lastActivityIdx = idx("Last Activity Date");

        for (const line of lines.slice(1)) {
          const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
          if (!cols[upnIdx]) continue;
          mailboxes.push({
            userPrincipalName: cols[upnIdx] ?? "",
            displayName: cols[nameIdx] ?? "",
            isDeleted: cols[deletedIdx]?.toLowerCase() === "true",
            prohibitSendQuotaBytes: parseInt(cols[sendQuotaIdx] ?? "0") || 0,
            prohibitSendReceiveQuotaBytes: parseInt(cols[sendRecvQuotaIdx] ?? "0") || 0,
            storageUsedBytes: parseInt(cols[storageIdx] ?? "0") || 0,
            itemCount: parseInt(cols[itemIdx] ?? "0") || 0,
            lastActivityDate: cols[lastActivityIdx] || undefined,
          });
        }
      }
    }

    // Summary stats
    const active = mailboxes.filter((m) => !m.isDeleted);
    const totalStorageBytes = active.reduce((n, m) => n + m.storageUsedBytes, 0);
    const fullMailboxes = active.filter(
      (m) => m.prohibitSendReceiveQuotaBytes > 0 && m.storageUsedBytes >= m.prohibitSendReceiveQuotaBytes * 0.9
    );

    return NextResponse.json({
      mailboxes: active.sort((a, b) => b.storageUsedBytes - a.storageUsedBytes),
      stats: {
        total: active.length,
        totalStorageBytes,
        fullMailboxes: fullMailboxes.length,
      },
    });
  } catch (err) {
    console.error("[exchange GET]", err);
    return NextResponse.json({ error: "Failed to load mailbox data" }, { status: 500 });
  }
}
