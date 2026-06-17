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
    <div className="min-w-0 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold">Dashboard</h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {trades.length === 0 && (
            <button
              onClick={loadExamples}
              className="flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-4 py-2.5 sm:py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer w-full sm:w-auto"
            >
              <TestTubes className="w-4 h-4 shrink-0" />
              Load Examples
            </button>
          )}
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 sm:py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 shrink-0" />
            Agregar Trade
          </button>
        </div>
      </div>

      {trades.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-neutral-500 px-4">
          <p className="text-base sm:text-lg mb-2">No trades yet</p>
          <p className="text-sm mb-6 text-center">Click "New Trade" to add your first trade</p>
          <button
            onClick={loadExamples}
            className="flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer w-full sm:w-auto"
          >
            <TestTubes className="w-4 h-4 shrink-0" />
            Load 15 example trades
          </button>
        </div>
      )}

      {trades.length > 0 && (
        <div className="space-y-4 sm:space-y-6">
          {hasExamples && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-neutral-800/50 rounded-lg px-3 sm:px-4 py-2.5 sm:py-2 border border-neutral-700">
              <p className="text-xs text-neutral-400">Example trades loaded — they won't sync to the cloud</p>
              <button
                onClick={removeExamples}
                className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 shrink-0" />
                Remove examples
              </button>
            </div>
          )}
          <MetricCards trades={trades} />
        </div>
      )}

      <div className={`min-w-0 bg-neutral-900 rounded-xl p-3 sm:p-4 border ${trades.length === 0 ? 'border-neutral-800/30 opacity-40' : 'border-neutral-800 mt-4 sm:mt-6'}`}>
        <h3 className="text-sm font-medium text-neutral-400 mb-3">Equity Curve</h3>
        <EquityChart trades={trades} />
      </div>

      {showForm && <TradeForm onClose={() => setShowForm(false)} />}
    </div>
  )
}
