"use server";

import { revalidatePath } from "next/cache";
import {
  getMerchantApplicationById,
  removeMerchantApplication,
  rejectMerchantApplication,
} from "@/lib/mock-merchant-applications";
import { addMerchant } from "@/lib/mock-merchants";

// Merchant self-signup itself now lives in src/lib/actions/auth.ts
// (merchantSignupAction) — it calls the real backend and creates an
// actual login-capable account instead of just a mock "application" row.
//
// The approve/reject actions below are NOT wired to that yet: they still
// read/write the in-memory mock application list, which real merchant
// signups no longer populate. Super Admin's merchant-verification panel
// needs to be rebuilt against a real "list unverified merchants" backend
// endpoint (not built yet) before this file's actions mean anything again.

/** Super Admin approves a pending application: promotes it into the public merchant list. */
export async function approveMerchantApplicationAction(formData: FormData) {
  const id = String(formData.get("application_id") ?? "");
  const application = getMerchantApplicationById(id);
  if (!application) return;

  addMerchant(application.businessName);
  removeMerchantApplication(id);

  revalidatePath("/[locale]/super-admin", "page");
  revalidatePath("/[locale]/merchants", "page");
}

/** Super Admin rejects a pending application — it stays visible as "rejected", not deleted. */
export async function rejectMerchantApplicationAction(formData: FormData) {
  const id = String(formData.get("application_id") ?? "");
  rejectMerchantApplication(id);
  revalidatePath("/[locale]/super-admin", "page");
}
