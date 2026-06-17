"use client";

import { DashboardSidebar } from "@/components/sidebar";
import {
  ArrowDownRight,
  ArrowUpDown,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Check,
  ChevronDown,
  Download,
  Info,
  Landmark,
  Layers,
  ListFilter,
  Menu,
  RefreshCw,
  Search,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState, type ElementType } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type PeriodKey = "jun-2026" | "may-2026" | "q2-2026";
type CategoryFilter = "all" | "operating" | "financing" | "investing";
type ViewMode = "balance" | "movement";
type Trend = "up" | "down" | "neutral";

type ReportArea = {
  key: string;
  label: string;
  helper: string;
  category: Exclude<CategoryFilter, "all">;
  currentAmount: number;
  previousAmount: number;
  movement: number;
  status: "healthy" | "watch" | "steady";
};

const periodOptions: Array<{ key: PeriodKey; label: string; helper: string }> = [
  { key: "jun-2026", label: "Jun 2026", helper: "Current month" },
  { key: "may-2026", label: "May 2026", helper: "Previous month" },
  { key: "q2-2026", label: "Q2 2026", helper: "Quarter view" },
];

const categoryOptions: Array<{ key: CategoryFilter; label: string; helper: string; color: string }> = [
  { key: "all", label: "All categories", helper: "Operating, investing, financing", color: "#d1d0ce" },
  { key: "operating", label: "Operating", helper: "Daily cash movement", color: "#1f7a4d" },
  { key: "investing", label: "Investing", helper: "Asset and deposit movement", color: "#2563eb" },
  { key: "financing", label: "Financing", helper: "Capital and owner movement", color: "#7c3aed" },
];

const balanceSeries = [
  { day: "1 Jun", balance: 112200, inflow: 12600, outflow: 9800 },
  { day: "4 Jun", balance: 114600, inflow: 9200, outflow: 6800 },
  { day: "7 Jun", balance: 118600, inflow: 14800, outflow: 10800 },
  { day: "10 Jun", balance: 118300, inflow: 7400, outflow: 7700 },
  { day: "13 Jun", balance: 117500, inflow: 6800, outflow: 7600 },
  { day: "16 Jun", balance: 120500, inflow: 15100, outflow: 12100 },
  { day: "19 Jun", balance: 123500, inflow: 13600, outflow: 10600 },
  { day: "22 Jun", balance: 123100, inflow: 8600, outflow: 9000 },
  { day: "25 Jun", balance: 122700, inflow: 8100, outflow: 8500 },
  { day: "28 Jun", balance: 125600, inflow: 12900, outflow: 10000 },
  { day: "30 Jun", balance: 128450, inflow: 11150, outflow: 8300 },
];

const accountBalances = [
  { id: "maybank-current", name: "Maybank Current Acc", number: "5621 **** 1234", balance: 84320.5, currency: "MYR", delta: 8.4 },
  { id: "cimb-savings", name: "CIMB Savings Acc", number: "8012 **** 7890", balance: 28740, currency: "MYR", delta: 2.1 },
  { id: "usd-operating", name: "USD Operating Acc", number: "USD-0021-8834", balance: 15389.5, currency: "USD", delta: -1.6 },
  { id: "fixed-deposit", name: "Maybank Fixed Deposit", number: "FD-5521-0012", balance: 50000, currency: "MYR", delta: 0 },
];

const expenseBreakdown = [
  { label: "Staff Cost", amount: 18000, share: 59 },
  { label: "Rental", amount: 4500, share: 15 },
  { label: "Tax Expense", amount: 3400, share: 11 },
  { label: "Staff Allowance", amount: 2400, share: 8 },
  { label: "Utilities", amount: 855, share: 3 },
  { label: "Communication", amount: 320, share: 1 },
];

const reportData = {
  openingCash: 112200,
  cashIn: 119650,
  cashOut: 91200,
  arDue: 38420,
  apDue: 22180,
  bankBalance: 128450,
};

