"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { AppNotification } from "@/lib/mock-notifications";

const KIND_ICON: Record<AppNotification["kind"], string> = {
  ending_soon: "⏱",
  order_status: "📦",
};

export function NotificationsBell({ notifications }: { notifications: AppNotification[] }) {
  const t = useTranslations();
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<string[]>([]);

  const unreadCount = notifications.filter((n) => !readIds.includes(n.id)).length;

  function markAllRead() {
    setReadIds(notifications.map((n) => n.id));
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
              {notifications.length > 0 && unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="text-[11px] font-bold text-brand"
                >
                  {t("notifications.markAllRead")}
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <p className="px-1 py-5 text-center text-xs text-muted">
                {t("notifications.empty")}
              </p>
            ) : (
              <div className="flex max-h-[360px] flex-col gap-1 overflow-y-auto">
                {notifications.map((n) => {
                  const isRead = readIds.includes(n.id);
                  return (
                    <Link
                      key={n.id}
                      href={n.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-start gap-2.5 rounded-xl p-2.5 text-start text-xs transition hover:bg-hover-soft ${
                        isRead ? "opacity-60" : ""
                      }`}
                    >
                      <span className="mt-0.5 text-sm" aria-hidden>
                        {KIND_ICON[n.kind]}
                      </span>
                      <span className="flex-1">
                        <span className="block leading-relaxed">
                          {t(n.titleKey, n.params)}
                        </span>
                        <span className="mt-0.5 block text-[10px] text-muted-2">
                          {new Date(n.createdAt).toLocaleTimeString(
                            locale === "ar" ? "ar-EG" : "en-US",
                            { hour: "2-digit", minute: "2-digit" }
                          )}
                        </span>
                      </span>
                      {!isRead && (
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
