'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'

// Sample data - in real app, this would come from API
const data = [
  { month: 'Авг', mrr: 90000 },
  { month: 'Сен', mrr: 98000 },
  { month: 'Окт', mrr: 113000 },
  { month: 'Ноя', mrr: 119000 },
  { month: 'Дек', mrr: 123500 },
  { month: 'Янв', mrr: 127000 },
]

export function MRRChart() {
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

