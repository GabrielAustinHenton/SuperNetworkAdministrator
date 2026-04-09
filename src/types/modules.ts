export type ModuleCategory =
  | "identity"
  | "devices"
  | "security"
  | "productivity"
  | "azure"
  | "automation";

export type ServiceId =
  | "m365"
  | "intune"
  | "exchange"
  | "teams"
  | "sharepoint"
  | "azure"
  | "power-automate"
  | "local-ad";

export type EnvironmentType = "cloud" | "hybrid" | "onprem";

export interface ModuleDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: ModuleCategory;
  /** Microsoft Graph scopes required to use this module */
  requiredScopes: string[];
  /** Which services must be enabled for this module to show in setup */
  requiredServices: ServiceId[];
  /** Whether the module is on by default when its services are enabled */
  defaultEnabled: boolean;
  /** Sidebar nav path */
  href: string;
}

export interface OrgModuleState extends ModuleDefinition {
  enabled: boolean;
  position: number;
}

export interface ServiceDefinition {
  id: ServiceId;
  name: string;
  description: string;
  icon: string;
  defaultEnabled: boolean;
}

export interface SetupState {
  step: number;
  orgName: string;
  tenantId: string;
  clientId: string;
  environment: EnvironmentType;
  enabledServices: ServiceId[];
}
