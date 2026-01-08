# 📊 Delever Management System

Финансовая система управления и аналитики для Delever.

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
cd delever-app
npm install
```

### 2. Инициализация базы данных

```bash
# Создать таблицы
npx prisma db push

# Заполнить начальными данными
npm run db:seed
```

### 3. Запуск приложения

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

---

## 📁 Структура проекта

```
delever-app/
├── prisma/
│   ├── schema.prisma      # Схема БД (29 таблиц)
│   └── seed.ts            # Начальные данные
├── src/
│   ├── app/               # Next.js pages
│   │   ├── page.tsx       # Dashboard
│   │   ├── data-entry/    # Ввод данных
│   │   │   ├── sales/     # Продажи
│   │   │   └── expenses/  # Расходы
│   │   ├── reports/       # Отчёты
│   │   │   ├── pl/        # P&L
│   │   │   └── unit-economics/
│   │   ├── cash-flow/     # Cash Flow
│   │   ├── staff/         # Персонал
│   │   ├── eos/           # EOS модули
│   │   ├── clevel-kpi/    # C-Level KPI
│   │   ├── clients/       # TOP Clients
│   │   ├── warnings/      # Warnings
│   │   └── api/           # API routes
│   ├── components/        # React компоненты
│   │   ├── layout/        # Layout
│   │   ├── ui/            # UI компоненты
│   │   └── charts/        # Графики
│   └── lib/               # Утилиты
│       ├── db.ts          # Prisma client
│       └── utils.ts       # Helpers
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🗄️ База данных

29 таблиц:

### Основные
- `regions` - Регионы (UZ, KZ, KG, GE, AE, SA)
- `periods` - Периоды (месяцы)
- `monthly_data` - Данные по месяцам
- `staff` - Сотрудники
- `payments` - Cash Flow
- `budget_plan` - Бюджет

### EOS
- `vto` - Vision/Traction Organizer
- `rocks` - Квартальные приоритеты
- `weekly_scorecard` - Метрики
- `issues` - Проблемы
- `todos` - Задачи
- `meetings` - Level 10 встречи

### Расширенные
- `clevel_kpi` - KPI руководства
- `top_clients` - Топ клиенты
- `client_health_check` - Health Check
- `warnings` - Риски

---

## 📊 Функционал

### ✅ Реализовано

- [x] **Dashboard** - KPI cards, графики, виджеты
- [x] **Ввод продаж** - По регионам с авто-расчётами
- [x] **Ввод расходов** - По категориям
- [x] **P&L Report** - Полный отчёт с YTD
- [x] **API** - Sales, Expenses endpoints

### 🔄 В процессе

- [ ] Unit Economics страница
- [ ] Plan-Fact
- [ ] Cash Flow
- [ ] Staff management

### 📋 Планируется

- [ ] EOS модули (V/TO, Rocks, Scorecard)
- [ ] C-Level KPI Dashboard
- [ ] TOP Clients Health Check
- [ ] Warning List
- [ ] Excel Export

---

## 🛠️ Команды

```bash
# Разработка
npm run dev

# Сборка
npm run build

# Prisma
npm run db:generate  # Генерация клиента
npm run db:push      # Применить схему
npm run db:seed      # Заполнить данными
npm run db:studio    # Открыть Prisma Studio
```

---

## 📐 Формулы

```typescript
// MRR
MRR = SUM(revenue)

// Unit Economics
ARPU = Revenue / Clients
CAC = Marketing / NewClients
ChurnRate = Churned / (StartClients + NewClients) × 100
LTV = ARPU / ChurnRate
LTV/CAC = LTV / CAC

// P&L
EBITDA = Revenue - Expenses
NetProfit = EBITDA - Taxes

// Taxes (Uzbekistan)
ЯТТ = EBITDA × 3%
IT-park = EBITDA × 1%
ИНПС = Salary × 12%

// Runway
Runway = Cash / BurnRate
```

---

## 🎨 Технологии

- **Next.js 14** - React framework
- **Prisma** - ORM
- **SQLite** - Database
- **Tailwind CSS** - Styling
- **Recharts** - Charts
- **Lucide** - Icons

---

## 📄 Лицензия

Proprietary - Delever © 2026

