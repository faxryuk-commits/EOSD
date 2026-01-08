export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/db'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import { Plus, AlertTriangle, Shield, TrendingDown, Users, Cpu, Scale } from 'lucide-react'

async function getWarningsData() {
  const warnings = await prisma.warning.findMany({
    include: { owner: true, region: true },
    orderBy: [
      { severity: 'asc' },
      { createdAt: 'desc' },
    ],
  })

  const stats = {
    critical: warnings.filter(w => w.severity === 'critical').length,
    high: warnings.filter(w => w.severity === 'high').length,
    medium: warnings.filter(w => w.severity === 'medium').length,
    low: warnings.filter(w => w.severity === 'low').length,
    open: warnings.filter(w => w.status === 'open').length,
    mitigating: warnings.filter(w => w.status === 'mitigating').length,
  }

  return { warnings, stats }
}

const categoryIcons: Record<string, React.ReactNode> = {
  financial: <TrendingDown size={20} />,
  operational: <Shield size={20} />,
  market: <TrendingDown size={20} />,
  team: <Users size={20} />,
  tech: <Cpu size={20} />,
  legal: <Scale size={20} />,
}

const categoryColors: Record<string, string> = {
  financial: 'text-yellow-500',
  operational: 'text-blue-500',
  market: 'text-purple-500',
  team: 'text-green-500',
  tech: 'text-cyan-500',
  legal: 'text-orange-500',
}

export default async function WarningsPage() {
  const { warnings, stats } = await getWarningsData()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">⚠️ Warning List</h1>
          <p className="text-surface-400">Реестр рисков и проблем</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Добавить риск
        </button>
      </div>

      {/* Risk Matrix Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-red-500/50 bg-red-500/10">
          <CardContent className="pt-4 text-center">
            <p className="text-4xl font-bold text-red-500">{stats.critical}</p>
            <p className="text-sm text-surface-400">🔴 Critical</p>
          </CardContent>
        </Card>
        <Card className="border-orange-500/50 bg-orange-500/10">
          <CardContent className="pt-4 text-center">
            <p className="text-4xl font-bold text-orange-500">{stats.high}</p>
            <p className="text-sm text-surface-400">🟠 High</p>
          </CardContent>
        </Card>
        <Card className="border-yellow-500/50 bg-yellow-500/10">
          <CardContent className="pt-4 text-center">
            <p className="text-4xl font-bold text-yellow-500">{stats.medium}</p>
            <p className="text-sm text-surface-400">🟡 Medium</p>
          </CardContent>
        </Card>
        <Card className="border-green-500/50 bg-green-500/10">
          <CardContent className="pt-4 text-center">
            <p className="text-4xl font-bold text-green-500">{stats.low}</p>
            <p className="text-sm text-surface-400">🟢 Low</p>
          </CardContent>
        </Card>
      </div>

      {/* Warnings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Все риски ({warnings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {warnings.map((warning) => (
              <div 
                key={warning.id}
                className="p-4 rounded-lg border border-surface-700/50 bg-surface-800/30 hover:bg-surface-800/50 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg bg-surface-700/50 ${categoryColors[warning.category]}`}>
                    {categoryIcons[warning.category] || <AlertTriangle size={20} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-white">{warning.title}</h3>
                        {warning.description && (
                          <p className="text-sm text-surface-400 mt-1">{warning.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          warning.severity === 'critical' ? 'red' :
                          warning.severity === 'high' ? 'yellow' :
                          warning.severity === 'medium' ? 'blue' : 'green'
                        }>
                          {warning.severity === 'critical' ? '🔴' :
                           warning.severity === 'high' ? '🟠' :
                           warning.severity === 'medium' ? '🟡' : '🟢'} {warning.severity}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 mt-3">
                      <Badge variant="gray">{warning.category}</Badge>
                      <Badge variant={
                        warning.status === 'open' ? 'red' :
                        warning.status === 'monitoring' ? 'blue' :
                        warning.status === 'mitigating' ? 'yellow' : 'green'
                      }>
                        {warning.status}
                      </Badge>
                      {warning.probability && (
                        <span className="text-xs text-surface-400">
                          Вероятность: {warning.probability}
                        </span>
                      )}
                      {warning.impact && (
                        <span className="text-xs text-surface-400">
                          Влияние: {warning.impact}
                        </span>
                      )}
                    </div>

                    {warning.mitigationPlan && (
                      <div className="mt-3 p-3 rounded bg-surface-700/30 border border-surface-600/30">
                        <p className="text-xs text-surface-400 mb-1">План митигации:</p>
                        <p className="text-sm text-surface-300">{warning.mitigationPlan}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-4 mt-3 text-xs text-surface-500">
                      <span>Создано: {formatDate(warning.identifiedDate)}</span>
                      {warning.owner && <span>Ответственный: {warning.owner.firstName}</span>}
                      {warning.region && <span>Регион: {warning.region.name}</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {warnings.length === 0 && (
              <div className="text-center py-12 text-surface-400">
                <AlertTriangle size={48} className="mx-auto mb-4 opacity-50" />
                <p>Нет активных рисков</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

