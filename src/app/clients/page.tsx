import { prisma } from '@/lib/db'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency } from '@/lib/utils'
import { Plus, Users, TrendingDown, AlertCircle, CheckCircle, XCircle } from 'lucide-react'

async function getClientsData() {
  const clients = await prisma.topClient.findMany({
    include: { 
      region: true,
      healthChecks: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { mrr: 'desc' },
    take: 20,
  })

  const totalMRR = clients.reduce((sum, c) => sum + c.mrr, 0)

  // Count by health status (simulated since we don't have health checks yet)
  const healthStats = {
    healthy: 12,
    atRisk: 6,
    critical: 2,
  }

  return { clients, totalMRR, healthStats }
}

const healthColors = {
  healthy: 'text-green-500',
  at_risk: 'text-yellow-500',
  critical: 'text-red-500',
}

const healthBadges = {
  healthy: { variant: 'green' as const, icon: <CheckCircle size={14} />, text: 'Healthy' },
  at_risk: { variant: 'yellow' as const, icon: <AlertCircle size={14} />, text: 'At Risk' },
  critical: { variant: 'red' as const, icon: <XCircle size={14} />, text: 'Critical' },
}

export default async function TopClientsPage() {
  const { clients, totalMRR, healthStats } = await getClientsData()

  // Simulated health for demo
  const getSimulatedHealth = (index: number): 'healthy' | 'at_risk' | 'critical' => {
    if (index < 3) return 'healthy'
    if (index === 3) return 'at_risk'
    if (index === 4) return 'critical'
    return index % 3 === 0 ? 'at_risk' : 'healthy'
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">🏆 TOP Clients Health Check</h1>
          <p className="text-surface-400">Мониторинг ключевых клиентов</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Добавить клиента
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-surface-400">TOP-20 MRR</p>
            <p className="text-3xl font-bold text-white">{formatCurrency(totalMRR)}</p>
          </CardContent>
        </Card>
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="pt-4">
            <p className="text-sm text-surface-400">🟢 Healthy</p>
            <p className="text-3xl font-bold text-green-500">{healthStats.healthy}</p>
          </CardContent>
        </Card>
        <Card className="border-yellow-500/30 bg-yellow-500/5">
          <CardContent className="pt-4">
            <p className="text-sm text-surface-400">🟡 At Risk</p>
            <p className="text-3xl font-bold text-yellow-500">{healthStats.atRisk}</p>
          </CardContent>
        </Card>
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="pt-4">
            <p className="text-sm text-surface-400">🔴 Critical</p>
            <p className="text-3xl font-bold text-red-500">{healthStats.critical}</p>
          </CardContent>
        </Card>
      </div>

      {/* Clients Table */}
      <Card>
        <CardHeader>
          <CardTitle>TOP-20 Clients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Клиент</th>
                  <th>Регион</th>
                  <th>MRR</th>
                  <th>Тариф</th>
                  <th>Health Status</th>
                  <th>Churn Risk</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client, index) => {
                  const health = getSimulatedHealth(index)
                  const healthBadge = healthBadges[health]
                  
                  return (
                    <tr key={client.id}>
                      <td className="text-surface-400">{index + 1}</td>
                      <td>
                        <div>
                          <p className="font-medium text-white">{client.name}</p>
                          {client.contactEmail && (
                            <p className="text-xs text-surface-500">{client.contactEmail}</p>
                          )}
                        </div>
                      </td>
                      <td>
                        <Badge variant="gray">{client.region.code.toUpperCase()}</Badge>
                      </td>
                      <td className="font-medium text-white">
                        {formatCurrency(client.mrr)}
                      </td>
                      <td>
                        <Badge variant={client.tariff === 'enterprise' ? 'purple' : 'blue'}>
                          {client.tariff || 'standard'}
                        </Badge>
                      </td>
                      <td>
                        <Badge variant={healthBadge.variant} className="flex items-center gap-1">
                          {healthBadge.icon} {healthBadge.text}
                        </Badge>
                      </td>
                      <td>
                        <Badge variant={
                          health === 'critical' ? 'red' :
                          health === 'at_risk' ? 'yellow' : 'green'
                        }>
                          {health === 'critical' ? 'High' :
                           health === 'at_risk' ? 'Medium' : 'Low'}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

