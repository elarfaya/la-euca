import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <header className="border-b border-zinc-800">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">

        <div className="flex items-center gap-3">

          <img
            src={`${import.meta.env.BASE_URL}icon-192.png`}
            alt="La Euca"
            className="
              w-10
              h-10
              object-cover
              rounded-full"
          />

          <h1 className="text-2xl font-bold">
            La Euca
          </h1>

        </div>

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