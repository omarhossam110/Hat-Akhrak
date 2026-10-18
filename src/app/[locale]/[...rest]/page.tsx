import { notFound } from "next/navigation";

// Any unknown URL under a locale lands here and is turned into a 404, so the
// branded not-found page renders inside the normal header/footer layout
// (instead of Next's bare default page).
export default function CatchAll() {
  notFound();
}
