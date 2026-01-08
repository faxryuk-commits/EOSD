export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/db'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { User, TrendingUp, DollarSign, Clock, Cpu, Target } from 'lucide-react'

async function getCLevelData() {
  const kpis = await prisma.cLevelKPI.findMany({
    where: { isActive: true },
    orderBy: [{ role: 'asc' }, { weight: 'desc' }],
  })

  // Get current metrics from monthly data
  const currentPeriod = await prisma.period.findFirst({
    where: { year: 2026, month: 1 },
  })

  const monthlyData = currentPeriod ? await prisma.monthlyData.findMany({
    where: { periodId: currentPeriod.id },
  }) : []

  const cashSetting = await prisma.settings.findUnique({
    where: { key: 'cash_balance' },
  })

  // Calculate actual values
  const actuals: Record<string, number> = {
    mrr: monthlyData.reduce((sum, d) => sum + d.revenue, 0),
    profit: monthlyData.reduce((sum, d) => sum + d.revenue, 0) - 
            monthlyData.reduce((sum, d) => sum + d.salary + d.marketing + d.office + d.software + d.otherExpenses, 0),
    revenue: monthlyData.reduce((sum, d) => sum + d.revenue, 0),
    cash: parseFloat(cashSetting?.value || '0'),
    new_regions: 2, // Sample
    runway: 20,
    eos_score: 75,
    margin: 54.4,
    uptime: 99.8,
    bugs: 3,
  }

  // Group by role
  const roles = ['ceo', 'coo', 'cfo', 'cto']
  const kpisByRole: Record<string, typeof kpis> = {}
  
  roles.forEach(role => {
    kpisByRole[role] = kpis.filter(k => k.role === role)
  })

  return { kpisByRole, actuals }
}

const roleInfo: Record<string, { title: string; icon: React.ReactNode; color: string }> = {
  ceo: { title: 'CEO', icon: <User size={24} />, color: 'text-purple-500' },
  coo: { title: 'COO', icon: <Target size={24} />, color: 'text-blue-500' },
  cfo: { title: 'CFO', icon: <DollarSign size={24} />, color: 'text-green-500' },
  cto: { title: 'CTO', icon: <Cpu size={24} />, color: 'text-cyan-500' },
}

export default async function CLevelKPIPage() {
  const { kpisByRole, actuals } = await getCLevelData()

  const calculateAchievement = (kpi: { metricKey: string; goal: number; goalType: string }) => {
    const actual = actuals[kpi.metricKey] || 0
    if (kpi.goalType === 'gte') {
      return Math.min((actual / kpi.goal) * 100, 100)
    } else if (kpi.goalType === 'lte') {
      return actual <= kpi.goal ? 100 : Math.max(0, (kpi.goal / actual) * 100)
    }
    return actual === kpi.goal ? 100 : 0
  }

  const formatValue = (key: string, value: number): string => {
    if (['mrr', 'profit', 'revenue', 'cash'].includes(key)) {
      return formatCurrency(value)
    }
    if (['margin', 'uptime'].includes(key)) {
      return formatPercent(value)
    }
    return value.toString()
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">👔 C-Level KPI Dashboard</h1>
          <p className="text-surface-400">Январь 2026 • KPI для руководства</p>
        </div>
        <select className="input">
          <option>Январь 2026</option>
          <option>Q1 2026</option>
          <option>2025</option>
        </select>
      </div>

      {/* KPI by Role */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(kpisByRole).map(([role, kpis]) => {
          const info = roleInfo[role]
          const totalWeight = kpis.reduce((sum, k) => sum + k.weight, 0)
          const weightedScore = kpis.reduce((sum, k) => {
            const achievement = calculateAchievement(k)
            return sum + (achievement * k.weight)
          }, 0) / (totalWeight || 1)

          return (
            <Card key={role} className="overflow-hidden">
              <CardHeader className={`border-b border-surface-700/50 bg-surface-800/50`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-surface-700/50 ${info.color}`}>
                      {info.icon}
                    </div>
                    <div>
                      <CardTitle>{info.title}</CardTitle>
                      <p className="text-sm text-surface-400">
                        {kpis.length} KPIs
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${
                      weightedScore >= 80 ? 'text-green-500' :
                      weightedScore >= 60 ? 'text-yellow-500' : 'text-red-500'
                    }`}>
                      {Math.round(weightedScore)}%
                    </p>
                    <p className="text-xs text-surface-400">Overall Score</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-surface-700/30">
                  {kpis.map((kpi) => {
                    const actual = actuals[kpi.metricKey] || 0
                    const achievement = calculateAchievement(kpi)
                    
                    return (
                      <div key={kpi.id} className="p-4 hover:bg-surface-800/30 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-surface-300">{kpi.metricName}</span>
                          <Badge variant={
                            achievement >= 80 ? 'green' :
                            achievement >= 60 ? 'yellow' : 'red'
                          }>
                            {Math.round(achievement)}%
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-white font-medium">
                            {formatValue(kpi.metricKey, actual)}
                          </span>
                          <span className="text-surface-500">
                            Goal: {formatValue(kpi.metricKey, kpi.goal)}
                          </span>
                        </div>
                        <ProgressBar 
                          value={achievement}
                          color={achievement >= 80 ? 'green' : achievement >= 60 ? 'yellow' : 'red'}
                          showLabel={false}
                        />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

