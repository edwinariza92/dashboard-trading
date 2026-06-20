import { useState } from 'react'
import { useTradeStore } from '../../store/tradeStore'
import { X } from 'lucide-react'
import type { TradeSide, Emotion, MistakeType, Trade } from '../../types/trade'
import type { GeminiTradeData } from '../../lib/gemini'
import ScreenshotUploader from './ScreenshotUploader'

interface Props {
  onClose: () => void
  editTrade?: Trade
}

interface FormState {
  pair: string
  exchange: string
  side: TradeSide
  entryDate: string
  exitDate: string
  entryPrice: string
  exitPrice: string
  quantity: string
  stopLoss: string
  takeProfit: string
  fees: string
  fundingFees: string
  setup: string
  tags: string
  notes: string
  emotion: Emotion
  ruleAdherence: boolean
  revengeTrade: boolean
  mistakeType: MistakeType
}

const defaultForm: FormState = {
  pair: '',
  exchange: 'Binance',
  side: 'long',
  entryDate: new Date().toISOString().slice(0, 16),
  exitDate: new Date().toISOString().slice(0, 16),
  entryPrice: '',
  exitPrice: '',
  quantity: '',
  stopLoss: '',
  takeProfit: '',
  fees: '',
  fundingFees: '',
  setup: '',
  tags: '',
  notes: '',
  emotion: 'neutral',
  ruleAdherence: true,
  revengeTrade: false,
  mistakeType: '',
}

const setups = ['Breakout', 'Reversal', 'Scalping', 'Trend Following', 'Range', 'News', 'Other']
const emotions: Emotion[] = ['neutral', 'confident', 'anxious', 'impatient', 'fearful', 'greedy']
const mistakeOptions: { value: MistakeType; label: string }[] = [
  { value: '', label: 'None' },
  { value: 'late-entry', label: 'Late Entry' },
  { value: 'early-exit', label: 'Early Exit' },
  { value: 'no-stop-loss', label: 'No Stop Loss' },
  { value: 'moved-stop', label: 'Moved Stop Loss' },
  { value: 'overtrade', label: 'Overtrade' },
  { value: 'revenge', label: 'Revenge Trade' },
  { value: 'fomo', label: 'FOMO' },
  { value: 'other', label: 'Other' },
]

function toNum(v: string) {
  return v === '' ? 0 : parseFloat(v) || 0
}

function formToTradeData(form: FormState) {
  return {
    pair: form.pair,
    exchange: form.exchange,
    side: form.side,
    entryDate: form.entryDate,
    exitDate: form.exitDate,
    entryPrice: toNum(form.entryPrice),
    exitPrice: toNum(form.exitPrice),
    quantity: toNum(form.quantity),
    stopLoss: toNum(form.stopLoss),
    takeProfit: toNum(form.takeProfit),
    fees: toNum(form.fees),
    fundingFees: toNum(form.fundingFees),
    setup: form.setup,
    tags: form.tags,
    notes: form.notes,
    emotion: form.emotion,
    ruleAdherence: form.ruleAdherence,
    revengeTrade: form.revengeTrade,
    mistakeType: form.mistakeType,
  }
}

function tradeToForm(t: Trade): FormState {
  return {
    pair: t.pair,
    exchange: t.exchange,
    side: t.side,
    entryDate: t.entryDate.slice(0, 16),
    exitDate: t.exitDate.slice(0, 16),
    entryPrice: String(t.entryPrice),
    exitPrice: String(t.exitPrice),
    quantity: String(t.quantity),
    stopLoss: String(t.stopLoss),
    takeProfit: String(t.takeProfit),
    fees: String(t.fees),
    fundingFees: String(t.fundingFees),
    setup: t.setup,
    tags: t.tags.join(', '),
    notes: t.notes,
    emotion: t.emotion,
    ruleAdherence: t.ruleAdherence,
    revengeTrade: t.revengeTrade,
    mistakeType: t.mistakeType,
  }
}

