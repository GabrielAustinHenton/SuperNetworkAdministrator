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

    // M365 Groups with Teams provisioned
    const res = await client
      .api("/groups")
      .filter("resourceProvisioningOptions/Any(x:x eq 'Team')")
      .select("id,displayName,description,mail,createdDateTime,visibility,membershipRule,membershipRuleProcessingState")
      .orderby("displayName")
      .top(999)
      .get();

    const groups: {
      id: string;
      displayName: string;
      description?: string;
      mail?: string;
      createdDateTime?: string;
      visibility?: string;
      membershipRule?: string;
      membershipRuleProcessingState?: string;
    }[] = res.value ?? [];

    // Fetch member counts in parallel (batched to avoid rate limits)
    const BATCH = 15;
    const withCounts: {
      id: string;
      displayName: string;
      description?: string;
      mail?: string;
      createdDateTime?: string;
      visibility?: string;
      isDynamic: boolean;
      memberCount: number | null;
    }[] = [];

    for (let i = 0; i < groups.length; i += BATCH) {
      const slice = groups.slice(i, i + BATCH);
      const counts = await Promise.allSettled(
        slice.map((g) =>
          client
            .api(`/groups/${g.id}/members/$count`)
            .header("ConsistencyLevel", "eventual")
            .get()
        )
      );
      slice.forEach((g, j) => {
        withCounts.push({
          id: g.id,
          displayName: g.displayName,
          description: g.description,
          mail: g.mail,
          createdDateTime: g.createdDateTime,
          visibility: g.visibility,
          isDynamic: g.membershipRuleProcessingState === "On",
          memberCount: counts[j].status === "fulfilled" ? (counts[j] as PromiseFulfilledResult<number>).value : null,
        });
      });
    }

    return NextResponse.json({ teams: withCounts });
  } catch (err) {
    console.error("[teams GET]", err);
    return NextResponse.json({ error: "Failed to load teams" }, { status: 500 });
  }
}
