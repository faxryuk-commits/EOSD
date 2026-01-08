export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/db'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import { Target } from 'lucide-react'
import { AddRockButton } from '@/components/forms/AddRockForm'

async function getRocksData() {
  const rocks = await prisma.rock.findMany({
    where: { quarter: 1, year: 2026 },
    include: { owner: true },
    orderBy: { progress: 'desc' },
  })

  const stats = {
    total: rocks.length,
    onTrack: rocks.filter(r => r.status === 'on_track').length,
    offTrack: rocks.filter(r => r.status === 'off_track').length,
    done: rocks.filter(r => r.status === 'done').length,
    avgProgress: rocks.length > 0 ? Math.round(rocks.reduce((sum, r) => sum + r.progress, 0) / rocks.length) : 0,
  }

  return { rocks, stats }
}

export default async function RocksPage() {
  const { rocks, stats } = await getRocksData()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">🎯 Rocks Q1 2026</h1>
          <p className="text-surface-400">Квартальные приоритеты компании</p>
        </div>
        <AddRockButton />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="pt-4">
            <p className="text-sm text-surface-400">On Track</p>
            <p className="text-3xl font-bold text-green-500">{stats.onTrack}</p>
          </CardContent>
        </Card>
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="pt-4">
            <p className="text-sm text-surface-400">Off Track</p>
            <p className="text-3xl font-bold text-red-500">{stats.offTrack}</p>
          </CardContent>
        </Card>
        <Card className="border-blue-500/30 bg-blue-500/5">
          <CardContent className="pt-4">
            <p className="text-sm text-surface-400">Завершено</p>
            <p className="text-3xl font-bold text-blue-500">{stats.done}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-surface-400">Средний прогресс</p>
            <p className="text-3xl font-bold text-white">{stats.avgProgress}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Rocks List */}
      <Card>
        <CardHeader>
          <CardTitle>Company Rocks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {rocks.map((rock) => (
            <div 
              key={rock.id} 
              className="p-4 rounded-lg border border-surface-700/50 bg-surface-800/30 hover:bg-surface-800/50 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-surface-700/50">
                  <Target size={24} className={
                    rock.status === 'on_track' ? 'text-green-500' :
                    rock.status === 'done' ? 'text-blue-500' : 'text-red-500'
                  } />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white">{rock.title}</h3>
                    <Badge variant={
                      rock.status === 'on_track' ? 'green' :
                      rock.status === 'done' ? 'blue' : 'red'
                    }>
                      {rock.status === 'on_track' ? '🟢 On Track' : 
                       rock.status === 'done' ? '✅ Done' : '🔴 Off Track'}
                    </Badge>
                  </div>
                  {rock.description && (
                    <p className="text-sm text-surface-400 mb-3">{rock.description}</p>
                  )}
                  <div className="flex items-center gap-6 mb-3">
                    <div className="flex items-center gap-2 text-sm text-surface-400">
                      <span>👤</span>
                      <span>{rock.owner?.firstName || 'Не назначен'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-surface-400">
                      <span>📅</span>
                      <span>До {formatDate(rock.dueDate)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <ProgressBar 
                        value={rock.progress} 
                        color={rock.status === 'off_track' ? 'red' : 'green'}
                      />
                    </div>
                    <span className="text-sm font-medium text-white w-12 text-right">
                      {rock.progress}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {rocks.length === 0 && (
            <div className="text-center py-12 text-surface-400">
              <Target size={48} className="mx-auto mb-4 opacity-50" />
              <p>Нет Rocks на этот квартал</p>
              <div className="mt-4">
                <AddRockButton />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

