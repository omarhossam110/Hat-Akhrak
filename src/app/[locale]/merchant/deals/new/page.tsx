import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { AddDealForm } from "@/components/add-deal-form";
import { getSession } from "@/lib/auth/session";
import { getCategories } from "@/lib/actions/categories";

export default async function AddDealPage() {
  const locale = await getLocale();

  const session = await getSession();
  if (!session) {
    redirect(`/${locale}/login?redirect=${encodeURIComponent("/merchant/deals/new")}`);
  }
  if (session.role !== "merchant") {
    redirect(`/${locale}/`);
  }

  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-[1180px] px-[22px] py-[30px]">
      <AddDealForm categories={categories} />
    </div>
  );
}
