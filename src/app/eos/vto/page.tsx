'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Target, Eye, Heart, Users, Calendar, MapPin, DollarSign, TrendingUp } from 'lucide-react'

export default function VTOPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Vision/Traction Organizer</h1>
        <p className="text-slate-400">Стратегическое видение и тяговые цели компании</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vision */}
        <Card>
          <CardHeader className="border-b border-slate-700">
            <CardTitle className="flex items-center gap-2">
              <Eye className="text-purple-400" />
              Vision (Видение)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Core Values */}
            <div>
              <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                <Heart size={16} className="text-red-400" />
                Core Values (Ценности)
              </h3>
              <div className="space-y-2">
                {['Клиент — на первом месте', 'Честность и прозрачность', 'Постоянное улучшение', 'Командная работа', 'Инновации'].map((value, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg">
                    <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-sm">
                      {i + 1}
                    </span>
                    <span className="text-slate-300">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Core Focus */}
            <div>
              <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                <Target size={16} className="text-emerald-400" />
                Core Focus (Фокус)
              </h3>
              <div className="space-y-2">
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-sm">Purpose / Cause / Passion</p>
                  <p className="text-white mt-1">Помогаем ресторанам расти через технологии</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-sm">Niche</p>
                  <p className="text-white mt-1">SaaS для ресторанного бизнеса в развивающихся рынках</p>
                </div>
              </div>
            </div>

            {/* 10-Year Target */}
            <div>
              <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                <Calendar size={16} className="text-blue-400" />
                10-Year Target
              </h3>
              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-blue-400 font-medium">$100M ARR к 2035</p>
                <p className="text-slate-400 text-sm mt-1">Лидер рынка в 10 странах СНГ и Middle East</p>
              </div>
            </div>

            {/* Marketing Strategy */}
            <div>
              <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                <Users size={16} className="text-amber-400" />
                Marketing Strategy
              </h3>
              <div className="space-y-2">
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-sm">Target Market</p>
                  <p className="text-white mt-1">Рестораны 3+ точек в СНГ и Ближнем Востоке</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-sm">3 Uniques</p>
                  <ul className="text-white mt-1 space-y-1">
                    <li>• Локализация под каждый рынок</li>
                    <li>• Интеграция с местными сервисами</li>
                    <li>• 24/7 поддержка на местном языке</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Traction */}
        <Card>
          <CardHeader className="border-b border-slate-700">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="text-emerald-400" />
              Traction (Тяга)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* 3-Year Picture */}
            <div>
              <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                <Calendar size={16} className="text-purple-400" />
                3-Year Picture (2028)
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-sm">Revenue</p>
                  <p className="text-emerald-400 font-bold text-xl">$5M ARR</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-sm">Clients</p>
                  <p className="text-blue-400 font-bold text-xl">2,000+</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-sm">Team</p>
                  <p className="text-purple-400 font-bold text-xl">100+</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-slate-400 text-sm">Markets</p>
                  <p className="text-amber-400 font-bold text-xl">8</p>
                </div>
              </div>
            </div>

            {/* 1-Year Plan */}
            <div>
              <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                <Target size={16} className="text-emerald-400" />
                1-Year Plan (2026)
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                  <p className="text-slate-400 text-sm">Revenue Goal</p>
                  <p className="text-emerald-400 font-bold text-xl">$1.5M ARR</p>
                </div>
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                  <p className="text-slate-400 text-sm">Clients Goal</p>
                  <p className="text-emerald-400 font-bold text-xl">800</p>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                <p className="text-slate-400 text-sm font-medium">Key Initiatives:</p>
                {['Запуск в Саудовской Аравии', 'Новый продукт для сетей', 'Выход на break-even'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg">
                    <span className="w-5 h-5 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">
                      {i + 1}
                    </span>
                    <span className="text-slate-300 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quarterly Rocks */}
            <div>
              <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                <MapPin size={16} className="text-red-400" />
                Q1 2026 Rocks
              </h3>
              <div className="space-y-2">
                {[
                  { rock: 'Закрыть 50 новых клиентов', owner: 'Sales', progress: 68 },
                  { rock: 'Релиз v2.0 платформы', owner: 'Product', progress: 45 },
                  { rock: 'Нанять 5 инженеров', owner: 'HR', progress: 80 },
                ].map((item, i) => (
                  <div key={i} className="p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-white text-sm">{item.rock}</span>
                      <span className="text-slate-400 text-xs">{item.owner}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full" 
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                    <p className="text-slate-400 text-xs mt-1">{item.progress}%</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Issues List */}
            <div>
              <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                <DollarSign size={16} className="text-amber-400" />
                Top Issues
              </h3>
              <div className="space-y-2">
                {['Высокий churn в Казахстане', 'Нехватка senior разработчиков', 'Задержки платежей'].map((issue, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                    <span className="text-amber-400 text-sm">!</span>
                    <span className="text-slate-300 text-sm">{issue}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

