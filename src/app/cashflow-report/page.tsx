"use client";

import { DashboardSidebar } from "@/components/sidebar";
import { ArrowDownLeft, ArrowUpRight, ChevronLeft, ChevronRight, Menu } from "lucide-react";
import { motion } from "motion/react";
import React, { useState } from "react";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const reportData = {
  openingCash:  82220.75,
  cashIn:       45340.00,
  cashOut:      12840.00,
  arDue:        38420.00,
  apDue:        22180.00,
  bankBalance:  48320.75,
  expenses: [
    { label: "EPF",             amount:  3200.00, emoji: "🏛️" },
    { label: "SOCSO",           amount:   320.00, emoji: "🛡️" },
    { label: "Tax Expense",     amount:  1500.00, emoji: "📋" },
    { label: "Rental",          amount:  4500.00, emoji: "🏢" },
    { label: "Staff Cost",      amount: 28000.00, emoji: "👥" },
    { label: "Staff Allowance", amount:  2400.00, emoji: "💼" },
    { label: "Communication",   amount:   800.00, emoji: "📡" },
    { label: "Water Expense",   amount:   180.00, emoji: "💧" },
    { label: "Electricity",     amount:   650.00, emoji: "⚡" },
  ],
};

function fmt(n: number) {
  return n.toLocaleString("en-MY", { minimumFractionDigits: 2 });
}

function SectionLabel({ children, right }: Readonly<{ children: React.ReactNode; right?: React.ReactNode }>) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#a39e98]">{children}</p>
      {right}
    </div>
  );
}

function StatCard({
  label, value, sub, variant = "default",
}: Readonly<{
  label: string;
  value: string;
  sub?: string;
  variant?: "default" | "in" | "out" | "highlight";
}>) {
  const style: Record<string, string> = {
    default:   "border-[#e6e6e6]  bg-white        text-[#37352f]",
    in:        "border-[#bbf7d0]  bg-[#f0fdf4]    text-[#15803d]",
    out:       "border-[#fecaca]  bg-[#fff5f5]    text-[#dc2626]",
    highlight: "border-[#93c5fd]  bg-[#eff6ff]    text-[#1d4ed8]",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={`rounded-[10px] border px-5 py-4 ${style[variant]}`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.06em] opacity-60">{label}</p>
      <p className="mt-2 text-[20px] font-bold tabular-nums leading-tight">{value}</p>
      {sub && <p className="mt-1 text-[12px] opacity-50">{sub}</p>}
    </motion.div>
  );
}

function InfoCard({
  label, value, sub, subColor,
}: Readonly<{
  label: string;
  value: string;
  sub: string;
  subColor: string;
}>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-[10px] border border-[#e6e6e6] bg-white px-5 py-4"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#a39e98]">{label}</p>
      <p className="mt-1.5 text-[20px] font-bold tabular-nums text-[#37352f]">{value}</p>
      <p className="mt-1.5 text-[12px]" style={{ color: subColor }}>{sub}</p>
    </motion.div>
  );
}

function ExpenseRow({ emoji, label, amount }: Readonly<{ emoji: string; label: string; amount: number }>) {
  return (
    <div className="flex items-center gap-3 px-4 py-[9px]">
      <span className="flex size-7 shrink-0 select-none items-center justify-center rounded-[6px] bg-[#f1f0ee] text-[13px] leading-none">
        {emoji}
      </span>
      <span className="min-w-0 flex-1 truncate text-[13px] text-[#6b6b6b]">{label}</span>
      <span className="shrink-0 text-[13px] font-medium tabular-nums text-[#37352f]">
        {fmt(amount)}
      </span>
    </div>
  );
}

