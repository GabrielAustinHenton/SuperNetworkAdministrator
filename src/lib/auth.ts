import type { NextAuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";

// Microsoft Graph scopes requested at login.
// The user (an admin) must have these delegated permissions granted in Entra.
const GRAPH_SCOPES = [
  "openid",
  "profile",
  "email",
  "offline_access",
  "User.Read",
  "User.ReadWrite.All",
  "Directory.ReadWrite.All",
  "Group.ReadWrite.All",
  "Device.Read.All",
  "DeviceManagementManagedDevices.ReadWrite.All",
  "SecurityEvents.Read.All",
  "AuditLog.Read.All",
  "Organization.Read.All",
  "Mail.ReadBasic.All",
  "RoleManagement.Read.All",
  "Team.ReadBasic.All",
  "Sites.Read.All",
].join(" ");

export const authOptions: NextAuthOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
      authorization: {
        params: {
          scope: GRAPH_SCOPES,
        },
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, account }) {
      // On initial sign-in, persist the tokens from Azure AD.
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }

      // Token still valid → return as-is.
      if (Date.now() < (token.expiresAt ?? 0) * 1000 - 60_000) {
        return token;
      }

      // Token expired → attempt refresh.
      try {
        const response = await fetch(
          `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/oauth2/v2.0/token`,
          {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              client_id: process.env.AZURE_AD_CLIENT_ID!,
              client_secret: process.env.AZURE_AD_CLIENT_SECRET!,
              grant_type: "refresh_token",
              refresh_token: token.refreshToken as string,
              scope: GRAPH_SCOPES,
            }),
          }
        );

        const tokens = await response.json();
        if (!response.ok) throw tokens;

        return {
          ...token,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token ?? token.refreshToken,
          expiresAt: Math.floor(Date.now() / 1000 + tokens.expires_in),
        };
      } catch {
        return { ...token, error: "RefreshTokenError" };
      }
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.error = token.error;
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },
};
