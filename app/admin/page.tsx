import type { Metadata } from "next";
import Link from "next/link";
import { Press_Start_2P } from "next/font/google";
import { redirect } from "next/navigation";

import { isAdminSessionValid } from "@/app/admin/actions";
import { AdminNavbar } from "@/components/admin/AdminNavbar";

const pixel = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Panel",
};

const pixelBtn =
  "flex min-h-0 min-w-0 flex-1 items-center justify-center rounded-none border-4 border-[var(--color-primary)] px-1 py-5 text-center text-[0.55rem] leading-snug uppercase tracking-wide text-[var(--color-primary)] shadow-[5px_5px_0_var(--color-primary)] transition hover:brightness-[1.03] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_var(--color-primary)] sm:gap-1 sm:py-8 sm:text-xs";

export default async function AdminHomePage() {
  const ok = await isAdminSessionValid();
  if (!ok) redirect("/admin/login");

  return (
    <div className="flex w-full flex-col">
      <AdminNavbar />

      <div
        className={`mx-auto flex w-full max-w-sm flex-row gap-3 px-4 py-8 sm:max-w-md sm:gap-4 ${pixel.className}`}
      >
        <Link href="/admin/tournaments" className={`${pixelBtn} bg-[var(--color-accent-gold)]`}>
          Torneos
        </Link>
        <Link href="/admin/players" className={`${pixelBtn} bg-[var(--color-muted)]`}>
          Jugadores
        </Link>
      </div>
    </div>
  );
}
