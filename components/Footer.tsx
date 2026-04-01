import Link from "next/link";

/**
 * Site-wide footer with brand colors.
 */
export function Footer() {
  return (
    <footer className="bg-[var(--color-primary)] py-4 text-center text-sm text-white/90">
      <div className="px-4">
        <p>©2026 Sportchain</p>        
      </div>
    </footer>
  );
}
