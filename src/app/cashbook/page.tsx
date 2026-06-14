"use client";

import { DashboardSidebar } from "@/components/sidebar";
import {
  ArrowDownLeft,
  ArrowUpDown,
  ArrowUpRight,
  Box,
  Building2,
  Calculator,
  CalendarDays,
  Car,
  Check,
  ChevronDown,
  ChevronUp,
  Circle,
  Code2,
  Cpu,
  Droplets,
  Ellipsis,
  Factory,
  Film,
  TrendingUp,
  FlaskConical,
  Flame,
  Globe,
  GraduationCap,
  Hash,
  HeartPulse,
  Info,
  Landmark,
  ListFilter,
  Megaphone,
  Menu,
  Monitor,
  Newspaper,
  Package,
  Phone,
  Plane,
  Plus,
  Recycle,
  Scale,
  Search,
  Shield,
  Shirt,
  ShoppingCart,
  Sofa,
  Store,
  Tag,
  Truck,
  Utensils,
  Wallet,
  Wheat,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import React, { useEffect, useRef, useState } from "react";

const cashbookEntries = [
  {
    docNo: "CB-2026-0001",
    date: "08 Jun 2026",
    payTo: "OfficePro Supplies",
    description: "Payment for office supplies",
    reference: "PI-2026-0001",
    status: "PaymentVoucher" as const,
    amount: "RM 1,240.00",
    details: [
      { description: "A4 Paper Ream 80gsm", amount: 850.00 },
      { description: "Ballpoint Pen Assorted", amount: 60.00 },
      { description: "Stapler Heavy Duty", amount: 330.00 },
    ],
  },
  {
    docNo: "CB-2026-0002",
    date: "07 Jun 2026",
    payTo: "Berjaya Holdings Sdn Bhd",
    description: "Customer payment received",
    reference: "SI-2026-0042",
    status: "OfficialReceipt" as const,
    amount: "RM 3,500.00",
    details: [
      { description: "Service fee — June 2026", amount: 3500.00 },
    ],
  },
  {
    docNo: "CB-2026-0003",
    date: "06 Jun 2026",
    payTo: "Northstar Logistics",
    description: "Freight charges payment",
    reference: "PI-2026-0003",
    status: "PaymentVoucher" as const,
    amount: "RM 3,420.00",
    details: [
      { description: "Freight Charges — Peninsular", amount: 1800.00 },
      { description: "Pallet Wrapping Service", amount: 1020.00 },
      { description: "Handling & Storage Fee", amount: 600.00 },
    ],
  },
  {
    docNo: "CB-2026-0004",
    date: "05 Jun 2026",
    payTo: "Mega Retail Trading",
    description: "Sales collection received",
    reference: "SI-2026-0039",
    status: "OfficialReceipt" as const,
    amount: "RM 2,100.00",
    details: [
      { description: "Monthly retail sales collection", amount: 2100.00 },
    ],
  },
  {
    docNo: "CB-2026-0005",
    date: "04 Jun 2026",
    payTo: "Greenfield Packaging",
    description: "Packaging supplies payment",
    reference: "PI-2026-0005",
    status: "PaymentVoucher" as const,
    amount: "RM 2,105.45",
    details: [
      { description: "Corrugated Box 40x30x30cm", amount: 925.00 },
      { description: "Bubble Wrap Roll 1m x 50m", amount: 468.00 },
      { description: "Stretch Film 500mm x 300m", amount: 712.45 },
    ],
  },
  {
    docNo: "CB-2026-0006",
    date: "03 Jun 2026",
    payTo: "TechVenture Sdn Bhd",
    description: "Software subscription received",
    reference: "SI-2026-0037",
    status: "OfficialReceipt" as const,
    amount: "RM 498.00",
    details: [
      { description: "Annual software licence", amount: 498.00 },
    ],
  },
  {
    docNo: "CB-2026-0007",
    date: "02 Jun 2026",
    payTo: "Summit Maintenance",
    description: "Maintenance service payment",
    reference: "PI-2026-0007",
    status: "PaymentVoucher" as const,
    amount: "RM 1,780.20",
    details: [
      { description: "Air-Cond Servicing (Split Unit)", amount: 720.00 },
      { description: "Water Filter Replacement", amount: 340.20 },
      { description: "General Cleaning Service", amount: 720.00 },
    ],
  },
  {
    docNo: "CB-2026-0008",
    date: "01 Jun 2026",
    payTo: "Acme Retail Corp",
    description: "Client deposit received",
    reference: "SI-2026-0034",
    status: "OfficialReceipt" as const,
    amount: "RM 5,000.00",
    details: [
      { description: "Project deposit — Q3 contract", amount: 5000.00 },
    ],
  },
];

const currencyMeta: Record<string, { bg: string; text: string }> = {
  MYR: { bg: "#e9f7ef", text: "#1a7a46" },
  USD: { bg: "#eff6ff", text: "#1d4ed8" },
  SGD: { bg: "#fff7ed", text: "#c2410c" },
};

const balanceAccounts = [
  { account: "Cash on Hand",        currency: "MYR", rate: 1.0000, original: 12500.00, balance: 12500.00, emoji: "💵" },
  { account: "Maybank Current Acc", currency: "MYR", rate: 1.0000, original: 48320.75, balance: 48320.75, emoji: "🏦" },
  { account: "CIMB Savings Acc",    currency: "MYR", rate: 1.0000, original: 21900.00, balance: 21900.00, emoji: "🏛️" },
  { account: "USD Operating Acc",   currency: "USD", rate: 4.7200,  original: 8000.00,  balance: 37760.00, emoji: "💱" },
  { account: "SGD Collection Acc",  currency: "SGD", rate: 3.5500,  original: 3500.00,  balance: 12425.00, emoji: "📥" },
  { account: "Petty Cash",          currency: "MYR", rate: 1.0000, original: 500.00,   balance: 500.00,   emoji: "🪙"  },
];

const sortOptions = [
  { key: "date",   label: "Date",   helper: "Newest first" },
  { key: "amount", label: "Amount", helper: "Highest first" },
  { key: "payTo",  label: "Pay to", helper: "A to Z" },
  { key: "docNo",  label: "Doc No", helper: "Latest first" },
  { key: "status", label: "Status", helper: "By type" },
] as const;

type CashbookEntry = (typeof cashbookEntries)[number];
type SortKey = (typeof sortOptions)[number]["key"];
type SortDirection = "asc" | "desc";
type StatusFilter = "all" | CashbookEntry["status"];

const statusOptions = [
  { key: "all",              label: "All types",       helper: "Show every entry" },
  { key: "PaymentVoucher",   label: "Payment Voucher", helper: "Outgoing payments" },
  { key: "OfficialReceipt",  label: "Official Receipt",helper: "Incoming receipts" },
] as const;

const defaultSortDirections: Record<SortKey, SortDirection> = {
  date: "desc", amount: "desc", payTo: "asc", docNo: "desc", status: "asc",
};

function parseAmount(amount: string) {
  return Number(amount.replace(/[^\d.]/g, ""));
}

function getSortValue(entry: CashbookEntry, sortKey: SortKey) {
  if (sortKey === "amount") return parseAmount(entry.amount);
  if (sortKey === "date") return new Date(entry.date).getTime();
  return entry[sortKey];
}

type EntityMeta = { color: string; Icon: React.ElementType };

const entityMetaMap: Record<string, EntityMeta> = {
  "OfficePro Supplies":   { color: "#dd5b00", Icon: Box },
  "Northstar Logistics":  { color: "#7c3aed", Icon: Truck },
  "Greenfield Packaging": { color: "#2a9d99", Icon: Package },
  "Summit Maintenance":   { color: "#b45309", Icon: Wrench },
};

const industryPatterns: Array<{ pattern: RegExp; meta: EntityMeta }> = [
  { pattern: /food|bakery|caf[eé]|cater|restaur|bever|grocer|dairy|meat|seafood|spice|organic|kitchen|confection/i,    meta: { color: "#16a34a", Icon: Utensils } },
  { pattern: /medical|clinic|hospital|pharma|health|drug|lab|diagnos|dental|optom|biotech|surgical/i,                  meta: { color: "#0891b2", Icon: HeartPulse } },
  { pattern: /construct|build|contrac|archit|cement|concrete|steel|roofing|plumb|drainage|civil|infra/i,               meta: { color: "#d97706", Icon: Building2 } },
  { pattern: /auto|car\b|vehicle|motor|tyre|tire|workshop|garage|spare.?part|automo/i,                                 meta: { color: "#1d4ed8", Icon: Car } },
  { pattern: /retail|mart|supermarket|hypermarket|mini.?market|bazaar|department.?store|convenience/i,                 meta: { color: "#7c3aed", Icon: ShoppingCart } },
  { pattern: /bank|financ|fund|invest|insur|credit|loan|leas|capital|asset.?manage|wealth/i,                          meta: { color: "#0f766e", Icon: Landmark } },
  { pattern: /software|tech|digital|cloud|web|app\b|system|solution|network|cyber|data|saas|develop|i\.t\b/i,         meta: { color: "#6366f1", Icon: Code2 } },
  { pattern: /telecom|telco|mobile|cellular|internet|broadband|wifi|fibre|fiber|satell/i,                              meta: { color: "#2563eb", Icon: Phone } },
  { pattern: /educat|school|college|universi|tuition|training|learn|academy|instit|skill/i,                            meta: { color: "#b45309", Icon: GraduationCap } },
  { pattern: /property|real.?estate|realty|hous|developer|rental|leasehold|strata/i,                                   meta: { color: "#78350f", Icon: Building2 } },
  { pattern: /energy|electric|solar|power|fuel|petroleum|gas\b|oil\b|petrochem|utility|utilities/i,                   meta: { color: "#ca8a04", Icon: Flame } },
  { pattern: /agri|farm|plantat|crop|seed|fertiliz|pesticid|vegetable|fruit|livestock/i,                               meta: { color: "#65a30d", Icon: Wheat } },
  { pattern: /manufactur|factory|industri|product|assembly|fabricat/i,                                                 meta: { color: "#475569", Icon: Factory } },
  { pattern: /fashion|textile|fabric|garment|apparel|cloth|tailor|sewi|uniform|linen/i,                                meta: { color: "#db2777", Icon: Shirt } },
  { pattern: /securi|guard|surveil|cctv|alarm|protect|patrol|investigat/i,                                             meta: { color: "#1e40af", Icon: Shield } },
  { pattern: /travel|tourism|hotel|resort|hostel|airline|flight|holiday|tour\b|hospitality|accommo/i,                 meta: { color: "#0ea5e9", Icon: Plane } },
  { pattern: /media|broadcast|film|cinema|studio|entertain|music|event.?organis/i,                                     meta: { color: "#9333ea", Icon: Film } },
  { pattern: /legal|law.?firm|consult|audit|advisory|counsel|attorney|advocate|notary/i,                               meta: { color: "#374151", Icon: Scale } },
  { pattern: /waste|recycl|environ|greentech|eco\b|sewage|disposal|scrap/i,                                            meta: { color: "#15803d", Icon: Recycle } },
  { pattern: /chemic|polymer|plastic|rubber|compound|resin|adhesive|solvent|pigment/i,                                 meta: { color: "#9333ea", Icon: FlaskConical } },
  { pattern: /electron|semicond|circuit|component|pcb|sensor|batter|chip|module/i,                                     meta: { color: "#0284c7", Icon: Cpu } },
  { pattern: /furnitur|sofa|chair|table\b|interior|decor|carpet|curtain|furnish|fitout/i,                              meta: { color: "#92400e", Icon: Sofa } },
  { pattern: /import|export|trading|wholesale|distribut|supply.?chain|cargo|freight.?forward/i,                       meta: { color: "#0369a1", Icon: Globe } },
  { pattern: /account|bookkeep|tax\b|payroll|gst|sst|erp\b/i,                                                         meta: { color: "#4b5563", Icon: Calculator } },
  { pattern: /clean|janitor|sanitiz|pest.?control|laundry|hygiene|facility.?manage|housekeep/i,                       meta: { color: "#0891b2", Icon: Droplets } },
  { pattern: /publish|print|book\b|magazine|newspa|catalog|brochure|press/i,                                           meta: { color: "#6d28d9", Icon: Newspaper } },
  { pattern: /advertis|marketing|pr\b|brand|promot|campaign/i,                                                         meta: { color: "#ea580c", Icon: Megaphone } },
  { pattern: /monitor|display|screen|computer|laptop|desktop|printer|scanner/i,                                        meta: { color: "#0369a1", Icon: Monitor } },
  { pattern: /zap|electric|wiring|power.?supply/i,                                                                     meta: { color: "#ca8a04", Icon: Zap } },
];

function resolveEntityMeta(name: string): EntityMeta {
  if (entityMetaMap[name]) return entityMetaMap[name];
  for (const { pattern, meta } of industryPatterns) {
    if (pattern.test(name)) return meta;
  }
  return { color: "#615d59", Icon: Store };
}

function DocNoCell({ docNo }: Readonly<{ docNo: string }>) {
  return (
    <span className="whitespace-nowrap text-[14px] font-medium leading-5 text-[#2c2c2b] max-xl:text-[13px]">
      {docNo}
    </span>
  );
}

function PayToCell({ payTo }: Readonly<{ payTo: string }>) {
  const { color, Icon } = resolveEntityMeta(payTo);
  return (
    <span className="inline-flex max-w-full items-center gap-2">
      <Icon size={16} strokeWidth={1.9} aria-hidden="true" className="shrink-0" style={{ color }} />
      <span className="truncate text-[14px] font-medium leading-5 text-[#31302e]">{payTo}</span>
    </span>
  );
}

function DateCell({ date }: Readonly<{ date: string }>) {
  const parts = date.split(" ");
  const month = parts[1] ?? "";
  const hasTime = parts.length > 3;
  const dateText = hasTime ? parts.slice(0, 3).join(" ") : date;
  const timeText = hasTime ? parts[3].slice(0, 5) : null;
  const { bg, text, icon } =
    {
      Jan: { bg: "#eff6ff", text: "#1d4ed8", icon: "#60a5fa" },
      Feb: { bg: "#f5f3ff", text: "#6d28d9", icon: "#a78bfa" },
      Mar: { bg: "#ecfdf5", text: "#047857", icon: "#34d399" },
      Apr: { bg: "#f0fdf4", text: "#15803d", icon: "#4ade80" },
      May: { bg: "#fff7ed", text: "#c2410c", icon: "#fb923c" },
      Jun: { bg: "#eff6ff", text: "#315c9c", icon: "#6da4ef" },
      Jul: { bg: "#fefce8", text: "#a16207", icon: "#facc15" },
      Aug: { bg: "#fff1f2", text: "#be123c", icon: "#fb7185" },
      Sep: { bg: "#f7fee7", text: "#4d7c0f", icon: "#a3e635" },
      Oct: { bg: "#fff7ed", text: "#9a3412", icon: "#fdba74" },
      Nov: { bg: "#f5f5f4", text: "#57534e", icon: "#a8a29e" },
      Dec: { bg: "#f0fdfa", text: "#0f766e", icon: "#2dd4bf" },
    }[month] ?? { bg: "#f6f5f4", text: "#615d59", icon: "#a39e98" };

  return (
    <span
      className="inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-[5px] px-2 text-[13px] font-medium leading-5 max-xl:gap-1 max-xl:px-1.5 max-xl:text-[12px]"
      style={{ background: bg, color: text }}
    >
      <CalendarDays size={14} strokeWidth={1.8} aria-hidden="true" style={{ color: icon }} className="shrink-0 max-xl:hidden" />
      {dateText}
      {timeText ? <span className="max-xl:hidden">{timeText}</span> : null}
    </span>
  );
}

function StatusPill({ status }: Readonly<{ status: string }>) {
  const { pill, Icon, label } =
    status === "PaymentVoucher"
      ? { pill: "bg-[#eff6ff] text-[#1d4ed8]", Icon: ArrowUpRight, label: "Payment Voucher" }
      : { pill: "bg-[#e9f7ef] text-[#1f7a4d]", Icon: ArrowDownLeft, label: "Official Receipt" };

  return (
    <span className={`inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-[6px] px-2 text-[13px] font-medium leading-5 max-xl:gap-1 max-xl:px-1.5 max-xl:text-[12px] ${pill}`}>
      <Icon size={12} strokeWidth={2} aria-hidden="true" className="shrink-0" />
      {label}
    </span>
  );
}

function StatusFilterPill({ status }: Readonly<{ status: StatusFilter }>) {
  if (status === "all") return null;
  const style = status === "PaymentVoucher" ? "bg-[#eff6ff] text-[#1d4ed8]" : "bg-[#e9f7ef] text-[#1f7a4d]";
  return (
    <span className={`inline-flex items-center rounded-[5px] px-1.5 ${style}`}>
      {status === "PaymentVoucher" ? "PV" : "OR"}
    </span>
  );
}

function AmountPill({ amount, status }: Readonly<{ amount: string; status: string }>) {
  if (status === "OfficialReceipt") {
    return (
      <span className="inline-flex h-6 items-center whitespace-nowrap rounded-[6px] bg-[#e9f7ef] px-2 text-[14px] font-medium leading-5 tabular-nums text-[#1f7a4d] max-xl:px-1.5 max-xl:text-[12px]">
        +{amount}
      </span>
    );
  }
  const numericAmount = parseAmount(amount);
  const amountStyle =
    numericAmount >= 3000
      ? "bg-[#fdecec] text-[#a84422]"
      : numericAmount >= 1000
        ? "bg-[#fff4db] text-[#8a5a00]"
        : "bg-[#f1f0ee] text-[#5f5e59]";
  return (
    <span className={`inline-flex h-6 items-center whitespace-nowrap rounded-[6px] px-2 text-[14px] font-medium leading-5 tabular-nums max-xl:px-1.5 max-xl:text-[12px] ${amountStyle}`}>
      {amount}
    </span>
  );
}

function BalanceDrawer({ onClose }: Readonly<{ onClose: () => void }>) {
  const shouldReduceMotion = useReducedMotion();
  const totalMYR = balanceAccounts.reduce((sum, a) => sum + a.balance, 0);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-[var(--dashboard-header-h)] flex-shrink-0 items-center justify-between border-b border-[#e6e6e6] px-6">
        <div className="flex items-center gap-2 min-w-0">
          <Wallet size={15} strokeWidth={1.8} className="shrink-0 text-[#8f8983]" />
          <h2 className="text-[15px] font-semibold leading-5 tracking-[-0.1px] text-[#2c2c2b]">Account Balance</h2>
          <span className="text-[13px] text-[#a39e98]">· as of today</span>
        </div>
        <button type="button" onClick={onClose} className="flex size-7 shrink-0 items-center justify-center rounded-[7px] text-[#a39e98] outline-none transition-colors duration-75 hover:bg-[#f6f5f4] hover:text-[#5f5e59]">
          <X size={15} strokeWidth={1.8} />
        </button>
      </div>

      {/* Total */}
      <motion.div
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: shouldReduceMotion ? 0 : 0.04, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="border-b border-[#e6e6e6] px-6 py-5"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[#a39e98]">Total (MYR equivalent)</p>
        <p className="mt-1.5 text-[28px] font-semibold tabular-nums tracking-[-0.6px] text-[#2c2c2b]">
          RM {totalMYR.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <p className="mt-1 text-[12px] text-[#a39e98]">
          {balanceAccounts.length} accounts &nbsp;·&nbsp; {[...new Set(balanceAccounts.map(a => a.currency))].join(", ")}
        </p>
      </motion.div>

      {/* Account list */}
      <div className="min-h-0 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="divide-y divide-[#f0efed]">
          {balanceAccounts.map((row, idx) => (
            <motion.div
              key={row.account}
              initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: shouldReduceMotion ? 0 : 0.10 + idx * 0.055, duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-3 px-6 py-[14px] transition-colors duration-75 hover:bg-[#f7f7f8]"
            >
              {/* Emoji icon — Notion style: neutral bg, emoji centered */}
              <span className="flex size-9 shrink-0 select-none items-center justify-center rounded-[8px] bg-[#f1f0ee] text-[18px] leading-none">
                {row.emoji}
              </span>

              {/* Account name + meta */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-[14px] font-medium leading-5 text-[#2c2c2b]">{row.account}</span>
                  <span
                    className="inline-flex shrink-0 items-center rounded-[4px] px-1.5 py-0.5 text-[11px] font-semibold leading-4"
                    style={{ background: currencyMeta[row.currency]?.bg, color: currencyMeta[row.currency]?.text }}
                  >
                    {row.currency}
                  </span>
                </div>
                <p className="mt-0.5 text-[12px] text-[#a39e98]">
                  {row.currency !== "MYR" ? `Rate ${row.rate.toFixed(4)} · ` : ""}Orig {row.original.toLocaleString("en-MY", { minimumFractionDigits: 2 })}
                </p>
              </div>

              {/* Balance — colored by currency */}
              <span
                className="shrink-0 text-[15px] font-semibold tabular-nums"
                style={{ color: currencyMeta[row.currency]?.text ?? "#2c2c2b" }}
              >
                {row.balance.toLocaleString("en-MY", { minimumFractionDigits: 2 })}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer note */}
      <div className="border-t border-[#e6e6e6] px-6 py-3">
        <p className="text-[12px] text-[#a39e98]">Foreign currency balances converted at today&apos;s rate.</p>
      </div>
    </div>
  );
}

function ViewEntryModal({
  entry,
  onClose,
}: Readonly<{ entry: CashbookEntry; onClose: () => void }>) {
  const shouldReduceMotion = useReducedMotion();
  const isReceipt = entry.status === "OfficialReceipt";
  const statusStyle = isReceipt ? "bg-[#e9f7ef] text-[#1f7a4d]" : "bg-[#eff6ff] text-[#1d4ed8]";
  const statusLabel = isReceipt ? "Official Receipt" : "Payment Voucher";
  const { color: entityColor, Icon: EntityIcon } = resolveEntityMeta(entry.payTo);

  const month = entry.date.split(" ")[1] ?? "";
  const dateColor =
    {
      Jan: { bg: "#eff6ff", text: "#1d4ed8", icon: "#60a5fa" },
      Feb: { bg: "#f5f3ff", text: "#6d28d9", icon: "#a78bfa" },
      Mar: { bg: "#ecfdf5", text: "#047857", icon: "#34d399" },
      Apr: { bg: "#f0fdf4", text: "#15803d", icon: "#4ade80" },
      May: { bg: "#fff7ed", text: "#c2410c", icon: "#fb923c" },
      Jun: { bg: "#eff6ff", text: "#315c9c", icon: "#6da4ef" },
      Jul: { bg: "#fefce8", text: "#a16207", icon: "#facc15" },
      Aug: { bg: "#fff1f2", text: "#be123c", icon: "#fb7185" },
      Sep: { bg: "#f7fee7", text: "#4d7c0f", icon: "#a3e635" },
      Oct: { bg: "#fff7ed", text: "#9a3412", icon: "#fdba74" },
      Nov: { bg: "#f5f5f4", text: "#57534e", icon: "#a8a29e" },
      Dec: { bg: "#f0fdfa", text: "#0f766e", icon: "#2dd4bf" },
    }[month] ?? { bg: "#f6f5f4", text: "#615d59", icon: "#a39e98" };

  return (
    <div className="fixed inset-0 z-40 flex justify-end overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: shouldReduceMotion ? 0.14 : 0.24, ease: [0.16, 1, 0.3, 1] }}
        onClick={onClose}
      />
      <motion.div
        className="relative z-10 flex h-full w-[var(--dashboard-drawer-w)] max-w-full transform-gpu flex-col bg-white shadow-[-16px_0_48px_rgba(15,15,15,0.08),_-2px_0_8px_rgba(15,15,15,0.04)]"
        initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 72, scale: 0.985, filter: "blur(2px)" }}
        animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
        exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 48, scale: 0.99, filter: "blur(1.5px)" }}
        transition={{ duration: shouldReduceMotion ? 0.16 : 0.34, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformOrigin: "right center", willChange: "transform, opacity, filter" }}
      >
        {/* Doc No + status + close */}
        <div className="flex items-center justify-between gap-4 px-7 pt-6 pb-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <h2 className="text-[20px] font-semibold leading-7 tracking-[-0.125px] text-[#2c2c2b]">{entry.docNo}</h2>
            <span className={`inline-flex h-[22px] shrink-0 items-center rounded-[5px] px-2 text-[12px] font-semibold ${statusStyle}`}>
              {statusLabel}
            </span>
          </div>
          <button type="button" onClick={onClose} className="flex size-7 shrink-0 items-center justify-center rounded-[7px] text-[#a39e98] outline-none transition-colors duration-75 hover:bg-[#f6f5f4] hover:text-[#5f5e59]">
            <X size={15} strokeWidth={1.8} />
          </button>
        </div>

        {/* Pay to / Received from */}
        <div className="px-7 pt-4 pb-5">
          <div className="flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-[10px] bg-[#f6f5f4]">
              <EntityIcon size={22} strokeWidth={1.75} aria-hidden="true" style={{ color: entityColor }} />
            </span>
            <div className="min-w-0">
              <p className="text-[16px] font-semibold leading-6 text-[#2c2c2b]">{entry.payTo}</p>
              <p className="mt-0.5 text-[13px] leading-5 text-[#a39e98]">
                {isReceipt ? "Received from" : "Paid to"} · Ref: {entry.reference}
              </p>
            </div>
          </div>
        </div>

        {/* Date + description */}
        <div className="flex items-center gap-2 border-t border-[#e6e6e6] px-7 py-4">
          <span
            className="inline-flex h-7 items-center gap-1.5 rounded-[6px] px-2.5 text-[13px] font-medium"
            style={{ background: dateColor.bg, color: dateColor.text }}
          >
            <CalendarDays size={13} strokeWidth={1.8} style={{ color: dateColor.icon }} className="shrink-0" />
            {entry.date}
          </span>
          <span className="truncate text-[13px] leading-5 text-[#a39e98]">{entry.description}</span>
        </div>

        {/* Line items */}
        <div className="min-h-0 flex-1 overflow-auto border-t border-[#e6e6e6]">
          <div className="px-7 pt-4 pb-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.4px] text-[#a39e98]">Details</p>
          </div>
          <table className="w-full border-separate border-spacing-0 text-left">
            <thead>
              <tr>
                {([{ col: "Description", align: "left" }, { col: "Amount", align: "right" }] as const).map(({ col, align }, i, arr) => {
                  const isFirst = i === 0;
                  const isLast = i === arr.length - 1;
                  return (
                    <th key={col} className={`h-8 border-b border-[#e6e6e6] bg-[#f6f5f4] text-[11px] font-semibold uppercase tracking-[0.4px] text-[#a39e98] ${isFirst ? "pl-7 pr-3" : isLast ? "pl-3 pr-7" : "px-3"} ${align === "right" ? "text-right" : ""}`}>
                      {col}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {entry.details.map((item, idx) => (
                <tr key={idx} className="transition-colors duration-75 hover:bg-[#f7f7f8]">
                  <td className="border-b border-r border-[#f0efed] py-3 pl-7 pr-3 text-[14px] leading-5 text-[#31302e]">{item.description}</td>
                  <td className="border-b border-[#f0efed] py-3 pl-3 pr-7 text-right text-[14px] font-medium tabular-nums text-[#31302e]">{item.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total + action */}
        <div className="border-t border-[#e6e6e6] px-7 py-5">
          <div className="flex items-end justify-between">
            <div className="space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="w-[88px] text-[11px] font-semibold uppercase tracking-[0.4px] text-[#a39e98]">Total</span>
                <span className={`text-[15px] font-semibold tabular-nums ${isReceipt ? "text-[#1f7a4d]" : "text-[#2c2c2b]"}`}>
                  {isReceipt ? "+" : ""}{entry.amount}
                </span>
              </div>
            </div>
            <button type="button" className="inline-flex h-9 items-center rounded-[8px] bg-[#0075de] px-4 text-[14px] font-medium text-white shadow-[0_1px_2px_rgba(0,117,222,0.2)] outline-none transition-colors duration-75 hover:bg-[#005bab]">
              {isReceipt ? "Download receipt" : "View voucher"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function CashbookPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isBalanceOpen, setIsBalanceOpen] = useState(false);
  const [viewingEntry, setViewingEntry] = useState<CashbookEntry | null>(null);
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const sortMenuRef = useRef<HTMLDivElement>(null);
  const statusMenuRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const currentSortOption = sortOptions.find((o) => o.key === sortKey);
  const currentStatusOption = statusOptions.find((o) => o.key === statusFilter);

  const sortedEntries = [...cashbookEntries]
    .filter((e) => statusFilter === "all" ? true : e.status === statusFilter)
    .sort((a, b) => {
      const aVal = getSortValue(a, sortKey);
      const bVal = getSortValue(b, sortKey);
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "desc" ? bVal - aVal : aVal - bVal;
      }
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortDirection === "desc" ? cmp * -1 : cmp;
    });

  function setSortColumn(nextKey: SortKey) {
    if (nextKey === sortKey) { setSortDirection((d) => d === "asc" ? "desc" : "asc"); return; }
    setSortKey(nextKey);
    setSortDirection(defaultSortDirections[nextKey]);
  }

  useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      const target = e.target as Node;
      if (!sortMenuRef.current?.contains(target)) setIsSortMenuOpen(false);
      if (!statusMenuRef.current?.contains(target)) setIsStatusMenuOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  return (
    <div className="dashboard-shell min-h-screen bg-white md:flex">
      <DashboardSidebar activeItem="cashbook" isMobileOpen={isSidebarOpen} onMobileClose={() => setIsSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 overflow-hidden">
        <main className="min-w-0 flex-1 overflow-y-auto bg-white text-[#2c2c2b]">
          <section className="flex min-h-screen flex-col">

            {/* Header */}
            <header className="flex h-[var(--dashboard-header-h)] items-center justify-between border-b border-[#e6e6e6] px-[var(--dashboard-main-x)]">
              <div className="flex min-w-0 items-center gap-2">
                <button type="button" aria-label="Open navigation" onClick={() => setIsSidebarOpen(true)} className="flex size-7 shrink-0 items-center justify-center rounded-[7px] text-[#6f6a64] outline-none transition-colors duration-75 hover:bg-[#ededee] hover:text-[#2c2c2b] xl:hidden">
                  <Menu size={18} strokeWidth={1.8} aria-hidden="true" />
                </button>
                <h1 className="truncate text-[20px] font-semibold leading-7 tracking-[-0.125px] text-[#2c2c2b]">Cashbook</h1>
                <div className="group relative flex shrink-0 items-center">
                  <button type="button" aria-label="About Cashbook" className="flex items-center justify-center text-[#c9c4bf] outline-none transition-colors duration-75 hover:text-[#8f8983]">
                    <Info size={15} strokeWidth={1.7} aria-hidden="true" />
                  </button>
                  <div className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 w-max max-w-[220px] -translate-x-1/2 rounded-[8px] bg-[#2c2c2b] px-3 py-2 text-[12px] leading-[1.45] text-white opacity-0 shadow-[0_4px_16px_rgba(15,15,15,0.18)] transition-opacity duration-150 group-hover:opacity-100">
                    Track and manage cashbook entries — view payment vouchers and official receipts.
                    <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-[#2c2c2b]" />
                  </div>
                </div>
              </div>
              <div aria-hidden="true" />
            </header>

            {/* Toolbar: Balance + Report buttons */}
            <div className="flex h-[var(--dashboard-toolbar-h)] items-center justify-end gap-2 px-[var(--dashboard-main-x)]">
              <button
                type="button"
                onClick={() => setIsBalanceOpen((o) => !o)}
                className={`inline-flex h-7 items-center gap-1.5 rounded-[7px] border px-2.5 text-[13px] font-medium leading-5 outline-none transition-colors duration-75 ${
                  isBalanceOpen
                    ? "border-[#0075de] bg-[#eff6ff] text-[#0075de]"
                    : "border-[#e6e6e6] bg-white text-[#2c2c2b] hover:bg-[#f7f7f8]"
                }`}
              >
                <Wallet size={13} strokeWidth={1.8} aria-hidden="true" />
                Balance
              </button>
              <button
                type="button"
                className="inline-flex h-7 items-center gap-1.5 rounded-[7px] bg-[#2783DE] px-2.5 text-[13px] font-medium leading-5 text-white shadow-[0_1px_1px_rgba(39,131,222,0.16)] outline-none transition-colors duration-75 hover:bg-[#1f76c9]"
              >
                <TrendingUp size={13} strokeWidth={1.8} aria-hidden="true" />
                Cashflow Report
              </button>
            </div>
            <div className="mx-[var(--dashboard-main-x)] border-b border-[#e6e6e6]" />

            {/* Toolbar: search + sort + filter */}
            <div className="flex h-[var(--dashboard-toolbar-h)] items-center gap-2 px-[var(--dashboard-main-x)]">
              <label className="relative w-[var(--dashboard-toolbar-search-w)] max-w-[42vw] shrink">
                <span className="sr-only">Search entries</span>
                <Search size={14} strokeWidth={1.8} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8f8983]" />
                <input type="search" placeholder="Search entries..." className="h-8 w-full rounded-[7px] border border-[#e6e6e6] bg-white pl-8.5 pr-2 text-[14px] leading-5 text-[#2c2c2b] outline-none transition-colors duration-75 placeholder:text-[#a39e98] focus:border-[#0075de] focus:ring-2 focus:ring-[#62aef0]/20" />
              </label>

              {/* Sort */}
              <div ref={sortMenuRef} className="relative">
                <button type="button" aria-haspopup="menu" aria-expanded={isSortMenuOpen} onClick={() => setIsSortMenuOpen((o) => !o)} className="inline-flex h-8 items-center gap-1.5 rounded-[7px] border border-[#e6e6e6] bg-white px-3 text-[14px] font-medium leading-5 text-[#2c2c2b] outline-none transition-colors duration-75 hover:bg-[#f7f7f8] focus-visible:ring-1 focus-visible:ring-black/5">
                  <ListFilter size={13} strokeWidth={1.8} aria-hidden="true" />
                  Sort with {currentSortOption?.label}
                </button>
                <AnimatePresence>
                  {isSortMenuOpen && (
                    <motion.div role="menu" animate={{ opacity: 1, y: 0 }} className="absolute left-0 top-8 z-20 w-[200px] origin-top-left rounded-[10px] border border-[#e6e6e6] bg-white p-1 shadow-[0_12px_28px_rgba(15,15,15,0.11)]" exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -4 }} initial={{ opacity: 0, y: shouldReduceMotion ? 0 : -6 }} transition={{ duration: shouldReduceMotion ? 0 : 0.16, ease: [0.16, 1, 0.3, 1] }}>
                      {sortOptions.map((option) => (
                        <button key={option.key} type="button" role="menuitem" onClick={() => { setSortKey(option.key); setSortDirection(defaultSortDirections[option.key]); setIsSortMenuOpen(false); }} className="flex min-h-9 w-full items-center justify-between gap-3 rounded-[7px] px-2 text-left outline-none transition-colors duration-75 hover:bg-[#f6f5f4]">
                          <span className="min-w-0">
                            <span className="block truncate text-[13px] font-medium leading-5 text-[#2c2c2b]">{option.label}</span>
                            <span className="block truncate text-[11px] font-medium leading-4 text-[#8f8983]">{option.helper}</span>
                          </span>
                          {sortKey === option.key ? <Check size={13} strokeWidth={2} className="shrink-0 text-[#0075de]" /> : null}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Status filter */}
              <div ref={statusMenuRef} className="relative">
                <button type="button" aria-haspopup="menu" aria-expanded={isStatusMenuOpen} onClick={() => setIsStatusMenuOpen((o) => !o)} className="inline-flex h-8 items-center gap-1.5 rounded-[7px] border border-[#e6e6e6] bg-white px-3 text-[14px] font-medium leading-5 text-[#2c2c2b] outline-none transition-colors duration-75 hover:bg-[#f7f7f8] focus-visible:ring-1 focus-visible:ring-black/5">
                  <Tag size={13} strokeWidth={1.8} aria-hidden="true" />
                  Type
                  {currentStatusOption && currentStatusOption.key !== "all" && (
                    <><span className="text-[#a39e98]">is</span><StatusFilterPill status={statusFilter} /></>
                  )}
                </button>
                <AnimatePresence>
                  {isStatusMenuOpen && (
                    <motion.div role="menu" animate={{ opacity: 1, y: 0 }} className="absolute left-0 top-8 z-20 w-[210px] origin-top-left rounded-[10px] border border-[#e6e6e6] bg-white p-1 shadow-[0_12px_28px_rgba(15,15,15,0.11)]" exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -4 }} initial={{ opacity: 0, y: shouldReduceMotion ? 0 : -6 }} transition={{ duration: shouldReduceMotion ? 0 : 0.16, ease: [0.16, 1, 0.3, 1] }}>
                      {statusOptions.map((option) => (
                        <button key={option.key} type="button" role="menuitem" onClick={() => { setStatusFilter(option.key as StatusFilter); setIsStatusMenuOpen(false); }} className="flex min-h-9 w-full items-center justify-between gap-3 rounded-[7px] px-2 text-left outline-none transition-colors duration-75 hover:bg-[#f6f5f4]">
                          <span className="flex min-w-0 items-center gap-2">
                            <span className="size-2 shrink-0 rounded-full" style={{ background: { all: "#d1d0ce", PaymentVoucher: "#1d4ed8", OfficialReceipt: "#1f7a4d" }[option.key] }} />
                            <span className="min-w-0">
                              <span className="block truncate text-[13px] font-medium leading-5 text-[#2c2c2b]">{option.label}</span>
                              <span className="block truncate text-[11px] font-medium leading-4 text-[#8f8983]">{option.helper}</span>
                            </span>
                          </span>
                          {statusFilter === option.key ? <Check size={13} strokeWidth={2} className="shrink-0 text-[#0075de]" /> : null}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button type="button" aria-label="Add filter" className="flex size-7 items-center justify-center rounded-[7px] border border-dashed border-[#dedbd7] text-[#8f8983] outline-none transition-colors duration-75 hover:bg-[#f7f7f8] hover:text-[#2c2c2b]">
                <Plus size={14} strokeWidth={1.8} aria-hidden="true" />
              </button>
            </div>
            <div className="mx-[var(--dashboard-main-x)] border-b border-[#e6e6e6]" />

            {/* Table */}
            <div className="min-h-0 flex-1 overflow-auto px-[var(--dashboard-main-x)]">
              <table className="w-full min-w-[var(--cashbook-table-min-w)] table-fixed border-separate border-spacing-0 text-left">
                <thead className="sticky top-0 z-10 bg-white">
                  <tr>
                    {[
                      { label: "Doc No",             icon: Hash,        width: "w-[var(--cashbook-col-docno)]",  key: "docNo" },
                      { label: "Date",               icon: CalendarDays,width: "w-[var(--cashbook-col-date)]",   key: "date" },
                      { label: "Pay to / Recv From", icon: Store,       width: "w-[var(--cashbook-col-payto)]",  key: "payTo" },
                      { label: "Status",             icon: Circle,      width: "w-[var(--cashbook-col-status)]", key: "status" },
                      { label: "Amount",             icon: Wallet,      width: "w-[var(--cashbook-col-amount)]", key: "amount" },
                      { label: "Action",             icon: Ellipsis,    width: "w-[var(--cashbook-col-action)]" },
                    ].map((column, colIdx, allColumns) => {
                      const Icon = column.icon;
                      const isAmount = column.label === "Amount";
                      const isAction = column.label === "Action";
                      const isSortable = Boolean(column.key);
                      const isActiveSort = column.key === sortKey;
                      const isAscendingSort = isActiveSort && sortDirection === "asc";
                      const sortColumnKey = column.key as SortKey | undefined;
                      const isFirstCol = colIdx === 0;
                      const isLastCol = colIdx === allColumns.length - 1;
                      const colPadding = isFirstCol ? "pl-6 pr-3" : isLastCol ? "pl-3 pr-6" : "px-3";

                      return (
                        <th key={column.label} scope="col" aria-sort={isSortable && isActiveSort ? (isAscendingSort ? "ascending" : "descending") : undefined} className={`${column.width} h-[var(--dashboard-head-h)] border-b ${isLastCol ? "" : "border-r"} border-[#e6e6e6] ${colPadding} text-[14px] font-medium leading-5 text-[#2c2c2b] ${isAmount || isAction ? "text-right" : ""}`}>
                          {isSortable ? (
                            <button type="button" aria-label={`Sort by ${column.label}`} onClick={() => { if (sortColumnKey) setSortColumn(sortColumnKey); }} className={`flex items-center gap-1.5 outline-none transition-colors duration-75 hover:text-[#2c2c2b] ${isAmount ? "justify-end" : "justify-start"}`}>
                              <Icon size={14} strokeWidth={1.75} aria-hidden="true" className="text-[#2c2c2b]" />
                              <span className="truncate">{column.label}</span>
                              {isActiveSort ? (
                                isAscendingSort
                                  ? <ChevronUp size={12} strokeWidth={2} className="shrink-0 text-[#0075de]" />
                                  : <ChevronDown size={12} strokeWidth={2} className="shrink-0 text-[#0075de]" />
                              ) : (
                                <ArrowUpDown size={11} strokeWidth={1.9} className="shrink-0 text-[#2c2c2b]/45" />
                              )}
                            </button>
                          ) : (
                            <span className={`flex items-center gap-1.5 ${isAmount || isAction ? "justify-end" : ""}`}>
                              <Icon size={14} strokeWidth={1.75} aria-hidden="true" className="text-[#2c2c2b]" />
                              {column.label}
                            </span>
                          )}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {sortedEntries.map((entry, index) => (
                    <motion.tr
                      key={entry.docNo}
                      animate={{ opacity: 1, x: 0 }}
                      className="group h-[var(--dashboard-row-h)] bg-white transition-colors duration-75 hover:bg-[#f7f7f8]"
                      initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -24 }}
                      transition={{ delay: shouldReduceMotion ? 0 : index * 0.055, duration: shouldReduceMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <td className="border-b border-r border-[#f0efed] pl-6 pr-3"><DocNoCell docNo={entry.docNo} /></td>
                      <td className="border-b border-r border-[#f0efed] px-3"><DateCell date={entry.date} /></td>
                      <td className="border-b border-r border-[#f0efed] px-3"><PayToCell payTo={entry.payTo} /></td>
                      <td className="border-b border-r border-[#f0efed] px-3"><StatusPill status={entry.status} /></td>
                      <td className="border-b border-r border-[#f0efed] px-3 text-right"><AmountPill amount={entry.amount} status={entry.status} /></td>
                      <td className="border-b border-[#f0efed] pl-3 pr-6 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button type="button" aria-label={`View ${entry.docNo}`} onClick={() => setViewingEntry(entry)} className="inline-flex size-7 items-center justify-center rounded-[7px] text-[#8f8983] outline-none transition-colors duration-75 hover:bg-[#ededee] hover:text-[#2c2c2b]">
                            <Ellipsis size={15} strokeWidth={1.9} aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>

        {/* Balance drawer */}
        <AnimatePresence>
          {isBalanceOpen && (
            <motion.aside
              key="balance-aside"
              className="relative flex-shrink-0 overflow-hidden border-l border-[#e6e6e6] bg-white"
              style={{ height: "100vh", position: "sticky", top: 0 }}
              initial={{ width: 0 }}
              animate={{ width: 420 }}
              exit={{ width: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex h-full w-[420px] flex-col">
                <BalanceDrawer onClose={() => setIsBalanceOpen(false)} />
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Entry detail overlay */}
      <AnimatePresence>
        {viewingEntry ? <ViewEntryModal entry={viewingEntry} onClose={() => setViewingEntry(null)} /> : null}
      </AnimatePresence>
    </div>
  );
}
