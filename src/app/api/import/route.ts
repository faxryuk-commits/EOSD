export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import * as XLSX from 'xlsx'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'Файл не выбран' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    
    const results: Record<string, number> = {}

    // 1. Create/update Regions
    const regions = [
      { code: 'uz', name: 'Узбекистан', color: '#22c55e' },
      { code: 'kz', name: 'Казахстан', color: '#3b82f6' },
      { code: 'kg', name: 'Кыргызстан', color: '#f59e0b' },
      { code: 'ge', name: 'Грузия', color: '#8b5cf6' },
      { code: 'ae', name: 'ОАЭ', color: '#ef4444' },
      { code: 'sa', name: 'Саудовская Аравия', color: '#06b6d4' },
    ]

    for (const region of regions) {
      await prisma.region.upsert({
        where: { code: region.code },
        update: { name: region.name, color: region.color },
        create: region,
      })
    }
    results['regions'] = regions.length

    // 2. Create Periods (Nov 2025 - Mar 2026)
    const periods = [
      { year: 2025, month: 11, name: 'Ноябрь 2025' },
      { year: 2025, month: 12, name: 'Декабрь 2025' },
      { year: 2026, month: 1, name: 'Январь 2026' },
      { year: 2026, month: 2, name: 'Февраль 2026' },
      { year: 2026, month: 3, name: 'Март 2026' },
    ]

    for (const period of periods) {
      const existing = await prisma.period.findFirst({
        where: { year: period.year, month: period.month }
      })
      
      if (existing) {
        await prisma.period.update({
          where: { id: existing.id },
          data: { name: period.name },
        })
      } else {
        await prisma.period.create({
          data: {
            ...period,
            startDate: new Date(period.year, period.month - 1, 1),
            endDate: new Date(period.year, period.month, 0),
          },
        })
      }
    }
    results['periods'] = periods.length

    // Get DB data
    const dbRegions = await prisma.region.findMany()
    const dbPeriods = await prisma.period.findMany()

    // Region name mapping
    const regionMap: Record<string, string> = {
      'Uzbekistan': 'uz',
      'Kazakhstan': 'kz',
      'Kyrgyzstan': 'kg',
      'Georgia': 'ge',
      'UAE': 'ae',
      'KSA': 'sa',
      'Saudi Arabia': 'sa',
    }

    // 3. Parse Sales plan regions sheet
    const salesSheet = workbook.Sheets['Sales plan regions']
    if (salesSheet) {
      const data = XLSX.utils.sheet_to_json(salesSheet, { header: 1 }) as any[][]
      
      // Find rows with data
      let importedRows = 0
      let currentRegion: typeof dbRegions[0] | null = null
      
      for (let i = 0; i < data.length; i++) {
        const row = data[i]
        if (!row || row.length === 0) continue
        
        const firstCell = String(row[0] || '').trim()
        
        // Check if this is a region name
        const regionCode = regionMap[firstCell]
        if (regionCode) {
          currentRegion = dbRegions.find(r => r.code === regionCode) || null
          continue
        }
        
        if (!currentRegion) continue
        
        // Check for metric rows
        const metricName = firstCell.toLowerCase()
        
        // Process each month column (assuming columns B-F are Nov-Mar)
        const monthMap = [
          { col: 1, year: 2025, month: 11 },
          { col: 2, year: 2025, month: 12 },
          { col: 3, year: 2026, month: 1 },
          { col: 4, year: 2026, month: 2 },
          { col: 5, year: 2026, month: 3 },
        ]
        
        for (const { col, year, month } of monthMap) {
          const value = parseFloat(String(row[col] || '0').replace(/[,$\s]/g, '')) || 0
          if (value === 0) continue
          
          const period = dbPeriods.find(p => p.year === year && p.month === month)
          if (!period) continue
          
          // Build update data based on metric name
          const updateData: any = {}
          
          if (metricName.includes('mrr') || metricName === 'mrr') {
            updateData.revenue = value
          } else if (metricName.includes('active') && metricName.includes('client')) {
            updateData.clientsCount = Math.round(value)
          } else if (metricName.includes('new') && metricName.includes('client')) {
            updateData.newClients = Math.round(value)
          } else if (metricName.includes('churn') && metricName.includes('client')) {
            updateData.churnedClients = Math.round(value)
          }
          
          if (Object.keys(updateData).length > 0) {
            // Find existing or create new
            const existing = await prisma.monthlyData.findFirst({
              where: {
                regionId: currentRegion.id,
                periodId: period.id
              }
            })
            
            if (existing) {
              await prisma.monthlyData.update({
                where: { id: existing.id },
                data: updateData
              })
            } else {
              await prisma.monthlyData.create({
                data: {
                  regionId: currentRegion.id,
                  periodId: period.id,
                  ...updateData
                }
              })
            }
            importedRows++
          }
        }
      }
      
      results['salesData'] = importedRows
    }

    // 4. Parse P&L sheet for expenses
    const plSheet = workbook.Sheets['P&L'] || workbook.Sheets['Budget']
    if (plSheet) {
      const data = XLSX.utils.sheet_to_json(plSheet, { header: 1 }) as any[][]
      
      let expenseRows = 0
      
      // Map expense categories
      const expenseCategoryMap: Record<string, string> = {
        'staff': 'staffCosts',
        'salary': 'staffCosts',
        'payroll': 'staffCosts',
        'marketing': 'marketingCosts',
        'advertising': 'marketingCosts',
        'infrastructure': 'infrastructureCosts',
        'server': 'infrastructureCosts',
        'hosting': 'infrastructureCosts',
        'office': 'officeCosts',
        'rent': 'officeCosts',
        'legal': 'legalCosts',
        'travel': 'travelCosts',
        'other': 'otherCosts',
      }
      
      for (let i = 0; i < data.length; i++) {
        const row = data[i]
        if (!row || row.length === 0) continue
        
        const firstCell = String(row[0] || '').trim().toLowerCase()
        
        // Find matching expense category
        let fieldName: string | null = null
        for (const [keyword, field] of Object.entries(expenseCategoryMap)) {
          if (firstCell.includes(keyword)) {
            fieldName = field
            break
          }
        }
        
        if (!fieldName) continue
        
        // Process each month column
        const monthMap = [
          { col: 1, year: 2025, month: 11 },
          { col: 2, year: 2025, month: 12 },
          { col: 3, year: 2026, month: 1 },
          { col: 4, year: 2026, month: 2 },
          { col: 5, year: 2026, month: 3 },
        ]
        
        for (const { col, year, month } of monthMap) {
          const value = parseFloat(String(row[col] || '0').replace(/[,$\s]/g, '')) || 0
          if (value === 0) continue
          
          const period = dbPeriods.find(p => p.year === year && p.month === month)
          if (!period) continue
          
          // Update all regions with this expense (distributed equally or use first region)
          const firstRegion = dbRegions[0]
          if (firstRegion) {
            const existingExpense = await prisma.monthlyData.findFirst({
              where: {
                regionId: firstRegion.id,
                periodId: period.id
              }
            })
            
            if (existingExpense) {
              await prisma.monthlyData.update({
                where: { id: existingExpense.id },
                data: { [fieldName]: value }
              })
            } else {
              await prisma.monthlyData.create({
                data: {
                  regionId: firstRegion.id,
                  periodId: period.id,
                  [fieldName]: value
                }
              })
            }
            expenseRows++
          }
        }
      }
      
      results['expenses'] = expenseRows
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Данные успешно импортированы',
      results,
      sheets: workbook.SheetNames
    })

  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json({ 
      error: 'Ошибка импорта: ' + (error as Error).message 
    }, { status: 500 })
  }
}

