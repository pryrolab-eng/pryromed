"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminEmailTemplatesKeys,
  getAdminEmailTemplates,
  updateAdminEmailTemplate,
  type UpdateEmailTemplateInput,
} from "@/lib/http/admin/email-templates";
import { SEARCH_LIST_STALE_MS } from "@/lib/search/constants";

export { adminEmailTemplatesKeys } from "@/lib/http/admin/email-templates";
export type { EmailTemplate } from "@/lib/http/admin/email-templates";

export function useAdminEmailTemplates() {
  return useQuery({
    queryKey: adminEmailTemplatesKeys.all,
    queryFn: getAdminEmailTemplates,
    staleTime: SEARCH_LIST_STALE_MS,
  });
}

export function useUpdateAdminEmailTemplateMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateEmailTemplateInput) =>
      updateAdminEmailTemplate(body),
    onSuccess: (_data, vars) => {
      // Optimistically update cached template list
      qc.setQueryData(adminEmailTemplatesKeys.all, (old: any) => {
        if (!old?.templates) return old;
        return {
          ...old,
          templates: old.templates.map((t: any) =>
            t.template_key === vars.templateKey
              ? {
                  ...t,
                  subject: vars.subject,
                  html: vars.html,
                  text: vars.text,
                  is_active: vars.isActive,
                }
              : t,
          ),
        };
      });
    },
  });
}
