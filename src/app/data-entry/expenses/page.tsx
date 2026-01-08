import { prisma } from '@/lib/db'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { ExpensesForm } from './ExpensesForm'
import { formatCurrency, formatPercent } from '@/lib/utils'

async function getExpensesData() {
  const currentPeriod = await prisma.period.findFirst({
    where: { year: 2026, month: 1 },
  })

  if (!currentPeriod) return null

  const regions = await prisma.region.findMany({
    where: { isActive: true },
    orderBy: { id: 'asc' },
  })

  const currentData = await prisma.monthlyData.findMany({
    where: { periodId: currentPeriod.id },
    include: { region: true },
  })

  const expensesData = regions.map(region => {
    const current = currentData.find(d => d.regionId === region.id)
    const total = (current?.salary || 0) + (current?.marketing || 0) + 
                  (current?.office || 0) + (current?.software || 0) + 
                  (current?.otherExpenses || 0)
    
    return {
      regionId: region.id,
      regionName: region.name,
      regionCode: region.code,
      salary: current?.salary || 0,
      marketing: current?.marketing || 0,
      office: current?.office || 0,
      software: current?.software || 0,
      otherExpenses: current?.otherExpenses || 0,
      total,
    }
  })

  // Add HQ row
  expensesData.push({
    regionId: 0,
    regionName: 'HQ (Головной офис)',
    regionCode: 'hq',
    salary: 10000,
    marketing: 2000,
    office: 1500,
    software: 2000,
    otherExpenses: 1000,
    total: 16500,
  })

  const totals = {
    salary: expensesData.reduce((sum, d) => sum + d.salary, 0),
    marketing: expensesData.reduce((sum, d) => sum + d.marketing, 0),
    office: expensesData.reduce((sum, d) => sum + d.office, 0),
    software: expensesData.reduce((sum, d) => sum + d.software, 0),
    other: expensesData.reduce((sum, d) => sum + d.otherExpenses, 0),
    total: expensesData.reduce((sum, d) => sum + d.total, 0),
  }

  // Revenue for % calculation
  const totalRevenue = currentData.reduce((sum, d) => sum + d.revenue, 0)

  return {
    period: currentPeriod,
    expensesData,
    totals,
    totalRevenue,
  }
}

export default async function ExpensesEntryPage() {
  const data = await getExpensesData()

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-surface-400">Нет данных о периодах</p>
      </div>
    )
  }

  const expensePercentage = data.totalRevenue > 0 
    ? (data.totals.total / data.totalRevenue) * 100 
    : 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">📝 Ввод расходов</h1>
          <p className="text-surface-400">{data.period.name} • Расходы по категориям</p>
        </div>
        <select className="input">
          <option>Январь 2026</option>
          <option>Декабрь 2025</option>
        </select>
      </div>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Расходы по регионам</CardTitle>
        </CardHeader>
        <CardContent>
          <ExpensesForm 
            periodId={data.period.id} 
            expensesData={data.expensesData} 
          />
        </CardContent>
      </Card>

      {/* Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Аналитика расходов</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <div>
              <p className="text-sm text-surface-400 mb-1">ФОТ</p>
              <p className="text-xl font-bold text-white">{formatCurrency(data.totals.salary)}</p>
              <p className="text-xs text-surface-500">{formatPercent(data.totals.salary / data.totals.total * 100)}</p>
            </div>
            <div>
              <p className="text-sm text-surface-400 mb-1">Маркетинг</p>
              <p className="text-xl font-bold text-white">{formatCurrency(data.totals.marketing)}</p>
              <p className="text-xs text-surface-500">{formatPercent(data.totals.marketing / data.totals.total * 100)}</p>
            </div>
            <div>
              <p className="text-sm text-surface-400 mb-1">Офис</p>
              <p className="text-xl font-bold text-white">{formatCurrency(data.totals.office)}</p>
              <p className="text-xs text-surface-500">{formatPercent(data.totals.office / data.totals.total * 100)}</p>
            </div>
            <div>
              <p className="text-sm text-surface-400 mb-1">Софт</p>
              <p className="text-xl font-bold text-white">{formatCurrency(data.totals.software)}</p>
              <p className="text-xs text-surface-500">{formatPercent(data.totals.software / data.totals.total * 100)}</p>
            </div>
            <div>
              <p className="text-sm text-surface-400 mb-1">Прочее</p>
              <p className="text-xl font-bold text-white">{formatCurrency(data.totals.other)}</p>
              <p className="text-xs text-surface-500">{formatPercent(data.totals.other / data.totals.total * 100)}</p>
            </div>
            <div className="bg-surface-800/50 rounded-lg p-4 -m-2">
              <p className="text-sm text-surface-400 mb-1">ИТОГО</p>
              <p className="text-xl font-bold text-white">{formatCurrency(data.totals.total)}</p>
              <p className="text-xs text-surface-500">{formatPercent(expensePercentage)} от выручки</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

