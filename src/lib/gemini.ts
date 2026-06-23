import { GoogleGenAI } from '@google/genai'

const apiKey = import.meta.env.VITE_GEMINI_API_KEY
console.log('Gemini API key loaded:', apiKey ? `${apiKey.substring(0, 8)}...` : 'MISSING')
const ai = new GoogleGenAI({ apiKey })

export interface GeminiTradeData {
  pair: string
  exchange: string
  side: 'long' | 'short'
  entryPrice: number | null
  exitPrice: number | null
  entryDate: string | null
  exitDate: string | null
  quantity: number | null
  stopLoss: number | null
  takeProfit: number | null
  result: number | null
  roi: number | null
  setup: string
}

const TRADE_PROMPT = `Analyze this trading screenshot and extract the following details.
Respond ONLY with valid JSON, no markdown, no code blocks.

{
  "pair": "string - trading pair like BTC/USDT, ETH/USDT",
  "exchange": "string - exchange name like Binance, Bybit, OKX",
  "side": "long or short",
  "entryPrice": number or null if not visible,
  "exitPrice": number or null if not visible,
  "entryDate": "YYYY-MM-DDTHH:MM format or null",
  "exitDate": "YYYY-MM-DDTHH:MM format or null",
  "quantity": number or null,
  "stopLoss": number or null,
  "takeProfit": number or null,
  "result": number or null - the P&L or profit/loss in dollars (look for PnL, P&L, profit, loss, result, net profit, unrealized PnL),
  "roi": number or null - the return on investment percentage (look for ROI, Return %, % gain/loss, Return on Investment). Include sign: positive for profit, negative for loss,
  "setup": "breakout|reversal|scalping|trend_following|range|news|other"
}

Rules:
- If a field is not visible or cannot be determined, use null
- For result/P&L: look for any profit or loss number shown (could be labeled as PnL, P&L, profit, loss, net, result, unrealized). Include the sign: positive for profit, negative for loss
- For roi: look for percentage values labeled as ROI, Return %, Return on Investment, or % gain/loss. If not visible, use null
- For side: look at whether the position is green (profit) and the direction indicator
- For dates: convert any date format to YYYY-MM-DDTHH:MM
- For setup: infer from chart patterns if visible, otherwise use "other"
- Prices should be numbers without currency symbols or commas`

export async function analyzeScreenshot(base64Image: string, mimeType: string): Promise<GeminiTradeData> {
  let response
  try {
    response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          inlineData: {
            mimeType,
            data: base64Image,
          },
        },
        { text: TRADE_PROMPT },
      ],
    })
  } catch (err: unknown) {
    console.error('Gemini API error:', err)
    const msg = err instanceof Error ? err.message : String(err)
    throw new Error(`Error de Gemini API: ${msg}`)
  }

  const text = response.text?.trim() ?? ''

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('No se pudo extraer datos del screenshot')
  }

  let parsed: GeminiTradeData
  try {
    parsed = JSON.parse(jsonMatch[0]) as GeminiTradeData
  } catch {
    throw new Error('Error al interpretar la respuesta de Gemini')
  }

  return {
    pair: parsed.pair ?? '',
    exchange: parsed.exchange ?? 'Binance',
    side: parsed.side === 'short' ? 'short' : 'long',
    entryPrice: parsed.entryPrice ?? null,
    exitPrice: parsed.exitPrice ?? null,
    entryDate: parsed.entryDate ?? null,
    exitDate: parsed.exitDate ?? null,
    quantity: parsed.quantity ?? null,
    stopLoss: parsed.stopLoss ?? null,
    takeProfit: parsed.takeProfit ?? null,
    result: parsed.result ?? null,
    roi: parsed.roi ?? null,
    setup: parsed.setup ?? 'other',
  }
}

export function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      const base64 = result.split(',')[1]
      resolve({ base64, mimeType: file.type })
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

