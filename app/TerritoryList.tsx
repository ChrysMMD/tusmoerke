"use client";

import { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient"; // ret stien hvis din client ligger et andet sted
import TerriCard from "./components/TerriCard";

type Row = {
  id: number;
  name: string;
  foged: boolean;
  closed: boolean;
  color: string | null;
};

export default function TerritoryList({ initialRows = [] as Row[] }) {
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(initialRows.length === 0);

  useEffect(() => {
    // 1) Hent initial data hvis ikke givet fra server
    if (initialRows.length === 0) {
      (async () => {
        setLoading(true);
        const { data, error } = await supabase
          .from("territorier")
          .select("id,name,foged,closed,color")
          .order("name");
        if (error) setError(error.message);
        else setRows(data ?? []);
        setLoading(false);
      })();
    }

    // 2) Realtime subscription
    const ch = supabase
      .channel("territorier-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "territorier" },
        (payload: any) => {
          setRows((prev) => {
            if (payload.eventType === "INSERT") {
              const rec = payload.new as Row;
              // undgå dubletter og hold listen sorteret
              const next = prev.some((r) => r.id === rec.id)
                ? prev.map((r) => (r.id === rec.id ? rec : r))
                : [rec, ...prev];
              return next.sort((a, b) => a.name.localeCompare(b.name));
            }
            if (payload.eventType === "UPDATE") {
              const rec = payload.new as Row;
              return prev.map((r) => (r.id === rec.id ? rec : r));
            }
            if (payload.eventType === "DELETE") {
              const rec = payload.old as Row;
              return prev.filter((r) => r.id !== rec.id);
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ch);
    };
  }, []); // kør én gang

  if (error) return <p className="text-red-600">Kunne ikke hente data: {error}</p>;
  if (loading && rows.length === 0) return <p>Henter territorier…</p>;

  if (rows.length === 0) {
    return <p className="opacity-70">Ingen territorier endnu.</p>;
  }

  return (
    <div className="grid gap-4">
      {rows.map((t) => (
        <TerriCard
          key={t.id}
          id={t.id}
          name={t.name}
          foged={!!t.foged}
          closed={!!t.closed}
          color={t.color ?? "#d1d5db"}
        />
      ))}
    </div>
  );
}
