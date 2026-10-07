/**
 * Placeholder data for the "Invite a friend" referral program until real
 * auth + Supabase queries are wired up (see `referral_code`/`referred_by`/
 * `wallet_credit` on the `profiles` table in 0001_init.sql).
 *
 * Business rule (new, not in the original spec — a reasonable default
 * picked for this feature): a referrer earns `rewardPerReferral` EGP of
 * wallet credit once a friend they invited completes their first paid
 * order. The credit can be applied toward a future deposit at checkout.
 */
export interface ReferralFriend {
  id: string;
  name: string;
  status: "invited" | "joined" | "rewarded";
  rewardAmount: number | null;
}

export interface ReferralProgram {
  code: string;
  rewardPerReferral: number;
  walletCredit: number;
  friends: ReferralFriend[];
}

export const mockReferralProgram: ReferralProgram = {
  code: "OMAR-4821",
  rewardPerReferral: 50,
  walletCredit: 100,
  friends: [
    { id: "f1", name: "محمود عادل", status: "rewarded", rewardAmount: 50 },
    { id: "f2", name: "ياسمين طارق", status: "rewarded", rewardAmount: 50 },
    { id: "f3", name: "كريم حسن", status: "joined", rewardAmount: null },
    { id: "f4", name: "سارة محمد", status: "invited", rewardAmount: null },
  ],
};
