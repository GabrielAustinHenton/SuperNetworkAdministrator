# Super Network Administrator

A unified admin console for Microsoft 365, Azure AD (Entra ID), Intune, Exchange Online, and on-premises Active Directory. Single-pane-of-glass management for network and systems administrators.

---

## Features

- **Unified Dashboard** — Configurable module grid showing your enabled services
- **User Management** — Create, enable/disable, delete Entra ID users; revoke sessions
- **Device Management** — Intune-enrolled device compliance status
- **Security Alerts** — Microsoft Defender alerts via Graph Security API
- **Group Management** — M365, security, distribution, and dynamic groups
- **Exchange** — Launch pad + deep links into Exchange Admin Center
- **Audit Log** — Immutable record of every admin action taken in this console
- **Modular & Scalable** — Toggle any service panel on/off from Settings
- **Setup Wizard** — First-run wizard: configure tenant, choose services, set environment type

---

## Quick Start

### 1. Prerequisites

- Node.js 18+
- An **Azure AD / Entra ID App Registration** with the following Microsoft Graph **delegated** permissions (admin consent required):
  - `User.ReadWrite.All`
  - `Directory.ReadWrite.All`
  - `Group.ReadWrite.All`
  - `Device.Read.All`
  - `DeviceManagementManagedDevices.ReadWrite.All`
  - `SecurityEvents.Read.All`
  - `AuditLog.Read.All`
  - `Organization.Read.All`
  - `Mail.ReadBasic.All`
  - `RoleManagement.Read.All`
  - `Team.ReadBasic.All`
  - `Sites.Read.All`

- Redirect URI set to: `http://localhost:3001/api/auth/callback/azure-ad`

### 2. Install & configure

```bash
git clone https://github.com/gabrielaustinhenton/supernetworkadministrator.git
cd supernetworkadministrator

npm install

# Copy env template
cp .env.example .env.local
# Fill in AZURE_AD_CLIENT_ID, AZURE_AD_CLIENT_SECRET, AZURE_AD_TENANT_ID, NEXTAUTH_SECRET
```

### 3. Initialize the database

```bash
npm run db:push    # Creates SQLite DB (dev) — no server needed
```

### 4. Run

```bash
npm run dev
# Open http://localhost:3001
# You'll be redirected to the setup wizard on first run
```

---

## First-Run Setup Wizard

1. **Welcome** — Prerequisites checklist
2. **Tenant Config** — Enter your org name, Tenant ID, and Client ID
3. **Services** — Select which Microsoft services you use (M365, Intune, Exchange, Teams, etc.)
4. **Environment** — Cloud Only / Hybrid / On-Premises
5. **Complete** — Re-start the app then sign in with your Azure AD credentials

The wizard auto-configures which sidebar modules appear based on your service selection.

---

## Changing What the Dashboard Shows

Go to **Settings** (bottom of the sidebar) → **Dashboard Modules**. Toggle any module on or off. Changes are instant and persisted per-organization.

---

## Deployment to Azure

### Azure App Service (recommended)

```bash
# Build
npm run build

# Deploy via Azure CLI
az webapp up --name your-app-name --resource-group your-rg --runtime "NODE:20-lts"
```

Set these Application Settings in Azure App Service:
- `AZURE_AD_CLIENT_ID`
- `AZURE_AD_CLIENT_SECRET`
- `AZURE_AD_TENANT_ID`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` → `https://your-app.azurewebsites.net`
- `DATABASE_URL` → Azure SQL or Azure Database for PostgreSQL connection string

Update your App Registration redirect URI to:
`https://your-app.azurewebsites.net/api/auth/callback/azure-ad`

### Database for Production

Switch `prisma/schema.prisma` provider from `sqlite` to `sqlserver` or `postgresql` and update `DATABASE_URL`.

Run `npm run db:migrate` after deploying.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Auth | NextAuth.js v4 + Azure AD |
| API | Microsoft Graph API |
| Database | Prisma (SQLite dev / Azure SQL prod) |
| UI | Tailwind CSS + Radix UI |
| Hosting | Azure App Service (recommended) |

---

## Security Notes

- All Microsoft Graph calls are server-side — the access token never leaves the server
- Audit logs capture every mutation for compliance
- Only authenticated Entra ID users can access the dashboard
- Role-based access can be added using NextAuth callbacks + Graph role checks
