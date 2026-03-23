import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { adminLogoutAction, isAdminSessionValid } from "@/app/admin/actions";

export const metadata: Metadata = {
  title: "Panel",
};

export default async function AdminHomePage() {
  const ok = await isAdminSessionValid();
  if (!ok) redirect("/admin/login");

  return (
    <div className="w-full max-w-lg rounded-xl border border-foreground/10 bg-surface p-8 shadow-lg">
      <h1 className="logo mb-2 text-center text-xl text-primary">Panel admin</h1>
      <p className="mb-6 text-center text-sm text-[color:var(--color-subtle-text)]">
        Sesión iniciada. Aquí podrás gestionar datos más adelante.
      </p>
      <form action={adminLogoutAction}>
        <button
          type="submit"
          className="w-full rounded-lg border border-foreground/20 bg-background px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted"
        >
          Cerrar sesión
        </button>
      </form>
      <p className="mt-6 text-center text-sm">
        <Link href="/" className="text-primary underline-offset-4 hover:underline">
          Volver al sitio
        </Link>
      </p>
    </div>
  );
}
