import type { Trade } from '../../types/trade'

interface Props {
  trades: Trade[]
}

export default function SetupPerformance({ trades }: Props) {
  const bySetup = trades.reduce<Record<string, { wins: number; losses: number; total: number; count: number }>>((acc, t) => {
    const key = t.setup || 'Other'
    if (!acc[key]) acc[key] = { wins: 0, losses: 0, total: 0, count: 0 }
    acc[key].total += t.result
    acc[key].count++
    if (t.result > 0) acc[key].wins++
    else if (t.result < 0) acc[key].losses++
    return acc
  }, {})

  const data = Object.entries(bySetup)
    .map(([setup, v]) => ({
      setup,
      pnl: v.total,
      winRate: v.count > 0 ? (v.wins / v.count) * 100 : 0,
      count: v.count,
    }))
    .sort((a, b) => b.pnl - a.pnl)

  return (
    <div className="space-y-3">
      {data.map(d => (
        <div key={d.setup} className="flex items-center gap-3">
          <span className="text-sm w-28 text-neutral-300">{d.setup}</span>
          <div className="flex-1 bg-neutral-800 rounded-full h-5 overflow-hidden flex">
            <div
              className="h-full bg-green-600 transition-all"
              style={{ width: `${Math.max(0, (d.pnl / Math.max(...data.map(x => Math.abs(x.pnl)), 1)) * 50 + 50)}%` }}
            />
            <div
              className="h-full bg-red-600 transition-all"
              style={{ width: `${Math.max(0, (-d.pnl / Math.max(...data.map(x => Math.abs(x.pnl)), 1)) * 50 + 50)}%` }}
            />
          </div>
          <span className={`text-sm font-mono w-20 text-right ${d.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {d.pnl >= 0 ? '+' : ''}{d.pnl.toFixed(0)}
          </span>
          <span className="text-xs text-neutral-500 w-16 text-right">{d.winRate.toFixed(0)}% ({d.count})</span>
        </div>
      ))}
    </div>
  )
}
