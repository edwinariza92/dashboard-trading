export type TradeSide = 'long' | 'short'
export type Emotion = 'neutral' | 'anxious' | 'confident' | 'impatient' | 'fearful' | 'greedy'
export type MistakeType = '' | 'late-entry' | 'early-exit' | 'no-stop-loss' | 'moved-stop' | 'overtrade' | 'revenge' | 'fomo' | 'other'

export interface Trade {
  id: string
  pair: string
  exchange: string
  side: TradeSide
  entryDate: string
  exitDate: string
  entryPrice: number
  exitPrice: number
  quantity: number
  stopLoss: number
  takeProfit: number
  fees: number
  fundingFees: number
  setup: string
  tags: string[]
  notes: string
  result: number
  rMultiple: number
  emotion: Emotion
  ruleAdherence: boolean
  revengeTrade: boolean
  mistakeType: MistakeType
  isExample?: boolean
}

export interface TradeFormData {
  pair: string
  exchange: string
  side: TradeSide
  entryDate: string
  exitDate: string
  entryPrice: number
  exitPrice: number
  quantity: number
  stopLoss: number
  takeProfit: number
  fees: number
  fundingFees: number
  setup: string
  tags: string
  notes: string
  emotion: Emotion
  ruleAdherence: boolean
  revengeTrade: boolean
  mistakeType: MistakeType
}
