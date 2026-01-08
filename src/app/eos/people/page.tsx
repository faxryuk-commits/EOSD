'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Users, Plus, Check, X, Minus, UserCheck, UserX, AlertTriangle } from 'lucide-react'

interface Person {
  id: number
  name: string
  position: string
  department: string
  coreValues: Record<string, '+' | '+/-' | '-'>
  getsIt: boolean
  wantsIt: boolean
  capacityToDoIt: boolean
}

const coreValues = ['Клиент', 'Честность', 'Рост', 'Команда', 'Инновации']

const initialPeople: Person[] = [
  {
    id: 1,
    name: 'Алексей Иванов',
    position: 'CEO',
    department: 'Executive',
    coreValues: { 'Клиент': '+', 'Честность': '+', 'Рост': '+', 'Команда': '+', 'Инновации': '+' },
    getsIt: true,
    wantsIt: true,
    capacityToDoIt: true,
  },
  {
    id: 2,
    name: 'Мария Петрова',
    position: 'COO',
    department: 'Operations',
    coreValues: { 'Клиент': '+', 'Честность': '+', 'Рост': '+', 'Команда': '+', 'Инновации': '+/-' },
    getsIt: true,
    wantsIt: true,
    capacityToDoIt: true,
  },
  {
    id: 3,
    name: 'Дмитрий Козлов',
    position: 'Sales Manager',
    department: 'Sales',
    coreValues: { 'Клиент': '+', 'Честность': '+/-', 'Рост': '+', 'Команда': '+', 'Инновации': '+/-' },
    getsIt: true,
    wantsIt: true,
    capacityToDoIt: false,
  },
  {
    id: 4,
    name: 'Анна Сидорова',
    position: 'Developer',
    department: 'Engineering',
    coreValues: { 'Клиент': '+/-', 'Честность': '+', 'Рост': '+', 'Команда': '+', 'Инновации': '+' },
    getsIt: true,
    wantsIt: false,
    capacityToDoIt: true,
  },
  {
    id: 5,
    name: 'Игорь Новиков',
    position: 'Support Lead',
    department: 'Support',
    coreValues: { 'Клиент': '+', 'Честность': '+', 'Рост': '-', 'Команда': '+', 'Инновации': '-' },
    getsIt: false,
    wantsIt: true,
    capacityToDoIt: true,
  },
]

export default function PeopleAnalyzerPage() {
  const [people] = useState<Person[]>(initialPeople)

  const getValueIcon = (value: '+' | '+/-' | '-') => {
    if (value === '+') return <Check className="w-4 h-4 text-emerald-400" />
    if (value === '+/-') return <Minus className="w-4 h-4 text-amber-400" />
    return <X className="w-4 h-4 text-red-400" />
  }

  const getGWCStatus = (person: Person) => {
    const gwcScore = [person.getsIt, person.wantsIt, person.capacityToDoIt].filter(Boolean).length
    if (gwcScore === 3) return { status: 'A-Player', color: 'emerald' }
    if (gwcScore === 2) return { status: 'B-Player', color: 'amber' }
    return { status: 'C-Player', color: 'red' }
  }

  const getCoreValuesScore = (person: Person) => {
    const values = Object.values(person.coreValues)
    const plusCount = values.filter(v => v === '+').length
    const minusCount = values.filter(v => v === '-').length
    return { plusCount, minusCount, total: values.length }
  }

  const getRightPersonStatus = (person: Person) => {
    const { minusCount } = getCoreValuesScore(person)
    const gwc = getGWCStatus(person)
    
    if (minusCount === 0 && gwc.status === 'A-Player') return 'right'
    if (minusCount >= 2 || gwc.status === 'C-Player') return 'wrong'
    return 'developing'
  }

  const stats = {
    rightPeople: people.filter(p => getRightPersonStatus(p) === 'right').length,
    developing: people.filter(p => getRightPersonStatus(p) === 'developing').length,
    wrongPeople: people.filter(p => getRightPersonStatus(p) === 'wrong').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">People Analyzer</h1>
          <p className="text-slate-400">Оценка команды по Core Values и GWC (EOS)</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors">
          <Plus size={20} />
          Добавить сотрудника
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Right People</p>
                <p className="text-2xl font-bold text-emerald-400">{stats.rightPeople}</p>
                <p className="text-slate-500 text-sm mt-1">A-Players</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">В развитии</p>
                <p className="text-2xl font-bold text-amber-400">{stats.developing}</p>
                <p className="text-slate-500 text-sm mt-1">B-Players</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Требуют решения</p>
                <p className="text-2xl font-bold text-red-400">{stats.wrongPeople}</p>
                <p className="text-slate-500 text-sm mt-1">C-Players</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                <UserX className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* People Analyzer Table */}
      <Card>
        <CardHeader>
          <CardTitle>Анализ команды</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Сотрудник</th>
                  {coreValues.map(value => (
                    <th key={value} className="text-center py-3 px-2 text-slate-400 font-medium text-sm">{value}</th>
                  ))}
                  <th className="text-center py-3 px-2 text-slate-400 font-medium">G</th>
                  <th className="text-center py-3 px-2 text-slate-400 font-medium">W</th>
                  <th className="text-center py-3 px-2 text-slate-400 font-medium">C</th>
                  <th className="text-center py-3 px-4 text-slate-400 font-medium">Статус</th>
                </tr>
              </thead>
              <tbody>
                {people.map((person) => {
                  const gwcStatus = getGWCStatus(person)
                  const rightPerson = getRightPersonStatus(person)
                  
                  return (
                    <tr key={person.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-white font-medium">{person.name}</p>
                          <p className="text-slate-400 text-sm">{person.position}</p>
                        </div>
                      </td>
                      {coreValues.map(value => (
                        <td key={value} className="py-3 px-2 text-center">
                          {getValueIcon(person.coreValues[value])}
                        </td>
                      ))}
                      <td className="py-3 px-2 text-center">
                        {person.getsIt ? (
                          <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-red-400 mx-auto" />
                        )}
                      </td>
                      <td className="py-3 px-2 text-center">
                        {person.wantsIt ? (
                          <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-red-400 mx-auto" />
                        )}
                      </td>
                      <td className="py-3 px-2 text-center">
                        {person.capacityToDoIt ? (
                          <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-red-400 mx-auto" />
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant={
                          rightPerson === 'right' ? 'green' : 
                          rightPerson === 'developing' ? 'yellow' : 'red'
                        }>
                          {gwcStatus.status}
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

      {/* Legend */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Core Values (Ценности)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-300">+ Полностью соответствует</span>
              </div>
              <div className="flex items-center gap-3">
                <Minus className="w-4 h-4 text-amber-400" />
                <span className="text-slate-300">+/- Частично соответствует</span>
              </div>
              <div className="flex items-center gap-3">
                <X className="w-4 h-4 text-red-400" />
                <span className="text-slate-300">- Не соответствует</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>GWC (Gets it, Wants it, Capacity)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <span className="text-blue-400 font-medium w-6">G</span>
                <span className="text-slate-300">Gets It — Понимает свою роль и бизнес</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-purple-400 font-medium w-6">W</span>
                <span className="text-slate-300">Wants It — Хочет выполнять эту работу</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-emerald-400 font-medium w-6">C</span>
                <span className="text-slate-300">Capacity — Имеет способности для работы</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

