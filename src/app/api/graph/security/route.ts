import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listSecurityAlerts } from "@/lib/graph";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const alerts = await listSecurityAlerts(session.accessToken);
    return NextResponse.json({ alerts });
  } catch (err) {
    console.error("[graph/security GET]", err);
    return NextResponse.json({ error: "Failed to fetch security alerts" }, { status: 500 });
  }
}
