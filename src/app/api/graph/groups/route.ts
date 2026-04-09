import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listGroups } from "@/lib/graph";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const groups = await listGroups(session.accessToken);
    return NextResponse.json({ groups });
  } catch (err) {
    console.error("[graph/groups GET]", err);
    return NextResponse.json({ error: "Failed to fetch groups" }, { status: 500 });
  }
}
