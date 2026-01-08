import { prisma } from '@/lib/db'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { SalesForm } from './SalesForm'
import { formatCurrency, formatPercent, calculateARPU, calculateChurnRate } from '@/lib/utils'

async function getSalesData() {
  const currentPeriod = await prisma.period.findFirst({
    where: { year: 2026, month: 1 },
  })

  const previousPeriod = await prisma.period.findFirst({
    where: { year: 2025, month: 12 },
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

  const previousData = previousPeriod 
    ? await prisma.monthlyData.findMany({
        where: { periodId: previousPeriod.id },
      })
    : []

  // Map data to regions
  const salesData = regions.map(region => {
    const current = currentData.find(d => d.regionId === region.id)
    const previous = previousData.find(d => d.regionId === region.id)
    
    return {
      regionId: region.id,
      regionName: region.name,
      regionCode: region.code,
      revenue: current?.revenue || 0,
      clientsCount: current?.clientsCount || 0,
      newClients: current?.newClients || 0,
      churnedClients: current?.churnedClients || 0,
      arpu: calculateARPU(current?.revenue || 0, current?.clientsCount || 0),
      previousClients: previous?.clientsCount || 0,
    }
  })

  // Totals
  const totals = {
    revenue: salesData.reduce((sum, d) => sum + d.revenue, 0),
    clients: salesData.reduce((sum, d) => sum + d.clientsCount, 0),
    newClients: salesData.reduce((sum, d) => sum + d.newClients, 0),
    churned: salesData.reduce((sum, d) => sum + d.churnedClients, 0),
  }
  
  const totalPreviousClients = salesData.reduce((sum, d) => sum + d.previousClients, 0)
  
  return {
    period: currentPeriod,
    regions,
    salesData,
    totals: {
      ...totals,
      arpu: calculateARPU(totals.revenue, totals.clients),
      churnRate: calculateChurnRate(totals.churned, totalPreviousClients, totals.newClients),
      netNew: totals.newClients - totals.churned,
    },
  }
}

export default async function SalesEntryPage() {
  const data = await getSalesData()

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-surface-400">Нет данных о периодах</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">📝 Ввод продаж</h1>
          <p className="text-surface-400">{data.period.name} • Данные по регионам</p>
        </div>
        <select className="input">
          <option>Январь 2026</option>
          <option>Декабрь 2025</option>
        </select>
      </div>

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>Продажи по регионам</CardTitle>
        </CardHeader>
        <CardContent>
          <SalesForm 
            periodId={data.period.id} 
            salesData={data.salesData} 
          />
        </CardContent>
      </Card>

      {/* Quick Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Быстрая аналитика</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-surface-400 mb-1">MRR</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(data.totals.revenue)}</p>
            </div>
            <div>
              <p className="text-sm text-surface-400 mb-1">Net New Clients</p>
              <p className="text-2xl font-bold text-green-500">
                {data.totals.netNew > 0 ? '+' : ''}{data.totals.netNew}
              </p>
            </div>
            <div>
              <p className="text-sm text-surface-400 mb-1">Churn Rate</p>
              <p className={`text-2xl font-bold ${data.totals.churnRate > 3 ? 'text-red-500' : 'text-green-500'}`}>
                {formatPercent(data.totals.churnRate)}
              </p>
            </div>
            <div>
              <p className="text-sm text-surface-400 mb-1">Avg ARPU</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(data.totals.arpu)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

