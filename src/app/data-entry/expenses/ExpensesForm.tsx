'use client'

import { useState } from 'react'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Save, Check, AlertCircle } from 'lucide-react'

interface ExpenseData {
  regionId: number
  regionName: string
  regionCode: string
  salary: number
  marketing: number
  office: number
  software: number
  otherExpenses: number
  total: number
}

interface ExpensesFormProps {
  periodId: number
  expensesData: ExpenseData[]
}

type RowStatus = 'saved' | 'modified' | 'saving' | 'error'

export function ExpensesForm({ periodId, expensesData: initialData }: ExpensesFormProps) {
  const [data, setData] = useState(initialData)
  const [statuses, setStatuses] = useState<Record<number, RowStatus>>(
    Object.fromEntries(initialData.map(d => [d.regionId, 'saved']))
  )

  const handleChange = (regionId: number, field: string, value: string) => {
    const numValue = parseFloat(value) || 0
    
    setData(prev => prev.map(row => {
      if (row.regionId !== regionId) return row
      
      const updated = { ...row, [field]: numValue }
      updated.total = updated.salary + updated.marketing + updated.office + 
                      updated.software + updated.otherExpenses
      return updated
    }))
    
    setStatuses(prev => ({ ...prev, [regionId]: 'modified' }))
  }

  const handleSave = async (regionId: number) => {
    if (regionId === 0) return // Skip HQ for now
    
    const row = data.find(d => d.regionId === regionId)
    if (!row) return

    setStatuses(prev => ({ ...prev, [regionId]: 'saving' }))

    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          periodId,
          regionId,
          salary: row.salary,
          marketing: row.marketing,
          office: row.office,
          software: row.software,
          otherExpenses: row.otherExpenses,
        }),
      })

      if (response.ok) {
        setStatuses(prev => ({ ...prev, [regionId]: 'saved' }))
      } else {
        setStatuses(prev => ({ ...prev, [regionId]: 'error' }))
      }
    } catch (error) {
      setStatuses(prev => ({ ...prev, [regionId]: 'error' }))
    }
  }

  const handleSaveAll = async () => {
    const modifiedRows = data.filter(d => statuses[d.regionId] === 'modified' && d.regionId !== 0)
    for (const row of modifiedRows) {
      await handleSave(row.regionId)
    }
  }

  const getFlag = (code: string): string => {
    const flags: Record<string, string> = {
      uz: '🇺🇿', kz: '🇰🇿', kg: '🇰🇬', ge: '🇬🇪', ae: '🇦🇪', sa: '🇸🇦', hq: '🏢',
    }
    return flags[code] || '🏳️'
  }

  const getStatusBadge = (status: RowStatus) => {
    switch (status) {
      case 'saved':
        return <Badge variant="green"><Check size={12} className="mr-1" /> Saved</Badge>
      case 'modified':
        return <Badge variant="yellow"><AlertCircle size={12} className="mr-1" /> Modified</Badge>
      case 'saving':
        return <Badge variant="blue">Saving...</Badge>
      case 'error':
        return <Badge variant="red">Error</Badge>
    }
  }

  const totals = {
    salary: data.reduce((sum, d) => sum + d.salary, 0),
    marketing: data.reduce((sum, d) => sum + d.marketing, 0),
    office: data.reduce((sum, d) => sum + d.office, 0),
    software: data.reduce((sum, d) => sum + d.software, 0),
    other: data.reduce((sum, d) => sum + d.otherExpenses, 0),
    total: data.reduce((sum, d) => sum + d.total, 0),
  }

  return (
    <div>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Регион</th>
              <th>ФОТ ($)</th>
              <th>Маркетинг</th>
              <th>Офис</th>
              <th>Софт</th>
              <th>Прочее</th>
              <th>ИТОГО</th>
              <th>Статус</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.regionId}>
                <td>
                  <span className="flex items-center gap-2">
                    <span className="text-lg">{getFlag(row.regionCode)}</span>
                    <span className="font-medium text-white">{row.regionName}</span>
                  </span>
                </td>
                <td>
                  <input
                    type="number"
                    value={row.salary || ''}
                    onChange={(e) => handleChange(row.regionId, 'salary', e.target.value)}
                    className="input w-28"
                    placeholder="0"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={row.marketing || ''}
                    onChange={(e) => handleChange(row.regionId, 'marketing', e.target.value)}
                    className="input w-24"
                    placeholder="0"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={row.office || ''}
                    onChange={(e) => handleChange(row.regionId, 'office', e.target.value)}
                    className="input w-24"
                    placeholder="0"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={row.software || ''}
                    onChange={(e) => handleChange(row.regionId, 'software', e.target.value)}
                    className="input w-20"
                    placeholder="0"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={row.otherExpenses || ''}
                    onChange={(e) => handleChange(row.regionId, 'otherExpenses', e.target.value)}
                    className="input w-20"
                    placeholder="0"
                  />
                </td>
                <td className="text-white font-medium">
                  {formatCurrency(row.total)}
                </td>
                <td>
                  {getStatusBadge(statuses[row.regionId])}
                </td>
                <td>
                  {statuses[row.regionId] === 'modified' && row.regionId !== 0 && (
                    <button
                      onClick={() => handleSave(row.regionId)}
                      className="btn-secondary p-2"
                    >
                      <Save size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {/* Totals Row */}
            <tr className="bg-surface-800/50 font-semibold">
              <td className="text-white">ИТОГО</td>
              <td className="text-white">{formatCurrency(totals.salary)}</td>
              <td className="text-white">{formatCurrency(totals.marketing)}</td>
              <td className="text-white">{formatCurrency(totals.office)}</td>
              <td className="text-white">{formatCurrency(totals.software)}</td>
              <td className="text-white">{formatCurrency(totals.other)}</td>
              <td className="text-white">{formatCurrency(totals.total)}</td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button className="btn-secondary">
          ↩️ Отменить изменения
        </button>
        <button 
          onClick={handleSaveAll}
          className="btn-primary flex items-center gap-2"
        >
          <Save size={18} />
          Сохранить все
        </button>
      </div>
    </div>
  )
}

