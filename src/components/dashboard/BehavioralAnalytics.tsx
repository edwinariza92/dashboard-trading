import type { Trade } from '../../types/trade'

interface Props {
  trades: Trade[]
}

export default function BehavioralAnalytics({ trades }: Props) {
  const total = trades.length

  const followedPlan = trades.filter(t => t.ruleAdherence)
  const adherenceRate = total > 0 ? (followedPlan.length / total) * 100 : 0

  const revengeTrades = trades.filter(t => t.revengeTrade)
  const revengeRate = total > 0 ? (revengeTrades.length / total) * 100 : 0

  const adherencePnl = followedPlan.reduce((s, t) => s + t.result, 0)
  const noFollowTrades = trades.filter(t => !t.ruleAdherence)
  const noFollowPnl = noFollowTrades.reduce((s, t) => s + t.result, 0)

  const byEmotion = Object.entries(
    trades.reduce<Record<string, { count: number; pnl: number; wins: number }>>((acc, t) => {
      const e = t.emotion || 'neutral'
      if (!acc[e]) acc[e] = { count: 0, pnl: 0, wins: 0 }
      acc[e].count++
      acc[e].pnl += t.result
      if (t.result > 0) acc[e].wins++
      return acc
    }, {})
  ).sort((a, b) => b[1].pnl - a[1].pnl)

  const byMistake = Object.entries(
    trades.reduce<Record<string, { count: number; pnl: number }>>((acc, t) => {
      if (!t.mistakeType) return acc
      if (!acc[t.mistakeType]) acc[t.mistakeType] = { count: 0, pnl: 0 }
      acc[t.mistakeType].count++
      acc[t.mistakeType].pnl += t.result
      return acc
    }, {})
  ).sort((a, b) => b[1].pnl - a[1].pnl)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
          <p className="text-xs text-neutral-500 mb-1">Plan Adherence</p>
          <p className={`text-xl font-bold font-mono ${adherenceRate >= 80 ? 'text-green-500' : 'text-yellow-500'}`}>
            {adherenceRate.toFixed(1)}%
          </p>
          <p className="text-xs text-neutral-500 mt-1">{followedPlan.length}/{total} trades</p>
        </div>
        <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
          <p className="text-xs text-neutral-500 mb-1">P&L When Following Plan</p>
          <p className={`text-xl font-bold font-mono ${adherencePnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {adherencePnl >= 0 ? '+' : ''}{adherencePnl.toFixed(0)}
          </p>
        </div>
        <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
          <p className="text-xs text-neutral-500 mb-1">P&L When Not Following</p>
          <p className={`text-xl font-bold font-mono ${noFollowPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {noFollowPnl >= 0 ? '+' : ''}{noFollowPnl.toFixed(0)}
          </p>
        </div>
        <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
          <p className="text-xs text-neutral-500 mb-1">Revenge Trades</p>
          <p className="text-xl font-bold font-mono text-yellow-500">{revengeRate.toFixed(1)}%</p>
          <p className="text-xs text-neutral-500 mt-1">{revengeTrades.length} trades</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
          <h4 className="text-sm font-medium text-neutral-400 mb-3">Performance by Emotion</h4>
          <div className="space-y-2">
            {byEmotion.map(([emotion, data]) => (
              <div key={emotion} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-300 capitalize">{emotion}</span>
                  <span className="text-xs text-neutral-500">({data.count})</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-neutral-500">{data.wins}/{data.count} wins</span>
                  <span className={`text-sm font-mono ${data.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {data.pnl >= 0 ? '+' : ''}{data.pnl.toFixed(0)}
                  </span>
                </div>
              </div>
            ))}
            {byEmotion.length === 0 && <p className="text-sm text-neutral-600">No emotion data recorded</p>}
          </div>
        </div>

        <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
          <h4 className="text-sm font-medium text-neutral-400 mb-3">Mistakes Breakdown</h4>
          <div className="space-y-2">
            {byMistake.length === 0 && <p className="text-sm text-neutral-600">No mistakes recorded</p>}
            {byMistake.map(([mistake, data]) => (
              <div key={mistake} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-300 capitalize">{mistake.replace(/-/g, ' ')}</span>
                  <span className="text-xs text-neutral-500">({data.count})</span>
                </div>
                <span className={`text-sm font-mono ${data.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {data.pnl >= 0 ? '+' : ''}{data.pnl.toFixed(0)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
