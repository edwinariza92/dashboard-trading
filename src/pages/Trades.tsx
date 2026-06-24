import { useState } from 'react'
import { useTradeStore, filterTradesByDate } from '../store/tradeStore'
import TradeTable from '../components/trades/TradeTable'
import TradeForm from '../components/trades/TradeForm'
import DateFilterBar from '../components/ui/DateFilterBar'
import { exportCsv } from '../utils/exportCsv'
import { Plus, Download } from 'lucide-react'

export default function Trades() {
  const [showForm, setShowForm] = useState(false)
  const trades = useTradeStore(s => s.trades)
  const dateFilter = useTradeStore(s => s.dateFilter)
  const filtered = filterTradesByDate(trades, dateFilter)

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h2 className="text-2xl font-bold">Trade History</h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <DateFilterBar />
          {filtered.length > 0 && (
            <button
              onClick={() => exportCsv(filtered, dateFilter)}
              className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          )}
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Trade
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-neutral-500">
          <p className="text-lg mb-2">No trades recorded</p>
          <p className="text-sm">
            {dateFilter !== 'all'
              ? 'No trades in this period. Try selecting "Todo".'
              : 'Start by adding your first trade'}
          </p>
        </div>
      ) : (
        <TradeTable trades={filtered} />
      )}

      {showForm && <TradeForm onClose={() => setShowForm(false)} />}
    </div>
  )
}
