import { Client } from "@microsoft/microsoft-graph-client";
import type {
  GraphUser,
  GraphUserCreate,
  GraphGroup,
  GraphDevice,
  GraphSecurityAlert,
  GraphListResponse,
  GraphLicense,
} from "@/types/graph";

// ─── Client Factory ─────────────────────────────────────────────────────────

export function getGraphClient(accessToken: string): Client {
  return Client.init({
    authProvider: (done) => {
      done(null, accessToken);
    },
  });
}

// ─── Users ──────────────────────────────────────────────────────────────────

const USER_SELECT =
  "id,displayName,userPrincipalName,mail,jobTitle,department,officeLocation," +
  "mobilePhone,businessPhones,accountEnabled,createdDateTime,usageLocation," +
  "onPremisesSyncEnabled,onPremisesLastSyncDateTime,assignedLicenses,signInActivity";

export async function listUsers(accessToken: string): Promise<GraphUser[]> {
  const client = getGraphClient(accessToken);
  const users: GraphUser[] = [];

  let res: GraphListResponse<GraphUser> = await client
    .api("/users")
    .select(USER_SELECT)
    .orderby("displayName")
    .top(999)
    .get();

  users.push(...res.value);

  // Follow pagination links until all users are fetched
  while (res["@odata.nextLink"]) {
    res = await client.api(res["@odata.nextLink"]).get();
    users.push(...res.value);
  }

  return users;
}

export async function getUser(
  accessToken: string,
  userId: string
): Promise<GraphUser> {
  const client = getGraphClient(accessToken);
  return client.api(`/users/${userId}`).select(USER_SELECT).get();
}

export async function createUser(
  accessToken: string,
  data: GraphUserCreate
): Promise<GraphUser> {
  const client = getGraphClient(accessToken);
  return client.api("/users").post(data);
}

export async function updateUser(
  accessToken: string,
  userId: string,
  data: Partial<GraphUser>
): Promise<void> {
  const client = getGraphClient(accessToken);
  await client.api(`/users/${userId}`).patch(data);
}

export async function setUserEnabled(
  accessToken: string,
  userId: string,
  enabled: boolean
): Promise<void> {
  const client = getGraphClient(accessToken);
  await client.api(`/users/${userId}`).patch({ accountEnabled: enabled });
}

export async function deleteUser(
  accessToken: string,
  userId: string
): Promise<void> {
  const client = getGraphClient(accessToken);
  await client.api(`/users/${userId}`).delete();
}

export async function resetUserMfa(
  accessToken: string,
  userId: string
): Promise<void> {
  const client = getGraphClient(accessToken);
  // Revoke all refresh tokens (forces re-auth including MFA)
  await client.api(`/users/${userId}/revokeSignInSessions`).post({});
}

export async function revokeSignInSessions(
  accessToken: string,
  userId: string
): Promise<void> {
  const client = getGraphClient(accessToken);
  await client.api(`/users/${userId}/revokeSignInSessions`).post({});
}

export async function getUserMemberOf(
  accessToken: string,
  userId: string
): Promise<GraphGroup[]> {
  const client = getGraphClient(accessToken);
  const res: GraphListResponse<GraphGroup> = await client
    .api(`/users/${userId}/memberOf`)
    .select("id,displayName,description,groupTypes,securityEnabled,mailEnabled")
    .get();
  return res.value;
}

// ─── Groups ─────────────────────────────────────────────────────────────────

export async function listGroups(
  accessToken: string,
  top = 100
): Promise<GraphGroup[]> {
  const client = getGraphClient(accessToken);
  const res: GraphListResponse<GraphGroup> = await client
    .api("/groups")
    .select(
      "id,displayName,description,groupTypes,mail,mailEnabled,securityEnabled," +
      "membershipRule,membershipRuleProcessingState,createdDateTime,onPremisesSyncEnabled"
    )
    .orderby("displayName")
    .top(top)
    .get();
  return res.value;
}

