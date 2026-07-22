"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getReportSchedules,
  settingsReportSchedulesKeys,
  updateReportSchedule,
  type UpdateReportScheduleInput,
} from "@/lib/http/settings-report-schedules";
import { SEARCH_LIST_STALE_MS } from "@/lib/search/constants";

export { settingsReportSchedulesKeys } from "@/lib/http/settings-report-schedules";

export function useReportSchedules() {
  return useQuery({
    queryKey: settingsReportSchedulesKeys.all,
    queryFn: getReportSchedules,
    staleTime: SEARCH_LIST_STALE_MS,
  });
}

export function useUpdateReportScheduleMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateReportScheduleInput) => updateReportSchedule(body),
    onSuccess: (data) => {
      if (data.schedule) {
        qc.setQueryData(settingsReportSchedulesKeys.all, (old: any) => ({
          ...old,
          schedules: old?.schedules?.map((s: any) =>
            s.reportType === data.schedule!.reportType ? data.schedule : s,
          ) ?? [data.schedule],
        }));
      }
    },
  });
}
