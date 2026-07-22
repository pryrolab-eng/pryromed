import { fetchJson } from "../client";

export const adminEmailTemplatesKeys = {
  all: ["admin", "email-templates"] as const,
};

export type EmailTemplate = {
  id: string;
  template_key: string;
  subject: string;
  html: string;
  text: string;
  is_active: boolean;
};

export type GetEmailTemplatesResponse = {
  templates: EmailTemplate[];
};

export type UpdateEmailTemplateInput = {
  templateKey: string;
  subject: string;
  html: string;
  text: string;
  isActive: boolean;
};

export type UpdateEmailTemplateResponse = {
  success: boolean;
  error?: string;
};

export async function getAdminEmailTemplates(): Promise<GetEmailTemplatesResponse> {
  return fetchJson<GetEmailTemplatesResponse>("/api/admin/email-templates");
}

export async function updateAdminEmailTemplate(
  body: UpdateEmailTemplateInput,
): Promise<UpdateEmailTemplateResponse> {
  return fetchJson<UpdateEmailTemplateResponse>("/api/admin/email-templates", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
