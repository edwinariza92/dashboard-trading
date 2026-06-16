import { supabase, isSupabaseConfigured } from './supabase'
import type { Trade } from '../types/trade'

export async function fetchTrades(userId: string): Promise<Trade[]> {
  if (!isSupabaseConfigured()) return []
  const { data, error } = await supabase!
    .from('trades')
    .select('*')
    .eq('user_id', userId)
    .order('exit_date', { ascending: false })
  if (error) throw error
  return (data || []).map(mapRowToTrade)
}

export async function saveTrade(trade: Trade, userId: string) {
  if (!isSupabaseConfigured()) return
  const { error } = await supabase!
    .from('trades')
    .upsert({ ...mapTradeToRow(trade), user_id: userId })
  if (error) throw error
}

export async function deleteTradeFromRemote(id: string) {
  if (!isSupabaseConfigured()) return
  const { error } = await supabase!
    .from('trades')
    .delete()
    .eq('id', id)
  if (error) throw error
}

function mapTradeToRow(t: Trade) {
  return {
    id: t.id,
    pair: t.pair,
    exchange: t.exchange,
    side: t.side,
    entry_date: t.entryDate,
    exit_date: t.exitDate,
    entry_price: t.entryPrice,
    exit_price: t.exitPrice,
    quantity: t.quantity,
    stop_loss: t.stopLoss,
    take_profit: t.takeProfit,
    fees: t.fees,
    funding_fees: t.fundingFees,
    setup: t.setup,
    tags: t.tags,
    notes: t.notes,
    result: t.result,
    r_multiple: t.rMultiple,
    emotion: t.emotion,
    rule_adherence: t.ruleAdherence,
    revenge_trade: t.revengeTrade,
    mistake_type: t.mistakeType,
  }
}

function mapRowToTrade(row: any): Trade {
  return {
    id: row.id,
    pair: row.pair,
    exchange: row.exchange,
    side: row.side,
    entryDate: row.entry_date,
    exitDate: row.exit_date,
    entryPrice: row.entry_price,
    exitPrice: row.exit_price,
    quantity: row.quantity,
    stopLoss: row.stop_loss,
    takeProfit: row.take_profit,
    fees: row.fees,
    fundingFees: row.funding_fees,
    setup: row.setup,
    tags: row.tags || [],
    notes: row.notes || '',
    result: row.result,
    rMultiple: row.r_multiple,
    emotion: row.emotion || 'neutral',
    ruleAdherence: row.rule_adherence ?? true,
    revengeTrade: row.revenge_trade ?? false,
    mistakeType: row.mistake_type || '',
  }
}

export async function signUp(email: string, password: string) {
  if (!isSupabaseConfigured()) throw new Error('Supabase not configured')
  const { data, error } = await supabase!.auth.signUp({ email, password })
  if (error) throw error
  return data
}

export async function signIn(email: string, password: string) {
  if (!isSupabaseConfigured()) throw new Error('Supabase not configured')
  const { data, error } = await supabase!.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  if (!isSupabaseConfigured()) return
  await supabase!.auth.signOut()
}
