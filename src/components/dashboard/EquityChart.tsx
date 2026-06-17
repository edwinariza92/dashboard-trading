import type { Trade } from '../../types/trade'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface Props {
  trades: Trade[]
}

export default function EquityChart({ trades }: Props) {
  const data = [...trades].reverse().reduce<{ date: string; equity: number }[]>((acc, t) => {
    const prev = acc.length > 0 ? acc[acc.length - 1].equity : 0
    acc.push({ date: new Date(t.exitDate).toLocaleDateString(), equity: prev + t.result })
    return acc
  }, [])

  return (
    <div className="h-48 sm:h-64 w-full">
      <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={192}>
        <LineChart data={data} margin={{ left: 0, right: 8, top: 4, bottom: 4 }}>
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#666' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#666' }} axisLine={false} tickLine={false} width={45} />
          <Tooltip
            contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, fontSize: 13 }}
            labelStyle={{ color: '#999' }}
          />
          <Line type="monotone" dataKey="equity" stroke="#22c55e" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
