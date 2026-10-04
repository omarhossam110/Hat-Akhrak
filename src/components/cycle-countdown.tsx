"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

function formatRemaining(ms: number, t: (key: string) => string) {
  if (ms <= 0) return null;

  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // More than 24h left: coarse "Xd Yh" format.
  if (days >= 1) {
    return `${days}${t("deals.days")} ${hours}${t("deals.hours")}`;
  }

  // Final day: precise HH:MM:SS countdown.
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/** @param compact - omit the "Ends in" prefix, for use inside a small badge. */
export function CycleCountdown({
  endsAt,
  compact = false,
}: {
  endsAt: string;
  compact?: boolean;
}) {
  const t = useTranslations();
  const [label, setLabel] = useState<string | null>(() =>
    formatRemaining(new Date(endsAt).getTime() - Date.now(), t)
  );

  useEffect(() => {
    const tick = () =>
      setLabel(formatRemaining(new Date(endsAt).getTime() - Date.now(), t));

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endsAt]);

  if (!label) {
    return <span>{t("deals.cycleEnded")}</span>;
  }

  return (
    <span className="font-mono">
      {!compact && <>{t("deals.endsIn")} </>}
      {label}
    </span>
  );
}
