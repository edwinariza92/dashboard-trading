import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Trade, TradeFormData } from '../types/trade'
import { seedTrades } from '../data/seedTrades'
import { saveTrade, deleteTradeFromRemote } from '../lib/supabaseService'
import { isSupabaseConfigured } from '../lib/supabase'
import { useAuthStore } from './authStore'

interface TradeStore {
  trades: Trade[]
  capital: number
  addTrade: (data: TradeFormData) => void
  updateTrade: (id: string, data: TradeFormData) => void
  deleteTrade: (id: string) => void
  getTrade: (id: string) => Trade | undefined
  setCapital: (capital: number) => void
  loadExamples: () => void
  removeExamples: () => void
}

function calcRMultiple(data: TradeFormData): number {
  const risk = Math.abs(data.entryPrice - data.stopLoss) * data.quantity
  return risk > 0 ? data.result / risk : 0
}

function formToTrade(data: TradeFormData, id: string): Trade {
  const rMultiple = calcRMultiple(data)
  return {
    ...data,
    id,
    tags: data.tags.split(',').map(t => t.trim()).filter(Boolean),
    result: data.result,
    roi: data.roi,
    rMultiple,
    fees: 0,
    fundingFees: 0,
  }
}

export function calcROI(result: number, capital: number): number {
  return capital > 0 ? (result / capital) * 100 : 0
}

export const useTradeStore = create<TradeStore>()(
  persist(
    (set, get) => ({
      trades: [],
      capital: 0,
      addTrade: (data) => {
        const trade = formToTrade(data, crypto.randomUUID())
        set({ trades: [trade, ...get().trades] })
        // Sync automático con Supabase
        if (isSupabaseConfigured()) {
          const userId = useAuthStore.getState().userId
          if (userId) {
            saveTrade(trade, userId).catch(console.error)
          }
        }
      },
      updateTrade: (id, data) => {
        const trade = formToTrade(data, id)
        set({ trades: get().trades.map(t => t.id === id ? trade : t) })
        // Sync automático con Supabase
        if (isSupabaseConfigured()) {
          const userId = useAuthStore.getState().userId
          if (userId) {
            saveTrade(trade, userId).catch(console.error)
          }
        }
      },
      deleteTrade: (id) => {
        set({ trades: get().trades.filter(t => t.id !== id) })
        // Sync automático con Supabase
        if (isSupabaseConfigured()) {
          deleteTradeFromRemote(id).catch(console.error)
        }
      },
      getTrade: (id) => {
        return get().trades.find(t => t.id === id)
      },
      setCapital: (capital) => {
        set({ capital })
      },
      loadExamples: () => {
        const existingIds = new Set(get().trades.map(t => t.id))
        const newExamples = seedTrades.filter(t => !existingIds.has(t.id))
        if (newExamples.length > 0) {
          set({ trades: [...newExamples, ...get().trades] })
        }
      },
      removeExamples: () => {
        set({ trades: get().trades.filter(t => !t.isExample) })
      },
    }),
    { name: 'trading-dashboard-trades' }
  )
)
