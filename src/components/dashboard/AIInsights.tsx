import { useState } from 'react'
import type { Trade } from '../../types/trade'
import { analyzePerformance } from '../../lib/gemini'
import { Sparkles, Loader2, RefreshCw } from 'lucide-react'

interface Props {
  trades: Trade[]
}

export default function AIInsights({ trades }: Props) {
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    setLoading(true)
    setError(null)

    const wins = trades.filter(t => t.result > 0)
    const losses = trades.filter(t => t.result < 0)
    const grossProfit = wins.reduce((s, t) => s + t.result, 0)
    const grossLoss = Math.abs(losses.reduce((s, t) => s + t.result, 0))

    let peak = 0
    let maxDrawdown = 0
    let cum = 0
    for (const t of [...trades].reverse()) {
      cum += t.result
      peak = Math.max(peak, cum)
      maxDrawdown = Math.max(maxDrawdown, peak - cum)
    }

    const bySetup: Record<string, { count: number; pnl: number; wins: number }> = {}
    for (const t of trades) {
      const s = t.setup || 'Other'
      if (!bySetup[s]) bySetup[s] = { count: 0, pnl: 0, wins: 0 }
      bySetup[s].count++
      bySetup[s].pnl += t.result
      if (t.result > 0) bySetup[s].wins++
    }

    const byEmotion: Record<string, { count: number; pnl: number; wins: number }> = {}
    for (const t of trades) {
      const e = t.emotion || 'neutral'
      if (!byEmotion[e]) byEmotion[e] = { count: 0, pnl: 0, wins: 0 }
      byEmotion[e].count++
      byEmotion[e].pnl += t.result
      if (t.result > 0) byEmotion[e].wins++
    }

    const mistakes: Record<string, number> = {}
    for (const t of trades) {
      if (t.mistakeType) {
        mistakes[t.mistakeType] = (mistakes[t.mistakeType] || 0) + 1
      }
    }

    const setupEntries = Object.entries(bySetup).sort((a, b) => b[1].pnl - a[1].pnl)
    const emotionEntries = Object.entries(byEmotion).sort((a, b) => b[1].pnl - a[1].pnl)
    const sortedMistakes = Object.entries(mistakes).sort((a, b) => b[1] - a[1])

    const followedPlan = trades.filter(t => t.ruleAdherence)
    const revengeTrades = trades.filter(t => t.revengeTrade)

    // ROI por setup
    const roiBySetup: Record<string, { count: number; totalRoi: number }> = {}
    for (const t of trades) {
      const s = t.setup || 'Other'
      if (!roiBySetup[s]) roiBySetup[s] = { count: 0, totalRoi: 0 }
      roiBySetup[s].count++
      roiBySetup[s].totalRoi += (t.roi ?? 0)
    }

    // ROI por emoción
    const roiByEmotion: Record<string, { count: number; totalRoi: number }> = {}
    for (const t of trades) {
      const e = t.emotion || 'neutral'
      if (!roiByEmotion[e]) roiByEmotion[e] = { count: 0, totalRoi: 0 }
      roiByEmotion[e].count++
      roiByEmotion[e].totalRoi += (t.roi ?? 0)
    }

    // ROI Trend: últimos 10 trades vs anteriores
    const sortedTrades = [...trades].reverse()
    const recentTrades = sortedTrades.slice(-10)
    const previousTrades = sortedTrades.slice(0, -10)
    const recentAvgRoi = recentTrades.length > 0
      ? recentTrades.reduce((s, t) => s + (t.roi ?? 0), 0) / recentTrades.length
      : 0
    const previousAvgRoi = previousTrades.length > 0
      ? previousTrades.reduce((s, t) => s + (t.roi ?? 0), 0) / previousTrades.length
      : 0

    const summary = {
      totalTrades: trades.length,
      wins: wins.length,
      losses: losses.length,
      winRate: trades.length > 0 ? (wins.length / trades.length) * 100 : 0,
      totalPnl: trades.reduce((s, t) => s + t.result, 0),
      profitFactor: grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0,
      expectancy: trades.length > 0 ? trades.reduce((s, t) => s + t.result, 0) / trades.length : 0,
      avgRMultiple: trades.length > 0 ? trades.reduce((s, t) => s + t.rMultiple, 0) / trades.length : 0,
      avgROI: trades.length > 0 ? trades.reduce((s, t) => s + (t.roi ?? 0), 0) / trades.length : 0,
      maxDrawdown,
      bestSetup: setupEntries[0]?.[0] || '-',
      worstSetup: setupEntries[setupEntries.length - 1]?.[0] || '-',
      bestPair: [...new Set(trades.map(t => t.pair))]
        .map(p => ({ pair: p, pnl: trades.filter(t => t.pair === p).reduce((s, t) => s + t.result, 0) }))
        .sort((a, b) => b.pnl - a.pnl)[0]?.pair || '-',
      revengeTradeRate: trades.length > 0 ? (revengeTrades.length / trades.length) * 100 : 0,
      planAdherenceRate: trades.length > 0 ? (followedPlan.length / trades.length) * 100 : 0,
      commonMistakes: sortedMistakes.slice(0, 3).map(([m]) => m.replace(/-/g, ' ')),
      emotionPerformance: Object.fromEntries(
        emotionEntries.map(([emotion, data]) => [emotion, {
          count: data.count,
          pnl: data.pnl,
          winRate: data.count > 0 ? (data.wins / data.count) * 100 : 0,
        }])
      ),
      setupPerformance: Object.fromEntries(
        setupEntries.map(([setup, data]) => [setup, {
          count: data.count,
          pnl: data.pnl,
          winRate: data.count > 0 ? (data.wins / data.count) * 100 : 0,
        }])
      ),
      roiBySetup: Object.fromEntries(
        Object.entries(roiBySetup).map(([setup, data]) => [setup, {
          count: data.count,
          avgRoi: data.count > 0 ? data.totalRoi / data.count : 0,
        }])
      ),
      roiByEmotion: Object.fromEntries(
        Object.entries(roiByEmotion).map(([emotion, data]) => [emotion, {
          count: data.count,
          avgRoi: data.count > 0 ? data.totalRoi / data.count : 0,
        }])
      ),
      roiTrend: { recent: recentAvgRoi, previous: previousAvgRoi },
    }

    try {
      const result = await analyzePerformance(summary)
      setAnalysis(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar el análisis')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-w-0 bg-neutral-900 rounded-xl p-4 border border-neutral-800">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-neutral-400">
          <Sparkles className="w-4 h-4 inline mr-1 text-purple-400" />
          AI Performance Analysis
        </h3>
        {analysis && (
          <button onClick={handleAnalyze} disabled={loading}
            className="flex items-center gap-1 text-xs text-neutral-500 hover:text-white transition-colors cursor-pointer disabled:opacity-50">
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            Regenerate
          </button>
        )}
      </div>

      {!analysis && !loading && (
        <div className="text-center py-8">
          <p className="text-sm text-neutral-500 mb-4">
            Get an AI-powered analysis of your trading performance with actionable recommendations.
          </p>
          <button onClick={handleAnalyze}
            className="flex items-center gap-2 mx-auto px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer">
            <Sparkles className="w-4 h-4" />
            Generate Analysis
          </button>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin mb-3" />
          <p className="text-sm text-neutral-400">Analyzing your performance...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-8">
          <p className="text-sm text-red-400 mb-3">{error}</p>
          <button onClick={handleAnalyze}
            className="text-sm text-neutral-400 hover:text-white transition-colors cursor-pointer">
            Try again
          </button>
        </div>
      )}

      {analysis && !loading && (
        <div className="prose prose-invert prose-sm max-w-none
          prose-headings:text-neutral-200 prose-p:text-neutral-300 prose-li:text-neutral-300
          prose-strong:text-white prose-code:text-purple-400 prose-pre:bg-neutral-800
          [&>h1]:text-lg [&>h2]:text-base [&>h3]:text-sm">
          {analysis.split('\n').map((line, i) => {
            if (line.startsWith('# ')) return <h1 key={i} className="text-lg font-bold mt-4 mb-2">{line.slice(2)}</h1>
            if (line.startsWith('## ')) return <h2 key={i} className="text-base font-semibold mt-4 mb-2">{line.slice(3)}</h2>
            if (line.startsWith('### ')) return <h3 key={i} className="text-sm font-semibold mt-3 mb-1">{line.slice(4)}</h3>
            if (line.startsWith('- ')) return <li key={i} className="ml-4 text-sm">{line.slice(2)}</li>
            if (line.match(/^\d+\.\s/)) return <li key={i} className="ml-4 text-sm list-decimal">{line.replace(/^\d+\.\s/, '')}</li>
            if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="font-bold text-white mt-2">{line.slice(2, -2)}</p>
            if (line.trim() === '') return <br key={i} />
            return <p key={i} className="text-sm text-neutral-300 leading-relaxed">{line}</p>
          })}
        </div>
      )}
    </div>
  )
}
