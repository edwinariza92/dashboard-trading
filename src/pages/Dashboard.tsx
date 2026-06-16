import { useState } from 'react'
import { useTradeStore } from '../store/tradeStore'
import TradeForm from '../components/trades/TradeForm'
import MetricCards from '../components/dashboard/MetricCards'
import EquityChart from '../components/dashboard/EquityChart'
import { Plus, TestTubes, Trash2 } from 'lucide-react'

export default function Dashboard() {
  const [showForm, setShowForm] = useState(false)
  const trades = useTradeStore(s => s.trades)
  const loadExamples = useTradeStore(s => s.loadExamples)
  const removeExamples = useTradeStore(s => s.removeExamples)
  const hasExamples = trades.some(t => t.isExample)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <div className="flex gap-2">
          {trades.length === 0 && (
            <button
              onClick={loadExamples}
              className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >
              <TestTubes className="w-4 h-4" />
              Load Examples
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

      {trades.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-neutral-500">
          <p className="text-lg mb-2">No trades yet</p>
          <p className="text-sm mb-6">Click "New Trade" to add your first trade</p>
          <button
            onClick={loadExamples}
            className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            <TestTubes className="w-4 h-4" />
            Load 15 example trades
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {hasExamples && (
            <div className="flex items-center justify-between bg-neutral-800/50 rounded-lg px-4 py-2 border border-neutral-700">
              <p className="text-xs text-neutral-400">Example trades loaded — they won't sync to the cloud</p>
              <button
                onClick={removeExamples}
                className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove examples
              </button>
            </div>
          )}
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
