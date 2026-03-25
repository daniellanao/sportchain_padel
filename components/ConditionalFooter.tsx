"use client";

import { usePathname } from "next/navigation";

import { Footer } from "@/components/Footer";

/** Hides footer on kiosk / TV routes that use the full viewport. */
export function ConditionalFooter() {
  const pathname = usePathname();
  if (pathname?.includes("/torneos/") && pathname.endsWith("/tv")) {
    return null;
  }
  return <Footer />;
}
