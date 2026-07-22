import { fetchJson } from "./client";

export const settingsReportSchedulesKeys = {
  all: ["settings", "report-schedules"] as const,
};

export type ReportSchedule = {
  id: string;
  reportType: string;
  frequency: string;
  isActive: boolean;
  recipients: string[];
};

export type GetReportSchedulesResponse = {
  schedules: ReportSchedule[];
};

export type UpdateReportScheduleInput = {
  reportType: string;
  frequency: string;
  isActive: boolean;
  recipients: string[];
};

export type UpdateReportScheduleResponse = {
  success: boolean;
  error?: string;
  schedule?: ReportSchedule;
};

export async function getReportSchedules(): Promise<GetReportSchedulesResponse> {
  return fetchJson<GetReportSchedulesResponse>("/api/settings/report-schedules");
}

export async function updateReportSchedule(
  body: UpdateReportScheduleInput,
): Promise<UpdateReportScheduleResponse> {
  return fetchJson<UpdateReportScheduleResponse>(
    "/api/settings/report-schedules",
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
}
