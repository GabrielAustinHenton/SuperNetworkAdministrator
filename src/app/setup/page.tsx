import { redirect } from "next/navigation";
import db from "@/lib/db";
import { SetupWizard } from "@/components/setup/wizard";

export const metadata = { title: "Setup" };

export default async function SetupPage() {
  // If setup is already complete, bounce to root (which routes to login/dashboard)
  try {
    const org = await db.organization.findFirst({
      select: { setupComplete: true },
    });
    if (org?.setupComplete) {
      redirect("/");
    }
  } catch {
    // DB not ready — show setup
  }

  return <SetupWizard />;
}
