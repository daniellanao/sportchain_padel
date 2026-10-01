import { faInstagram, faLinkedinIn, faXTwitter } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Montserrat } from "next/font/google";
import Image from "next/image";
import Link from "next/link";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: "700",
});

const FOOTER_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/clubes", label: "Clubes" },
  { href: "/torneos", label: "Torneos" },
  { href: "/ranking", label: "Ranking" },
  { href: "/organizadores", label: "Organizadores" },
] as const;

const SOCIAL_LINKS = [
  { href: "https://www.instagram.com/sportchain.io", label: "Instagram", icon: faInstagram },
  { href: "https://www.linkedin.com/company/sportchain-io", label: "LinkedIn", icon: faLinkedinIn },
  { href: "https://x.com/sportchain_io", label: "X", icon: faXTwitter },
] as const;

/**
 * Site-wide footer, same look as the navbar: black, white Montserrat, centered.
 */
export function Footer() {
  return (
    <footer className={`${montserrat.className} bg-black font-bold text-white`}>
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-4 py-10 text-center sm:px-6">
        <Link href="/" aria-label="SportChain Padel — Inicio">
          <Image src="/sportchain_isotipo.png" alt="SportChain Padel" width={36} height={36} className="h-9 w-9" />
        </Link>

        <nav aria-label="Pie de página">
          <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {FOOTER_LINKS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm uppercase tracking-[0.06em] text-white/70 transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <ul className="flex items-center justify-center gap-5">
          {SOCIAL_LINKS.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.label}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/70 transition-colors hover:border-white hover:text-white"
              >
                <FontAwesomeIcon icon={item.icon} className="h-4 w-4" aria-hidden />
              </a>
            </li>
          ))}
        </ul>

        <p className="text-xs font-normal text-white/50">© 2026 SportChain</p>
      </div>
    </footer>
  );
}
