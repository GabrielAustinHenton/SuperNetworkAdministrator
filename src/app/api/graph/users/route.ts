import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listUsers, createUser } from "@/lib/graph";
import db from "@/lib/db";
import { z } from "zod";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const users = await listUsers(session.accessToken);
    return NextResponse.json({ users });
  } catch (err) {
    console.error("[graph/users GET]", err);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

const createUserSchema = z.object({
  displayName: z.string().min(1),
  userPrincipalName: z.string().email(),
  mailNickname: z.string().min(1),
  password: z.string().min(8),
  forceChangePasswordNextSignIn: z.boolean().default(true),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
  usageLocation: z.string().length(2).optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = createUserSchema.parse(body);

    const user = await createUser(session.accessToken, {
      displayName: data.displayName,
      userPrincipalName: data.userPrincipalName,
      mailNickname: data.mailNickname,
      passwordProfile: {
        password: data.password,
        forceChangePasswordNextSignIn: data.forceChangePasswordNextSignIn,
      },
      accountEnabled: true,
      jobTitle: data.jobTitle,
      department: data.department,
      usageLocation: data.usageLocation,
    });

    // Audit log
    await db.auditLog.create({
      data: {
        action: "user.create",
        targetType: "user",
        targetId: user.id,
        targetName: user.displayName,
        performedBy: session.user?.email ?? "unknown",
        details: JSON.stringify({ upn: user.userPrincipalName }),
      },
    }).catch(() => {/* non-fatal */});

    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0]?.message }, { status: 400 });
    }
    console.error("[graph/users POST]", err);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
