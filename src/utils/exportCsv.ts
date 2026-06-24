import type { Trade } from '../types/trade'
import type { DateFilter } from '../store/tradeStore'

function getDateFilterLabel(filter: DateFilter): string {
  switch (filter) {
    case 'currentMonth': {
      const now = new Date()
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    }
    case 'lastMonth': {
      const now = new Date()
      const d = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    }
    case 'last30': return 'ultimos-30-dias'
    case 'all': return 'todo'
  }
}

export function exportCsv(trades: Trade[], dateFilter: DateFilter = 'all') {
  const headers = [
    'id', 'pair', 'exchange', 'side', 'entryDate', 'exitDate',
    'entryPrice', 'exitPrice', 'quantity', 'stopLoss', 'takeProfit',
    'result', 'rMultiple', 'roi', 'setup', 'tags', 'notes'
  ]
  const rows = trades.map(t => [
    t.id, t.pair, t.exchange, t.side, t.entryDate, t.exitDate,
    t.entryPrice, t.exitPrice, t.quantity, t.stopLoss, t.takeProfit,
    t.result, t.rMultiple, (t.roi ?? 0).toFixed(2),
    t.setup, t.tags.join(';'), `"${t.notes.replace(/"/g, '""')}"`,
  ].join(','))

  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `trades-${getDateFilterLabel(dateFilter)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
