"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import type { MockDealCard } from "@/lib/mock-deals";
import type { Category } from "@/lib/types/database";
import { DealCard } from "@/components/deal-card";

type TimeSort = "newest" | "oldest";
type BuyersSort = "most" | "fewest";

const selectClasses =
  "h-11 min-w-[160px] rounded-xl border border-line bg-surface px-3.5 text-xs font-bold text-foreground outline-none transition focus:border-brand";

export function DealsExplorer({
  deals,
  categories,
}: {
  deals: MockDealCard[];
  categories: Category[];
}) {
  const t = useTranslations();
  const locale = useLocale();

  const [categoryId, setCategoryId] = useState<string>("all");
  const [timeSort, setTimeSort] = useState<TimeSort>("newest");
  const [buyersSort, setBuyersSort] = useState<BuyersSort | "none">("none");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const currentPrice = (card: MockDealCard) => {
    const activeTier = card.cycle.final_tier_reached
      ? card.tiers.find((tr) => tr.tier_number === card.cycle.final_tier_reached)
      : card.tiers[0];
    return (activeTier ?? card.tiers[0]).price_per_unit;
  };

  const visibleDeals = useMemo(() => {
    let result = deals;

    if (categoryId !== "all") {
      result = result.filter((card) => card.deal.category_id === categoryId);
    }

    const min = Number(minPrice);
    const max = Number(maxPrice);
    if (minPrice !== "" && !Number.isNaN(min)) {
      result = result.filter((card) => currentPrice(card) >= min);
    }
    if (maxPrice !== "" && !Number.isNaN(max)) {
      result = result.filter((card) => currentPrice(card) <= max);
    }

    result = [...result];

    if (buyersSort !== "none") {
      result.sort((a, b) =>
        buyersSort === "most"
          ? b.cycle.units_sold - a.cycle.units_sold
          : a.cycle.units_sold - b.cycle.units_sold
      );
    } else {
      result.sort((a, b) => {
        const aTime = new Date(a.deal.created_at).getTime();
        const bTime = new Date(b.deal.created_at).getTime();
        return timeSort === "newest" ? bTime - aTime : aTime - bTime;
      });
    }

    return result;
  }, [deals, categoryId, timeSort, buyersSort, minPrice, maxPrice]);

  return (
    <div>
      <div className="mt-7 flex flex-wrap gap-2.5">
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className={selectClasses}
          aria-label={t("deals.filters.categoryLabel")}
        >
          <option value="all">{t("deals.filters.categoryAll")}</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {locale === "ar" ? cat.name_ar : cat.name_en}
            </option>
          ))}
        </select>

        <select
          value={timeSort}
          onChange={(e) => {
            setTimeSort(e.target.value as TimeSort);
            setBuyersSort("none");
          }}
          className={selectClasses}
          aria-label={t("deals.filters.timeLabel")}
        >
          <option value="newest">{t("deals.filters.timeNewest")}</option>
          <option value="oldest">{t("deals.filters.timeOldest")}</option>
        </select>

        <select
          value={buyersSort}
          onChange={(e) => setBuyersSort(e.target.value as BuyersSort | "none")}
          className={selectClasses}
          aria-label={t("deals.filters.buyersLabel")}
        >
          <option value="none">{t("deals.filters.buyersLabel")}</option>
          <option value="most">{t("deals.filters.buyersMost")}</option>
          <option value="fewest">{t("deals.filters.buyersFewest")}</option>
        </select>

        <div className="flex h-11 items-center gap-1.5 rounded-xl border border-line bg-surface px-3">
          <span className="text-[11px] font-bold text-muted">{t("deals.filters.priceLabel")}</span>
          <input
            type="number"
            min={0}
            inputMode="numeric"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder={t("deals.filters.priceMin")}
            aria-label={t("deals.filters.priceMin")}
            className="w-[70px] bg-transparent text-xs font-sans outline-none"
          />
          <span className="text-muted-2">–</span>
          <input
            type="number"
            min={0}
            inputMode="numeric"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder={t("deals.filters.priceMax")}
            aria-label={t("deals.filters.priceMax")}
            className="w-[70px] bg-transparent text-xs font-sans outline-none"
          />
        </div>
      </div>

      {visibleDeals.length === 0 ? (
        <p className="mt-10 text-center text-sm text-muted">{t("deals.filters.noResults")}</p>
      ) : (
        <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleDeals.map((card) => (
            <DealCard key={card.deal.id} card={card} />
          ))}
        </div>
      )}
    </div>
  );
}
