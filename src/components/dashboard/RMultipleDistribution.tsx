import type { Trade } from '../../types/trade'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface Props {
  trades: Trade[]
}

export default function RMultipleDistribution({ trades }: Props) {
  const buckets: Record<string, { range: string; count: number; color: string }> = {
    '-5R': { range: '-5R', count: 0, color: '#ef4444' },
    '-3R': { range: '-3R', count: 0, color: '#ef4444' },
    '-1R': { range: '-1R', count: 0, color: '#ef4444' },
    '+1R': { range: '+1R', count: 0, color: '#22c55e' },
    '+3R': { range: '+3R', count: 0, color: '#22c55e' },
    '+5R': { range: '+5R', count: 0, color: '#22c55e' },
  }

  for (const t of trades) {
    const r = t.rMultiple
    if (r <= -4) buckets['-5R'].count++
    else if (r <= -2) buckets['-3R'].count++
    else if (r < 0) buckets['-1R'].count++
    else if (r < 2) buckets['+1R'].count++
    else if (r < 4) buckets['+3R'].count++
    else buckets['+5R'].count++
  }

  const data = Object.values(buckets)

  return (
    <div style={{ width: '100%', height: 256, minWidth: 0 }}>
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <BarChart data={data}>
            <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#666' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#666' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, fontSize: 13 }}
              labelStyle={{ color: '#999' }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="#22c55e">
              {data.map((entry, i) => (
                <rect key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
    </div>
  )
}
