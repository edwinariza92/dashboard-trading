import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Trade, TradeFormData } from '../types/trade'

interface TradeStore {
  trades: Trade[]
  addTrade: (data: TradeFormData) => void
  updateTrade: (id: string, data: TradeFormData) => void
  deleteTrade: (id: string) => void
  getTrade: (id: string) => Trade | undefined
}

function calcResult(data: TradeFormData): { result: number; rMultiple: number } {
  const diff = data.side === 'long'
    ? data.exitPrice - data.entryPrice
    : data.entryPrice - data.exitPrice
  const gross = diff * data.quantity
  const result = gross - data.fees - data.fundingFees
  const risk = Math.abs(data.entryPrice - data.stopLoss) * data.quantity
  const rMultiple = risk > 0 ? result / risk : 0
  return { result, rMultiple }
}

function formToTrade(data: TradeFormData, id: string): Trade {
  const { result, rMultiple } = calcResult(data)
  return {
    ...data,
    id,
    tags: data.tags.split(',').map(t => t.trim()).filter(Boolean),
    result,
    rMultiple,
  }
}

export const useTradeStore = create<TradeStore>()(
  persist(
    (set, get) => ({
      trades: [],
      addTrade: (data) => {
        const trade = formToTrade(data, crypto.randomUUID())
        set({ trades: [trade, ...get().trades] })
      },
      updateTrade: (id, data) => {
        const trade = formToTrade(data, id)
        set({ trades: get().trades.map(t => t.id === id ? trade : t) })
      },
      deleteTrade: (id) => {
        set({ trades: get().trades.filter(t => t.id !== id) })
      },
      getTrade: (id) => {
        return get().trades.find(t => t.id === id)
      },
    }),
    { name: 'trading-dashboard-trades' }
  )
)
