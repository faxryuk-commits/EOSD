export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/db'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency } from '@/lib/utils'
import { Users, Plus, Briefcase, DollarSign, MapPin, UserCheck, UserX } from 'lucide-react'

async function getStaffData() {
  const staff = await prisma.staff.findMany({
    include: { region: true },
    orderBy: [{ isActive: true }, { department: 'asc' }, { name: 'asc' }],
  })

  const activeStaff = staff.filter(s => s.isActive)
  const totalSalary = activeStaff.reduce((sum, s) => sum + (s.salary || 0), 0)
  
  // Group by department
  const byDepartment = activeStaff.reduce((acc, s) => {
    const dept = s.department || 'Другое'
    if (!acc[dept]) acc[dept] = { count: 0, salary: 0, staff: [] }
    acc[dept].count++
    acc[dept].salary += s.salary || 0
    acc[dept].staff.push(s)
    return acc
  }, {} as Record<string, { count: number, salary: number, staff: typeof staff }>)

  // Group by region
  const byRegion = activeStaff.reduce((acc, s) => {
    const region = s.region?.name || 'Не указан'
    if (!acc[region]) acc[region] = { count: 0, salary: 0 }
    acc[region].count++
    acc[region].salary += s.salary || 0
    return acc
  }, {} as Record<string, { count: number, salary: number }>)

  return {
    staff,
    activeCount: activeStaff.length,
    inactiveCount: staff.length - activeStaff.length,
    totalSalary,
    avgSalary: activeStaff.length > 0 ? totalSalary / activeStaff.length : 0,
    byDepartment,
    byRegion,
  }
}

export default async function StaffPage() {
  const data = await getStaffData()

  const departments = Object.entries(data.byDepartment).sort((a, b) => b[1].count - a[1].count)
  const regions = Object.entries(data.byRegion).sort((a, b) => b[1].count - a[1].count)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Персонал</h1>
          <p className="text-slate-400">Управление сотрудниками</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors">
          <Plus size={20} />
          Добавить сотрудника
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Всего сотрудников</p>
                <p className="text-2xl font-bold text-white mt-1">{data.activeCount}</p>
                {data.inactiveCount > 0 && (
                  <p className="text-slate-500 text-sm mt-1">+{data.inactiveCount} неактивных</p>
                )}
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">ФОТ (месяц)</p>
                <p className="text-2xl font-bold text-white mt-1">{formatCurrency(data.totalSalary)}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Средняя зарплата</p>
                <p className="text-2xl font-bold text-white mt-1">{formatCurrency(data.avgSalary)}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Департаментов</p>
                <p className="text-2xl font-bold text-white mt-1">{departments.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Staff by Department & Region */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>По департаментам</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {departments.map(([dept, info]) => (
                <div key={dept} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{dept}</p>
                    <p className="text-slate-400 text-sm">{info.count} чел.</p>
                  </div>
                  <p className="text-emerald-400 font-medium">{formatCurrency(info.salary)}</p>
                </div>
              ))}
              {departments.length === 0 && (
                <p className="text-slate-500 text-center py-4">Нет данных о сотрудниках</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>По регионам</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {regions.map(([region, info]) => (
                <div key={region} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{region}</p>
                    <p className="text-slate-400 text-sm">{info.count} чел.</p>
                  </div>
                  <p className="text-emerald-400 font-medium">{formatCurrency(info.salary)}</p>
                </div>
              ))}
              {regions.length === 0 && (
                <p className="text-slate-500 text-center py-4">Нет данных о сотрудниках</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Staff Table */}
      <Card>
        <CardHeader>
          <CardTitle>Список сотрудников</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Имя</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Должность</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Департамент</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Регион</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">Зарплата</th>
                  <th className="text-center py-3 px-4 text-slate-400 font-medium">Статус</th>
                </tr>
              </thead>
              <tbody>
                {data.staff.map((person) => (
                  <tr key={person.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {person.name.charAt(0)}
                          </span>
                        </div>
                        <span className="text-white font-medium">{person.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{person.position || '-'}</td>
                    <td className="py-3 px-4 text-slate-300">{person.department || '-'}</td>
                    <td className="py-3 px-4 text-slate-300">{person.region?.name || '-'}</td>
                    <td className="py-3 px-4 text-right text-emerald-400">
                      {formatCurrency(person.salary || 0)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {person.isActive ? (
                        <Badge variant="green">
                          <UserCheck size={14} className="mr-1" />
                          Активен
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <UserX size={14} className="mr-1" />
                          Неактивен
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
                {data.staff.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      Нет данных о сотрудниках. Импортируйте данные или добавьте вручную.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

