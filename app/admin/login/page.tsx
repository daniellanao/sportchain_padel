import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { adminLoginAction, isAdminSessionValid } from "@/app/admin/actions";
import { isAdminConfigured } from "@/lib/admin/session";

export const metadata: Metadata = {
  title: "Iniciar sesión",
};

type PageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminLoginPage({ searchParams }: PageProps) {
  const ok = await isAdminSessionValid();
  if (ok) redirect("/admin");

  const { error } = await searchParams;
  const showError = error === "1";
  const configured = isAdminConfigured();

  return (
    <div className="w-full max-w-sm rounded-xl border border-foreground/10 bg-surface p-8 shadow-lg">
      <h1 className="logo mb-1 text-center text-xl text-primary">Admin</h1>
      <p className="mb-6 text-center text-sm text-[color:var(--color-subtle-text)]">
        Acceso restringido
      </p>

      {!configured ? (
        <p className="rounded-lg bg-muted px-3 py-2 text-sm text-foreground">
          Configura{" "}
          <code className="rounded bg-background/80 px-1 py-0.5 font-mono text-xs">
            ADMIN_PASSWORD
          </code>{" "}
          y{" "}
          <code className="rounded bg-background/80 px-1 py-0.5 font-mono text-xs">
            ADMIN_SESSION_SECRET
          </code>{" "}
          en{" "}
          <code className="rounded bg-background/80 px-1 py-0.5 font-mono text-xs">
            .env.local
          </code>
          .
        </p>
      ) : (
        <form action={adminLoginAction} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Contraseña
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="rounded-lg border border-foreground/15 bg-background px-3 py-2 text-foreground outline-none ring-primary/40 focus:ring-2"
            />
          </label>
          {showError ? (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              Contraseña incorrecta.
            </p>
          ) : null}
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Entrar
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm">
        <Link href="/" className="text-primary underline-offset-4 hover:underline">
          Volver al sitio
        </Link>
      </p>
    </div>
  );
}
