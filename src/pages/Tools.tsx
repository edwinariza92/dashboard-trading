import { useState } from 'react'
import { Calculator, Target, ArrowRight } from 'lucide-react'

type Tab = 'risk' | 'position'

export default function Tools() {
  const [activeTab, setActiveTab] = useState<Tab>('risk')

  return (
    <div className="min-w-0 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h2 className="text-2xl font-bold">Tools</h2>
      </div>

      <div className="flex gap-1 bg-neutral-900 border border-neutral-800 rounded-lg p-1 w-fit mb-6">
        <button
          onClick={() => setActiveTab('risk')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer ${
            activeTab === 'risk'
              ? 'bg-green-500/10 text-green-500'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Calculator className="w-4 h-4" />
          Risk Calculator
        </button>
        <button
          onClick={() => setActiveTab('position')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer ${
            activeTab === 'position'
              ? 'bg-green-500/10 text-green-500'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Target className="w-4 h-4" />
          Position Sizing
        </button>
      </div>

      {activeTab === 'risk' ? <RiskCalculator /> : <PositionSizing />}
    </div>
  )
}

function RiskCalculator() {
  const [capital, setCapital] = useState('')
  const [riskPercent, setRiskPercent] = useState('')
  const [slDistance, setSlDistance] = useState('')
  const [leverage, setLeverage] = useState('')

  const numCapital = parseFloat(capital) || 0
  const numRisk = parseFloat(riskPercent) || 0
  const numSL = parseFloat(slDistance) || 0
  const numLeverage = parseFloat(leverage) || 1

  const riskUSDT = numCapital * (numRisk / 100)
  const positionSize = numSL > 0 ? riskUSDT / (numSL / 100) : 0
  const marginRequired = numLeverage > 0 ? positionSize / numLeverage : 0

  const hasResults = numCapital > 0 && numRisk > 0 && numSL > 0

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
      <div className="bg-neutral-900 rounded-xl p-5 border border-neutral-800 transition-all duration-300 hover:border-neutral-700">
        <h3 className="text-sm font-medium text-neutral-400 mb-4 uppercase tracking-wider">Input Parameters</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Capital Disponible (USDT)</label>
            <input
              type="number"
              step="any"
              min="0"
              placeholder="Ej: 1000"
              value={capital}
              onChange={e => setCapital(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 transition-colors duration-200"
            />
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Riesgo por Operación (%)</label>
            <input
              type="number"
              step="any"
              min="0"
              max="100"
              placeholder="Ej: 2"
              value={riskPercent}
              onChange={e => setRiskPercent(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 transition-colors duration-200"
            />
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Distancia del Stop Loss (%)</label>
            <input
              type="number"
              step="any"
              min="0"
              max="100"
              placeholder="Ej: 1.5"
              value={slDistance}
              onChange={e => setSlDistance(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 transition-colors duration-200"
            />
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Apalancamiento</label>
            <input
              type="number"
              step="any"
              min="1"
              placeholder="Ej: 10"
              value={leverage}
              onChange={e => setLeverage(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 transition-colors duration-200"
            />
          </div>
        </div>
      </div>

      <div className="bg-neutral-900 rounded-xl p-5 border border-neutral-800 transition-all duration-300 hover:border-neutral-700">
        <h3 className="text-sm font-medium text-neutral-400 mb-4 uppercase tracking-wider">Results</h3>
        {hasResults ? (
          <div className="space-y-4 animate-fadeIn">
            <ResultCard
              label="Riesgo en USDT"
              value={`$${riskUSDT.toFixed(2)}`}
              description={`${numRisk}% de $${numCapital.toFixed(2)}`}
            />
            <ResultCard
              label="Tamaño de Posición"
              value={`$${positionSize.toFixed(2)}`}
              description={`Basado en SL de ${numSL}%`}
            />
            <ResultCard
              label="Margen Necesario"
              value={`$${marginRequired.toFixed(2)}`}
              description={`Con ${numLeverage}x de apalancamiento`}
              highlight
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-neutral-500">
            <Calculator className="w-10 h-10 mb-3 opacity-50" />
            <p className="text-sm">Ingresa los parámetros para ver los resultados</p>
          </div>
        )}
      </div>
    </div>
  )
}

function PositionSizing() {
  const [capital, setCapital] = useState('')
  const [riskPercent, setRiskPercent] = useState('')
  const [entryPrice, setEntryPrice] = useState('')
  const [slPrice, setSlPrice] = useState('')
  const [tpPrice, setTpPrice] = useState('')

  const numCapital = parseFloat(capital) || 0
  const numRisk = parseFloat(riskPercent) || 0
  const numEntry = parseFloat(entryPrice) || 0
  const numSL = parseFloat(slPrice) || 0
  const numTP = parseFloat(tpPrice) || 0

  const riskUSDT = numCapital * (numRisk / 100)
  const priceRisk = numEntry > 0 && numSL > 0 ? Math.abs(numEntry - numSL) : 0
  const quantity = priceRisk > 0 ? riskUSDT / priceRisk : 0
  const positionValue = quantity * numEntry
  const rrRatio = priceRisk > 0 && numTP > 0 ? Math.abs(numTP - numEntry) / priceRisk : 0
  const breakeven = numEntry

  const hasResults = numCapital > 0 && numRisk > 0 && numEntry > 0 && numSL > 0

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
      <div className="bg-neutral-900 rounded-xl p-5 border border-neutral-800 transition-all duration-300 hover:border-neutral-700">
        <h3 className="text-sm font-medium text-neutral-400 mb-4 uppercase tracking-wider">Input Parameters</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Capital Disponible (USDT)</label>
            <input
              type="number"
              step="any"
              min="0"
              placeholder="Ej: 1000"
              value={capital}
              onChange={e => setCapital(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 transition-colors duration-200"
            />
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Riesgo por Operación (%)</label>
            <input
              type="number"
              step="any"
              min="0"
              max="100"
              placeholder="Ej: 2"
              value={riskPercent}
              onChange={e => setRiskPercent(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 transition-colors duration-200"
            />
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Precio de Entrada</label>
            <input
              type="number"
              step="any"
              min="0"
              placeholder="Ej: 65000"
              value={entryPrice}
              onChange={e => setEntryPrice(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 transition-colors duration-200"
            />
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Precio de Stop Loss</label>
            <input
              type="number"
              step="any"
              min="0"
              placeholder="Ej: 64000"
              value={slPrice}
              onChange={e => setSlPrice(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 transition-colors duration-200"
            />
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Take Profit <span className="text-neutral-600">(opcional)</span></label>
            <input
              type="number"
              step="any"
              min="0"
              placeholder="Ej: 67000"
              value={tpPrice}
              onChange={e => setTpPrice(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 transition-colors duration-200"
            />
          </div>
        </div>
      </div>

      <div className="bg-neutral-900 rounded-xl p-5 border border-neutral-800 transition-all duration-300 hover:border-neutral-700">
        <h3 className="text-sm font-medium text-neutral-400 mb-4 uppercase tracking-wider">Results</h3>
        {hasResults ? (
          <div className="space-y-4 animate-fadeIn">
            <ResultCard
              label="Riesgo en USDT"
              value={`$${riskUSDT.toFixed(2)}`}
              description={`${numRisk}% de $${numCapital.toFixed(2)}`}
            />
            <ResultCard
              label="Cantidad a Comprar"
              value={`${quantity.toFixed(6)}`}
              description={`Unidades del activo`}
            />
            <ResultCard
              label="Tamaño de Posición"
              value={`$${positionValue.toFixed(2)}`}
              description={`${quantity.toFixed(6)} × $${numEntry.toFixed(2)}`}
            />
            {rrRatio > 0 && (
              <ResultCard
                label="Ratio Riesgo:Beneficio"
                value={`1:${rrRatio.toFixed(2)}`}
                description={`TP: $${numTP.toFixed(2)} | SL: $${numSL.toFixed(2)}`}
                highlight
              />
            )}
            <ResultCard
              label="Punto de Equilibrio"
              value={`$${breakeven.toFixed(2)}`}
              description="Sin incluir comisiones"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-neutral-500">
            <Target className="w-10 h-10 mb-3 opacity-50" />
            <p className="text-sm">Ingresa los parámetros para ver los resultados</p>
          </div>
        )}
      </div>
    </div>
  )
}

function ResultCard({ label, value, description, highlight = false }: {
  label: string
  value: string
  description: string
  highlight?: boolean
}) {
  return (
    <div className={`rounded-lg p-4 border transition-all duration-300 ${
      highlight
        ? 'bg-green-500/5 border-green-500/20'
        : 'bg-neutral-800/50 border-neutral-800'
    }`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-neutral-500 mb-1">{label}</p>
          <p className={`text-lg font-bold font-mono ${highlight ? 'text-green-500' : 'text-white'}`}>
            {value}
          </p>
        </div>
        <ArrowRight className={`w-4 h-4 ${highlight ? 'text-green-500' : 'text-neutral-600'}`} />
      </div>
      <p className="text-xs text-neutral-500 mt-1">{description}</p>
    </div>
  )
}
