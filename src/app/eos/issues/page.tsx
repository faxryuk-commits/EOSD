'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Plus, AlertTriangle, CheckCircle, Clock, User, ArrowUp, ArrowDown, Minus } from 'lucide-react'

interface Issue {
  id: number
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  status: 'open' | 'discussing' | 'solved'
  owner: string
  createdAt: string
}

const initialIssues: Issue[] = [
  {
    id: 1,
    title: 'Высокий churn в Казахстане',
    description: 'Отток клиентов в KZ превышает 8% в месяц. Нужно провести анализ причин.',
    priority: 'high',
    status: 'discussing',
    owner: 'Алексей',
    createdAt: '2026-01-05',
  },
  {
    id: 2,
    title: 'Нехватка senior разработчиков',
    description: 'Не можем закрыть 3 позиции уже 2 месяца. Рассмотреть удалённый найм.',
    priority: 'high',
    status: 'open',
    owner: 'HR',
    createdAt: '2026-01-03',
  },
  {
    id: 3,
    title: 'Задержки платежей от клиентов',
    description: 'Дебиторская задолженность выросла на 40%. Пересмотреть условия оплаты.',
    priority: 'medium',
    status: 'open',
    owner: 'Финансы',
    createdAt: '2026-01-02',
  },
  {
    id: 4,
    title: 'Интеграция с новым эквайрингом',
    description: 'Необходимо интегрировать новый платёжный шлюз для ОАЭ.',
    priority: 'medium',
    status: 'discussing',
    owner: 'Product',
    createdAt: '2025-12-28',
  },
  {
    id: 5,
    title: 'Обновление документации API',
    description: 'Документация устарела, клиенты жалуются.',
    priority: 'low',
    status: 'solved',
    owner: 'DevRel',
    createdAt: '2025-12-20',
  },
]

export default function IssuesPage() {
  const [issues, setIssues] = useState<Issue[]>(initialIssues)
  const [filter, setFilter] = useState<'all' | 'open' | 'discussing' | 'solved'>('all')

  const filteredIssues = issues.filter(issue => 
    filter === 'all' ? true : issue.status === filter
  )

  const stats = {
    open: issues.filter(i => i.status === 'open').length,
    discussing: issues.filter(i => i.status === 'discussing').length,
    solved: issues.filter(i => i.status === 'solved').length,
  }

  const priorityIcon = (priority: string) => {
    if (priority === 'high') return <ArrowUp className="w-4 h-4 text-red-400" />
    if (priority === 'medium') return <Minus className="w-4 h-4 text-amber-400" />
    return <ArrowDown className="w-4 h-4 text-blue-400" />
  }

  const statusBadge = (status: string) => {
    if (status === 'open') return <Badge variant="red">Открыт</Badge>
    if (status === 'discussing') return <Badge variant="yellow">Обсуждается</Badge>
    return <Badge variant="green">Решён</Badge>
  }

  const updateStatus = (id: number, newStatus: Issue['status']) => {
    setIssues(issues.map(issue => 
      issue.id === id ? { ...issue, status: newStatus } : issue
    ))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Issues List</h1>
          <p className="text-slate-400">Список проблем для обсуждения на L10 (EOS)</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors">
          <Plus size={20} />
          Добавить Issue
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          className={`cursor-pointer transition-all ${filter === 'open' ? 'ring-2 ring-red-500 rounded-xl' : ''}`}
          onClick={() => setFilter(filter === 'open' ? 'all' : 'open')}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Открытые</p>
                  <p className="text-2xl font-bold text-red-400">{stats.open}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div 
          className={`cursor-pointer transition-all ${filter === 'discussing' ? 'ring-2 ring-amber-500 rounded-xl' : ''}`}
          onClick={() => setFilter(filter === 'discussing' ? 'all' : 'discussing')}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Обсуждаются</p>
                  <p className="text-2xl font-bold text-amber-400">{stats.discussing}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div 
          className={`cursor-pointer transition-all ${filter === 'solved' ? 'ring-2 ring-emerald-500 rounded-xl' : ''}`}
          onClick={() => setFilter(filter === 'solved' ? 'all' : 'solved')}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Решены</p>
                  <p className="text-2xl font-bold text-emerald-400">{stats.solved}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Issues List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filter === 'all' ? 'Все Issues' : 
             filter === 'open' ? 'Открытые Issues' :
             filter === 'discussing' ? 'Issues в обсуждении' : 'Решённые Issues'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredIssues.map((issue) => (
              <div 
                key={issue.id} 
                className={`p-4 rounded-lg border transition-colors ${
                  issue.status === 'solved' 
                    ? 'bg-slate-800/30 border-slate-700/50' 
                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {priorityIcon(issue.priority)}
                      <h3 className={`font-medium ${issue.status === 'solved' ? 'text-slate-400 line-through' : 'text-white'}`}>
                        {issue.title}
                      </h3>
                      {statusBadge(issue.status)}
                    </div>
                    <p className="text-slate-400 text-sm mb-3">{issue.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-slate-500">
                        <User size={14} />
                        {issue.owner}
                      </div>
                      <div className="text-slate-500">
                        {new Date(issue.createdAt).toLocaleDateString('ru')}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {issue.status !== 'discussing' && issue.status !== 'solved' && (
                      <button 
                        onClick={() => updateStatus(issue.id, 'discussing')}
                        className="px-3 py-1 text-sm bg-amber-600 hover:bg-amber-500 text-white rounded transition-colors"
                      >
                        Обсудить
                      </button>
                    )}
                    {issue.status !== 'solved' && (
                      <button 
                        onClick={() => updateStatus(issue.id, 'solved')}
                        className="px-3 py-1 text-sm bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-colors"
                      >
                        Решено
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {filteredIssues.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                Нет issues в этой категории
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* IDS Process */}
      <Card>
        <CardHeader>
          <CardTitle>IDS Process</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <h3 className="text-blue-400 font-medium mb-2">1. Identify</h3>
              <p className="text-slate-400 text-sm">Определить корневую причину проблемы, а не симптомы</p>
            </div>
            <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <h3 className="text-purple-400 font-medium mb-2">2. Discuss</h3>
              <p className="text-slate-400 text-sm">Обсудить все возможные решения, выслушать каждого</p>
            </div>
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
              <h3 className="text-emerald-400 font-medium mb-2">3. Solve</h3>
              <p className="text-slate-400 text-sm">Принять решение и назначить ответственного с дедлайном</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

