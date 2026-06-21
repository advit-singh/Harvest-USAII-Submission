import { emitNotification } from "./notification-service";
import type { NotificationType } from "@/types/notification";

export async function notifyUploadCompleted(params: {
  organizationId: string;
  userId: string;
  uploadId: string;
  fileName: string;
}) {
  return emitNotification({
    organizationId: params.organizationId,
    userId: params.userId,
    type: "upload.completed",
    title: "Upload processed",
    message: `${params.fileName} was approved and committed to operational data.`,
    href: `/uploads?tab=history&id=${params.uploadId}`,
    createdBy: params.userId,
  });
}

export async function notifyForecastGenerated(params: {
  organizationId: string;
  userId: string;
}) {
  return emitNotification({
    organizationId: params.organizationId,
    userId: params.userId,
    type: "forecast.generated",
    title: "Forecasts updated",
    message: "New forecasts are available for your organization.",
    href: "/predictions?tab=explorer",
    createdBy: params.userId,
  });
}

export async function notifyReportGenerated(params: {
  organizationId: string;
  userId: string;
  reportId: string;
  templateName: string;
}) {
  return emitNotification({
    organizationId: params.organizationId,
    userId: params.userId,
    type: "report.generated",
    title: "Report ready",
    message: `${params.templateName} is ready to download.`,
    href: `/reports?tab=generated&id=${params.reportId}`,
    createdBy: params.userId,
  });
}

export async function notifyRecommendationCreated(params: {
  organizationId: string;
  userId: string;
  recommendationId: string;
  title: string;
}) {
  return emitNotification({
    organizationId: params.organizationId,
    userId: params.userId,
    type: "recommendation.created",
    title: "New recommendation",
    message: params.title,
    href: `/predictions?tab=recommendations&id=${params.recommendationId}`,
    createdBy: params.userId,
  });
}

export async function notifyDonationCompleted(params: {
  organizationId: string;
  userId: string;
  donationId: string;
}) {
  return emitNotification({
    organizationId: params.organizationId,
    userId: params.userId,
    type: "donation.completed",
    title: "Donation completed",
    message: "A rescue donation was successfully completed.",
    href: `/rescue?tab=history&id=${params.donationId}`,
    createdBy: params.userId,
  });
}

export async function notifyValidationWarning(params: {
  organizationId: string;
  userId: string;
  uploadId: string;
  message: string;
}) {
  return emitNotification({
    organizationId: params.organizationId,
    userId: params.userId,
    type: "validation.warning",
    title: "Validation warning",
    message: params.message,
    href: `/uploads?tab=validation&uploadId=${params.uploadId}`,
    createdBy: params.userId,
  });
}

export type { NotificationType };
