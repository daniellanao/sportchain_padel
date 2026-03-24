import Link from "next/link";

/**
 * Site-wide footer with brand colors.
 */
export function Footer() {
  return (
    <footer className="bg-[var(--color-primary)] py-4 text-center text-sm text-white/90">
      <div className="px-4">
        <p>© 2026 Sportchain</p>
        <p className="mt-1 text-xs text-white/70">
          <Link href="/admin" className="underline-offset-4 hover:underline">
            Admin
          </Link>
        </p>
      </div>
    </footer>
  );
}
