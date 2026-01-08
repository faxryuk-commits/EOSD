import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon?: React.ReactNode
  trend?: 'up' | 'down' | 'flat'
  status?: 'good' | 'warning' | 'critical'
  className?: string
}

export function StatCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  trend,
  status = 'good',
  className,
}: StatCardProps) {
  const statusColors = {
    good: 'border-green-500/30 bg-green-500/5',
    warning: 'border-yellow-500/30 bg-yellow-500/5',
    critical: 'border-red-500/30 bg-red-500/5',
  }

  const trendColors = {
    up: 'text-green-500',
    down: 'text-red-500',
    flat: 'text-surface-400',
  }

  const trendIcon = {
    up: <TrendingUp size={16} />,
    down: <TrendingDown size={16} />,
    flat: <Minus size={16} />,
  }

  return (
    <div
      className={cn(
        'card p-6 border transition-all duration-300 hover:scale-[1.02]',
        statusColors[status],
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm text-surface-400">{title}</span>
        {icon && (
          <div className="p-2 rounded-lg bg-surface-700/50">
            {icon}
          </div>
        )}
      </div>
      
      <div className="stat-value mb-2">{value}</div>
      
      {(change !== undefined || changeLabel) && (
        <div className="flex items-center gap-2">
          {trend && (
            <span className={cn('flex items-center gap-1', trendColors[trend])}>
              {trendIcon[trend]}
              {change !== undefined && (
                <span className="text-sm font-medium">
                  {change > 0 ? '+' : ''}{change.toFixed(1)}%
                </span>
              )}
            </span>
          )}
          {changeLabel && (
            <span className="text-sm text-surface-400">{changeLabel}</span>
          )}
        </div>
      )}
    </div>
  )
}

