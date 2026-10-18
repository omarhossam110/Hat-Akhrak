import { getDeals } from "@/lib/actions/public-deals";
import { WishlistClient } from "@/components/wishlist-client";

// Deals are server-fetched; which ids are saved comes from WishlistProvider
// (the customer's account list, or the browser-local list for guests), so
// the id-filtering stays in a client component.
export default async function WishlistPage() {
  const deals = await getDeals();
  return <WishlistClient deals={deals} />;
}
