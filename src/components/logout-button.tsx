import { logoutAction } from "@/lib/actions/auth";

/** Same slot/size as the other header icon buttons — a plain <form> with a
 * single submit button needs no client-side JS to call the Server Action. */
export function LogoutButton({ label }: { label: string }) {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="grid h-9 min-w-9 place-items-center rounded-xl border border-line bg-surface text-ink transition hover:border-hover-border hover:bg-hover-soft sm:h-[42px] sm:min-w-[42px]"
        aria-label={label}
        title={label}
      >
        🚪
      </button>
    </form>
  );
}
