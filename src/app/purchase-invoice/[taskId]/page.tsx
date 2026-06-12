"use client";

import { DashboardSidebar } from "@/components/sidebar";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Hash,
  type LucideIcon,
  Menu,
  Package,
  Plus,
  Store,
  Tag,
  Trash2,
  User,
  Wallet,
  Waves,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";

/* ─── mock data ─── */
const taskData = {
  analyzerTaskId: "7f01eaae-8d65-4385-91fe-ec7a57b9290c",
  createdAt: "2026-06-09T09:42:21.68223507Z",
  draft: {
    header: {
      creditorCode: "400-G001",
      creditorName: "Camplus Sdn Bhd",
      creditorRegNo: "202001034812 (1387621-U)",
      creditorTaxId: "C2183740251",
      creditorAddress: ["No. 12, Jalan Teknologi 3/4", "Taman Sains Selangor", "47810 Petaling Jaya", "Selangor, Malaysia"],
      billedTo: "My365Biz Solutions Sdn Bhd",
      billedToAddress: ["Suite 18-3, Level 18, Menara 1 Sentrum", "201 Jalan Tun Sambanthan", "50470 Kuala Lumpur", "Malaysia"],
      currencyCode: "MYR",
      currencyRate: 1,
      description: "Supply of IT Equipment & Accessories",
      displayTerm: "Net 14 days",
      docDate: "2026-05-14",
      dueDate: "2026-05-28",
      purchaseAgent: "JULIANWG",
      supplierInvoiceNo: "01-HQ-1018123",
      notes: "All prices are inclusive of applicable taxes. Please make payment to: CIMB Bank · Acct: 8006123456 · Ref: Invoice No.",
    },
    details: [
      { amount: 4350,  description: "LENOVO YOGA 7 2-in-1 14ILL10 Core Ultra 5 125H",   itemCode: "NBK-LENOVO-Y1401", qty: 1, uom: "UNIT", unitPrice: 4350,  discount: "",   taxCode: "SR6" },
      { amount: 342,   description: "USB-C Docking Station (12-in-1, 4K HDMI)",          itemCode: "ACC-DOCK-Y2002",   qty: 1, uom: "UNIT", unitPrice: 360,   discount: "5",  taxCode: "SR6" },
      { amount: 890,   description: "27\" QHD IPS Monitor 165Hz, DisplayPort",           itemCode: "MON-27QHD-165",    qty: 1, uom: "UNIT", unitPrice: 890,   discount: "",   taxCode: "SR6" },
      { amount: 216,   description: "Mechanical Keyboard — Wireless TKL",                itemCode: "PRF-KB-MECH-01",   qty: 2, uom: "PCS",  unitPrice: 120,   discount: "10", taxCode: "SR6" },
      { amount: 156,   description: "Wireless Ergonomic Mouse",                          itemCode: "PRF-MS-ERG-02",    qty: 2, uom: "PCS",  unitPrice: 78,    discount: "",   taxCode: "SR6" },
    ],
  },
  fileServer: {
    imageUrl: "https://files.my365biz.com/images/17a5446d85ada5498efd869bf0a71f1aaf1839271161dfd48fc5c04a4ca41fff",
    link:     "https://files.my365biz.com/files/17a5446d85ada5498efd869bf0a71f1aaf1839271161dfd48fc5c04a4ca41fff",
  },
};

/* ─── types ─── */
type HeaderForm = {
  creditorCode: string; creditorName: string; supplierInvoiceNo: string;
  docDate: string; purchaseAgent: string; currencyCode: string; displayTerm: string;
};
type DetailRow = {
  id: string; itemCode: string; description: string;
  qty: number; uom: string; unitPrice: number; discount: string; amount: number;
};

/* ─── init ─── */
function initHeader(taskId: string): HeaderForm {
  if (taskId === "new") {
    return { creditorCode: "", creditorName: "", supplierInvoiceNo: "", docDate: new Date().toISOString().slice(0, 10), purchaseAgent: "", currencyCode: "MYR", displayTerm: "Net 30 days" };
  }
  const h = taskData.draft.header;
  return { creditorCode: h.creditorCode, creditorName: h.creditorName, supplierInvoiceNo: h.supplierInvoiceNo, docDate: h.docDate, purchaseAgent: h.purchaseAgent, currencyCode: h.currencyCode, displayTerm: h.displayTerm };
}
function initRows(taskId: string): DetailRow[] {
  if (taskId === "new") return [{ id: "row-0", itemCode: "", description: "", qty: 1, uom: "UNIT", unitPrice: 0, discount: "", amount: 0 }];
  return taskData.draft.details.map((d, i) => ({ id: `row-${i}`, itemCode: d.itemCode, description: d.description, qty: d.qty, uom: d.uom, unitPrice: d.unitPrice, discount: d.discount, amount: d.amount }));
}

/* ─── select option type ─── */
type SelectOption = { code: string; label: string };

