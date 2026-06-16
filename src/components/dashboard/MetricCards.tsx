import type { Trade } from '../../types/trade'

interface Props {
  trades: Trade[]
}

export default function MetricCards({ trades }: Props) {
  const total = trades.length
  if (total === 0) return null

  const wins = trades.filter(t => t.result > 0)
  const losses = trades.filter(t => t.result < 0)
  const winRate = (wins.length / total) * 100

  const grossProfit = wins.reduce((s, t) => s + t.result, 0)
  const grossLoss = Math.abs(losses.reduce((s, t) => s + t.result, 0))
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0

  const totalPnl = trades.reduce((s, t) => s + t.result, 0)
  const expectancy = totalPnl / total

  const avgWin = wins.length > 0 ? grossProfit / wins.length : 0
  const avgLoss = losses.length > 0 ? grossLoss / losses.length : 0

  let peak = 0
  let maxDrawdown = 0
  let cum = 0
  for (const t of [...trades].reverse()) {
    cum += t.result
    peak = Math.max(peak, cum)
    maxDrawdown = Math.max(maxDrawdown, peak - cum)
  }

  const bestStreak = (() => {
    let max = 0, cur = 0
    for (const t of [...trades].reverse()) {
      if (t.result > 0) { cur++; max = Math.max(max, cur) }
      else cur = 0
    }
    return max
  })()

  const worstStreak = (() => {
    let max = 0, cur = 0
    for (const t of [...trades].reverse()) {
      if (t.result < 0) { cur++; max = Math.max(max, cur) }
      else cur = 0
    }
    return max
  })()

  const cards = [
    { label: 'Total P&L', value: totalPnl, prefix: '$', color: totalPnl >= 0 ? 'text-green-500' : 'text-red-500' },
    { label: 'Win Rate', value: winRate, suffix: '%', color: 'text-white' },
    { label: 'Profit Factor', value: profitFactor === Infinity ? '∞' : profitFactor.toFixed(2), color: profitFactor >= 1.5 ? 'text-green-500' : 'text-yellow-500' },
    { label: 'Expectancy', value: expectancy, prefix: '$', color: expectancy >= 0 ? 'text-green-500' : 'text-red-500' },
    { label: 'Max Drawdown', value: maxDrawdown, prefix: '$', color: 'text-red-500' },
    { label: 'Avg Win', value: avgWin, prefix: '$', color: 'text-green-500' },
    { label: 'Avg Loss', value: avgLoss, prefix: '$', color: 'text-red-500' },
    { label: 'Best Streak', value: bestStreak, suffix: ' wins', color: 'text-green-500' },
    { label: 'Worst Streak', value: worstStreak, suffix: ' losses', color: 'text-red-500' },
    { label: 'Total Trades', value: total, color: 'text-white' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map(c => (
        <div key={c.label} className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
          <p className="text-xs text-neutral-500 mb-1">{c.label}</p>
          <p className={`text-xl font-bold font-mono ${c.color}`}>
            {c.prefix}{typeof c.value === 'number' ? (c.value >= 0 ? '+' : '') + c.value.toFixed(2) : c.value}{c.suffix}
          </p>
        </div>
      ))}
    </div>
  )
}
