export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/db'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { Target, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react'

async function getPlanFactData() {
  const currentPeriod = await prisma.period.findFirst({
    where: { year: 2026, month: 1 },
  })

  if (!currentPeriod) {
    return { regions: [], totals: { planMRR: 0, factMRR: 0, planClients: 0, factClients: 0 } }
  }

  const regions = await prisma.region.findMany({
    where: { isActive: true },
  })

  const monthlyData = await prisma.monthlyData.findMany({
    where: { periodId: currentPeriod.id },
    include: { region: true },
  })

  const budgetPlans = await prisma.budgetPlan.findMany({
    where: { periodId: currentPeriod.id },
    include: { region: true },
  })

  // Combine plan and fact data
  const regionData = regions.map(region => {
    const fact = monthlyData.find(d => d.regionId === region.id)
    const revenuePlan = budgetPlans.find(p => p.regionId === region.id && p.category === 'revenue')
    const clientsPlan = budgetPlans.find(p => p.regionId === region.id && p.category === 'clients')

    const planMRR = revenuePlan?.planAmount || (fact?.revenue || 0) * 1.1 // Default: fact + 10%
    const factMRR = fact?.revenue || 0
    const planClients = clientsPlan?.planAmount || (fact?.clientsCount || 0)
    const factClients = fact?.clientsCount || 0

    const mrrCompletion = planMRR > 0 ? (factMRR / planMRR) * 100 : 0
    const clientsCompletion = planClients > 0 ? (factClients / planClients) * 100 : 0

    return {
      region,
      planMRR,
      factMRR,
      mrrCompletion,
      mrrDelta: factMRR - planMRR,
      planClients,
      factClients,
      clientsCompletion,
      clientsDelta: factClients - planClients,
    }
  })

  const totals = {
    planMRR: regionData.reduce((sum, r) => sum + r.planMRR, 0),
    factMRR: regionData.reduce((sum, r) => sum + r.factMRR, 0),
    planClients: regionData.reduce((sum, r) => sum + r.planClients, 0),
    factClients: regionData.reduce((sum, r) => sum + r.factClients, 0),
  }

  return { regions: regionData, totals, period: currentPeriod }
}

