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
  fees: number | null
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
  "fees": number or null,
  "setup": "breakout|reversal|scalping|trend_following|range|news|other"
}

Rules:
- If a field is not visible or cannot be determined, use null
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
    fees: parsed.fees ?? null,
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
