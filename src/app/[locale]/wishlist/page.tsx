import { getDeals } from "@/lib/actions/public-deals";
import { WishlistClient } from "@/components/wishlist-client";

// The deal list is now real (server-fetched below); which ids are saved is
// still client-only localStorage (no auth-scoped wishlist table yet — see
// src/lib/use-wishlist.ts) — so the id-filtering and rendering stay in a
// client component, same as before, just fed real deals instead of mock ones.
export default async function WishlistPage() {
  const deals = await getDeals();
  return <WishlistClient deals={deals} />;
}
