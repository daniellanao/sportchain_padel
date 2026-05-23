import type { Metadata } from "next";
import { Montserrat } from "next/font/google";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const montserratBold = Montserrat({
  subsets: ["latin"],
  weight: "700",
  variable: "--font-montserrat-tv",
});

export default function TournamentTvDark2Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={`tvdark ${montserratBold.variable} ${montserratBold.className} fixed inset-0 z-50 flex min-h-[100dvh] w-full flex-col overflow-hidden font-bold [&_.navbar-text]:font-[family-name:var(--font-montserrat-tv)] [&_.navbar-text]:font-bold [&_.navbar-text]:tracking-wide`}
    >
      {children}
    </div>
  );
}
