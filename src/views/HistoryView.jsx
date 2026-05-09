import { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'

import Navbar from '../components/Navbar'
import ExpenseItem from '../components/ExpenseItem'

import {
  getExpenses,
  getParticipants,
  getConfig
} from '../services/api'

export default function HistoryView() {

  const [expenses, setExpenses] = useState([])
  const [participants, setParticipants] = useState([])

  const [selectedMonth, setSelectedMonth] = useState(
    dayjs().format('YYYY-MM')
  )

  const [currentPayer, setCurrentPayer] = useState('')

  useEffect(() => {

    async function loadData() {

      const expensesData = await getExpenses()

      const formattedExpenses = expensesData.map(expense => ({
        ...expense,
        amount: Number(expense.amount)
      }))

      setExpenses(formattedExpenses)

      const participantsData = await getParticipants()

      const activeParticipants = participantsData
        .filter(p => p.active === 'TRUE')
        .sort((a, b) => Number(a.order) - Number(b.order))

      setParticipants(activeParticipants)

      const config = await getConfig()

      const rotationStart = config.find(
        item => item.key === 'rotation_start'
      )?.value

      const startDate = dayjs(rotationStart)

      const currentDate = dayjs(selectedMonth)

      const monthsPassed = currentDate.diff(startDate, 'month')

      const payer = activeParticipants[
        monthsPassed % activeParticipants.length
      ]

      setCurrentPayer(payer?.name || '')
    }

    loadData()

  }, [selectedMonth])

  const currentMonthExpenses = useMemo(() => {
    return expenses.filter(
      expense => expense.month === selectedMonth
    )
  }, [expenses, selectedMonth])

  const total = useMemo(() => {
    return currentMonthExpenses.reduce((acc, expense) => {
      return acc + expense.amount
    }, 0)
  }, [currentMonthExpenses])

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">

      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-10">

        <div className="mb-8 flex justify-between items-center flex-wrap gap-4">

          <div>
            <h1 className="text-4xl font-bold mb-2">
              Historial
            </h1>

            <p className="text-zinc-400">
              Consulta meses anteriores
            </p>
          </div>

          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 outline-none"
          />

        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

            <p className="text-zinc-400 mb-2 text-sm">
              Ese mes pagaba
            </p>

            <h2 className="text-4xl font-bold">
              {currentPayer}
            </h2>

          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

            <p className="text-zinc-400 mb-2 text-sm">
              Gastos extra
            </p>

            <h2 className="text-4xl font-bold">
              {total}€
            </h2>

          </div>

        </div>

        <div className="space-y-4">

          {currentMonthExpenses.length === 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-zinc-400">
              No hubo gastos ese mes.
            </div>
          )}

          {currentMonthExpenses.map(expense => (
            <ExpenseItem
              key={expense.id}
              expense={expense}
            />
          ))}

        </div>

      </main>

    </div>
  )
}