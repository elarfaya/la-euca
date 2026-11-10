import { useMemo, useRef, useState } from 'react'
import Navbar from '../components/Navbar'
import { impostorWords } from '../data/impostorWords'

const randomIndex = max => Math.floor(Math.random() * max)

function createRound(players, impostorCount, hintsEnabled, previousWord) {
  const availableWords = impostorWords.filter(item => item.word !== previousWord)
  const selectedWord = availableWords[randomIndex(availableWords.length)]
  const hint = selectedWord.hints[randomIndex(selectedWord.hints.length)]
  const impostorIndexes = new Set()
  while (impostorIndexes.size < impostorCount) impostorIndexes.add(randomIndex(players.length))

  return {
    word: selectedWord.word,
    hint,
    roles: players.map((player, index) => ({
      player,
      impostor: impostorIndexes.has(index),
    })),
  }
}

export default function ImpostorView() {
  const [screen, setScreen] = useState('players')
  const [playersText, setPlayersText] = useState('')
  const [players, setPlayers] = useState([])
  const [hintsEnabled, setHintsEnabled] = useState(true)
  const [impostorCount, setImpostorCount] = useState(1)
  const [round, setRound] = useState(null)
  const [playerIndex, setPlayerIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [lastWord, setLastWord] = useState(null)
  const [dragStart, setDragStart] = useState(null)
  const cardRef = useRef(null)

  const parsedPlayers = useMemo(() => playersText.split('\n').map(name => name.trim()).filter(Boolean), [playersText])
  const current = round?.roles[playerIndex]

  function continueToSettings() {
    const clean = [...new Set(parsedPlayers)]
    if (clean.length < 3) return
    setPlayers(clean)
    setImpostorCount(Math.min(impostorCount, clean.length - 1))
    setScreen('settings')
  }

  function startRound() {
    const nextRound = createRound(players, impostorCount, hintsEnabled, lastWord)
    setRound(nextRound)
    setLastWord(nextRound.word)
    setPlayerIndex(0)
    setRevealed(false)
    setScreen('deal')
  }

  function nextPlayer() {
    if (playerIndex < players.length - 1) {
      setPlayerIndex(index => index + 1)
      setRevealed(false)
    } else {
      setScreen('playing')
    }
  }

  function handlePointerDown(event) {
    setDragStart(event.clientX)
  }

  function handlePointerUp(event) {
    if (dragStart !== null && Math.abs(event.clientX - dragStart) > 55) setRevealed(true)
    setDragStart(null)
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-500/15 text-violet-300 text-2xl mb-4">🕵️</div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">El Impostor</h1>
          <p className="text-zinc-400 mt-2">Una palabra. Un grupo. ¿Quién está fingiendo?</p>
        </div>

        {screen === 'players' && (
          <section className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-5 sm:p-7 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold">1. ¿Quién va a jugar?</h2>
              <span className="text-xs text-zinc-500">Mínimo 3</span>
            </div>
            <p className="text-sm text-zinc-400 mb-4">Escribe un nombre por línea. El orden será el orden en el que se pasará el móvil.</p>
            <textarea value={playersText} onChange={e => setPlayersText(e.target.value)} rows={7} placeholder={'Enrique\nMaría\nJavier\nLucía'} className="w-full resize-y rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white placeholder:text-zinc-600 outline-none focus:border-violet-500" />
            <div className="flex items-center justify-between mt-3 text-sm text-zinc-500">
              <span>{parsedPlayers.length} jugadores</span>
              {parsedPlayers.length !== new Set(parsedPlayers).size && <span className="text-amber-400">Se eliminarán nombres repetidos</span>}
            </div>
            <button onClick={continueToSettings} disabled={parsedPlayers.length < 3} className="w-full mt-6 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-700 disabled:text-zinc-500 px-5 py-3.5 font-bold transition">Continuar <span aria-hidden="true">→</span></button>
          </section>
        )}

        {screen === 'settings' && (
          <section className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-5 sm:p-7 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">2. Configura la partida</h2>
              <button onClick={() => setScreen('players')} className="text-sm text-zinc-400 hover:text-white">← Jugadores</button>
            </div>
            <div className="rounded-2xl bg-zinc-950 border border-zinc-800 p-4 mb-5">
              <div className="font-semibold">Jugadores</div>
              <div className="text-sm text-zinc-400 mt-1">{players.join(' · ')}</div>
            </div>
            <div className="flex items-center justify-between gap-4 py-4 border-b border-zinc-800">
              <div><div className="font-semibold">Pista para el impostor</div><p className="text-sm text-zinc-500">Recibirá una pista de la palabra secreta</p></div>
              <button role="switch" aria-checked={hintsEnabled} onClick={() => setHintsEnabled(value => !value)} className={`w-14 h-8 rounded-full p-1 transition ${hintsEnabled ? 'bg-violet-600' : 'bg-zinc-700'}`}><span className={`block w-6 h-6 rounded-full bg-white transition-transform ${hintsEnabled ? 'translate-x-6' : ''}`} /></button>
            </div>
            <div className="py-5">
              <div className="font-semibold">Número de impostores</div>
              <p className="text-sm text-zinc-500 mt-1 mb-4">Puedes elegir entre 1 y {players.length - 1}</p>
              <div className="flex items-center justify-center gap-6">
                <button onClick={() => setImpostorCount(value => Math.max(1, value - 1))} disabled={impostorCount <= 1} className="w-11 h-11 rounded-xl border border-zinc-700 text-2xl disabled:opacity-30">−</button>
                <span className="text-4xl font-black tabular-nums w-10 text-center">{impostorCount}</span>
                <button onClick={() => setImpostorCount(value => Math.min(players.length - 1, value + 1))} disabled={impostorCount >= players.length - 1} className="w-11 h-11 rounded-xl border border-zinc-700 text-2xl disabled:opacity-30">+</button>
              </div>
            </div>
            <button onClick={startRound} className="w-full rounded-xl bg-violet-600 hover:bg-violet-500 px-5 py-3.5 font-bold transition">Comenzar partida <span aria-hidden="true">→</span></button>
          </section>
        )}

        {screen === 'deal' && current && (
          <section className="mx-auto max-w-md px-1 sm:px-3">
            <div
              ref={cardRef}
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onPointerCancel={() => setDragStart(null)}
              onClick={() => !revealed && setRevealed(true)}
              className={`impostor-player-card relative isolate overflow-hidden select-none touch-pan-y min-h-[390px] sm:min-h-[430px] rounded-[2rem] border flex flex-col items-center justify-center text-center px-7 py-10 cursor-pointer shadow-2xl transition-colors duration-300 ${revealed ? `reveal-flip ${current.impostor ? 'bg-gradient-to-br from-rose-950 via-zinc-950 to-zinc-900 border-rose-800/70' : 'bg-gradient-to-br from-emerald-950 via-zinc-950 to-zinc-900 border-emerald-800/70'}` : 'bg-gradient-to-br from-violet-950 via-zinc-900 to-zinc-950 border-violet-400/20 hover:border-violet-300/40'}`}
            >
              {!revealed ? (
                <>
                  <div className="absolute -top-20 -right-16 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-fuchsia-500/10 blur-3xl pointer-events-none" />
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="mb-7 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-3xl shadow-lg shadow-black/20">🎭</div>
                    <p className="text-sm font-medium tracking-wide text-violet-200/80">Es el turno de</p>
                    <h2 className="mt-2 max-w-full break-words text-4xl sm:text-5xl font-black tracking-tight text-white">{current.player}</h2>
                    <div className="my-8 h-px w-16 bg-gradient-to-r from-transparent via-violet-300/50 to-transparent" />
                    <p className="text-lg font-semibold text-white">Desliza para descubrir</p>
                    <p className="mt-2 text-sm text-zinc-400">Tu papel secreto</p>
                    <div className="mt-7 flex items-center gap-2 text-violet-200/80 animate-pulse" aria-hidden="true">
                      <span className="text-xl">←</span><span className="text-xs uppercase tracking-[0.25em]">Desliza</span><span className="text-xl">→</span>
                    </div>
                  </div>
                </>
              ) : current.impostor ? (
                <div className="relative z-10 flex flex-col items-center">
                  <div className="text-5xl mb-5">🕵️</div>
                  <div className="text-3xl sm:text-4xl font-black tracking-wide text-rose-200">IMPOSTOR</div>
                  {hintsEnabled && <div className="mt-7 rounded-2xl border border-rose-800/60 bg-rose-900/30 px-6 py-4"><p className="text-xs text-rose-300 uppercase tracking-[0.2em]">Tu pista</p><p className="text-2xl font-semibold mt-2 text-rose-100">{round.hint}</p></div>}
                </div>
              ) : (
                <div className="relative z-10 flex flex-col items-center">
                  <div className="text-5xl mb-5">🎭</div>
                  <div className="text-3xl sm:text-4xl font-black text-emerald-100 break-words">{round.word}</div>
                </div>
              )}
            </div>
            {revealed && <p className="text-center text-xs text-zinc-500 mt-4">Memoriza tu papel y no lo enseñes a nadie.</p>}
            <button onClick={nextPlayer} disabled={!revealed} className="w-full mt-5 rounded-2xl bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-800 disabled:text-zinc-600 px-5 py-4 font-bold text-base shadow-lg shadow-violet-950/30 transition">{playerIndex === players.length - 1 ? 'Terminar reparto' : 'Siguiente jugador'} <span aria-hidden="true">→</span></button>
          </section>
        )}

        {screen === 'playing' && (
          <section className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-7 text-center shadow-xl">
            <div className="text-5xl mb-5">🎭</div>
            <h2 className="text-2xl font-black">¡Que empiece el juego!</h2>
            <p className="text-zinc-400 mt-3 leading-relaxed">Todos conocen su papel. Ahora debatid, dad pistas y tratad de descubrir quién es el impostor.</p>
            <div className="mt-7 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-500">La aplicación no revelará quién es el impostor.</div>
            <button onClick={startRound} className="w-full mt-6 rounded-xl bg-violet-600 hover:bg-violet-500 px-5 py-3.5 font-bold transition">Siguiente ronda <span aria-hidden="true">→</span></button>
            <button onClick={() => setScreen('players')} className="mt-4 text-sm text-zinc-500 hover:text-white">Cambiar jugadores</button>
          </section>
        )}

        <p className="text-center text-xs text-zinc-600 mt-7">{impostorWords.length} palabras disponibles · Selección aleatoria</p>
      </main>
    </div>
  )
}
