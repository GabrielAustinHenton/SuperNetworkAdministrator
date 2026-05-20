import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getGraphClient } from "@/lib/graph";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const client = getGraphClient(session.accessToken);

    // Get all active role assignments with principal and role definition expanded
    const res = await client
      .api("/roleManagement/directory/roleAssignments")
      .select("id,principalId,roleDefinitionId,directoryScopeId")
      .expand("principal($select=id,displayName,userPrincipalName,mail)")
      .expand("roleDefinition($select=id,displayName,description,isBuiltIn)")
      .top(999)
      .get();

    const assignments: {
      id: string;
      principalId: string;
      roleDefinitionId: string;
      directoryScopeId: string;
      principal?: { id: string; displayName: string; userPrincipalName?: string; mail?: string };
      roleDefinition?: { id: string; displayName: string; description?: string; isBuiltIn: boolean };
    }[] = res.value ?? [];

    // Group assignments by role
    const roleMap = new Map<string, {
      id: string;
      displayName: string;
      description?: string;
      isBuiltIn: boolean;
      members: { id: string; displayName: string; userPrincipalName?: string }[];
    }>();

    for (const a of assignments) {
      const rd = a.roleDefinition;
      if (!rd) continue;
      if (!roleMap.has(rd.id)) {
        roleMap.set(rd.id, {
          id: rd.id,
          displayName: rd.displayName,
          description: rd.description,
          isBuiltIn: rd.isBuiltIn,
          members: [],
        });
      }
      if (a.principal) {
        roleMap.get(rd.id)!.members.push({
          id: a.principal.id,
          displayName: a.principal.displayName,
          userPrincipalName: a.principal.userPrincipalName,
        });
      }
    }

    const roles = Array.from(roleMap.values()).sort((a, b) =>
      b.members.length - a.members.length || a.displayName.localeCompare(b.displayName)
    );

    return NextResponse.json({ roles });
  } catch (err) {
    console.error("[roles GET]", err);
    return NextResponse.json({ error: "Failed to load roles" }, { status: 500 });
  }
}
