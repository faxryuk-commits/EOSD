export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/db'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { Download, Printer } from 'lucide-react'

async function getPLData() {
  // Get last 4 months + current
  const periods = await prisma.period.findMany({
    orderBy: { id: 'desc' },
    take: 5,
  })

  const periodIds = periods.map(p => p.id)

  const monthlyData = await prisma.monthlyData.findMany({
    where: { periodId: { in: periodIds } },
    include: { region: true },
  })

  // Build P&L data by period
  const plData = periods.reverse().map(period => {
    const periodData = monthlyData.filter(d => d.periodId === period.id)
    
    // Revenue by region
    const revenueByRegion: Record<string, number> = {}
    let totalRevenue = 0
    periodData.forEach(d => {
      revenueByRegion[d.region.code] = d.revenue
      totalRevenue += d.revenue
    })

    // Expenses
    const expenses = {
      salary: periodData.reduce((sum, d) => sum + d.salary, 0),
      marketing: periodData.reduce((sum, d) => sum + d.marketing, 0),
      office: periodData.reduce((sum, d) => sum + d.office, 0),
      software: periodData.reduce((sum, d) => sum + d.software, 0),
      other: periodData.reduce((sum, d) => sum + d.otherExpenses, 0),
    }
    const totalExpenses = Object.values(expenses).reduce((a, b) => a + b, 0)

    // EBITDA
    const ebitda = totalRevenue - totalExpenses
    const ebitdaMargin = totalRevenue > 0 ? (ebitda / totalRevenue) * 100 : 0

    // Taxes (Uzbekistan)
    const taxes = {
      ytt: ebitda > 0 ? ebitda * 0.03 : 0,       // ЯТТ 3%
      itpark: ebitda > 0 ? ebitda * 0.01 : 0,   // IT-park 1%
      inps: expenses.salary * 0.12,              // ИНПС 12%
    }
    const totalTaxes = Object.values(taxes).reduce((a, b) => a + b, 0)

    // Net Profit
    const netProfit = ebitda - totalTaxes
    const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

    return {
      period,
      revenueByRegion,
      totalRevenue,
      expenses,
      totalExpenses,
      expensePercent: totalRevenue > 0 ? (totalExpenses / totalRevenue) * 100 : 0,
      ebitda,
      ebitdaMargin,
      taxes,
      totalTaxes,
      netProfit,
      netMargin,
    }
  })

  // Calculate YTD
  const ytd = {
    totalRevenue: plData.reduce((sum, p) => sum + p.totalRevenue, 0),
    totalExpenses: plData.reduce((sum, p) => sum + p.totalExpenses, 0),
    ebitda: plData.reduce((sum, p) => sum + p.ebitda, 0),
    totalTaxes: plData.reduce((sum, p) => sum + p.totalTaxes, 0),
    netProfit: plData.reduce((sum, p) => sum + p.netProfit, 0),
    expenses: {
      salary: plData.reduce((sum, p) => sum + p.expenses.salary, 0),
      marketing: plData.reduce((sum, p) => sum + p.expenses.marketing, 0),
      office: plData.reduce((sum, p) => sum + p.expenses.office, 0),
      software: plData.reduce((sum, p) => sum + p.expenses.software, 0),
      other: plData.reduce((sum, p) => sum + p.expenses.other, 0),
    },
  }

  return { plData, ytd, periods }
}

