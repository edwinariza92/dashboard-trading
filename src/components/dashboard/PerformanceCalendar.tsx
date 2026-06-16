import type { Trade } from '../../types/trade'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, subMonths, addMonths } from 'date-fns'
import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  trades: Trade[]
}

export default function PerformanceCalendar({ trades }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const dayPnl = days.reduce<Record<string, number>>((acc, day) => {
    const key = format(day, 'yyyy-MM-dd')
    const dayTrades = trades.filter(t => t.exitDate.slice(0, 10) === key)
    const total = dayTrades.reduce((s, t) => s + t.result, 0)
    if (total !== 0 || dayTrades.length > 0) acc[key] = total
    return acc
  }, {})

  const maxPnl = Math.max(...Object.values(dayPnl).map(Math.abs), 1)

  const getColor = (value: number) => {
    if (value === 0) return 'bg-neutral-800'
    const intensity = Math.min(Math.abs(value) / maxPnl, 1)
    if (value > 0) {
      const g = Math.round(197 - (1 - intensity) * 80)
      return `rgb(22, ${g}, 94)`
    }
    const r = Math.round(239 - (1 - intensity) * 80)
    return `rgb(${r}, 68, 68)`
  }

  const prevMonth = () => setCurrentDate(d => subMonths(d, 1))
  const nextMonth = () => setCurrentDate(d => addMonths(d, 1))

  const startDay = getDay(monthStart)

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="text-neutral-400 hover:text-white cursor-pointer">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-medium">{format(currentDate, 'MMMM yyyy')}</span>
        <button onClick={nextMonth} className="text-neutral-400 hover:text-white cursor-pointer">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {dayLabels.map(d => (
          <div key={d} className="text-center text-xs text-neutral-500 py-1">{d}</div>
        ))}
        {Array.from({ length: startDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {days.map(day => {
          const key = format(day, 'yyyy-MM-dd')
          const pnl = dayPnl[key]
          const hasTrade = pnl !== undefined
          return (
            <div
              key={key}
              title={hasTrade ? `${key}: ${pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}` : key}
              className={`aspect-square rounded-md flex items-center justify-center text-xs ${
                hasTrade ? 'text-white' : 'text-neutral-700'
              }`}
              style={hasTrade ? { backgroundColor: getColor(pnl) } : {}}
            >
              {format(day, 'd')}
            </div>
          )
        })}
      </div>
    </div>
  )
}
