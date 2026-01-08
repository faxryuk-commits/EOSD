import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'green' | 'yellow' | 'red' | 'blue' | 'purple' | 'gray'
  className?: string
}

export function Badge({ children, variant = 'gray', className }: BadgeProps) {
  const variants = {
    green: 'badge-green',
    yellow: 'badge-yellow',
    red: 'badge-red',
    blue: 'badge-blue',
    purple: 'badge-purple',
    gray: 'bg-surface-700/50 text-surface-300',
  }

  return (
    <span className={cn('badge', variants[variant], className)}>
      {children}
    </span>
  )
}

