import type { Metadata } from "next";

import { Hero } from "@/components/Hero";
import { HomeRankingSection } from "@/components/HomeRankingSection";
import { Navbar } from "@/components/Navbar";
import { SportchainAbout } from "@/components/SportchainAbout";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site-config";

export const revalidate = 60;

export const metadata: Metadata = {
  title: { absolute: SITE_NAME },
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: "/",
    locale: "es_ES",
  },
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main>
        <Hero />
        
        <HomeRankingSection />
        <div className="mx-auto max-w-6xl px-4 pb-4 pt-8 sm:px-6 sm:pt-10">
          <SportchainAbout />
        </div>
      </main>
    </div>
  );
}
