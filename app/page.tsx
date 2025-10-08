import { supabase } from "./lib/supabaseClient";
import TerriCard from "./components/TerriCard";

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
      {data?.map((t) => (
        <TerriCard
          key={t.id}
          id={t.id}
          name={t.name}
          foged={!!t.foged}
          closed={!!t.closed}
          color={t.color ?? "#d1d5db"}
        />
      ))}
    </main>
  );
}
