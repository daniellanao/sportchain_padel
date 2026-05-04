"use client";

import { useState } from "react";

import { PlayerPickCombobox } from "@/components/admin/PlayerPickCombobox";

type Slot = { side: number; role: number; name: string };

function roleLabel(role: number): string {
  return role === 1 ? "Jugador 1" : role === 2 ? "Jugador 2" : `Rol ${role}`;
}

export function AdminCreateMatchPlayerSlots({ slots }: { slots: Slot[] }) {
  const [picked, setPicked] = useState<Record<string, number | null>>(() =>
    Object.fromEntries(slots.map((s) => [s.name, null as number | null])),
  );

  return (
    <>
      {slots.map((slot, i) => {
        const excludedForThis = Object.entries(picked)
          .filter(([key]) => key !== slot.name)
          .map(([, v]) => v)
          .filter((v): v is number => typeof v === "number" && v > 0);

        return (
          <tr
            key={slot.name}
            className={
              i % 2 === 0
                ? "border-t border-foreground/10 bg-[var(--color-surface)]"
                : "border-t border-foreground/10 bg-[var(--color-muted)]/25"
            }
          >
            <td className="whitespace-nowrap px-3 py-2 font-mono tabular-nums">{slot.side}</td>
            <td className="whitespace-nowrap px-3 py-2">{roleLabel(slot.role)}</td>
            <td className="px-3 py-2 align-top">
              <PlayerPickCombobox
                name={slot.name}
                excludedIds={excludedForThis}
                placeholder="Mín. 2 caracteres — apellido, nombre, email o ID"
                onSelectedChange={(id) =>
                  setPicked((prev) => ({
                    ...prev,
                    [slot.name]: id,
                  }))
                }
              />
            </td>
          </tr>
        );
      })}
    </>
  );
}
