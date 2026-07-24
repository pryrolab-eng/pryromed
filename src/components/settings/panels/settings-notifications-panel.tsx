"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  SettingsPanelTitle,
  SettingsSection,
  SettingsRow,
  SettingsCheckboxGroup,
} from "@/components/settings/settings-primitives";
import { useSettingsPage } from "@/components/settings/settings-page-provider";
import { cn } from "@/lib/utils";

const RENEWAL_REMINDER_OPTIONS = [
  { value: 14, label: "2 weeks" },
  { value: 7, label: "1 week" },
  { value: 4, label: "4 days" },
  { value: 2, label: "2 days" },
  { value: 1, label: "1 day" },
] as const;

export function SettingsNotificationsPanel() {
  const { notifyPrefs, saveNotifyPrefs } = useSettingsPage();
  const [customRenewalDay, setCustomRenewalDay] = useState("");

  const patch = (key: keyof typeof notifyPrefs, value: boolean) => {
    void saveNotifyPrefs({ ...notifyPrefs, [key]: value });
  };
  const patchRenewalDays = (days: number[]) => {
    const nextDays = normalizeRenewalDays(days);
    void saveNotifyPrefs({
      ...notifyPrefs,
      subscriptionRenewalDays: nextDays,
    });
  };
  const toggleRenewalDay = (day: number) => {
    const selected = notifyPrefs.subscriptionRenewalDays.includes(day);
    patchRenewalDays(
      selected
        ? notifyPrefs.subscriptionRenewalDays.filter((value) => value !== day)
        : [...notifyPrefs.subscriptionRenewalDays, day],
    );
  };
  const addCustomRenewalDay = () => {
    const parsed = Number(customRenewalDay);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 30) {
      toast.error("Choose a reminder between 1 and 30 days before expiry");
      return;
    }
    patchRenewalDays([...notifyPrefs.subscriptionRenewalDays, parsed]);
    setCustomRenewalDay("");
  };

  return (
    <div className="space-y-8">
      <SettingsPanelTitle
        title="Notifications"
        description="Choose what you are notified about and how"
      />

      <SettingsSection title="My notifications">
        <SettingsCheckboxGroup
          title="Notify me when…"
          linkLabel="About notifications?"
          onLinkClick={() =>
            toast.message("Notification delivery uses your pharmacy email settings.")
          }
          options={[
            {
              id: "daily",
              label: "Daily productivity update",
              checked: notifyPrefs.dailyUpdate,
              onChange: (c) => patch("dailyUpdate", c),
            },
            {
              id: "low",
              label: "Low stock alert",
              checked: notifyPrefs.lowStock,
              onChange: (c) => patch("lowStock", c),
            },
            {
              id: "expiry",
              label: "Medication nearing expiry",
              checked: notifyPrefs.expiry,
              onChange: (c) => patch("expiry", c),
            },
          ]}
        />
        <SettingsRow
          title="Mobile push notifications"
          description="Alerts on your phone when the app supports push"
        >
          <Switch
            checked={notifyPrefs.push}
            onCheckedChange={(c) => patch("push", c)}
          />
        </SettingsRow>
        <SettingsRow
          title="Desktop notification"
          description="Browser notifications while Pryrox is open"
        >
          <Switch
            checked={notifyPrefs.desktop}
            onCheckedChange={(c) => patch("desktop", c)}
          />
        </SettingsRow>
        <SettingsRow
          title="Email notification"
          description="Summaries and alerts to your pharmacy email"
        >
          <Switch
            checked={notifyPrefs.email}
            onCheckedChange={(c) => patch("email", c)}
          />
        </SettingsRow>
        <SettingsRow
          title="Subscription renewal reminders"
          description="Choose when owners are warned before the current plan expires"
        >
          <div className="flex max-w-sm flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              {RENEWAL_REMINDER_OPTIONS.map((option) => {
                const selected = notifyPrefs.subscriptionRenewalDays.includes(
                  option.value,
                );
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleRenewalDay(option.value)}
                    className={cn(
                      "rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors",
                      selected
                        ? "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-100"
                        : "border-neutral-200 bg-background text-muted-foreground hover:bg-muted dark:border-neutral-800",
                    )}
                    aria-pressed={selected}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <Input
                value={customRenewalDay}
                onChange={(event) => setCustomRenewalDay(event.target.value)}
                inputMode="numeric"
                min={1}
                max={30}
                placeholder="Custom days"
                className="h-9"
              />
              <Button
                type="button"
                variant="outline"
                className="h-9 shrink-0"
                onClick={addCustomRenewalDay}
              >
                Add
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Active: {formatRenewalDays(notifyPrefs.subscriptionRenewalDays)}
            </p>
          </div>
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Reports & system">
        <SettingsRow
          title="Sales reports"
          description="Daily and weekly sales summaries"
        >
          <Switch
            checked={notifyPrefs.salesReports}
            onCheckedChange={(c) => patch("salesReports", c)}
          />
        </SettingsRow>
        <SettingsRow
          title="System updates"
          description="New features and maintenance windows"
        >
          <Switch
            checked={notifyPrefs.systemUpdates}
            onCheckedChange={(c) => patch("systemUpdates", c)}
          />
        </SettingsRow>
      </SettingsSection>
    </div>
  );
}

function normalizeRenewalDays(days: number[]): number[] {
  return Array.from(new Set(days))
    .filter((day) => Number.isInteger(day) && day >= 1 && day <= 30)
    .sort((a, b) => b - a);
}

function formatRenewalDays(days: number[]): string {
  const normalized = normalizeRenewalDays(days);
  if (!normalized.length) return "No renewal reminders";
  return normalized
    .map((day) => `${day} day${day === 1 ? "" : "s"} before`)
    .join(", ");
}
