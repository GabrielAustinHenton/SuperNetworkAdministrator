// Microsoft Graph API type definitions
// These mirror the Graph API response shapes for the data we use.

export interface GraphUser {
  id: string;
  displayName: string;
  userPrincipalName: string;
  mail?: string;
  jobTitle?: string;
  department?: string;
  officeLocation?: string;
  mobilePhone?: string;
  businessPhones?: string[];
  accountEnabled: boolean;
  createdDateTime?: string;
  lastSignInDateTime?: string;
  assignedLicenses?: { skuId: string }[];
  usageLocation?: string;
  onPremisesSyncEnabled?: boolean;
  onPremisesLastSyncDateTime?: string;
  signInActivity?: {
    lastSignInDateTime?: string;
    lastNonInteractiveSignInDateTime?: string;
  };
}

export interface GraphUserCreate {
  displayName: string;
  userPrincipalName: string;
  mailNickname: string;
  passwordProfile: {
    password: string;
    forceChangePasswordNextSignIn: boolean;
  };
  accountEnabled: boolean;
  jobTitle?: string;
  department?: string;
  usageLocation?: string;
}

export interface GraphGroup {
  id: string;
  displayName: string;
  description?: string;
  groupTypes: string[];
  mail?: string;
  mailEnabled: boolean;
  securityEnabled: boolean;
  membershipRule?: string;
  membershipRuleProcessingState?: string;
  createdDateTime?: string;
  onPremisesSyncEnabled?: boolean;
}

export interface GraphDevice {
  id: string;
  displayName: string;
  deviceId: string;
  operatingSystem?: string;
  operatingSystemVersion?: string;
  trustType?: string; // "AzureAD" | "ServerAD" | "Workplace"
  isCompliant?: boolean;
  isManaged?: boolean;
  managementType?: string;
  registeredDateTime?: string;
  approximateLastSignInDateTime?: string;
  accountEnabled: boolean;
  enrollmentType?: string;
}

export interface GraphSecurityAlert {
  id: string;
  title: string;
  description?: string;
  severity: "unknown" | "informational" | "low" | "medium" | "high";
  status: "unknown" | "newAlert" | "inProgress" | "resolved";
  category?: string;
  createdDateTime?: string;
  lastModifiedDateTime?: string;
  userStates?: {
    userPrincipalName: string;
    accountName: string;
    domainName?: string;
    logonIp?: string;
  }[];
  hostStates?: {
    fqdn?: string;
    netBiosName?: string;
    os?: string;
    publicIpAddress?: string;
    privateIpAddress?: string;
    isAzureAdJoined?: boolean;
  }[];
  networkConnections?: {
    destinationAddress?: string;
    destinationPort?: string;
    sourceAddress?: string;
    protocol?: string;
  }[];
  vendorInformation?: {
    provider: string;
    vendor: string;
  };
}

export interface GraphSignIn {
  id: string;
  userDisplayName: string;
  userPrincipalName: string;
  appDisplayName?: string;
  ipAddress?: string;
  status: {
    errorCode: number;
    failureReason?: string;
  };
  createdDateTime: string;
  conditionalAccessStatus?: string;
  location?: {
    city: string;
    state: string;
    countryOrRegion: string;
  };
}

export interface GraphLicense {
  skuId: string;
  skuPartNumber: string;
  consumedUnits: number;
  prepaidUnits: {
    enabled: number;
    suspended: number;
    warning: number;
  };
  servicePlans: {
    servicePlanId: string;
    servicePlanName: string;
    provisioningStatus: string;
  }[];
}

export interface GraphMailbox {
  id: string;
  displayName: string;
  userPrincipalName: string;
  mailboxType?: string;
  prohibitSendQuota?: number;
  prohibitSendReceiveQuota?: number;
  totalItemSize?: number;
  isMailboxEnabled?: boolean;
}

export interface GraphListResponse<T> {
  value: T[];
  "@odata.nextLink"?: string;
  "@odata.count"?: number;
}
