import { Routes, Route } from 'react-router-dom'

import ExpensesView from './views/ExpenseView'
import HistoryView from './views/HistoryView'

export default function App() {
  return (
    <Routes>
      <Route path='/' element={<ExpensesView />} />
      <Route path='/historial' element={<HistoryView />} />
    </Routes>
  )
}