/* ─── option lists ─── */
const CREDITOR_OPTIONS: SelectOption[] = [
  { code: "400-G001", label: "Camplus Sdn Bhd" },
  { code: "400-G002", label: "Tech Galaxy Distribution Sdn Bhd" },
  { code: "400-G003", label: "Digital Hub Solutions Sdn Bhd" },
  { code: "400-G004", label: "Premier Office Supplies Sdn Bhd" },
  { code: "400-G005", label: "Alpha Computing Resources Sdn Bhd" },
  { code: "400-G006", label: "ByteCraft Technologies Sdn Bhd" },
];

const ITEM_CODE_OPTIONS: SelectOption[] = [
  { code: "NBK-LENOVO-Y1401", label: "LENOVO YOGA 7 2-in-1 14ILL10 Core Ultra 5 125H" },
  { code: "ACC-DOCK-Y2002",   label: "USB-C Docking Station (12-in-1, 4K HDMI)" },
  { code: "MON-27QHD-165",    label: '27" QHD IPS Monitor 165Hz, DisplayPort' },
  { code: "PRF-KB-MECH-01",   label: "Mechanical Keyboard — Wireless TKL" },
  { code: "PRF-MS-ERG-02",    label: "Wireless Ergonomic Mouse" },
  { code: "SFT-ANTIVIRUS-01", label: "Enterprise Antivirus License (1 Year)" },
  { code: "ACC-CAB-USBC-01",  label: "USB-C to USB-C Braided Cable 2m" },
  { code: "PRF-WEBCAM-4K",    label: "4K Webcam with Auto-Focus & Noise-Cancel Mic" },
];

const UOM_OPTIONS: SelectOption[] = [
  { code: "UNIT", label: "Single unit item" },
  { code: "PCS",  label: "Pieces" },
  { code: "BOX",  label: "Box / Carton" },
  { code: "SET",  label: "Set / Bundle" },
  { code: "KG",   label: "Kilogram" },
  { code: "MTR",  label: "Metre" },
  { code: "HRS",  label: "Hours (service)" },
  { code: "LIC",  label: "License / Subscription" },
];

/* ─── shared classes ─── */
const inputCls    = "h-[42px] w-full rounded-[6px] border border-[#e6e6e6] bg-white px-3 py-2 text-[14px] text-[#31302e] outline-none transition-all duration-150 placeholder:text-[#c8c3be] hover:border-[#b5b0aa] focus:border-[#0075de] focus:ring-2 focus:ring-[#0075de]/12";
const readOnlyCls = "h-[42px] w-full rounded-[6px] border border-[#e6e6e6] bg-[#f6f5f4] px-3 py-2 text-[14px] text-[#a39e98] outline-none cursor-default select-none flex items-center gap-2";
const labelCls    = "block text-[11px] font-semibold uppercase tracking-[0.5px] text-[#a39e98] mb-2";

