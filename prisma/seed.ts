import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data (order matters due to foreign keys)
  await prisma.clientInteraction.deleteMany()
  await prisma.clientHealthCheck.deleteMany()
  await prisma.topClient.deleteMany()
  await prisma.warningUpdate.deleteMany()
  await prisma.warning.deleteMany()
  await prisma.cLevelKPIValue.deleteMany()
  await prisma.cLevelKPI.deleteMany()
  await prisma.weeklyScorecardValue.deleteMany()
  await prisma.weeklyScorecard.deleteMany()
  await prisma.rockUpdate.deleteMany()
  await prisma.rock.deleteMany()
  await prisma.vTO.deleteMany()
  await prisma.issue.deleteMany()
  await prisma.todo.deleteMany()
  await prisma.meeting.deleteMany()
  await prisma.peopleAnalyzer.deleteMany()
  await prisma.accountabilityChart.deleteMany()
  await prisma.staffBonus.deleteMany()
  await prisma.salaryHistory.deleteMany()
  await prisma.staff.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.paymentCategory.deleteMany()
  await prisma.budgetPlan.deleteMany()
  await prisma.monthlyData.deleteMany()
  await prisma.period.deleteMany()
  await prisma.region.deleteMany()
  await prisma.settings.deleteMany()
  await prisma.capTable.deleteMany()
  await prisma.investment.deleteMany()
  await prisma.exchangeRate.deleteMany()

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

  console.log('✅ Regions created:', regions.length)

  // Periods for 2025-2026 (August 2025 - January 2026)
  const periodsData = [
    { year: 2025, month: 8, name: 'Август 2025' },
    { year: 2025, month: 9, name: 'Сентябрь 2025' },
    { year: 2025, month: 10, name: 'Октябрь 2025' },
    { year: 2025, month: 11, name: 'Ноябрь 2025' },
    { year: 2025, month: 12, name: 'Декабрь 2025' },
    { year: 2026, month: 1, name: 'Январь 2026' },
    { year: 2026, month: 2, name: 'Февраль 2026' },
    { year: 2026, month: 3, name: 'Март 2026' },
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

  console.log('✅ Periods created:', periods.length)

  // Real data from Excel (Sales plan regions)
  // Format: [revenue, clients, newClients, churn, salary, marketing, office, software, other]
  
  // Узбекистан data by month (Aug 2025 - Mar 2026)
  const uzData = [
    { revenue: 28098, clients: 446, newClients: 10, churn: 5, salary: 8000, marketing: 4000, office: 500, software: 200, other: 300 },   // Aug 2025
    { revenue: 29358, clients: 466, newClients: 10, churn: 5, salary: 8000, marketing: 4000, office: 500, software: 200, other: 300 },   // Sep 2025
    { revenue: 30618, clients: 486, newClients: 11, churn: 5, salary: 8000, marketing: 4000, office: 500, software: 200, other: 300 },   // Oct 2025
    { revenue: 32004, clients: 508, newClients: 12, churn: 6, salary: 8000, marketing: 4000, office: 500, software: 200, other: 300 },   // Nov 2025
    { revenue: 33390, clients: 530, newClients: 12, churn: 6, salary: 8000, marketing: 4000, office: 500, software: 200, other: 300 },   // Dec 2025
    { revenue: 34776, clients: 552, newClients: 12, churn: 6, salary: 8000, marketing: 4000, office: 500, software: 200, other: 300 },   // Jan 2026
    { revenue: 36351, clients: 577, newClients: 13, churn: 6, salary: 8000, marketing: 4000, office: 500, software: 200, other: 300 },   // Feb 2026
    { revenue: 37926, clients: 602, newClients: 13, churn: 6, salary: 8000, marketing: 4000, office: 500, software: 200, other: 300 },   // Mar 2026
  ]

  // Казахстан data by month
  const kzData = [
    { revenue: 11025, clients: 245, newClients: 5, churn: 8, salary: 4600, marketing: 0, office: 560, software: 540, other: 1103 },    // Aug 2025
    { revenue: 11250, clients: 250, newClients: 8, churn: 3, salary: 2750, marketing: 0, office: 560, software: 540, other: 1125 },    // Sep 2025
    { revenue: 13140, clients: 292, newClients: 8, churn: 4, salary: 2750, marketing: 0, office: 560, software: 540, other: 1314 },    // Oct 2025
    { revenue: 14040, clients: 312, newClients: 9, churn: 5, salary: 2750, marketing: 0, office: 560, software: 540, other: 1404 },    // Nov 2025
    { revenue: 14850, clients: 330, newClients: 9, churn: 5, salary: 2750, marketing: 0, office: 560, software: 540, other: 1485 },    // Dec 2025
    { revenue: 15300, clients: 340, newClients: 10, churn: 5, salary: 2750, marketing: 0, office: 560, software: 540, other: 1530 },   // Jan 2026
    { revenue: 15750, clients: 350, newClients: 10, churn: 5, salary: 2750, marketing: 0, office: 560, software: 540, other: 1575 },   // Feb 2026
    { revenue: 16200, clients: 360, newClients: 10, churn: 5, salary: 2750, marketing: 0, office: 560, software: 540, other: 1620 },   // Mar 2026
  ]

  // Кыргызстан data (starts later)
  const kgData = [
    { revenue: 0, clients: 0, newClients: 0, churn: 0, salary: 0, marketing: 0, office: 0, software: 0, other: 0 },        // Aug 2025
    { revenue: 0, clients: 0, newClients: 0, churn: 0, salary: 0, marketing: 0, office: 0, software: 0, other: 0 },        // Sep 2025
    { revenue: 0, clients: 0, newClients: 0, churn: 0, salary: 0, marketing: 0, office: 0, software: 0, other: 0 },        // Oct 2025
    { revenue: 0, clients: 0, newClients: 0, churn: 0, salary: 0, marketing: 0, office: 0, software: 0, other: 0 },        // Nov 2025
    { revenue: 500, clients: 10, newClients: 10, churn: 0, salary: 0, marketing: 500, office: 0, software: 0, other: 0 },  // Dec 2025
    { revenue: 1500, clients: 30, newClients: 20, churn: 0, salary: 500, marketing: 500, office: 0, software: 0, other: 0 }, // Jan 2026
    { revenue: 2500, clients: 50, newClients: 20, churn: 0, salary: 800, marketing: 500, office: 0, software: 0, other: 200 }, // Feb 2026
    { revenue: 3500, clients: 70, newClients: 20, churn: 0, salary: 1000, marketing: 500, office: 0, software: 0, other: 500 }, // Mar 2026
  ]

  // ОАЭ data (new market, starts Dec 2025)
  const aeData = [
    { revenue: 0, clients: 0, newClients: 0, churn: 0, salary: 0, marketing: 0, office: 0, software: 0, other: 0 },          // Aug 2025
    { revenue: 0, clients: 0, newClients: 0, churn: 0, salary: 0, marketing: 0, office: 0, software: 0, other: 0 },          // Sep 2025
    { revenue: 0, clients: 0, newClients: 0, churn: 0, salary: 0, marketing: 0, office: 0, software: 0, other: 0 },          // Oct 2025
    { revenue: 0, clients: 0, newClients: 0, churn: 0, salary: 0, marketing: 0, office: 0, software: 0, other: 0 },          // Nov 2025
    { revenue: 3000, clients: 15, newClients: 15, churn: 0, salary: 3000, marketing: 2000, office: 1000, software: 300, other: 700 },  // Dec 2025
    { revenue: 8000, clients: 40, newClients: 25, churn: 0, salary: 4000, marketing: 3000, office: 1500, software: 400, other: 1100 }, // Jan 2026
    { revenue: 15000, clients: 75, newClients: 35, churn: 0, salary: 5000, marketing: 4000, office: 1800, software: 500, other: 1700 }, // Feb 2026
    { revenue: 22000, clients: 110, newClients: 35, churn: 0, salary: 6000, marketing: 5000, office: 2000, software: 600, other: 2400 }, // Mar 2026
  ]

  // Грузия data
  const geData = [
    { revenue: 2000, clients: 20, newClients: 5, churn: 1, salary: 1000, marketing: 500, office: 200, software: 100, other: 200 },   // Aug 2025
    { revenue: 2500, clients: 25, newClients: 6, churn: 1, salary: 1000, marketing: 500, office: 200, software: 100, other: 200 },   // Sep 2025
    { revenue: 3000, clients: 30, newClients: 6, churn: 1, salary: 1000, marketing: 500, office: 200, software: 100, other: 200 },   // Oct 2025
    { revenue: 3500, clients: 35, newClients: 6, churn: 1, salary: 1000, marketing: 500, office: 200, software: 100, other: 200 },   // Nov 2025
    { revenue: 4000, clients: 40, newClients: 6, churn: 1, salary: 1200, marketing: 600, office: 200, software: 100, other: 200 },   // Dec 2025
    { revenue: 4500, clients: 45, newClients: 6, churn: 1, salary: 1200, marketing: 600, office: 200, software: 100, other: 200 },   // Jan 2026
    { revenue: 5000, clients: 50, newClients: 6, churn: 1, salary: 1200, marketing: 600, office: 200, software: 100, other: 200 },   // Feb 2026
    { revenue: 5500, clients: 55, newClients: 6, churn: 1, salary: 1200, marketing: 600, office: 200, software: 100, other: 200 },   // Mar 2026
  ]

  // Саудовская Аравия (new market, starts Jan 2026)
  const saData = [
    { revenue: 0, clients: 0, newClients: 0, churn: 0, salary: 0, marketing: 0, office: 0, software: 0, other: 0 },          // Aug 2025
    { revenue: 0, clients: 0, newClients: 0, churn: 0, salary: 0, marketing: 0, office: 0, software: 0, other: 0 },          // Sep 2025
    { revenue: 0, clients: 0, newClients: 0, churn: 0, salary: 0, marketing: 0, office: 0, software: 0, other: 0 },          // Oct 2025
    { revenue: 0, clients: 0, newClients: 0, churn: 0, salary: 0, marketing: 0, office: 0, software: 0, other: 0 },          // Nov 2025
    { revenue: 0, clients: 0, newClients: 0, churn: 0, salary: 0, marketing: 0, office: 0, software: 0, other: 0 },          // Dec 2025
    { revenue: 2000, clients: 10, newClients: 10, churn: 0, salary: 2000, marketing: 1500, office: 500, software: 200, other: 300 },  // Jan 2026
    { revenue: 5000, clients: 25, newClients: 15, churn: 0, salary: 2500, marketing: 2000, office: 600, software: 200, other: 400 },  // Feb 2026
    { revenue: 10000, clients: 50, newClients: 25, churn: 0, salary: 3000, marketing: 2500, office: 700, software: 300, other: 500 }, // Mar 2026
  ]

  const allRegionsData = [
    { regionId: regions[0].id, data: uzData },  // UZ
    { regionId: regions[1].id, data: kzData },  // KZ
    { regionId: regions[2].id, data: kgData },  // KG
    { regionId: regions[3].id, data: geData },  // GE
    { regionId: regions[4].id, data: aeData },  // AE
    { regionId: regions[5].id, data: saData },  // SA
  ]

  // Insert monthly data
  for (const regionData of allRegionsData) {
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
      }
    }
  }

  console.log('✅ Monthly data created for all periods and regions')

  // Payment Categories
  const categories = await Promise.all([
    prisma.paymentCategory.create({ data: { name: 'Продажи', code: 'sales', type: 'income', displayOrder: 1 } }),
    prisma.paymentCategory.create({ data: { name: 'Инвестиции', code: 'investments', type: 'income', displayOrder: 2 } }),
    prisma.paymentCategory.create({ data: { name: 'Займы', code: 'loans', type: 'income', displayOrder: 3 } }),
    prisma.paymentCategory.create({ data: { name: 'Прочий приход', code: 'other_income', type: 'income', displayOrder: 4 } }),
    prisma.paymentCategory.create({ data: { name: 'ФОТ', code: 'salary', type: 'expense', displayOrder: 1 } }),
    prisma.paymentCategory.create({ data: { name: 'Налоги', code: 'taxes', type: 'expense', displayOrder: 2 } }),
    prisma.paymentCategory.create({ data: { name: 'Маркетинг', code: 'marketing', type: 'expense', displayOrder: 3 } }),
    prisma.paymentCategory.create({ data: { name: 'Аренда', code: 'rent', type: 'expense', displayOrder: 4 } }),
    prisma.paymentCategory.create({ data: { name: 'Софт и сервисы', code: 'software', type: 'expense', displayOrder: 5 } }),
    prisma.paymentCategory.create({ data: { name: 'Прочий расход', code: 'other_expense', type: 'expense', displayOrder: 6 } }),
  ])
  console.log('✅ Payment categories created:', categories.length)

  // Settings
  await prisma.settings.createMany({
    data: [
      { key: 'company_name', value: 'Delever', description: 'Company name' },
      { key: 'cash_balance', value: '122945', description: 'Current cash balance (from Excel инвестиции сумма)' },
      { key: 'currency', value: 'USD', description: 'Default currency' },
    ]
  })
  console.log('✅ Settings created')

  // Staff
  const staff = await Promise.all([
    prisma.staff.create({
      data: {
        firstName: 'Abdullo',
        lastName: 'CEO',
        position: 'CEO',
        department: 'management',
        salary: 5000,
        startDate: new Date(2023, 2, 1),
        email: 'ceo@delever.io'
      }
    }),
    prisma.staff.create({
      data: {
        firstName: 'Faxriddin',
        lastName: 'COO',
        position: 'COO',
        department: 'management',
        salary: 4500,
        startDate: new Date(2023, 2, 1),
        email: 'coo@delever.io'
      }
    }),
  ])
  console.log('✅ Staff created:', staff.length)

  // C-Level KPIs (from Scorecard)
  const kpis = [
    // CEO (from Scorecard)
    { role: 'ceo', metricName: 'MRR (Доход)', metricKey: 'mrr', goal: 40000, goalType: 'gte', weight: 30 },
    { role: 'ceo', metricName: 'Прибыль', metricKey: 'profit', goal: 12000, goalType: 'gte', weight: 25 },
    { role: 'ceo', metricName: 'План продаж (кол-во)', metricKey: 'sales_plan', goal: 875, goalType: 'gte', weight: 20 },
    // COO
    { role: 'coo', metricName: 'Runway', metricKey: 'runway', goal: 3, goalType: 'gte', weight: 25 },
    { role: 'coo', metricName: 'Дебиторка', metricKey: 'debit', goal: 1, goalType: 'lte', weight: 20 },
    { role: 'coo', metricName: 'Кредиторка', metricKey: 'credit', goal: 0.5, goalType: 'lte', weight: 20 },
    // CFO (from Finance section)
    { role: 'cfo', metricName: 'Выручка', metricKey: 'revenue', goal: 40000, goalType: 'gte', weight: 25 },
    { role: 'cfo', metricName: 'Прибыль', metricKey: 'profit', goal: 14000, goalType: 'gte', weight: 25 },
    { role: 'cfo', metricName: 'Рентабельность', metricKey: 'margin', goal: 35, goalType: 'gte', weight: 20 },
    { role: 'cfo', metricName: 'Резерв', metricKey: 'cash', goal: 20000, goalType: 'gte', weight: 20 },
    // CTO
    { role: 'cto', metricName: 'Uptime %', metricKey: 'uptime', goal: 99.9, goalType: 'gte', weight: 30 },
    { role: 'cto', metricName: 'Bugs/release', metricKey: 'bugs', goal: 5, goalType: 'lte', weight: 20 },
  ]
  for (const kpi of kpis) {
    await prisma.cLevelKPI.create({ data: kpi })
  }
  console.log('✅ C-Level KPIs created')

  // Weekly Scorecard Metrics
  const scorecardMetrics = [
    { metricName: 'MRR ($)', goal: 40000, goalType: 'gte', unit: '$', displayOrder: 1 },
    { metricName: 'Прибыль ($)', goal: 12000, goalType: 'gte', unit: '$', displayOrder: 2 },
    { metricName: 'New Clients', goal: 50, goalType: 'gte', unit: 'count', displayOrder: 3 },
    { metricName: 'Churn Rate %', goal: 3, goalType: 'lte', unit: '%', displayOrder: 4 },
    { metricName: 'Runway (months)', goal: 3, goalType: 'gte', unit: 'months', displayOrder: 5 },
  ]
  for (const metric of scorecardMetrics) {
    await prisma.weeklyScorecard.create({ data: metric })
  }
  console.log('✅ Scorecard metrics created')

  // VTO
  await prisma.vTO.create({
    data: {
      companyId: 1,
      coreValues: JSON.stringify(['Счастье всех', 'Качество', 'Скорость', 'Инновации']),
      purpose: 'Каждая доставка - идеальна',
      niche: 'Delivery management software для HoReCa',
      tenYearTarget: '$77 Million ARR',
      tenYearDate: new Date(2034, 11, 31),
      targetMarket: 'HoReCa (рестораны, кафе, dark kitchens)',
      threeUniques: JSON.stringify([
        'Интеграция со ВСЕМИ агрегаторами',
        'Мультирегиональность (6+ стран)',
        'Лучшая поддержка на локальном языке'
      ]),
      threeYearDate: new Date(2027, 11, 31),
      threeYearRevenue: 16000000,
      threeYearProfit: 5000000,
      threeYearClients: 5000,
      oneYearDate: new Date(2026, 11, 31),
      oneYearRevenue: 480000,  // ~$40k MRR * 12
      oneYearProfit: 168000,   // ~$14k * 12
      oneYearGoals: JSON.stringify([
        'Запустить UAE + Saudi Arabia',
        'Достичь $40k MRR',
        'Снизить churn до 3%'
      ])
    }
  })
  console.log('✅ VTO created')

  // Rocks
  const rocks = [
    { title: 'Запустить Saudi Arabia (50+ клиентов)', quarter: 1, year: 2026, progress: 20, status: 'on_track', isCompanyRock: true },
    { title: 'Достичь $40k MRR', quarter: 1, year: 2026, progress: 65, status: 'on_track', isCompanyRock: true },
    { title: 'Интеграция с Talabat', quarter: 1, year: 2026, progress: 60, status: 'on_track', isCompanyRock: true },
    { title: 'Нанять 3 Sales в регионы', quarter: 1, year: 2026, progress: 90, status: 'on_track', isCompanyRock: true },
    { title: 'Снизить Churn до 3%', quarter: 1, year: 2026, progress: 40, status: 'off_track', isCompanyRock: true },
  ]
  for (const rock of rocks) {
    await prisma.rock.create({
      data: {
        ...rock,
        dueDate: new Date(2026, 2, 31)
      }
    })
  }
  console.log('✅ Rocks created')

  // Warnings
  const warnings = [
    { title: 'Runway ~3 месяца - нужно привлечь инвестиции', category: 'financial', severity: 'critical', probability: 'high', impact: 'high', status: 'mitigating' },
    { title: 'Конкурент Glovo выходит на рынок Узбекистана', category: 'market', severity: 'critical', probability: 'high', impact: 'high', status: 'monitoring' },
    { title: 'Churn в KZ выше 5%', category: 'operational', severity: 'high', probability: 'high', impact: 'medium', status: 'mitigating' },
    { title: 'Новые рынки (UAE, SA) требуют больших инвестиций', category: 'financial', severity: 'high', probability: 'medium', impact: 'high', status: 'open' },
  ]
  for (const warning of warnings) {
    await prisma.warning.create({ data: warning })
  }
  console.log('✅ Warnings created')

  // Top Clients
  const topClients = [
    { name: 'KFC Uzbekistan', regionId: regions[0].id, mrr: 2500, tariff: 'enterprise' },
    { name: 'Burger King UZ', regionId: regions[0].id, mrr: 1800, tariff: 'enterprise' },
    { name: 'Sushi Master KZ', regionId: regions[1].id, mrr: 1500, tariff: 'pro' },
    { name: 'Pizza Hut UZ', regionId: regions[0].id, mrr: 1400, tariff: 'pro' },
    { name: "Dodo Pizza UZ", regionId: regions[0].id, mrr: 1200, tariff: 'pro' },
    { name: "Chopar Pizza", regionId: regions[0].id, mrr: 1000, tariff: 'pro' },
    { name: "Evos", regionId: regions[0].id, mrr: 900, tariff: 'standard' },
    { name: "Papa Johns KZ", regionId: regions[1].id, mrr: 850, tariff: 'pro' },
  ]
  for (const client of topClients) {
    await prisma.topClient.create({ data: client })
  }
  console.log('✅ Top clients created')

  console.log('🎉 Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
