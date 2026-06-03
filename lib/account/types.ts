/**
 * Account / settings types — profile, organization, user settings, team (RBAC), and the
 * copilot's memory. All persisted via the backend; the frontend only edits + displays.
 */

export interface ProfileData {
  id: string;
  name: string;
  email: string;
  role: string;
  org?: string;
  avatarUrl?: string;
}

export type UnitSystem = "oilfield" | "metric";
export type Language = "en" | "pcm" | "yo" | "ha";
export type GwpSet = "ar5" | "ar6";
export type ReportingBoundary = "operational_control" | "financial_control" | "equity_share";
export type Segment = "upstream" | "midstream" | "downstream" | "integrated";

export interface OrgSettings {
  company: string;
  country: string;
  segment: Segment;
  reportingBoundary: ReportingBoundary;
  units: UnitSystem;
  gwpSet: GwpSet;
  /** Selected reporting frameworks (ids from lib/reports/frameworks). */
  frameworks: string[];
  /** Read-only count, links to the asset registry. */
  assetCount?: number;
}

export interface NotificationPrefs {
  product: boolean;
  reports: boolean;
  alerts: boolean;
}

/**
 * Per-user alerts for licensing-round opportunities. `newRoundCountries` opts the user into
 * "a new round opened in <country>"; the two booleans cover deadline reminders (7/3/1 day) on
 * watched rounds and addenda/updates on watched rounds. In-app via the notification bell;
 * email delivery is a backend plug-point.
 */
export interface OpportunityAlertPrefs {
  newRoundCountries: string[];
  deadlineReminders: boolean;
  addendumOnWatched: boolean;
}

export interface UserSettings {
  units: UnitSystem;
  language: Language;
  notifications: NotificationPrefs;
  opportunityAlerts?: OpportunityAlertPrefs;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status?: "active" | "invited";
}

export interface CopilotMemory {
  id: string;
  content: string;
  kind?: string;
  createdAt?: string;
}
