export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/db'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency } from '@/lib/utils'
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'

async function getCashFlowData() {
  const periods = await prisma.period.findMany({
    orderBy: { id: 'desc' },
    take: 5,
  })

  const monthlyData = await prisma.monthlyData.findMany({
    where: { periodId: { in: periods.map(p => p.id) } },
    include: { region: true, period: true },
  })

  // Group by period
  const byPeriod = periods.map(period => {
    const data = monthlyData.filter(d => d.periodId === period.id)
    const totalRevenue = data.reduce((sum, d) => sum + (d.revenue || 0), 0)
    const totalExpenses = data.reduce((sum, d) => 
      sum + (d.salary || 0) + (d.marketing || 0) + (d.office || 0) + 
      (d.software || 0) + (d.otherExpenses || 0), 0)
    const netCashFlow = totalRevenue - totalExpenses

    return {
      period,
      revenue: totalRevenue,
      expenses: totalExpenses,
      netCashFlow,
      data,
    }
  }).reverse()

  // Calculate running balance
  let runningBalance = 50000 // Starting balance
  const withBalance = byPeriod.map(item => {
    runningBalance += item.netCashFlow
    return { ...item, balance: runningBalance }
  })

  // Current month stats
  const current = withBalance[withBalance.length - 1] || { revenue: 0, expenses: 0, netCashFlow: 0, balance: 0 }
  const previous = withBalance[withBalance.length - 2] || { revenue: 0, expenses: 0, netCashFlow: 0, balance: 0 }

  return {
    periods: withBalance,
    current,
    previous,
    totalInflow: withBalance.reduce((sum, p) => sum + p.revenue, 0),
    totalOutflow: withBalance.reduce((sum, p) => sum + p.expenses, 0),
  }
}

export default async function CashFlowPage() {
  const data = await getCashFlowData()

  const revenueChange = data.previous.revenue > 0 
    ? ((data.current.revenue - data.previous.revenue) / data.previous.revenue * 100).toFixed(1)
    : '0'

  const expenseChange = data.previous.expenses > 0
    ? ((data.current.expenses - data.previous.expenses) / data.previous.expenses * 100).toFixed(1)
    : '0'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Cash Flow</h1>
        <p className="text-slate-400">Движение денежных средств</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Поступления (мес)</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {formatCurrency(data.current.revenue)}
                </p>
                <div className={`flex items-center mt-1 text-sm ${Number(revenueChange) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {Number(revenueChange) >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                  {Math.abs(Number(revenueChange))}% vs прошлый месяц
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Расходы (мес)</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {formatCurrency(data.current.expenses)}
                </p>
                <div className={`flex items-center mt-1 text-sm ${Number(expenseChange) <= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {Number(expenseChange) <= 0 ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                  {Math.abs(Number(expenseChange))}% vs прошлый месяц
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Чистый поток</p>
                <p className={`text-2xl font-bold mt-1 ${data.current.netCashFlow >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {data.current.netCashFlow >= 0 ? '+' : ''}{formatCurrency(data.current.netCashFlow)}
                </p>
                <p className="text-slate-500 text-sm mt-1">
                  {data.current.netCashFlow >= 0 ? 'Профицит' : 'Дефицит'}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${data.current.netCashFlow >= 0 ? 'bg-emerald-500/20' : 'bg-red-500/20'} flex items-center justify-center`}>
                <DollarSign className={`w-6 h-6 ${data.current.netCashFlow >= 0 ? 'text-emerald-400' : 'text-red-400'}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Баланс</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {formatCurrency(data.current.balance)}
                </p>
                <p className="text-slate-500 text-sm mt-1">
                  На конец периода
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cash Flow Table */}
      <Card>
        <CardHeader>
          <CardTitle>Движение по периодам</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Период</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">Поступления</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">Расходы</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">Чистый поток</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">Баланс</th>
                </tr>
              </thead>
              <tbody>
                {data.periods.map((item, idx) => (
                  <tr key={item.period.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                    <td className="py-3 px-4 text-white font-medium">{item.period.name}</td>
                    <td className="py-3 px-4 text-right text-emerald-400">
                      +{formatCurrency(item.revenue)}
                    </td>
                    <td className="py-3 px-4 text-right text-red-400">
                      -{formatCurrency(item.expenses)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Badge variant={item.netCashFlow >= 0 ? 'green' : 'red'}>
                        {item.netCashFlow >= 0 ? '+' : ''}{formatCurrency(item.netCashFlow)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right text-white font-medium">
                      {formatCurrency(item.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-800/50">
                  <td className="py-3 px-4 text-white font-bold">ИТОГО</td>
                  <td className="py-3 px-4 text-right text-emerald-400 font-bold">
                    +{formatCurrency(data.totalInflow)}
                  </td>
                  <td className="py-3 px-4 text-right text-red-400 font-bold">
                    -{formatCurrency(data.totalOutflow)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Badge variant={data.totalInflow - data.totalOutflow >= 0 ? 'green' : 'red'}>
                      {formatCurrency(data.totalInflow - data.totalOutflow)}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right text-white font-bold">
                    {formatCurrency(data.current.balance)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Breakdown by Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-emerald-400">Поступления по регионам</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.current.data?.map(item => (
                <div key={item.region?.code} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.region?.color || '#22c55e' }}
                    />
                    <span className="text-slate-300">{item.region?.name}</span>
                  </div>
                  <span className="text-emerald-400 font-medium">
                    +{formatCurrency(item.revenue || 0)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-red-400">Расходы по категориям</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: 'Персонал', value: data.current.data?.reduce((s, d) => s + (d.salary || 0), 0) || 0 },
                { label: 'Маркетинг', value: data.current.data?.reduce((s, d) => s + (d.marketing || 0), 0) || 0 },
                { label: 'Софт', value: data.current.data?.reduce((s, d) => s + (d.software || 0), 0) || 0 },
                { label: 'Офис', value: data.current.data?.reduce((s, d) => s + (d.office || 0), 0) || 0 },
                { label: 'Прочие', value: data.current.data?.reduce((s, d) => s + (d.otherExpenses || 0), 0) || 0 },
              ].filter(c => c.value > 0).map(category => (
                <div key={category.label} className="flex items-center justify-between">
                  <span className="text-slate-300">{category.label}</span>
                  <span className="text-red-400 font-medium">
                    -{formatCurrency(category.value)}
                  </span>
                </div>
              ))}
              {data.current.expenses === 0 && (
                <p className="text-slate-500 text-sm">Нет данных о расходах</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

