import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/clubes", label: "Clubes" },
  { href: "/torneos", label: "Torneos" },
  { href: "/ranking", label: "Ranking" },
  { href: "/organizadores", label: "Organizadores" },
] as const;

/**
 * Site-wide footer with brand colors and secondary navigation.
 */
export function Footer() {
  return (
    <footer className="border-t border-[#12305D]/10 bg-[#12305D] text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <p className="logo text-xs text-white sm:text-sm">
            SportChain <span className="font-semibold tracking-[0.06em] text-white/70">Padel</span>
          </p>

          <nav aria-label="Pie de página">
            <ul className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-2">
              {FOOTER_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-white/70 transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <p className="text-xs text-white/50">© 2026 Sportchain</p>
      </div>
    </footer>
  );
}
