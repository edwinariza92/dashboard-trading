import type { Trade } from '../../types/trade'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import useSize from '../../utils/useSize'

interface Props {
  trades: Trade[]
}

export default function EquityChart({ trades }: Props) {
  const data = [...trades].reverse().reduce<{ date: string; equity: number }[]>((acc, t) => {
    const prev = acc.length > 0 ? acc[acc.length - 1].equity : 0
    acc.push({ date: new Date(t.exitDate).toLocaleDateString(), equity: prev + t.result })
    return acc
  }, [])

  const [ref, size] = useSize<HTMLDivElement>()

  return (
    <div ref={ref} className="w-full min-w-0 h-48 sm:h-56 md:h-64">
      {size.width > 0 && size.height > 0 ? (
        <ResponsiveContainer width={size.width} height={size.height} minWidth={0} minHeight={64}>
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
      ) : null}
    </div>
  )
}
