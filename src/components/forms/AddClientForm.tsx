'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'

export function AddClientButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    regionId: 1,
    mrr: 0,
    healthStatus: 'healthy',
    churnRisk: 'low',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        setIsOpen(false)
        setForm({ name: '', regionId: 1, mrr: 0, healthStatus: 'healthy', churnRisk: 'low' })
        window.location.reload()
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
      >
        <Plus size={18} />
        Добавить клиента
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Новый клиент</h2>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-400 text-sm mb-2">Название компании *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  placeholder="ООО Ресторан"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Регион</label>
                  <select
                    value={form.regionId}
                    onChange={(e) => setForm({ ...form, regionId: Number(e.target.value) })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value={1}>Узбекистан</option>
                    <option value={2}>Казахстан</option>
                    <option value={3}>Кыргызстан</option>
                    <option value={4}>Грузия</option>
                    <option value={5}>ОАЭ</option>
                    <option value={6}>Саудовская Аравия</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">MRR ($)</label>
                  <input
                    type="number"
                    value={form.mrr}
                    onChange={(e) => setForm({ ...form, mrr: Number(e.target.value) })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Статус здоровья</label>
                  <select
                    value={form.healthStatus}
                    onChange={(e) => setForm({ ...form, healthStatus: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="healthy">Здоровый</option>
                    <option value="at_risk">Под риском</option>
                    <option value="churning">Уходит</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Риск оттока</label>
                  <select
                    value={form.churnRisk}
                    onChange={(e) => setForm({ ...form, churnRisk: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="low">Низкий</option>
                    <option value="medium">Средний</option>
                    <option value="high">Высокий</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={loading || !form.name}
                  className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Сохранение...' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

