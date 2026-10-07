import { AuthForm } from "@/components/auth-form";

export default async function SignupPage({
  searchParams,
}: PageProps<"/[locale]/signup">) {
  const { redirect, ref } = await searchParams;
  const redirectTo = typeof redirect === "string" ? redirect : undefined;
  const referralCode = typeof ref === "string" ? ref : undefined;

  return (
    <div className="mx-auto max-w-[1180px] px-[22px] py-[30px]">
      <AuthForm mode="signup" redirectTo={redirectTo} referralCode={referralCode} />
    </div>
  );
}
