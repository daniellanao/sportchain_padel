"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";

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
    <header className="sticky top-0 z-50 border-b border-[#12305D]/10 bg-white/95 backdrop-blur-sm">
      <nav
        className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6"
        aria-label="Principal"
      >
        <Link href="/" className="logo shrink-0 text-[0.8125rem] leading-none text-[#12305D] sm:text-sm">
          SportChain <span className="font-semibold tracking-[0.06em] text-[#12305D]/65">Padel</span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`relative px-3 py-2 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] transition-colors ${
                    active ? "text-[#12305D]" : "text-[#12305D]/55 hover:text-[#12305D]"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                  {active ? (
                    <span
                      className="absolute inset-x-3 -bottom-[calc(0.5rem+1px)] h-0.5 bg-[#12305D]"
                      aria-hidden
                    />
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>

        <button
          type="button"
          className="flex h-10 w-10 shrink-0 items-center justify-center text-[#12305D] md:hidden"
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
        className={`overflow-hidden border-t border-[#12305D]/10 bg-white transition-[max-height] duration-200 ease-out md:hidden ${
          open ? "max-h-72" : "max-h-0 border-t-0"
        }`}
        aria-hidden={!open}
      >
        <ul className="mx-auto flex w-full max-w-6xl flex-col px-4 py-2 sm:px-6">
          {NAV_ITEMS.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`block border-l-2 px-3 py-3 text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${
                    active
                      ? "border-[#12305D] text-[#12305D]"
                      : "border-transparent text-[#12305D]/60 hover:text-[#12305D]"
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
