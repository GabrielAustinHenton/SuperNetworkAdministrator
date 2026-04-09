import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";
import { z } from "zod";

// GET /api/settings/modules - returns all module states for the org
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const org = await db.organization.findFirst({ select: { id: true } });
    if (!org) return NextResponse.json({ modules: [] });

    const modules = await db.orgModule.findMany({
      where: { organizationId: org.id },
      orderBy: { position: "asc" },
    });

    return NextResponse.json({ modules });
  } catch (err) {
    console.error("[settings/modules GET]", err);
    return NextResponse.json({ error: "Failed to fetch module settings" }, { status: 500 });
  }
}

const updateSchema = z.object({
  moduleId: z.string(),
  enabled: z.boolean(),
});

// PATCH /api/settings/modules - toggle a module on/off
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { moduleId, enabled } = updateSchema.parse(body);

    const org = await db.organization.findFirst({ select: { id: true } });
    if (!org) return NextResponse.json({ error: "Org not found" }, { status: 404 });

    await db.orgModule.upsert({
      where: { organizationId_moduleId: { organizationId: org.id, moduleId } },
      create: { organizationId: org.id, moduleId, enabled },
      update: { enabled },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0]?.message }, { status: 400 });
    }
    console.error("[settings/modules PATCH]", err);
    return NextResponse.json({ error: "Failed to update module" }, { status: 500 });
  }
}
