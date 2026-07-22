import { fetchJson } from "./client";

export const settingsIntegrationsKeys = {
  all: ["settings", "integrations"] as const,
};

export type IntegrationsConfig = {
  supplierSync: { enabled: boolean; provider: string; endpoint: string };
  sms: { enabled: boolean; provider: string; senderId: string };
};

export type IntegrationsStatus = {
  activeSuppliers: number;
  supplierSyncConnected: boolean;
  smsConnected: boolean;
};

export type GetIntegrationsResponse = {
  config: IntegrationsConfig | null;
  status: IntegrationsStatus;
};

export type UpdateIntegrationsResponse = {
  success: boolean;
  error?: string;
  config?: IntegrationsConfig;
};

export async function getSettingsIntegrations(): Promise<GetIntegrationsResponse> {
  return fetchJson<GetIntegrationsResponse>("/api/settings/integrations");
}

export async function updateSettingsIntegrations(
  body: IntegrationsConfig,
): Promise<UpdateIntegrationsResponse> {
  return fetchJson<UpdateIntegrationsResponse>("/api/settings/integrations", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
