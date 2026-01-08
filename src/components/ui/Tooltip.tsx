'use client'

import { useState, ReactNode } from 'react'
import { HelpCircle } from 'lucide-react'

interface TooltipProps {
  content: string | ReactNode
  children?: ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  showIcon?: boolean
}

export function Tooltip({ content, children, position = 'top', showIcon = true }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-slate-700',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-slate-700',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-slate-700',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-slate-700',
  }

  return (
    <div 
      className="relative inline-flex items-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children || (showIcon && (
        <HelpCircle className="w-4 h-4 text-slate-500 hover:text-slate-400 cursor-help" />
      ))}
      
      {isVisible && (
        <div 
          className={`absolute z-50 px-3 py-2 text-sm text-white bg-slate-700 rounded-lg shadow-lg whitespace-normal max-w-xs ${positionClasses[position]}`}
        >
          {content}
          <div 
            className={`absolute w-0 h-0 border-4 border-transparent ${arrowClasses[position]}`}
          />
        </div>
      )}
    </div>
  )
}

// Metric explanations
export const metricTooltips = {
  mrr: 'Monthly Recurring Revenue — ежемесячный повторяющийся доход от подписок клиентов. Ключевой показатель SaaS бизнеса.',
  arr: 'Annual Recurring Revenue — годовой повторяющийся доход. ARR = MRR × 12',
  arpu: 'Average Revenue Per User — средний доход на одного клиента. ARPU = MRR / Количество активных клиентов',
  churnRate: 'Churn Rate — процент клиентов, которые прекратили подписку за период. Здоровый показатель < 5%',
  ltv: 'Lifetime Value — пожизненная ценность клиента. Сколько денег в среднем приносит один клиент за всё время работы с компанией.',
  cac: 'Customer Acquisition Cost — стоимость привлечения одного клиента. CAC = Расходы на маркетинг / Количество новых клиентов',
  ltvCac: 'LTV/CAC Ratio — соотношение ценности клиента к стоимости привлечения. Здоровый показатель > 3x',
  payback: 'Payback Period — срок окупаемости клиента. Количество месяцев, за которые клиент вернёт затраты на его привлечение.',
  runway: 'Runway — количество месяцев, на которые хватит текущих денежных средств при текущем темпе расходов.',
  burnRate: 'Burn Rate — скорость расходования денежных средств. Сколько компания тратит в месяц.',
  grossMargin: 'Gross Margin — валовая маржа. Процент выручки, оставшийся после вычета прямых затрат.',
  netMargin: 'Net Margin — чистая маржа. Процент выручки, оставшийся после всех расходов и налогов.',
  ebitda: 'EBITDA — прибыль до вычета процентов, налогов, износа и амортизации. Показывает операционную эффективность.',
  mom: 'Month over Month — рост по сравнению с предыдущим месяцем.',
  yoy: 'Year over Year — рост по сравнению с аналогичным периодом прошлого года.',
  nrr: 'Net Revenue Retention — чистое удержание дохода. Показывает, сколько дохода сохранилось от существующих клиентов включая апсейлы.',
  grr: 'Gross Revenue Retention — валовое удержание дохода. Показывает, сколько дохода сохранилось без учёта апсейлов.',
}

export function MetricTooltip({ metric, children }: { metric: keyof typeof metricTooltips, children?: ReactNode }) {
  return (
    <Tooltip content={metricTooltips[metric]}>
      {children}
    </Tooltip>
  )
}

