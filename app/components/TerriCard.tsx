"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

type TerriProps = {
  id: number;
  name: string;
  foged: boolean;
  closed: boolean;
  color: string;
};

export default function TerriCard({
  id,
  name,
  foged,
  closed,
  color,
}: TerriProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [fogedState, setFogedState] = useState(!!foged);
  const [closedState, setclosedState] = useState(!!closed);
  const [hex, setHex] = useState<string>(color);

  // Hjælper til at gemme i DB med optimistisk UI + rollback ved fejl
  async function updateRow(
    patch: Partial<{ foged: boolean; closed: boolean; color: string }>
  ) {
    setSaving(true);
    setErr(null);

    const prev = { foged: fogedState, closed: closedState, color: hex };

    // Optimistisk opdatering
    if (typeof patch.foged === "boolean") setFogedState(patch.foged);
    if (typeof patch.closed === "boolean") setclosedState(patch.closed);
    if (typeof patch.color === "string") setHex(patch.color);

    const { error } = await supabase
  .from("territorier")  
  .update(patch)
  .eq("id", id);

    if (error) {
      // Rollback
      setFogedState(prev.foged);
      setclosedState(prev.closed);
      setHex(prev.color);
      setErr(error.message);
    }
    setSaving(false);
  }

  const toggleFoged = () => updateRow({ foged: !fogedState });
  const toggleclosed = () => updateRow({ closed: !closedState });

  const COLORS = {
    rod: "#871514", // rød
    gul: "#FECD71", // gul
    gron: "#4D8B4B", // grøn
  };

  return (
    <div className="border rounded p-4 border-dark-lilla ">
      {/* Header + farvecirkel (klik for at åbne/lukke) */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between text-left"
        aria-expanded={open}
      >
        <div>
          <h3 className="text-lg font-bold text-orange">{name}</h3>
          <p className="text-sm opacity-80">
            <span className="font-bold">Foged:</span> {fogedState ? "Ja" : "Nej"} </p> 
            <p className="text-sm opacity-80"> 
              <span className="font-bold">Aflukket:</span> {closedState ? "Ja" : "Nej"}
          </p>
        </div>
        <span
          className="inline-block h-5 w-5 rounded-full border"
          style={{ backgroundColor: hex }}
          aria-label={`Farve: ${hex}`}
          title={hex}
        />
      </button>

      {/* Udvidet actions */}
      {open && (
        <div className="mt-4 space-y-2">
          <button
            onClick={toggleFoged}
            disabled={saving}
            className="w-full h-20 bg-lilla rounded px-3 py-2 text-center hover:bg-black/5 disabled:opacity-50"
          >
            Foged: {!fogedState ? "Ja" : "Nej"}
          </button>

          <button
            onClick={toggleclosed}
            disabled={saving}
            className="w-full h-20 rounded bg-lilla px-3 py-2 text-center hover:bg-black/5 disabled:opacity-50"
          >
            Aflukket: {!closedState ? "Ja" : "Nej"}
          </button>

          <div className="w-full rounded bg-lilla p-3">
            <div className="text-center mb-2 text-sm font-medium">Vælg farve</div>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => updateRow({ color: COLORS.rod })}
                disabled={saving}
                className="h-15 w-15 rounded-full border"
                style={{ backgroundColor: COLORS.rod }}
                aria-label="Vælg rød"
                title="Rød"
              />
              <button
                onClick={() => updateRow({ color: COLORS.gul })}
                disabled={saving} 
                className="h-15 w-15 rounded-full border"
                style={{ backgroundColor: COLORS.gul }}
                aria-label="Vælg gul"
                title="Gul"
              />
              <button
                onClick={() => updateRow({ color: COLORS.gron })}
                disabled={saving}
                className="h-15 w-15 rounded-full border"
                style={{ backgroundColor: COLORS.gron }}
                aria-label="Vælg grøn"
                title="Grøn"
              />
            </div>
          </div>

          {err && <p className="text-sm text-red-600">Kunne ikke gemme: {err}</p>}
          {saving && <p className="text-sm opacity-70">Gemmer…</p>}
        </div>
      )}
    </div>
  );
}