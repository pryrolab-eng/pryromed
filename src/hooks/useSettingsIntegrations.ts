"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getSettingsIntegrations,
  settingsIntegrationsKeys,
  updateSettingsIntegrations,
  type IntegrationsConfig,
} from "@/lib/http/settings-integrations";
import { SEARCH_LIST_STALE_MS } from "@/lib/search/constants";

export { settingsIntegrationsKeys } from "@/lib/http/settings-integrations";

export function useSettingsIntegrations() {
  return useQuery({
    queryKey: settingsIntegrationsKeys.all,
    queryFn: getSettingsIntegrations,
    staleTime: SEARCH_LIST_STALE_MS,
  });
}

export function useUpdateSettingsIntegrationsMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: IntegrationsConfig) => updateSettingsIntegrations(body),
    onSuccess: (data) => {
      if (data.config) {
        // Write updated config straight into cache
        qc.setQueryData(settingsIntegrationsKeys.all, (old: any) => ({
          ...old,
          config: data.config,
        }));
      }
    },
  });
}
