import {
  faHandshake,
  faRightFromBracket,
  faTrophy,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

import { adminLogoutAction } from "@/app/admin/actions";

const itemClass =
  "navbar-text flex min-h-0 flex-1 items-center justify-center gap-1 px-1 py-1.5 text-[10px] font-bold uppercase leading-none tracking-wide text-white transition hover:bg-blue-800/90 sm:gap-1.5 sm:px-2 sm:text-xs";

export function AdminNavbar() {
  return (
    <nav
      aria-label="Administracion"
      className="sticky top-0 z-20 flex w-full overflow-hidden bg-primary shadow-md"
    >
      <Link href="/admin/tournaments" className={`${itemClass} border-r border-white/15`}>
        <FontAwesomeIcon icon={faTrophy} className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" aria-hidden />
        <span className="truncate">Torneos</span>
      </Link>
      <Link href="/admin/matches" className={`${itemClass} border-r border-white/15`}>
        <FontAwesomeIcon icon={faHandshake} className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" aria-hidden />
        <span className="truncate">Partidos</span>
      </Link>
      <Link href="/admin/players" className={`${itemClass} border-r border-white/15`}>
        <FontAwesomeIcon icon={faUsers} className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" aria-hidden />
        <span className="truncate">Jugadores</span>
      </Link>
      <form action={adminLogoutAction} className="flex min-w-0 flex-1">
        <button type="submit" className={`${itemClass} w-full cursor-pointer`}>
          <FontAwesomeIcon icon={faRightFromBracket} className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" aria-hidden />
          <span className="truncate">Salir</span>
        </button>
      </form>
    </nav>
  );
}
