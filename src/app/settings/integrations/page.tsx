'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Database, Server, Key, RefreshCw, Check, X, Plus, Trash2, Save, TestTube, ArrowRight, Table, Columns } from 'lucide-react'

interface MetricMapping {
  id: string
  sourceTable: string
  sourceField: string
  aggregation: 'sum' | 'count' | 'avg' | 'max' | 'min' | 'last'
  targetField: string
  enabled: boolean
}

// Предустановленные таблицы и поля из типичной ClickHouse структуры
const availableTables = [
  {
    name: 'orders',
    label: '📦 Заказы',
    fields: [
      { name: 'id', label: 'ID заказа', type: 'count' },
      { name: 'amount', label: 'Сумма заказа', type: 'sum' },
      { name: 'user_id', label: 'ID клиента', type: 'count_distinct' },
      { name: 'status', label: 'Статус', type: 'count' },
      { name: 'created_at', label: 'Дата создания', type: 'date' },
    ]
  },
  {
    name: 'users',
    label: '👥 Пользователи',
    fields: [
      { name: 'id', label: 'ID пользователя', type: 'count' },
      { name: 'email', label: 'Email', type: 'count' },
      { name: 'created_at', label: 'Дата регистрации', type: 'date' },
      { name: 'last_active', label: 'Последняя активность', type: 'date' },
      { name: 'subscription_mrr', label: 'MRR подписки', type: 'sum' },
    ]
  },
  {
    name: 'payments',
    label: '💳 Платежи',
    fields: [
      { name: 'id', label: 'ID платежа', type: 'count' },
      { name: 'amount', label: 'Сумма', type: 'sum' },
      { name: 'user_id', label: 'ID клиента', type: 'count_distinct' },
      { name: 'status', label: 'Статус', type: 'count' },
      { name: 'created_at', label: 'Дата', type: 'date' },
    ]
  },
  {
    name: 'events',
    label: '📊 События',
    fields: [
      { name: 'user_id', label: 'Уникальные пользователи', type: 'count_distinct' },
      { name: 'event_name', label: 'Название события', type: 'count' },
      { name: 'timestamp', label: 'Время', type: 'date' },
      { name: 'properties', label: 'Свойства', type: 'json' },
    ]
  },
  {
    name: 'subscriptions',
    label: '📋 Подписки',
    fields: [
      { name: 'id', label: 'ID подписки', type: 'count' },
      { name: 'user_id', label: 'ID клиента', type: 'count_distinct' },
      { name: 'mrr', label: 'MRR', type: 'sum' },
      { name: 'status', label: 'Статус (active/churned)', type: 'count' },
      { name: 'started_at', label: 'Дата начала', type: 'date' },
      { name: 'ended_at', label: 'Дата окончания', type: 'date' },
    ]
  },
]

const targetFields = [
  { value: 'revenue', label: '💰 Выручка (Revenue)', group: 'Финансы' },
  { value: 'clientsCount', label: '👥 Всего клиентов', group: 'Клиенты' },
  { value: 'newClients', label: '🆕 Новые клиенты', group: 'Клиенты' },
  { value: 'churnedClients', label: '📉 Отток клиентов', group: 'Клиенты' },
  { value: 'marketing', label: '📢 Расходы на маркетинг', group: 'Расходы' },
  { value: 'salary', label: '👔 Зарплаты', group: 'Расходы' },
  { value: 'office', label: '🏢 Офис', group: 'Расходы' },
  { value: 'software', label: '💻 Софт', group: 'Расходы' },
  { value: 'otherExpenses', label: '📋 Прочие расходы', group: 'Расходы' },
]

