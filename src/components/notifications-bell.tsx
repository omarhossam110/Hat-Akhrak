"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { AppNotification } from "@/lib/mock-notifications";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
  type BackendNotification,
} from "@/lib/actions/notifications";

const TYPE_META: Record<string, { href: string; icon: string }> = {
  cycle_succeeded: { href: "/orders", icon: "🎉" },
  cycle_failed: { href: "/orders", icon: "↩️" },
  order_delivered: { href: "/orders", icon: "📦" },
  dispute_resolved: { href: "/orders", icon: "⚖️" },
  deal_cancelled_refund: { href: "/orders", icon: "↩️" },
  merchant_cycle_succeeded: { href: "/merchant/dashboard", icon: "🎉" },
  merchant_cycle_failed: { href: "/merchant/dashboard", icon: "⚠️" },
  merchant_deal_held: { href: "/merchant/dashboard", icon: "📉" },
  merchant_failed_streak: { href: "/merchant/dashboard", icon: "🚨" },
  merchant_ready_to_deliver: { href: "/merchant/dashboard", icon: "🚚" },
  merchant_dispute_opened: { href: "/merchant/dashboard", icon: "⚠️" },
  merchant_dispute_resolved: { href: "/merchant/dashboard", icon: "⚖️" },
  merchant_deal_cancelled: { href: "/merchant/dashboard", icon: "⛔" },
  admin_dispute_opened: { href: "/super-admin", icon: "⚖️" },
};

interface Item {
  id: string;
  icon: string;
  href: string;
  text: string;
  createdAt: string;
  stored: boolean;
  read: boolean;
}

export function NotificationsBell({
  derived,
  stored,
}: {
  derived: AppNotification[];
  stored: BackendNotification[];
}) {
  const t = useTranslations();
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<string[]>([]);

  const items: Item[] = [
    ...stored
      .filter((n) => TYPE_META[n.type])
      .map((n) => {
        const title = String(
          (locale === "ar" ? n.data.title : n.data.titleEn ?? n.data.title) ?? "",
        );
        return {
          id: n.id,
          icon: TYPE_META[n.type].icon,
          href: TYPE_META[n.type].href,
          text: t(`notifications.types.${n.type}`, { title }),
          createdAt: n.createdAt,
          stored: true,
          read: n.readAt !== null,
        };
      }),
    ...derived.map((n) => ({
      id: n.id,
      icon: "⏱",
      href: n.href,
      text: t(n.titleKey, n.params),
      createdAt: n.createdAt,
      stored: false,
      read: false,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const isRead = (n: Item) => n.read || readIds.includes(n.id);
  const unreadCount = items.filter((n) => !isRead(n)).length;

  function markRead(n: Item) {
    if (isRead(n)) return;
    setReadIds((ids) => [...ids, n.id]);
    if (n.stored) void markNotificationReadAction(n.id);
  }

  function markAllRead() {
    setReadIds(items.map((n) => n.id));
    void markAllNotificationsReadAction();
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("notifications.title")}
        aria-expanded={open}
        className="relative grid h-9 min-w-9 place-items-center rounded-xl border border-line bg-surface text-ink transition hover:border-hover-border hover:bg-hover-soft sm:h-[42px] sm:min-w-[42px]"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -end-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-danger px-1 font-sans text-[10px] font-extrabold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute end-0 top-[calc(100%+8px)] z-50 w-[320px] rounded-[18px] border border-line bg-surface p-3 shadow-[var(--shadow-card-lg)]">
            <div className="mb-2 flex items-center justify-between px-1">
              <b className="text-xs font-extrabold">{t("notifications.title")}</b>
              {items.length > 0 && unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="text-[11px] font-bold text-brand"
                >
                  {t("notifications.markAllRead")}
                </button>
              )}
            </div>

            {items.length === 0 ? (
              <p className="px-1 py-5 text-center text-xs text-muted">
                {t("notifications.empty")}
              </p>
            ) : (
              <div className="flex max-h-[360px] flex-col gap-1 overflow-y-auto">
                {items.map((n) => {
                  const read = isRead(n);
                  return (
                    <Link
                      key={n.id}
                      href={n.href}
                      onClick={() => {
                        markRead(n);
                        setOpen(false);
                      }}
                      className={`flex items-start gap-2.5 rounded-xl p-2.5 text-start text-xs transition hover:bg-hover-soft ${
                        read ? "opacity-60" : ""
                      }`}
                    >
                      <span className="mt-0.5 text-sm" aria-hidden>
                        {n.icon}
                      </span>
                      <span className="flex-1">
                        <span className="block leading-relaxed">
                          {n.text}
                        </span>
                        <span className="mt-0.5 block text-[10px] text-muted-2">
                          {new Date(n.createdAt).toLocaleTimeString(
                            locale === "ar" ? "ar-EG" : "en-US",
                            { hour: "2-digit", minute: "2-digit" }
                          )}
                        </span>
                      </span>
                      {!read && (
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand" />
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
