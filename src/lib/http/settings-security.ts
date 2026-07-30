import { fetchJson } from "./client";

export const settingsSecurityKeys = {
  all: ["settings", "security"] as const,
  settings: () => [...settingsSecurityKeys.all, "settings"] as const,
  twoFa: () => [...settingsSecurityKeys.all, "2fa"] as const,
  ipWhitelist: () => [...settingsSecurityKeys.all, "ip-whitelist"] as const,
};

export type SecuritySettings = {
  ip_whitelist_enabled: boolean;
};

export type IpWhitelistEntry = {
  id: string;
  ip_address: string;
  description?: string;
};

export type TwoFaStatus = {
  enabled: boolean;
  platformAllowsTwoFactor?: boolean;
};

export async function getSecuritySettings(): Promise<SecuritySettings> {
  return fetchJson<SecuritySettings>("/api/settings/security");
}

export async function updateSecuritySettings(
  body: Partial<SecuritySettings>,
): Promise<void> {
  await fetchJson("/api/settings/security", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function getTwoFaStatus(): Promise<TwoFaStatus> {
  return fetchJson<TwoFaStatus>("/api/settings/security/2fa");
}

export async function setTwoFaEnabled(enabled: boolean): Promise<void> {
  await fetchJson("/api/settings/security/2fa", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ enabled }),
  });
}

export async function getIpWhitelist(): Promise<{
  ips: IpWhitelistEntry[];
  currentIp: string | null;
}> {
  const data = await fetchJson<{
    ips?: IpWhitelistEntry[];
    currentIp?: string | null;
  }>("/api/settings/security/ip-whitelist/manage");
  return {
    ips: data.ips ?? [],
    currentIp: data.currentIp ?? null,
  };
}

export async function addIpWhitelistEntry(body: {
  ip: string;
  description: string;
}): Promise<{ success: boolean; error?: string }> {
  return fetchJson("/api/settings/security/ip-whitelist/manage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function removeIpWhitelistEntry(id: string): Promise<void> {
  await fetchJson("/api/settings/security/ip-whitelist/manage", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
}

export type TwoFaSetupResponse = {
  qrCode: string;
  backupCodes: string[];
  error?: string;
};

export async function setupTwoFa(): Promise<TwoFaSetupResponse> {
  return fetchJson<TwoFaSetupResponse>("/api/settings/security/2fa/setup", {
    method: "POST",
  });
}

export async function verifyTwoFaToken(token: string): Promise<void> {
  await fetchJson("/api/settings/security/2fa/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
}
