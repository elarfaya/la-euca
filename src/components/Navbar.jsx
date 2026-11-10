
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <header className="border-b border-zinc-800">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <img
            src={`${import.meta.env.BASE_URL}icon-192.png`}
            alt="La Euca"
            className="w-10 h-10 object-cover rounded-full"
          />

          <h1 className="text-2xl font-bold">
            La Euca
          </h1>
        </div>

        {/* Menú escritorio */}
        <nav className="hidden md:flex gap-4 text-sm text-zinc-400">
          <Link
            to="/"
            className={`transition hover:text-white ${isActive('/') ? 'text-white font-semibold' : ''
              }`}
          >
            Inicio
          </Link>

          <Link
            to="/impostor"
            className={`transition hover:text-white ${isActive('/impostor') ? 'text-white font-semibold' : ''}`}
          >
            Impostor
          </Link>

          <Link
            to="/historial"
            className={`transition hover:text-white ${isActive('/historial') ? 'text-white font-semibold' : ''
              }`}
          >
            Historial
          </Link>
        </nav>

        {/* Menú móvil */}
        <div className="relative md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            className="flex items-center justify-center p-2 text-zinc-300 hover:text-white transition"
          >
            {menuOpen ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-3 w-40 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl overflow-hidden z-50">

              <Link
                to="/"
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-3 text-sm hover:bg-zinc-800 ${isActive('/') ? 'text-white font-semibold' : 'text-zinc-400'
                  }`}
              >
                Inicio
              </Link>

              <Link
                to="/impostor"
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-3 text-sm hover:bg-zinc-800 border-t border-zinc-800 ${isActive('/impostor') ? 'text-white font-semibold' : 'text-zinc-400'}`}
              >
                Impostor
              </Link>

              <Link
                to="/historial"
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-3 text-sm hover:bg-zinc-800 border-t border-zinc-800 ${isActive('/historial') ? 'text-white font-semibold' : 'text-zinc-400'
                  }`}
              >
                Historial
              </Link>

            </div>
          )}
        </div>

      </div>
    </header>
  )
}
