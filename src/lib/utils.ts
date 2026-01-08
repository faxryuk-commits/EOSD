import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

// Format currency
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Format percentage
export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}

// Format number with K/M suffix
export function formatCompact(num: number): string {
  if (num >= 1000000) {
    return `$${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `$${(num / 1000).toFixed(0)}k`
  }
  return `$${num}`
}

// Calculate MoM growth
export function calculateMoM(current: number, previous: number): number {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}

// Calculate ARPU
export function calculateARPU(revenue: number, clients: number): number {
  return clients > 0 ? revenue / clients : 0
}

// Calculate CAC
export function calculateCAC(marketing: number, newClients: number): number {
  return newClients > 0 ? marketing / newClients : 0
}

// Calculate Churn Rate
export function calculateChurnRate(churned: number, startClients: number, newClients: number): number {
  const total = startClients + newClients
  return total > 0 ? (churned / total) * 100 : 0
}

// Calculate LTV
export function calculateLTV(arpu: number, churnRate: number): number {
  const monthlyChurn = churnRate / 100
  return monthlyChurn > 0 ? arpu / monthlyChurn : arpu * 24
}

// Calculate Runway
export function calculateRunway(cash: number, burnRate: number): number {
  return burnRate > 0 ? Math.floor(cash / burnRate) : 999
}

// Get status color
export function getStatusColor(status: string): string {
  switch (status) {
    case 'good':
    case 'healthy':
    case 'on_track':
    case 'done':
      return 'text-green-500'
    case 'warning':
    case 'at_risk':
    case 'medium':
      return 'text-yellow-500'
    case 'critical':
    case 'off_track':
    case 'high':
      return 'text-red-500'
    default:
      return 'text-gray-500'
  }
}

// Get status badge
export function getStatusBadge(status: string): { text: string; color: string } {
  const badges: Record<string, { text: string; color: string }> = {
    good: { text: '🟢', color: 'bg-green-500/10 text-green-500' },
    healthy: { text: '🟢', color: 'bg-green-500/10 text-green-500' },
    on_track: { text: '🟢', color: 'bg-green-500/10 text-green-500' },
    warning: { text: '🟡', color: 'bg-yellow-500/10 text-yellow-500' },
    at_risk: { text: '🟡', color: 'bg-yellow-500/10 text-yellow-500' },
    off_track: { text: '🔴', color: 'bg-red-500/10 text-red-500' },
    critical: { text: '🔴', color: 'bg-red-500/10 text-red-500' },
  }
  return badges[status] || { text: '⚪', color: 'bg-gray-500/10 text-gray-500' }
}

// Format date
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

