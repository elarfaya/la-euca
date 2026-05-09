export default function ExpenseItem({ expense, onDelete }) {
    return (
        <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl p-4">

            <div>

                <p className="font-medium">
                    {expense.name}
                </p>

                <p className="text-sm text-zinc-400">
                    Pagado por {expense.paid_by}
                </p>

                <p className="text-xs text-zinc-500 mt-1">
                    {expense.date}
                </p>

            </div>

            <div className="flex items-center gap-4">

                <p className="font-bold">
                    {expense.amount}€
                </p>

                <button
                    onClick={() => onDelete(expense.id)}
                    className="text-red-400 hover:text-red-300 cursor-pointer"
                >
                    ✕
                </button>

            </div>

        </div>
    )
}