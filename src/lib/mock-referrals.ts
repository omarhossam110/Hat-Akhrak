/**
 * Placeholder data for the "Invite a friend" sharing feature until real
 * auth + Supabase queries are wired up (see `referral_code`/`referred_by`
 * on the `profiles` table in 0001_init.sql).
 *
 * No reward/credit mechanic yet — this is just a shareable invite
 * link/code and a simple status list for now. A reward (e.g. wallet
 * credit per successful referral) may be designed and added later once
 * the business rule is settled.
 */
export interface ReferralFriend {
  id: string;
  name: string;
  status: "invited" | "joined";
}

export interface ReferralProgram {
  code: string;
  friends: ReferralFriend[];
}

export const mockReferralProgram: ReferralProgram = {
  code: "OMAR-4821",
  friends: [
    { id: "f1", name: "محمود عادل", status: "joined" },
    { id: "f2", name: "ياسمين طارق", status: "joined" },
    { id: "f3", name: "كريم حسن", status: "joined" },
    { id: "f4", name: "سارة محمد", status: "invited" },
  ],
};
