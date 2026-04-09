"use client";

import { signIn } from "next-auth/react";
import { Network } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <Network className="w-8 h-8 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">Super Network Administrator</h1>
            <p className="text-sm text-white/50 mt-1">Microsoft 365 &amp; Azure Admin Console</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
          <div>
            <h2 className="text-lg font-semibold">Sign in to your account</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Use your Microsoft work or school account
            </p>
          </div>

          <Button
            className="w-full gap-3"
            onClick={() => signIn("azure-ad", { callbackUrl: "/dashboard" })}
          >
            {/* Microsoft logo */}
            <svg width="18" height="18" viewBox="0 0 21 21" fill="none">
              <rect x="1" y="1" width="9" height="9" fill="#F25022" />
              <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
              <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
              <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
            </svg>
            Sign in with Microsoft
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Access restricted to authorized administrators.
            <br />
            Your organization&apos;s Entra ID credentials are required.
          </p>
        </div>
      </div>
    </div>
  );
}
