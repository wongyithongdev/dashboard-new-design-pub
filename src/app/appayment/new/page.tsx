"use client";

import { DashboardSidebar } from "@/components/sidebar";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Landmark,
  Menu,
  Minus,
  Store,
  TrendingDown,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import React, { useEffect, useMemo, useRef, useState } from "react";

/* ─── mock data ─── */
type SelectOption = { code: string; label: string };

const CREDITOR_OPTIONS: SelectOption[] = [
  { code: "400-G001", label: "Camplus Sdn Bhd" },
  { code: "400-G002", label: "Tech Galaxy Distribution Sdn Bhd" },
  { code: "400-G003", label: "Digital Hub Solutions Sdn Bhd" },
  { code: "400-G004", label: "Premier Office Supplies Sdn Bhd" },
  { code: "400-G005", label: "Alpha Computing Resources Sdn Bhd" },
  { code: "400-G006", label: "ByteCraft Technologies Sdn Bhd" },
];

const PAYMENT_METHOD_OPTIONS: SelectOption[] = [
  { code: "TT",     label: "Telegraphic Transfer (TT)" },
  { code: "IBG",    label: "Interbank GIRO (IBG)" },
  { code: "CHEQUE", label: "Cheque" },
  { code: "CASH",   label: "Cash" },
  { code: "FPXB2B", label: "FPX Business" },
];

const BANK_OPTIONS: SelectOption[] = [
  { code: "MAYBANK",  label: "Maybank" },
  { code: "CIMB",     label: "CIMB Bank" },
  { code: "PUBLIC",   label: "Public Bank" },
  { code: "RHB",      label: "RHB Bank" },
  { code: "HLBANK",   label: "Hong Leong Bank" },
  { code: "AMBANK",   label: "AmBank" },
];

type Invoice = {
  id: string;
  invoiceNo: string;
  docDate: string;
  dueDate: string;
  originalAmount: number;
  outstanding: number;
  currency: string;
  overdue: boolean;
};

const CREDITOR_INVOICES: Record<string, Invoice[]> = {
  "400-G001": [
    { id: "i1", invoiceNo: "PI-2026-0012", docDate: "14 May 2026", dueDate: "28 May 2026", originalAmount: 5954, outstanding: 5954, currency: "MYR", overdue: true },
    { id: "i2", invoiceNo: "PI-2026-0009", docDate: "02 May 2026", dueDate: "16 May 2026", originalAmount: 1240, outstanding: 620, currency: "MYR", overdue: true },
    { id: "i3", invoiceNo: "PI-2026-0006", docDate: "18 Apr 2026", dueDate: "02 May 2026", originalAmount: 498, outstanding: 498, currency: "MYR", overdue: false },
  ],
  "400-G002": [
    { id: "i4", invoiceNo: "PI-2026-0011", docDate: "10 May 2026", dueDate: "24 May 2026", originalAmount: 3200, outstanding: 3200, currency: "MYR", overdue: true },
    { id: "i5", invoiceNo: "PI-2026-0008", docDate: "28 Apr 2026", dueDate: "12 May 2026", originalAmount: 856.3, outstanding: 856.3, currency: "MYR", overdue: false },
  ],
  "400-G003": [
    { id: "i6", invoiceNo: "PI-2026-0010", docDate: "05 May 2026", dueDate: "19 May 2026", originalAmount: 7800, outstanding: 7800, currency: "MYR", overdue: true },
  ],
  "400-G004": [
    { id: "i7", invoiceNo: "PI-2026-0007", docDate: "22 Apr 2026", dueDate: "06 May 2026", originalAmount: 612.9, outstanding: 612.9, currency: "MYR", overdue: true },
    { id: "i8", invoiceNo: "PI-2026-0004", docDate: "05 Apr 2026", dueDate: "19 Apr 2026", originalAmount: 2105.45, outstanding: 2105.45, currency: "MYR", overdue: false },
  ],
  "400-G005": [],
  "400-G006": [
    { id: "i9", invoiceNo: "PI-2026-0013", docDate: "20 May 2026", dueDate: "03 Jun 2026", originalAmount: 4320, outstanding: 4320, currency: "MYR", overdue: false },
  ],
};

const CURRENT_CASH_BALANCE = 48_200;
const MONTHLY_EXPENSES_REMAINING = 12_400;