const aggregations = [
  { value: 'sum', label: 'Сумма (SUM)', icon: '➕' },
  { value: 'count', label: 'Количество (COUNT)', icon: '🔢' },
  { value: 'count_distinct', label: 'Уникальные (COUNT DISTINCT)', icon: '🎯' },
  { value: 'avg', label: 'Среднее (AVG)', icon: '📊' },
  { value: 'max', label: 'Максимум (MAX)', icon: '⬆️' },
  { value: 'min', label: 'Минимум (MIN)', icon: '⬇️' },
]

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
  
  const [mappings, setMappings] = useState<MetricMapping[]>([
    {
      id: '1',
      sourceTable: 'subscriptions',
      sourceField: 'mrr',
      aggregation: 'sum',
      targetField: 'revenue',
      enabled: true,
    },
    {
      id: '2',
      sourceTable: 'users',
      sourceField: 'id',
      aggregation: 'count',
      targetField: 'clientsCount',
      enabled: true,
    },
  ])

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newMapping, setNewMapping] = useState<Partial<MetricMapping>>({
    sourceTable: '',
    sourceField: '',
    aggregation: 'sum',
    targetField: '',
  })

  const testConnection = async () => {
    setConnectionStatus('testing')
    setTimeout(() => {
      if (config.host && config.username) {
        setConnectionStatus('connected')
      } else {
        setConnectionStatus('disconnected')
      }
    }, 1500)
  }

  const saveConfig = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/settings/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, mappings }),
      })
      if (response.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (error) {
      console.error('Failed to save:', error)
    } finally {
      setSaving(false)
    }
  }

  const addMapping = () => {
    if (newMapping.sourceTable && newMapping.sourceField && newMapping.targetField) {
      setMappings([
        ...mappings,
        {
          id: Date.now().toString(),
          sourceTable: newMapping.sourceTable,
          sourceField: newMapping.sourceField,
          aggregation: newMapping.aggregation as any || 'sum',
          targetField: newMapping.targetField,
          enabled: true,
        },
      ])
      setNewMapping({ sourceTable: '', sourceField: '', aggregation: 'sum', targetField: '' })
      setShowAddForm(false)
    }
  }

  const removeMapping = (id: string) => {
    setMappings(mappings.filter(m => m.id !== id))
  }

  const toggleMapping = (id: string) => {
    setMappings(mappings.map(m => 
      m.id === id ? { ...m, enabled: !m.enabled } : m
    ))
  }

  const getTableLabel = (tableName: string) => 
    availableTables.find(t => t.name === tableName)?.label || tableName

  const getFieldLabel = (tableName: string, fieldName: string) => 
    availableTables.find(t => t.name === tableName)?.fields.find(f => f.name === fieldName)?.label || fieldName

  const getTargetLabel = (targetField: string) =>
    targetFields.find(f => f.value === targetField)?.label || targetField

  const getAggregationLabel = (agg: string) =>
    aggregations.find(a => a.value === agg)?.label || agg

  const selectedTableFields = availableTables.find(t => t.name === newMapping.sourceTable)?.fields || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">🔗 Интеграции</h1>
        <p className="text-slate-400">Подключите ClickHouse и выберите какие данные куда загружать</p>
      </div>

      {/* ClickHouse Connection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-amber-400" />
              Подключение к ClickHouse
            </CardTitle>
            <Badge variant={
              connectionStatus === 'connected' ? 'green' : 
              connectionStatus === 'testing' ? 'yellow' : 'gray'
            }>
              {connectionStatus === 'connected' ? '✓ Подключено' : 
               connectionStatus === 'testing' ? '⏳ Проверка...' : '✗ Не подключено'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.ssl}
                  onChange={(e) => setConfig({ ...config, ssl: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-emerald-500"
                />
                <span className="text-slate-300">SSL</span>
              </label>
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
            <button 
              onClick={saveConfig}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? (
                <RefreshCw size={18} className="animate-spin" />
              ) : saved ? (
                <Check size={18} />
              ) : (
                <Save size={18} />
              )}
              {saving ? 'Сохранение...' : saved ? 'Сохранено!' : 'Сохранить'}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Data Mappings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Columns className="w-5 h-5 text-blue-400" />
              Маппинг данных
              <span className="text-sm font-normal text-slate-400">
                (откуда → куда)
              </span>
            </CardTitle>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded-lg transition-colors"
            >
              <Plus size={16} />
              Добавить
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Add Form */}
          {showAddForm && (
            <div className="p-4 bg-slate-800/50 rounded-lg border border-emerald-500/30">
              <h3 className="text-white font-medium mb-4">➕ Новый маппинг</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end">
                {/* Source Table */}
                <div>
                  <label className="block text-slate-400 text-sm mb-2 flex items-center gap-1">
                    <Table size={14} />
                    Таблица в ClickHouse
                  </label>
                  <select
                    value={newMapping.sourceTable}
                    onChange={(e) => setNewMapping({ ...newMapping, sourceTable: e.target.value, sourceField: '' })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Выберите таблицу...</option>
                    {availableTables.map(table => (
                      <option key={table.name} value={table.name}>{table.label}</option>
                    ))}
                  </select>
                </div>

                {/* Source Field */}
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Поле</label>
                  <select
                    value={newMapping.sourceField}
                    onChange={(e) => setNewMapping({ ...newMapping, sourceField: e.target.value })}
                    disabled={!newMapping.sourceTable}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                  >
                    <option value="">Выберите поле...</option>
                    {selectedTableFields.map(field => (
                      <option key={field.name} value={field.name}>{field.label}</option>
                    ))}
                  </select>
                </div>

                {/* Aggregation */}
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Агрегация</label>
                  <select
                    value={newMapping.aggregation}
                    onChange={(e) => setNewMapping({ ...newMapping, aggregation: e.target.value as any })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    {aggregations.map(agg => (
                      <option key={agg.value} value={agg.value}>{agg.icon} {agg.label}</option>
                    ))}
                  </select>
                </div>

                {/* Target Field */}
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Поле в Dashboard</label>
                  <select
                    value={newMapping.targetField}
                    onChange={(e) => setNewMapping({ ...newMapping, targetField: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Выберите поле...</option>
                    {targetFields.map(field => (
                      <option key={field.value} value={field.value}>{field.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={addMapping}
                  disabled={!newMapping.sourceTable || !newMapping.sourceField || !newMapping.targetField}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors disabled:opacity-50"
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
          )}

          {/* Mappings List */}
          <div className="space-y-2">
            {mappings.map(mapping => (
              <div 
                key={mapping.id}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                  mapping.enabled 
                    ? 'bg-slate-800/50 border-slate-700' 
                    : 'bg-slate-800/20 border-slate-700/50 opacity-60'
                }`}
              >
                {/* Source */}
                <div className="flex items-center gap-2 min-w-[200px]">
                  <Badge variant="blue">{getTableLabel(mapping.sourceTable)}</Badge>
                  <span className="text-slate-400">→</span>
                  <span className="text-white">{getFieldLabel(mapping.sourceTable, mapping.sourceField)}</span>
                </div>

                {/* Aggregation */}
                <Badge variant="purple">
                  {aggregations.find(a => a.value === mapping.aggregation)?.icon} {mapping.aggregation.toUpperCase()}
                </Badge>

                {/* Arrow */}
                <ArrowRight className="text-emerald-500" size={20} />

                {/* Target */}
                <div className="flex-1">
                  <Badge variant="green">{getTargetLabel(mapping.targetField)}</Badge>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleMapping(mapping.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      mapping.enabled 
                        ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                    }`}
                    title={mapping.enabled ? 'Отключить' : 'Включить'}
                  >
                    {mapping.enabled ? <Check size={16} /> : <X size={16} />}
                  </button>
                  <button
                    onClick={() => removeMapping(mapping.id)}
                    className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                    title="Удалить"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}

            {mappings.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <Columns size={40} className="mx-auto mb-3 opacity-50" />
                <p>Нет настроенных маппингов</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="mt-2 text-emerald-400 hover:underline"
                >
                  + Добавить первый маппинг
                </button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="border-blue-500/30 bg-blue-500/5">
        <CardContent className="pt-6">
          <h3 className="text-blue-400 font-medium mb-3">💡 Как это работает</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-400">
            <div className="flex items-start gap-3">
              <span className="text-2xl">1️⃣</span>
              <div>
                <p className="text-white font-medium">Подключение</p>
                <p>Укажите данные для подключения к ClickHouse</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">2️⃣</span>
              <div>
                <p className="text-white font-medium">Маппинг</p>
                <p>Выберите таблицу, поле и куда загружать</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">3️⃣</span>
              <div>
                <p className="text-white font-medium">Синхронизация</p>
                <p>Данные обновляются автоматически каждые 5 мин</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
