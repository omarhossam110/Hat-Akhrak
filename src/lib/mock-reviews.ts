/**
 * Placeholder data for per-deal reviews until a real Supabase `reviews`
 * table is connected. Keyed to deal ids from src/lib/mock-deals.ts.
 *
 * This is a module-level in-memory store, not a database: it resets on
 * restart and isn't shared across separate server instances — good enough
 * for a prototype, same pattern as mock-categories.ts / mock-merchant-applications.ts.
 */
export interface Review {
  id: string;
  dealId: string;
  customerName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  createdAt: string;
}

const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString();

export const mockReviews: Review[] = [
  {
    id: "r1",
    dealId: "d1",
    customerName: "محمود عادل",
    rating: 5,
    comment: "جودة الصوت ممتازة والتوصيل كان سريع، هشارك في عروض تانية بالتأكيد.",
    createdAt: daysAgo(6),
  },
  {
    id: "r2",
    dealId: "d1",
    customerName: "ياسمين طارق",
    rating: 4,
    comment: "كويسة بس البطارية كنت متوقعة تدوم أكتر شوية.",
    createdAt: daysAgo(3),
  },
  {
    id: "r3",
    dealId: "d2",
    customerName: "كريم حسن",
    rating: 5,
    comment: "الطقم شكله فخم وجودة التصنيع عالية، يستحق السعر فعلاً.",
    createdAt: daysAgo(10),
  },
  {
    id: "r4",
    dealId: "d5",
    customerName: "سارة محمد",
    rating: 3,
    comment: "المقاس جاء أصغر شوية من المتوقع، لازم تطلب مقاس أكبر.",
    createdAt: daysAgo(1),
  },
];

export function getReviewsByDealId(dealId: string): Review[] {
  return mockReviews
    .filter((r) => r.dealId === dealId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getAverageRating(dealId: string): { average: number; count: number } {
  const reviews = getReviewsByDealId(dealId);
  if (reviews.length === 0) return { average: 0, count: 0 };
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return { average: Math.round((sum / reviews.length) * 10) / 10, count: reviews.length };
}

export function addReview(data: {
  dealId: string;
  customerName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
}): Review {
  const review: Review = {
    id: `r${Date.now()}`,
    dealId: data.dealId,
    customerName: data.customerName,
    rating: data.rating,
    comment: data.comment,
    createdAt: new Date().toISOString(),
  };
  mockReviews.unshift(review);
  return review;
}
