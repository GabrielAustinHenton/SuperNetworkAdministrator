import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getGraphClient } from "@/lib/graph";
import db from "@/lib/db";

interface Params {
  params: { id: string };
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { status } = await req.json();

    if (!["newAlert", "inProgress", "resolved"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const client = getGraphClient(session.accessToken);

    // Try v2 alerts API first, fall back to v1
    try {
      await client.api(`/security/alerts_v2/${params.id}`).patch({ status });
    } catch {
      // v1 alerts use different field name
      await client.api(`/security/alerts/${params.id}`).patch({
        status,
        vendorInformation: {
          provider: "Microsoft",
          vendor: "Microsoft",
        },
      });
    }

    await db.auditLog.create({
      data: {
        action: `security.alert.${status}`,
        targetType: "securityAlert",
        targetId: params.id,
        performedBy: session.user?.email ?? "unknown",
        details: JSON.stringify({ status }),
      },
    }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[security/[id] PATCH]", err);
    return NextResponse.json({ error: "Failed to update alert" }, { status: 500 });
  }
}
