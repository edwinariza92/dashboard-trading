import { useTradeStore, type DateFilter } from '../../store/tradeStore'
import { Calendar } from 'lucide-react'

const options: { value: DateFilter; label: string }[] = [
  { value: 'currentMonth', label: 'Este mes' },
  { value: 'lastMonth', label: 'Mes anterior' },
  { value: 'last30', label: 'Últimos 30 días' },
  { value: 'all', label: 'Todo' },
]

export default function DateFilterBar() {
  const dateFilter = useTradeStore(s => s.dateFilter)
  const setDateFilter = useTradeStore(s => s.setDateFilter)

  return (
    <div className="flex items-center gap-2">
      <Calendar className="w-4 h-4 text-neutral-400 shrink-0" />
      <div className="flex rounded-lg border border-neutral-700 overflow-hidden">
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => setDateFilter(opt.value)}
            className={`px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              dateFilter === opt.value
                ? 'bg-green-600 text-white'
                : 'bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
