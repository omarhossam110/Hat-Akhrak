import { AuthForm } from "@/components/auth-form";

export default async function LoginPage({
  searchParams,
}: PageProps<"/[locale]/login">) {
  const { redirect } = await searchParams;
  const redirectTo = typeof redirect === "string" ? redirect : undefined;

  return (
    <div className="mx-auto max-w-[1180px] px-[22px] py-[30px]">
      <AuthForm mode="login" redirectTo={redirectTo} />
    </div>
  );
}
