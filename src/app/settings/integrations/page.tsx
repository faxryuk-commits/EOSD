'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Database, Server, Key, RefreshCw, Check, X, Plus, Trash2, Save, TestTube, HelpCircle } from 'lucide-react'

interface ClickHouseMetric {
  id: string
  name: string
  query: string
  targetField: string
  enabled: boolean
}

export default function IntegrationsPage() {
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'testing'>('disconnected')
  const [config, setConfig] = useState({
    host: '',
    port: '8123',
    database: 'default',
    username: '',
    password: '',
    ssl: true,
  })
  
  const [metrics, setMetrics] = useState<ClickHouseMetric[]>([
    {
      id: '1',
      name: 'Активные клиенты',
      query: 'SELECT count(DISTINCT user_id) FROM events WHERE date >= today() - 30',
      targetField: 'activeClients',
      enabled: true,
    },
    {
      id: '2',
      name: 'Новые клиенты',
      query: 'SELECT count(DISTINCT user_id) FROM events WHERE event = \'signup\' AND date >= toStartOfMonth(today())',
      targetField: 'newClients',
      enabled: true,
    },
    {
      id: '3',
      name: 'MRR',
      query: 'SELECT sum(amount) FROM payments WHERE status = \'completed\' AND date >= toStartOfMonth(today())',
      targetField: 'mrr',
      enabled: true,
    },
  ])

  const [newMetric, setNewMetric] = useState({ name: '', query: '', targetField: '' })
  const [showAddForm, setShowAddForm] = useState(false)

  const testConnection = async () => {
    setConnectionStatus('testing')
    // Simulate connection test
    setTimeout(() => {
      if (config.host && config.username) {
        setConnectionStatus('connected')
      } else {
        setConnectionStatus('disconnected')
      }
    }, 1500)
  }

  const addMetric = () => {
    if (newMetric.name && newMetric.query && newMetric.targetField) {
      setMetrics([
        ...metrics,
        {
          id: Date.now().toString(),
          ...newMetric,
          enabled: true,
        },
      ])
      setNewMetric({ name: '', query: '', targetField: '' })
      setShowAddForm(false)
    }
  }

  const removeMetric = (id: string) => {
    setMetrics(metrics.filter(m => m.id !== id))
  }

  const toggleMetric = (id: string) => {
    setMetrics(metrics.map(m => 
      m.id === id ? { ...m, enabled: !m.enabled } : m
    ))
  }

  const targetFields = [
    { value: 'activeClients', label: 'Активные клиенты' },
    { value: 'newClients', label: 'Новые клиенты' },
    { value: 'churnedClients', label: 'Отток клиентов' },
    { value: 'mrr', label: 'MRR' },
    { value: 'revenue', label: 'Выручка' },
    { value: 'arpu', label: 'ARPU' },
    { value: 'nps', label: 'NPS Score' },
    { value: 'dau', label: 'DAU' },
    { value: 'mau', label: 'MAU' },
    { value: 'orders', label: 'Заказы' },
    { value: 'customMetric1', label: 'Custom Metric 1' },
    { value: 'customMetric2', label: 'Custom Metric 2' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Интеграции</h1>
        <p className="text-slate-400">Настройка подключений к внешним источникам данных</p>
      </div>

      {/* ClickHouse Connection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-amber-400" />
              ClickHouse
            </CardTitle>
            <Badge variant={
              connectionStatus === 'connected' ? 'success' : 
              connectionStatus === 'testing' ? 'warning' : 'secondary'
            }>
              {connectionStatus === 'connected' ? '✓ Подключено' : 
               connectionStatus === 'testing' ? '⏳ Проверка...' : '✗ Не подключено'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Connection Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 text-sm mb-2 flex items-center gap-1">
                <Server size={14} />
                Host
              </label>
              <input
                type="text"
                value={config.host}
                onChange={(e) => setConfig({ ...config, host: e.target.value })}
                placeholder="clickhouse.example.com"
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-2">Port</label>
              <input
                type="text"
                value={config.port}
                onChange={(e) => setConfig({ ...config, port: e.target.value })}
                placeholder="8123"
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-2">Database</label>
              <input
                type="text"
                value={config.database}
                onChange={(e) => setConfig({ ...config, database: e.target.value })}
                placeholder="default"
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-2 flex items-center gap-1">
                <Key size={14} />
                Username
              </label>
              <input
                type="text"
                value={config.username}
                onChange={(e) => setConfig({ ...config, username: e.target.value })}
                placeholder="default"
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-2">Password</label>
              <input
                type="password"
                value={config.password}
                onChange={(e) => setConfig({ ...config, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="ssl"
                checked={config.ssl}
                onChange={(e) => setConfig({ ...config, ssl: e.target.checked })}
                className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-emerald-500"
              />
              <label htmlFor="ssl" className="text-slate-300">Использовать SSL</label>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={testConnection}
              disabled={connectionStatus === 'testing'}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {connectionStatus === 'testing' ? (
                <RefreshCw size={18} className="animate-spin" />
              ) : (
                <TestTube size={18} />
              )}
              Тест подключения
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors">
              <Save size={18} />
              Сохранить
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              Метрики для Dashboard
              <div className="relative group">
                <HelpCircle className="w-4 h-4 text-slate-500 cursor-help" />
                <div className="absolute z-50 hidden group-hover:block w-72 p-3 text-xs text-white bg-slate-800 rounded-lg shadow-lg left-6 top-0 border border-slate-700">
                  Настройте SQL-запросы для получения данных из ClickHouse. Результаты будут автоматически отображаться на Dashboard.
                </div>
              </div>
            </CardTitle>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded-lg transition-colors"
            >
              <Plus size={16} />
              Добавить метрику
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Add Form */}
          {showAddForm && (
            <div className="mb-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <h3 className="text-white font-medium mb-4">Новая метрика</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">Название</label>
                    <input
                      type="text"
                      value={newMetric.name}
                      onChange={(e) => setNewMetric({ ...newMetric, name: e.target.value })}
                      placeholder="Например: Активные клиенты"
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">Поле в Dashboard</label>
                    <select
                      value={newMetric.targetField}
                      onChange={(e) => setNewMetric({ ...newMetric, targetField: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="">Выберите поле...</option>
                      {targetFields.map(field => (
                        <option key={field.value} value={field.value}>{field.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">SQL Query</label>
                  <textarea
                    value={newMetric.query}
                    onChange={(e) => setNewMetric({ ...newMetric, query: e.target.value })}
                    rows={3}
                    placeholder="SELECT count(*) FROM events WHERE ..."
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={addMetric}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
                  >
                    Добавить
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Metrics List */}
          <div className="space-y-3">
            {metrics.map(metric => (
              <div 
                key={metric.id}
                className={`p-4 rounded-lg border transition-colors ${
                  metric.enabled 
                    ? 'bg-slate-800/50 border-slate-700' 
                    : 'bg-slate-800/20 border-slate-700/50'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className={`font-medium ${metric.enabled ? 'text-white' : 'text-slate-500'}`}>
                        {metric.name}
                      </h4>
                      <Badge variant={metric.enabled ? 'success' : 'secondary'}>
                        → {targetFields.find(f => f.value === metric.targetField)?.label || metric.targetField}
                      </Badge>
                    </div>
                    <code className={`text-xs block p-2 rounded font-mono ${
                      metric.enabled ? 'bg-slate-900 text-slate-400' : 'bg-slate-800/50 text-slate-600'
                    }`}>
                      {metric.query}
                    </code>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleMetric(metric.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        metric.enabled 
                          ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                          : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                      }`}
                    >
                      {metric.enabled ? <Check size={16} /> : <X size={16} />}
                    </button>
                    <button
                      onClick={() => removeMetric(metric.id)}
                      className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-blue-500/30 bg-blue-500/5">
        <CardContent className="pt-6">
          <h3 className="text-blue-400 font-medium mb-2">💡 Как работает интеграция</h3>
          <ul className="text-slate-400 text-sm space-y-2">
            <li>1. Настройте подключение к ClickHouse (host, порт, учётные данные)</li>
            <li>2. Добавьте SQL-запросы для каждой метрики, которую хотите отображать</li>
            <li>3. Выберите поле в Dashboard, куда будет записываться результат</li>
            <li>4. Данные будут автоматически обновляться каждые 5 минут</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

