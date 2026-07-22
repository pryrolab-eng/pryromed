"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DashboardButton } from "@/components/dashboard";
import {
  SettingsPanelTitle,
  SettingsSection,
  SettingsRow,
} from "@/components/settings/settings-primitives";
import {
  useSettingsIntegrations,
  useUpdateSettingsIntegrationsMutation,
} from "@/hooks/useSettingsIntegrations";

const DEFAULT_SUPPLIER = { enabled: false, provider: "", endpoint: "" };
const DEFAULT_SMS = { enabled: false, provider: "", senderId: "" };

export function SettingsIntegrationsPanel() {
  const query = useSettingsIntegrations();
  const updateMutation = useUpdateSettingsIntegrationsMutation();

  const [supplierSync, setSupplierSync] = useState(DEFAULT_SUPPLIER);
  const [sms, setSms] = useState(DEFAULT_SMS);

  // Seed local form from cache when data arrives
  useEffect(() => {
    if (!query.data?.config) return;
    setSupplierSync(query.data.config.supplierSync ?? DEFAULT_SUPPLIER);
    setSms(query.data.config.sms ?? DEFAULT_SMS);
  }, [query.data]);

  const handleSave = async () => {
    try {
      const result = await updateMutation.mutateAsync({ supplierSync, sms });
      if (result.success) {
        toast.success("Integration settings saved");
      } else {
        toast.error(result.error ?? "Failed to save integrations");
      }
    } catch {
      toast.error("Failed to save integrations");
    }
  };

  if (query.isPending) {
    return <div className="p-5 text-sm text-neutral-500">Loading settings...</div>;
  }

  const isSupplierSyncConnected = supplierSync.enabled && !!supplierSync.endpoint;
  const isSmsConnected = sms.enabled && !!sms.provider;

  return (
    <div className="space-y-8">
      <SettingsPanelTitle
        title="Integrations"
        description="Connected third-party services for your pharmacy"
      />

      <SettingsSection title="Connected services">
        <SettingsRow
          title="Supplier integration"
          description="Sync stock levels and trigger purchase orders automatically"
        >
          <div className="flex items-center gap-2">
            <Badge variant={isSupplierSyncConnected ? "default" : "secondary"}>
              {isSupplierSyncConnected ? "Connected" : "Not connected"}
            </Badge>
            <Switch
              checked={supplierSync.enabled}
              onCheckedChange={(enabled) =>
                setSupplierSync({ ...supplierSync, enabled })
              }
            />
          </div>
        </SettingsRow>

        {supplierSync.enabled && (
          <div className="space-y-4 px-5 py-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/10 rounded-md">
            <div className="grid gap-2 max-w-md">
              <Label htmlFor="supplierProvider">Supplier Provider Name</Label>
              <Input
                id="supplierProvider"
                placeholder="e.g. Medisync, PharmaLink"
                value={supplierSync.provider}
                onChange={(e) =>
                  setSupplierSync({ ...supplierSync, provider: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2 max-w-md">
              <Label htmlFor="supplierEndpoint">API Endpoint / Webhook URL</Label>
              <Input
                id="supplierEndpoint"
                placeholder="https://api.supplier.com/sync"
                value={supplierSync.endpoint}
                onChange={(e) =>
                  setSupplierSync({ ...supplierSync, endpoint: e.target.value })
                }
              />
            </div>
          </div>
        )}

        <SettingsRow
          title="Insurance claims"
          description="Insurance claim workflows use the built-in insurance module"
        >
          <Badge variant="secondary">Built in</Badge>
        </SettingsRow>

        <SettingsRow
          title="SMS notifications"
          description="Connect an SMS gateway provider for patient out-of-app updates"
        >
          <div className="flex items-center gap-2">
            <Badge variant={isSmsConnected ? "default" : "secondary"}>
              {isSmsConnected ? "Connected" : "Not connected"}
            </Badge>
            <Switch
              checked={sms.enabled}
              onCheckedChange={(enabled) => setSms({ ...sms, enabled })}
            />
          </div>
        </SettingsRow>

        {sms.enabled && (
          <div className="space-y-4 px-5 py-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/10 rounded-md">
            <div className="grid gap-2 max-w-md">
              <Label htmlFor="smsProvider">SMS Gateway Provider</Label>
              <Input
                id="smsProvider"
                placeholder="e.g. Twilio, Africa's Talking"
                value={sms.provider}
                onChange={(e) => setSms({ ...sms, provider: e.target.value })}
              />
            </div>
            <div className="grid gap-2 max-w-md">
              <Label htmlFor="smsSenderId">Sender ID</Label>
              <Input
                id="smsSenderId"
                placeholder="e.g. PRYROX, MYPHARMA"
                value={sms.senderId}
                onChange={(e) =>
                  setSms({ ...sms, senderId: e.target.value })
                }
              />
            </div>
          </div>
        )}
      </SettingsSection>

      <p className="text-sm text-neutral-500">
        Platform integration API keys are issued by Pryrox administrators (Admin
        → Settings → Integrations) for external systems calling Pryrox APIs —
        not per-pharmacy credentials.
      </p>

      <div className="px-5">
        <DashboardButton
          tone="primary"
          onClick={() => void handleSave()}
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending ? "Saving..." : "Save Integration Settings"}
        </DashboardButton>
      </div>
    </div>
  );
}
