import { useState } from 'react'
import type { Trade } from '../../types/trade'
import { useTradeStore } from '../../store/tradeStore'
import TradeForm from './TradeForm'
import { Trash2, Pencil, ArrowUpDown } from 'lucide-react'

interface Props {
  trades: Trade[]
}

type SortKey = 'entryDate' | 'pair' | 'side' | 'result' | 'rMultiple' | 'roi' | 'setup'

export default function TradeTable({ trades }: Props) {
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'entryDate', dir: 'desc' })
  const [filter, setFilter] = useState('')
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null)
  const deleteTrade = useTradeStore(s => s.deleteTrade)

  const toggleSort = (key: SortKey) => {
    setSort(prev => prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' })
  }

  const filtered = trades
    .filter(t =>
      t.pair.toLowerCase().includes(filter.toLowerCase()) ||
      t.setup.toLowerCase().includes(filter.toLowerCase()) ||
      t.tags.some(tag => tag.toLowerCase().includes(filter.toLowerCase()))
    )
    .sort((a, b) => {
      if (sort.key === 'roi') {
        return sort.dir === 'asc' ? (a.roi ?? 0) - (b.roi ?? 0) : (b.roi ?? 0) - (a.roi ?? 0)
      }
      const aVal = a[sort.key]
      const bVal = b[sort.key]
      const cmp = typeof aVal === 'string' ? aVal.localeCompare(bVal as string) : (aVal as number) - (bVal as number)
      return sort.dir === 'asc' ? cmp : -cmp
    })

  const fmt = (n: number) => {
    const s = n.toFixed(2)
    return n >= 0 ? `+${s}` : s
  }

  const fmtDate = (d: string) => new Date(d).toLocaleDateString()

  return (
    <div>
      <input
        placeholder="Search by pair, setup, or tag..."
        value={filter}
        onChange={e => setFilter(e.target.value)}
        className="w-full max-w-md bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:border-green-500"
      />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-800 text-neutral-400">
              {(['entryDate', 'pair', 'side', 'setup', 'result', 'rMultiple', 'roi'] as SortKey[]).map(key => (
                <th key={key} className="text-left py-3 px-3 font-medium cursor-pointer hover:text-white" onClick={() => toggleSort(key)}>
                  <div className="flex items-center gap-1">
                    {key === 'entryDate' ? 'Date' : key === 'roi' ? 'ROI' : key.charAt(0).toUpperCase() + key.slice(1)}
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
              ))}
              <th className="text-left py-3 px-3 font-medium">Tags</th>
              <th className="text-left py-3 px-3 font-medium">Behavior</th>
              <th className="py-3 px-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => {
              return (
                <tr key={t.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/30">
                  <td className="py-3 px-3">{fmtDate(t.entryDate)}</td>
                  <td className="py-3 px-3 font-medium">{t.pair}</td>
                  <td className="py-3 px-3">
                    <span className={`text-xs font-medium ${t.side === 'long' ? 'text-green-500' : 'text-red-500'}`}>
                      {t.side.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-neutral-400">{t.setup}</td>
                  <td className={`py-3 px-3 font-mono ${t.result >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {fmt(t.result)}
                  </td>
                  <td className={`py-3 px-3 font-mono ${t.rMultiple >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {t.rMultiple.toFixed(2)}R
                  </td>
                  <td className={`py-3 px-3 font-mono ${(t.roi ?? 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {(t.roi ?? 0) >= 0 ? '+' : ''}{(t.roi ?? 0).toFixed(2)}%
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex gap-1">
                      {t.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-xs bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1">
                      {!t.ruleAdherence && <span className="text-xs text-red-500" title="Did not follow plan">⚠</span>}
                      {t.revengeTrade && <span className="text-xs text-yellow-500" title="Revenge trade">↩</span>}
                      {t.mistakeType && <span className="text-xs text-neutral-500">{t.mistakeType}</span>}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex gap-1">
                      <button onClick={() => setEditingTrade(t)}
                        className="text-neutral-600 hover:text-blue-500 transition-colors cursor-pointer p-1">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteTrade(t.id)}
                        className="text-neutral-600 hover:text-red-500 transition-colors cursor-pointer p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {editingTrade && <TradeForm onClose={() => setEditingTrade(null)} editTrade={editingTrade} />}
    </div>
  )
}
