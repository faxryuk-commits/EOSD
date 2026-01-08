export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/db'
import { StatCard } from '@/components/ui/StatCard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency, formatCompact, formatPercent, calculateMoM, calculateARPU, calculateChurnRate, calculateLTV, calculateCAC, calculateRunway } from '@/lib/utils'
import { DollarSign, Users, TrendingDown, TrendingUp, Timer, Target, AlertTriangle, Percent, PieChart } from 'lucide-react'
import { MRRChart } from '@/components/charts/MRRChart'
import { RegionChart } from '@/components/charts/RegionChart'
import Link from 'next/link'
import { seedDatabase } from '@/lib/seed'

async function getDashboardData() {
  // Get latest period (dynamic)
  const currentPeriod = await prisma.period.findFirst({
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
  })

  if (!currentPeriod) {
    return null
  }

  // Get previous period
  const previousPeriod = await prisma.period.findFirst({
    where: {
      OR: [
        { year: currentPeriod.year, month: { lt: currentPeriod.month } },
        { year: { lt: currentPeriod.year } },
      ],
    },
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
  })

  // Get monthly data for current period
  const currentData = await prisma.monthlyData.findMany({
    where: { periodId: currentPeriod.id },
    include: { region: true },
  })

  // Get monthly data for previous period
  const previousData = previousPeriod 
    ? await prisma.monthlyData.findMany({
        where: { periodId: previousPeriod.id },
      })
    : []

  // Calculate totals
  const currentTotals = {
    revenue: currentData.reduce((sum, d) => sum + d.revenue, 0),
    clients: currentData.reduce((sum, d) => sum + d.clientsCount, 0),
    newClients: currentData.reduce((sum, d) => sum + d.newClients, 0),
    churned: currentData.reduce((sum, d) => sum + d.churnedClients, 0),
    expenses: currentData.reduce((sum, d) => sum + d.salary + d.marketing + d.office + d.software + d.otherExpenses, 0),
    marketing: currentData.reduce((sum, d) => sum + d.marketing, 0),
  }

  const previousTotals = {
    revenue: previousData.reduce((sum, d) => sum + d.revenue, 0),
    clients: previousData.reduce((sum, d) => sum + d.clientsCount, 0),
  }

  // Calculate metrics
  const profit = currentTotals.revenue - currentTotals.expenses
  const margin = currentTotals.revenue > 0 ? (profit / currentTotals.revenue) * 100 : 0
  const mom = calculateMoM(currentTotals.revenue, previousTotals.revenue)
  const arpu = calculateARPU(currentTotals.revenue, currentTotals.clients)
  const cac = calculateCAC(currentTotals.marketing, currentTotals.newClients)
  const churnRate = calculateChurnRate(currentTotals.churned, previousTotals.clients, currentTotals.newClients)
  const ltv = calculateLTV(arpu, churnRate)
  const ltvCac = cac > 0 ? ltv / cac : 0

  // Get cash balance
  const cashSetting = await prisma.settings.findUnique({
    where: { key: 'cash_balance' },
  })
  const cash = parseFloat(cashSetting?.value || '0')
  
  // Calculate burn rate and runway
  const burnRate = currentTotals.expenses - currentTotals.revenue
  const runway = calculateRunway(cash, burnRate > 0 ? burnRate : currentTotals.expenses * 0.3)

  // Get rocks
  const rocks = await prisma.rock.findMany({
    where: { quarter: 1, year: 2026 },
    orderBy: { progress: 'desc' },
    take: 5,
  })

  // Get warnings
  const warnings = await prisma.warning.findMany({
    where: { status: { not: 'resolved' } },
    orderBy: { severity: 'asc' },
    take: 4,
  })

  // Get budget plan for Revenue vs Plan
  const budgetPlan = await prisma.budgetPlan.findMany({
    where: { periodId: currentPeriod.id, category: 'revenue' },
  })
  const plannedRevenue = budgetPlan.reduce((sum, p) => sum + p.planAmount, 0)
  const revenuePlanAchievement = plannedRevenue > 0 ? (currentTotals.revenue / plannedRevenue) * 100 : 0

  // Revenue by region
  const revenueByRegion = currentData.map(d => ({
    name: d.region.name,
    code: d.region.code,
    value: d.revenue,
    color: d.region.color,
  })).sort((a, b) => b.value - a.value)

  return {
    period: currentPeriod,
    metrics: {
      mrr: currentTotals.revenue,
      mrrChange: mom,
      profit,
      margin,
      clients: currentTotals.clients,
      newClients: currentTotals.newClients,
      churnRate,
      arpu,
      cac,
      ltv,
      ltvCac,
      cash,
      runway,
      plannedRevenue,
      revenuePlanAchievement,
    },
    revenueByRegion,
    rocks,
    warnings,
  }
}

