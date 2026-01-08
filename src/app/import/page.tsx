'use client'

import { useState, useRef } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Upload, FileSpreadsheet, CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    success?: boolean
    message?: string
    error?: string
    results?: Record<string, number>
    sheets?: string[]
  } | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setResult(null)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls'))) {
      setFile(droppedFile)
      setResult(null)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleUpload = async () => {
    if (!file) return

    setLoading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/import', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: 'Ошибка при загрузке файла' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Импорт данных</h1>
        <p className="text-slate-400">Загрузите файл AUP EOS для импорта данных в систему</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Загрузка Excel файла
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Drop zone */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              file 
                ? 'border-emerald-500/50 bg-emerald-500/5' 
                : 'border-slate-600 hover:border-slate-500 bg-slate-800/50'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
            
            {file ? (
              <div className="space-y-2">
                <FileSpreadsheet className="w-12 h-12 mx-auto text-emerald-400" />
                <p className="text-white font-medium">{file.name}</p>
                <p className="text-slate-400 text-sm">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-12 h-12 mx-auto text-slate-500" />
                <p className="text-slate-300">
                  Перетащите файл сюда или <span className="text-emerald-400">выберите</span>
                </p>
                <p className="text-slate-500 text-sm">
                  Поддерживаемые форматы: .xlsx, .xls
                </p>
              </div>
            )}
          </div>

          {/* Upload button */}
          {file && (
            <button
              onClick={handleUpload}
              disabled={loading}
              className={`mt-4 w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                loading
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Импортирую данные...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Импортировать данные
                </>
              )}
            </button>
          )}

          {/* Result */}
          {result && (
            <div className={`mt-4 p-4 rounded-lg ${
              result.success 
                ? 'bg-emerald-500/10 border border-emerald-500/30' 
                : 'bg-red-500/10 border border-red-500/30'
            }`}>
              <div className="flex items-start gap-3">
                {result.success ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={result.success ? 'text-emerald-400' : 'text-red-400'}>
                    {result.message || result.error}
                  </p>
                  
                  {result.results && (
                    <div className="mt-3 space-y-1">
                      <p className="text-slate-400 text-sm font-medium">Результаты импорта:</p>
                      <ul className="text-sm text-slate-300 space-y-1">
                        {Object.entries(result.results).map(([key, value]) => (
                          <li key={key} className="flex justify-between">
                            <span>{key}:</span>
                            <span className="text-emerald-400">{value} записей</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {result.sheets && (
                    <div className="mt-3">
                      <p className="text-slate-400 text-sm font-medium">Листы в файле:</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {result.sheets.map((sheet) => (
                          <span
                            key={sheet}
                            className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300"
                          >
                            {sheet}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Инструкция</CardTitle>
        </CardHeader>
        <CardContent className="text-slate-400 space-y-3">
          <p>
            Система автоматически распознает данные из файла <strong className="text-white">AUP EOS _ Delever.xlsx</strong> и импортирует их в соответствующие поля:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong className="text-emerald-400">Sales plan regions</strong> → MRR, клиенты, ARPU по регионам</li>
            <li><strong className="text-emerald-400">P&L / Budget</strong> → Расходы по категориям</li>
            <li><strong className="text-emerald-400">Регионы</strong> → Узбекистан, Казахстан, Кыргызстан, Грузия, ОАЭ, Саудовская Аравия</li>
            <li><strong className="text-emerald-400">Периоды</strong> → Ноябрь 2025 - Март 2026</li>
          </ul>
          <p className="text-amber-400 text-sm">
            ⚠️ Существующие данные за те же периоды будут обновлены
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