export default function TradeForm({ onClose, editTrade }: Props) {
  const [form, setForm] = useState<FormState>(() =>
    editTrade ? tradeToForm(editTrade) : { ...defaultForm }
  )

  const addTrade = useTradeStore(s => s.addTrade)
  const updateTrade = useTradeStore(s => s.updateTrade)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data = formToTradeData(form)
    if (editTrade) {
      updateTrade(editTrade.id, data)
    } else {
      addTrade(data)
    }
    onClose()
  }

  const update = (field: keyof FormState, value: string | boolean) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handleAnalysisComplete = (data: GeminiTradeData) => {
    setForm(prev => ({
      ...prev,
      pair: data.pair || prev.pair,
      exchange: data.exchange || prev.exchange,
      side: data.side || prev.side,
      entryPrice: data.entryPrice !== null ? String(data.entryPrice) : prev.entryPrice,
      exitPrice: data.exitPrice !== null ? String(data.exitPrice) : prev.exitPrice,
      entryDate: data.entryDate || prev.entryDate,
      exitDate: data.exitDate || prev.exitDate,
      quantity: data.quantity !== null ? String(data.quantity) : prev.quantity,
      stopLoss: data.stopLoss !== null ? String(data.stopLoss) : prev.stopLoss,
      takeProfit: data.takeProfit !== null ? String(data.takeProfit) : prev.takeProfit,
      fees: data.fees !== null ? String(data.fees) : prev.fees,
      setup: data.setup !== 'other' ? data.setup : prev.setup,
    }))
  }

  const inputCls = "w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
  const labelCls = "block text-sm text-neutral-400 mb-1"

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-neutral-900 rounded-t-2xl sm:rounded-2xl border border-neutral-800 w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto mx-0 sm:mx-4">
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-5 border-b border-neutral-800">
          <h3 className="text-base sm:text-lg font-semibold">{editTrade ? 'Edit Trade' : 'New Trade'}</h3>
          <button onClick={onClose} className="text-neutral-500 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          {!editTrade && (
            <ScreenshotUploader onAnalysisComplete={handleAnalysisComplete} />
          )}

          <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider">Trade Details</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className={labelCls}>Pair</label>
              <input required placeholder="BTC/USDT" value={form.pair} onChange={e => update('pair', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Exchange</label>
              <input placeholder="Binance" value={form.exchange} onChange={e => update('exchange', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Side</label>
              <select value={form.side} onChange={e => update('side', e.target.value)} className={inputCls}>
                <option value="long">Long</option>
                <option value="short">Short</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Setup</label>
              <select value={form.setup} onChange={e => update('setup', e.target.value)} className={inputCls}>
                <option value="">Select...</option>
                {setups.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Entry Date</label>
              <input type="datetime-local" required value={form.entryDate} onChange={e => update('entryDate', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Exit Date</label>
              <input type="datetime-local" required value={form.exitDate} onChange={e => update('exitDate', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Entry Price</label>
              <input type="number" required step="any" min="0" value={form.entryPrice} onChange={e => update('entryPrice', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Exit Price</label>
              <input type="number" required step="any" min="0" value={form.exitPrice} onChange={e => update('exitPrice', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Quantity</label>
              <input type="number" required step="any" min="0" value={form.quantity} onChange={e => update('quantity', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Stop Loss <span className="text-neutral-600">(price)</span></label>
              <input type="number" step="any" min="0" placeholder="e.g. 64000" value={form.stopLoss} onChange={e => update('stopLoss', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Take Profit <span className="text-neutral-600">(price)</span></label>
              <input type="number" step="any" min="0" placeholder="e.g. 67000" value={form.takeProfit} onChange={e => update('takeProfit', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Fees</label>
              <input type="number" step="any" min="0" value={form.fees} onChange={e => update('fees', e.target.value)} placeholder="0" className={inputCls} />
            </div>
          </div>

          <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider pt-2">Behavioral & Notes</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className={labelCls}>Emotion at Entry</label>
              <select value={form.emotion} onChange={e => update('emotion', e.target.value)} className={inputCls}>
                {emotions.map(e => <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Mistake Type</label>
              <select value={form.mistakeType} onChange={e => update('mistakeType', e.target.value)} className={inputCls}>
                {mistakeOptions.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 pt-4 sm:pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.ruleAdherence} onChange={e => update('ruleAdherence', e.target.checked)}
                  className="w-4 h-4 rounded border-neutral-700 bg-neutral-800 accent-green-500" />
                <span className="text-sm text-neutral-300">Followed the plan</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.revengeTrade} onChange={e => update('revengeTrade', e.target.checked)}
                  className="w-4 h-4 rounded border-neutral-700 bg-neutral-800 accent-green-500" />
                <span className="text-sm text-neutral-300">Revenge trade</span>
              </label>
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Tags (comma separated)</label>
              <input placeholder="scalping, btc, impulsive" value={form.tags} onChange={e => update('tags', e.target.value)} className={inputCls} />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Notes</label>
              <textarea rows={3} value={form.notes} onChange={e => update('notes', e.target.value)}
                className={`${inputCls} resize-none`} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors cursor-pointer">
              Cancel
            </button>
            <button type="submit"
              className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors cursor-pointer">
              {editTrade ? 'Update Trade' : 'Save Trade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
