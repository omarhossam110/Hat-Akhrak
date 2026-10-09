"use client";

import { useEffect } from "react";
import { trackMetaEvent } from "@/lib/meta-pixel";

/** Fires a Meta Pixel ViewContent event once when a deal page is viewed. */
export function ViewContentTracker({
  dealId,
  title,
  value,
}: {
  dealId: string;
  title: string;
  value: number;
}) {
  useEffect(() => {
    trackMetaEvent("ViewContent", {
      content_ids: dealId,
      content_name: title,
      content_type: "product",
      value,
      currency: "EGP",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fire once per deal id
  }, [dealId]);

  return null;
}
