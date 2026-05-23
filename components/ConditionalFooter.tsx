"use client";

import { usePathname } from "next/navigation";

import { Footer } from "@/components/Footer";

/** Hides footer on kiosk / TV routes that use the full viewport. */
export function ConditionalFooter() {
  const pathname = usePathname();
  if (
    pathname?.includes("/torneos/") &&
    (pathname.endsWith("/tv") ||
      pathname.endsWith("/tvdark") ||
      pathname.endsWith("/tvdark2"))
  ) {
    return null;
  }
  return <Footer />;
}
