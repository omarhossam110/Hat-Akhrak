"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import {
  disableTwoFactorAction,
  enableTwoFactorAction,
  startTwoFactorSetupAction,
  verifyTwoFactorAction,
  type SetupState,
  type TwoFactorState,
} from "@/lib/actions/two-factor";

const inputClass =
  "h-11 w-full rounded-xl border border-line bg-surface px-3.5 text-center font-sans text-sm tracking-[0.2em] outline-none transition focus:border-brand";
const buttonClass =
  "h-11 rounded-xl bg-brand px-5 text-xs font-black text-[#151515] transition hover:brightness-95 disabled:opacity-60";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={buttonClass}>
      {label}
    </button>
  );
}

function ErrorLine({ error }: { error?: string }) {
  const t = useTranslations();
  if (!error) return null;
  return (
    <p role="alert" className="text-xs font-bold text-danger">
      {t(`twoFactor.error.${error}` as "twoFactor.error.generic")}
    </p>
  );
}

/** Login step 2. */
export function TwoFactorVerifyForm({ redirectTo }: { redirectTo?: string }) {
  const t = useTranslations();
  const [state, action] = useActionState<TwoFactorState, FormData>(
    verifyTwoFactorAction.bind(null, redirectTo),
    undefined,
  );
  return (
    <form action={action} className="flex flex-col gap-3">
      <input
        name="code"
        required
        autoFocus
        autoComplete="one-time-code"
        inputMode="text"
        maxLength={20}
        placeholder="123456"
        aria-label={t("twoFactor.codeLabel")}
        className={inputClass}
      />
      <ErrorLine error={state?.error} />
      <Submit label={t("twoFactor.verify")} />
      <p className="text-[11px] text-muted">{t("twoFactor.recoveryHint")}</p>
    </form>
  );
}

/**
 * The whole security card. The enable action swaps the session cookie, which
 * makes Next re-render the page with `enabled = true` — so the one-time
 * recovery codes have to live up here, above the part that switches, or they
 * would vanish the instant they're created.
 */
export function TwoFactorPanel({ enabled, codesLeft }: { enabled: boolean; codesLeft: number }) {
  const t = useTranslations();
  const [state, action] = useActionState<SetupState, FormData>(enableTwoFactorAction, undefined);

  if (state?.recoveryCodes) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-bold text-success">{t("twoFactor.enabledOk")}</p>
        <p className="text-xs text-muted">{t("twoFactor.saveCodes")}</p>
        <ul className="grid grid-cols-2 gap-2 font-sans text-sm" dir="ltr">
          {state.recoveryCodes.map((c) => (
            <li key={c} className="rounded-lg border border-line bg-paper px-3 py-2 text-center">
              {c}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (enabled) {
    return (
      <>
        <p className="mb-4 text-xs text-muted">{t("twoFactor.codesLeft", { count: codesLeft })}</p>
        <TwoFactorDisable />
      </>
    );
  }

  return <TwoFactorSetup state={state} action={action} />;
}

function TwoFactorSetup({
  state,
  action,
}: {
  state: SetupState;
  action: (formData: FormData) => void;
}) {
  const t = useTranslations();
  const [setup, setSetup] = useState<SetupState>(undefined);
  const [starting, setStarting] = useState(false);

  if (!setup || !("secret" in setup) || !setup.secret) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-xs text-muted">{t("twoFactor.intro")}</p>
        <button
          type="button"
          disabled={starting}
          className={buttonClass}
          onClick={async () => {
            setStarting(true);
            setSetup(await startTwoFactorSetupAction());
            setStarting(false);
          }}
        >
          {t("twoFactor.start")}
        </button>
        {setup && "error" in setup && <ErrorLine error={setup.error} />}
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-3">
      <p className="text-xs text-muted">{t("twoFactor.scan")}</p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={setup.qr} alt={t("twoFactor.qrAlt")} width={220} height={220} className="self-center rounded-lg bg-white" />
      <p className="text-center text-[11px] text-muted">
        {t("twoFactor.manualKey")}: <b className="font-sans tracking-wider" dir="ltr">{setup.secret}</b>
      </p>
      <input
        name="code"
        required
        autoComplete="one-time-code"
        inputMode="numeric"
        pattern="\d{6}"
        maxLength={6}
        placeholder="123456"
        aria-label={t("twoFactor.codeLabel")}
        className={inputClass}
      />
      <ErrorLine error={state?.error} />
      <Submit label={t("twoFactor.enable")} />
    </form>
  );
}

/** Security page, already enabled. */
export function TwoFactorDisable() {
  const t = useTranslations();
  const [state, action] = useActionState<TwoFactorState, FormData>(
    disableTwoFactorAction,
    undefined,
  );
  return (
    <form action={action} className="flex flex-col gap-3">
      <p className="text-xs text-muted">{t("twoFactor.disableHint")}</p>
      <input
        name="code"
        required
        autoComplete="one-time-code"
        maxLength={20}
        placeholder="123456"
        aria-label={t("twoFactor.codeLabel")}
        className={inputClass}
      />
      <ErrorLine error={state?.error} />
      <Submit label={t("twoFactor.disable")} />
    </form>
  );
}
