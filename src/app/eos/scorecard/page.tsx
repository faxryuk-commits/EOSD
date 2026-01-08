export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/db'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { BarChart3, TrendingUp, TrendingDown, Target, Check, X } from 'lucide-react'

async function getScorecardData() {
  const periods = await prisma.period.findMany({
    orderBy: { id: 'desc' },
    take: 13, // Last 13 weeks worth of data
  })

  const monthlyData = await prisma.monthlyData.findMany({
    where: { periodId: { in: periods.map(p => p.id) } },
    include: { region: true, period: true },
  })

  // Current period metrics
  const currentPeriod = periods[0]
  const currentData = monthlyData.filter(d => d.periodId === currentPeriod?.id)
  
  const totalMRR = currentData.reduce((sum, d) => sum + (d.mrr || 0), 0)
  const totalClients = currentData.reduce((sum, d) => sum + (d.activeClients || 0), 0)
  const totalNewClients = currentData.reduce((sum, d) => sum + (d.newClients || 0), 0)
  const totalChurn = currentData.reduce((sum, d) => sum + (d.churnClients || 0), 0)

  return {
    periods,
    currentPeriod,
    metrics: {
      mrr: totalMRR,
      clients: totalClients,
      newClients: totalNewClients,
      churn: totalChurn,
      churnRate: totalClients > 0 ? (totalChurn / totalClients) * 100 : 0,
    }
  }
}

export default async function ScorecardPage() {
  const data = await getScorecardData()

  // Define scorecard metrics with goals
  const scorecardMetrics = [
    {
      category: 'Sales',
      metrics: [
        { name: 'New MRR', goal: 15000, actual: data.metrics.newClients * 200, unit: '$', owner: 'Sales Team' },
        { name: 'New Clients', goal: 50, actual: data.metrics.newClients, unit: '', owner: 'Sales Team' },
        { name: 'Demo Calls', goal: 100, actual: 87, unit: '', owner: 'Sales Team' },
        { name: 'Conversion Rate', goal: 25, actual: 22, unit: '%', owner: 'Sales Team' },
      ]
    },
    {
      category: 'Customer Success',
      metrics: [
        { name: 'Churn Rate', goal: 3, actual: data.metrics.churnRate, unit: '%', owner: 'CS Team', inverse: true },
        { name: 'NPS Score', goal: 50, actual: 62, unit: '', owner: 'CS Team' },
        { name: 'Support Tickets Resolved', goal: 95, actual: 91, unit: '%', owner: 'Support' },
        { name: 'Avg Response Time', goal: 2, actual: 1.5, unit: 'h', owner: 'Support', inverse: true },
      ]
    },
    {
      category: 'Product',
      metrics: [
        { name: 'Features Shipped', goal: 4, actual: 3, unit: '', owner: 'Product' },
        { name: 'Bug Fix Rate', goal: 90, actual: 85, unit: '%', owner: 'Engineering' },
        { name: 'Uptime', goal: 99.9, actual: 99.95, unit: '%', owner: 'DevOps' },
        { name: 'Release Velocity', goal: 2, actual: 2, unit: '/week', owner: 'Engineering' },
      ]
    },
    {
      category: 'Finance',
      metrics: [
        { name: 'Total MRR', goal: 100000, actual: data.metrics.mrr, unit: '$', owner: 'Finance' },
        { name: 'Gross Margin', goal: 70, actual: 72, unit: '%', owner: 'Finance' },
        { name: 'CAC', goal: 500, actual: 450, unit: '$', owner: 'Marketing', inverse: true },
        { name: 'Runway', goal: 12, actual: 8, unit: 'mo', owner: 'Finance' },
      ]
    },
  ]

  const weeks = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12', 'W13']

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Weekly Scorecard</h1>
        <p className="text-slate-400">Еженедельное отслеживание ключевых метрик (EOS)</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">На цели</p>
                <p className="text-2xl font-bold text-emerald-400">12</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Check className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Ниже цели</p>
                <p className="text-2xl font-bold text-red-400">4</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                <X className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Тренд</p>
                <p className="text-2xl font-bold text-white">↑</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Неделя</p>
                <p className="text-2xl font-bold text-white">W2</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scorecard Table */}
      {scorecardMetrics.map((category) => (
        <Card key={category.category}>
          <CardHeader>
            <CardTitle>{category.category}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Метрика</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Владелец</th>
                    <th className="text-right py-3 px-4 text-slate-400 font-medium">Цель</th>
                    <th className="text-right py-3 px-4 text-slate-400 font-medium">Факт</th>
                    <th className="text-center py-3 px-4 text-slate-400 font-medium">Статус</th>
                    {weeks.slice(0, 4).map(week => (
                      <th key={week} className="text-center py-3 px-2 text-slate-400 font-medium text-sm">{week}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {category.metrics.map((metric) => {
                    const isOnTarget = metric.inverse 
                      ? metric.actual <= metric.goal 
                      : metric.actual >= metric.goal
                    const percentage = metric.inverse
                      ? metric.goal > 0 ? ((metric.goal - metric.actual + metric.goal) / metric.goal) * 50 : 0
                      : metric.goal > 0 ? (metric.actual / metric.goal) * 100 : 0

                    return (
                      <tr key={metric.name} className="border-b border-slate-800 hover:bg-slate-800/50">
                        <td className="py-3 px-4 text-white font-medium">{metric.name}</td>
                        <td className="py-3 px-4 text-slate-400">{metric.owner}</td>
                        <td className="py-3 px-4 text-right text-slate-400">
                          {metric.unit === '$' ? formatCurrency(metric.goal) : `${metric.goal}${metric.unit}`}
                        </td>
                        <td className="py-3 px-4 text-right text-white font-medium">
                          {metric.unit === '$' ? formatCurrency(metric.actual) : 
                           metric.unit === '%' ? `${metric.actual.toFixed(1)}%` : 
                           `${metric.actual}${metric.unit}`}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant={isOnTarget ? 'success' : 'danger'}>
                            {isOnTarget ? '✓' : '✗'} {Math.round(percentage)}%
                          </Badge>
                        </td>
                        {weeks.slice(0, 4).map((week, i) => {
                          // Generate mock weekly data
                          const weekValue = isOnTarget ? '✓' : i < 2 ? '✓' : '✗'
                          return (
                            <td key={week} className="py-3 px-2 text-center">
                              <span className={weekValue === '✓' ? 'text-emerald-400' : 'text-red-400'}>
                                {weekValue}
                              </span>
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

