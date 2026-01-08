import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    // Check if data already exists
    const existingPeriods = await prisma.period.count()
    if (existingPeriods > 0) {
      return NextResponse.json({ 
        message: 'Database already has data', 
        periods: existingPeriods 
      })
    }

    console.log('🌱 Seeding database...')

    // Regions
    const regions = await Promise.all([
      prisma.region.create({
        data: { name: 'Узбекистан', code: 'uz', currency: 'UZS', color: '#3B82F6' }
      }),
      prisma.region.create({
        data: { name: 'Казахстан', code: 'kz', currency: 'KZT', color: '#10B981' }
      }),
      prisma.region.create({
        data: { name: 'Кыргызстан', code: 'kg', currency: 'KGS', color: '#F59E0B' }
      }),
      prisma.region.create({
        data: { name: 'Грузия', code: 'ge', currency: 'GEL', color: '#EF4444' }
      }),
      prisma.region.create({
        data: { name: 'ОАЭ', code: 'ae', currency: 'AED', color: '#8B5CF6' }
      }),
      prisma.region.create({
        data: { name: 'Саудовская Аравия', code: 'sa', currency: 'SAR', color: '#EC4899' }
      }),
    ])

    // Periods for 2025-2026
    const periodsData = [
      { year: 2025, month: 8, name: 'Август 2025' },
      { year: 2025, month: 9, name: 'Сентябрь 2025' },
      { year: 2025, month: 10, name: 'Октябрь 2025' },
      { year: 2025, month: 11, name: 'Ноябрь 2025' },
      { year: 2025, month: 12, name: 'Декабрь 2025' },
      { year: 2026, month: 1, name: 'Январь 2026' },
    ]

    const periods: { id: number; year: number; month: number }[] = []
    for (const p of periodsData) {
      const period = await prisma.period.create({
        data: {
          name: p.name,
          year: p.year,
          month: p.month,
          startDate: new Date(p.year, p.month - 1, 1),
          endDate: new Date(p.year, p.month, 0),
        }
      })
      periods.push(period)
    }

    // Monthly Data - Real data from Excel
    const uzData = [
      { revenue: 28098, clients: 446, newClients: 10, churn: 5, salary: 8000, marketing: 4000, office: 500, software: 200, other: 300 },
      { revenue: 29358, clients: 466, newClients: 10, churn: 5, salary: 8000, marketing: 4000, office: 500, software: 200, other: 300 },
      { revenue: 30618, clients: 486, newClients: 11, churn: 5, salary: 8000, marketing: 4000, office: 500, software: 200, other: 300 },
      { revenue: 32004, clients: 508, newClients: 12, churn: 6, salary: 8000, marketing: 4000, office: 500, software: 200, other: 300 },
      { revenue: 33516, clients: 532, newClients: 15, churn: 6, salary: 8500, marketing: 4500, office: 500, software: 200, other: 300 },
      { revenue: 35154, clients: 558, newClients: 18, churn: 7, salary: 9000, marketing: 5000, office: 600, software: 250, other: 350 },
    ]

    const kzData = [
      { revenue: 18500, clients: 280, newClients: 8, churn: 3, salary: 5000, marketing: 2500, office: 300, software: 150, other: 200 },
      { revenue: 19200, clients: 290, newClients: 8, churn: 3, salary: 5000, marketing: 2500, office: 300, software: 150, other: 200 },
      { revenue: 19900, clients: 300, newClients: 9, churn: 4, salary: 5000, marketing: 2500, office: 300, software: 150, other: 200 },
      { revenue: 20800, clients: 315, newClients: 10, churn: 4, salary: 5200, marketing: 2700, office: 300, software: 150, other: 200 },
      { revenue: 21700, clients: 330, newClients: 12, churn: 5, salary: 5500, marketing: 3000, office: 350, software: 180, other: 220 },
      { revenue: 22800, clients: 348, newClients: 14, churn: 5, salary: 5800, marketing: 3200, office: 350, software: 180, other: 220 },
    ]

    const aeData = [
      { revenue: 12000, clients: 85, newClients: 5, churn: 2, salary: 8000, marketing: 3000, office: 800, software: 300, other: 400 },
      { revenue: 12800, clients: 90, newClients: 5, churn: 2, salary: 8000, marketing: 3000, office: 800, software: 300, other: 400 },
      { revenue: 13600, clients: 95, newClients: 6, churn: 2, salary: 8200, marketing: 3200, office: 800, software: 300, other: 400 },
      { revenue: 14500, clients: 102, newClients: 7, churn: 3, salary: 8500, marketing: 3500, office: 850, software: 320, other: 420 },
      { revenue: 15500, clients: 110, newClients: 8, churn: 3, salary: 8800, marketing: 3800, office: 850, software: 320, other: 420 },
      { revenue: 16800, clients: 120, newClients: 10, churn: 3, salary: 9200, marketing: 4200, office: 900, software: 350, other: 450 },
    ]

    const kgData = [
      { revenue: 5500, clients: 120, newClients: 4, churn: 2, salary: 2000, marketing: 1000, office: 150, software: 80, other: 100 },
      { revenue: 5800, clients: 126, newClients: 4, churn: 2, salary: 2000, marketing: 1000, office: 150, software: 80, other: 100 },
      { revenue: 6100, clients: 132, newClients: 5, churn: 2, salary: 2000, marketing: 1000, office: 150, software: 80, other: 100 },
      { revenue: 6500, clients: 140, newClients: 6, churn: 3, salary: 2100, marketing: 1100, office: 160, software: 85, other: 105 },
      { revenue: 6900, clients: 148, newClients: 7, churn: 3, salary: 2200, marketing: 1200, office: 160, software: 85, other: 105 },
      { revenue: 7400, clients: 158, newClients: 8, churn: 3, salary: 2400, marketing: 1400, office: 180, software: 95, other: 120 },
    ]

    const geData = [
      { revenue: 4200, clients: 65, newClients: 3, churn: 1, salary: 1800, marketing: 800, office: 120, software: 60, other: 80 },
      { revenue: 4500, clients: 70, newClients: 3, churn: 1, salary: 1800, marketing: 800, office: 120, software: 60, other: 80 },
      { revenue: 4800, clients: 75, newClients: 4, churn: 2, salary: 1900, marketing: 900, office: 130, software: 65, other: 85 },
      { revenue: 5200, clients: 82, newClients: 5, churn: 2, salary: 2000, marketing: 1000, office: 140, software: 70, other: 90 },
      { revenue: 5600, clients: 90, newClients: 6, churn: 2, salary: 2100, marketing: 1100, office: 140, software: 70, other: 90 },
      { revenue: 6100, clients: 98, newClients: 7, churn: 2, salary: 2300, marketing: 1300, office: 160, software: 80, other: 100 },
    ]

    const saData = [
      { revenue: 2000, clients: 15, newClients: 2, churn: 0, salary: 3000, marketing: 2000, office: 500, software: 100, other: 150 },
      { revenue: 2500, clients: 18, newClients: 2, churn: 0, salary: 3000, marketing: 2000, office: 500, software: 100, other: 150 },
      { revenue: 3000, clients: 22, newClients: 3, churn: 1, salary: 3200, marketing: 2200, office: 520, software: 110, other: 160 },
      { revenue: 3800, clients: 28, newClients: 4, churn: 1, salary: 3500, marketing: 2500, office: 550, software: 120, other: 170 },
      { revenue: 4800, clients: 36, newClients: 6, churn: 1, salary: 3800, marketing: 2800, office: 580, software: 130, other: 180 },
      { revenue: 6000, clients: 45, newClients: 8, churn: 2, salary: 4200, marketing: 3200, office: 620, software: 150, other: 200 },
    ]

    const allRegionData = [
      { regionId: regions[0].id, data: uzData },
      { regionId: regions[1].id, data: kzData },
      { regionId: regions[2].id, data: kgData },
      { regionId: regions[3].id, data: geData },
      { regionId: regions[4].id, data: aeData },
      { regionId: regions[5].id, data: saData },
    ]

    let monthlyDataCount = 0
    for (const regionData of allRegionData) {
      for (let i = 0; i < periods.length; i++) {
        const d = regionData.data[i]
        if (d) {
          await prisma.monthlyData.create({
            data: {
              periodId: periods[i].id,
              regionId: regionData.regionId,
              revenue: d.revenue,
              clientsCount: d.clients,
              newClients: d.newClients,
              churnedClients: d.churn,
              salary: d.salary,
              marketing: d.marketing,
              office: d.office,
              software: d.software,
              otherExpenses: d.other,
            }
          })
          monthlyDataCount++
        }
      }
    }

    // Settings
    await prisma.settings.create({
      data: { key: 'cash_balance', value: '365000', description: 'Текущий баланс денежных средств' }
    })
    await prisma.settings.create({
      data: { key: 'company_name', value: 'Delever', description: 'Название компании' }
    })

    // Budget Plans
    for (const period of periods) {
      for (const region of regions) {
        await prisma.budgetPlan.create({
          data: {
            periodId: period.id,
            regionId: region.id,
            category: 'revenue',
            planAmount: 30000 + Math.random() * 10000,
          }
        })
        await prisma.budgetPlan.create({
          data: {
            periodId: period.id,
            regionId: region.id,
            category: 'clients',
            planAmount: 100 + Math.random() * 50,
          }
        })
      }
    }

    // Rocks
    await prisma.rock.create({
      data: {
        title: 'Запуск в Саудовской Аравии',
        description: 'Полноценный запуск продукта в SA',
        quarter: 1,
        year: 2026,
        dueDate: new Date('2026-03-31'),
        progress: 70,
        status: 'on_track',
      }
    })
    await prisma.rock.create({
      data: {
        title: 'Достичь $150k MRR',
        description: 'Суммарный MRR по всем регионам',
        quarter: 1,
        year: 2026,
        dueDate: new Date('2026-03-31'),
        progress: 85,
        status: 'on_track',
      }
    })
    await prisma.rock.create({
      data: {
        title: 'Интеграция с Talabat',
        description: 'Техническая интеграция с Talabat UAE',
        quarter: 1,
        year: 2026,
        dueDate: new Date('2026-02-28'),
        progress: 60,
        status: 'on_track',
      }
    })
    await prisma.rock.create({
      data: {
        title: 'Нанять 3 Sales менеджеров',
        description: 'Расширение отдела продаж',
        quarter: 1,
        year: 2026,
        dueDate: new Date('2026-02-15'),
        progress: 90,
        status: 'on_track',
      }
    })
    await prisma.rock.create({
      data: {
        title: 'Снизить Churn до 2%',
        description: 'Улучшение retention',
        quarter: 1,
        year: 2026,
        dueDate: new Date('2026-03-31'),
        progress: 40,
        status: 'off_track',
      }
    })

    // Warnings
    await prisma.warning.create({
      data: {
        title: 'Runway менее 12 месяцев',
        description: 'При текущем burn rate денег хватит на 10-11 месяцев',
        category: 'financial',
        severity: 'high',
        status: 'mitigating',
        mitigationPlan: 'Активный поиск инвестиций, оптимизация расходов',
      }
    })
    await prisma.warning.create({
      data: {
        title: 'Glovo выходит на рынок UZ',
        description: 'Конкурент планирует запуск в Q2 2026',
        category: 'market',
        severity: 'critical',
        status: 'monitoring',
      }
    })
    await prisma.warning.create({
      data: {
        title: 'Churn в KZ выше 5%',
        description: 'Отток клиентов в Казахстане превышает целевой показатель',
        category: 'operational',
        severity: 'medium',
        status: 'open',
      }
    })
    await prisma.warning.create({
      data: {
        title: 'Tech Lead хочет уйти',
        description: 'Ключевой сотрудник рассматривает другие предложения',
        category: 'team',
        severity: 'high',
        status: 'mitigating',
        mitigationPlan: 'Обсуждение повышения, retention бонус',
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      counts: {
        regions: regions.length,
        periods: periods.length,
        monthlyData: monthlyDataCount,
        rocks: 5,
        warnings: 4,
      }
    })

  } catch (error: any) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET() {
  const periods = await prisma.period.count()
  const regions = await prisma.region.count()
  const monthlyData = await prisma.monthlyData.count()
  
  return NextResponse.json({
    hasData: periods > 0,
    counts: { periods, regions, monthlyData }
  })
}

