"use client";

import { Montserrat } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: "700",
});

const NAV_ITEMS = [
  { href: "/", label: "Inicio" },
  { href: "/clubes", label: "Clubes" },
  { href: "/torneos", label: "Torneos" },
  { href: "/ranking", label: "Ranking" },
] as const;

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className={`${montserrat.className} sticky top-0 z-50 bg-black font-bold text-white`}>
      <nav
        className="relative mx-auto flex h-14 w-full max-w-6xl items-center justify-center gap-12 px-4 sm:px-6"
        aria-label="Principal"
      >
        <Link href="/" className="shrink-0" aria-label="SportChain Padel — Inicio">
          <Image
            src="/sportchain_isotipo.png"
            alt="SportChain Padel"
            width={28}
            height={28}
            priority
            className="h-7 w-7"
          />
        </Link>

        <ul className="hidden items-center gap-10 md:flex">
          {NAV_ITEMS.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`py-2 text-sm uppercase tracking-[0.06em] transition-colors ${
                    active ? "text-white" : "text-white/70 hover:text-white"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <button
          type="button"
          className="absolute right-4 flex h-10 w-10 items-center justify-center text-white md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
        >
          {open ? (
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
              <path
                fill="currentColor"
                d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
              />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
              <path fill="currentColor" d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
            </svg>
          )}
        </button>
      </nav>

      <div
        id={menuId}
        className={`overflow-hidden border-t border-white/10 bg-black transition-[max-height] duration-200 ease-out md:hidden ${
          open ? "max-h-72" : "max-h-0 border-t-0"
        }`}
        aria-hidden={!open}
      >
        <ul className="mx-auto flex w-full max-w-6xl flex-col items-center py-2">
          {NAV_ITEMS.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`block px-3 py-3 text-sm uppercase tracking-[0.06em] transition-colors ${
                    active ? "text-white" : "text-white/70 hover:text-white"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </header>
  );
}
