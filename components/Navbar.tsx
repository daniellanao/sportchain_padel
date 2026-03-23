"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";

const navLinkClass =
  "navbar-text border-2 border-[var(--color-accent-gold)] bg-[var(--color-primary)] px-3 py-2 text-xs uppercase text-white transition hover:brightness-110 sm:px-4";

const mobileLinkClass =
  "navbar-text block w-full border-2 border-[var(--color-accent-gold)] bg-[var(--color-primary)] px-4 py-3 text-center text-xs uppercase text-white transition hover:brightness-110 active:brightness-95";

const loginDesktopClass =
  "navbar-text btn-gold border-2 border-[var(--color-accent-gold)] px-3 py-2 text-xs uppercase sm:px-4";

const loginMobileClass =
  "navbar-text btn-gold w-full border-2 border-[var(--color-accent-gold)] px-4 py-3 text-xs uppercase";

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
    <header className="relative z-50 border-b-4 border-[var(--color-primary)] bg-[rgba(11,31,59,0.95)] px-4 py-3 shadow-[0_6px_0_rgba(0,0,0,0.2)] sm:px-5 sm:py-4">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3" aria-label="Main">
        <Link
          href="/"
          className="logo min-w-0 max-w-[min(100%,15rem)] truncate text-xs leading-tight text-[var(--color-accent-gold)] sm:max-w-[min(100%,20rem)] sm:text-sm md:max-w-none md:text-base"
        >
          Padel Sportchain
        </Link>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-2 md:flex md:gap-3">
          <Link href="/" className={navLinkClass}>
            Inicio
          </Link>
          <Link href="/ranking" className={navLinkClass}>
            Ranking
          </Link>
          <Link href="/torneos" className={navLinkClass}>
            Torneos
          </Link>
          
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="flex h-11 w-11 shrink-0 items-center justify-center border-2 border-[var(--color-accent-gold)] bg-[var(--color-primary)] text-white md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={open ? "Close menu" : "Open menu"}
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

      {/* Mobile slide-down panel */}
      <div
        id={menuId}
        className={`mx-auto w-full max-w-6xl overflow-hidden transition-[max-height] duration-200 ease-out md:hidden ${
          open ? "max-h-[min(80vh,28rem)] border-t-2 border-[var(--color-accent-gold)]/50" : "max-h-0"
        }`}
        aria-hidden={!open}
      >
        <div className="flex flex-col gap-2 py-3">
          <Link href="/" className={mobileLinkClass} onClick={() => setOpen(false)}>
            Home
          </Link>
          <Link href="/ranking" className={mobileLinkClass} onClick={() => setOpen(false)}>
            Ranking
          </Link>
          <Link href="/torneos" className={mobileLinkClass} onClick={() => setOpen(false)}>
            Torneos
          </Link>        
        </div>
      </div>
    </header>
  );
}