const reportAreas: ReportArea[] = [
  {
    key: "cash-position",
    label: "Cash Position",
    helper: "Month-end cash available",
    category: "operating",
    currentAmount: 128450,
    previousAmount: 112200,
    movement: 14.5,
    status: "healthy",
  },
  {
    key: "cash-received",
    label: "Cash Received",
    helper: "Receipts cleared in period",
    category: "operating",
    currentAmount: 119650,
    previousAmount: 106420,
    movement: 12.4,
    status: "healthy",
  },
  {
    key: "cash-paid",
    label: "Cash Paid",
    helper: "Payments released in period",
    category: "operating",
    currentAmount: 91200,
    previousAmount: 95210,
    movement: -4.2,
    status: "healthy",
  },
  {
    key: "reserve-funds",
    label: "Reserve Funds",
    helper: "Deposits and held balances",
    category: "investing",
    currentAmount: 50000,
    previousAmount: 42400,
    movement: 17.9,
    status: "steady",
  },
  {
    key: "capital-movement",
    label: "Capital Movement",
    helper: "Owner and financing movement",
    category: "financing",
    currentAmount: 13600,
    previousAmount: 9500,
    movement: 43.2,
    status: "watch",
  },
  {
    key: "monthly-expenses",
    label: "Monthly Expenses",
    helper: "Configured expense categories",
    category: "operating",
    currentAmount: 29475,
    previousAmount: 31240,
    movement: -5.7,
    status: "healthy",
  },
];

const categoryLabels: Record<Exclude<CategoryFilter, "all">, string> = {
  operating: "Operating",
  investing: "Investing",
  financing: "Financing",
};

