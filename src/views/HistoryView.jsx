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
  const MONTHLY_RENT = 300
  const PARTICIPANTS_COUNT = 17
  const [participants, setParticipants] = useState([])
  const [loading, setLoading] = useState(true)

  const [selectedMonth, setSelectedMonth] = useState(
    dayjs().format('YYYY-MM')
  )

  const [currentPayer, setCurrentPayer] = useState('')

  useEffect(() => {

    async function loadData() {

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
        participantsData
          .filter(p => p.active)
          .sort(
            (a, b) =>
              Number(a.order) - Number(b.order)
          )

      setParticipants(activeParticipants)

      const rotationStart =
        config.find(
          item =>
            item.key === "rotation_start"
        )?.value

      const startDate = dayjs(rotationStart)

      const currentDate =
        dayjs(selectedMonth)

      const monthsPassed =
        currentDate.diff(startDate, "month")

      const payer =
        activeParticipants[
        monthsPassed %
        activeParticipants.length
        ]

      setCurrentPayer(payer?.name || "")

      setLoading(false)
    }

    loadData()

  }, [selectedMonth])

  const currentMonthExpenses = useMemo(() => {

    return expenses.filter(expense => {

      const expenseMonth =
        dayjs(expense.date)
          .format("YYYY-MM")

      return expenseMonth === selectedMonth
    })

  }, [expenses, selectedMonth])

  const extraExpenses = useMemo(() => {

    return currentMonthExpenses.reduce(
      (acc, expense) => {
        return acc + expense.amount
      },
      0
    )

  }, [currentMonthExpenses])

  const total =
    MONTHLY_RENT + extraExpenses

  const pricePerPerson =
    total / PARTICIPANTS_COUNT

  if (loading) {

    return (

      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">

        <div className="flex flex-col items-center gap-4">

          <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />

          <p className="text-zinc-400">
            Cargando histórico...
          </p>

        </div>

      </div>
    )
  }

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

        <div className="
  bg-zinc-900
  border
  border-zinc-800
  rounded-2xl
  p-6
  mb-8
">

          <div className="
    flex
    flex-col
    md:flex-row
    md:items-center
    md:justify-between
    gap-6
  ">

            <div>

              <p className="text-zinc-400 mb-1">
                Ese mes pagaba
              </p>

              <h2 className="text-3xl font-bold">
                {currentPayer}
              </h2>

            </div>

            <div>

              <p className="text-zinc-400 mb-1">
                Total del mes
              </p>

              <h2 className="text-3xl font-bold">
                {total.toFixed(2)}€
              </h2>

            </div>

            <div>

              <p className="text-zinc-400 mb-1">
                Cada uno pagaba
              </p>

              <h2 className="text-3xl font-bold">
                {pricePerPerson.toFixed(2)}€
              </h2>

            </div>

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