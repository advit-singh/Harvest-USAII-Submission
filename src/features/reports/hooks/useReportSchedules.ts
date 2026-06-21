"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createReportSchedule,
  deleteReportSchedule,
  fetchReportSchedules,
  updateReportSchedule,
} from "@/lib/api/report-schedules";
import { reportKeys } from "@/features/reports/config/report-keys";
import type {
  CreateReportSchedulePayload,
  UpdateReportSchedulePayload,
} from "@/types/report";

export function useReportSchedules(orgId: string) {
  return useQuery({
    queryKey: reportKeys.schedules(orgId),
    queryFn: () => fetchReportSchedules(orgId),
    enabled: Boolean(orgId),
  });
}

export function useCreateReportSchedule(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateReportSchedulePayload) => createReportSchedule(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: reportKeys.schedules(orgId) });
    },
  });
}

export function useUpdateReportSchedule(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      patch,
    }: {
      id: string;
      patch: UpdateReportSchedulePayload;
    }) => updateReportSchedule(id, orgId, patch),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: reportKeys.schedules(orgId) });
    },
  });
}

export function useDeleteReportSchedule(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteReportSchedule(id, orgId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: reportKeys.schedules(orgId) });
    },
  });
}