function formatMoney(value: number, currency = "RM") {
  return `${currency} ${value.toLocaleString("en-MY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatAxisMoney(value: number) {
  return `${Math.round(value / 1000)}k`;
}

function getTrendStyle(trend: Trend) {
  if (trend === "up") return "text-[#1f7a4d]";
  if (trend === "down") return "text-[#b91c1c]";
  return "text-[#2c2c2b]";
}

function CashTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-[8px] bg-[#2c2c2b] px-3 py-2 shadow-[0_4px_16px_rgba(15,15,15,0.22)]">
      <p className="text-[11px] font-medium text-[#a39e98]">{label}</p>
      {payload.map((item) => (
        <p key={item.dataKey ?? item.value} className="mt-0.5 text-[13px] font-semibold tabular-nums text-white">
          {item.dataKey === "outflow" ? "Cash Paid" : item.dataKey === "inflow" ? "Cash Received" : "Cash Position"}:{" "}
          {formatMoney(item.value, "RM")}
        </p>
      ))}
    </div>
  );
}

function MetricCell({
  label,
  value,
  helper,
  trend,
  Icon,
}: {
  label: string;
  value: string;
  helper: string;
  trend: Trend;
  Icon: ElementType;
}) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : ArrowUpDown;

  return (
    <div className="relative min-w-0 px-[var(--dashboard-main-x)] py-4">
      <div className="flex items-center gap-2">
        <span className="flex size-[26px] shrink-0 items-center justify-center rounded-[7px] bg-[#f6f5f4]">
          <Icon size={13} strokeWidth={1.9} className="text-[#8f8983]" aria-hidden="true" />
        </span>
        <span className="truncate text-[11px] font-semibold uppercase tracking-[0.45px] text-[#a39e98]">
          {label}
        </span>
      </div>
      <p className={`mt-3 truncate text-[22px] font-semibold tabular-nums leading-7 ${getTrendStyle(trend)}`}>
        {value}
      </p>
      <p className="mt-1 flex items-center gap-1 truncate text-[12px] text-[#8f8983]">
        <TrendIcon size={11} strokeWidth={2} className={`shrink-0 ${getTrendStyle(trend)}`} aria-hidden="true" />
        <span className="truncate">{helper}</span>
      </p>
    </div>
  );
}

function CategoryPill({ category }: { category: Exclude<CategoryFilter, "all"> }) {
  const style =
    {
      operating: "bg-[#e9f7ef] text-[#1f7a4d]",
      investing: "bg-[#eff6ff] text-[#1d4ed8]",
      financing: "bg-[#f3f0ff] text-[#7c3aed]",
    }[category] ?? "bg-[#f1f0ee] text-[#5f5e59]";

  return (
    <span className={`inline-flex h-6 items-center rounded-[6px] px-2 text-[12px] font-semibold ${style}`}>
      {categoryLabels[category]}
    </span>
  );
}

export default function CashflowReportPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [period, setPeriod] = useState<PeriodKey>("jun-2026");
  const [viewMode, setViewMode] = useState<ViewMode>("balance");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [selectedAccountId, setSelectedAccountId] = useState(accountBalances[0].id);
  const [selectedAreaKey, setSelectedAreaKey] = useState(reportAreas[0].key);
  const [isPeriodMenuOpen, setIsPeriodMenuOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const periodMenuRef = useRef<HTMLDivElement>(null);
  const categoryMenuRef = useRef<HTMLDivElement>(null);

  const currentPeriod = periodOptions.find((option) => option.key === period) ?? periodOptions[0];
  const currentCategory = categoryOptions.find((option) => option.key === categoryFilter) ?? categoryOptions[0];
  const selectedAccount = accountBalances.find((account) => account.id === selectedAccountId) ?? accountBalances[0];
  const selectedArea = reportAreas.find((area) => area.key === selectedAreaKey) ?? reportAreas[0];
  const filteredAreas = useMemo(
    () =>
      categoryFilter === "all"
        ? reportAreas
        : reportAreas.filter((area) => area.category === categoryFilter),
    [categoryFilter],
  );

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (!periodMenuRef.current?.contains(target)) setIsPeriodMenuOpen(false);
      if (!categoryMenuRef.current?.contains(target)) setIsCategoryMenuOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const cashReceived = reportData.cashIn;
  const cashPaid = reportData.cashOut;
  const netChange = cashReceived - cashPaid;
  const motionTransition = {
    duration: shouldReduceMotion ? 0 : 0.22,
    ease: [0.22, 1, 0.36, 1] as const,
  };

  return (
    <div className="dashboard-shell h-screen overflow-hidden bg-white md:flex">
      <DashboardSidebar
        activeItem="cashflow-report"
        isMobileOpen={isSidebarOpen}
        onMobileClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
        <main className="min-w-0 flex-1 overflow-hidden bg-white text-[#2c2c2b]">
          <section className="flex h-screen min-h-0 flex-col">
            <header className="flex h-[var(--dashboard-header-h)] shrink-0 items-center justify-between border-b border-[#e6e6e6] px-[var(--dashboard-main-x)]">
              <div className="flex min-w-0 items-center gap-2">
                <button
                  type="button"
                  aria-label="Open navigation"
                  onClick={() => setIsSidebarOpen(true)}
                  className="flex size-7 shrink-0 items-center justify-center rounded-[7px] text-[#6f6a64] outline-none transition-colors duration-75 hover:bg-[#ededee] hover:text-[#2c2c2b] xl:hidden"
                >
                  <Menu size={18} strokeWidth={1.8} aria-hidden="true" />
                </button>
                <h1 className="truncate text-[20px] font-semibold leading-7 text-[#2c2c2b]">
                  Cashflow Report
                </h1>
                <div className="group relative flex shrink-0 items-center">
                  <button
                    type="button"
                    aria-label="About Cashflow Report"
                    className="flex items-center justify-center text-[#c9c4bf] outline-none transition-colors duration-75 hover:text-[#8f8983]"
                  >
                    <Info size={15} strokeWidth={1.7} aria-hidden="true" />
                  </button>
                  <div className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 w-max max-w-[230px] -translate-x-1/2 rounded-[8px] bg-[#2c2c2b] px-3 py-2 text-[12px] leading-[1.45] text-white opacity-0 shadow-[0_4px_16px_rgba(15,15,15,0.18)] transition-opacity duration-150 group-hover:opacity-100">
                    Review cash position, inflows, outflows, and bank account movement.
                    <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-[#2c2c2b]" />
                  </div>
                </div>
              </div>

              <div className="hidden items-center gap-2 sm:flex">
                <button
                  type="button"
                  className="inline-flex h-7 items-center gap-1.5 rounded-[7px] border border-[#e6e6e6] bg-white px-2.5 text-[13px] font-medium leading-5 text-[#2c2c2b] outline-none transition-colors duration-75 hover:bg-[#f7f7f8]"
                >
                  <RefreshCw size={13} strokeWidth={1.8} aria-hidden="true" />
                  Refresh
                </button>
                <button
                  type="button"
                  className="inline-flex h-7 items-center gap-1.5 rounded-[7px] bg-[#2783DE] px-2.5 text-[13px] font-medium leading-5 text-white shadow-[0_1px_1px_rgba(39,131,222,0.16)] outline-none transition-colors duration-75 hover:bg-[#1f76c9]"
                >
                  <Download size={13} strokeWidth={1.8} aria-hidden="true" />
                  Export
                </button>
              </div>
            </header>

            <div className="flex h-auto min-h-[var(--dashboard-toolbar-h)] flex-wrap items-center gap-2 px-[var(--dashboard-main-x)] py-2">
              <div ref={periodMenuRef} className="relative">
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={isPeriodMenuOpen}
                  onClick={() => setIsPeriodMenuOpen((open) => !open)}
                  className="inline-flex h-8 items-center gap-1.5 rounded-[7px] border border-[#e6e6e6] bg-white px-3 text-[14px] font-medium leading-5 text-[#2c2c2b] outline-none transition-colors duration-75 hover:bg-[#f7f7f8] focus-visible:ring-1 focus-visible:ring-black/5"
                >
                  <CalendarDays size={13} strokeWidth={1.8} aria-hidden="true" />
                  {currentPeriod.label}
                  <ChevronDown size={13} strokeWidth={1.8} className="text-[#8f8983]" aria-hidden="true" />
                </button>
                <AnimatePresence>
                  {isPeriodMenuOpen ? (
                    <motion.div
                      role="menu"
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute left-0 top-9 z-20 w-[210px] origin-top-left rounded-[10px] border border-[#e6e6e6] bg-white p-1 shadow-[0_12px_28px_rgba(15,15,15,0.11)]"
                      exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -4 }}
                      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : -6 }}
                      transition={motionTransition}
                    >
                      {periodOptions.map((option) => (
                        <button
                          key={option.key}
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setPeriod(option.key);
                            setIsPeriodMenuOpen(false);
                          }}
                          className="flex min-h-9 w-full items-center justify-between gap-3 rounded-[7px] px-2 text-left outline-none transition-colors duration-75 hover:bg-[#f6f5f4]"
                        >
                          <span className="min-w-0">
                            <span className="block truncate text-[13px] font-medium leading-5 text-[#2c2c2b]">
                              {option.label}
                            </span>
                            <span className="block truncate text-[11px] font-medium leading-4 text-[#8f8983]">
                              {option.helper}
                            </span>
                          </span>
                          {period === option.key ? (
                            <Check size={13} strokeWidth={2} className="shrink-0 text-[#0075de]" aria-hidden="true" />
                          ) : null}
                        </button>
                      ))}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>

              <div className="inline-flex h-8 rounded-[8px] border border-[#e6e6e6] bg-white p-0.5">
                {[
                  { key: "balance" as const, label: "Balance", Icon: BarChart3 },
                  { key: "movement" as const, label: "Cash In/Out", Icon: ArrowUpDown },
                ].map((item) => {
                  const Icon = item.Icon;
                  const isActive = viewMode === item.key;

                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setViewMode(item.key)}
                      className={`inline-flex h-7 items-center gap-1.5 rounded-[6px] px-2.5 text-[13px] font-medium transition-colors duration-75 ${
                        isActive ? "bg-[#0075de] text-white" : "text-[#5f5e59] hover:bg-[#f6f5f4] hover:text-[#2c2c2b]"
                      }`}
                    >
                      <Icon size={13} strokeWidth={1.8} aria-hidden="true" />
                      {item.label}
                    </button>
                  );
                })}
              </div>

              <div ref={categoryMenuRef} className="relative">
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={isCategoryMenuOpen}
                  onClick={() => setIsCategoryMenuOpen((open) => !open)}
                  className="inline-flex h-8 items-center gap-1.5 rounded-[7px] border border-[#e6e6e6] bg-white px-3 text-[14px] font-medium leading-5 text-[#2c2c2b] outline-none transition-colors duration-75 hover:bg-[#f7f7f8] focus-visible:ring-1 focus-visible:ring-black/5"
                >
                  <ListFilter size={13} strokeWidth={1.8} aria-hidden="true" />
                  Type
                  <span className="text-[#a39e98]">is</span>
                  {currentCategory.label}
                </button>
                <AnimatePresence>
                  {isCategoryMenuOpen ? (
                    <motion.div
                      role="menu"
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute left-0 top-9 z-20 w-[260px] origin-top-left rounded-[10px] border border-[#e6e6e6] bg-white p-1 shadow-[0_12px_28px_rgba(15,15,15,0.11)]"
                      exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -4 }}
                      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : -6 }}
                      transition={motionTransition}
                    >
                      {categoryOptions.map((option) => (
                        <button
                          key={option.key}
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setCategoryFilter(option.key);
                            setIsCategoryMenuOpen(false);
                          }}
                          className="flex min-h-9 w-full items-center justify-between gap-3 rounded-[7px] px-2 text-left outline-none transition-colors duration-75 hover:bg-[#f6f5f4]"
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: option.color }} />
                            <span className="min-w-0">
                              <span className="block truncate text-[13px] font-medium leading-5 text-[#2c2c2b]">
                                {option.label}
                              </span>
                              <span className="block truncate text-[11px] font-medium leading-4 text-[#8f8983]">
                                {option.helper}
                              </span>
                            </span>
                          </span>
                          {categoryFilter === option.key ? (
                            <Check size={13} strokeWidth={2} className="shrink-0 text-[#0075de]" aria-hidden="true" />
                          ) : null}
                        </button>
                      ))}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>

              <label className="relative ml-auto w-[var(--dashboard-toolbar-search-w)] max-w-full shrink">
                <span className="sr-only">Search report rows</span>
                <Search
                  size={14}
                  strokeWidth={1.8}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8f8983]"
                />
                <input
                  type="search"
                  placeholder="Search cashflow..."
                  className="h-8 w-full rounded-[7px] border border-[#e6e6e6] bg-white pl-8.5 pr-2 text-[14px] leading-5 text-[#2c2c2b] outline-none transition-colors duration-75 placeholder:text-[#a39e98] focus:border-[#0075de] focus:ring-2 focus:ring-[#62aef0]/20"
                />
              </label>
            </div>
            <div className="mx-[var(--dashboard-main-x)] border-b border-[#e6e6e6]" />

            <div className="grid shrink-0 grid-cols-1 divide-y divide-[#e6e6e6] sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4">
              <MetricCell
                label="Closing Balance"
                value={formatMoney(128450)}
                helper="As of 30 Jun 2026"
                trend="neutral"
                Icon={Wallet}
              />
              <MetricCell
                label="Cash Received"
                value={formatMoney(cashReceived)}
                helper="+12.4% vs last month"
                trend="up"
                Icon={ArrowUpRight}
              />
              <MetricCell
                label="Cash Paid"
                value={formatMoney(cashPaid)}
                helper="-4.2% under budget"
                trend="down"
                Icon={ArrowDownRight}
              />
              <MetricCell
                label="Net Change"
                value={`+${formatMoney(netChange)}`}
                helper="Healthy cash runway"
                trend="up"
                Icon={TrendingUp}
              />
            </div>
            <div className="mx-[var(--dashboard-main-x)] border-b border-[#e6e6e6]" />

            <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="flex min-h-0 min-w-0 flex-col overflow-hidden xl:border-r xl:border-[#e6e6e6]">
                <motion.div
                  className="shrink-0 px-[var(--dashboard-main-x)] py-6"
                  initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={motionTransition}
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate text-[14px] font-semibold leading-5 text-[#2c2c2b]">
                        {viewMode === "balance" ? "Daily Cash Balance" : "Cash Received vs Cash Paid"}
                      </h2>
                      <p className="mt-0.5 text-[12px] leading-4 text-[#8f8983]">
                        {currentPeriod.label} cash movement across selected bank accounts
                      </p>
                    </div>
                    <span className="hidden h-6 items-center rounded-[6px] bg-[#e9f7ef] px-2 text-[12px] font-semibold text-[#1f7a4d] sm:inline-flex">
                      Reconciled
                    </span>
                  </div>

                  <div className="h-[320px] w-full outline-none [&_*]:outline-none [&_svg]:outline-none">
                    <ResponsiveContainer width="100%" height="100%">
                      {viewMode === "balance" ? (
                        <AreaChart data={balanceSeries} margin={{ top: 8, right: 6, left: 4, bottom: 0 }}>
                          <defs>
                            <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#2783DE" stopOpacity={0.26} />
                              <stop offset="100%" stopColor="#2783DE" stopOpacity={0.03} />
                            </linearGradient>
                          </defs>
                          <XAxis
                            dataKey="day"
                            axisLine={{ stroke: "#e6e6e6", strokeWidth: 1 }}
                            tickLine={false}
                            tick={{ fill: "#5f5e59", fontSize: 12, fontWeight: 500 }}
                            dy={8}
                          />
                          <YAxis
                            domain={[108000, 132000]}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#5f5e59", fontSize: 12, fontWeight: 500 }}
                            tickFormatter={formatAxisMoney}
                            width={42}
                          />
                          <Tooltip content={<CashTooltip />} cursor={{ stroke: "#e6e6e6", strokeWidth: 1 }} />
                          <Area
                            type="monotone"
                            dataKey="balance"
                            stroke="#2783DE"
                            strokeWidth={2}
                            fill="url(#balanceGradient)"
                            dot={false}
                            activeDot={{ r: 4, fill: "#2783DE", strokeWidth: 0 }}
                          />
                        </AreaChart>
                      ) : (
                        <BarChart data={balanceSeries} margin={{ top: 8, right: 6, left: 4, bottom: 0 }}>
                          <XAxis
                            dataKey="day"
                            axisLine={{ stroke: "#e6e6e6", strokeWidth: 1 }}
                            tickLine={false}
                            tick={{ fill: "#5f5e59", fontSize: 12, fontWeight: 500 }}
                            dy={8}
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#5f5e59", fontSize: 12, fontWeight: 500 }}
                            tickFormatter={formatAxisMoney}
                            width={42}
                          />
                          <Tooltip content={<CashTooltip />} cursor={{ fill: "#f7f7f8" }} />
                          <Bar dataKey="inflow" fill="#1f7a4d" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="outflow" fill="#b91c1c" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                <div className="mx-[var(--dashboard-main-x)] border-b border-[#e6e6e6]" />

                <div className="min-h-0 flex-1 overflow-auto px-[var(--dashboard-main-x)]">
                  <table className="w-full min-w-[820px] table-fixed border-separate border-spacing-0 text-left">
                    <thead className="sticky top-0 z-10 bg-white">
                      <tr>
                        {[
                          { label: "Report Area", icon: Layers, width: "w-[280px]" },
                          { label: "Type", icon: ListFilter, width: "w-[140px]" },
                          { label: "Current", icon: Wallet, width: "w-[150px]" },
                          { label: "Previous", icon: CalendarDays, width: "w-[150px]" },
                          { label: "Movement", icon: ArrowUpDown, width: "w-[130px]" },
                          { label: "Status", icon: Check, width: "w-[120px]" },
                        ].map((column, index, columns) => {
                          const Icon = column.icon;
                          const isLast = index === columns.length - 1;
                          const isAmount = ["Current", "Previous", "Movement"].includes(column.label);

                          return (
                            <th
                              key={column.label}
                              scope="col"
                              className={`${column.width} h-[var(--dashboard-head-h)] border-b ${
                                isLast ? "" : "border-r"
                              } border-[#e6e6e6] px-3 text-[14px] font-medium leading-5 text-[#2c2c2b] ${
                                isAmount ? "text-right" : ""
                              }`}
                            >
                              <span className={`flex items-center gap-1.5 ${isAmount ? "justify-end" : ""}`}>
                                <Icon size={14} strokeWidth={1.75} aria-hidden="true" className="text-[#2c2c2b]" />
                                {column.label}
                              </span>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAreas.map((area, index) => {
                        const isSelected = selectedAreaKey === area.key;
                        const movementTone =
                          area.movement > 0
                            ? "text-[#1f7a4d]"
                            : area.movement < 0
                              ? "text-[#b91c1c]"
                              : "text-[#5f5e59]";
                        const statusStyle =
                          {
                            healthy: "bg-[#e9f7ef] text-[#1f7a4d]",
                            watch: "bg-[#fff4db] text-[#9a6700]",
                            steady: "bg-[#f1f0ee] text-[#5f5e59]",
                          }[area.status] ?? "bg-[#f1f0ee] text-[#5f5e59]";

                        return (
                          <motion.tr
                            key={area.key}
                            animate={{ opacity: 1, x: 0 }}
                            className={`group h-[var(--dashboard-row-h)] transition-colors duration-75 ${
                              isSelected ? "bg-[#f7fbff]" : "bg-white hover:bg-[#f7f7f8]"
                            }`}
                            initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -18 }}
                            transition={{
                              delay: shouldReduceMotion ? 0 : index * 0.035,
                              duration: shouldReduceMotion ? 0 : 0.2,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                          >
                            <td className="border-b border-r border-[#f0efed] px-3">
                              <button
                                type="button"
                                onClick={() => setSelectedAreaKey(area.key)}
                                className="block min-w-0 text-left outline-none"
                              >
                                <span className="block truncate text-[14px] font-medium leading-5 text-[#0075de]">
                                  {area.label}
                                </span>
                                <span className="block truncate text-[12px] leading-4 text-[#8f8983]">
                                  {area.helper}
                                </span>
                              </button>
                            </td>
                            <td className="border-b border-r border-[#f0efed] px-3">
                              <CategoryPill category={area.category} />
                            </td>
                            <td className="border-b border-r border-[#f0efed] px-3 text-right text-[13px] font-semibold tabular-nums text-[#2c2c2b]">
                              {formatMoney(area.currentAmount)}
                            </td>
                            <td className="border-b border-r border-[#f0efed] px-3 text-right text-[13px] font-semibold tabular-nums text-[#5f5e59]">
                              {formatMoney(area.previousAmount)}
                            </td>
                            <td className={`border-b border-r border-[#f0efed] px-3 text-right text-[13px] font-semibold tabular-nums ${movementTone}`}>
                              {area.movement > 0 ? "+" : ""}
                              {area.movement.toFixed(1)}%
                            </td>
                            <td className="border-b border-[#f0efed] px-3">
                              <span className={`inline-flex h-6 items-center rounded-[6px] px-2 text-[12px] font-semibold capitalize ${statusStyle}`}>
                                {area.status}
                              </span>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <aside className="h-full min-h-0 overflow-y-auto bg-white">
                <div className="flex h-[var(--dashboard-toolbar-h)] items-center justify-between border-b border-[#e6e6e6] px-5">
                  <h2 className="text-[13px] font-semibold text-[#2c2c2b]">Bank Accounts</h2>
                  <span className="text-[11px] text-[#8f8983]">{currentPeriod.label}</span>
                </div>

                <div className="divide-y divide-[#f0efed]">
                  {accountBalances.map((account) => {
                    const isSelected = selectedAccountId === account.id;
                    const isUsd = account.currency === "USD";

                    return (
                      <button
                        key={account.id}
                        type="button"
                        onClick={() => setSelectedAccountId(account.id)}
                        className={`flex w-full items-center gap-3 px-5 py-3 text-left outline-none transition-colors duration-75 ${
                          isSelected ? "bg-[#f7fbff]" : "hover:bg-[#f7f7f8]"
                        }`}
                      >
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-[8px] bg-[#f6f5f4]">
                          <Landmark size={15} strokeWidth={1.8} className="text-[#6f6a64]" aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-medium text-[#2c2c2b]">{account.name}</span>
                          <span className="mt-0.5 block truncate text-[11px] text-[#8f8983]">{account.number}</span>
                        </span>
                        <span className="shrink-0 text-right">
                          <span className="block text-[12px] font-semibold tabular-nums text-[#2c2c2b]">
                            {formatMoney(account.balance, isUsd ? "USD" : "RM")}
                          </span>
                          <span className={`mt-0.5 block text-[11px] ${account.delta < 0 ? "text-[#b91c1c]" : "text-[#1f7a4d]"}`}>
                            {account.delta === 0 ? "0.0%" : `${account.delta > 0 ? "+" : ""}${account.delta}%`}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between border-y border-[#e6e6e6] bg-[#f6f5f4] px-5 py-3">
                  <span className="text-[12px] font-medium text-[#8f8983]">Selected account</span>
                  <span className="text-[12px] font-semibold tabular-nums text-[#2c2c2b]">
                    {formatMoney(selectedAccount.balance, selectedAccount.currency === "USD" ? "USD" : "RM")}
                  </span>
                </div>

                <div className="flex h-[var(--dashboard-toolbar-h)] items-center justify-between border-b border-[#e6e6e6] px-5">
                  <h2 className="text-[13px] font-semibold text-[#2c2c2b]">Expense Mix</h2>
                  <span className="text-[11px] text-[#8f8983]">RM 29,475.00</span>
                </div>

                <div className="divide-y divide-[#f0efed]">
                  {expenseBreakdown.map((expense) => (
                    <div key={expense.label} className="px-5 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="truncate text-[13px] font-medium text-[#5f5e59]">{expense.label}</span>
                        <span className="shrink-0 text-[12px] font-semibold tabular-nums text-[#2c2c2b]">
                          {formatMoney(expense.amount)}
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#f1f0ee]">
                        <div className="h-full rounded-full bg-[#2783DE]" style={{ width: `${expense.share}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[#e6e6e6] px-5 py-4">
                  <div className="rounded-[8px] border border-[#e6e6e6] bg-white p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[12px] font-semibold text-[#8f8983]">Report Focus</span>
                      <CategoryPill category={selectedArea.category} />
                    </div>
                    <p className="mt-2 truncate text-[14px] font-semibold text-[#2c2c2b]">{selectedArea.label}</p>
                    <p className="mt-1 text-[12px] text-[#8f8983]">{selectedArea.helper}</p>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
                      <span className="rounded-[7px] bg-[#eff6ff] px-2 py-1.5 font-semibold tabular-nums text-[#1d4ed8]">
                        Current {formatMoney(selectedArea.currentAmount)}
                      </span>
                      <span className="rounded-[7px] bg-[#f6f5f4] px-2 py-1.5 text-right font-semibold tabular-nums text-[#5f5e59]">
                        Last {formatMoney(selectedArea.previousAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
