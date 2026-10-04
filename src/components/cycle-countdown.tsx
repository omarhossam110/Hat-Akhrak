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
  // Start as null on both server and client — the real, time-sensitive value
  // is only ever computed client-side (after mount), so the server-rendered
  // HTML and the first client render always match. Computing it eagerly in
  // useState's initializer would make the server's snapshot (render time)
  // drift from the client's (hydration time) by a second or more, which is
  // exactly the hydration mismatch this previously caused.
  const [label, setLabel] = useState<string | null | "ended">(null);

  useEffect(() => {
    const tick = () => {
      const remaining = formatRemaining(new Date(endsAt).getTime() - Date.now(), t);
      setLabel(remaining ?? "ended");
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endsAt]);

  if (label === "ended") {
    return <span>{t("deals.cycleEnded")}</span>;
  }

  return (
    <span className="font-mono">
      {!compact && <>{t("deals.endsIn")} </>}
      {label ?? "--:--:--"}
    </span>
  );
}
