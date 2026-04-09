import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const take = Math.min(parseInt(searchParams.get("limit") ?? "50"), 200);
  const skip = parseInt(searchParams.get("offset") ?? "0");

  try {
    const [logs, total] = await Promise.all([
      db.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take,
        skip,
      }),
      db.auditLog.count(),
    ]);

    return NextResponse.json({ logs, total });
  } catch (err) {
    console.error("[audit GET]", err);
    return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 });
  }
}
