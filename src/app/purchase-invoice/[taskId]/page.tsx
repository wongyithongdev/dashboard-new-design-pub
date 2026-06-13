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
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
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
const inputCls    = "h-[42px] w-full rounded-[6px] border border-[#e4e4e7] bg-white px-3 py-2 text-[14px] text-[#18181b] outline-none transition-all duration-150 placeholder:text-[#d4d4d8] hover:border-[#a1a1aa] focus:border-[#0075de] focus:ring-2 focus:ring-[#0075de]/12";
const readOnlyCls = "h-[42px] w-full rounded-[6px] border border-[#e4e4e7] bg-[#fafafa] px-3 py-2 text-[14px] text-[#a1a1aa] outline-none cursor-default select-none flex items-center gap-2";
const labelCls    = "block text-[11px] font-semibold uppercase tracking-[0.5px] text-[#a1a1aa] mb-2";

/* ─── custom select ─── */
function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Select…",
  icon: Icon,
  compact = false,
  ghost = false,
}: {
  value: string;
  onChange: (code: string, option: SelectOption) => void;
  options: SelectOption[];
  placeholder?: string;
  icon: LucideIcon;
  compact?: boolean;
  ghost?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [dropUp, setDropUp] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const triggerCls = compact
    ? "h-[32px] w-full rounded-[5px] border border-[#e4e4e7] bg-white px-2 text-[13px] text-[#18181b] outline-none transition-all duration-100 placeholder:text-[#d4d4d8] hover:border-[#a1a1aa] focus:border-[#0075de] focus:ring-1 focus:ring-[#0075de]/15"
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

  const openDropdown = () => {
    if (!open) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const spaceBelow = window.innerHeight - rect.bottom;
        setDropUp(spaceBelow < 300 && rect.top > spaceBelow);
      }
    }
    setOpen(o => !o);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      {ghost ? (
        <button
          type="button"
          onClick={openDropdown}
          className={`inline-flex items-center gap-1 h-[26px] max-w-[200px] overflow-hidden rounded-[6px] pl-2.5 pr-1.5 text-[13px] font-medium transition-colors duration-75 cursor-pointer ${selected ? "bg-[#f4f4f5] hover:bg-[#e4e4e7] text-[#18181b]" : "bg-[#fafafa] hover:bg-[#f4f4f5] text-[#a1a1aa] font-normal"}`}
        >
          <span className="truncate">{selected ? selected.label : placeholder}</span>
          <ChevronDown size={11} strokeWidth={2.5} className={`shrink-0 text-[#a1a1aa] transition-transform duration-150 ml-0.5 ${open ? "rotate-180" : ""}`} />
        </button>
      ) : (
        <button
          type="button"
          onClick={openDropdown}
          className={`${triggerCls} flex items-center cursor-pointer pr-8`}
        >
          <span className={`text-[13px] truncate ${selected ? "text-[#18181b] font-medium" : "text-[#a1a1aa]"}`}>
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDown
            size={12}
            strokeWidth={2}
            className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-200 ${open ? "rotate-180 text-[#18181b]" : "text-[#a1a1aa]"}`}
          />
        </button>
      )}

      {/* Dropdown */}
      <div
        className={
          "absolute left-0 z-50 w-full min-w-[260px] bg-white rounded-[10px] " +
          "border border-[#e4e4e7] " +
          "shadow-[0_4px_6px_-1px_rgba(0,0,0,0.06),0_12px_32px_-4px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.04)] " +
          "transition-all duration-[160ms] ease-out " +
          (dropUp ? "bottom-[calc(100%+5px)] origin-bottom " : "top-[calc(100%+5px)] origin-top ") +
          (open
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : dropUp
              ? "opacity-0 scale-[0.98] translate-y-1 pointer-events-none"
              : "opacity-0 scale-[0.98] -translate-y-1 pointer-events-none")
        }
      >
        {/* Search */}
        <div className="px-1 pt-1 pb-0.5">
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search…"
            className="w-full h-[30px] px-2.5 text-[13px] rounded-[6px] bg-[#fafafa] border border-transparent outline-none focus:bg-white focus:border-[#d4d4d8] transition-all duration-100 placeholder:text-[#d4d4d8] text-[#18181b]"
          />
        </div>

        <div className="h-px bg-[#f4f4f5] mx-1 my-1" />

        {/* Options */}
        <div className="max-h-[220px] overflow-y-auto p-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {filtered.length === 0 ? (
            <div className="py-4 text-center text-[13px] text-[#a1a1aa]">No results</div>
          ) : filtered.map(o => {
            const isSel = o.code === value;
            return (
              <button
                key={o.code}
                type="button"
                onClick={() => { onChange(o.code, o); setOpen(false); setSearch(""); }}
                className={`w-full flex h-8 items-center justify-between gap-2 px-2.5 rounded-[6px] text-left transition-colors duration-75 ${isSel ? "bg-[#fafafa]" : "hover:bg-[#fafafa]"}`}
              >
                <span className={`text-[13px] truncate ${isSel ? "font-medium text-[#09090b]" : "text-[#18181b]"}`}>
                  {o.label}
                </span>
                {isSel && <Check size={12} strokeWidth={2.5} className="flex-shrink-0 text-[#3f3f46]" />}
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

function DatePicker({ value, onChange, ghost = false }: { value: string; onChange: (v: string) => void; ghost?: boolean }) {
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
      {ghost ? (
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className={`inline-flex items-center gap-1.5 h-[26px] rounded-[6px] px-2 text-[13px] transition-colors duration-75 cursor-pointer ${parsed ? "bg-[#f4f4f5] hover:bg-[#e4e4e7] text-[#18181b]" : "bg-[#fafafa] hover:bg-[#f4f4f5] text-[#a1a1aa]"}`}
        >
          <CalendarDays size={12} strokeWidth={1.8} className="shrink-0 text-[#a1a1aa]" />
          <span>{displayLabel}</span>
          <ChevronDown size={10} strokeWidth={2.5} className={`shrink-0 text-[#a1a1aa] transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className={`${inputCls} flex items-center gap-2 cursor-pointer`}
        >
          <CalendarDays size={14} strokeWidth={1.7} className="shrink-0 text-[#a1a1aa]" />
          <span className={`text-[13px] ${parsed ? "text-[#18181b] font-medium" : "text-[#a1a1aa]"}`}>
            {displayLabel}
          </span>
        </button>
      )}

      {/* Calendar popover */}
      <div
        className={
          "absolute left-0 top-[calc(100%+5px)] z-50 w-[248px] bg-white rounded-[10px] p-3 " +
          "border border-[#e4e4e7] " +
          "shadow-[0_4px_6px_-1px_rgba(0,0,0,0.06),0_12px_32px_-4px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.04)] " +
          "transition-all duration-[160ms] ease-out origin-top " +
          (open
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-[0.98] -translate-y-1 pointer-events-none")
        }
      >
        {/* Month nav */}
        <div className="flex items-center justify-between mb-2">
          <button
            type="button"
            onClick={prevMonth}
            className="h-6 w-6 flex items-center justify-center rounded-[5px] text-[#a1a1aa] hover:text-[#18181b] hover:bg-[#f4f4f5] transition-colors duration-75"
          >
            <ChevronLeft size={12} strokeWidth={2} />
          </button>
          <span className="text-[13px] font-medium text-[#18181b]">
            {MONTHS_FULL[viewMonth]} {viewYear}
          </span>
          <button
            type="button"
            onClick={nextMonth}
            className="h-6 w-6 flex items-center justify-center rounded-[5px] text-[#a1a1aa] hover:text-[#18181b] hover:bg-[#f4f4f5] transition-colors duration-75"
          >
            <ChevronRight size={12} strokeWidth={2} />
          </button>
        </div>

        {/* DOW headers */}
        <div className="grid grid-cols-7 mb-0.5">
          {DOW_LABELS.map(d => (
            <div key={d} className="h-6 flex items-center justify-center text-[11px] font-normal text-[#a1a1aa]">
              {d}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7">
          {cells.map((cell, i) => {
            if (cell === null) return <div key={`e-${i}`} className="h-7" />;
            const isSel = cell === selDay && viewMonth === selMonth && viewYear === selYear;
            const isTdy = cell === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
            return (
              <div key={cell} className="h-7 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => selectDay(cell)}
                  className={
                    "h-[26px] w-[26px] flex items-center justify-center rounded-[5px] text-[13px] transition-colors duration-75 " +
                    (isSel
                      ? "bg-[#0075de] text-white font-medium"
                      : isTdy
                      ? "text-[#0075de] font-medium underline underline-offset-2 decoration-[#0075de]/40 hover:bg-[#f4f4f5]"
                      : "text-[#18181b] hover:bg-[#f4f4f5]")
                  }
                >
                  {cell}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── submit flow ─── */
type SubmitState = "idle" | "queued" | "validating" | "submitting" | "completed" | "failed";
type StepStatus  = "pending" | "active" | "done" | "failed";

const SUBMIT_STEPS = [
  { key: "queued",     label: "In queue" },
  { key: "validating", label: "Validating" },
  { key: "submitting", label: "Submitting" },
] as const;

const STEP_ORDER = ["queued", "validating", "submitting"] as const;

function stepStatus(key: string, state: SubmitState, failedAt: string | null): StepStatus {
  if (state === "completed") return "done";
  if (state === "failed") {
    const fi = STEP_ORDER.indexOf(failedAt as never);
    const si = STEP_ORDER.indexOf(key as never);
    if (si < fi) return "done";
    if (si === fi) return "failed";
    return "pending";
  }
  const ci = STEP_ORDER.indexOf(state as never);
  const si = STEP_ORDER.indexOf(key as never);
  if (si < ci) return "done";
  if (si === ci) return "active";
  return "pending";
}

function submitProgress(state: SubmitState, failedAt: string | null) {
  if (state === "failed") {
    return ({ queued: 20, validating: 55, submitting: 82 } as Record<string, number>)[failedAt ?? "submitting"] ?? 55;
  }
  return ({ idle: 0, queued: 20, validating: 55, submitting: 82, completed: 100 } as Record<string, number>)[state] ?? 0;
}

export default function PurchaseInvoiceTaskPage() {
  const params = useParams<{ taskId: string }>();
  const taskId = params?.taskId ?? "new";

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [header, setHeader] = useState<HeaderForm>(() => initHeader(taskId));
  const [rows, setRows] = useState<DetailRow[]>(() => initRows(taskId));
  const [previewMode, setPreviewMode] = useState<"form" | "original">("form");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [failedAt,    setFailedAt]    = useState<string | null>(null);
  const [failReason,  setFailReason]  = useState("");
  const submitTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  function clearTimers() { submitTimers.current.forEach(clearTimeout); submitTimers.current = []; }

  function runSubmit() {
    clearTimers();
    setFailedAt(null);
    setFailReason("");
    setSubmitState("queued");

    const willFail = Math.random() < 0.35;

    submitTimers.current.push(setTimeout(() => setSubmitState("validating"), 700));
    submitTimers.current.push(setTimeout(() => setSubmitState("submitting"), 1900));

    if (willFail) {
      submitTimers.current.push(setTimeout(() => {
        setFailedAt("submitting");
        setFailReason("ERP connection timeout — server did not respond within 30s.");
        setSubmitState("failed");
      }, 3200));
    } else {
      submitTimers.current.push(setTimeout(() => setSubmitState("completed"), 3400));
    }
  }

  function handleSubmit() { if (submitState === "idle") runSubmit(); }
  function handleRetry()   { setSubmitState("idle"); setTimeout(runSubmit, 80); }
  function handleDismiss() { clearTimers(); setSubmitState("idle"); setFailedAt(null); setFailReason(""); }
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

  /* ── property row helper ── */
  function PropRow({ label, icon: Icon, children }: { label: string; icon: React.ElementType; children: React.ReactNode }) {
    return (
      <div className="flex min-h-[38px] items-center border-b border-[#f4f4f5] px-6 hover:bg-[#fafafa] transition-colors duration-75">
        <div className="flex w-[148px] shrink-0 items-center gap-2">
          <Icon size={13} strokeWidth={1.7} className="shrink-0 text-[#a1a1aa]" />
          <span className="text-[13px] text-[#71717a] truncate">{label}</span>
        </div>
        <div className="flex-1 min-w-0 py-1.5">{children}</div>
      </div>
    );
  }

  return (
    <>
      <div className="dashboard-shell h-screen overflow-hidden md:flex">
      <DashboardSidebar activeItem="purchase-invoice" isMobileOpen={isSidebarOpen} onMobileClose={() => setIsSidebarOpen(false)} />

      <main className="flex h-screen min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white font-sans text-[#18181b]" style={{ fontOpticalSizing: "auto" as never, fontSynthesis: "none", textRendering: "optimizeLegibility", WebkitFontSmoothing: "antialiased" }}>

        {/* ── Top bar: nav + actions only ── */}
        <div className="flex h-[var(--dashboard-header-h)] shrink-0 items-center justify-between border-b border-[#e4e4e7] px-4 sm:px-6 z-10">
          <div className="flex items-center gap-1.5 min-w-0">
            <button type="button" aria-label="Open navigation" onClick={() => setIsSidebarOpen(true)} className="shrink-0 flex size-7 items-center justify-center rounded-[7px] text-[#52525b] hover:bg-[#fafafa] hover:text-[#18181b] transition-colors xl:hidden">
              <Menu size={16} strokeWidth={1.8} />
            </button>
            <Link href="/purchase-invoice" className="hidden sm:flex items-center gap-1 text-[13px] text-[#a1a1aa] hover:text-[#18181b] transition-colors duration-75">
              <ArrowLeft size={13} strokeWidth={2} />
              Purchase Invoice
            </Link>
            <span className="hidden sm:block text-[#e4e4e7] text-[13px] mx-0.5">/</span>
            <span className="text-[13px] font-medium text-[#18181b] truncate">
              {header.creditorName || "New Invoice"}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <a href={taskData.fileServer.link} target="_blank" rel="noopener noreferrer" className="inline-flex h-7 items-center gap-1.5 rounded-[7px] border border-[#e4e4e7] bg-white px-2.5 text-[12px] font-medium text-[#3f3f46] outline-none transition-colors duration-75 hover:bg-[#fafafa]">
              <Download size={12} strokeWidth={1.8} />
              <span className="hidden sm:inline">Download</span>
            </a>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitState !== "idle"}
              className="inline-flex h-7 items-center gap-1.5 rounded-[7px] bg-[#0075de] px-2.5 text-[12px] font-medium text-white shadow-[0_1px_2px_rgba(0,117,222,0.2)] outline-none transition-colors duration-75 hover:bg-[#005bab] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Submit Invoice
            </button>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="min-h-0 flex-1 overflow-y-auto lg:overflow-hidden lg:h-full">
          <div className="w-full grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] lg:h-full">

            {/* ════ LEFT: Attio record view ════ */}
            <div className="border-b lg:border-b-0 lg:border-r border-[#e4e4e7] lg:overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

              {/* Page title block */}
              <div className="px-6 pt-10 pb-7">
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}>
                  <h1 className="text-[30px] font-bold tracking-[-0.6px] text-[#09090b] leading-tight mb-3">
                    {header.creditorName || <span className="text-[#d4d4d8]">Supplier name</span>}
                  </h1>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-5 items-center rounded-[5px] bg-[#e9f7ef] px-1.5 text-[11px] font-medium text-[#1f7a4d]">Ready</span>
                    <span className="text-[12px] text-[#a1a1aa] font-mono">{header.supplierInvoiceNo || "—"}</span>
                  </div>
                </motion.div>
              </div>

              {/* Property rows */}
              <motion.div
                className="border-t border-[#f4f4f5]"
                initial="hidden"
                animate="visible"
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.04 } } }}
              >
                {([
                  { label: "Creditor code", icon: Store, content: (
                    <CustomSelect value={header.creditorCode} options={CREDITOR_OPTIONS} icon={Store} placeholder="Select creditor…" ghost
                      onChange={(code, opt) => { patch("creditorCode", code); patch("creditorName", opt.label); }} />
                  )},
                  { label: "Supplier name", icon: Building2, content: (
                    <div className="flex items-center h-[30px] px-1 text-[13px] text-[#18181b]">
                      {header.creditorName || <span className="text-[#a1a1aa]">Auto-filled from creditor</span>}
                    </div>
                  )},
                  { label: "Invoice no", icon: Hash, content: (
                    <input type="text" value={header.supplierInvoiceNo} onChange={e => patch("supplierInvoiceNo", e.target.value)}
                      className="h-[26px] rounded-[6px] border border-transparent bg-[#f4f4f5] px-2 text-[13px] text-[#18181b] outline-none placeholder:text-[#a1a1aa] hover:bg-[#e4e4e7] focus:border-[#0075de] focus:bg-white focus:ring-1 focus:ring-[#0075de]/20 transition-all duration-75"
                      placeholder="INV-0001" />
                  )},
                  { label: "Doc date", icon: CalendarDays, content: (
                    <DatePicker value={header.docDate} onChange={v => patch("docDate", v)} ghost />
                  )},
                  { label: "Purchase agent", icon: User, content: (
                    <div className="flex items-center h-[30px] px-1 text-[13px] text-[#18181b]">
                      {header.purchaseAgent || <span className="text-[#a1a1aa]">—</span>}
                    </div>
                  )},
                  { label: "Payment term", icon: Clock, content: (
                    <div className="flex items-center h-[30px] px-1 text-[13px] text-[#18181b]">
                      {header.displayTerm || <span className="text-[#a1a1aa]">—</span>}
                    </div>
                  )},
                  { label: "Currency", icon: Wallet, content: (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 h-[26px] rounded-[6px] bg-[#f4f4f5] px-2 text-[13px] text-[#18181b]">
                        <Wallet size={12} strokeWidth={1.8} className="text-[#a1a1aa]" />
                        {header.currencyCode || "MYR"}
                      </span>
                      <span className="text-[12px] text-[#a1a1aa]">Rate 1.0000</span>
                    </div>
                  )},
                ] as const).map(({ label, icon, content }) => (
                  <motion.div key={label} variants={{ hidden: { opacity: 0, y: 4 }, visible: { opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] } } }}>
                    <PropRow label={label} icon={icon}>{content}</PropRow>
                  </motion.div>
                ))}
              </motion.div>

              {/* Items section */}
              <motion.div
                className="border-t border-[#f4f4f5] px-6 pt-5 pb-3"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1], delay: 0.32 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Package size={13} strokeWidth={1.7} className="text-[#a1a1aa]" />
                  <p className="text-[12px] font-semibold text-[#71717a] uppercase tracking-[0.4px]">Line items</p>
                </div>

                {/* Table header */}
                <div className="grid mb-1.5 text-[11px] font-medium text-[#a1a1aa]"
                  style={{ gridTemplateColumns: "minmax(80px,1.6fr) minmax(36px,0.6fr) minmax(56px,1fr) minmax(56px,1fr) minmax(38px,0.6fr) minmax(56px,1fr) 24px", gap: "6px" }}>
                  <div>Item code</div>
                  <div className="text-center">Qty</div>
                  <div className="text-center">UOM</div>
                  <div className="text-right">Price</div>
                  <div className="text-right">Disc</div>
                  <div className="text-right">Amount</div>
                  <div />
                </div>

                {/* Rows */}
                <div className="space-y-1.5">
                  {rows.map(row => {
                    const ic = "h-[32px] w-full rounded-[5px] border border-[#e4e4e7] bg-white px-2 text-[13px] text-[#18181b] outline-none transition-all duration-100 placeholder:text-[#d4d4d8] hover:border-[#a1a1aa] focus:border-[#0075de] focus:ring-1 focus:ring-[#0075de]/15";
                    return (
                      <div key={row.id}>
                        <div className="grid items-center" style={{ gridTemplateColumns: "minmax(80px,1.6fr) minmax(36px,0.6fr) minmax(56px,1fr) minmax(56px,1fr) minmax(38px,0.6fr) minmax(56px,1fr) 24px", gap: "6px" }}>
                          <CustomSelect value={row.itemCode} options={ITEM_CODE_OPTIONS} icon={Package} compact placeholder="Item code"
                            onChange={(code, opt) => patchRowMulti(row.id, { itemCode: code, description: opt.label })} />
                          <input type="number" min="0.01" step="0.01" value={row.qty} onChange={e => patchRow(row.id, "qty", Number(e.target.value))}
                            className={`${ic} text-right px-1.5 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`} />
                          <CustomSelect value={row.uom} options={UOM_OPTIONS} icon={Tag} compact placeholder="UOM"
                            onChange={code => patchRow(row.id, "uom", code)} />
                          <input type="number" min="0" step="0.01" value={row.unitPrice} onChange={e => patchRow(row.id, "unitPrice", Number(e.target.value))}
                            className={`${ic} text-right [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`} />
                          <div className="relative">
                            <input type="text" inputMode="decimal" value={row.discount} placeholder="0"
                              onChange={e => patchRow(row.id, "discount", e.target.value.replace(/[^0-9.]/g, ""))}
                              className={`${ic} text-right pl-1.5 pr-5`} />
                            <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[12px] text-[#a1a1aa] pointer-events-none select-none">%</span>
                          </div>
                          <input type="text" value={fmtAmt(row.amount)} readOnly className={`${ic} text-right bg-[#fafafa] text-[#a1a1aa] cursor-default`} />
                          <button type="button" onClick={() => removeRow(row.id)} className="flex size-6 items-center justify-center rounded-[5px] text-[#d4d4d8] hover:text-red-400 hover:bg-red-50 transition-colors">
                            <Trash2 size={12} strokeWidth={1.8} />
                          </button>
                        </div>
                        {row.description && <p className="mt-0.5 px-0.5 text-[11px] text-[#a1a1aa] truncate">{row.description}</p>}
                      </div>
                    );
                  })}
                </div>

                <button type="button" onClick={addRow} className="mt-3 flex items-center gap-1.5 text-[12px] text-[#a1a1aa] hover:text-[#3f3f46] transition-colors duration-100">
                  <Plus size={13} strokeWidth={1.8} />
                  Add line
                </button>
              </motion.div>

              {/* Total block */}
              <motion.div
                className="border-t border-[#f4f4f5] mx-6 mt-2 py-6"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
              >
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[11px] font-medium text-[#a1a1aa] mb-0.5">Total due</p>
                    <p className="text-[28px] font-bold tracking-[-0.6px] text-[#09090b] tabular-nums leading-none">
                      {header.currencyCode} {fmtAmt(total)}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="flex items-center justify-end gap-6 text-[13px]">
                      <span className="text-[#a1a1aa]">Subtotal</span>
                      <span className="font-medium text-[#18181b] tabular-nums w-28 text-right">{fmtAmt(total)}</span>
                    </div>
                    <div className="flex items-center justify-end gap-6 text-[13px]">
                      <span className="text-[#a1a1aa]">Tax (6% SST)</span>
                      <span className="font-medium text-[#18181b] tabular-nums w-28 text-right">{fmtAmt(total * 0.06)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* ════ RIGHT: Preview ════ */}
            <div className="hidden bg-white lg:flex lg:flex-col lg:overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

              {/* Preview toolbar */}
              <div className="flex h-[var(--dashboard-header-h)] shrink-0 items-center justify-between border-b border-[#e4e4e7] bg-white px-6">
                <p className="text-[12px] font-medium text-[#a1a1aa]">Preview</p>
                <div className="relative isolate flex items-center gap-0.5 overflow-hidden rounded-[7px] bg-[#f4f4f5] p-[3px]">
                  <span className="pointer-events-none absolute top-[3px] z-0 h-[22px] w-[52px] rounded-[5px] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition-transform duration-200 ease-in-out"
                    style={{ left: 3, transform: previewMode === "form" ? "translateX(0)" : "translateX(55px)" }} />
                  {(["form", "original"] as const).map(m => (
                    <button key={m} type="button" onClick={() => setPreviewMode(m)}
                      className={`relative z-10 h-[22px] w-[52px] text-[12px] font-medium capitalize transition-colors ${previewMode === m ? "text-[#18181b]" : "text-[#a1a1aa] hover:text-[#18181b]"}`}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {previewMode === "original" ? (
                  <div className="flex flex-col items-center gap-4 p-6">
                    {!imgError ? (
                      <div className="w-full max-w-2xl mx-auto rounded-xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.08)] bg-white">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={taskData.fileServer.imageUrl} alt="Invoice original" onError={() => setImgError(true)} className="w-full h-auto block" />
                      </div>
                    ) : (
                      <div className="flex w-full max-w-md flex-col items-center justify-center gap-2 rounded-xl border border-[#e4e4e7] bg-white px-8 py-12 text-center">
                        <p className="text-[13px] font-medium text-[#3f3f46]">Preview unavailable</p>
                        <p className="text-[12px] text-[#a1a1aa]">The document image could not be loaded.</p>
                      </div>
                    )}
                    <a href={taskData.fileServer.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[12px] text-[#a1a1aa] hover:text-[#18181b] transition-colors">
                      <Download size={13} strokeWidth={1.8} />
                      Download original
                    </a>
                  </div>
                ) : (
                  /* ── Notion document invoice ── */
                  <div className="max-w-[600px] mx-auto px-8 py-10 w-full">

                    {/* Eyebrow + invoice number */}
                    <div className="mb-8">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[#a1a1aa] mb-2">Invoice</p>
                      <h2 className="text-[28px] font-bold tracking-[-0.5px] text-[#09090b] leading-none">
                        #{header.supplierInvoiceNo || "—"}
                      </h2>
                      <div className="flex items-center gap-2 mt-2.5">
                        <span className="inline-flex items-center rounded-full bg-[#e9f7ef] px-2 py-0.5 text-[11px] font-medium text-[#1f7a4d]">Ready</span>
                        <span className="text-[12px] text-[#a1a1aa]">{taskData.draft.header.description}</span>
                      </div>
                    </div>

                    <div className="border-t border-[#f4f4f5] mb-6" />

                    {/* From / To */}
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.4px] text-[#a1a1aa] mb-2">From</p>
                        <p className="text-[13px] font-semibold text-[#18181b] mb-1">{taskData.draft.header.creditorName}</p>
                        <p className="text-[12px] text-[#71717a]">Reg: {taskData.draft.header.creditorRegNo}</p>
                        <p className="text-[12px] text-[#71717a]">Tax ID: {taskData.draft.header.creditorTaxId}</p>
                        <div className="mt-1.5 space-y-px">
                          {taskData.draft.header.creditorAddress.map((line, i) => (
                            <p key={i} className="text-[12px] text-[#a1a1aa]">{line}</p>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.4px] text-[#a1a1aa] mb-2">Billed To</p>
                        <p className="text-[13px] font-semibold text-[#18181b] mb-1">{taskData.draft.header.billedTo}</p>
                        {taskData.draft.header.billedToAddress.map((line, i) => (
                          <p key={i} className="text-[12px] text-[#a1a1aa] mt-0.5">{line}</p>
                        ))}
                      </div>
                    </div>

                    {/* Metadata strip */}
                    <div className="grid grid-cols-4 gap-4 border-t border-b border-[#f4f4f5] py-4 mb-7">
                      {([
                        ["Date", header.docDate || "—"],
                        ["Due", taskData.draft.header.dueDate],
                        ["Term", header.displayTerm],
                        ["Agent", header.purchaseAgent || "—"],
                      ] as const).map(([k, v]) => (
                        <div key={k}>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.4px] text-[#a1a1aa] mb-1">{k}</p>
                          <p className="text-[13px] font-medium text-[#18181b]">{v}</p>
                        </div>
                      ))}
                    </div>

                    {/* Line items */}
                    <div className="mb-7">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.4px] text-[#a1a1aa] mb-3">Line Items</p>
                      <div className="grid text-[11px] font-medium text-[#a1a1aa] border-b border-[#e4e4e7] pb-2"
                        style={{ gridTemplateColumns: "minmax(80px,1.3fr) minmax(90px,2fr) 40px 72px 38px 76px" }}>
                        <div>Code</div>
                        <div className="pl-1">Description</div>
                        <div className="text-right">Qty</div>
                        <div className="text-right">Price</div>
                        <div className="text-right">Disc</div>
                        <div className="text-right">Amount</div>
                      </div>
                      {rows.map(row => (
                        <div key={row.id}
                          className="grid items-center border-b border-[#f4f4f5] py-2.5 hover:bg-[#fafafa] -mx-2 px-2 rounded-[4px] transition-colors duration-75"
                          style={{ gridTemplateColumns: "minmax(80px,1.3fr) minmax(90px,2fr) 40px 72px 38px 76px" }}>
                          <div className="font-mono text-[11px] text-[#71717a] truncate">{row.itemCode || "—"}</div>
                          <div className="text-[12px] text-[#3f3f46] truncate pl-1">{row.description || "—"}</div>
                          <div className="text-[12px] text-[#3f3f46] text-right tabular-nums">{row.qty}</div>
                          <div className="text-[12px] text-[#3f3f46] text-right tabular-nums">{fmtAmt(row.unitPrice)}</div>
                          <div className="text-[12px] text-[#a1a1aa] text-right">{row.discount ? `${row.discount}%` : "—"}</div>
                          <div className="text-[12px] font-semibold text-[#18181b] text-right tabular-nums">{fmtAmt(row.amount)}</div>
                        </div>
                      ))}
                    </div>

                    {/* Totals */}
                    <div className="flex justify-end mb-8">
                      <div className="w-52 space-y-1.5">
                        <div className="flex justify-between text-[13px]">
                          <span className="text-[#71717a]">Subtotal</span>
                          <span className="tabular-nums text-[#18181b]">{header.currencyCode} {fmtAmt(total)}</span>
                        </div>
                        <div className="flex justify-between text-[13px]">
                          <span className="text-[#71717a]">Tax (6% SST)</span>
                          <span className="tabular-nums text-[#18181b]">{header.currencyCode} {fmtAmt(total * 0.06)}</span>
                        </div>
                        <div className="flex justify-between items-baseline pt-2.5 border-t border-[#e4e4e7]">
                          <span className="text-[13px] font-semibold text-[#18181b]">Total</span>
                          <span className="text-[20px] font-bold tracking-[-0.4px] tabular-nums text-[#09090b] leading-none">
                            {header.currencyCode} {fmtAmt(total * 1.06)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Payment info */}
                    <div className="border-t border-[#f4f4f5] pt-5 pb-10">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.4px] text-[#a1a1aa] mb-2">Payment Info</p>
                      <p className="text-[12px] text-[#a1a1aa] leading-relaxed">{taskData.draft.header.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>

    {/* ── Submit toast (outside overflow-hidden container) ── */}
    <AnimatePresence>
        {submitState !== "idle" && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-5 right-5 z-50 w-[280px] overflow-hidden rounded-[12px] border border-[#e4e4e7] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.04)]"
          >
            {/* Progress bar */}
            <div className="h-[3px] bg-[#f4f4f5]">
              <motion.div
                className={submitState === "completed" ? "h-full bg-[#16a34a]" : submitState === "failed" ? "h-full bg-[#dc2626]" : "h-full bg-[#0075de]"}
                initial={{ width: "0%" }}
                animate={{ width: `${submitProgress(submitState, failedAt)}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>

            {/* Body */}
            <div className="px-4 py-3.5">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[13px] font-semibold ${submitState === "failed" ? "text-[#dc2626]" : "text-[#18181b]"}`}>
                  {submitState === "completed" ? "Invoice submitted" : submitState === "failed" ? "Submission failed" : "Submitting invoice…"}
                </span>
                {(submitState === "completed" || submitState === "failed") && (
                  <button type="button" onClick={handleDismiss} className="flex size-5 items-center justify-center rounded-[4px] text-[#a1a1aa] hover:bg-[#f4f4f5] hover:text-[#18181b] transition-colors duration-75">
                    <X size={12} strokeWidth={2} />
                  </button>
                )}
              </div>

              {/* Steps */}
              <div className="space-y-2.5">
                {SUBMIT_STEPS.map(step => {
                  const status = stepStatus(step.key, submitState, failedAt);
                  return (
                    <div key={step.key} className="flex items-center gap-2.5">
                      {status === "done" ? (
                        <span className="flex size-[18px] shrink-0 items-center justify-center rounded-full bg-[#dcfce7]">
                          <Check size={10} strokeWidth={2.5} className="text-[#16a34a]" />
                        </span>
                      ) : status === "failed" ? (
                        <span className="flex size-[18px] shrink-0 items-center justify-center rounded-full bg-[#fee2e2]">
                          <X size={9} strokeWidth={2.5} className="text-[#dc2626]" />
                        </span>
                      ) : status === "active" ? (
                        <span className="size-[18px] shrink-0 rounded-full border-[2px] border-[#e4e4e7] border-t-[#0075de] animate-spin" />
                      ) : (
                        <span className="flex size-[18px] shrink-0 items-center justify-center">
                          <span className="size-[5px] rounded-full bg-[#d4d4d8]" />
                        </span>
                      )}
                      <span className={`text-[13px] leading-none ${
                        status === "failed" ? "font-medium text-[#dc2626]" :
                        status === "active" ? "font-medium text-[#18181b]" :
                        status === "done"   ? "text-[#71717a]" : "text-[#a1a1aa]"
                      }`}>
                        {status === "active" ? `${step.label}…` : step.label}
                      </span>
                    </div>
                  );
                })}

                {/* Completed row */}
                <AnimatePresence>
                  {submitState === "completed" && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="flex items-center gap-2.5">
                      <span className="flex size-[18px] shrink-0 items-center justify-center rounded-full bg-[#dcfce7]">
                        <Check size={10} strokeWidth={2.5} className="text-[#16a34a]" />
                      </span>
                      <span className="text-[13px] font-medium text-[#16a34a]">Completed</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Failed reason + actions */}
              <AnimatePresence>
                {submitState === "failed" && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, ease: "easeOut" }} className="mt-3.5 space-y-2.5">
                    <div className="h-px bg-[#f4f4f5]" />
                    <div>
                      <label className="block text-[11px] font-medium text-[#71717a] mb-1.5">Reason</label>
                      <textarea
                        value={failReason}
                        onChange={e => setFailReason(e.target.value)}
                        rows={2}
                        placeholder="Describe what went wrong…"
                        className="w-full resize-none rounded-[7px] border border-[#e4e4e7] bg-[#fafafa] px-2.5 py-2 text-[12px] text-[#18181b] outline-none placeholder:text-[#d4d4d8] focus:border-[#0075de] focus:bg-white focus:ring-1 focus:ring-[#0075de]/15 transition-all duration-100"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={handleRetry} className="flex-1 h-7 rounded-[7px] bg-[#18181b] text-[12px] font-medium text-white hover:bg-[#3f3f46] transition-colors duration-75">
                        Retry
                      </button>
                      <button type="button" onClick={handleDismiss} className="flex-1 h-7 rounded-[7px] border border-[#e4e4e7] bg-white text-[12px] font-medium text-[#71717a] hover:bg-[#fafafa] transition-colors duration-75">
                        Dismiss
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
