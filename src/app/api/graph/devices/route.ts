import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listDevices } from "@/lib/graph";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const devices = await listDevices(session.accessToken);
    return NextResponse.json({ devices });
  } catch (err) {
    console.error("[graph/devices GET]", err);
    return NextResponse.json({ error: "Failed to fetch devices" }, { status: 500 });
  }
}
