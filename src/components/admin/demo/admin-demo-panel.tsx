"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { fetchJson } from "@/lib/http/client";
import { useAdminSettings } from "@/components/admin/settings/admin-settings-provider";
import { defaultAdminPlatformSettings, type DemoModeConfig } from "@/components/admin/settings/admin-settings-types";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  SettingsPanelTitle,
  SettingsSection,
  SettingsRow,
} from "@/components/settings/settings-primitives";
import { RotateCcw, FlaskConical, CheckCircle2, XCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const ALL_FEATURES: { key: string; label: string; group: string }[] = [
  { key: "app.dashboard",       label: "Dashboard",           group: "Core" },
  { key: "pos.access",          label: "POS — Sales",         group: "POS" },
  { key: "pos.returns",         label: "POS — Returns",       group: "POS" },
  { key: "pos.hold",            label: "POS — Hold Sale",     group: "POS" },
  { key: "pos.void",            label: "POS — Void Sale",     group: "POS" },
  { key: "pos.insurance",       label: "POS — Insurance",     group: "POS" },
  { key: "inventory.access",    label: "Inventory",           group: "Inventory" },
  { key: "inventory.analytics", label: "Inventory Analytics", group: "Inventory" },
  { key: "sales.view",          label: "Sales History",       group: "Reports" },
  { key: "reports.view",        label: "Reports",             group: "Reports" },
  { key: "customers.access",    label: "Customers",           group: "CRM" },
  { key: "patients.access",     label: "Patients",            group: "CRM" },
  { key: "prescriptions.access",label: "Prescriptions",       group: "CRM" },
  { key: "branches.access",     label: "Branches",            group: "Branches" },
  { key: "staff.access",        label: "Staff",               group: "Staff" },
  { key: "settings.access",     label: "Settings",            group: "Settings" },
  { key: "billing.self_serve",  label: "Billing",             group: "Settings" },
];

const FEATURE_GROUPS = [...new Set(ALL_FEATURES.map((f) => f.group))];

export function AdminDemoPanel() {
  const { settings, setSettings } = useAdminSettings();
  const demo = settings.demo_mode ?? defaultAdminPlatformSettings().demo_mode;

  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const resetMutation = useMutation({
    mutationFn: () => fetchJson<{ success: boolean; message: string }>("/api/demo/reset", { method: "POST" }),
    onSuccess: (data) => {
      setActionMessage(data.message);
      setTimeout(() => setActionMessage(null), 4000);
    },
  });

  const teardownMutation = useMutation({
    mutationFn: () => fetchJson<{ success: boolean; message: string }>("/api/demo/admin/teardown", { method: "POST" }),
    onSuccess: (data) => {
      setActionMessage(data.message);
      setTimeout(() => setActionMessage(null), 5000);
      setSettings((prev) => ({
        ...prev,
        demo_mode: { ...(prev.demo_mode ?? defaultAdminPlatformSettings().demo_mode), enabled: false },
      }));
    },
  });

  function updateDemo(patch: Partial<DemoModeConfig>) {
    setSettings((prev) => ({
      ...prev,
      demo_mode: { ...(prev.demo_mode ?? defaultAdminPlatformSettings().demo_mode), ...patch },
    }));
  }

  function toggleFeature(key: string) {
    const current = new Set(demo.features);
    current.has(key) ? current.delete(key) : current.add(key);
    updateDemo({ features: [...current] });
  }

  const isExpired = demo.expires_at ? new Date(demo.expires_at) < new Date() : false;

  return (
    <div className="space-y-8">
      <SettingsPanelTitle
        title="Demo Mode"
        description="Control the public demo pharmacy used for RRA certification testing and product showcasing"
      />

      {/* Status banner */}
      <div className={cn(
        "flex items-center gap-3 rounded-xl border px-4 py-3 text-sm",
        demo.enabled && !isExpired
          ? "border-green-200 bg-green-50 text-green-800 dark:border-green-900/40 dark:bg-green-950/30 dark:text-green-300"
          : "border-neutral-200 bg-neutral-50 text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400",
      )}>
        {demo.enabled && !isExpired ? (
          <CheckCircle2 className="size-4 shrink-0" />
        ) : (
          <XCircle className="size-4 shrink-0" />
        )}
        <span>
          Demo is currently{" "}
          <strong>{demo.enabled && !isExpired ? "active" : "inactive"}</strong>
          {isExpired && demo.enabled && " — expiry date has passed"}
          {". "}
          Public URL:{" "}
          <a
            href="/demo"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            /demo
          </a>
        </span>
      </div>

      {/* On/off toggle */}
      <SettingsSection title="Activation">
        <SettingsRow
          title="Enable demo mode"
          description="Allow visitors to log in with demo@pryrox.com / demo123456 and access a pre-seeded pharmacy"
        >
          <Switch
            checked={demo.enabled}
            onCheckedChange={(v) => updateDemo({ enabled: v })}
          />
        </SettingsRow>

        <SettingsRow
          title="Expiry date"
          description="Demo access is automatically blocked after this date. Leave blank for no expiry."
        >
          <Input
            type="datetime-local"
            className="w-48"
            value={demo.expires_at ? demo.expires_at.slice(0, 16) : ""}
            onChange={(e) =>
              updateDemo({ expires_at: e.target.value ? new Date(e.target.value).toISOString() : null })
            }
          />
        </SettingsRow>

        <SettingsRow
          title="Daily reset"
          description="Automatically wipe sales and returns every 24 hours"
        >
          <Switch
            checked={demo.reset_daily}
            onCheckedChange={(v) => updateDemo({ reset_daily: v })}
          />
        </SettingsRow>
      </SettingsSection>

      {/* Feature selection */}
      <SettingsSection
        title="Accessible features"
        description="Choose which features the demo pharmacy can access. POS + Inventory is recommended for RRA certification testing."
      >
        <div className="space-y-5 px-5 py-4">
          {FEATURE_GROUPS.map((group) => (
            <div key={group}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                {group}
              </p>
              <div className="flex flex-wrap gap-2">
                {ALL_FEATURES.filter((f) => f.group === group).map((feature) => {
                  const active = demo.features.includes(feature.key);
                  return (
                    <button
                      key={feature.key}
                      onClick={() => toggleFeature(feature.key)}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                        active
                          ? "border-primary bg-primary text-white"
                          : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:border-neutral-600",
                      )}
                    >
                      {feature.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="flex flex-wrap gap-1 pt-1">
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {demo.features.length} feature{demo.features.length !== 1 ? "s" : ""} selected
            </span>
            {demo.features.length === 0 && (
              <Badge variant="destructive" className="text-xs">
                No features — demo will be blocked
              </Badge>
            )}
          </div>
        </div>
      </SettingsSection>

      {/* Actions */}
      <SettingsSection title="Actions">
        <div className="flex flex-wrap items-center gap-3 px-5 py-4">
          <Button
            variant="outline"
            onClick={() => resetMutation.mutate()}
            disabled={resetMutation.isPending}
            className="gap-2"
          >
            <RotateCcw className={cn("size-4", resetMutation.isPending && "animate-spin")} />
            {resetMutation.isPending ? "Resetting…" : "Reset demo data now"}
          </Button>

          <Button variant="outline" asChild className="gap-2">
            <a href="/demo" target="_blank" rel="noopener noreferrer">
              <FlaskConical className="size-4" />
              Preview demo
            </a>
          </Button>

          <div className="ml-auto">
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-destructive font-medium">
                  Delete ALL demo data?
                </span>
                <Button
                  variant="destructive"
                  onClick={() => {
                    teardownMutation.mutate();
                    setConfirmDelete(false);
                  }}
                  disabled={teardownMutation.isPending}
                  className="gap-2"
                >
                  <Trash2 className="size-4" />
                  {teardownMutation.isPending ? "Deleting…" : "Yes, delete everything"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmDelete(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                variant="destructive"
                onClick={() => setConfirmDelete(true)}
                className="gap-2"
              >
                <Trash2 className="size-4" />
                Delete demo data
              </Button>
            )}
          </div>
        </div>

        {actionMessage && (
          <p className="px-5 pb-4 text-sm text-green-600 dark:text-green-400">
            {actionMessage}
          </p>
        )}
      </SettingsSection>

    </div>
  );
}
