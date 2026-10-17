"use server";

import { BackendError, backendFetch } from "@/lib/backend/client";
import { getSessionToken } from "@/lib/auth/session";
import { postAction, type ActionState } from "@/lib/backend/post-action";

/** Merchant: "the customer refused this order at delivery". */
export async function reportRefusalAction(
  orderId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return postAction(
    "/disputes/refusal",
    { orderId, note: String(formData.get("note") ?? "").trim() },
    "/merchant/dashboard",
  );
}

/** Customer: "there's a problem with this order". */
export async function openComplaintAction(
  orderId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return postAction(
    "/disputes/complaint",
    { orderId, description: String(formData.get("description") ?? "").trim() },
    "/orders",
  );
}

/** Super admin rules on a dispute; shipping/return costs are entered per case. */
export async function resolveDisputeAction(
  disputeId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return postAction(
    `/disputes/${disputeId}/resolve`,
    {
      fault: String(formData.get("fault") ?? ""),
      shippingCost: Number(formData.get("shippingCost") || 0),
      returnCost: Number(formData.get("returnCost") || 0),
    },
    "/super-admin",
  );
}

/** Super admin: cancel a whole deal and refund every running deposit. */
export async function emergencyCancelAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const dealId = String(formData.get("dealId") ?? "");
  if (!dealId) return { error: "rejected", code: "no_deal" };
  return postAction(
    `/deals/${dealId}/emergency-cancel`,
    { reason: String(formData.get("reason") ?? "").trim() },
    "/super-admin",
  );
}

export type DisputeRow = {
  id: string;
  kind: "refusal" | "complaint";
  openedByRole: "customer" | "merchant";
  description: string;
  status: "open" | "resolved";
  resolution: "customer_at_fault" | "merchant_at_fault" | null;
  units: number;
  depositAmount: string;
  finalUnitPrice: string | null;
  dealTitle: string;
  merchantName: string;
  customerName: string;
  refundAmount: string | null;
  createdAt: string;
};

/** The super admin's dispute queue (open cases first-class, resolved for history). */
export async function getDisputes(): Promise<DisputeRow[]> {
  const token = await getSessionToken();
  if (!token) return [];
  try {
    return await backendFetch<DisputeRow[]>("/disputes", {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (err) {
    if (err instanceof BackendError) return [];
    return [];
  }
}
