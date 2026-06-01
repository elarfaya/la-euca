import { useEffect, useMemo, useState } from "react"
import Navbar from "../components/Navbar"
import ExpenseItem from "../components/ExpenseItem"
import {
    getExpenses,
    createExpense,
    removeExpense,
    getConfig,
    getParticipants,
    getCycles,
    createCycle,
    updateCycle
} from "../services/api"
import dayjs from "dayjs"

export default function ExpensesView() {

    const [monthlyRent, setMonthlyRent] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [expenses, setExpenses] = useState([])
    const PARTICIPANTS_COUNT = 17
    const [showSummary, setShowSummary] = useState(false)
    const [loading, setLoading] = useState(true)
    const [currentCycle, setCurrentCycle] = useState(null)
    const currentCycleExpenses = useMemo(() => {

        if (!currentCycle) return []

        return expenses.filter(expense => {

            return dayjs(expense.date)
                .isAfter(
                    dayjs(currentCycle.start_date).subtract(1, "day")
                )

        })

    }, [expenses, currentCycle])
    const [participants, setParticipants] = useState([])
    const [currentPayer, setCurrentPayer] = useState("")
    const [paidBy, setPaidBy] = useState("")
    const [name, setName] = useState("")
    const [isFinishing, setIsFinishing] = useState(false)
    const [amount, setAmount] = useState("")

    useEffect(() => {
        async function loadExpenses() {
            setLoading(true)

            const [
                expensesData,
                participantsData,
                config,
                cyclesData
            ] = await Promise.all([
                getExpenses(),
                getParticipants(),
                getConfig(),
                getCycles()
            ])

            const activeCycle =
                cyclesData.find(
                    cycle =>
                        String(cycle.closed).toLowerCase() !== "true"
                )

            setCurrentCycle(activeCycle)

            const formattedExpenses =
                expensesData.map(expense => ({
                    ...expense,
                    amount: Number(expense.amount)
                }))

            setExpenses(formattedExpenses)

            const activeParticipants =
                participantsData.filter(
                    participant => participant.active
                )

            setParticipants(activeParticipants)

            const rent =
                config.find(
                    item => item.key === "monthly_rent"
                )?.value

            setMonthlyRent(Number(rent))

            const currentDate = dayjs()

            setCurrentPayer(
                activeCycle?.payer || ""
            )

            setLoading(false)
        }

        loadExpenses()
    }, [])

    async function addExpense(e) {

        e.preventDefault()

        if (!name || !amount || !paidBy) return

        setIsLoading(true)

        try {

            const newExpense = {
                id: Date.now().toString(),
                name,
                paid_by: paidBy,
                amount: Number(amount),
                date: new Date().toISOString().split("T")[0]
            }

            await createExpense(newExpense)

            setExpenses(prev => [newExpense, ...prev])

            setName("")
            setAmount("")
            setPaidBy("")

        } catch (error) {

            console.error(error)

        } finally {

            setIsLoading(false)
        }
    }

    async function deleteExpense(id) {

        await removeExpense(id)

        setExpenses(prev =>
            prev.filter(expense => expense.id !== id)
        )
    }

    async function finishCycle() {
        setIsFinishing(true)

        try {
            if (!currentCycle) return

            const currentIndex =
                participants.findIndex(
                    p => p.name === currentCycle.payer
                )

            const nextParticipant =
                participants[
                (currentIndex + 1) %
                participants.length
                ]

            await updateCycle(
                currentCycle.id,
                {
                    end_date: dayjs()
                        .format("YYYY-MM-DD"),
                    closed: true
                }
            )

            await createCycle({
                id: Date.now().toString(),
                payer: nextParticipant.name,
                start_date: dayjs()
                    .format("YYYY-MM-DD"),
                end_date: "",
                closed: false
            })

            window.location.reload()
        }
        finally {
            setIsFinishing(false)
        }
    }

    const extraExpenses = useMemo(() => {

        return currentCycleExpenses.reduce(
            (acc, expense) => acc + expense.amount,
            0
        )

    }, [currentCycleExpenses])

    const total = monthlyRent + extraExpenses
    const pricePerPerson = total / PARTICIPANTS_COUNT

    if (loading) {

        return (

            <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">

                <div className="flex flex-col items-center gap-4">

                    <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />

                    <p className="text-zinc-400">
                        Cargando pagina principal...
                    </p>

                </div>

            </div>
        )
    }
    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100">

            <Navbar />

            <main className="max-w-3xl mx-auto px-4 pt-2 pb-8">

                <div className="mb-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

                    <p className="text-zinc-400 mb-2">
                        Este mes paga
                    </p>

                    <h2 className="text-2xl font-bold">
                        {currentPayer}
                    </h2>

                </div>

                <div className="
    mb-4
    flex
    items-end
    justify-between
    gap-4
">

                    <div>

                        <p className="text-zinc-400 mb-2">
                            Total gastado este mes
                        </p>

                        <h1 className="text-3xl font-bold">
                            {total}€
                        </h1>

                    </div>

                    <button
                        onClick={() => setShowSummary(true)}
                        className="
                            bg-white
                            text-black
                            px-6
                            py-3
                            rounded-xl
                            font-medium
                            hover:bg-zinc-200
                            cursor-pointer
                            whitespace-nowrap">
                        Finalizar mes
                    </button>

                </div>

                <div className="
    bg-zinc-900
    border
    border-zinc-800
    rounded-2xl
    p-6
    mb-4
">

                    <div className="mb-6">

                        <h2 className="text-2xl font-bold mb-2">
                            Añadir gasto
                        </h2>

                        <p className="text-zinc-400">
                            Registra compras y gastos del mes
                        </p>

                    </div>

                    <form
                        onSubmit={addExpense}
                        className="
            flex
            flex-col
            md:flex-row
            gap-4
        "
                    >

                        <input
                            type="text"
                            placeholder="Concepto"
                            value={name}
                            onChange={(e) =>
                                setName(e.target.value)
                            }
                            className="
                bg-zinc-950
                border
                border-zinc-800
                rounded-xl
                px-4
                py-3
                flex-1
                outline-none
            "
                        />

                        <input
                            type="number"
                            placeholder="€"
                            value={amount}
                            onChange={(e) =>
                                setAmount(e.target.value)
                            }
                            className="
                bg-zinc-950
                border
                border-zinc-800
                rounded-xl
                px-4
                py-3
                w-full
                md:w-32
                outline-none
            "
                        />

                        <select
                            value={paidBy}
                            onChange={(e) =>
                                setPaidBy(e.target.value)
                            }
                            className="
                bg-zinc-950
                border
                border-zinc-800
                rounded-xl
                px-4
                py-3
                outline-none
            "
                        >

                            <option value="">
                                Quién pagó
                            </option>

                            {participants.map(participant => (
                                <option
                                    key={participant.order}
                                    value={participant.name}
                                >
                                    {participant.name}
                                </option>
                            ))}

                        </select>

                        <button
                            disabled={isLoading}
                            className="
                bg-white
                text-black
                font-medium
                rounded-xl
                px-6
                py-3
                hover:bg-zinc-200
                cursor-pointer
                disabled:opacity-50
                disabled:cursor-not-allowed
            "
                        >

                            {isLoading
                                ? "Añadiendo..."
                                : "Añadir"}

                        </button>

                    </form>

                </div>
                <div className="space-y-4">

                    {currentCycleExpenses.map(expense => (
                        <ExpenseItem
                            key={expense.id}
                            expense={expense}
                            onDelete={deleteExpense}
                        />
                    ))}

                </div>

            </main>
            {showSummary && (

                <div className="
                    fixed
                    inset-0
                    bg-black/70
                    flex
                    items-center
                    justify-center
                    p-4
                    z-50
                ">

                    <div className="
                        bg-zinc-900
                        border
                        border-zinc-800
                        rounded-3xl
                        p-8
                        max-w-md
                        w-full
                    ">

                        <h2 className="text-3xl font-bold mb-6">
                            Resumen del mes
                        </h2>

                        <div className="space-y-4">

                            <div className="flex justify-between">
                                <span className="text-zinc-400">
                                    Total gastado
                                </span>

                                <span className="font-medium">
                                    {total.toFixed(2)}€
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-zinc-400">
                                    Participantes
                                </span>

                                <span className="font-medium">
                                    {PARTICIPANTS_COUNT}
                                </span>
                            </div>

                            <div className="
                                flex
                                justify-between
                                text-xl
                                pt-4
                                border-t
                                border-zinc-800
                            ">
                                <span>
                                    Cada uno paga
                                </span>

                                <span className="font-bold">
                                    {pricePerPerson.toFixed(2)}€
                                </span>
                            </div>

                        </div>

                        <div className="flex gap-3 mt-8">

                            <button
                                onClick={() => setShowSummary(false)}
                                className="
                                flex-1
                                bg-zinc-800
                                hover:bg-zinc-700
                                rounded-xl
                                py-3
                                font-medium
                                cursor-pointer
                                "
                            >
                                Cerrar
                            </button>

                            <button
                                onClick={finishCycle}
                                disabled={isFinishing}
                                className="
                                flex-1
                                bg-red-600
                                hover:bg-red-500
                                rounded-xl
                                py-3
                                font-medium
                                text-white
                                cursor-pointer
                                "
                            >
                                Finalizar ciclo
                            </button>

                        </div>
                    </div>

                </div>
            )}
        </div>
    )
}