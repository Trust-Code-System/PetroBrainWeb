import type { Tone } from "@/components/ui/Badge";
import type { SelectOption } from "@/components/ui/Select";
import type { PermitStatus, PermitType } from "./types";

export const PERMIT_TYPE_LABEL: Record<PermitType, string> = {
  operating_permit: "Operating permit",
  environmental_permit: "Environmental permit",
  safety_certificate: "Safety certificate",
  vendor_certificate: "Vendor certificate",
  staff_certification: "Staff certification",
  equipment_certificate: "Equipment certificate",
  insurance: "Insurance",
  regulatory_approval: "Regulatory approval",
};

export const PERMIT_STATUS_LABEL: Record<PermitStatus, string> = {
  valid: "Valid",
  expiring_soon: "Expiring soon",
  expired: "Expired",
  no_date: "No expiry date",
};

export const PERMIT_STATUS_TONE: Record<PermitStatus, Tone> = {
  valid: "safe",
  expiring_soon: "warn",
  expired: "danger",
  no_date: "neutral",
};

export const PERMIT_TYPE_OPTIONS: SelectOption[] = (
  Object.keys(PERMIT_TYPE_LABEL) as PermitType[]
).map((t) => ({ value: t, label: PERMIT_TYPE_LABEL[t] }));
