'use client'

import { Download, Printer } from 'lucide-react'

interface ExportButtonsProps {
  title?: string
}

export function ExportButtons({ title = 'report' }: ExportButtonsProps) {
  const handleExport = () => {
    // Get table data
    const table = document.querySelector('table')
    if (!table) return

    // Convert table to CSV
    const rows = table.querySelectorAll('tr')
    let csv = ''
    
    rows.forEach(row => {
      const cells = row.querySelectorAll('th, td')
      const rowData: string[] = []
      cells.forEach(cell => {
        // Clean the text content
        let text = cell.textContent || ''
        text = text.replace(/[\n\r]+/g, ' ').trim()
        // Escape quotes and wrap in quotes if contains comma
        if (text.includes(',') || text.includes('"')) {
          text = `"${text.replace(/"/g, '""')}"`
        }
        rowData.push(text)
      })
      csv += rowData.join(',') + '\n'
    })

    // Download CSV
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${title}-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="flex items-center gap-3">
      <button 
        onClick={handleExport}
        className="btn-secondary flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
      >
        <Download size={18} />
        Export
      </button>
      <button 
        onClick={handlePrint}
        className="btn-secondary flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
      >
        <Printer size={18} />
        Print
      </button>
    </div>
  )
}

