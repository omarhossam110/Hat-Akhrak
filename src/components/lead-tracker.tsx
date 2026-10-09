"use client";

import { useEffect } from "react";
import { trackMetaEvent } from "@/lib/meta-pixel";

/** Fires a Meta Pixel Lead event once when a confirmation page mounts. */
export function LeadTracker() {
  useEffect(() => {
    trackMetaEvent("Lead");
  }, []);

  return null;
}
