'use client'

import { useState } from 'react'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Save, Check, AlertCircle } from 'lucide-react'

interface SalesData {
  regionId: number
  regionName: string
  regionCode: string
  revenue: number
  clientsCount: number
  newClients: number
  churnedClients: number
  arpu: number
}

interface SalesFormProps {
  periodId: number
  salesData: SalesData[]
}

type RowStatus = 'saved' | 'modified' | 'saving' | 'error'

export function SalesForm({ periodId, salesData: initialData }: SalesFormProps) {
  const [data, setData] = useState(initialData)
  const [statuses, setStatuses] = useState<Record<number, RowStatus>>(
    Object.fromEntries(initialData.map(d => [d.regionId, 'saved']))
  )

  const handleChange = (regionId: number, field: string, value: string) => {
    const numValue = parseFloat(value) || 0
    
    setData(prev => prev.map(row => {
      if (row.regionId !== regionId) return row
      
      const updated = { ...row, [field]: numValue }
      // Recalculate ARPU
      if (updated.clientsCount > 0) {
        updated.arpu = updated.revenue / updated.clientsCount
      }
      return updated
    }))
    
    setStatuses(prev => ({ ...prev, [regionId]: 'modified' }))
  }

  const handleSave = async (regionId: number) => {
    const row = data.find(d => d.regionId === regionId)
    if (!row) return

    setStatuses(prev => ({ ...prev, [regionId]: 'saving' }))

    try {
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          periodId,
          regionId,
          revenue: row.revenue,
          clientsCount: row.clientsCount,
          newClients: row.newClients,
          churnedClients: row.churnedClients,
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
    const modifiedRows = data.filter(d => statuses[d.regionId] === 'modified')
    for (const row of modifiedRows) {
      await handleSave(row.regionId)
    }
  }

  const getFlag = (code: string): string => {
    const flags: Record<string, string> = {
      uz: '🇺🇿', kz: '🇰🇿', kg: '🇰🇬', ge: '🇬🇪', ae: '🇦🇪', sa: '🇸🇦',
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

  // Calculate totals
  const totals = {
    revenue: data.reduce((sum, d) => sum + d.revenue, 0),
    clients: data.reduce((sum, d) => sum + d.clientsCount, 0),
    newClients: data.reduce((sum, d) => sum + d.newClients, 0),
    churned: data.reduce((sum, d) => sum + d.churnedClients, 0),
  }
  const totalArpu = totals.clients > 0 ? totals.revenue / totals.clients : 0

  return (
    <div>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Регион</th>
              <th>Выручка ($)</th>
              <th>Клиенты</th>
              <th>Новые</th>
              <th>Отток</th>
              <th>ARPU</th>
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
                    value={row.revenue || ''}
                    onChange={(e) => handleChange(row.regionId, 'revenue', e.target.value)}
                    className="input w-32"
                    placeholder="0"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={row.clientsCount || ''}
                    onChange={(e) => handleChange(row.regionId, 'clientsCount', e.target.value)}
                    className="input w-24"
                    placeholder="0"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={row.newClients || ''}
                    onChange={(e) => handleChange(row.regionId, 'newClients', e.target.value)}
                    className="input w-20"
                    placeholder="0"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={row.churnedClients || ''}
                    onChange={(e) => handleChange(row.regionId, 'churnedClients', e.target.value)}
                    className="input w-20"
                    placeholder="0"
                  />
                </td>
                <td className="text-surface-300">
                  {formatCurrency(row.arpu)}
                </td>
                <td>
                  {getStatusBadge(statuses[row.regionId])}
                </td>
                <td>
                  {statuses[row.regionId] === 'modified' && (
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
              <td className="text-white">{formatCurrency(totals.revenue)}</td>
              <td className="text-white">{totals.clients}</td>
              <td className="text-green-500">+{totals.newClients}</td>
              <td className="text-red-500">-{totals.churned}</td>
              <td className="text-white">{formatCurrency(totalArpu)}</td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Actions */}
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