interface TradeSummary {
  totalTrades: number
  wins: number
  losses: number
  winRate: number
  totalPnl: number
  profitFactor: number
  expectancy: number
  avgRMultiple: number
  avgROI: number
  maxDrawdown: number
  bestSetup: string
  worstSetup: string
  bestPair: string
  revengeTradeRate: number
  planAdherenceRate: number
  commonMistakes: string[]
  emotionPerformance: Record<string, { count: number; pnl: number; winRate: number }>
  setupPerformance: Record<string, { count: number; pnl: number; winRate: number }>
  roiBySetup: Record<string, { count: number; avgRoi: number }>
  roiByEmotion: Record<string, { count: number; avgRoi: number }>
  roiTrend: { recent: number; previous: number }
}

const ANALYSIS_PROMPT = `You are an expert trading performance analyst. Analyze the following trading performance data and provide:

1. **Executive Summary** (2-3 paragraphs): Overall assessment of the trader's performance, key patterns observed, and general trajectory.

2. **Strengths** (bullet points): What the trader is doing well, based on the data.

3. **Areas for Improvement** (bullet points): Specific weaknesses or patterns that need attention.

4. **ROI Analysis** (specific section):
   - ROI by setup type: which strategies generate the best returns
   - ROI by emotion: how emotional state affects returns
   - ROI trend: is the trader's ROI improving or declining over time
   - Compare ROI against win rate (high ROI with low win rate = good risk management)
   - Specific recommendations to improve ROI

5. **Actionable Recommendations** (numbered list): Concrete, specific steps the trader should take to improve their performance. Be specific about which setups, emotions, or behaviors to focus on.

Trading Performance Data:
{data}

Respond in Spanish. Use clear, direct language. Be honest but constructive. Format with markdown.`

export async function analyzePerformance(summary: TradeSummary): Promise<string> {
  const dataText = `
Total de trades: ${summary.totalTrades}
Wins: ${summary.wins} | Losses: ${summary.losses}
Win Rate: ${summary.winRate.toFixed(1)}%
Total P&L: $${summary.totalPnl.toFixed(2)}
Profit Factor: ${summary.profitFactor === Infinity ? '∞' : summary.profitFactor.toFixed(2)}
Expectancy: $${summary.expectancy.toFixed(2)}
Avg R-Multiple: ${summary.avgRMultiple.toFixed(2)}R
Avg ROI: ${summary.avgROI.toFixed(2)}%
Max Drawdown: $${summary.maxDrawdown.toFixed(2)}

Mejor Setup: ${summary.bestSetup}
Peor Setup: ${summary.worstSetup}
Mejor Par: ${summary.bestPair}

Revenge Trade Rate: ${summary.revengeTradeRate.toFixed(1)}%
Plan Adherence: ${summary.planAdherenceRate.toFixed(1)}%
Errores comunes: ${summary.commonMistakes.join(', ') || 'Ninguno registrado'}

Rendimiento por Setup:
${Object.entries(summary.setupPerformance).map(([setup, data]) =>
  `- ${setup}: ${data.count} trades, Win Rate: ${data.winRate.toFixed(1)}%, P&L: $${data.pnl.toFixed(2)}`
).join('\n')}

Rendimiento por Emoción:
${Object.entries(summary.emotionPerformance).map(([emotion, data]) =>
  `- ${emotion}: ${data.count} trades, Win Rate: ${data.winRate.toFixed(1)}%, P&L: $${data.pnl.toFixed(2)}`
).join('\n')}

ROI por Setup:
${Object.entries(summary.roiBySetup).map(([setup, data]) =>
  `- ${setup}: ${data.count} trades, Avg ROI: ${data.avgRoi.toFixed(2)}%`
).join('\n')}

ROI por Emoción:
${Object.entries(summary.roiByEmotion).map(([emotion, data]) =>
  `- ${emotion}: ${data.count} trades, Avg ROI: ${data.avgRoi.toFixed(2)}%`
).join('\n')}

Tendencia ROI: Últimos trades ${summary.roiTrend.recent.toFixed(2)}% vs Anteriores ${summary.roiTrend.previous.toFixed(2)}%
`

  let response
  try {
    response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ text: ANALYSIS_PROMPT.replace('{data}', dataText) }],
    })
  } catch (err: unknown) {
    console.error('Gemini API error:', err)
    const msg = err instanceof Error ? err.message : String(err)
    throw new Error(`Error de Gemini API: ${msg}`)
  }

  return response.text?.trim() ?? 'No se pudo generar el análisis.'
}
