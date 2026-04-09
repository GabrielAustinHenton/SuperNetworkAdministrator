import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import db from "@/lib/db";
import { getModulesForServices } from "@/lib/modules";

const setupSchema = z.object({
  orgName: z.string().min(1),
  tenantId: z.string().uuid(),
  clientId: z.string().uuid(),
  enabledServices: z.array(z.string()).min(1),
  environment: z.enum(["cloud", "hybrid", "onprem"]),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = setupSchema.parse(body);

    // Upsert the organization record
    const org = await db.organization.upsert({
      where: { tenantId: data.tenantId },
      create: {
        name: data.orgName,
        tenantId: data.tenantId,
        clientId: data.clientId,
        environment: data.environment,
        setupComplete: true,
      },
      update: {
        name: data.orgName,
        clientId: data.clientId,
        environment: data.environment,
        setupComplete: true,
      },
    });

    // Clear and re-create service records
    await db.orgService.deleteMany({ where: { organizationId: org.id } });
    await db.orgService.createMany({
      data: data.enabledServices.map((serviceId) => ({
        organizationId: org.id,
        serviceId,
        enabled: true,
      })),
    });

    // Auto-enable modules based on selected services
    const modulesForServices = getModulesForServices(data.enabledServices);
    await db.orgModule.deleteMany({ where: { organizationId: org.id } });
    await db.orgModule.createMany({
      data: modulesForServices.map((mod, i) => ({
        organizationId: org.id,
        moduleId: mod.id,
        enabled: mod.defaultEnabled,
        position: i,
      })),
    });

    return NextResponse.json({ success: true, orgId: org.id });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input: " + err.errors.map((e) => e.message).join(", ") },
        { status: 400 }
      );
    }
    console.error("[setup]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const org = await db.organization.findFirst({
      select: { id: true, name: true, setupComplete: true, tenantId: true },
    });
    return NextResponse.json({ org });
  } catch {
    return NextResponse.json({ org: null });
  }
}