export default async function PLReportPage() {
  const { plData, ytd, periods } = await getPLData()

  const regions = ['uz', 'kz', 'ae', 'kg', 'ge', 'sa']
  const regionNames: Record<string, string> = {
    uz: 'UZ', kz: 'KZ', ae: 'AE', kg: 'KG', ge: 'GE', sa: 'SA'
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">📈 P&L Report</h1>
          <p className="text-surface-400">Отчёт о прибылях и убытках</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <Download size={18} />
            Export
          </button>
          <button className="btn-secondary flex items-center gap-2">
            <Printer size={18} />
            Print
          </button>
        </div>
      </div>

      {/* P&L Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-700">
                  <th className="text-left p-4 text-surface-400 font-medium">Показатель</th>
                  {plData.map(p => (
                    <th key={p.period.id} className="text-right p-4 text-surface-400 font-medium">
                      {p.period.name.split(' ')[0]}
                    </th>
                  ))}
                  <th className="text-right p-4 text-surface-400 font-medium bg-surface-800/50">YTD</th>
                </tr>
              </thead>
              <tbody>
                {/* Revenue Section */}
                <tr className="bg-surface-800/30">
                  <td className="p-4 font-semibold text-white" colSpan={plData.length + 2}>
                    📥 ВЫРУЧКА
                  </td>
                </tr>
                {regions.map(region => (
                  <tr key={region} className="border-b border-surface-700/30">
                    <td className="p-4 pl-8 text-surface-300">{regionNames[region]}</td>
                    {plData.map(p => (
                      <td key={p.period.id} className="text-right p-4 text-surface-300">
                        {formatCurrency(p.revenueByRegion[region] || 0)}
                      </td>
                    ))}
                    <td className="text-right p-4 bg-surface-800/50 text-white">
                      {formatCurrency(plData.reduce((sum, p) => sum + (p.revenueByRegion[region] || 0), 0))}
                    </td>
                  </tr>
                ))}
                <tr className="border-b border-surface-600 bg-surface-800/20">
                  <td className="p-4 font-semibold text-white">ИТОГО ВЫРУЧКА</td>
                  {plData.map(p => (
                    <td key={p.period.id} className="text-right p-4 font-semibold text-white">
                      {formatCurrency(p.totalRevenue)}
                    </td>
                  ))}
                  <td className="text-right p-4 font-semibold bg-surface-800/50 text-green-400">
                    {formatCurrency(ytd.totalRevenue)}
                  </td>
                </tr>

                {/* Expenses Section */}
                <tr className="bg-surface-800/30">
                  <td className="p-4 font-semibold text-white" colSpan={plData.length + 2}>
                    📤 РАСХОДЫ
                  </td>
                </tr>
                {[
                  { key: 'salary', label: 'ФОТ' },
                  { key: 'marketing', label: 'Маркетинг' },
                  { key: 'office', label: 'Офис и аренда' },
                  { key: 'software', label: 'Софт и сервисы' },
                  { key: 'other', label: 'Прочее' },
                ].map(({ key, label }) => (
                  <tr key={key} className="border-b border-surface-700/30">
                    <td className="p-4 pl-8 text-surface-300">{label}</td>
                    {plData.map(p => (
                      <td key={p.period.id} className="text-right p-4 text-surface-300">
                        {formatCurrency(p.expenses[key as keyof typeof p.expenses])}
                      </td>
                    ))}
                    <td className="text-right p-4 bg-surface-800/50 text-white">
                      {formatCurrency(ytd.expenses[key as keyof typeof ytd.expenses])}
                    </td>
                  </tr>
                ))}
                <tr className="border-b border-surface-600 bg-surface-800/20">
                  <td className="p-4 font-semibold text-white">ИТОГО РАСХОДЫ</td>
                  {plData.map(p => (
                    <td key={p.period.id} className="text-right p-4 font-semibold text-white">
                      {formatCurrency(p.totalExpenses)}
                    </td>
                  ))}
                  <td className="text-right p-4 font-semibold bg-surface-800/50 text-red-400">
                    {formatCurrency(ytd.totalExpenses)}
                  </td>
                </tr>
                <tr className="border-b border-surface-700/30">
                  <td className="p-4 pl-8 text-surface-400 text-sm">% от выручки</td>
                  {plData.map(p => (
                    <td key={p.period.id} className="text-right p-4 text-surface-400 text-sm">
                      {formatPercent(p.expensePercent)}
                    </td>
                  ))}
                  <td className="text-right p-4 bg-surface-800/50 text-surface-400 text-sm">
                    {formatPercent(ytd.totalRevenue > 0 ? (ytd.totalExpenses / ytd.totalRevenue) * 100 : 0)}
                  </td>
                </tr>

                {/* EBITDA */}
                <tr className="border-b border-surface-600 bg-green-500/5">
                  <td className="p-4 font-semibold text-green-400">💰 EBITDA</td>
                  {plData.map(p => (
                    <td key={p.period.id} className="text-right p-4 font-semibold text-green-400">
                      {formatCurrency(p.ebitda)}
                    </td>
                  ))}
                  <td className="text-right p-4 font-semibold bg-surface-800/50 text-green-400">
                    {formatCurrency(ytd.ebitda)}
                  </td>
                </tr>
                <tr className="border-b border-surface-700/30">
                  <td className="p-4 pl-8 text-surface-400 text-sm">Margin</td>
                  {plData.map(p => (
                    <td key={p.period.id} className="text-right p-4 text-surface-400 text-sm">
                      {formatPercent(p.ebitdaMargin)}
                    </td>
                  ))}
                  <td className="text-right p-4 bg-surface-800/50 text-surface-400 text-sm">
                    {formatPercent(ytd.totalRevenue > 0 ? (ytd.ebitda / ytd.totalRevenue) * 100 : 0)}
                  </td>
                </tr>

                {/* Taxes */}
                <tr className="bg-surface-800/30">
                  <td className="p-4 font-semibold text-white" colSpan={plData.length + 2}>
                    📋 НАЛОГИ
                  </td>
                </tr>
                {[
                  { key: 'ytt', label: 'ЯТТ (3%)' },
                  { key: 'itpark', label: 'IT-парк (1%)' },
                  { key: 'inps', label: 'ИНПС (12%)' },
                ].map(({ key, label }) => (
                  <tr key={key} className="border-b border-surface-700/30">
                    <td className="p-4 pl-8 text-surface-300">{label}</td>
                    {plData.map(p => (
                      <td key={p.period.id} className="text-right p-4 text-surface-300">
                        {formatCurrency(p.taxes[key as keyof typeof p.taxes])}
                      </td>
                    ))}
                    <td className="text-right p-4 bg-surface-800/50 text-white">
                      {formatCurrency(plData.reduce((sum, p) => sum + p.taxes[key as keyof typeof p.taxes], 0))}
                    </td>
                  </tr>
                ))}
                <tr className="border-b border-surface-600 bg-surface-800/20">
                  <td className="p-4 font-semibold text-white">ИТОГО НАЛОГИ</td>
                  {plData.map(p => (
                    <td key={p.period.id} className="text-right p-4 font-semibold text-white">
                      {formatCurrency(p.totalTaxes)}
                    </td>
                  ))}
                  <td className="text-right p-4 font-semibold bg-surface-800/50 text-white">
                    {formatCurrency(ytd.totalTaxes)}
                  </td>
                </tr>

                {/* Net Profit */}
                <tr className="bg-primary-500/10">
                  <td className="p-4 font-bold text-primary-400 text-lg">💎 ЧИСТАЯ ПРИБЫЛЬ</td>
                  {plData.map(p => (
                    <td key={p.period.id} className="text-right p-4 font-bold text-primary-400 text-lg">
                      {formatCurrency(p.netProfit)}
                    </td>
                  ))}
                  <td className="text-right p-4 font-bold bg-primary-500/20 text-primary-400 text-lg">
                    {formatCurrency(ytd.netProfit)}
                  </td>
                </tr>
                <tr>
                  <td className="p-4 pl-8 text-surface-400 text-sm">Net Margin</td>
                  {plData.map(p => (
                    <td key={p.period.id} className="text-right p-4 text-surface-400 text-sm">
                      {formatPercent(p.netMargin)}
                    </td>
                  ))}
                  <td className="text-right p-4 bg-surface-800/50 text-primary-400 text-sm font-medium">
                    {formatPercent(ytd.totalRevenue > 0 ? (ytd.netProfit / ytd.totalRevenue) * 100 : 0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

