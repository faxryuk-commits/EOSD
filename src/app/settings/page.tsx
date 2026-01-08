'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Settings, Globe, DollarSign, Calendar, Bell, Shield, Database, Palette, Save } from 'lucide-react'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    currency: 'USD',
    language: 'ru',
    fiscalYearStart: '1',
    notifications: true,
    darkMode: true,
    autoBackup: true,
  })

  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    // In real app, save to API
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Настройки</h1>
          <p className="text-slate-400">Конфигурация системы</p>
        </div>
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
        >
          <Save size={20} />
          {saved ? 'Сохранено!' : 'Сохранить'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings size={20} />
              Общие
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-slate-400 text-sm mb-2">Валюта по умолчанию</label>
              <select
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="RUB">RUB (₽)</option>
                <option value="UZS">UZS (сўм)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 text-sm mb-2">Язык</label>
              <select
                value={settings.language}
                onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="ru">Русский</option>
                <option value="en">English</option>
                <option value="uz">O'zbek</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 text-sm mb-2">Начало финансового года</label>
              <select
                value={settings.fiscalYearStart}
                onChange={(e) => setSettings({ ...settings, fiscalYearStart: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={String(i + 1)}>
                    {new Date(2024, i, 1).toLocaleString('ru', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell size={20} />
              Уведомления
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Email уведомления</p>
                <p className="text-slate-400 text-sm">Получать отчеты на email</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, notifications: !settings.notifications })}
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.notifications ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  settings.notifications ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Авто-бэкап</p>
                <p className="text-slate-400 text-sm">Ежедневное резервное копирование</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, autoBackup: !settings.autoBackup })}
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.autoBackup ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  settings.autoBackup ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Regions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe size={20} />
              Регионы
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { code: 'uz', name: 'Узбекистан', color: '#22c55e', active: true },
                { code: 'kz', name: 'Казахстан', color: '#3b82f6', active: true },
                { code: 'kg', name: 'Кыргызстан', color: '#f59e0b', active: true },
                { code: 'ge', name: 'Грузия', color: '#8b5cf6', active: true },
                { code: 'ae', name: 'ОАЭ', color: '#ef4444', active: true },
                { code: 'sa', name: 'Саудовская Аравия', color: '#06b6d4', active: true },
              ].map((region) => (
                <div key={region.code} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: region.color }}
                    />
                    <span className="text-white">{region.name}</span>
                    <span className="text-slate-500 text-sm uppercase">{region.code}</span>
                  </div>
                  <Badge variant={region.active ? 'success' : 'secondary'}>
                    {region.active ? 'Активен' : 'Неактивен'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database size={20} />
              Система
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Версия</span>
                <span className="text-white">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">База данных</span>
                <Badge variant="success">PostgreSQL</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Фреймворк</span>
                <span className="text-white">Next.js 14</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">ORM</span>
                <span className="text-white">Prisma 5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Хостинг</span>
                <span className="text-white">Vercel</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Danger Zone */}
      <Card className="border-red-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-400">
            <Shield size={20} />
            Опасная зона
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div>
              <p className="text-white font-medium">Сбросить все данные</p>
              <p className="text-slate-400 text-sm">Удалить все данные из системы. Это действие необратимо.</p>
            </div>
            <button className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors">
              Сбросить
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

