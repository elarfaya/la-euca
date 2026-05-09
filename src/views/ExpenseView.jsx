import { useEffect, useMemo, useState } from "react"
import Navbar from "../components/Navbar"
import ExpenseItem from "../components/ExpenseItem"
import { getExpenses, createExpense, removeExpense, getConfig, getParticipants } from "../services/api"
import dayjs from "dayjs"

export default function ExpensesView() {

    const [monthlyRent, setMonthlyRent] = useState(0)
    const [expenses, setExpenses] = useState([])
    const currentMonth = dayjs().format("YYYY-MM")
    const currentMonthExpenses =
        expenses.filter(
            expense => expense.month === currentMonth
        )
    const [participants, setParticipants] = useState([])
    const [currentPayer, setCurrentPayer] = useState("")

    const [name, setName] = useState("")
    const [amount, setAmount] = useState("")

    useEffect(() => {

        async function loadExpenses() {

            const data = await getExpenses()
            console.log(data)
            const formattedExpenses = data.map(expense => ({
                ...expense,
                amount: Number(expense.amount)
            }))

            setExpenses(formattedExpenses)

            const participantsData =
                await getParticipants()

            const activeParticipants =
                participantsData.filter(
                    participant => participant.active === "TRUE"
                )

            setParticipants(activeParticipants)

            const config = await getConfig()

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
        }

        loadExpenses()

    }, [])

    async function addExpense(e) {

        e.preventDefault()

        if (!name || !amount) return

        const newExpense = {
            id: Date.now().toString(),
            name,
            amount: Number(amount),
            date: new Date().toISOString().split("T")[0],
            month: new Date().toISOString().slice(0, 7)
        }

        await createExpense(newExpense)

        setExpenses([newExpense, ...expenses])

        setName("")
        setAmount("")
    }

    async function deleteExpense(id) {

        await removeExpense(id)

        setExpenses(
            expenses.filter(expense => expense.id !== id)
        )
    }

    const extraExpenses = useMemo(() => {
        return currentMonthExpenses.reduce((acc, expense) => {
            return acc + expense.amount
        }, 0)
    }, [currentMonthExpenses])

    const total = monthlyRent + extraExpenses

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100">

            <Navbar />

            <main className="max-w-3xl mx-auto px-4 py-10">

                <div className="mb-8 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

                    <p className="text-zinc-400 mb-2">
                        Este mes paga
                    </p>

                    <h2 className="text-4xl font-bold">
                        {currentPayer}
                    </h2>

                </div>

                <div className="mb-8">
                    <p className="text-zinc-400 mb-2">
                        Total gastado este mes
                    </p>

                    <h1 className="text-5xl font-bold">
                        {total}€
                    </h1>
                </div>

                <form
                    onSubmit={addExpense}
                    className="flex flex-col md:flex-row gap-4 mb-8"
                >

                    <input
                        type="text"
                        placeholder="Concepto"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 flex-1 outline-none"
                    />

                    <input
                        type="number"
                        placeholder="€"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 w-full md:w-32 outline-none"
                    />

                    <button
                        className="bg-white text-black font-medium rounded-xl px-6 py-3 hover:bg-zinc-200 cursor-pointer"
                    >
                        Añadir
                    </button>

                </form>

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

        </div>
    )
}