export default async function Dashboard() {
  const data = await getDashboardData()

  if (!data) {
    // Auto-seed if no data
    await seedDatabase()
    // Redirect to refresh
    const { redirect } = await import('next/navigation')
    redirect('/')
    return null // TypeScript needs this
  }

  const { period, metrics, revenueByRegion, rocks, warnings } = data

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">📊 Dashboard</h1>
          <p className="text-surface-400">{period.name} • Обзор ключевых метрик</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/data-entry/sales" className="btn-secondary">
            + Ввод данных
          </Link>
        </div>
      </div>

      {/* KPI Cards Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="💰 MRR"
          value={formatCompact(metrics.mrr)}
          change={metrics.mrrChange}
          trend={metrics.mrrChange > 0 ? 'up' : metrics.mrrChange < 0 ? 'down' : 'flat'}
          icon={<DollarSign size={20} className="text-green-500" />}
          status="good"
          tooltip="Monthly Recurring Revenue — ежемесячный повторяющийся доход от подписок. Ключевой показатель SaaS."
        />
        <StatCard
          title="📈 Revenue vs Plan"
          value={formatCompact(metrics.mrr)}
          changeLabel={`План: ${metrics.revenuePlanAchievement.toFixed(0)}%`}
          icon={<PieChart size={20} className="text-blue-500" />}
          status={metrics.revenuePlanAchievement >= 100 ? 'good' : metrics.revenuePlanAchievement >= 80 ? 'warning' : 'critical'}
          tooltip="Выполнение плана по выручке. Зелёный > 100%, Жёлтый 80-100%, Красный < 80%."
        />
        <StatCard
          title="💵 Profit"
          value={formatCompact(metrics.profit)}
          changeLabel={`Margin ${formatPercent(metrics.margin)}`}
          icon={<TrendingUp size={20} className="text-green-500" />}
          status={metrics.profit > 0 ? 'good' : 'critical'}
          tooltip="Чистая прибыль = Выручка - Все расходы. Margin показывает процент прибыли от выручки."
        />
        <StatCard
          title="⏱️ Runway"
          value={`${metrics.runway} мес`}
          changeLabel={`Cash: ${formatCompact(metrics.cash)}`}
          icon={<Timer size={20} className="text-purple-500" />}
          status={metrics.runway > 12 ? 'good' : metrics.runway > 6 ? 'warning' : 'critical'}
          tooltip="Количество месяцев, на которые хватит денег при текущем темпе расходов. Здоровый показатель > 12 мес."
        />
      </div>

      {/* KPI Cards Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="👥 Clients"
          value={metrics.clients.toLocaleString()}
          changeLabel={`+${metrics.newClients} new`}
          icon={<Users size={20} className="text-blue-500" />}
          status="good"
          tooltip="Общее количество активных клиентов. New — количество новых клиентов за месяц."
        />
        <StatCard
          title="📉 Churn Rate"
          value={formatPercent(metrics.churnRate)}
          changeLabel={metrics.churnRate <= 5 ? '✅ Норма' : '⚠️ Высокий'}
          icon={<TrendingDown size={20} className="text-red-500" />}
          status={metrics.churnRate <= 5 ? 'good' : metrics.churnRate <= 10 ? 'warning' : 'critical'}
          tooltip="Процент оттока клиентов за месяц. Здоровый показатель < 5%."
        />
        <StatCard
          title="💎 LTV"
          value={formatCurrency(Math.round(metrics.ltv))}
          changeLabel={`CAC: ${formatCurrency(metrics.cac)}`}
          icon={<Target size={20} className="text-yellow-500" />}
          status="good"
          tooltip="Lifetime Value — пожизненная ценность клиента. CAC — стоимость привлечения."
        />
        <StatCard
          title="📊 LTV/CAC"
          value={`${metrics.ltvCac.toFixed(1)}x`}
          changeLabel={metrics.ltvCac >= 3 ? '✅ Healthy' : '⚠️ Below target'}
          status={metrics.ltvCac >= 3 ? 'good' : 'warning'}
          tooltip="Соотношение ценности клиента к стоимости привлечения. Здоровый показатель > 3x."
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>📈 MRR Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <MRRChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🌍 Revenue by Region</CardTitle>
          </CardHeader>
          <CardContent>
            <RegionChart data={revenueByRegion} />
          </CardContent>
        </Card>
      </div>

      {/* Rocks & Warnings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rocks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>🎯 Rocks Q1 2026</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="blue">{rocks.filter(r => r.status === 'on_track').length}/{rocks.length} On Track</Badge>
              <Link href="/eos/rocks" className="text-sm text-primary-400 hover:underline">
                View All →
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {rocks.length > 0 ? rocks.map((rock) => (
              <div key={rock.id} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white truncate pr-4">{rock.title}</span>
                    <Badge 
                      variant={rock.status === 'on_track' ? 'green' : rock.status === 'done' ? 'blue' : 'red'}
                    >
                      {rock.status === 'on_track' ? '🟢' : rock.status === 'done' ? '✅' : '🔴'}
                    </Badge>
                  </div>
                  <ProgressBar 
                    value={rock.progress} 
                    color={rock.status === 'off_track' ? 'red' : 'green'}
                  />
                </div>
              </div>
            )) : (
              <div className="text-center py-4 text-surface-400">
                <p>Нет активных Rocks</p>
                <Link href="/eos/rocks" className="text-primary-400 hover:underline text-sm">
                  + Создать Rock
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Warnings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>⚠️ Warnings</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="red">{warnings.filter(w => w.severity === 'critical').length} Critical</Badge>
              <Link href="/warnings" className="text-sm text-primary-400 hover:underline">
                View All →
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {warnings.length > 0 ? warnings.map((warning) => (
              <div 
                key={warning.id} 
                className="flex items-start gap-3 p-3 rounded-lg bg-surface-800/50 border border-surface-700/50"
              >
                <span className="text-lg">
                  {warning.severity === 'critical' ? '🔴' : warning.severity === 'high' ? '🟠' : '🟡'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{warning.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={
                      warning.status === 'open' ? 'gray' : 
                      warning.status === 'monitoring' ? 'blue' : 'yellow'
                    }>
                      {warning.status}
                    </Badge>
                    <span className="text-xs text-surface-400">{warning.category}</span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-4 text-surface-400">
                <p>Нет активных предупреждений</p>
                <Link href="/warnings" className="text-primary-400 hover:underline text-sm">
                  + Добавить Warning
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