/* ─── custom select ─── */
function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Select…",
  icon: Icon,
  compact = false,
}: {
  value: string;
  onChange: (code: string, option: SelectOption) => void;
  options: SelectOption[];
  placeholder?: string;
  icon: LucideIcon;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [dropUp, setDropUp] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const triggerCls = compact
    ? "h-[34px] w-full rounded-[6px] border border-[#e6e6e6] bg-white px-2 py-1 text-[13px] text-[#31302e] outline-none transition-all duration-150 placeholder:text-[#c8c3be] hover:border-[#b5b0aa] focus:border-[#0075de] focus:ring-2 focus:ring-[#0075de]/12"
    : inputCls;
  const selected = options.find(o => o.code === value);
  const filtered = search
    ? options.filter(o =>
        o.code.toLowerCase().includes(search.toLowerCase()) ||
        o.label.toLowerCase().includes(search.toLowerCase())
      )
    : options;

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => searchRef.current?.focus(), 10);
    function onDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false); setSearch("");
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => { clearTimeout(t); document.removeEventListener("mousedown", onDown); };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => {
          if (!open) {
            const rect = containerRef.current?.getBoundingClientRect();
            if (rect) {
              const spaceBelow = window.innerHeight - rect.bottom;
              setDropUp(spaceBelow < 300 && rect.top > spaceBelow);
            }
          }
          setOpen(o => !o);
        }}
        className={`${triggerCls} flex items-center cursor-pointer pr-8`}
      >
        <span className={`text-[13px] truncate ${selected ? "text-[#31302e] font-medium" : "text-[#a39e98]"}`}>
          {selected ? selected.code : placeholder}
        </span>
        <ChevronDown
          size={12}
          strokeWidth={2}
          className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-200 ${open ? "rotate-180 text-[#31302e]" : "text-[#a39e98]"}`}
        />
      </button>

      {/* Dropdown */}
      <div
        className={
          "absolute left-0 z-50 w-full min-w-[272px] bg-white rounded-xl " +
          "border border-[#e6e6e6] " +
          "shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_4px_rgba(0,0,0,0.04),0_8px_20px_rgba(0,0,0,0.07),0_20px_40px_rgba(0,0,0,0.05)] " +
          "transition-all duration-[180ms] ease-out " +
          (dropUp ? "bottom-[calc(100%+6px)] origin-bottom " : "top-[calc(100%+6px)] origin-top ") +
          (open
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : dropUp
              ? "opacity-0 scale-[0.97] translate-y-1.5 pointer-events-none"
              : "opacity-0 scale-[0.97] -translate-y-1.5 pointer-events-none")
        }
      >
        {/* Search */}
        <div className="p-2">
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search…"
            className="w-full h-[30px] px-2.5 text-[13px] rounded-[6px] bg-[#f6f5f4] border border-transparent outline-none focus:border-[#0075de] focus:bg-white transition-colors duration-150 placeholder:text-[#a39e98] text-[#31302e]"
          />
        </div>

        <div className="h-px bg-[#e6e6e6] mx-0" />

        {/* Options */}
        <div className="max-h-[228px] overflow-y-auto p-1.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {filtered.length === 0 ? (
            <div className="py-5 text-center text-[13px] text-[#a39e98]">No results</div>
          ) : filtered.map(o => {
            const isSel = o.code === value;
            return (
              <button
                key={o.code}
                type="button"
                onClick={() => { onChange(o.code, o); setOpen(false); setSearch(""); }}
                className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-[6px] text-left transition-colors duration-100 ${isSel ? "bg-[#f6f5f4]" : "hover:bg-[#f6f5f4]"}`}
              >
                <Icon size={14} strokeWidth={1.8} className="flex-shrink-0 text-[#0075de]" />
                <div className="flex flex-col gap-[1px] min-w-0 flex-1">
                  <span className={`text-[13px] font-medium leading-[1.4] truncate ${isSel ? "text-[#0075de]" : "text-[#31302e]"}`}>
                    {o.code}
                  </span>
                  <span className="text-[11px] text-[#a39e98] leading-[1.45] truncate">
                    {o.label}
                  </span>
                </div>
                {isSel && <Check size={12} strokeWidth={2.5} className="flex-shrink-0 text-[#0075de]" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── custom date picker ─── */
const MONTHS_FULL = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DOW_LABELS  = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function DatePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const parsed = value ? value.split("-").map(Number) as [number, number, number] : null;
  const [viewYear,  setViewYear]  = useState(parsed?.[0]  ?? new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed ? parsed[1] - 1 : new Date().getMonth()); // 0-based

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }
  function selectDay(d: number) {
    const mm = String(viewMonth + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    onChange(`${viewYear}-${mm}-${dd}`);
    setOpen(false);
  }

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDow    = new Date(viewYear, viewMonth, 1).getDay();
  const cells: (number | null)[] = [
    ...Array<null>(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const selYear  = parsed?.[0] ?? -1;
  const selMonth = parsed ? parsed[1] - 1 : -1;
  const selDay   = parsed?.[2] ?? -1;
  const today    = new Date();

  const displayLabel = parsed
    ? `${String(parsed[2]).padStart(2,"0")} ${MONTHS_FULL[parsed[1]-1]?.slice(0,3) ?? ""} ${parsed[0]}`
    : "Select date";

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`${inputCls} flex items-center gap-2 cursor-pointer`}
      >
        <CalendarDays size={14} strokeWidth={1.7} className="shrink-0 text-[#a39e98]" />
        <span className={`text-[13px] ${parsed ? "text-[#31302e] font-medium" : "text-[#a39e98]"}`}>
          {displayLabel}
        </span>
      </button>

      {/* Calendar popover */}
      <div
        className={
          "absolute left-0 top-[calc(100%+6px)] z-50 w-[256px] bg-white rounded-xl p-4 " +
          "border border-[#e6e6e6] " +
          "shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_4px_rgba(0,0,0,0.04),0_8px_20px_rgba(0,0,0,0.07),0_20px_40px_rgba(0,0,0,0.05)] " +
          "transition-all duration-[180ms] ease-out origin-top " +
          (open
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-[0.97] -translate-y-1.5 pointer-events-none")
        }
      >
        {/* Month nav */}
        <div className="flex items-center mb-3">
          <button
            type="button"
            onClick={prevMonth}
            className="h-6 w-6 flex items-center justify-center rounded-md text-[#a39e98] hover:text-[#31302e] hover:bg-[#f6f5f4] transition-colors duration-100"
          >
            <ChevronLeft size={13} strokeWidth={2} />
          </button>
          <span className="flex-1 text-center text-[13px] font-semibold text-[#31302e] tracking-[-0.1px]">
            {MONTHS_FULL[viewMonth]} {viewYear}
          </span>
          <button
            type="button"
            onClick={nextMonth}
            className="h-6 w-6 flex items-center justify-center rounded-md text-[#a39e98] hover:text-[#31302e] hover:bg-[#f6f5f4] transition-colors duration-100"
          >
            <ChevronRight size={13} strokeWidth={2} />
          </button>
        </div>

        {/* DOW headers — Notion eyebrow */}
        <div className="grid grid-cols-7 mb-1">
          {DOW_LABELS.map(d => (
            <div key={d} className="h-7 flex items-center justify-center text-[11px] font-semibold tracking-[0.1px] text-[#a39e98]">
              {d}
            </div>
          ))}
        </div>

        {/* Day grid — circular cells */}
        <div className="grid grid-cols-7">
          {cells.map((cell, i) => {
            if (cell === null) return <div key={`e-${i}`} className="h-8" />;
            const isSel = cell === selDay && viewMonth === selMonth && viewYear === selYear;
            const isTdy = cell === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
            return (
              <div key={cell} className="h-8 flex flex-col items-center justify-center">
                <button
                  type="button"
                  onClick={() => selectDay(cell)}
                  className={
                    "h-7 w-7 flex items-center justify-center rounded-full text-[13px] transition-colors duration-100 " +
                    (isSel
                      ? "bg-[#0075de] text-white font-medium"
                      : isTdy
                      ? "text-[#0075de] font-medium hover:bg-[#f6f5f4]"
                      : "text-[#31302e] hover:bg-[#f6f5f4]")
                  }
                >
                  {cell}
                </button>
                {isTdy && !isSel && (
                  <span className="mt-[-3px] h-[3px] w-[3px] rounded-full bg-[#0075de]" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function PurchaseInvoiceTaskPage() {
  const params = useParams<{ taskId: string }>();
  const taskId = params?.taskId ?? "new";

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [header, setHeader] = useState<HeaderForm>(() => initHeader(taskId));
  const [rows, setRows] = useState<DetailRow[]>(() => initRows(taskId));
  const [previewMode, setPreviewMode] = useState<"form" | "original">("form");
  const [isCompact, setIsCompact] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 1279px)").matches,
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1279px)");
    const handler = (e: MediaQueryListEvent) => setIsCompact(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const total = useMemo(() => rows.reduce((s, r) => s + Number(r.amount || 0), 0), [rows]);

  function patch<K extends keyof HeaderForm>(key: K, value: HeaderForm[K]) {
    setHeader(p => ({ ...p, [key]: value }));
  }
  function calcAmount(qty: number, unitPrice: number, discount: string): number {
    const pct = parseFloat(String(discount).replace("%", "")) || 0;
    return Number(qty) * Number(unitPrice) * (1 - pct / 100);
  }
  function patchRow(id: string, field: keyof DetailRow, value: string | number) {
    setRows(prev => prev.map(row => {
      if (row.id !== id) return row;
      const next = { ...row, [field]: value };
      if (field === "qty" || field === "unitPrice" || field === "discount")
        next.amount = calcAmount(Number(next.qty), Number(next.unitPrice), String(next.discount));
      return next;
    }));
  }
  function patchRowMulti(id: string, updates: Partial<DetailRow>) {
    setRows(prev => prev.map(row => {
      if (row.id !== id) return row;
      const next = { ...row, ...updates };
      if ("qty" in updates || "unitPrice" in updates || "discount" in updates)
        next.amount = calcAmount(Number(next.qty), Number(next.unitPrice), String(next.discount));
      return next;
    }));
  }
  function addRow() {
    setRows(p => [...p, { id: `row-${Date.now()}`, itemCode: "", description: "", qty: 1, uom: "UNIT", unitPrice: 0, discount: "", amount: 0 }]);
  }
  function removeRow(id: string) {
    setRows(p => {
      if (p.length === 1) return [{ ...p[0]!, itemCode: "", description: "", qty: 1, unitPrice: 0, amount: 0 }];
      return p.filter(r => r.id !== id);
    });
  }

  function fmtAmt(n: number | string) {
    return Number(n).toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  return (
    <div className="dashboard-shell h-screen overflow-hidden md:flex">
      <DashboardSidebar activeItem="purchase-invoice" isMobileOpen={isSidebarOpen} onMobileClose={() => setIsSidebarOpen(false)} />

      <main className="flex h-screen min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white font-sans text-[#31302e]" style={{ fontOpticalSizing: "auto" as never, fontSynthesis: "none", textRendering: "optimizeLegibility", WebkitFontSmoothing: "antialiased" }}>

        {/* ── Header ── */}
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[#e6e6e6]/80 bg-white/80 px-4 py-3 backdrop-blur-md z-10 sm:gap-4 sm:px-6 sm:py-4">
          <div className="flex items-center gap-2 min-w-0 sm:gap-3">
            <button
              type="button"
              aria-label="Open navigation"
              onClick={() => setIsSidebarOpen(true)}
              className="shrink-0 rounded-md p-1 text-[#6f6a64] hover:text-[#31302e] transition-colors xl:hidden"
            >
              <Menu size={18} strokeWidth={1.8} />
            </button>
            <Link
              href="/purchase-invoice"
              className="shrink-0 hidden sm:flex items-center justify-center rounded-md p-1 text-[#6f6a64] hover:text-[#31302e] transition-colors"
            >
              <ArrowLeft size={18} strokeWidth={1.8} />
            </Link>
            <h1 className="text-[18px] sm:text-[20px] font-semibold tracking-[-0.125px] text-[#31302e] min-w-0 truncate">
              Purchase Invoice
            </h1>
            <span className="inline-flex h-6 items-center rounded-[6px] bg-[#e9f7ef] px-2 text-[12px] font-medium text-[#1f7a4d]">
              Ready
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
            <a
              href={taskData.fileServer.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-7 items-center gap-1.5 rounded-[7px] border border-[#e6e6e6] bg-white px-2.5 text-[13px] font-medium leading-5 text-[#5f5e59] outline-none transition-colors duration-75 hover:bg-[#f6f5f4] hover:border-[#b5b0aa]"
            >
              <Download size={13} strokeWidth={1.8} />
              Download Original
            </a>
            <button
              type="button"
              className="inline-flex h-7 items-center gap-1.5 rounded-[7px] bg-[#0075de] px-2.5 text-[13px] font-medium leading-5 text-white shadow-[0_1px_2px_rgba(0,117,222,0.2)] outline-none transition-colors duration-75 hover:bg-[#005bab]"
            >
              <div className="h-2 w-2 rounded-full bg-emerald-400" />
              Submit Invoice
            </button>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="min-h-0 flex-1 overflow-y-auto lg:overflow-hidden lg:h-full">
          <div className="w-full grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] lg:h-full">

            {/* ════ LEFT: Form ════ */}
            <div className="p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-[#e6e6e6] lg:overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <motion.h2
                className="text-[16px] font-semibold text-[#31302e] mb-8"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              >
                Invoice Details
              </motion.h2>

              <motion.div
                className="space-y-6"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.055 } },
                }}
              >

                {/* 3-col: creditor / agent / invoice no */}
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                  variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } } }}
                >
                  <div>
                    <label className={labelCls}>Creditor Code</label>
                    <CustomSelect
                      value={header.creditorCode}
                      options={CREDITOR_OPTIONS}
                      icon={Store}
                      placeholder="Select creditor…"
                      onChange={(code, opt) => {
                        patch("creditorCode", code);
                        patch("creditorName", opt.label);
                      }}
                    />
                    {header.creditorName && (
                      <p className="text-[11px] text-[#a39e98] mt-1 px-0.5 truncate">{header.creditorName}</p>
                    )}
                  </div>
                  <div>
                    <label className={labelCls}>Purchase Agent</label>
                    <div className={readOnlyCls}>
                      <User size={14} strokeWidth={1.7} className="shrink-0 text-[#c8c3be]" />
                      {header.purchaseAgent || "—"}
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Supplier Invoice No</label>
                    <div className="relative">
                      <Hash size={14} strokeWidth={1.7} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c8c3be] pointer-events-none" />
                      <input
                        type="text"
                        value={header.supplierInvoiceNo}
                        onChange={e => patch("supplierInvoiceNo", e.target.value)}
                        className={`${inputCls} pl-8`}
                        placeholder="INV-0001"
                      />
                    </div>
                  </div>
                </motion.div>

                {/* 3-col: date / term / supplier name */}
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                  variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } } }}
                >
                  <div>
                    <label className={labelCls}>Doc Date</label>
                    <DatePicker value={header.docDate} onChange={v => patch("docDate", v)} />
                  </div>
                  <div>
                    <label className={labelCls}>Display Term</label>
                    <div className={readOnlyCls}>
                      <Clock size={14} strokeWidth={1.7} className="shrink-0 text-[#c8c3be]" />
                      {header.displayTerm || "—"}
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Supplier Name</label>
                    <div className={readOnlyCls}>
                      <Building2 size={14} strokeWidth={1.7} className="shrink-0 text-[#c8c3be]" />
                      {header.creditorName || <span className="text-[#c8c3be]">Auto-filled from creditor</span>}
                    </div>
                  </div>
                </motion.div>

                {/* 2-col: currency */}
                <motion.div
                  className="grid grid-cols-2 gap-4"
                  variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } } }}
                >
                  <div>
                    <label className={labelCls}>Currency</label>
                    <div className={readOnlyCls}>
                      <Wallet size={14} strokeWidth={1.7} className="shrink-0 text-[#c8c3be]" />
                      {header.currencyCode || "MYR"}
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Currency Rate</label>
                    <div className={readOnlyCls}>
                      <Hash size={14} strokeWidth={1.7} className="shrink-0 text-[#c8c3be]" />
                      1.0000
                    </div>
                  </div>
                </motion.div>

                {/* Items */}
                <motion.div
                  variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } } }}
                >
                  <label className={`${labelCls} mb-3`}>Items</label>

                  {/* ── Mobile cards (< sm) ── */}
                  <div className="sm:hidden space-y-3">
                    {rows.map(row => (
                      <div key={row.id} className="rounded-xl border border-[#e6e6e6] bg-[#fafafa] p-3 space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 min-w-0">
                            <CustomSelect
                              value={row.itemCode}
                              options={ITEM_CODE_OPTIONS}
                              icon={Package}
                              placeholder="Select item…"
                              onChange={(code, opt) => patchRowMulti(row.id, { itemCode: code, description: opt.label })}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeRow(row.id)}
                            className="h-[42px] w-[42px] shrink-0 flex items-center justify-center rounded-lg border border-[#e6e6e6] text-[#a39e98] hover:text-red-500 hover:border-red-200 transition-colors"
                          >
                            <Trash2 size={14} strokeWidth={1.8} />
                          </button>
                        </div>
                        {row.description && (
                          <p className="text-[11px] text-[#a39e98] -mt-1 px-0.5 truncate">{row.description}</p>
                        )}
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <span className="text-[10px] font-medium text-[#a39e98] block mb-1">QTY</span>
                            <input
                              type="number" min="0.01" step="0.01" value={row.qty}
                              onChange={e => patchRow(row.id, "qty", Number(e.target.value))}
                              className={`${inputCls} text-right [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
                            />
                          </div>
                          <div>
                            <span className="text-[10px] font-medium text-[#a39e98] block mb-1">UOM</span>
                            <CustomSelect value={row.uom} options={UOM_OPTIONS} icon={Tag} placeholder="UOM"
                              onChange={code => patchRow(row.id, "uom", code)} />
                          </div>
                          <div>
                            <span className="text-[10px] font-medium text-[#a39e98] block mb-1">Unit Price</span>
                            <input
                              type="number" min="0" step="0.01" value={row.unitPrice}
                              onChange={e => patchRow(row.id, "unitPrice", Number(e.target.value))}
                              className={`${inputCls} text-right [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-[#e6e6e6]">
                          <div>
                            <span className="text-[10px] font-medium text-[#a39e98] block mb-0.5">Discount</span>
                            <div className="relative w-20">
                              <input
                                type="text" inputMode="decimal" value={row.discount} placeholder="0"
                                onChange={e => patchRow(row.id, "discount", e.target.value.replace(/[^0-9.]/g, ""))}
                                className="w-full h-8 text-sm text-[#31302e] bg-transparent border-none outline-none placeholder:text-[#a39e98] pr-4"
                              />
                              <span className="absolute right-0 top-1/2 -translate-y-1/2 text-sm text-[#a39e98] pointer-events-none select-none">%</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-medium text-[#a39e98] block mb-0.5">Amount</span>
                            <span className="text-sm font-semibold text-[#31302e]">{header.currencyCode} {fmtAmt(row.amount)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* ── Table (≥ sm): overflow-x scrollable ── */}
                  <div className="hidden sm:block">
                    <div style={{ minWidth: "360px" }}>

                      {/* Table header */}
                      <div
                        className={`grid items-center rounded-lg bg-[#f6f5f4] mb-1.5 text-[11px] font-semibold uppercase tracking-[0.3px] text-[#a39e98] ${isCompact ? "px-2 py-1.5" : "px-3 py-2.5"}`}
                        style={{ gridTemplateColumns: "minmax(70px,1.5fr) minmax(32px,0.7fr) minmax(50px,1fr) minmax(50px,1fr) minmax(34px,0.7fr) minmax(50px,1fr) 20px", gap: isCompact ? "4px" : "6px" }}
                      >
                        <div>Item Code</div>
                        <div className="text-center">QTY</div>
                        <div className="text-center">UOM</div>
                        <div className="text-right">Price</div>
                        <div className="text-right">Disc</div>
                        <div className="text-right">Amt</div>
                        <div />
                      </div>

                      {/* Table rows */}
                      <div className={isCompact ? "space-y-1" : "space-y-2"}>
                        {rows.map(row => {
                          const ic = isCompact
                            ? "h-[34px] w-full rounded-[6px] border border-[#e6e6e6] bg-white px-2 py-1 text-[13px] text-[#31302e] outline-none transition-all duration-150 placeholder:text-[#c8c3be] hover:border-[#b5b0aa] focus:border-[#0075de] focus:ring-2 focus:ring-[#0075de]/12"
                            : inputCls;
                          return (
                          <div key={row.id}>
                            <div
                              className="grid items-center"
                              style={{ gridTemplateColumns: "minmax(70px,1.5fr) minmax(32px,0.7fr) minmax(50px,1fr) minmax(50px,1fr) minmax(34px,0.7fr) minmax(50px,1fr) 20px", gap: isCompact ? "4px" : "6px" }}
                            >
                              <CustomSelect
                                value={row.itemCode}
                                options={ITEM_CODE_OPTIONS}
                                icon={Package}
                                compact={isCompact}
                                placeholder="Item Code"
                                onChange={(code, opt) => patchRowMulti(row.id, { itemCode: code, description: opt.label })}
                              />
                              <input
                                type="number" min="0.01" step="0.01" value={row.qty}
                                onChange={e => patchRow(row.id, "qty", Number(e.target.value))}
                                className={`${ic} text-right px-2 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
                              />
                              <CustomSelect value={row.uom} options={UOM_OPTIONS} icon={Tag} compact={isCompact} placeholder="UOM"
                                onChange={code => patchRow(row.id, "uom", code)} />
                              <input
                                type="number" min="0" step="0.01" value={row.unitPrice}
                                onChange={e => patchRow(row.id, "unitPrice", Number(e.target.value))}
                                className={`${ic} text-right [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
                              />
                              <div className="relative">
                                <input
                                  type="text" inputMode="decimal" value={row.discount} placeholder="0"
                                  onChange={e => patchRow(row.id, "discount", e.target.value.replace(/[^0-9.]/g, ""))}
                                  className={`${ic} text-right pl-2 pr-6`}
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[13px] text-[#a39e98] pointer-events-none select-none">%</span>
                              </div>
                              <input
                                type="text" value={fmtAmt(row.amount)} readOnly
                                className={`${ic} text-right bg-[#f6f5f4] text-[#a39e98]`}
                              />
                              <button
                                type="button"
                                onClick={() => removeRow(row.id)}
                                className="h-7 w-7 flex items-center justify-center rounded-md text-[#a39e98] hover:text-red-500 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 size={13} strokeWidth={1.8} />
                              </button>
                            </div>
                            {row.description && (
                              <p className="text-[11px] text-[#a39e98] pt-1 px-0.5 truncate">{row.description}</p>
                            )}
                          </div>
                        );
                        })}
                      </div>

                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={addRow}
                    className="mt-4 flex items-center gap-1.5 text-[13px] text-[#a39e98] hover:text-[#31302e] transition-colors duration-150"
                  >
                    <Plus size={14} strokeWidth={1.8} />
                    Add Item
                  </button>
                </motion.div>

                {/* Totals */}
                <motion.div
                  className="flex justify-end pt-4 border-t border-[#e6e6e6]"
                  variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } } }}
                >
                  <div className="w-64 space-y-3">
                    <div className="flex justify-between text-[14px]">
                      <span className="text-[#8f8983]">Subtotal ({header.currencyCode})</span>
                      <span className="font-medium text-[#31302e]">{fmtAmt(total)}</span>
                    </div>
                    <div className="flex justify-between text-[14px] font-semibold pt-3 border-t border-[#e6e6e6]">
                      <span className="text-[#31302e]">Total</span>
                      <span className="text-[#31302e]">{fmtAmt(total)}</span>
                    </div>
                  </div>
                </motion.div>

              </motion.div>
            </div>

            {/* ════ RIGHT: Preview ════ */}
            <div className="hidden bg-[#f6f5f4] p-4 sm:p-6 lg:flex lg:flex-col lg:p-8 lg:overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <div className="flex shrink-0 items-center justify-between mb-8">
                <h2 className="text-[16px] font-semibold text-[#31302e]">Preview</h2>
                <div className="relative isolate flex items-center gap-0.5 overflow-hidden rounded-lg bg-[#ededee] p-1">
                  <span
                    className="pointer-events-none absolute top-1 z-0 h-6 w-16 rounded-md bg-white shadow-sm transition-transform duration-200 ease-in-out"
                    style={{ left: 4, transform: previewMode === "form" ? "translateX(0)" : "translateX(68px)" }}
                  />
                  <button
                    type="button"
                    onClick={() => setPreviewMode("form")}
                    className={`relative z-10 h-6 w-16 text-[12px] font-medium transition-colors ${previewMode === "form" ? "text-[#31302e]" : "text-[#6f6a64] hover:text-[#31302e]"}`}
                  >
                    Form
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode("original")}
                    className={`relative z-10 h-6 w-16 text-[12px] font-medium transition-colors ${previewMode === "original" ? "text-[#31302e]" : "text-[#6f6a64] hover:text-[#31302e]"}`}
                  >
                    Original
                  </button>
                </div>
              </div>

              {previewMode === "original" ? (
                /* ── Original document view ── */
                <div className="flex flex-1 flex-col items-center gap-4">
                  {!imgError ? (
                    <div className="w-full max-w-2xl mx-auto rounded-xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.08)] bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={taskData.fileServer.imageUrl}
                        alt="Invoice original"
                        onError={() => setImgError(true)}
                        className="w-full h-auto block"
                      />
                    </div>
                  ) : (
                    <div className="flex w-full max-w-md flex-col items-center justify-center gap-3 rounded-xl border border-[#e6e6e6] bg-white px-8 py-12 text-center">
                      <p className="text-[13px] font-medium text-[#5f5e59]">Preview unavailable</p>
                      <p className="text-[12px] text-[#a39e98]">The document image could not be loaded.</p>
                    </div>
                  )}
                  <a
                    href={taskData.fileServer.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[13px] text-[#6f6a64] hover:text-[#31302e] transition-colors"
                  >
                    <Download size={14} strokeWidth={1.8} />
                    Download original file
                  </a>
                </div>
              ) : (
                /* ── Form preview (invoice card) ── */
                <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] max-w-2xl mx-auto w-full">

                  {/* Header */}
                  <div className="flex items-start justify-between px-8 pt-8 pb-6 border-b border-[#f0efed]">
                    <div>
                      <div className="w-10 h-10 bg-[#1a1f2e] rounded-xl flex items-center justify-center text-white mb-4">
                        <Waves size={18} strokeWidth={1.8} />
                      </div>
                      <div className="text-[14px] font-semibold text-[#31302e]">{taskData.draft.header.creditorName}</div>
                      <div className="text-[12px] text-[#8f8983] mt-0.5">Reg: {taskData.draft.header.creditorRegNo}</div>
                      <div className="text-[12px] text-[#8f8983]">Tax ID: {taskData.draft.header.creditorTaxId}</div>
                      <div className="mt-2 space-y-0.5">
                        {taskData.draft.header.creditorAddress.map((line, i) => (
                          <div key={i} className="text-[12px] text-[#8f8983]">{line}</div>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] font-semibold uppercase tracking-widest text-[#a39e98] mb-1">Invoice</div>
                      <div className="text-xl font-bold text-[#31302e]">#{header.supplierInvoiceNo || "—"}</div>
                      <div className="mt-4 space-y-1.5">
                        <div className="flex items-center justify-end gap-2 text-[12px]">
                          <span className="text-[#8f8983]">Date</span>
                          <span className="font-medium text-[#5f5e59]">{header.docDate || "—"}</span>
                        </div>
                        <div className="flex items-center justify-end gap-2 text-[12px]">
                          <span className="text-[#8f8983]">Due</span>
                          <span className="font-medium text-[#5f5e59]">{taskData.draft.header.dueDate}</span>
                        </div>
                        <div className="flex items-center justify-end gap-2 text-[12px]">
                          <span className="text-[#8f8983]">Term</span>
                          <span className="font-medium text-[#5f5e59]">{header.displayTerm || "—"}</span>
                        </div>
                        <div className="flex items-center justify-end gap-2 text-[12px]">
                          <span className="text-[#8f8983]">Currency</span>
                          <span className="font-medium text-[#5f5e59]">{header.currencyCode || "—"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Billed to + agent */}
                  <div className="grid grid-cols-2 gap-6 px-8 py-5 border-b border-[#f0efed]">
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-[#a39e98] mb-2">Billed To</div>
                      <div className="text-[13px] font-semibold text-[#31302e]">{taskData.draft.header.billedTo}</div>
                      {taskData.draft.header.billedToAddress.map((line, i) => (
                        <div key={i} className="text-[12px] text-[#8f8983] mt-0.5">{line}</div>
                      ))}
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-[#a39e98] mb-2">Purchase Agent</div>
                      <div className="text-[13px] font-semibold text-[#31302e]">{header.purchaseAgent || "—"}</div>
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-[#a39e98] mb-2 mt-4">Description</div>
                      <div className="text-[12px] text-[#5f5e59]">{taskData.draft.header.description}</div>
                    </div>
                  </div>

                  {/* Items table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-[11px] min-w-[560px]">
                      <thead>
                        <tr className="bg-[#f6f5f4] border-b border-[#f0efed]">
                          <th className="text-left font-semibold uppercase tracking-wider text-[#a39e98] pl-8 pr-2 py-3 w-[130px]">Item Code</th>
                          <th className="text-left font-semibold uppercase tracking-wider text-[#a39e98] px-2 py-3">Description</th>
                          <th className="text-right font-semibold uppercase tracking-wider text-[#a39e98] px-2 py-3 w-[36px]">QTY</th>
                          <th className="text-center font-semibold uppercase tracking-wider text-[#a39e98] px-2 py-3 w-[44px]">UOM</th>
                          <th className="text-right font-semibold uppercase tracking-wider text-[#a39e98] px-2 py-3 w-[72px]">Price</th>
                          <th className="text-right font-semibold uppercase tracking-wider text-[#a39e98] px-2 py-3 w-[44px]">Disc</th>
                          <th className="text-right font-semibold uppercase tracking-wider text-[#a39e98] pl-2 pr-8 py-3 w-[80px]">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row) => (
                          <tr key={row.id} className="border-b border-[#f0efed] hover:bg-[#f6f5f4]/60 transition-colors">
                            <td className="pl-8 pr-2 py-3.5 font-medium text-[#5f5e59] font-mono text-[11px]">{row.itemCode || "—"}</td>
                            <td className="px-2 py-3.5 text-[#6f6a64] max-w-[140px]">
                              <div className="truncate">{row.description || "—"}</div>
                            </td>
                            <td className="px-2 py-3.5 text-right text-[#6f6a64] tabular-nums">{row.qty}</td>
                            <td className="px-2 py-3.5 text-center text-[#8f8983]">{row.uom || "—"}</td>
                            <td className="px-2 py-3.5 text-right text-[#6f6a64] tabular-nums">{fmtAmt(row.unitPrice)}</td>
                            <td className="px-2 py-3.5 text-right text-[#8f8983]">{row.discount || "—"}</td>
                            <td className="pl-2 pr-8 py-3.5 text-right font-semibold text-[#37352f] tabular-nums">{fmtAmt(row.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Totals + notes */}
                  <div className="px-8 py-6 border-t border-[#f0efed]">
                    <div className="flex items-start justify-between gap-8">
                      <div className="flex-1 max-w-xs">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-[#a39e98] mb-2">Payment Info</div>
                        <p className="text-[12px] text-[#8f8983] leading-relaxed">{taskData.draft.header.notes}</p>
                      </div>
                      <div className="w-52 space-y-2 shrink-0">
                        <div className="flex justify-between text-[13px]">
                          <span className="text-[#8f8983]">Subtotal</span>
                          <span className="font-medium text-[#5f5e59] tabular-nums">{header.currencyCode} {fmtAmt(total)}</span>
                        </div>
                        <div className="flex justify-between text-[13px]">
                          <span className="text-[#8f8983]">Tax (6% SST)</span>
                          <span className="font-medium text-[#5f5e59] tabular-nums">{header.currencyCode} {fmtAmt(total * 0.06)}</span>
                        </div>
                        <div className="flex justify-between text-[14px] font-bold pt-2 border-t border-[#e6e6e6]">
                          <span className="text-[#31302e]">Total Due</span>
                          <span className="text-[#31302e] tabular-nums">{header.currencyCode} {fmtAmt(total * 1.06)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
