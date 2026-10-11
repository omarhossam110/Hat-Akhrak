import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { getSession } from "@/lib/auth/session";
import { AuthForm } from "@/components/auth-form";

export default async function SignupPage({
  searchParams,
}: PageProps<"/[locale]/signup">) {
  const { redirect: redirectParam, ref } = await searchParams;
  const redirectTo = typeof redirectParam === "string" ? redirectParam : undefined;
  const referralCode = typeof ref === "string" ? ref : undefined;

  const session = await getSession();
  if (session) {
    const locale = await getLocale();
    redirect(`/${locale}${redirectTo ?? "/deals"}`);
  }

  return (
    <div className="mx-auto max-w-[1180px] px-[22px] py-[30px]">
      <AuthForm mode="signup" redirectTo={redirectTo} referralCode={referralCode} />
    </div>
  );
}
