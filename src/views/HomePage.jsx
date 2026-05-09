import Navbar from "../components/Navbar"
import StatCard from "../components/StatCard"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">

      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-10">

        <section className="grid gap-6 md:grid-cols-2">

          <StatCard
            title="Este mes paga"
            value="Unai"
          />

          <StatCard
            title="Gastos del mes"
            value="92€"
          />

        </section>

      </main>

    </div>
  )
}