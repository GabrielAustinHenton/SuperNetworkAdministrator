import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUser, setUserEnabled, deleteUser, revokeSignInSessions } from "@/lib/graph";
import db from "@/lib/db";

interface Params {
  params: { id: string };
}

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await getUser(session.accessToken, params.id);
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action } = body;

    if (action === "enable" || action === "disable") {
      const enabled = action === "enable";
      await setUserEnabled(session.accessToken, params.id, enabled);

      await db.auditLog.create({
        data: {
          action: `user.${action}`,
          targetType: "user",
          targetId: params.id,
          performedBy: session.user?.email ?? "unknown",
        },
      }).catch(() => {});

      return NextResponse.json({ success: true });
    }

    if (action === "revokeSignInSessions") {
      await revokeSignInSessions(session.accessToken, params.id);

      await db.auditLog.create({
        data: {
          action: "user.revokeSignInSessions",
          targetType: "user",
          targetId: params.id,
          performedBy: session.user?.email ?? "unknown",
        },
      }).catch(() => {});

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("[graph/users/[id] PATCH]", err);
    return NextResponse.json({ error: "Action failed" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get user details for audit log before deletion
    const user = await getUser(session.accessToken, params.id).catch(() => null);
    await deleteUser(session.accessToken, params.id);

    await db.auditLog.create({
      data: {
        action: "user.delete",
        targetType: "user",
        targetId: params.id,
        targetName: user?.displayName,
        performedBy: session.user?.email ?? "unknown",
      },
    }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[graph/users/[id] DELETE]", err);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
