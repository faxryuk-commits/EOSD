'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface MRRChartProps {
  data?: { month: string; mrr: number }[]
}

// Default data based on Excel file
const defaultData = [
  { month: 'Авг', mrr: 41123 },
  { month: 'Сен', mrr: 43108 },
  { month: 'Окт', mrr: 46758 },
  { month: 'Ноя', mrr: 49544 },
  { month: 'Дек', mrr: 55740 },
  { month: 'Янв', mrr: 66076 },
]

export function MRRChart({ data = defaultData }: MRRChartProps) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="mrrGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis 
            dataKey="month" 
            stroke="#71717a" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#71717a" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#18181b', 
              border: '1px solid #27272a',
              borderRadius: '8px',
              color: '#fff'
            }}
            formatter={(value: number) => [`$${value.toLocaleString()}`, 'MRR']}
          />
          <Area 
            type="monotone" 
            dataKey="mrr" 
            stroke="#22c55e" 
            strokeWidth={2}
            fill="url(#mrrGradient)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
