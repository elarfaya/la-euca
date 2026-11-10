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
          <section className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-5 sm:p-7 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <span className="text-sm text-zinc-400">Reparto secreto</span>
              <span className="text-sm font-semibold text-violet-300">Jugador {playerIndex + 1} de {players.length}</span>
            </div>
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-7"><div className="h-full bg-violet-500 transition-all" style={{ width: `${((playerIndex + 1) / players.length) * 100}%` }} /></div>
            <div className="text-center mb-6">
              <p className="text-zinc-400 text-sm">Pásale el móvil a</p>
              <h2 className="text-3xl font-black mt-1">{current.player}</h2>
              <p className="text-zinc-500 text-sm mt-2">Asegúrate de que nadie más esté mirando.</p>
            </div>
            <div ref={cardRef} onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} onPointerCancel={() => setDragStart(null)} className={`select-none touch-pan-y min-h-56 rounded-3xl border flex flex-col items-center justify-center text-center p-6 transition-all ${revealed ? (current.impostor ? 'bg-rose-950/50 border-rose-800' : 'bg-emerald-950/40 border-emerald-800') : 'bg-zinc-950 border-zinc-700 border-dashed cursor-grab active:cursor-grabbing'}`}>
              {!revealed ? <><div className="text-4xl mb-4">🔒</div><div className="text-lg font-bold">Tu papel está oculto</div><p className="text-sm text-zinc-500 mt-2">Desliza la tarjeta hacia un lado para descubrirlo</p><button onClick={() => setRevealed(true)} className="mt-5 text-sm text-violet-300 underline underline-offset-4">O pulsa aquí para revelar</button></> : current.impostor ? <><div className="text-4xl mb-3">🕵️</div><div className="text-xs uppercase tracking-[0.25em] font-bold text-rose-300">Tu papel</div><div className="text-3xl font-black text-rose-200 mt-2">IMPOSTOR</div>{hintsEnabled && <div className="mt-5 rounded-xl bg-rose-900/40 border border-rose-800/60 px-5 py-3"><p className="text-xs text-rose-300 uppercase tracking-widest">Tu pista</p><p className="text-xl font-semibold mt-1">{round.hint}</p></div>}</> : <><div className="text-4xl mb-3">🎭</div><div className="text-xs uppercase tracking-[0.25em] font-bold text-emerald-300">La palabra secreta</div><div className="text-3xl sm:text-4xl font-black text-emerald-100 mt-3 break-words">{round.word}</div></>}
            </div>
            <p className="text-center text-xs text-zinc-500 mt-4">{revealed ? 'Memoriza tu papel y no lo enseñes a nadie.' : 'Solo el jugador indicado debe descubrir su papel.'}</p>
            <button onClick={nextPlayer} disabled={!revealed} className="w-full mt-6 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-700 disabled:text-zinc-500 px-5 py-3.5 font-bold transition">{playerIndex === players.length - 1 ? 'Terminar reparto' : 'Siguiente jugador'} <span aria-hidden="true">→</span></button>
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
