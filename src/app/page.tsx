import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";

// Root page: determine where to route the user based on setup + auth state.
export default async function RootPage() {
  let setupComplete = false;

  try {
    const org = await db.organization.findFirst({
      select: { setupComplete: true },
    });
    setupComplete = org?.setupComplete ?? false;
  } catch {
    // DB not initialized yet — send to setup
    setupComplete = false;
  }

  if (!setupComplete) {
    redirect("/setup");
  }

  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  redirect("/dashboard");
}
