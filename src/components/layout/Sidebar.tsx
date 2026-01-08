'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  TrendingUp,
  Wallet,
  FileText,
  Calculator,
  ClipboardList,
  Users,
  Target,
  AlertTriangle,
  BarChart3,
  Trophy,
  Settings,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  children?: NavItem[]
}

const navigation: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/',
    icon: <LayoutDashboard size={20} />,
  },
  {
    label: 'Ввод данных',
    href: '/data-entry',
    icon: <TrendingUp size={20} />,
    children: [
      { label: 'Продажи', href: '/data-entry/sales', icon: <TrendingUp size={18} /> },
      { label: 'Расходы', href: '/data-entry/expenses', icon: <Wallet size={18} /> },
    ],
  },
  {
    label: 'Cash Flow',
    href: '/cash-flow',
    icon: <Wallet size={20} />,
  },
  {
    label: 'Отчёты',
    href: '/reports',
    icon: <FileText size={20} />,
    children: [
      { label: 'P&L', href: '/reports/pl', icon: <FileText size={18} /> },
      { label: 'Unit Economics', href: '/reports/unit-economics', icon: <Calculator size={18} /> },
      { label: 'План-Факт', href: '/reports/plan-fact', icon: <ClipboardList size={18} /> },
    ],
  },
  {
    label: 'Персонал',
    href: '/staff',
    icon: <Users size={20} />,
  },
  {
    label: 'EOS',
    href: '/eos',
    icon: <Target size={20} />,
    children: [
      { label: 'V/TO', href: '/eos/vto', icon: <Target size={18} /> },
      { label: 'Rocks', href: '/eos/rocks', icon: <Trophy size={18} /> },
      { label: 'Scorecard', href: '/eos/scorecard', icon: <BarChart3 size={18} /> },
      { label: 'Issues', href: '/eos/issues', icon: <AlertTriangle size={18} /> },
      { label: 'People', href: '/eos/people', icon: <Users size={18} /> },
    ],
  },
  {
    label: 'C-Level KPI',
    href: '/clevel-kpi',
    icon: <BarChart3 size={20} />,
  },
  {
    label: 'TOP Clients',
    href: '/clients',
    icon: <Trophy size={20} />,
  },
  {
    label: 'Warnings',
    href: '/warnings',
    icon: <AlertTriangle size={20} />,
  },
  {
    label: 'Настройки',
    href: '/settings',
    icon: <Settings size={20} />,
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpand = (href: string) => {
    setExpandedItems(prev =>
      prev.includes(href) ? prev.filter(h => h !== href) : [...prev, href]
    )
  }

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-surface-900 border-r border-surface-700/50 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-surface-700/50">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <span className="text-xl font-bold text-white">D</span>
          </div>
          <div>
            <h1 className="font-bold text-lg text-white">Delever</h1>
            <p className="text-xs text-surface-400">Management System</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {navigation.map((item) => (
            <li key={item.href}>
              {item.children ? (
                <>
                  <button
                    onClick={() => toggleExpand(item.href)}
                    className={cn(
                      'nav-item w-full justify-between',
                      isActive(item.href) && 'active'
                    )}
                  >
                    <span className="flex items-center gap-3">
                      {item.icon}
                      {item.label}
                    </span>
                    <ChevronDown
                      size={16}
                      className={cn(
                        'transition-transform',
                        expandedItems.includes(item.href) && 'rotate-180'
                      )}
                    />
                  </button>
                  {expandedItems.includes(item.href) && (
                    <ul className="ml-4 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className={cn(
                              'nav-item text-sm',
                              pathname === child.href && 'active'
                            )}
                          >
                            {child.icon}
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <Link
                  href={item.href}
                  className={cn('nav-item', isActive(item.href) && 'active')}
                >
                  {item.icon}
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-surface-700/50">
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center">
            <span className="text-sm font-medium text-primary-500">A</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Admin</p>
            <p className="text-xs text-surface-400">Январь 2026</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