export default function CashflowReportPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const now = new Date();
  const [monthIdx, setMonthIdx] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());

  const closingCash = reportData.openingCash + reportData.cashIn - reportData.cashOut;
  const totalExpenses = reportData.expenses.reduce((s, e) => s + e.amount, 0);

  const prevMonth = () => {
    if (monthIdx === 0) { setMonthIdx(11); setYear((y) => y - 1); }
    else setMonthIdx((m) => m - 1);
  };
  const nextMonth = () => {
    if (monthIdx === 11) { setMonthIdx(0); setYear((y) => y + 1); }
    else setMonthIdx((m) => m + 1);
  };

  const expenseCols = [
    reportData.expenses.slice(0, 3),
    reportData.expenses.slice(3, 6),
    reportData.expenses.slice(6, 9),
  ];

  return (
    <div className="dashboard-shell min-h-screen bg-white md:flex">
      <DashboardSidebar
        activeItem="cashflow-report"
        isMobileOpen={isSidebarOpen}
        onMobileClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 overflow-hidden">
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-white text-[#2c2c2b]">

          {/* Toolbar */}
          <div className="flex h-[var(--dashboard-toolbar-h)] shrink-0 items-center justify-between border-b border-[#e6e6e6] px-[var(--dashboard-main-x)]">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="flex size-8 items-center justify-center rounded-md text-[#9b9a97] hover:bg-[#f1f0ee] md:hidden"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu size={18} />
              </button>
              <h1 className="text-[15px] font-semibold text-[#37352f]">Cashflow Report</h1>
            </div>

            {/* Month navigation */}
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={prevMonth}
                className="flex size-7 items-center justify-center rounded-[6px] text-[#9b9a97] transition-colors hover:bg-[#f1f0ee] hover:text-[#37352f]"
              >
                <ChevronLeft size={14} strokeWidth={2} />
              </button>
              <span className="min-w-[108px] text-center text-[13px] font-medium text-[#37352f]">
                {MONTHS[monthIdx]} {year}
              </span>
              <button
                type="button"
                onClick={nextMonth}
                className="flex size-7 items-center justify-center rounded-[6px] text-[#9b9a97] transition-colors hover:bg-[#f1f0ee] hover:text-[#37352f]"
              >
                <ChevronRight size={14} strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Body — no scroll */}
          <div className="flex flex-1 flex-col gap-5 overflow-hidden px-[var(--dashboard-main-x)] py-6">

            {/* Section 1 — Month-end Closing Cash */}
            <section className="shrink-0">
              <SectionLabel>Month-end Closing Cash</SectionLabel>
              <div className="grid grid-cols-4 gap-3">
                <StatCard
                  label="Opening Cash"
                  value={`RM ${fmt(reportData.openingCash)}`}
                />
                <StatCard
                  label="Cash In"
                  value={`+ RM ${fmt(reportData.cashIn)}`}
                  variant="in"
                />
                <StatCard
                  label="Cash Out"
                  value={`− RM ${fmt(reportData.cashOut)}`}
                  variant="out"
                />
                <StatCard
                  label="Closing Cash"
                  value={`RM ${fmt(closingCash)}`}
                  variant="highlight"
                  sub="End of month"
                />
              </div>
            </section>

            {/* Section 2 — AR Due / AP Due / Bank Balance */}
            <section className="shrink-0">
              <div className="grid grid-cols-3 gap-3">
                <InfoCard
                  label="AR Due"
                  value={`RM ${fmt(reportData.arDue)}`}
                  sub="↙ Receivable from customers"
                  subColor="#1d4ed8"
                />
                <InfoCard
                  label="AP Due"
                  value={`RM ${fmt(reportData.apDue)}`}
                  sub="↗ Payable to suppliers"
                  subColor="#dc2626"
                />
                <InfoCard
                  label="Bank Balance"
                  value={`RM ${fmt(reportData.bankBalance)}`}
                  sub="Across all accounts"
                  subColor="#9b9a97"
                />
              </div>
            </section>

            {/* Section 3 — Monthly Expenses */}
            <section className="flex min-h-0 flex-1 flex-col">
              <SectionLabel
                right={
                  <span className="text-[13px] font-semibold tabular-nums text-[#37352f]">
                    Total &nbsp;RM {fmt(totalExpenses)}
                  </span>
                }
              >
                Monthly Expenses
              </SectionLabel>
              <div className="grid grid-cols-3 gap-3">
                {expenseCols.map((col, ci) => (
                  <div
                    key={ci}
                    className="divide-y divide-[#f0efed] rounded-[10px] border border-[#e6e6e6] bg-white"
                  >
                    {col.map((e) => (
                      <ExpenseRow key={e.label} emoji={e.emoji} label={e.label} amount={e.amount} />
                    ))}
                  </div>
                ))}
              </div>
            </section>

          </div>
        </main>
      </div>
    </div>
  );
}
