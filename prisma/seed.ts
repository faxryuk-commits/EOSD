import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
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

  console.log('✅ Regions created:', regions.length)

  // Periods (12 months)
  const periods = []
  for (let m = 1; m <= 12; m++) {
    const period = await prisma.period.create({
      data: {
        name: new Date(2025, m - 1, 1).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }),
        year: 2025,
        month: m,
        startDate: new Date(2025, m - 1, 1),
        endDate: new Date(2025, m, 0),
      }
    })
    periods.push(period)
  }
  // January 2026
  const jan2026 = await prisma.period.create({
    data: {
      name: 'Январь 2026',
      year: 2026,
      month: 1,
      startDate: new Date(2026, 0, 1),
      endDate: new Date(2026, 0, 31),
    }
  })
  periods.push(jan2026)

  console.log('✅ Periods created:', periods.length)

  // Payment Categories
  const categories = await Promise.all([
    // Income
    prisma.paymentCategory.create({ data: { name: 'Продажи', code: 'sales', type: 'income', displayOrder: 1 } }),
    prisma.paymentCategory.create({ data: { name: 'Инвестиции', code: 'investments', type: 'income', displayOrder: 2 } }),
    prisma.paymentCategory.create({ data: { name: 'Займы', code: 'loans', type: 'income', displayOrder: 3 } }),
    prisma.paymentCategory.create({ data: { name: 'Прочий приход', code: 'other_income', type: 'income', displayOrder: 4 } }),
    // Expense
    prisma.paymentCategory.create({ data: { name: 'ФОТ', code: 'salary', type: 'expense', displayOrder: 1 } }),
    prisma.paymentCategory.create({ data: { name: 'Налоги', code: 'taxes', type: 'expense', displayOrder: 2 } }),
    prisma.paymentCategory.create({ data: { name: 'Маркетинг', code: 'marketing', type: 'expense', displayOrder: 3 } }),
    prisma.paymentCategory.create({ data: { name: 'Аренда', code: 'rent', type: 'expense', displayOrder: 4 } }),
    prisma.paymentCategory.create({ data: { name: 'Софт и сервисы', code: 'software', type: 'expense', displayOrder: 5 } }),
    prisma.paymentCategory.create({ data: { name: 'Прочий расход', code: 'other_expense', type: 'expense', displayOrder: 6 } }),
  ])

  console.log('✅ Payment categories created:', categories.length)

  // Sample Staff
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

  // Sample Monthly Data for January 2026
  const sampleData = [
    { regionId: regions[0].id, revenue: 52000, clientsCount: 380, newClients: 15, churnedClients: 8, salary: 12000, marketing: 5000, office: 1500, software: 800, otherExpenses: 700 },
    { regionId: regions[1].id, revenue: 38000, clientsCount: 245, newClients: 12, churnedClients: 10, salary: 8500, marketing: 4000, office: 1200, software: 600, otherExpenses: 500 },
    { regionId: regions[2].id, revenue: 9000, clientsCount: 62, newClients: 5, churnedClients: 3, salary: 2500, marketing: 1000, office: 400, software: 200, otherExpenses: 150 },
    { regionId: regions[3].id, revenue: 7000, clientsCount: 45, newClients: 3, churnedClients: 1, salary: 2000, marketing: 800, office: 350, software: 150, otherExpenses: 100 },
    { regionId: regions[4].id, revenue: 18000, clientsCount: 95, newClients: 8, churnedClients: 2, salary: 6000, marketing: 3000, office: 2000, software: 400, otherExpenses: 600 },
    { regionId: regions[5].id, revenue: 3000, clientsCount: 20, newClients: 4, churnedClients: 0, salary: 1500, marketing: 1200, office: 500, software: 100, otherExpenses: 200 },
  ]

  for (const data of sampleData) {
    await prisma.monthlyData.create({
      data: {
        periodId: jan2026.id,
        ...data
      }
    })
  }

  console.log('✅ Monthly data created for January 2026')

  // Settings
  await prisma.settings.createMany({
    data: [
      { key: 'company_name', value: 'Delever', description: 'Company name' },
      { key: 'cash_balance', value: '365000', description: 'Current cash balance' },
      { key: 'currency', value: 'USD', description: 'Default currency' },
    ]
  })

  console.log('✅ Settings created')

  // C-Level KPIs
  const kpis = [
    // CEO
    { role: 'ceo', metricName: 'MRR', metricKey: 'mrr', goal: 125000, goalType: 'gte', weight: 30 },
    { role: 'ceo', metricName: 'Profit', metricKey: 'profit', goal: 77000, goalType: 'gte', weight: 25 },
    { role: 'ceo', metricName: 'New Regions', metricKey: 'new_regions', goal: 2, goalType: 'gte', weight: 20 },
    // COO
    { role: 'coo', metricName: 'Runway', metricKey: 'runway', goal: 12, goalType: 'gte', weight: 25 },
    { role: 'coo', metricName: 'EOS Score', metricKey: 'eos_score', goal: 80, goalType: 'gte', weight: 20 },
    // CFO
    { role: 'cfo', metricName: 'Revenue', metricKey: 'revenue', goal: 125000, goalType: 'gte', weight: 25 },
    { role: 'cfo', metricName: 'Margin %', metricKey: 'margin', goal: 50, goalType: 'gte', weight: 25 },
    { role: 'cfo', metricName: 'Cash Balance', metricKey: 'cash', goal: 350000, goalType: 'gte', weight: 20 },
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
    { metricName: 'MRR ($k)', goal: 125, goalType: 'gte', unit: '$k', displayOrder: 1 },
    { metricName: 'New Clients', goal: 15, goalType: 'gte', unit: 'count', displayOrder: 2 },
    { metricName: 'Demo Calls', goal: 20, goalType: 'gte', unit: 'count', displayOrder: 3 },
    { metricName: 'Churn Rate %', goal: 3, goalType: 'lte', unit: '%', displayOrder: 4 },
    { metricName: 'Support Tickets', goal: 50, goalType: 'lte', unit: 'count', displayOrder: 5 },
    { metricName: 'Cash ($k)', goal: 350, goalType: 'gte', unit: '$k', displayOrder: 6 },
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
      oneYearRevenue: 1600000,
      oneYearProfit: 400000,
      oneYearGoals: JSON.stringify([
        'Запустить UAE + Saudi Arabia',
        'Достичь $150k MRR',
        'Снизить churn до 2%'
      ])
    }
  })

  console.log('✅ VTO created')

  // Sample Rocks
  const rocks = [
    { title: 'Запустить Saudi Arabia (50+ клиентов)', quarter: 1, year: 2026, progress: 70, status: 'on_track', isCompanyRock: true },
    { title: 'Достичь $150k MRR', quarter: 1, year: 2026, progress: 85, status: 'on_track', isCompanyRock: true },
    { title: 'Интеграция с Talabat', quarter: 1, year: 2026, progress: 60, status: 'on_track', isCompanyRock: true },
    { title: 'Нанять 3 Sales в регионы', quarter: 1, year: 2026, progress: 90, status: 'on_track', isCompanyRock: true },
    { title: 'Снизить Churn до 2%', quarter: 1, year: 2026, progress: 40, status: 'off_track', isCompanyRock: true },
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

  // Sample Warnings
  const warnings = [
    { title: 'Runway < 6 месяцев при текущем burn rate', category: 'financial', severity: 'critical', probability: 'medium', impact: 'high', status: 'mitigating' },
    { title: 'Конкурент Glovo выходит на рынок Узбекистана', category: 'market', severity: 'critical', probability: 'high', impact: 'high', status: 'monitoring' },
    { title: 'Churn в KZ выше 5%', category: 'operational', severity: 'high', probability: 'high', impact: 'medium', status: 'mitigating' },
    { title: 'Tech Lead хочет уйти', category: 'team', severity: 'high', probability: 'medium', impact: 'high', status: 'open' },
  ]

  for (const warning of warnings) {
    await prisma.warning.create({ data: warning })
  }

  console.log('✅ Warnings created')

  // Sample Top Clients
  const topClients = [
    { name: 'KFC Uzbekistan', regionId: regions[0].id, mrr: 2500, tariff: 'enterprise' },
    { name: 'Burger King UZ', regionId: regions[0].id, mrr: 1800, tariff: 'enterprise' },
    { name: 'Sushi Master KZ', regionId: regions[1].id, mrr: 1500, tariff: 'pro' },
    { name: 'Pizza Hut UZ', regionId: regions[0].id, mrr: 1400, tariff: 'pro' },
    { name: "McDonald's UAE", regionId: regions[4].id, mrr: 1200, tariff: 'enterprise' },
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

