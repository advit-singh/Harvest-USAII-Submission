import { apiClient } from "@/lib/api/client";
import {
  createMockRecipient,
  getMockRecipients,
} from "@/lib/mocks/rescue-fixtures";
import type { CreateRecipientPayload, Recipient } from "@/types/recipient";

export async function fetchRecipients(orgId: string): Promise<Recipient[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_API !== "false") {
    await new Promise((r) => setTimeout(r, 200));
    return getMockRecipients(orgId);
  }

  return apiClient<Recipient[]>(
    `/recipients?organizationId=${orgId}`,
  );
}

export async function createRecipient(
  orgId: string,
  payload: CreateRecipientPayload,
): Promise<Recipient> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_API !== "false") {
    await new Promise((r) => setTimeout(r, 300));
    return createMockRecipient(orgId, payload);
  }

  return apiClient<Recipient>("/recipients", {
    method: "POST",
    body: JSON.stringify({ ...payload, organizationId: orgId }),
  });
}