export default async function PlanFactPage() {
  const data = await getPlanFactData()
  const { totals } = data

  const totalMRRCompletion = totals.planMRR > 0 ? (totals.factMRR / totals.planMRR) * 100 : 0
  const totalClientsCompletion = totals.planClients > 0 ? (totals.factClients / totals.planClients) * 100 : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">План-Факт анализ</h1>
        <p className="text-slate-400">Сравнение плановых и фактических показателей</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-blue-400" />
              <span className="text-slate-400 text-sm">План MRR</span>
            </div>
            <p className="text-2xl font-bold text-white">{formatCurrency(totals.planMRR)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span className="text-slate-400 text-sm">Факт MRR</span>
            </div>
            <p className="text-2xl font-bold text-emerald-400">{formatCurrency(totals.factMRR)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              {totalMRRCompletion >= 100 ? (
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              )}
              <span className="text-slate-400 text-sm">Выполнение MRR</span>
            </div>
            <p className={`text-2xl font-bold ${totalMRRCompletion >= 100 ? 'text-emerald-400' : totalMRRCompletion >= 80 ? 'text-amber-400' : 'text-red-400'}`}>
              {totalMRRCompletion.toFixed(1)}%
            </p>
            <ProgressBar 
              value={Math.min(totalMRRCompletion, 100)} 
              className="mt-2"
              color={totalMRRCompletion >= 100 ? 'emerald' : totalMRRCompletion >= 80 ? 'amber' : 'red'}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              {totalClientsCompletion >= 100 ? (
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              )}
              <span className="text-slate-400 text-sm">Выполнение клиентов</span>
            </div>
            <p className={`text-2xl font-bold ${totalClientsCompletion >= 100 ? 'text-emerald-400' : totalClientsCompletion >= 80 ? 'text-amber-400' : 'text-red-400'}`}>
              {totalClientsCompletion.toFixed(1)}%
            </p>
            <ProgressBar 
              value={Math.min(totalClientsCompletion, 100)} 
              className="mt-2"
              color={totalClientsCompletion >= 100 ? 'emerald' : totalClientsCompletion >= 80 ? 'amber' : 'red'}
            />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>По регионам</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Регион</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">План MRR</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">Факт MRR</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">%</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">Δ MRR</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">План клиентов</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">Факт клиентов</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">%</th>
                </tr>
              </thead>
              <tbody>
                {data.regions.map((item) => (
                  <tr key={item.region.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.region.color }}
                        />
                        <span className="text-white font-medium">{item.region.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400">{formatCurrency(item.planMRR)}</td>
                    <td className="py-3 px-4 text-right text-white">{formatCurrency(item.factMRR)}</td>
                    <td className="py-3 px-4 text-right">
                      <Badge variant={item.mrrCompletion >= 100 ? 'green' : item.mrrCompletion >= 80 ? 'yellow' : 'red'}>
                        {item.mrrCompletion.toFixed(0)}%
                      </Badge>
                    </td>
                    <td className={`py-3 px-4 text-right ${item.mrrDelta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {item.mrrDelta >= 0 ? '+' : ''}{formatCurrency(item.mrrDelta)}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400">{item.planClients}</td>
                    <td className="py-3 px-4 text-right text-white">{item.factClients}</td>
                    <td className="py-3 px-4 text-right">
                      <Badge variant={item.clientsCompletion >= 100 ? 'green' : item.clientsCompletion >= 80 ? 'yellow' : 'red'}>
                        {item.clientsCompletion.toFixed(0)}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-800/50 font-bold">
                  <td className="py-3 px-4 text-white">ИТОГО</td>
                  <td className="py-3 px-4 text-right text-slate-400">{formatCurrency(totals.planMRR)}</td>
                  <td className="py-3 px-4 text-right text-white">{formatCurrency(totals.factMRR)}</td>
                  <td className="py-3 px-4 text-right">
                    <Badge variant={totalMRRCompletion >= 100 ? 'green' : totalMRRCompletion >= 80 ? 'yellow' : 'red'}>
                      {totalMRRCompletion.toFixed(0)}%
                    </Badge>
                  </td>
                  <td className={`py-3 px-4 text-right ${totals.factMRR - totals.planMRR >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {totals.factMRR - totals.planMRR >= 0 ? '+' : ''}{formatCurrency(totals.factMRR - totals.planMRR)}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-400">{totals.planClients}</td>
                  <td className="py-3 px-4 text-right text-white">{totals.factClients}</td>
                  <td className="py-3 px-4 text-right">
                    <Badge variant={totalClientsCompletion >= 100 ? 'green' : totalClientsCompletion >= 80 ? 'yellow' : 'red'}>
                      {totalClientsCompletion.toFixed(0)}%
                    </Badge>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Выводы</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.regions.filter(r => r.mrrCompletion >= 100).length > 0 && (
              <div className="flex items-start gap-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5" />
                <div>
                  <p className="text-emerald-400 font-medium">Лидеры</p>
                  <p className="text-slate-400 text-sm">
                    {data.regions.filter(r => r.mrrCompletion >= 100).map(r => r.region.name).join(', ')} выполнили план
                  </p>
                </div>
              </div>
            )}
            {data.regions.filter(r => r.mrrCompletion < 80).length > 0 && (
              <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <TrendingDown className="w-5 h-5 text-red-400 mt-0.5" />
                <div>
                  <p className="text-red-400 font-medium">Требуют внимания</p>
                  <p className="text-slate-400 text-sm">
                    {data.regions.filter(r => r.mrrCompletion < 80).map(r => r.region.name).join(', ')} - выполнение менее 80%
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

