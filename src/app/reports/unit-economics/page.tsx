export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/db'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { TrendingUp, TrendingDown, Users, DollarSign, Clock, Target, AlertTriangle } from 'lucide-react'

async function getUnitEconomicsData() {
  const periods = await prisma.period.findMany({
    orderBy: { id: 'desc' },
    take: 6,
  })

  const monthlyData = await prisma.monthlyData.findMany({
    where: { periodId: { in: periods.map(p => p.id) } },
    include: { region: true, period: true },
  })

  // Calculate metrics for each period
  const byPeriod = periods.map(period => {
    const data = monthlyData.filter(d => d.periodId === period.id)
    
    const totalMRR = data.reduce((sum, d) => sum + (d.mrr || 0), 0)
    const totalActiveClients = data.reduce((sum, d) => sum + (d.activeClients || 0), 0)
    const totalNewClients = data.reduce((sum, d) => sum + (d.newClients || 0), 0)
    const totalChurnClients = data.reduce((sum, d) => sum + (d.churnClients || 0), 0)
    const totalMarketingCosts = data.reduce((sum, d) => sum + (d.marketingCosts || 0), 0)
    
    const arpu = totalActiveClients > 0 ? totalMRR / totalActiveClients : 0
    const churnRate = totalActiveClients > 0 ? (totalChurnClients / totalActiveClients) * 100 : 0
    const cac = totalNewClients > 0 ? totalMarketingCosts / totalNewClients : 0
    const ltv = churnRate > 0 ? (arpu * 12) / (churnRate / 100) : arpu * 24
    const ltvCacRatio = cac > 0 ? ltv / cac : 0
    const paybackMonths = arpu > 0 ? cac / arpu : 0

    return {
      period,
      mrr: totalMRR,
      activeClients: totalActiveClients,
      newClients: totalNewClients,
      churnClients: totalChurnClients,
      arpu,
      churnRate,
      cac,
      ltv,
      ltvCacRatio,
      paybackMonths,
    }
  }).reverse()

  const current = byPeriod[byPeriod.length - 1] || {
    mrr: 0, activeClients: 0, newClients: 0, churnClients: 0,
    arpu: 0, churnRate: 0, cac: 0, ltv: 0, ltvCacRatio: 0, paybackMonths: 0
  }

  return { periods: byPeriod, current }
}

