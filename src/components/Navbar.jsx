import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <header className="border-b border-zinc-800">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">

        <h1 className="text-2xl font-bold">
          🍻 La Euca
        </h1>

        <nav className="flex gap-4 text-sm text-zinc-400">

          <Link
            to="/"
            className="hover:text-white transition"
          >
            Inicio
          </Link>

          <Link
            to="/historial"
            className="hover:text-white transition"
          >
            Historial
          </Link>

        </nav>

      </div>
    </header>
  )
}