/* ─── helpers ─── */
function fmtAmt(n: number) {
  return n.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* ─── CustomSelect ─── */
function CustomSelect({
  value, onChange, options, placeholder = "Select…", icon: Icon, ghost = false,
}: {
  value: string;
  onChange: (code: string, option: SelectOption) => void;
  options: SelectOption[];
  placeholder?: string;
  icon: LucideIcon;
  ghost?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [dropUp, setDropUp] = useState(false);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({ position: "fixed", top: 0, left: 0, width: 260 });
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const selected = options.find(o => o.code === value);
  const filtered = search
    ? options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()) || o.code.toLowerCase().includes(search.toLowerCase()))
    : options;

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => searchRef.current?.focus(), 10);
    function onDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) { setOpen(false); setSearch(""); }
    }
    document.addEventListener("mousedown", onDown);
    return () => { clearTimeout(t); document.removeEventListener("mousedown", onDown); };
  }, [open]);

  const openDropdown = () => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const w = Math.max(rect.width, 260);
      const up = window.innerHeight - rect.bottom < 300 && rect.top > window.innerHeight - rect.bottom;
      setDropUp(up);
      setPanelStyle(up
        ? { position: "fixed", left: rect.left, width: w, bottom: window.innerHeight - rect.top + 4 }
        : { position: "fixed", left: rect.left, width: w, top: rect.bottom + 4 });
    }
    setOpen(o => !o);
  };

  return (
    <div ref={containerRef} className="relative">
      {ghost ? (
        <button type="button" onClick={openDropdown}
          className={`flex w-full items-center justify-between gap-2 h-[26px] rounded-[6px] pl-2.5 pr-2 text-[13px] font-medium transition-colors duration-75 cursor-pointer ${selected ? "bg-[#f3f4f6] hover:bg-[#e5e7eb] text-[#111827]" : "bg-[#f9fafb] hover:bg-[#f3f4f6] text-[#9ca3af] font-normal"}`}>
          <span className="truncate">{selected ? selected.label : placeholder}</span>
          <ChevronDown size={11} strokeWidth={2.5} className={`shrink-0 text-[#9ca3af] transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
        </button>
      ) : (
        <button type="button" onClick={openDropdown}
          className={`h-[34px] w-full flex items-center rounded-[8px] border bg-white px-3 text-[13px] outline-none transition-all duration-[120ms] cursor-pointer relative pr-8 ${open ? "border-[#0075de] shadow-[0_0_0_3px_rgba(0,117,222,0.1)]" : "border-[#e1e1e3] hover:border-[#b8b8bc]"}`}>
          <span className={`truncate ${selected ? "text-[#111827]" : "text-[#9ca3af]"}`}>{selected ? selected.label : placeholder}</span>
          <ChevronDown size={12} strokeWidth={2} className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-150 ${open ? "rotate-180 text-[#111827]" : "text-[#9ca3af]"}`} />
        </button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div style={panelStyle}
            initial={{ opacity: 0, scale: 0.97, y: dropUp ? 4 : -4 }}
            animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.14, ease: [0.22, 1, 0.36, 1] } }}
            exit={{ opacity: 0, transition: { duration: 0.08, ease: "easeIn" } }}
            className="z-[9999] bg-white rounded-[10px] border border-[#e5e7eb] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_12px_28px_-4px_rgba(0,0,0,0.09),0_0_0_1px_rgba(0,0,0,0.03)]">
            <div className="px-1.5 pt-1.5 pb-1">
              <input ref={searchRef} type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
                className="w-full h-[30px] px-2.5 text-[13px] rounded-[6px] bg-[#f9fafb] border border-transparent outline-none focus:bg-white focus:border-[#e5e7eb] transition-all duration-100 placeholder:text-[#d1d5db] text-[#111827]" />
            </div>
            <div className="h-px bg-[#f3f4f6] mx-1.5 mb-1" />
            <div className="max-h-[220px] overflow-y-auto p-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {filtered.length === 0 ? (
                <div className="py-4 text-center text-[13px] text-[#9ca3af]">No results</div>
              ) : filtered.map(o => {
                const isSel = o.code === value;
                return (
                  <button key={o.code} type="button" onClick={() => { onChange(o.code, o); setOpen(false); setSearch(""); }}
                    className={`w-full flex h-8 items-center justify-between gap-2 px-2.5 rounded-[6px] text-left transition-colors duration-75 ${isSel ? "bg-[#f9fafb]" : "hover:bg-[#f9fafb]"}`}>
                    <span className={`text-[13px] truncate ${isSel ? "font-medium text-[#111827]" : "text-[#374151]"}`}>{o.label}</span>
                    {isSel && <Check size={12} strokeWidth={2.5} className="flex-shrink-0 text-[#6b7280]" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── DatePicker ─── */
const MONTHS_FULL = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DOW_LABELS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function DatePicker({ value, onChange, ghost = false }: { value: string; onChange: (v: string) => void; ghost?: boolean }) {
  const [open, setOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({ position: "fixed", top: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const parsed = value ? value.split("-").map(Number) as [number, number, number] : null;
  const [viewYear, setViewYear] = useState(parsed?.[0] ?? new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed ? parsed[1] - 1 : new Date().getMonth());

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const openCal = () => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const up = window.innerHeight - rect.bottom < 300 && rect.top > window.innerHeight - rect.bottom;
      setPanelStyle(up
        ? { position: "fixed", left: rect.left, bottom: window.innerHeight - rect.top + 4 }
        : { position: "fixed", left: rect.left, top: rect.bottom + 4 });
    }
    setOpen(o => !o);
  };

  function prevMonth() { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); }
  function nextMonth() { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); }
  function selectDay(d: number) {
    const mm = String(viewMonth + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    onChange(`${viewYear}-${mm}-${dd}`);
    setOpen(false);
  }

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDow = new Date(viewYear, viewMonth, 1).getDay();
  const cells: (number | null)[] = [...Array<null>(firstDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const selYear = parsed?.[0] ?? -1;
  const selMonth = parsed ? parsed[1] - 1 : -1;
  const selDay = parsed?.[2] ?? -1;
  const today = new Date();
  const displayLabel = parsed ? `${String(parsed[2]).padStart(2, "0")} ${MONTHS_FULL[parsed[1] - 1]?.slice(0, 3) ?? ""} ${parsed[0]}` : "Select date";

  return (
    <div ref={containerRef} className="relative">
      {ghost ? (
        <button type="button" onClick={openCal}
          className={`flex w-full items-center justify-between gap-2 h-[26px] rounded-[6px] px-2.5 text-[13px] transition-colors duration-75 cursor-pointer ${parsed ? "bg-[#f3f4f6] hover:bg-[#e5e7eb] text-[#111827]" : "bg-[#f9fafb] hover:bg-[#f3f4f6] text-[#9ca3af]"}`}>
          <div className="flex items-center gap-1.5">
            <CalendarDays size={12} strokeWidth={1.8} className="shrink-0 text-[#9ca3af]" />
            <span>{displayLabel}</span>
          </div>
          <ChevronDown size={10} strokeWidth={2.5} className={`shrink-0 text-[#9ca3af] transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
        </button>
      ) : (
        <button type="button" onClick={openCal}
          className={`h-[34px] w-full flex items-center gap-2 rounded-[8px] border bg-white px-3 text-[13px] outline-none transition-all duration-[120ms] cursor-pointer ${open ? "border-[#0075de] shadow-[0_0_0_3px_rgba(0,117,222,0.1)]" : "border-[#e1e1e3] hover:border-[#b8b8bc]"}`}>
          <CalendarDays size={13} strokeWidth={1.7} className="shrink-0 text-[#9ca3af]" />
          <span className={parsed ? "text-[#111827]" : "text-[#9ca3af]"}>{displayLabel}</span>
        </button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div style={panelStyle}
            initial={{ opacity: 0, scale: 0.97, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.14, ease: [0.22, 1, 0.36, 1] } }}
            exit={{ opacity: 0, transition: { duration: 0.08, ease: "easeIn" } }}
            className="z-[9999] w-[252px] bg-white rounded-[10px] p-3 border border-[#e5e7eb] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_12px_28px_-4px_rgba(0,0,0,0.09),0_0_0_1px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between mb-2.5">
              <button type="button" onClick={prevMonth} className="h-6 w-6 flex items-center justify-center rounded-[5px] text-[#9ca3af] hover:text-[#111827] hover:bg-[#f3f4f6] transition-colors duration-75"><ChevronLeft size={12} strokeWidth={2} /></button>
              <span className="text-[13px] font-semibold text-[#111827]">{MONTHS_FULL[viewMonth]} {viewYear}</span>
              <button type="button" onClick={nextMonth} className="h-6 w-6 flex items-center justify-center rounded-[5px] text-[#9ca3af] hover:text-[#111827] hover:bg-[#f3f4f6] transition-colors duration-75"><ChevronRight size={12} strokeWidth={2} /></button>
            </div>
            <div className="grid grid-cols-7 mb-1">
              {DOW_LABELS.map(d => <div key={d} className="h-6 flex items-center justify-center text-[11px] font-medium text-[#9ca3af] tracking-[0.02em]">{d}</div>)}
            </div>
            <div className="grid grid-cols-7">
              {cells.map((cell, i) => {
                if (cell === null) return <div key={`e-${i}`} className="h-7" />;
                const isSel = cell === selDay && viewMonth === selMonth && viewYear === selYear;
                const isTdy = cell === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
                return (
                  <div key={cell} className="h-7 flex items-center justify-center">
                    <button type="button" onClick={() => selectDay(cell)}
                      className={"h-[26px] w-[26px] flex items-center justify-center rounded-[5px] text-[13px] transition-colors duration-75 " +
                        (isSel ? "bg-[#0075de] text-white font-semibold" : isTdy ? "text-[#0075de] font-semibold hover:bg-[#f3f4f6]" : "text-[#374151] hover:bg-[#f3f4f6]")}>
                      {cell}
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── PropRow ─── */
function PropRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-[38px] items-start gap-3 px-6 py-2.5 hover:bg-[#fafafa] rounded-[6px] transition-colors duration-75">
      <div className="flex w-[148px] shrink-0 items-center pt-[7px]">
        <span className="text-[13px] font-medium text-[#71717a] truncate">{label}</span>
      </div>
      <div className="flex-1 min-w-0 pt-[4px]">{children}</div>
    </div>
  );
}

/* ─── main page ─── */
export default function NewPaymentPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  /* form state */
  const [creditorCode, setCreditorCode] = useState("");
  const [creditorName, setCreditorName] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [refNo, setRefNo] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");

  /* invoice knockoff state */
  const [selectedInvoices, setSelectedInvoices] = useState<Set<string>>(new Set());

  const invoices: Invoice[] = creditorCode ? (CREDITOR_INVOICES[creditorCode] ?? []) : [];

  function toggleInvoice(id: string) {
    setSelectedInvoices(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      const nextSelectedTotal = invoices
        .filter(invoice => next.has(invoice.id))
        .reduce((sum, invoice) => sum + invoice.outstanding, 0);
      setPaymentAmount(next.size > 0 ? nextSelectedTotal.toFixed(2) : "");
      return next;
    });
  }

  function toggleAll() {
    if (selectedInvoices.size === invoices.length) {
      setSelectedInvoices(new Set());
      setPaymentAmount("");
      return;
    }

    setSelectedInvoices(new Set(invoices.map(i => i.id)));
    setPaymentAmount(totalOutstanding.toFixed(2));
  }

  const totalOutstanding = invoices.reduce((s, i) => s + i.outstanding, 0);
  const selectedTotal = invoices
    .filter(i => selectedInvoices.has(i.id))
    .reduce((s, i) => s + i.outstanding, 0);

  const payAmt = parseFloat(paymentAmount) || 0;
  const forecastBalance = CURRENT_CASH_BALANCE - payAmt;
  const safePercent = Math.max(0, Math.min(100, Math.round((forecastBalance / CURRENT_CASH_BALANCE) * 100)));
  const forecastSafe = forecastBalance > MONTHLY_EXPENSES_REMAINING;

  const allSelected = invoices.length > 0 && selectedInvoices.size === invoices.length;
  const someSelected = selectedInvoices.size > 0 && !allSelected;

  return (
    <div className="dashboard-shell h-screen overflow-hidden md:flex">
      <DashboardSidebar activeItem="ap-payment" isMobileOpen={isSidebarOpen} onMobileClose={() => setIsSidebarOpen(false)} />

      <main className="flex h-screen min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white font-sans text-[#111827]"
        style={{ fontOpticalSizing: "auto" as never, fontSynthesis: "none", textRendering: "optimizeLegibility", WebkitFontSmoothing: "antialiased" }}>

        {/* ── Top bar ── */}
        <div className="flex h-[var(--dashboard-header-h)] shrink-0 items-center justify-between border-b border-[#e5e7eb] px-4 sm:px-6 z-10">
          <div className="flex items-center gap-1.5 min-w-0">
            <button type="button" aria-label="Open navigation" onClick={() => setIsSidebarOpen(true)}
              className="shrink-0 flex size-7 items-center justify-center rounded-[7px] text-[#6b7280] hover:bg-[#f9fafb] hover:text-[#111827] transition-colors xl:hidden">
              <Menu size={16} strokeWidth={1.8} />
            </button>
            <Link href="/appayment" className="hidden sm:flex items-center gap-1 text-[13px] text-[#9ca3af] hover:text-[#111827] transition-colors duration-75">
              <ArrowLeft size={13} strokeWidth={2} />
              AP Payment
            </Link>
            <span className="hidden sm:block text-[#d1d5db] text-[13px] mx-0.5">/</span>
            <span className="text-[13px] font-medium text-[#111827]">New Payment</span>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Link href="/appayment"
              className="inline-flex h-7 items-center gap-1.5 rounded-[7px] border border-[#e5e7eb] bg-white px-3 text-[12px] font-medium text-[#6b7280] outline-none transition-colors duration-75 hover:bg-[#f9fafb] hover:text-[#111827]">
              Discard
            </Link>
            <button type="button"
              className="inline-flex h-7 items-center gap-1.5 rounded-[7px] bg-[#0075de] px-3 text-[12px] font-medium text-white shadow-[0_1px_2px_rgba(0,117,222,0.25)] outline-none transition-colors duration-75 hover:bg-[#0069c8] disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={!creditorCode || !paymentDate || !paymentAmount}>
              Confirm Payment
            </button>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="min-h-0 flex-1 overflow-y-auto lg:overflow-hidden lg:h-full">
          <div className="w-full grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] lg:h-full">

            {/* ════ LEFT: Payment form ════ */}
            <div className="border-b lg:border-b-0 lg:border-r border-[#e5e7eb] lg:overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <div className="px-6 pt-8 pb-10 max-w-[440px]">

                {/* ── Section: Creditor ── */}
                <motion.div initial="hidden" animate="visible"
                  variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.04 } } }}
                  className="mb-7">

                  <motion.p variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.18 } } }}
                    className="mb-1 text-[11px] font-medium uppercase tracking-[0.06em] text-[#9ca3af]">
                    Creditor
                  </motion.p>

                  <div className="border-t border-[#f3f4f6]">
                    <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.18 } } }}
                      className="flex items-center min-h-[38px] border-b border-[#f3f4f6] -mx-2 px-2 rounded-[5px] hover:bg-[#f9fafb] transition-colors duration-75">
                      <span className="w-[108px] shrink-0 text-[12px] text-[#9ca3af]">Code</span>
                      <div className="flex-1 min-w-0"><CustomSelect ghost value={creditorCode} options={CREDITOR_OPTIONS} icon={Store} placeholder="Select creditor…"
                        onChange={(code, opt) => { setCreditorCode(code); setCreditorName(opt.label); setSelectedInvoices(new Set()); setPaymentAmount(""); }} /></div>
                    </motion.div>
                    <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.18 } } }}
                      className="flex items-center min-h-[38px] -mx-2 px-2">
                      <span className="w-[108px] shrink-0 text-[12px] text-[#9ca3af]">Name</span>
                      {creditorName
                        ? <span className="text-[13px] text-[#111827]">{creditorName}</span>
                        : <span className="text-[13px] text-[#d1d5db]">Auto-filled</span>}
                    </motion.div>
                  </div>
                </motion.div>

                {/* ── Section: Payment ── */}
                <motion.div initial="hidden" animate="visible"
                  variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.04, delayChildren: 0.08 } } }}
                  className="mb-7">

                  <motion.p variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.18 } } }}
                    className="mb-1 text-[11px] font-medium uppercase tracking-[0.06em] text-[#9ca3af]">
                    Payment
                  </motion.p>

                  <div className="border-t border-[#f3f4f6]">
                    <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.18 } } }}
                      className="flex items-center min-h-[38px] border-b border-[#f3f4f6] -mx-2 px-2 rounded-[5px] hover:bg-[#f9fafb] transition-colors duration-75">
                      <span className="w-[108px] shrink-0 text-[12px] text-[#9ca3af]">Date</span>
                      <div className="flex-1 min-w-0"><DatePicker ghost value={paymentDate} onChange={setPaymentDate} /></div>
                    </motion.div>
                    <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.18 } } }}
                      className="flex items-center min-h-[38px] border-b border-[#f3f4f6] -mx-2 px-2 rounded-[5px] hover:bg-[#f9fafb] transition-colors duration-75">
                      <span className="w-[108px] shrink-0 text-[12px] text-[#9ca3af]">Method</span>
                      <div className="flex-1 min-w-0"><CustomSelect ghost value={paymentMethod} options={PAYMENT_METHOD_OPTIONS} icon={CreditCard} placeholder="Select…"
                        onChange={(code) => setPaymentMethod(code)} /></div>
                    </motion.div>
                    <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.18 } } }}
                      className="flex items-center min-h-[38px] border-b border-[#f3f4f6] -mx-2 px-2 rounded-[5px] hover:bg-[#f9fafb] transition-colors duration-75">
                      <span className="w-[108px] shrink-0 text-[12px] text-[#9ca3af]">Bank</span>
                      <div className="flex-1 min-w-0"><CustomSelect ghost value={bankCode} options={BANK_OPTIONS} icon={Landmark} placeholder="Select…"
                        onChange={(code) => setBankCode(code)} /></div>
                    </motion.div>
                    <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.18 } } }}
                      className="flex items-center min-h-[38px] border-b border-[#f3f4f6] -mx-2 px-2 rounded-[5px] hover:bg-[#f9fafb] transition-colors duration-75">
                      <span className="w-[108px] shrink-0 text-[12px] text-[#9ca3af]">Reference</span>
                      <input type="text" value={refNo} onChange={e => setRefNo(e.target.value)}
                        placeholder="Cheque / TT ref"
                        className="flex-1 bg-transparent text-[13px] text-[#111827] outline-none placeholder:text-[#d1d5db] border-b border-transparent focus:border-[#0075de] py-0.5 transition-colors duration-[120ms]" />
                    </motion.div>
                    <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.18 } } }}
                      className="flex items-center min-h-[38px] border-b border-[#f3f4f6] -mx-2 px-2 rounded-[5px] hover:bg-[#f9fafb] transition-colors duration-75">
                      <span className="w-[108px] shrink-0 text-[12px] text-[#9ca3af]">Description</span>
                      <input type="text" value={description} onChange={e => setDescription(e.target.value)}
                        placeholder="e.g. Payment for May invoices"
                        className="flex-1 bg-transparent text-[13px] text-[#111827] outline-none placeholder:text-[#d1d5db] border-b border-transparent focus:border-[#0075de] py-0.5 transition-colors duration-[120ms]" />
                    </motion.div>
                    <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.18 } } }}
                      className="flex items-center min-h-[38px] -mx-2 px-2">
                      <span className="w-[108px] shrink-0 text-[12px] text-[#9ca3af]">Currency</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-medium text-[#111827]">MYR</span>
                        <span className="text-[12px] text-[#9ca3af]">· Rate 1.0000</span>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>

                {/* ── Divider ── */}
                <div className="h-px bg-[#f3f4f6] mb-7" />

                {/* ── Payment amount ── */}
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1], delay: 0.28 }}>

                  <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.06em] text-[#9ca3af]">Amount</p>

                  <div className="flex items-start gap-2">
                    <span className="mt-[7px] select-none text-[16px] font-semibold text-[#9ca3af] leading-none">RM</span>
                    <input
                      type="number" min="0" step="0.01" value={paymentAmount}
                      onChange={e => setPaymentAmount(e.target.value)}
                      placeholder="0.00"
                      className="flex-1 min-w-0 bg-transparent border-0 border-b border-[#e5e7eb] outline-none pb-0.5 text-[36px] font-semibold text-[#111827] tracking-[-0.03em] tabular-nums leading-tight placeholder:text-[#e5e7eb] focus:border-[#0075de] transition-colors duration-[120ms] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                  </div>

                  <AnimatePresence>
                    {selectedInvoices.size > 0 && (
                      <motion.p
                        initial={{ opacity: 0, y: -3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -3 }}
                        transition={{ duration: 0.14 }}
                        className="mt-2 text-[12px] text-[#9ca3af]">
                        From {selectedInvoices.size} selected invoice{selectedInvoices.size > 1 ? "s" : ""}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

              </div>
            </div>

            {/* ════ RIGHT: Invoices + Forecast ════ */}
            <div className="hidden lg:flex lg:flex-col lg:overflow-hidden bg-white">

              {/* Top header strip */}
              <div className="flex h-[var(--dashboard-header-h)] shrink-0 items-center justify-between border-b border-[#e5e7eb] px-6">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium text-[#111827]">Outstanding invoices</span>
                  {invoices.length > 0 && (
                    <span className="inline-flex h-[18px] items-center rounded-[4px] bg-[#f3f4f6] px-1.5 text-[11px] font-medium text-[#6b7280]">
                      {invoices.length}
                    </span>
                  )}
                </div>
                <AnimatePresence>
                  {selectedInvoices.size > 0 && (
                    <motion.span
                      initial={{ opacity: 0, x: 4 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 4 }}
                      transition={{ duration: 0.14 }}
                      className="text-[12px] text-[#0075de] font-medium tabular-nums">
                      {selectedInvoices.size} selected · RM {fmtAmt(selectedTotal)}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              {/* Invoice area — scrollable */}
              <div className="flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <AnimatePresence mode="wait">
                  {!creditorCode ? (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className="flex flex-col items-center justify-center h-full gap-4 text-center">
                      <div className="relative w-[52px] h-[52px]">
                        <div className="w-full h-full rounded-full border-2 border-dashed border-[#d1d5db]" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <ArrowLeft size={16} strokeWidth={1.8} className="text-[#9ca3af]" />
                        </div>
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-[#374151]">No creditor selected</p>
                        <p className="text-[12px] text-[#9ca3af] mt-1 leading-relaxed">Pick one from the left<br />to load their invoices</p>
                      </div>
                    </motion.div>

                  ) : invoices.length === 0 ? (
                    <motion.div key="no-invoices" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className="flex flex-col items-center justify-center h-full gap-3 text-center">
                      <div className="w-10 h-10 rounded-full bg-[#dcfce7] flex items-center justify-center">
                        <Check size={16} strokeWidth={2.5} className="text-[#16a34a]" />
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-[#374151]">All clear</p>
                        <p className="text-[12px] text-[#9ca3af] mt-0.5">No outstanding invoices for this creditor</p>
                      </div>
                    </motion.div>

                  ) : (
                    <motion.div key={`invoices-${creditorCode}`}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.18 }}>

                      {/* Column headers — sentence-case */}
                      <div className="flex items-center h-8 border-b border-[#e5e7eb] px-6">
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <button type="button" onClick={toggleAll}
                            className="flex items-center justify-center size-[14px] rounded-[3px] border transition-colors duration-75 shrink-0"
                            style={{ borderColor: allSelected || someSelected ? "#0075de" : "#d1d5db", background: allSelected ? "#0075de" : "white" }}>
                            {allSelected ? <Check size={8} strokeWidth={3} className="text-white" /> : someSelected ? <Minus size={8} strokeWidth={3} className="text-[#0075de]" /> : null}
                          </button>
                          <span className="text-[12px] font-medium text-[#9ca3af]">Invoice</span>
                        </div>
                        <div className="flex items-center gap-6 shrink-0">
                          <span className="text-[12px] font-medium text-[#9ca3af]">Due</span>
                          <span className="text-[12px] font-medium text-[#9ca3af] w-[80px] text-right">Outstanding</span>
                        </div>
                      </div>

                      {/* Rows — 2-line Notion style */}
                      {invoices.map((inv, idx) => {
                        const isSel = selectedInvoices.has(inv.id);
                        return (
                          <motion.div key={inv.id}
                            initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.16, delay: idx * 0.035, ease: [0.22, 1, 0.36, 1] }}
                            onClick={() => toggleInvoice(inv.id)}
                            className={`flex items-start border-b border-[#f3f4f6] px-6 py-3 cursor-pointer select-none transition-colors duration-75 ${isSel ? "bg-[#f5f9ff]" : "hover:bg-[#f9fafb]"}`}>

                            {/* Left: checkbox + invoice info */}
                            <div className="flex items-start gap-2.5 flex-1 min-w-0">
                              <div className="flex items-center justify-center size-[14px] rounded-[3px] border transition-colors duration-75 shrink-0 mt-[2px]"
                                style={{ borderColor: isSel ? "#0075de" : "#d1d5db", background: isSel ? "#0075de" : "white" }}>
                                {isSel && <Check size={8} strokeWidth={3} className="text-white" />}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className={`text-[13px] font-medium leading-none ${isSel ? "text-[#0075de]" : "text-[#111827]"}`}>{inv.invoiceNo}</span>
                                  {inv.overdue && (
                                    <span className="shrink-0 inline-flex items-center rounded-full bg-[#fef2f2] px-1.5 py-px text-[10px] font-semibold text-[#dc2626] leading-4">Overdue</span>
                                  )}
                                </div>
                                <p className="text-[11px] text-[#9ca3af] mt-[4px]">{inv.docDate}</p>
                              </div>
                            </div>

                            {/* Right: due + outstanding stacked */}
                            <div className="flex flex-col items-end gap-[4px] shrink-0 w-[80px]">
                              <span className="text-[12px] text-[#6b7280] tabular-nums leading-none">
                                {inv.dueDate.split(" ").slice(0, 2).join(" ")}
                              </span>
                              <span className={`text-[13px] font-semibold tabular-nums leading-none ${isSel ? "text-[#0075de]" : "text-[#111827]"}`}>
                                {fmtAmt(inv.outstanding)}
                              </span>
                            </div>
                          </motion.div>
                        );
                      })}

                      {/* Total footer */}
                      <div className="flex items-center h-9 px-6 border-t border-[#e5e7eb]">
                        <span className="flex-1 text-[12px] font-medium text-[#6b7280]">Total outstanding</span>
                        <span className="text-[13px] font-semibold text-[#111827] tabular-nums w-[80px] text-right">{fmtAmt(totalOutstanding)}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ── Cash Forecast — Notion property rows ── */}
              <motion.div className="shrink-0 border-t border-[#e5e7eb]"
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1], delay: 0.14 }}>

                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-4 pb-2">
                  <div className="flex items-center gap-1.5">
                    {forecastSafe
                      ? <TrendingUp size={13} strokeWidth={1.7} className="text-[#16a34a]" />
                      : <TrendingDown size={13} strokeWidth={1.7} className="text-[#dc2626]" />}
                    <span className="text-[12px] font-medium text-[#6b7280]">Cash forecast</span>
                  </div>
                  <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-[3px] rounded-full ${forecastSafe ? "bg-[#f0fdf4] text-[#15803d]" : "bg-[#fef2f2] text-[#dc2626]"}`}>
                    <span className={`w-[5px] h-[5px] rounded-full shrink-0 ${forecastSafe ? "bg-[#16a34a]" : "bg-[#dc2626]"}`} />
                    {forecastSafe ? "Healthy" : "At risk"}
                  </span>
                </div>

                {/* Property rows */}
                <div className="border-t border-[#f3f4f6]">
                  <div className="flex items-center min-h-[36px] px-6 border-b border-[#f3f4f6]">
                    <span className="w-[120px] shrink-0 text-[12px] text-[#9ca3af]">Balance</span>
                    <span className="text-[13px] font-medium text-[#111827] tabular-nums">RM {fmtAmt(CURRENT_CASH_BALANCE)}</span>
                  </div>
                  <div className="flex items-center min-h-[36px] px-6 border-b border-[#f3f4f6]">
                    <span className="w-[120px] shrink-0 text-[12px] text-[#9ca3af]">This payment</span>
                    <span className={`text-[13px] font-medium tabular-nums ${payAmt > 0 ? "text-[#dc2626]" : "text-[#d1d5db]"}`}>
                      {payAmt > 0 ? `−RM ${fmtAmt(payAmt)}` : "—"}
                    </span>
                  </div>
                  <div className="flex items-center min-h-[36px] px-6">
                    <span className="w-[120px] shrink-0 text-[12px] text-[#9ca3af]">After payment</span>
                    <span className={`text-[13px] font-semibold tabular-nums ${payAmt > 0 ? (forecastSafe ? "text-[#15803d]" : "text-[#dc2626]") : "text-[#111827]"}`}>
                      RM {fmtAmt(Math.max(0, forecastBalance))}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="px-6 py-3 border-t border-[#f3f4f6]">
                  <div className="h-[3px] w-full rounded-full bg-[#f3f4f6] overflow-hidden mb-1.5">
                    <motion.div
                      className={`h-full rounded-full ${forecastSafe ? "bg-[#16a34a]" : "bg-[#dc2626]"}`}
                      animate={{ width: `${payAmt > 0 ? safePercent : 100}%` }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[#9ca3af]">Min. buffer RM {fmtAmt(MONTHLY_EXPENSES_REMAINING)}</span>
                    {payAmt > 0 && (
                      <span className={`text-[11px] font-medium ${forecastSafe ? "text-[#15803d]" : "text-[#dc2626]"}`}>
                        {safePercent}% remaining
                      </span>
                    )}
                  </div>
                </div>

                {/* Warning */}
                <AnimatePresence>
                  {!forecastSafe && payAmt > 0 && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.18 }} className="overflow-hidden">
                      <div className="mx-6 mb-4 flex items-start gap-2 rounded-[8px] border border-[#fecaca] bg-[#fff5f5] px-3 py-2.5">
                        <div className="mt-px w-[15px] h-[15px] rounded-full bg-[#dc2626] flex items-center justify-center shrink-0">
                          <span className="text-white text-[8px] font-bold leading-none">!</span>
                        </div>
                        <p className="text-[12px] text-[#b91c1c] leading-relaxed">Balance falls below minimum buffer. Review before confirming.</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </motion.div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
