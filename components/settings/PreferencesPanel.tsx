"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Select, MultiSelect } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/providers/ToastProvider";
import { useTheme } from "@/components/app/ThemeProvider";
import { useSettings, useUpdateSettings } from "@/lib/account/hooks";
import { LANGUAGE_OPTIONS, UNIT_OPTIONS } from "@/lib/account/labels";
import { COUNTRY_OPTIONS } from "@/lib/opportunities/labels";
import type {
  Language,
  NotificationPrefs,
  OpportunityAlertPrefs,
  UnitSystem,
} from "@/lib/account/types";

const DEFAULT_NOTIFS: NotificationPrefs = { product: true, reports: true, alerts: true };
const DEFAULT_OPP_ALERTS: OpportunityAlertPrefs = {
  newRoundCountries: [],
  deadlineReminders: true,
  addendumOnWatched: true,
};

/**
 * PreferencesPanel — units, language (English live; others placeholders), dark mode (wired
 * to the app ThemeProvider, client-side), and notification toggles. Units/language/notifs
 * persist to the backend; dark mode is a local UI preference.
 */
export function PreferencesPanel() {
  const { show } = useToast();
  const { theme, toggleTheme } = useTheme();
  const settings = useSettings();
  const update = useUpdateSettings();

  const [units, setUnits] = useState<UnitSystem>("oilfield");
  const [language, setLanguage] = useState<Language>("en");
  const [notifs, setNotifs] = useState<NotificationPrefs>(DEFAULT_NOTIFS);
  const [oppAlerts, setOppAlerts] = useState<OpportunityAlertPrefs>(DEFAULT_OPP_ALERTS);

  useEffect(() => {
    if (settings.data) {
      setUnits(settings.data.units);
      setLanguage(settings.data.language);
      setNotifs(settings.data.notifications ?? DEFAULT_NOTIFS);
      setOppAlerts(settings.data.opportunityAlerts ?? DEFAULT_OPP_ALERTS);
    }
  }, [settings.data]);

  function save() {
    update.mutate(
      { units, language, notifications: notifs, opportunityAlerts: oppAlerts },
      {
        onSuccess: () => show({ message: "Preferences saved", tone: "success" }),
        onError: (e) => show({ message: (e as Error).message, tone: "danger" }),
      },
    );
  }

  if (settings.isLoading) {
    return (
      <Card className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </Card>
    );
  }

  return (
    <Card className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Units" options={UNIT_OPTIONS} value={units} onChange={(v) => setUnits(v as UnitSystem)} />
        <Select
          label="Language"
          options={LANGUAGE_OPTIONS}
          value={language}
          onChange={(v) => setLanguage(v as Language)}
          helperText="Pidgin, Yorùbá and Hausa are coming."
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-primary">Appearance</p>
        <CheckRow
          label="Dark mode"
          hint="Applies to the app immediately."
          checked={theme === "dark"}
          onChange={toggleTheme}
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-primary">Notifications</p>
        <div className="space-y-1.5">
          <CheckRow label="Product updates" checked={notifs.product} onChange={(v) => setNotifs((p) => ({ ...p, product: v }))} />
          <CheckRow label="Report completions" checked={notifs.reports} onChange={(v) => setNotifs((p) => ({ ...p, reports: v }))} />
          <CheckRow label="Alerts & anomalies" checked={notifs.alerts} onChange={(v) => setNotifs((p) => ({ ...p, alerts: v }))} />
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-primary">Opportunity alerts</p>
        <p className="mb-2 text-xs text-faint">
          Licensing-round alerts arrive in your notification bell. Email delivery is coming.
        </p>
        <div className="max-w-xs">
          <MultiSelect
            label="New round opened in"
            options={COUNTRY_OPTIONS}
            value={oppAlerts.newRoundCountries}
            onChange={(v) => setOppAlerts((p) => ({ ...p, newRoundCountries: v }))}
            placeholder="Select countries…"
          />
        </div>
        <div className="mt-2 space-y-1.5">
          <CheckRow
            label="Deadline approaching on watched rounds"
            hint="7, 3 and 1 day before a submission deadline."
            checked={oppAlerts.deadlineReminders}
            onChange={(v) => setOppAlerts((p) => ({ ...p, deadlineReminders: v }))}
          />
          <CheckRow
            label="Addendum or update on a watched round"
            checked={oppAlerts.addendumOnWatched}
            onChange={(v) => setOppAlerts((p) => ({ ...p, addendumOnWatched: v }))}
          />
        </div>
      </div>

      <Button onClick={save} disabled={update.isPending}>
        {update.isPending ? "Saving…" : "Save preferences"}
      </Button>
    </Card>
  );
}

function CheckRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-2.5 rounded-md px-1 py-1.5 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5" />
      <span>
        <span className="text-primary">{label}</span>
        {hint && <span className="block text-xs text-faint">{hint}</span>}
      </span>
    </label>
  );
}
