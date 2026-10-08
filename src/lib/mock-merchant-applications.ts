/**
 * Placeholder data for merchant sign-up applications until real Supabase
 * auth + queries are wired up. Mirrors how Amazon/Noon-style marketplaces
 * actually onboard sellers: self-service signup, then a pending review
 * before the merchant becomes visible/verified (see is_verified on
 * `merchants` in 0001_init.sql) — never created directly by an admin.
 *
 * This is a module-level in-memory store, not a database: it persists for
 * as long as this server process stays running, but resets on
 * redeploy/restart and isn't shared across separate server instances.
 */
export interface MerchantApplication {
  id: string;
  businessName: string;
  ownerName: string;
  phone: string;
  email: string;
  taxId: string | null;
  status: "pending" | "rejected";
  submittedAt: string;
}

export const mockMerchantApplications: MerchantApplication[] = [
  {
    id: "app1",
    businessName: "المكتبة الذهبية",
    ownerName: "أحمد فتحي",
    phone: "01099988877",
    email: "ahmed@goldenlib.example",
    taxId: "123-456-789",
    status: "pending",
    submittedAt: new Date(Date.now() - 2 * 24 * 3600_000).toISOString(),
  },
];

export function addMerchantApplication(data: {
  businessName: string;
  ownerName: string;
  phone: string;
  email: string;
  taxId: string;
}): MerchantApplication {
  const application: MerchantApplication = {
    id: `app-${Date.now()}`,
    businessName: data.businessName,
    ownerName: data.ownerName,
    phone: data.phone,
    email: data.email,
    taxId: data.taxId || null,
    status: "pending",
    submittedAt: new Date().toISOString(),
  };
  mockMerchantApplications.push(application);
  return application;
}

export function getMerchantApplicationById(id: string) {
  return mockMerchantApplications.find((a) => a.id === id);
}

/** Removes an application once it's been approved (promoted into mockMerchants) or dismissed. */
export function removeMerchantApplication(id: string) {
  const index = mockMerchantApplications.findIndex((a) => a.id === id);
  if (index !== -1) mockMerchantApplications.splice(index, 1);
}

export function rejectMerchantApplication(id: string) {
  const application = getMerchantApplicationById(id);
  if (application) application.status = "rejected";
}
