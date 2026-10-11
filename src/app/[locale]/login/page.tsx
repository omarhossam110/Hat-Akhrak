import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { getSession } from "@/lib/auth/session";
import { AuthForm } from "@/components/auth-form";

export default async function LoginPage({
  searchParams,
}: PageProps<"/[locale]/login">) {
  const { redirect: redirectParam } = await searchParams;
  const redirectTo = typeof redirectParam === "string" ? redirectParam : undefined;

  const session = await getSession();
  if (session) {
    const locale = await getLocale();
    redirect(`/${locale}${redirectTo ?? "/deals"}`);
  }

  return (
    <div className="mx-auto max-w-[1180px] px-[22px] py-[30px]">
      <AuthForm mode="login" redirectTo={redirectTo} />
    </div>
  );
}
