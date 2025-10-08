// app/page.tsx (SERVER)
import { supabase } from "./lib/supabaseClient";
import TerritoryList from "./TerritoryList";

export const revalidate = 0;

export default async function Home() {
  const { data, error } = await supabase
    .from("territorier")
    .select("id, name, foged, closed, color")
    .order("name", { ascending: true });

  if (error) {
    return <p>Kunne ikke hente data: {error.message}</p>;
  }

  return (
    <main className="grid gap-4 bg-back-lilla">
      <div className="indhold">
        <h1>Tusmørke</h1>
        <h2>Territorier</h2>
      </div>

      {/* ← nu håndterer TerritoryList realtime-opdateringer */}
      <TerritoryList initialRows={data ?? []} />
    </main>
  );
}
