import { useTradeStore, calcROI } from '../store/tradeStore'
import PerformanceCalendar from '../components/dashboard/PerformanceCalendar'
import RMultipleDistribution from '../components/dashboard/RMultipleDistribution'
import SetupPerformance from '../components/dashboard/SetupPerformance'
import BehavioralAnalytics from '../components/dashboard/BehavioralAnalytics'
import AIInsights from '../components/dashboard/AIInsights'

export default function Analytics() {
  const trades = useTradeStore(s => s.trades)
  const capital = useTradeStore(s => s.capital)

  const wins = trades.filter(t => t.result > 0)
  const losses = trades.filter(t => t.result < 0)
  const winRate = trades.length > 0 ? (wins.length / trades.length) * 100 : 0
  const grossProfit = wins.reduce((s, t) => s + t.result, 0)
  const grossLoss = Math.abs(losses.reduce((s, t) => s + t.result, 0))
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0
  const totalPnl = trades.reduce((s, t) => s + t.result, 0)
  const expectancy = trades.length > 0 ? totalPnl / trades.length : 0
  const avgR = trades.length > 0 ? trades.reduce((s, t) => s + t.rMultiple, 0) / trades.length : 0
  const avgROI = capital > 0 ? trades.reduce((s, t) => s + calcROI(t.result, capital), 0) / trades.length : 0

  const pairs = [...new Set(trades.map(t => t.pair))]
  const bestPair = pairs.map(p => ({
    pair: p,
    pnl: trades.filter(t => t.pair === p).reduce((s, t) => s + t.result, 0),
  })).sort((a, b) => b.pnl - a.pnl)[0]

  return (
    <div className="min-w-0">
      <h2 className="text-2xl font-bold mb-6">Analytics</h2>

      {trades.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-neutral-500">
          <p className="text-lg mb-2">No data to analyze</p>
          <p className="text-sm">Add trades to see analytics</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="min-w-0 bg-neutral-900 rounded-xl p-4 border border-neutral-800">
              <h3 className="text-sm font-medium text-neutral-400 mb-3">Performance Calendar</h3>
              <PerformanceCalendar trades={trades} />
            </div>

            <div className="min-w-0 bg-neutral-900 rounded-xl p-4 border border-neutral-800">
              <h3 className="text-sm font-medium text-neutral-400 mb-3">R-Multiple Distribution</h3>
              <RMultipleDistribution trades={trades} />
            </div>

            <div className="min-w-0 bg-neutral-900 rounded-xl p-4 border border-neutral-800">
              <h3 className="text-sm font-medium text-neutral-400 mb-3">Performance by Setup</h3>
              <SetupPerformance trades={trades} />
            </div>

            <div className="min-w-0 bg-neutral-900 rounded-xl p-4 border border-neutral-800">
              <h3 className="text-sm font-medium text-neutral-400 mb-3">Summary</h3>
              <div className="space-y-3">
                {[
                  { label: 'Total P&L', value: totalPnl, fmt: 'currency' },
                  { label: 'Win Rate', value: winRate, fmt: 'percent' },
                  { label: 'Profit Factor', value: profitFactor, fmt: 'decimal' },
                  { label: 'Expectancy', value: expectancy, fmt: 'currency' },
                  { label: 'Avg R Multiple', value: avgR, fmt: 'r' },
                  { label: 'Avg ROI', value: avgROI, fmt: 'percent' },
                  { label: 'Total Trades', value: trades.length, fmt: 'number' },
                  { label: 'Winning Trades', value: wins.length, fmt: 'number' },
                  { label: 'Losing Trades', value: losses.length, fmt: 'number' },
                  { label: 'Best Pair', value: bestPair ? `${bestPair.pair} (${bestPair.pnl >= 0 ? '+' : ''}${bestPair.pnl.toFixed(0)})` : '-', fmt: 'string' },
                ].map(row => (
                  <div key={row.label} className="flex justify-between text-sm">
                    <span className="text-neutral-400">{row.label}</span>
                    <span className="font-mono">{formatValue(row.value, row.fmt)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="min-w-0 bg-neutral-900 rounded-xl p-4 border border-neutral-800">
            <h3 className="text-sm font-medium text-neutral-400 mb-3">Behavioral Analytics</h3>
            <BehavioralAnalytics trades={trades} />
          </div>

          <AIInsights trades={trades} />
        </div>
      )}
    </div>
  )
}

function formatValue(value: number | string, fmt: string) {
  if (typeof value === 'string') return value
  switch (fmt) {
    case 'currency':
      return `${value >= 0 ? '+' : ''}${value.toFixed(2)}`
    case 'percent':
      return `${value.toFixed(1)}%`
    case 'decimal':
      return value === Infinity ? '∞' : value.toFixed(2)
    case 'r':
      return `${value >= 0 ? '+' : ''}${value.toFixed(2)}R`
    case 'number':
      return value.toLocaleString()
    default:
      return String(value)
  }
}
