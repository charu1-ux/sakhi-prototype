"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { featureHome } from "@/lib/sakhi-feature";

/**
 * Root ("/") entry for an isolated single-feature build: client-redirects into
 * the feature so the short share URL (e.g. /sakhi-period/) lands the user
 * straight in the tracker. Static export can't do server redirects, so this
 * runs on load. Renders nothing (a blank flash before the feature paints).
 */
export function SakhiRedirect() {
  const router = useRouter();
  useEffect(() => {
    if (featureHome) router.replace(featureHome);
  }, [router]);
  return null;
}
