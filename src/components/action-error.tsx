"use client";

import { useTranslations } from "next-intl";
import type { ActionState } from "@/lib/backend/post-action";

/** Shows a failed action's message: a translated one when the backend gave a
 * stable code we know (under `<ns>.errors.<code>`), otherwise a generic line. */
export function ActionError({
  state,
  ns,
  known,
}: {
  state: ActionState;
  ns: string;
  known: string[];
}) {
  const t = useTranslations();
  if (!state || !("error" in state)) return null;
  const text =
    state.error === "rejected" && state.code && known.includes(state.code)
      ? t(`${ns}.errors.${state.code}` as "orders.errorAction")
      : t("common.errorAction");
  return <span className="text-[10px] font-bold text-danger">{text}</span>;
}
