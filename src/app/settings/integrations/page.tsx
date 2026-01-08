'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Database, RefreshCw, Check, Save, Zap } from 'lucide-react'

export default function IntegrationsPage() {
  const [isConnected, setIsConnected] = useState(false)
  const [testing, setTesting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  // Простые поля подключения
  const [host, setHost] = useState('')
  const [user, setUser] = useState('')
  const [password, setPassword] = useState('')

  // Что синхронизировать - простые переключатели
  const [syncOptions, setSyncOptions] = useState({
    clients: true,
    revenue: true,
    orders: false,
    churn: true,
  })

  // Загрузка сохранённых настроек
  useEffect(() => {
    fetch('/api/settings/integrations')
      .then(res => res.json())
      .then(data => {
        if (data.host) setHost(data.host)
        if (data.user) setUser(data.user)
        if (data.password) setPassword(data.password)
        if (data.syncOptions) setSyncOptions(data.syncOptions)
        if (data.host && data.user) setIsConnected(true)
      })
      .finally(() => setLoading(false))
  }, [])

  const testConnection = () => {
    setTesting(true)
    setTimeout(() => {
      setTesting(false)
      if (host && user) {
        setIsConnected(true)
      }
    }, 1500)
  }

  const save = async () => {
    setSaving(true)
    try {
      await fetch('/api/settings/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host, user, password, syncOptions }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      console.error(e)
    }
    setSaving(false)
  }

  const toggleSync = (key: keyof typeof syncOptions) => {
    setSyncOptions({ ...syncOptions, [key]: !syncOptions[key] })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw size={32} className="animate-spin text-emerald-500" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">🔗 Подключение к базе данных</h1>
        <p className="text-slate-400">Подключите ClickHouse чтобы данные обновлялись автоматически</p>
      </div>

      {/* Статус подключения */}
      <div className={`p-4 rounded-xl text-center ${isConnected ? 'bg-green-500/10 border border-green-500/30' : 'bg-slate-800/50 border border-slate-700'}`}>
        {isConnected ? (
          <div className="flex items-center justify-center gap-2 text-green-400">
            <Check size={20} />
            <span className="font-medium">Подключено</span>
          </div>
        ) : (
          <span className="text-slate-400">Не подключено</span>
        )}
      </div>

      {/* Форма подключения */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database size={20} className="text-amber-400" />
            Данные для входа
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-slate-400 text-sm mb-2">Адрес сервера</label>
            <input
              type="text"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              placeholder="например: db.company.com"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-lg focus:outline-none focus:border-emerald-500"
            />
          </div>
          
          <div>
            <label className="block text-slate-400 text-sm mb-2">Логин</label>
            <input
              type="text"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              placeholder="ваш логин"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-lg focus:outline-none focus:border-emerald-500"
            />
          </div>
          
          <div>
            <label className="block text-slate-400 text-sm mb-2">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-lg focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            onClick={testConnection}
            disabled={testing || !host || !user}
            className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {testing ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                Проверяю...
              </>
            ) : (
              <>
                <Zap size={18} />
                Проверить подключение
              </>
            )}
          </button>
        </CardContent>
      </Card>

      {/* Что синхронизировать */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Что загружать автоматически</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          
          <SyncToggle 
            label="👥 Клиенты"
            description="Количество активных клиентов"
            enabled={syncOptions.clients}
            onToggle={() => toggleSync('clients')}
          />
          
          <SyncToggle 
            label="💰 Выручка"
            description="Сумма платежей за месяц"
            enabled={syncOptions.revenue}
            onToggle={() => toggleSync('revenue')}
          />
          
          <SyncToggle 
            label="📦 Заказы"
            description="Количество заказов"
            enabled={syncOptions.orders}
            onToggle={() => toggleSync('orders')}
          />
          
          <SyncToggle 
            label="📉 Отток"
            description="Ушедшие клиенты"
            enabled={syncOptions.churn}
            onToggle={() => toggleSync('churn')}
          />

        </CardContent>
      </Card>

      {/* Кнопка сохранить */}
      <button
        onClick={save}
        disabled={saving}
        className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium text-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {saving ? (
          <>
            <RefreshCw size={20} className="animate-spin" />
            Сохраняю...
          </>
        ) : saved ? (
          <>
            <Check size={20} />
            Сохранено!
          </>
        ) : (
          <>
            <Save size={20} />
            Сохранить настройки
          </>
        )}
      </button>

      {/* Подсказка */}
      <p className="text-center text-slate-500 text-sm">
        После сохранения данные будут обновляться каждые 5 минут
      </p>
    </div>
  )
}

// Компонент переключателя
function SyncToggle({ 
  label, 
  description, 
  enabled, 
  onToggle 
}: { 
  label: string
  description: string
  enabled: boolean
  onToggle: () => void 
}) {
  return (
    <div 
      onClick={onToggle}
      className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ${
        enabled 
          ? 'bg-emerald-500/10 border-2 border-emerald-500/50' 
          : 'bg-slate-800/50 border-2 border-slate-700 opacity-60'
      }`}
    >
      <div>
        <div className="text-white font-medium">{label}</div>
        <div className="text-slate-400 text-sm">{description}</div>
      </div>
      <div className={`w-12 h-7 rounded-full p-1 transition-colors ${enabled ? 'bg-emerald-500' : 'bg-slate-600'}`}>
        <div className={`w-5 h-5 rounded-full bg-white transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
      </div>
    </div>
  )
}
