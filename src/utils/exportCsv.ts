import type { Trade } from '../types/trade'

export function exportCsv(trades: Trade[]) {
  const headers = [
    'id', 'pair', 'exchange', 'side', 'entryDate', 'exitDate',
    'entryPrice', 'exitPrice', 'quantity', 'stopLoss', 'takeProfit',
    'fees', 'fundingFees', 'setup', 'tags', 'notes', 'result', 'rMultiple'
  ]
  const rows = trades.map(t => [
    t.id, t.pair, t.exchange, t.side, t.entryDate, t.exitDate,
    t.entryPrice, t.exitPrice, t.quantity, t.stopLoss, t.takeProfit,
    t.fees, t.fundingFees, t.setup, t.tags.join(';'), `"${t.notes.replace(/"/g, '""')}"`,
    t.result, t.rMultiple,
  ].join(','))

  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `trades-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
