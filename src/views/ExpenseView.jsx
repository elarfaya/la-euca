import { useEffect, useMemo, useState } from "react"
import Navbar from "../components/Navbar"
import ExpenseItem from "../components/ExpenseItem"
import { getExpenses, createExpense, removeExpense, getConfig, getParticipants } from "../services/api"
import dayjs from "dayjs"

export default function ExpensesView() {

    const [monthlyRent, setMonthlyRent] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [expenses, setExpenses] = useState([])
    const PARTICIPANTS_COUNT = 17
    const [showSummary, setShowSummary] = useState(false)
    const [loading, setLoading] = useState(true)
    const currentMonth = dayjs().format("YYYY-MM")
    const currentMonthExpenses =
        expenses.filter(expense => {

            const expenseMonth =
                dayjs(expense.date).format("YYYY-MM")

            return expenseMonth === currentMonth
        })
    const [participants, setParticipants] = useState([])
    const [currentPayer, setCurrentPayer] = useState("")
    const [paidBy, setPaidBy] = useState("")
    const [name, setName] = useState("")
    const [amount, setAmount] = useState("")

    useEffect(() => {
        async function loadExpenses() {
            setLoading(true)

            const [
                expensesData,
                participantsData,
                config
            ] = await Promise.all([
                getExpenses(),
                getParticipants(),
                getConfig()
            ])

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

            const rotationStart =
                config.find(
                    item => item.key === "rotation_start"
                )?.value

            const startDate = dayjs(rotationStart)

            const currentDate = dayjs()

            const monthsPassed =
                currentDate.diff(startDate, "month")

            const payer =
                activeParticipants[
                monthsPassed % activeParticipants.length
                ]

            setCurrentPayer(payer?.name || "")
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

    const extraExpenses = useMemo(() => {
        return currentMonthExpenses.reduce((acc, expense) => {
            return acc + expense.amount
        }, 0)
    }, [currentMonthExpenses])

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

            <main className="max-w-3xl mx-auto px-4 py-2">

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

                    {currentMonthExpenses.map(expense => (
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

                        <button
                            onClick={() =>
                                setShowSummary(false)
                            }
                            className="
                                mt-8
                                w-full
                                bg-white
                                text-black
                                py-3
                                rounded-xl
                                font-medium
                                hover:bg-zinc-200
                                cursor-pointer
                            ">
                            Cerrar
                        </button>

                    </div>

                </div>
            )}
        </div>
    )
}