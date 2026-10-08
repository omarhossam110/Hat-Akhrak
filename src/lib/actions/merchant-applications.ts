"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import {
  addMerchantApplication,
  getMerchantApplicationById,
  removeMerchantApplication,
  rejectMerchantApplication,
} from "@/lib/mock-merchant-applications";
import { addMerchant } from "@/lib/mock-merchants";

/** Merchant self-signup: creates a pending application for the super admin to review. */
export async function submitMerchantApplicationAction(formData: FormData) {
  const businessName = String(formData.get("business_name") ?? "").trim();
  const ownerName = String(formData.get("owner_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const taxId = String(formData.get("tax_id") ?? "").trim();
  const locale = await getLocale();

  if (!businessName || !ownerName || !phone || !email) return;

  addMerchantApplication({ businessName, ownerName, phone, email, taxId });

  revalidatePath("/[locale]/super-admin", "page");
  redirect(`/${locale}/merchant/signup?submitted=1`);
}

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
