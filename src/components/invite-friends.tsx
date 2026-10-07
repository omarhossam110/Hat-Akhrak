"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { ReferralProgram } from "@/lib/mock-referrals";
import { WhatsAppShareButton } from "@/components/whatsapp-share-button";

const STATUS_STYLES: Record<string, string> = {
  invited: "bg-neutral-soft text-neutral",
  joined: "bg-info-soft text-info-text",
  rewarded: "bg-success-soft text-success",
};

export function InviteFriends({ program }: { program: ReferralProgram }) {
  const t = useTranslations();
  const locale = useLocale();
  const [copied, setCopied] = useState(false);
  // Avoid a hydration mismatch: the server has no window.location.origin,
  // so render the relative path first and fill in the full URL post-mount
  // (same pattern as the dark-mode toggle).
  const [link, setLink] = useState(`/${locale}/signup?ref=${program.code}`);

  useEffect(() => {
    setLink(`${window.location.origin}/${locale}/signup?ref=${program.code}`);
  }, [locale, program.code]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable — ignore, the link is still selectable/visible
    }
  }

  const statusLabel = (status: string) =>
    status === "rewarded"
      ? t("orders.friendStatusRewarded")
      : status === "joined"
        ? t("orders.friendStatusJoined")
        : t("orders.friendStatusInvited");

  return (
    <div className="mt-6 rounded-[22px] border border-line bg-surface p-[22px] shadow-[var(--shadow-card)]">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-[16px] font-bold tracking-tight">{t("orders.inviteTitle")}</h2>
        <span className="rounded-full bg-success-soft px-3 py-1.5 text-[11px] font-extrabold text-success">
          {program.walletCredit} {t("common.egp")} {t("orders.inviteCreditLabel")}
        </span>
      </div>
      <p className="mb-4 text-xs text-muted">
        {t("orders.inviteDesc", { amount: program.rewardPerReferral })}
      </p>

      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <div className="flex h-11 flex-1 min-w-[220px] items-center rounded-xl border border-line bg-paper px-3.5 text-xs font-bold text-ink">
          <span className="truncate font-sans">{link}</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="h-11 rounded-xl bg-brand px-4 text-xs font-black text-[#151515] transition hover:brightness-95"
        >
          {copied ? t("orders.copied") : t("orders.copyButton")}
        </button>
        <WhatsAppShareButton
          path={`/signup?ref=${program.code}`}
          message={t("orders.inviteShareMessage", { code: program.code })}
        />
      </div>

      <h3 className="mb-2 text-xs font-bold text-muted">{t("orders.inviteFriendsTitle")}</h3>
      <div className="flex flex-col gap-2">
        {program.friends.map((friend) => (
          <div
            key={friend.id}
            className="flex items-center justify-between rounded-xl border border-line px-3.5 py-2.5 text-xs"
          >
            <span className="font-bold">{friend.name}</span>
            <span className="flex items-center gap-2">
              {friend.rewardAmount && (
                <span className="font-sans text-[11px] font-bold text-success">
                  +{friend.rewardAmount} {t("common.egp")}
                </span>
              )}
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${STATUS_STYLES[friend.status]}`}
              >
                {statusLabel(friend.status)}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
