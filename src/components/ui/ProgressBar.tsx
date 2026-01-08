import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  max?: number
  color?: 'green' | 'yellow' | 'red' | 'blue' | 'purple'
  showLabel?: boolean
  className?: string
}

export function ProgressBar({
  value,
  max = 100,
  color = 'green',
  showLabel = true,
  className,
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100)

  const colors = {
    green: 'from-green-500 to-green-400',
    yellow: 'from-yellow-500 to-yellow-400',
    red: 'from-red-500 to-red-400',
    blue: 'from-blue-500 to-blue-400',
    purple: 'from-purple-500 to-purple-400',
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="flex-1 progress-bar">
        <div
          className={cn('progress-bar-fill bg-gradient-to-r', colors[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-sm text-surface-400 w-12 text-right">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  )
}

