import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDashboardStats } from "@/lib/graph";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const stats = await getDashboardStats(session.accessToken);
    return NextResponse.json({ stats });
  } catch (err) {
    console.error("[graph/stats GET]", err);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
