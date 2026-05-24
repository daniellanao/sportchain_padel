import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Navbar } from "@/components/Navbar";
import { isRemoteImageSrc } from "@/lib/image-remote";
import { fetchOrganizersListFromSupabase } from "@/lib/organizers/supabase-organizers";

const description =
  "Organizadores de pádel Sportchain: consulta el ranking de jugadores de cada organizador.";

export const metadata: Metadata = {
  title: "Organizadores",
  description,
  openGraph: {
    title: "Organizadores — Sportchain Padel",
    description,
    url: "/organizadores",
    locale: "es_ES",
  },
  alternates: {
    canonical: "/organizadores",
  },
};

export const revalidate = 60;

export default async function OrganizersPage() {
  const result = await fetchOrganizersListFromSupabase();
  const organizers = result.organizers;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-black uppercase text-[var(--color-primary)] sm:text-3xl">
          Organizadores
        </h1>
        <p className="mt-2 text-sm text-[color:var(--color-subtle-text)]">
          Ranking de jugadores por organizador.
        </p>

        {!result.ok ? (
          <p className="mt-4 rounded border-2 border-amber-600/60 bg-amber-950/20 px-4 py-3 text-sm text-amber-100">
            {result.error}
          </p>
        ) : null}

        <div className="mt-6 overflow-hidden border-4 border-[var(--color-primary)] shadow-[6px_6px_0_rgba(0,0,0,0.2)]">
          <table className="w-full table-fixed border-collapse text-left text-xs leading-tight">
            <thead>
              <tr className="border-b-4 border-[var(--color-primary)] bg-[var(--color-primary)] text-white">
                <th className="navbar-text w-[15%] px-2 py-1.5 text-center text-[10px] uppercase sm:px-2.5">
                  Logo
                </th>
                <th className="navbar-text w-[55%] px-2 py-1.5 text-[10px] uppercase sm:px-2.5">
                  Nombre
                </th>
                <th className="navbar-text w-[30%] px-2 py-1.5 text-[10px] uppercase sm:px-2.5">
                  Ranking
                </th>
              </tr>
            </thead>
            <tbody>
              {organizers.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="border-b border-[var(--color-muted)] bg-[var(--color-surface)] px-3 py-4 text-center text-xs text-[var(--color-subtle-text)] sm:px-4"
                  >
                    Aún no hay organizadores registrados.
                  </td>
                </tr>
              ) : (
                organizers.map((organizer, index) => (
                  <tr
                    key={organizer.id}
                    className={
                      index % 2 === 0
                        ? "border-b border-[var(--color-muted)] bg-[var(--color-muted)]/60"
                        : "border-b border-[var(--color-muted)] bg-[var(--color-surface)]"
                    }
                  >
                    <td className="w-[15%] px-2 py-2 text-center sm:px-2.5">
                      {organizer.image ? (
                        <Image
                          src={organizer.image}
                          alt={organizer.name}
                          width={40}
                          height={40}
                          className="mx-auto h-10 w-10 rounded-full border-2 border-[var(--color-primary)] object-cover"
                          unoptimized={isRemoteImageSrc(organizer.image)}
                        />
                      ) : (
                        <span
                          className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-sm font-bold uppercase text-[var(--color-primary)]"
                          aria-hidden
                        >
                          {organizer.name.charAt(0)}
                        </span>
                      )}
                    </td>
                    <td className="w-[55%] truncate px-2 py-2 font-medium text-[var(--color-foreground)] sm:px-2.5">
                      {organizer.name}
                    </td>
                    <td className="w-[30%] px-1.5 py-1.5 sm:px-2">
                      <Link
                        href={`/organizadores/${organizer.slug}`}
                        className="navbar-text btn-gold inline-flex min-h-[26px] w-full items-center justify-center whitespace-nowrap border-2 border-[var(--color-accent-gold)] px-2 py-0.5 text-[9px] uppercase leading-none shadow-[2px_2px_0_rgba(0,0,0,0.2)] transition hover:brightness-105 sm:text-[10px]"
                      >
                        Ver ranking
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
