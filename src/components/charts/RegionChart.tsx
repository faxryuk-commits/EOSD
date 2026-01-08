'use client'

import { formatCompact } from '@/lib/utils'

interface RegionData {
  name: string
  code: string
  value: number
  color: string
}

interface RegionChartProps {
  data: RegionData[]
}

export function RegionChart({ data }: RegionChartProps) {
  const maxValue = Math.max(...data.map(d => d.value))

  return (
    <div className="space-y-4">
      {data.map((region) => {
        const percentage = (region.value / maxValue) * 100
        return (
          <div key={region.code} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getFlag(region.code)}</span>
                <span className="text-sm text-surface-300">{region.name}</span>
              </div>
              <span className="text-sm font-medium text-white">
                {formatCompact(region.value)}
              </span>
            </div>
            <div className="h-2 bg-surface-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${percentage}%`,
                  backgroundColor: region.color 
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function getFlag(code: string): string {
  const flags: Record<string, string> = {
    uz: '🇺🇿',
    kz: '🇰🇿',
    kg: '🇰🇬',
    ge: '🇬🇪',
    ae: '🇦🇪',
    sa: '🇸🇦',
  }
  return flags[code] || '🏳️'
}