export async function getGroup(
  accessToken: string,
  groupId: string
): Promise<GraphGroup> {
  const client = getGraphClient(accessToken);
  return client.api(`/groups/${groupId}`).get();
}

export async function addGroupMember(
  accessToken: string,
  groupId: string,
  userId: string
): Promise<void> {
  const client = getGraphClient(accessToken);
  await client.api(`/groups/${groupId}/members/$ref`).post({
    "@odata.id": `https://graph.microsoft.com/v1.0/users/${userId}`,
  });
}

export async function removeGroupMember(
  accessToken: string,
  groupId: string,
  userId: string
): Promise<void> {
  const client = getGraphClient(accessToken);
  await client.api(`/groups/${groupId}/members/${userId}/$ref`).delete();
}

// ─── Devices ─────────────────────────────────────────────────────────────────

export async function listDevices(
  accessToken: string,
  top = 100
): Promise<GraphDevice[]> {
  const client = getGraphClient(accessToken);
  const res: GraphListResponse<GraphDevice> = await client
    .api("/devices")
    .select(
      "id,displayName,deviceId,operatingSystem,operatingSystemVersion," +
      "trustType,isCompliant,isManaged,registeredDateTime,approximateLastSignInDateTime,accountEnabled"
    )
    .orderby("displayName")
    .top(top)
    .get();
  return res.value;
}

// ─── Security Alerts ─────────────────────────────────────────────────────────

export async function listSecurityAlerts(
  accessToken: string,
  top = 50
): Promise<GraphSecurityAlert[]> {
  const client = getGraphClient(accessToken);
  const res: GraphListResponse<GraphSecurityAlert> = await client
    .api("/security/alerts_v2")
    .top(top)
    .get()
    .catch(() =>
      // Fallback to v1 alerts endpoint if v2 not available
      client
        .api("/security/alerts")
        .select("id,title,description,severity,status,category,createdDateTime,userStates,hostStates,networkConnections,vendorInformation")
        .top(top)
        .get()
    );
  return res.value ?? [];
}

// ─── Licenses ─────────────────────────────────────────────────────────────────

export async function listLicenses(
  accessToken: string
): Promise<GraphLicense[]> {
  const client = getGraphClient(accessToken);
  const res: GraphListResponse<GraphLicense> = await client
    .api("/subscribedSkus")
    .get();
  return res.value;
}

// ─── Organization ─────────────────────────────────────────────────────────────

export async function getOrganization(accessToken: string) {
  const client = getGraphClient(accessToken);
  const res = await client
    .api("/organization")
    .select("id,displayName,city,country,createdDateTime,verifiedDomains,assignedPlans")
    .get();
  return res.value?.[0];
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export async function getDashboardStats(accessToken: string) {
  const client = getGraphClient(accessToken);

  const [usersRes, devicesRes, groupsRes] = await Promise.allSettled([
    client.api("/users").select("id,accountEnabled").top(999).get() as Promise<GraphListResponse<{ id: string; accountEnabled: boolean }>>,
    client.api("/devices").select("id,isCompliant").top(999).get() as Promise<GraphListResponse<{ id: string; isCompliant: boolean }>>,
    client.api("/groups").select("id").top(999).get() as Promise<GraphListResponse<{ id: string }>>,
  ]);

  const users = usersRes.status === "fulfilled" ? usersRes.value.value : [];
  const devices = devicesRes.status === "fulfilled" ? devicesRes.value.value : [];
  const groups = groupsRes.status === "fulfilled" ? groupsRes.value.value : [];

  return {
    totalUsers: users.length,
    activeUsers: users.filter((u) => u.accountEnabled).length,
    disabledUsers: users.filter((u) => !u.accountEnabled).length,
    totalDevices: devices.length,
    compliantDevices: devices.filter((d) => d.isCompliant).length,
    nonCompliantDevices: devices.filter((d) => !d.isCompliant).length,
    totalGroups: groups.length,
  };
}
