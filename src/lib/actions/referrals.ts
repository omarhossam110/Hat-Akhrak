"use server";

import { backendFetch } from "@/lib/backend/client";
import { getSessionToken } from "@/lib/auth/session";

export type ReferralProgram = {
  code: string;
  joinedCount: number;
  friends: { id: string; name: string; joinedAt: string }[];
};

/** The signed-in user's real invite code and the friends who joined with it. */
export async function getReferrals(): Promise<ReferralProgram | null> {
  const token = await getSessionToken();
  if (!token) return null;
  try {
    return await backendFetch<ReferralProgram>("/referrals/mine", {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    return null;
  }
}
