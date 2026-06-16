import { useState } from 'react'
import { useTradeStore } from '../store/tradeStore'
import TradeForm from '../components/trades/TradeForm'
import MetricCards from '../components/dashboard/MetricCards'
import EquityChart from '../components/dashboard/EquityChart'
import { Plus } from 'lucide-react'

export default function Dashboard() {
  const [showForm, setShowForm] = useState(false)
  const trades = useTradeStore(s => s.trades)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          New Trade
        </button>
      </div>

      {trades.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-neutral-500">
          <p className="text-lg mb-2">No trades yet</p>
          <p className="text-sm">Click "New Trade" to add your first trade</p>
        </div>
      ) : (
        <div className="space-y-6">
          <MetricCards trades={trades} />
          <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
            <h3 className="text-sm font-medium text-neutral-400 mb-3">Equity Curve</h3>
            <EquityChart trades={trades} />
          </div>
        </div>
      )}

      {showForm && <TradeForm onClose={() => setShowForm(false)} />}
    </div>
  )
}