export default async function UnitEconomicsPage() {
  const data = await getUnitEconomicsData()
  const { current } = data

  const metrics = [
    {
      label: 'ARPU',
      value: formatCurrency(current.arpu),
      description: 'Средний доход на клиента',
      icon: DollarSign,
      color: 'blue',
      benchmark: '$150-300',
      status: current.arpu >= 150 ? 'good' : current.arpu >= 100 ? 'warning' : 'bad',
    },
    {
      label: 'CAC',
      value: formatCurrency(current.cac),
      description: 'Стоимость привлечения',
      icon: Target,
      color: 'purple',
      benchmark: '<$500',
      status: current.cac <= 500 ? 'good' : current.cac <= 1000 ? 'warning' : 'bad',
    },
    {
      label: 'LTV',
      value: formatCurrency(Math.round(current.ltv)),
      description: 'Пожизненная ценность',
      icon: TrendingUp,
      color: 'emerald',
      benchmark: '>$2000',
      status: current.ltv >= 2000 ? 'good' : current.ltv >= 1000 ? 'warning' : 'bad',
    },
    {
      label: 'LTV/CAC',
      value: current.ltvCacRatio.toFixed(1) + 'x',
      description: 'Эффективность привлечения',
      icon: Target,
      color: 'amber',
      benchmark: '>3x',
      status: current.ltvCacRatio >= 3 ? 'good' : current.ltvCacRatio >= 2 ? 'warning' : 'bad',
    },
    {
      label: 'Churn Rate',
      value: formatPercent(current.churnRate / 100),
      description: 'Отток клиентов',
      icon: TrendingDown,
      color: 'red',
      benchmark: '<5%',
      status: current.churnRate <= 5 ? 'good' : current.churnRate <= 10 ? 'warning' : 'bad',
    },
    {
      label: 'Payback',
      value: current.paybackMonths.toFixed(1) + ' мес',
      description: 'Срок окупаемости',
      icon: Clock,
      color: 'cyan',
      benchmark: '<12 мес',
      status: current.paybackMonths <= 12 ? 'good' : current.paybackMonths <= 18 ? 'warning' : 'bad',
    },
  ]

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-500/20 text-blue-400',
    purple: 'bg-purple-500/20 text-purple-400',
    emerald: 'bg-emerald-500/20 text-emerald-400',
    amber: 'bg-amber-500/20 text-amber-400',
    red: 'bg-red-500/20 text-red-400',
    cyan: 'bg-cyan-500/20 text-cyan-400',
  }

  const statusBadge = (status: string) => {
    if (status === 'good') return <Badge variant="green">✓ Норма</Badge>
    if (status === 'warning') return <Badge variant="yellow">⚠ Внимание</Badge>
    return <Badge variant="red">✗ Проблема</Badge>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Unit Economics</h1>
        <p className="text-slate-400">Ключевые метрики юнит-экономики</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-slate-400 text-sm">{metric.label}</span>
                    {statusBadge(metric.status)}
                  </div>
                  <p className="text-3xl font-bold text-white">{metric.value}</p>
                  <p className="text-slate-500 text-sm mt-1">{metric.description}</p>
                  <p className="text-slate-600 text-xs mt-2">Бенчмарк: {metric.benchmark}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl ${colorMap[metric.color]} flex items-center justify-center`}>
                  <metric.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trend Table */}
      <Card>
        <CardHeader>
          <CardTitle>Динамика по периодам</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Период</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">MRR</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">Клиенты</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">ARPU</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">CAC</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">LTV</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">Churn</th>
                </tr>
              </thead>
              <tbody>
                {data.periods.map((item) => (
                  <tr key={item.period.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                    <td className="py-3 px-4 text-white font-medium">{item.period.name}</td>
                    <td className="py-3 px-4 text-right text-emerald-400">{formatCurrency(item.mrr)}</td>
                    <td className="py-3 px-4 text-right text-white">{item.activeClients}</td>
                    <td className="py-3 px-4 text-right text-blue-400">{formatCurrency(item.arpu)}</td>
                    <td className="py-3 px-4 text-right text-purple-400">{formatCurrency(item.cac)}</td>
                    <td className="py-3 px-4 text-right text-emerald-400">{formatCurrency(Math.round(item.ltv))}</td>
                    <td className="py-3 px-4 text-right">
                      <Badge variant={item.churnRate <= 5 ? 'green' : item.churnRate <= 10 ? 'yellow' : 'red'}>
                        {formatPercent(item.churnRate / 100)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Health Check */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            Диагностика
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {current.ltvCacRatio < 3 && (
              <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5" />
                <div>
                  <p className="text-amber-400 font-medium">LTV/CAC ниже нормы</p>
                  <p className="text-slate-400 text-sm">Рекомендуется оптимизировать расходы на маркетинг или увеличить ARPU</p>
                </div>
              </div>
            )}
            {current.churnRate > 5 && (
              <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                <div>
                  <p className="text-red-400 font-medium">Высокий Churn Rate</p>
                  <p className="text-slate-400 text-sm">Отток клиентов превышает норму. Проверьте качество сервиса.</p>
                </div>
              </div>
            )}
            {current.paybackMonths > 12 && (
              <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <Clock className="w-5 h-5 text-amber-400 mt-0.5" />
                <div>
                  <p className="text-amber-400 font-medium">Долгий срок окупаемости</p>
                  <p className="text-slate-400 text-sm">Payback period превышает 12 месяцев</p>
                </div>
              </div>
            )}
            {current.ltvCacRatio >= 3 && current.churnRate <= 5 && current.paybackMonths <= 12 && (
              <div className="flex items-start gap-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                <TrendingUp className="w-5 h-5 text-emerald-400 mt-0.5" />
                <div>
                  <p className="text-emerald-400 font-medium">Всё в норме!</p>
                  <p className="text-slate-400 text-sm">Юнит-экономика здоровая. Продолжайте в том же духе.</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

