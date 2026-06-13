"use client";

import { DashboardSidebar } from "@/components/sidebar";
import {
  AlertCircle,
  ArrowUpDown,
  Box,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Clock3,
  Ellipsis,
  FileText,
  FolderOpen,
  Hash,
  Info,
  Layers,
  ListFilter,
  Megaphone,
  Menu,
  Monitor,
  Package,
  Plus,
  Tag,
  Search,
  Sparkles,
  Store,
  Truck,
  UserRound,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import React, { useEffect, useRef, useState } from "react";

const purchaseInvoices = [
  {
    invoiceNo: "PI-2026-0001", supplierInvoiceNo: "SUP-INV-8291", creditorCode: "400-C001",
    supplier: "OfficePro Supplies", date: "08 Jun 2026", agent: "Wong Yi Thong",
    paymentStatus: "Unpaid", amount: "RM 1,240.00", outstandingAmount: "RM 1,240.00", currency: "MYR",
    details: [
      { itemCode: "OPS-001", description: "A4 Paper Ream 80gsm", uom: "BOX", qty: 10, unitPrice: 85.00, amount: 850.00 },
      { itemCode: "OPS-002", description: "Ballpoint Pen Assorted", uom: "BOX", qty: 5, unitPrice: 12.00, amount: 60.00 },
      { itemCode: "OPS-003", description: "Stapler Heavy Duty", uom: "PCS", qty: 2, unitPrice: 165.00, amount: 330.00 },
    ],
  },
  {
    invoiceNo: "PI-2026-0002", supplierInvoiceNo: "MP-2401-77", creditorCode: "400-C002",
    supplier: "Metro Paper Trading", date: "07 Jun 2026", agent: "Amelia Tan",
    paymentStatus: "Partial", amount: "RM 856.30", outstandingAmount: "RM 428.15", currency: "MYR",
    details: [
      { itemCode: "MPT-014", description: "Carbonless Paper NCR A4", uom: "PCS", qty: 200, unitPrice: 0.95, amount: 190.00 },
      { itemCode: "MPT-031", description: "Thermal Roll 80mm x 80m", uom: "CTN", qty: 3, unitPrice: 88.00, amount: 264.00 },
      { itemCode: "MPT-055", description: "Glossy Photo Paper 200gsm", uom: "PKT", qty: 4, unitPrice: 50.58, amount: 202.30 },
    ],
  },
  {
    invoiceNo: "PI-2026-0003", supplierInvoiceNo: "NSL-00984", creditorCode: "400-C003",
    supplier: "Northstar Logistics", date: "06 Jun 2026", agent: "Daniel Lim",
    paymentStatus: "Paid", amount: "RM 3,420.00", outstandingAmount: "RM 0.00", currency: "MYR",
    details: [
      { itemCode: "NSL-201", description: "Freight Charges — Peninsular", uom: "JOB", qty: 1, unitPrice: 1800.00, amount: 1800.00 },
      { itemCode: "NSL-202", description: "Pallet Wrapping Service", uom: "PLT", qty: 12, unitPrice: 85.00, amount: 1020.00 },
      { itemCode: "NSL-203", description: "Handling & Storage Fee", uom: "MTH", qty: 2, unitPrice: 300.00, amount: 600.00 },
    ],
  },
  {
    invoiceNo: "PI-2026-0004", supplierInvoiceNo: "BH-2026-511", creditorCode: "400-C004",
    supplier: "Brightline Hardware", date: "05 Jun 2026", agent: "Rachel Koh",
    paymentStatus: "Overdue", amount: "RM 612.90", outstandingAmount: "RM 612.90", currency: "MYR",
    details: [
      { itemCode: "BHW-088", description: "PVC Conduit Pipe 20mm x 4m", uom: "PCS", qty: 30, unitPrice: 4.50, amount: 135.00 },
      { itemCode: "BHW-112", description: "Circuit Breaker 40A", uom: "PCS", qty: 3, unitPrice: 89.30, amount: 267.90 },
      { itemCode: "BHW-145", description: "Junction Box IP65", uom: "PCS", qty: 10, unitPrice: 21.00, amount: 210.00 },
    ],
  },
  {
    invoiceNo: "PI-2026-0005", supplierInvoiceNo: "GPK-66120", creditorCode: "400-C005",
    supplier: "Greenfield Packaging", date: "04 Jun 2026", agent: "Marcus Lee",
    paymentStatus: "Unpaid", amount: "RM 2,105.45", outstandingAmount: "RM 2,105.45", currency: "MYR",
    details: [
      { itemCode: "GPK-301", description: "Corrugated Box 40x30x30cm", uom: "PCS", qty: 500, unitPrice: 1.85, amount: 925.00 },
      { itemCode: "GPK-302", description: "Bubble Wrap Roll 1m x 50m", uom: "ROL", qty: 6, unitPrice: 78.00, amount: 468.00 },
      { itemCode: "GPK-303", description: "Stretch Film 500mm x 300m", uom: "ROL", qty: 8, unitPrice: 89.43, amount: 715.45 },
    ],
  },
  {
    invoiceNo: "PI-2026-0006", supplierInvoiceNo: "AOS-1044", creditorCode: "400-C006",
    supplier: "Apex Office Systems", date: "03 Jun 2026", agent: "Wong Yi Thong",
    paymentStatus: "Paid", amount: "RM 498.00", outstandingAmount: "RM 0.00", currency: "MYR",
    details: [
      { itemCode: "AOS-011", description: "Toner Cartridge HP 85A", uom: "PCS", qty: 2, unitPrice: 149.00, amount: 298.00 },
      { itemCode: "AOS-023", description: "Mouse Wireless Logitech", uom: "PCS", qty: 2, unitPrice: 65.00, amount: 130.00 },
      { itemCode: "AOS-044", description: "USB Hub 4-Port 3.0", uom: "PCS", qty: 2, unitPrice: 35.00, amount: 70.00 },
    ],
  },
  {
    invoiceNo: "PI-2026-0007", supplierInvoiceNo: "SUM-2880", creditorCode: "400-C007",
    supplier: "Summit Maintenance", date: "02 Jun 2026", agent: "Amelia Tan",
    paymentStatus: "Partial", amount: "RM 1,780.20", outstandingAmount: "RM 890.10", currency: "MYR",
    details: [
      { itemCode: "SMT-101", description: "Air-Cond Servicing (Split Unit)", uom: "UNIT", qty: 6, unitPrice: 120.00, amount: 720.00 },
      { itemCode: "SMT-102", description: "Water Filter Replacement", uom: "PCS", qty: 4, unitPrice: 85.05, amount: 340.20 },
      { itemCode: "SMT-103", description: "General Cleaning Service", uom: "SVC", qty: 2, unitPrice: 360.00, amount: 720.00 },
    ],
  },
  {
    invoiceNo: "PI-2026-0008", supplierInvoiceNo: "ES-77214", creditorCode: "400-C008",
    supplier: "Evermark Services", date: "01 Jun 2026", agent: "Daniel Lim",
    paymentStatus: "Unpaid", amount: "RM 925.00", outstandingAmount: "RM 925.00", currency: "MYR",
    details: [
      { itemCode: "EVS-001", description: "Name Card Printing (500 pcs)", uom: "SET", qty: 2, unitPrice: 85.00, amount: 170.00 },
      { itemCode: "EVS-012", description: "A3 Poster Printing Glossy", uom: "PCS", qty: 50, unitPrice: 4.50, amount: 225.00 },
      { itemCode: "EVS-033", description: "Pull-Up Banner 85x200cm", uom: "PCS", qty: 2, unitPrice: 265.00, amount: 530.00 },
    ],
  },
];

const invoiceHistory = [
  {
    taskName: "Created purchase invoice",
    date: "09 Jun 2026 10:24:18",
    supplier: "OfficePro Supplies",
    status: "Completed",
    type: "Single",
  },
  {
    taskName: "Reviewed supplier invoice",
    date: "09 Jun 2026 09:48:32",
    supplier: "Metro Paper Trading",
    status: "Completed",
    type: "Batch",
  },
  {
    taskName: "Matched logistics invoice",
    date: "08 Jun 2026 04:16:09",
    supplier: "Northstar Logistics",
    status: "Processing",
    type: "Single",
  },
  {
    taskName: "Checked payment readiness",
    date: "08 Jun 2026 02:39:51",
    supplier: "Brightline Hardware",
    status: "Pending",
    type: "Batch",
  },
  {
    taskName: "Synced invoice details",
    date: "07 Jun 2026 11:02:44",
    supplier: "Greenfield Packaging",
    status: "Completed",
    type: "Batch",
  },
  {
    taskName: "Flagged invoice exception",
    date: "07 Jun 2026 09:15:27",
    supplier: "Apex Office Systems",
    status: "Failed",
    type: "Single",
  },
] as const;

type HistoryEntry = (typeof invoiceHistory)[number];

const sortOptions = [
  { key: "date", label: "Date", helper: "Newest first" },
  { key: "amount", label: "Amount", helper: "Highest first" },
  { key: "supplier", label: "Supplier", helper: "A to Z" },
  { key: "invoiceNo", label: "Invoice No", helper: "Latest invoice first" },
  { key: "agent", label: "Agent", helper: "A to Z" },
  { key: "paymentStatus", label: "Payment Status", helper: "Attention first" },
] as const;

type PurchaseInvoice = (typeof purchaseInvoices)[number];
type SortKey = (typeof sortOptions)[number]["key"];
type SortDirection = "asc" | "desc";
type StatusFilter = "all" | PurchaseInvoice["paymentStatus"];
type ActiveTab = "invoices" | "history";
type UploadDrawerMode = "upload" | "history";

const statusOptions = [
  { key: "all", label: "All statuses", helper: "Show every invoice" },
  { key: "Unpaid", label: "Unpaid", helper: "No payment made" },
  { key: "Partial", label: "Partial", helper: "Some payment made" },
  { key: "Paid", label: "Paid", helper: "Completed payment" },
  { key: "Overdue", label: "Overdue", helper: "Past due date" },
] as const;

const defaultSortDirections: Record<SortKey, SortDirection> = {
  date: "desc",
  amount: "desc",
  supplier: "asc",
  invoiceNo: "desc",
  agent: "asc",
  paymentStatus: "desc",
};

function parseAmount(amount: string) {
  return Number(amount.replace(/[^\d.]/g, ""));
}

function getSortValue(invoice: PurchaseInvoice, sortKey: SortKey) {
  if (sortKey === "amount") {
    return parseAmount(invoice.amount);
  }

  if (sortKey === "date") {
    return new Date(invoice.date).getTime();
  }

  if (sortKey === "paymentStatus") {
    return {
      Overdue: 4,
      Unpaid: 3,
      Partial: 2,
      Paid: 1,
    }[invoice.paymentStatus];
  }

  return invoice[sortKey];
}

function AgentPill({ name }: Readonly<{ name: string }>) {
  const initial = name.split(" ").filter(Boolean)[0]?.[0]?.toUpperCase() ?? "?";
  const agentStyle =
    {
      "Wong Yi Thong": { avatar: "bg-[#1a73e8] text-white" },
      "Amelia Tan": { avatar: "bg-[#d93025] text-white" },
      "Daniel Lim": { avatar: "bg-[#0f9d58] text-white" },
      "Rachel Koh": { avatar: "bg-[#f4511e] text-white" },
      "Marcus Lee": { avatar: "bg-[#7c3aed] text-white" },
    }[name] ?? { avatar: "bg-[#5f6368] text-white" };

  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-[#f1f0ee] px-1.5 py-0.5 text-[14px] font-medium leading-5 text-[#5f5e59] max-xl:text-[13px]">
      <span
        className={`flex size-4 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold ${agentStyle.avatar}`}
      >
        {initial}
      </span>
      <span className="truncate font-semibold text-[#5f5e59]">{name}</span>
    </span>
  );
}

function InvoiceNumberCell({ invoiceNo }: Readonly<{ invoiceNo: string }>) {
  return (
    <span className="whitespace-nowrap text-[14px] font-medium leading-5 text-[#2c2c2b] max-xl:text-[13px]">
      {invoiceNo}
    </span>
  );
}

type SupplierMeta = { color: string; Icon: React.ElementType };

const supplierMetaMap: Record<string, SupplierMeta> = {
  "OfficePro Supplies":   { color: "#dd5b00", Icon: Box },
  "Metro Paper Trading":  { color: "#2563eb", Icon: FileText },
  "Northstar Logistics":  { color: "#7c3aed", Icon: Truck },
  "Brightline Hardware":  { color: "#1aae39", Icon: Zap },
  "Greenfield Packaging": { color: "#2a9d99", Icon: Package },
  "Apex Office Systems":  { color: "#c026d3", Icon: Monitor },
  "Summit Maintenance":   { color: "#b45309", Icon: Wrench },
  "Evermark Services":    { color: "#92400e", Icon: Megaphone },
};

function resolveSupplierMeta(supplier: string): SupplierMeta {
  return supplierMetaMap[supplier] ?? { color: "#615d59", Icon: Store };
}

function SupplierCell({ supplier }: Readonly<{ supplier: string }>) {
  const { color, Icon } = resolveSupplierMeta(supplier);

  return (
    <span className="inline-flex max-w-full items-center gap-2">
      <Icon size={16} strokeWidth={1.9} aria-hidden="true" className="shrink-0" style={{ color }} />
      <span className="truncate text-[14px] font-medium leading-5 text-[#31302e]">
        {supplier}
      </span>
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

function PaymentStatusPill({ status }: Readonly<{ status: string }>) {
  const { pill, Icon } =
    {
      Paid:    { pill: "bg-[#e9f7ef] text-[#1f7a4d]", Icon: CheckCircle2 },
      Partial: { pill: "bg-[#fff4db] text-[#9a6700]", Icon: Clock3 },
      Overdue: { pill: "bg-[#fdecec] text-[#c2410c]", Icon: AlertCircle },
      Unpaid:  { pill: "bg-[#f1f0ee] text-[#5f5e59]", Icon: Circle },
    }[status] ?? { pill: "bg-[#f1f0ee] text-[#5f5e59]", Icon: Circle };

  return (
    <span className={`inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-[6px] px-2 text-[13px] font-medium leading-5 max-xl:gap-1 max-xl:px-1.5 max-xl:text-[12px] ${pill}`}>
      <Icon size={12} strokeWidth={2} aria-hidden="true" className="shrink-0" />
      {status}
    </span>
  );
}

function HistoryStatusPill({ status }: Readonly<{ status: string }>) {
  const { pill, dot } =
    {
      Completed: { pill: "bg-[#e9f7ef] text-[#1f7a4d]", dot: "bg-[#1f7a4d]" },
      Processing: { pill: "bg-[#eff6ff] text-[#1d4ed8]", dot: "bg-[#1d4ed8]" },
      Pending: { pill: "bg-[#fff4db] text-[#9a6700]", dot: "bg-[#f59e0b]" },
      Failed: { pill: "bg-[#fdecec] text-[#c2410c]", dot: "bg-[#c2410c]" },
    }[status] ?? { pill: "bg-[#f1f0ee] text-[#5f5e59]", dot: "bg-[#a39e98]" };

  return (
    <span className={`inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-[6px] px-2 text-[13px] font-medium leading-5 max-xl:gap-1 max-xl:px-1.5 max-xl:text-[12px] ${pill}`}>
      <span className={`size-1.5 shrink-0 rounded-full ${dot}`} />
      {status}
    </span>
  );
}

function TypeBadge({ type }: Readonly<{ type: string }>) {
  if (type === "Batch") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-[5px] bg-[#f3f0ff] px-1.5 py-0.5 text-[12px] font-medium leading-4 text-[#7c3aed]">
        <Layers size={11} strokeWidth={2} className="shrink-0" />
        Batch
      </span>
    );
  }
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-[5px] bg-[#f1f0ee] px-1.5 py-0.5 text-[12px] font-medium leading-4 text-[#5f5e59]">
      <FileText size={11} strokeWidth={2} className="shrink-0" />
      Single
    </span>
  );
}

function StatusFilterPill({ status }: Readonly<{ status: StatusFilter }>) {
  if (status === "all") {
    return null;
  }

  const statusStyle =
    {
      Paid: "bg-[#e9f7ef] text-[#1f7a4d]",
      Partial: "bg-[#fff4db] text-[#9a6700]",
      Overdue: "bg-[#fdecec] text-[#c2410c]",
      Unpaid: "bg-[#f1f0ee] text-[#5f5e59]",
    }[status] ?? "bg-[#f1f0ee] text-[#5f5e59]";

  return (
    <span className={`inline-flex items-center rounded-[5px] px-1.5 ${statusStyle}`}>
      {status}
    </span>
  );
}

function AmountPill({ amount }: Readonly<{ amount: string }>) {
  const numericAmount = parseAmount(amount);
  const amountStyle =
    numericAmount >= 3000
      ? "bg-[#fdecec] text-[#a84422]"
      : numericAmount >= 1000
        ? "bg-[#fff4db] text-[#8a5a00]"
        : "bg-[#f1f0ee] text-[#5f5e59]";

  return (
    <span
      className={`inline-flex h-6 items-center whitespace-nowrap rounded-[6px] px-2 text-[14px] font-medium leading-5 tabular-nums max-xl:px-1.5 max-xl:text-[12px] ${amountStyle}`}
    >
      {amount}
    </span>
  );
}

type InvoiceDetail = (typeof purchaseInvoices)[number]["details"][number];

function ViewInvoiceModal({
  invoice,
  onClose,
}: Readonly<{
  invoice: (typeof purchaseInvoices)[number];
  onClose: () => void;
}>) {
  const shouldReduceMotion = useReducedMotion();

  const statusStyle =
    {
      Paid: "bg-[#e9f7ef] text-[#1f7a4d]",
      Partial: "bg-[#fff4db] text-[#9a6700]",
      Overdue: "bg-[#fdecec] text-[#c2410c]",
      Unpaid: "bg-[#f1f0ee] text-[#5f5e59]",
    }[invoice.paymentStatus] ?? "bg-[#f1f0ee] text-[#5f5e59]";

  const { color: supplierChipColor, Icon: SupplierIcon } = resolveSupplierMeta(invoice.supplier);

  const agentAvatarBg =
    {
      "Wong Yi Thong": "#1a73e8",
      "Amelia Tan": "#d93025",
      "Daniel Lim": "#0f9d58",
      "Rachel Koh": "#f4511e",
      "Marcus Lee": "#7c3aed",
    }[invoice.agent] ?? "#5f6368";

  const agentInitial =
    invoice.agent.split(" ").filter(Boolean)[0]?.[0]?.toUpperCase() ?? "?";

  const month = invoice.date.split(" ")[1] ?? "";
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
      {/* Backdrop — fades independently */}
      <motion.div
        className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{
          duration: shouldReduceMotion ? 0.14 : 0.24,
          ease: [0.16, 1, 0.3, 1],
        }}
        onClick={onClose}
      />

      {/* Drawer — spring slides in from right, fully visible from frame 1 */}
      <motion.div
        className="relative z-10 flex h-full w-[var(--dashboard-drawer-w)] max-w-full transform-gpu flex-col bg-white shadow-[-16px_0_48px_rgba(15,15,15,0.08),_-2px_0_8px_rgba(15,15,15,0.04)]"
        initial={
          shouldReduceMotion
            ? { opacity: 0 }
            : { opacity: 0, x: 72, scale: 0.985, filter: "blur(2px)" }
        }
        animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
        exit={
          shouldReduceMotion
            ? { opacity: 0 }
            : { opacity: 0, x: 48, scale: 0.99, filter: "blur(1.5px)" }
        }
        transition={{
          duration: shouldReduceMotion ? 0.16 : 0.34,
          ease: [0.16, 1, 0.3, 1],
        }}
        style={{ transformOrigin: "right center", willChange: "transform, opacity, filter" }}
      >
        {/* ── Section 1: Invoice ID + status + close ── */}
        <div className="flex items-center justify-between gap-4 px-7 pt-6 pb-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <h2 className="text-[20px] font-semibold leading-7 tracking-[-0.125px] text-[#2c2c2b]">
              {invoice.invoiceNo}
            </h2>
            <span
              className={`inline-flex h-[22px] shrink-0 items-center rounded-[5px] px-2 text-[12px] font-semibold ${statusStyle}`}
            >
              {invoice.paymentStatus}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-7 shrink-0 items-center justify-center rounded-[7px] text-[#a39e98] outline-none transition-colors duration-75 hover:bg-[#f6f5f4] hover:text-[#5f5e59]"
          >
            <X size={15} strokeWidth={1.8} />
          </button>
        </div>

        {/* ── Section 2: Supplier identity ── */}
        <div className="px-7 pt-4 pb-5">
          <div className="flex items-center gap-3">
            <span
              className="flex size-11 shrink-0 items-center justify-center rounded-[10px] bg-[#f6f5f4]"
            >
              <SupplierIcon size={22} strokeWidth={1.75} aria-hidden="true" style={{ color: supplierChipColor }} />
            </span>
            <div className="min-w-0">
              <p className="text-[16px] font-semibold leading-6 text-[#2c2c2b]">
                {invoice.supplier}
              </p>
              <p className="mt-0.5 text-[13px] leading-5 text-[#a39e98]">
                {invoice.creditorCode} · {invoice.currency}
              </p>
            </div>
          </div>
        </div>

        {/* ── Section 3: Date + Agent ── */}
        <div className="flex items-center gap-2 border-t border-[#e6e6e6] px-7 py-4">
          <span
            className="inline-flex h-7 items-center gap-1.5 rounded-[6px] px-2.5 text-[13px] font-medium"
            style={{ background: dateColor.bg, color: dateColor.text }}
          >
            <CalendarDays
              size={13}
              strokeWidth={1.8}
              style={{ color: dateColor.icon }}
              className="shrink-0"
            />
            {invoice.date}
          </span>
          <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-[#f1f0ee] pl-1.5 pr-3 text-[13px] font-medium text-[#5f5e59]">
            <span
              className="flex size-[18px] shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white"
              style={{ background: agentAvatarBg }}
            >
              {agentInitial}
            </span>
            {invoice.agent}
          </span>
        </div>

        {/* ── Section 4: Line items ── */}
        <div className="min-h-0 flex-1 overflow-auto border-t border-[#e6e6e6]">
          <div className="px-7 pt-4 pb-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.4px] text-[#a39e98]">
              Items
            </p>
          </div>
          <table className="w-full border-separate border-spacing-0 text-left">
            <thead>
              <tr>
                {(
                  [
                    { col: "Description", align: "left" },
                    { col: "Qty", align: "right" },
                    { col: "Unit Price", align: "right" },
                    { col: "Amount", align: "right" },
                  ] as const
                ).map(({ col, align }, i, arr) => {
                  const isFirst = i === 0;
                  const isLast = i === arr.length - 1;
                  return (
                    <th
                      key={col}
                      className={`h-8 border-b border-[#e6e6e6] bg-[#f6f5f4] text-[11px] font-semibold uppercase tracking-[0.4px] text-[#a39e98] ${
                        isFirst ? "pl-7 pr-3" : isLast ? "pl-3 pr-7" : "px-3"
                      } ${align === "right" ? "text-right" : ""}`}
                    >
                      {col}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {invoice.details.map((item: InvoiceDetail, idx: number) => (
                <tr key={idx} className="transition-colors duration-75 hover:bg-[#f7f7f8]">
                  <td className="border-b border-r border-[#f0efed] py-3 pl-7 pr-3 text-[14px] leading-5 text-[#31302e]">
                    {item.description}
                  </td>
                  <td className="border-b border-r border-[#f0efed] px-3 py-3 text-right text-[14px] tabular-nums text-[#5f5e59]">
                    {item.qty}
                  </td>
                  <td className="border-b border-r border-[#f0efed] px-3 py-3 text-right text-[14px] tabular-nums text-[#5f5e59]">
                    {item.unitPrice.toFixed(2)}
                  </td>
                  <td className="border-b border-r border-[#f0efed] py-3 pl-3 pr-7 text-right text-[14px] font-medium tabular-nums text-[#31302e]">
                    {item.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Section 5: Totals + action ── */}
        <div className="border-t border-[#e6e6e6] px-7 py-5">
          <div className="flex items-end justify-between">
            <div className="space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="w-[88px] text-[11px] font-semibold uppercase tracking-[0.4px] text-[#a39e98]">
                  Total
                </span>
                <span className="text-[15px] font-semibold tabular-nums text-[#2c2c2b]">
                  {invoice.amount}
                </span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="w-[88px] text-[11px] font-semibold uppercase tracking-[0.4px] text-[#a39e98]">
                  Outstanding
                </span>
                <span
                  className={`text-[15px] font-semibold tabular-nums ${
                    invoice.outstandingAmount === "RM 0.00"
                      ? "text-[#1f7a4d]"
                      : "text-[#c2410c]"
                  }`}
                >
                  {invoice.outstandingAmount}
                </span>
              </div>
            </div>
            {invoice.outstandingAmount !== "RM 0.00" && (
              <button
                type="button"
                className="inline-flex h-9 items-center rounded-[8px] bg-[#0075de] px-4 text-[14px] font-medium text-white shadow-[0_1px_2px_rgba(0,117,222,0.2)] outline-none transition-colors duration-75 hover:bg-[#005bab]"
              >
                Pay now
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}


function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileExt(file: File) {
  const ext = file.name.split(".").pop()?.toUpperCase() ?? "FILE";
  if (file.type === "application/pdf")
    return { ext, color: "#dc2626", bg: "#fef2f2" };
  if (file.type.startsWith("image/"))
    return { ext, color: "#0075de", bg: "#eff6ff" };
  return { ext, color: "#8f8983", bg: "#f6f5f4" };
}

function getHistoryMockFiles(historyEntry: HistoryEntry) {
  const slug = historyEntry.supplier.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return [
    {
      name: `${slug}-invoice.pdf`,
      size: 20284,
      type: "application/pdf",
    },
    {
      name: `${slug}-supporting-note.png`,
      size: 90512,
      type: "image/png",
    },
  ];
}

function UploadDrawer({
  mode,
  historyEntry,
  onClose,
}: Readonly<{
  mode: UploadDrawerMode;
  historyEntry: HistoryEntry | null;
  onClose: () => void;
}>) {
  const shouldReduceMotion = useReducedMotion();
  const easeOut = [0.22, 1, 0.36, 1] as const;

  const [phase, setPhase] = useState<"upload" | "processing">("upload");
  const [isDragOver, setIsDragOver] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [statuses, setStatuses] = useState<number[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const hasFiles = files.length > 0;
  const doneCount = statuses.filter(s => s === 3).length;
  const allDone = statuses.length > 0 && doneCount === statuses.length;

  useEffect(() => { return () => { timerRef.current.forEach(clearTimeout); }; }, []);
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && (mode === "history" || phase === "upload")) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, phase, onClose]);

  if (mode === "history" && historyEntry) {
    const mockFiles = getHistoryMockFiles(historyEntry);

    return (
      <div className="flex h-full flex-col">
        <motion.div
          key={`history-${historyEntry.taskName}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: easeOut }}
          className="flex h-full flex-col"
        >
          <div className="flex h-[var(--dashboard-header-h)] flex-shrink-0 items-center justify-between border-b border-[#e6e6e6] px-7">
            <div className="min-w-0">
              <h2 className="truncate text-[17px] font-semibold leading-6 tracking-[-0.15px] text-[#2c2c2b]">
                Uploaded files
              </h2>
              <p className="mt-0.5 truncate text-[13px] leading-5 text-[#a39e98]">
                {historyEntry.taskName}
              </p>
            </div>
            <button type="button" onClick={onClose} className="ml-4 flex size-7 shrink-0 items-center justify-center rounded-[7px] text-[#a39e98] outline-none transition-colors duration-75 hover:bg-[#f6f5f4] hover:text-[#5f5e59]">
              <X size={15} strokeWidth={1.8} />
            </button>
          </div>

          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="border-b border-[#f0efed] px-7 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate text-[20px] font-semibold leading-7 tracking-[-0.18px] text-[#2c2c2b]">
                    {historyEntry.supplier}
                  </p>
                  <p className="mt-1 text-[13px] leading-5 text-[#a39e98]">
                    Completed import package
                  </p>
                </div>
                <div className="shrink-0">
                  <HistoryStatusPill status={historyEntry.status} />
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <div className="divide-y divide-[#f4f3f1]">
                {mockFiles.map((file, index) => {
                  const ext = file.name.split(".").pop()?.toUpperCase() ?? "FILE";
                  const fileMeta =
                    file.type === "application/pdf"
                      ? { color: "#dc2626", bg: "#fef2f2" }
                      : { color: "#0075de", bg: "#eff6ff" };

                  return (
                    <div key={`${file.name}-${index}`} className="group flex items-center gap-3 px-7 py-3">
                      <div className="flex size-5 shrink-0 items-center justify-center">
                        <span className="flex size-5 items-center justify-center rounded-full bg-[#e6f4eb]">
                          <Check size={9} strokeWidth={3} className="text-[#1a7a46]" />
                        </span>
                      </div>
                      <span
                        className="flex size-8 shrink-0 items-center justify-center rounded-[7px] text-[10px] font-bold tracking-wide"
                        style={{ background: fileMeta.bg, color: fileMeta.color }}
                      >
                        {ext}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-medium leading-5 text-[#31302e]">
                          {file.name}
                        </p>
                        <p className="mt-0.5 text-[12px] leading-4 text-[#b5b0aa]">{formatBytes(file.size)}</p>
                      </div>
                      <button
                        type="button"
                        className="inline-flex h-7 shrink-0 items-center rounded-[7px] border border-transparent px-2 text-[13px] font-medium text-[#0075de] outline-none transition-colors duration-75 hover:border-[#2783DE] hover:bg-[#f7fbff] hover:text-[#0075de] focus-visible:border-[#2783DE] focus-visible:bg-[#f7fbff] focus-visible:text-[#0075de] focus-visible:ring-2 focus-visible:ring-[#2783DE]/15"
                      >
                        View
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-[#e6e6e6] px-7 py-5">
              <div className="flex items-center justify-between gap-3 text-[13px] leading-5 text-[#a39e98]">
                <span>{mockFiles.length} files ready to review</span>
                <span>{historyEntry.date}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  function addFiles(incoming: FileList | null) {
    if (!incoming) return;
    setFiles((prev) => [...prev, ...Array.from(incoming)]);
  }
  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }
  function handleDragOver(e: React.DragEvent) { e.preventDefault(); setIsDragOver(true); }
  function handleDragLeave(e: React.DragEvent) { e.preventDefault(); setIsDragOver(false); }
  function handleDrop(e: React.DragEvent) { e.preventDefault(); setIsDragOver(false); addFiles(e.dataTransfer.files); }

  function handleUpload() {
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];
    setStatuses(new Array(files.length).fill(0));
    setPhase("processing");
    const stagger    = shouldReduceMotion ? 15 : Math.min(300, Math.floor(2500 / Math.max(files.length, 1)));
    const readDur    = shouldReduceMotion ? 40 : 1200;
    const analyzeDur = shouldReduceMotion ? 40 : 1400;
    files.forEach((_, i) => {
      const base = i * stagger;
      timerRef.current.push(setTimeout(() => setStatuses(p => { const n = [...p]; n[i] = 1; return n; }), base));
      timerRef.current.push(setTimeout(() => setStatuses(p => { const n = [...p]; n[i] = 2; return n; }), base + readDur));
      timerRef.current.push(setTimeout(() => setStatuses(p => { const n = [...p]; n[i] = 3; return n; }), base + readDur + analyzeDur));
    });
  }

  return (
    <div className="flex h-full flex-col">
        <AnimatePresence mode="wait">
          {phase === "upload" ? (
            <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15, ease: easeOut }} className="flex h-full flex-col">
              <div className="flex h-[var(--dashboard-header-h)] flex-shrink-0 items-center justify-between border-b border-[#e6e6e6] px-7">
                <div>
                  <h2 className="text-[17px] font-semibold leading-6 tracking-[-0.15px] text-[#2c2c2b]">Upload invoices</h2>
                </div>
                <button type="button" onClick={onClose} className="ml-4 flex size-7 shrink-0 items-center justify-center rounded-[7px] text-[#a39e98] outline-none transition-colors duration-75 hover:bg-[#f6f5f4] hover:text-[#5f5e59]">
                  <X size={15} strokeWidth={1.8} />
                </button>
              </div>
              <div
                className={`relative flex-1 cursor-pointer overflow-y-auto px-7 py-6 transition-colors duration-150 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${isDragOver ? "bg-[#f4f9ff]" : "bg-white"}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {/* Drag-over overlay ring */}
                {/* Empty state: dot grid + glow + ghost invoice */}
                {!hasFiles && (
                  <div className="pointer-events-none absolute inset-0 select-none overflow-hidden flex flex-col items-center justify-center">
                    {/* Dot grid texture */}
                    <div className="absolute inset-0 opacity-[0.55]" style={{ backgroundImage: "radial-gradient(circle, #ccc8c2 1px, transparent 1px)", backgroundSize: "18px 18px" }} />

                    {/* Ambient glow */}
                    <motion.div
                      className="absolute inset-0"
                      animate={{ opacity: isDragOver ? 1 : 0.7 }}
                      transition={{ duration: 0.4, ease: easeOut }}
                      style={{ background: "radial-gradient(ellipse 80% 60% at 50% 46%, rgba(0,117,222,0.11) 0%, transparent 70%)" }}
                    />

                    {/* Cards + text centered as one unit */}
                    <div className="relative flex flex-col items-center">
                      {/* Card stack */}
                      <div className="relative h-[148px] w-[180px]">

                        {/* Back card */}
                        <motion.div
                          className="absolute inset-0"
                          animate={isDragOver && !shouldReduceMotion
                            ? { rotate: -8, x: -26, y: -8, scale: 1.02 }
                            : shouldReduceMotion
                              ? { rotate: -5, x: -16, y: 0 }
                              : { rotate: [-5, -6, -5], x: [-16, -18, -16], y: [0, -3, 0] }
                          }
                          transition={isDragOver
                            ? { duration: 0.38, ease: easeOut }
                            : { duration: 4, repeat: Infinity, ease: "easeInOut" }
                          }
                        >
                          <div className="w-[168px] rounded-[10px] border border-[#e8e5df] bg-white/60 p-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.05)] opacity-50">
                            <div className="mb-2 h-2 w-20 rounded-full bg-[#e0dcd5]" />
                            <div className="mb-1 h-1.5 w-14 rounded-full bg-[#eae7e1]" />
                            <div className="mb-3 h-1.5 w-10 rounded-full bg-[#eae7e1]" />
                            <div className="mb-2.5 h-px bg-[#f0ede8]" />
                            {[44, 32, 52].map((w, i) => (
                              <div key={i} className="mb-1.5 flex justify-between">
                                <div className="h-1.5 rounded-full bg-[#ebe8e2]" style={{ width: w }} />
                                <div className="h-1.5 w-8 rounded-full bg-[#ebe8e2]" />
                              </div>
                            ))}
                            <div className="mt-2.5 flex justify-end"><div className="h-2 w-16 rounded-full bg-[#dedad3]" /></div>
                          </div>
                        </motion.div>

                        {/* Front card */}
                        <motion.div
                          className="absolute inset-0"
                          animate={isDragOver && !shouldReduceMotion
                            ? { rotate: 7, x: 24, y: -10, scale: 1.04 }
                            : shouldReduceMotion
                              ? { rotate: 4, x: 14, y: 0 }
                              : { rotate: [4, 5, 4], x: [14, 16, 14], y: [0, -4, 0] }
                          }
                          transition={isDragOver
                            ? { duration: 0.38, ease: easeOut }
                            : { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.4 }
                          }
                        >
                          <div className="w-[168px] rounded-[10px] border border-[#e0ddd6] bg-white/85 p-3.5 shadow-[0_4px_16px_rgba(0,0,0,0.09)]">
                            <div className="mb-1 flex items-center justify-between">
                              <div className="h-2 w-16 rounded-full bg-[#d8d4cd]" />
                              <div className="h-1.5 w-10 rounded-full bg-[#e5e1da]" />
                            </div>
                            <div className="mb-3 h-1.5 w-12 rounded-full bg-[#eae7e1]" />
                            <div className="mb-2.5 h-[14px] w-20 rounded-[5px] bg-[#d4d0c8]" />
                            <div className="mb-2.5 h-px bg-[#eeebe5]" />
                            {[56, 40, 64, 36].map((w, i) => (
                              <div key={i} className="mb-1.5 flex justify-between">
                                <div className="h-1.5 rounded-full bg-[#e5e1da]" style={{ width: w }} />
                                <div className="h-1.5 w-9 rounded-full bg-[#e5e1da]" />
                              </div>
                            ))}
                          </div>
                        </motion.div>

                        {/* Sparkle */}
                        <motion.span
                          className="absolute -right-1 -top-2 text-[#62aef0]"
                          animate={shouldReduceMotion ? { opacity: 0.7 } : { opacity: [0.3, 1, 0.3], scale: [0.88, 1.15, 0.88] }}
                          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <Sparkles size={15} strokeWidth={1.8} />
                        </motion.span>
                      </div>

                      {/* Text below cards */}
                      <div className="mt-5 flex flex-col items-center">
                        <motion.p
                          className="text-[14px] font-semibold tracking-[-0.1px]"
                          animate={{ color: isDragOver ? "#0075de" : "#2c2b29" }}
                          transition={{ duration: 0.2 }}
                        >
                          {isDragOver ? "Release to add" : "Drop invoices here"}
                        </motion.p>
                        <p className="mt-1 text-[12px] text-[#b5b0aa]">PDF, JPG, PNG · AI extracts supplier, amount &amp; date</p>
                      </div>
                    </div>

                    {/* Drag-over ring */}
                    <AnimatePresence>
                      {isDragOver && (
                        <motion.div
                          className="pointer-events-none absolute inset-3 rounded-[12px] border-2 border-dashed border-[#0075de]/50"
                          initial={{ opacity: 0, scale: 0.97 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.97 }}
                          transition={{ duration: 0.2, ease: easeOut }}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                )}

                <AnimatePresence>
                  {hasFiles && (
                    <motion.div key="filelist" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.12, ease: easeOut } }} className="mt-4 flex flex-col gap-2">
                      <AnimatePresence initial={false}>
                        {files.map((file, index) => {
                          const fileExt = getFileExt(file);
                          return (
                            <motion.div
                              key={`${file.name}-${file.size}-${index}`}
                              layout
                              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.98 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.96 }}
                              transition={{ duration: 0.2, ease: easeOut }}
                              className="flex items-center gap-3 rounded-[10px] border border-[#e6e6e6] bg-white px-3 py-2.5"
                            >
                              <span className="flex size-8 shrink-0 items-center justify-center rounded-[7px] text-[10px] font-bold tracking-wide" style={{ background: fileExt.bg, color: fileExt.color }}>{fileExt.ext}</span>
                              <span className="min-w-0 flex-1">
                                <p className="truncate text-[13px] font-medium leading-5 text-[#31302e]">{file.name}</p>
                                <p className="flex items-center gap-1 text-[11px] leading-4 text-[#a39e98]">
                                  <span className="size-[5px] rounded-full bg-[#1aae39]" />
                                  Ready &middot; {formatBytes(file.size)}
                                </p>
                              </span>
                              <button type="button" onClick={e => { e.stopPropagation(); removeFile(index); }} className="flex size-6 shrink-0 items-center justify-center rounded-[6px] text-[#c9c4be] outline-none transition-colors duration-75 hover:bg-[#f6f5f4] hover:text-[#5f5e59]">
                                <X size={12} strokeWidth={2} />
                              </button>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="border-t border-[#e6e6e6] px-7 py-5">
                <AnimatePresence mode="wait">
                  {hasFiles ? (
                    <motion.button key="extract" type="button" onClick={handleUpload} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15, ease: easeOut }} className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[10px] bg-[#0075de] px-4 text-[14px] font-medium text-white shadow-[0_1px_2px_rgba(0,117,222,0.22),_0_0_0_1px_rgba(0,117,222,0.12)] outline-none transition-all duration-75 hover:bg-[#005bab] active:scale-[0.99]">
                      <Sparkles size={14} strokeWidth={1.8} aria-hidden="true" />
                      {`Extract ${files.length} ${files.length === 1 ? "invoice" : "invoices"} with AI`}
                    </motion.button>
                  ) : (
                    <motion.div key="sources" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15, ease: easeOut }} className="flex gap-2">
                      <button type="button" onClick={() => cameraInputRef.current?.click()} className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-[10px] bg-[#2783DE] text-[13px] font-medium text-white shadow-[0_1px_1px_rgba(39,131,222,0.16)] outline-none transition-colors duration-75 hover:bg-[#1f76c9]">
                        <Camera size={14} strokeWidth={1.8} />
                        Take photo
                      </button>
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-[10px] bg-[#2783DE] text-[13px] font-medium text-white shadow-[0_1px_1px_rgba(39,131,222,0.16)] outline-none transition-colors duration-75 hover:bg-[#1f76c9]">
                        <FolderOpen size={14} strokeWidth={1.8} />
                        Choose file
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2, ease: easeOut }} className="flex h-full flex-col">
              <div className="flex h-[var(--dashboard-header-h)] flex-shrink-0 items-center justify-between border-b border-[#e6e6e6] px-7">
                <div className="flex min-w-0 items-center gap-3">
                  <AnimatePresence mode="wait">
                    {allDone ? (
                      <motion.span key="ok" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.22, ease: easeOut }} className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#e9f7ef]">
                        <Check size={16} strokeWidth={2.5} className="text-[#1f7a4d]" />
                      </motion.span>
                    ) : (
                      <motion.span key="spin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#f0f7ff]">
                        <span className="size-[17px] animate-spin rounded-full border-2 border-[#0075de]/15 border-t-[#0075de]" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                  <div className="min-w-0">
                    <AnimatePresence mode="wait">
                      {allDone ? (
                        <motion.h2 key="done-h" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[17px] font-semibold leading-6 tracking-[-0.15px] text-[#1f7a4d]">
                          {files.length} {files.length === 1 ? "invoice" : "invoices"} ready
                        </motion.h2>
                      ) : (
                        <motion.h2 key="proc-h" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[17px] font-semibold leading-6 tracking-[-0.15px] text-[#2c2c2b]">
                          Extracting invoices
                        </motion.h2>
                      )}
                    </AnimatePresence>
                    <p className="mt-0.5 text-[13px] leading-5 text-[#a39e98]">
                      {`${doneCount} of ${files.length} done`}
                    </p>
                  </div>
                </div>
                <button type="button" onClick={onClose} className="ml-4 flex size-7 shrink-0 items-center justify-center rounded-[7px] text-[#a39e98] outline-none transition-colors duration-75 hover:bg-[#f6f5f4] hover:text-[#5f5e59]">
                  <X size={15} strokeWidth={1.8} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="divide-y divide-[#f4f3f1]">
                  {files.map((file, i) => {
                    const s = statuses[i] ?? 0;
                    const done   = s === 3;
                    const active = s === 1 || s === 2;
                    return (
                      <div key={i} className="group flex items-center gap-3 px-7 py-3">
                        {/* Status indicator */}
                        <div className="flex size-5 shrink-0 items-center justify-center">
                          {done ? (
                            <span className="flex size-5 items-center justify-center rounded-full bg-[#e6f4eb]">
                              <Check size={9} strokeWidth={3} className="text-[#1a7a46]" />
                            </span>
                          ) : active ? (
                            <span className="size-[14px] animate-spin rounded-full border-[1.5px] border-[#0075de]/20 border-t-[#0075de]" />
                          ) : (
                            <span className="size-[7px] rounded-full bg-[#dedad5]" />
                          )}
                        </div>

                        {/* Single-line: name · size */}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[14px] font-medium leading-5 text-[#31302e]">
                            {file.name}
                          </p>
                          <p className="mt-0.5 text-[12px] leading-4 text-[#b5b0aa]">{formatBytes(file.size)}</p>
                        </div>

                        {/* View — always visible when done */}
                        {done && (
                          <button
                            type="button"
                            className="inline-flex h-7 shrink-0 items-center rounded-[7px] border border-transparent px-2 text-[13px] font-medium text-[#0075de] outline-none transition-colors duration-75 hover:border-[#2783DE] hover:bg-[#f7fbff] hover:text-[#0075de] focus-visible:border-[#2783DE] focus-visible:bg-[#f7fbff] focus-visible:text-[#0075de] focus-visible:ring-2 focus-visible:ring-[#2783DE]/15"
                          >
                            View
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              {!allDone && (
                <div className="border-t border-[#e6e6e6] px-7 py-5">
                  <div className="flex items-center justify-center gap-2 text-[13px] text-[#a39e98]">
                    <span className="size-[13px] animate-spin rounded-full border-[1.5px] border-[#0075de]/15 border-t-[#0075de]" />
                    AI is reading your invoices…
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        <input ref={fileInputRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={e => addFiles(e.target.files)} />
        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => addFiles(e.target.files)} />
    </div>
  );
}

export default function PurchaseInvoicePage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("invoices");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUploadDrawerOpen, setIsUploadDrawerOpen] = useState(false);
  const [uploadDrawerMode, setUploadDrawerMode] = useState<UploadDrawerMode>("upload");
  const [selectedHistoryEntry, setSelectedHistoryEntry] = useState<HistoryEntry | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<(typeof purchaseInvoices)[number] | null>(null);
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const sortMenuRef = useRef<HTMLDivElement>(null);
  const statusMenuRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const currentSortOption = sortOptions.find((option) => option.key === sortKey);
  const currentStatusOption = statusOptions.find(
    (option) => option.key === statusFilter,
  );
  const isHistoryTab = activeTab === "history";
  const sortedInvoices = [...purchaseInvoices]
    .filter((invoice) =>
      statusFilter === "all" ? true : invoice.paymentStatus === statusFilter,
    )
    .sort((firstInvoice, secondInvoice) => {
      const firstValue = getSortValue(firstInvoice, sortKey);
      const secondValue = getSortValue(secondInvoice, sortKey);

      if (typeof firstValue === "number" && typeof secondValue === "number") {
        return sortDirection === "desc"
          ? secondValue - firstValue
          : firstValue - secondValue;
      }

      const comparison = String(firstValue).localeCompare(String(secondValue));
      return sortDirection === "desc" ? comparison * -1 : comparison;
    });

  function setSortColumn(nextSortKey: SortKey) {
    if (nextSortKey === sortKey) {
      setSortDirection((currentDirection) =>
        currentDirection === "asc" ? "desc" : "asc",
      );
      return;
    }

    setSortKey(nextSortKey);
    setSortDirection(defaultSortDirections[nextSortKey]);
  }

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;

      if (!sortMenuRef.current?.contains(target)) {
        setIsSortMenuOpen(false);
      }

      if (!statusMenuRef.current?.contains(target)) {
        setIsStatusMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  function closeUploadDrawer() {
    setIsUploadDrawerOpen(false);
    setUploadDrawerMode("upload");
    setSelectedHistoryEntry(null);
  }

  function openUploadDrawer() {
    setUploadDrawerMode("upload");
    setSelectedHistoryEntry(null);
    setIsUploadDrawerOpen(true);
  }

  function openHistoryDrawer(historyEntry: HistoryEntry) {
    setUploadDrawerMode("history");
    setSelectedHistoryEntry(historyEntry);
    setIsUploadDrawerOpen(true);
  }

  return (
    <div className="dashboard-shell min-h-screen bg-white md:flex">
      <DashboardSidebar
        activeItem="purchase-invoice"
        isMobileOpen={isSidebarOpen}
        onMobileClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 overflow-hidden">
      <main className="min-w-0 flex-1 overflow-y-auto bg-white text-[#2c2c2b]">
        <section className="flex min-h-screen flex-col">
          <header className="flex h-[var(--dashboard-header-h)] items-center justify-between border-b border-[#e6e6e6] px-[var(--dashboard-main-x)]">
            <div className="flex min-w-0 items-center gap-2">
              <button
                type="button"
                aria-label="Open navigation"
                onClick={() => setIsSidebarOpen(true)}
                className="flex size-7 shrink-0 items-center justify-center rounded-[7px] text-[#6f6a64] outline-none transition-colors duration-75 hover:bg-[#ededee] hover:text-[#2c2c2b] xl:hidden"
              >
                <Menu size={18} strokeWidth={1.8} aria-hidden="true" />
              </button>
              <h1 className="truncate text-[20px] font-semibold leading-7 tracking-[-0.125px] text-[#2c2c2b]">
                Purchase Invoice
              </h1>
              <div className="group relative flex shrink-0 items-center">
                <button
                  type="button"
                  aria-label="About Purchase Invoice"
                  className="flex items-center justify-center text-[#c9c4bf] outline-none transition-colors duration-75 hover:text-[#8f8983]"
                >
                  <Info size={15} strokeWidth={1.7} aria-hidden="true" />
                </button>
                <div className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 w-max max-w-[220px] -translate-x-1/2 rounded-[8px] bg-[#2c2c2b] px-3 py-2 text-[12px] leading-[1.45] text-white opacity-0 shadow-[0_4px_16px_rgba(15,15,15,0.18)] transition-opacity duration-150 group-hover:opacity-100">
                  Track and manage all AP purchase invoices — view status, supplier details, and payment progress.
                  <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-[#2c2c2b]" />
                </div>
              </div>
            </div>

            <div aria-hidden="true" />
          </header>

          <div className="flex h-[var(--dashboard-toolbar-h)] items-center justify-between gap-3 px-[var(--dashboard-main-x)]">
            <div className="inline-flex items-center gap-1 rounded-[8px] bg-[#f6f5f4] p-1">
              {[
                {
                  key: "invoices",
                  label: "Invoices",
                  count: purchaseInvoices.length,
                  Icon: FileText,
                },
                {
                  key: "history",
                  label: "History",
                  count: invoiceHistory.length,
                  Icon: Clock3,
                },
              ].map(({ key, label, count, Icon }) => {
                const isActive = activeTab === key;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveTab(key as ActiveTab)}
                    className={`inline-flex h-7 items-center gap-1.5 rounded-[6px] px-2 text-[13px] font-medium leading-5 outline-none transition-colors duration-75 ${
                      isActive
                        ? "bg-white text-[#2c2c2b] shadow-[0_1px_2px_rgba(15,15,15,0.08)]"
                        : "text-[#5f5e59] hover:bg-white/70 hover:text-[#2c2c2b]"
                    }`}
                  >
                    <Icon size={13} strokeWidth={1.8} aria-hidden="true" />
                    {label}
                    <span className="text-[#a39e98]">{count}</span>
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => (isUploadDrawerOpen ? closeUploadDrawer() : openUploadDrawer())}
              className={`inline-flex h-7 items-center gap-1.5 rounded-[7px] px-2.5 text-[13px] font-medium leading-5 outline-none transition-colors duration-75 ${isUploadDrawerOpen ? "bg-[#e8453c] text-white shadow-[0_1px_1px_rgba(232,69,60,0.18)] hover:bg-[#d63c34]" : "bg-[#2783DE] text-white shadow-[0_1px_1px_rgba(39,131,222,0.16)] hover:bg-[#1f76c9]"}`}
            >
              {isUploadDrawerOpen ? (
                <X size={13} strokeWidth={2} aria-hidden="true" />
              ) : (
                <Plus size={13} strokeWidth={1.9} aria-hidden="true" />
              )}
              {isUploadDrawerOpen ? "Dismiss" : "Create invoice"}
            </button>
          </div>
          <div className="mx-[var(--dashboard-main-x)] border-b border-[#e6e6e6]" />

          <div className="flex h-[var(--dashboard-toolbar-h)] items-center gap-2 px-[var(--dashboard-main-x)]">
            <label className="relative w-[var(--dashboard-toolbar-search-w)] max-w-[42vw] shrink">
              <span className="sr-only">
                {isHistoryTab ? "Search history" : "Search invoices"}
              </span>
              <Search
                size={14}
                strokeWidth={1.8}
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8f8983]"
              />
              <input
                type="search"
                placeholder={isHistoryTab ? "Search history..." : "Search invoices..."}
                className="h-8 w-full rounded-[7px] border border-[#e6e6e6] bg-white pl-8.5 pr-2 text-[14px] leading-5 text-[#2c2c2b] outline-none transition-colors duration-75 placeholder:text-[#a39e98] focus:border-[#0075de] focus:ring-2 focus:ring-[#62aef0]/20"
              />
            </label>
            <div ref={sortMenuRef} className="relative">
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={isSortMenuOpen}
                onClick={() => setIsSortMenuOpen((isOpen) => !isOpen)}
                      className="inline-flex h-8 items-center gap-1.5 rounded-[7px] border border-[#e6e6e6] bg-white px-3 text-[14px] font-medium leading-5 text-[#2c2c2b] outline-none transition-colors duration-75 hover:bg-[#f7f7f8] hover:text-[#2c2c2b] focus-visible:ring-1 focus-visible:ring-black/5"
                    >
                      <ListFilter size={13} strokeWidth={1.8} aria-hidden="true" />
                      Sort with {currentSortOption?.label}
                    </button>

              <AnimatePresence>
                {isSortMenuOpen ? (
                  <motion.div
                    role="menu"
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute left-0 top-8 z-20 w-[208px] origin-top-left rounded-[10px] border border-[#e6e6e6] bg-white p-1 shadow-[0_12px_28px_rgba(15,15,15,0.11)]"
                    exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -4 }}
                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : -6 }}
                    transition={{
                      duration: shouldReduceMotion ? 0 : 0.16,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    {sortOptions.map((option) => {
                      const isActiveSort = sortKey === option.key;

                      return (
                        <button
                          key={option.key}
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setSortKey(option.key);
                            setSortDirection(defaultSortDirections[option.key]);
                            setIsSortMenuOpen(false);
                          }}
                          className="flex min-h-9 w-full items-center justify-between gap-3 rounded-[7px] px-2 text-left outline-none transition-colors duration-75 hover:bg-[#f6f5f4] focus-visible:bg-[#f6f5f4]"
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            <span className="min-w-0">
                              <span className="block truncate text-[13px] font-medium leading-5 text-[#2c2c2b]">
                                {option.label}
                              </span>
                              <span className="block truncate text-[11px] font-medium leading-4 text-[#8f8983]">
                                {option.helper}
                              </span>
                            </span>
                          </span>
                          {isActiveSort ? (
                            <Check size={13} strokeWidth={2} aria-hidden="true" className="shrink-0 text-[#0075de]" />
                          ) : null}
                        </button>
                      );
                    })}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
            <div ref={statusMenuRef} className="relative">
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={isStatusMenuOpen}
                onClick={() => setIsStatusMenuOpen((isOpen) => !isOpen)}
                className="inline-flex h-8 items-center gap-1.5 rounded-[7px] border border-[#e6e6e6] bg-white px-3 text-[14px] font-medium leading-5 text-[#2c2c2b] outline-none transition-colors duration-75 hover:bg-[#f7f7f8] hover:text-[#2c2c2b] focus-visible:ring-1 focus-visible:ring-black/5"
              >
                <Tag size={13} strokeWidth={1.8} aria-hidden="true" />
                Status
                {currentStatusOption && currentStatusOption.key !== "all" ? (
                  <>
                    <span className="text-[#a39e98]">is</span>
                    <StatusFilterPill status={statusFilter} />
                  </>
                ) : null}
              </button>

              <AnimatePresence>
                {isStatusMenuOpen ? (
                  <motion.div
                    role="menu"
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute left-0 top-8 z-20 w-[196px] origin-top-left rounded-[10px] border border-[#e6e6e6] bg-white p-1 shadow-[0_12px_28px_rgba(15,15,15,0.11)]"
                    exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -4 }}
                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : -6 }}
                    transition={{
                      duration: shouldReduceMotion ? 0 : 0.16,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    {statusOptions.map((option) => {
                      const isActiveStatus = statusFilter === option.key;

                      return (
                        <button
                          key={option.key}
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setStatusFilter(option.key);
                            setIsStatusMenuOpen(false);
                          }}
                          className="flex min-h-9 w-full items-center justify-between gap-3 rounded-[7px] px-2 text-left outline-none transition-colors duration-75 hover:bg-[#f6f5f4] focus-visible:bg-[#f6f5f4]"
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            <span
                              className="size-2 shrink-0 rounded-full"
                              style={{ background: { all: "#d1d0ce", Paid: "#1f7a4d", Partial: "#f59e0b", Overdue: "#c2410c", Unpaid: "#a39e98" }[option.key] }}
                            />
                            <span className="min-w-0">
                              <span className="block truncate text-[13px] font-medium leading-5 text-[#2c2c2b]">
                                {option.label}
                              </span>
                              <span className="block truncate text-[11px] font-medium leading-4 text-[#8f8983]">
                                {option.helper}
                              </span>
                            </span>
                          </span>
                          {isActiveStatus ? (
                            <Check size={13} strokeWidth={2} aria-hidden="true" className="shrink-0 text-[#0075de]" />
                          ) : null}
                        </button>
                      );
                    })}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
            <button
              type="button"
              aria-label="Add filter"
              className="flex size-7 items-center justify-center rounded-[7px] border border-dashed border-[#dedbd7] text-[#8f8983] outline-none transition-colors duration-75 hover:bg-[#f7f7f8] hover:text-[#2c2c2b] focus-visible:ring-1 focus-visible:ring-black/5"
            >
              <Plus size={14} strokeWidth={1.8} aria-hidden="true" />
            </button>
          </div>
          <div className="mx-[var(--dashboard-main-x)] border-b border-[#e6e6e6]" />

          <div className="min-h-0 flex-1 overflow-auto px-[var(--dashboard-main-x)]">
            {activeTab === "invoices" ? (
            <table className="w-full min-w-[var(--invoice-table-min-w)] table-fixed border-separate border-spacing-0 text-left">
              <thead className="sticky top-0 z-10 bg-white">
                <tr>
                  {[
                    {
                      label: "Invoice No",
                      icon: Hash,
                      width: "w-[var(--invoice-col-number)]",
                      key: "invoiceNo",
                    },
                    {
                      label: "Supplier",
                      icon: Store,
                      width: "w-[var(--invoice-col-supplier)]",
                      key: "supplier",
                    },
                    {
                      label: "Date",
                      icon: CalendarDays,
                      width: "w-[var(--invoice-col-date)]",
                      key: "date",
                    },
                    {
                      label: "Agent",
                      icon: UserRound,
                      width: "w-[var(--invoice-col-agent)]",
                      key: "agent",
                    },
                    {
                      label: "Status",
                      icon: Circle,
                      width: "w-[var(--invoice-col-status)]",
                      key: "paymentStatus",
                    },
                    {
                      label: "Amount",
                      icon: Sparkles,
                      width: "w-[var(--invoice-col-amount)]",
                      key: "amount",
                    },
                    { label: "Action", icon: Ellipsis, width: "w-[var(--invoice-col-action)]" },
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
                      <th
                        key={column.label}
                        scope="col"
                        aria-sort={
                          isSortable && isActiveSort
                            ? isAscendingSort
                              ? "ascending"
                              : "descending"
                            : undefined
                        }
                        className={`${column.width} h-[var(--dashboard-head-h)] border-b ${isLastCol ? "" : "border-r"} border-[#e6e6e6] ${colPadding} text-[14px] font-medium leading-5 text-[#2c2c2b] ${
                          isAmount || isAction ? "text-right" : ""
                        }`}
                      >
                        {isSortable ? (
                          <div className="flex items-center justify-between">
                          <button
                            type="button"
                            aria-label={`Sort by ${column.label}`}
                            onClick={() => {
                              if (sortColumnKey) {
                                setSortColumn(sortColumnKey);
                              }
                            }}
                            className={`flex items-center gap-1.5 outline-none transition-colors duration-75 hover:text-[#2c2c2b] focus-visible:text-[#2c2c2b] ${
                              isAmount ? "justify-end" : "justify-start"
                            }`}
                          >
                            <Icon
                              size={14}
                              strokeWidth={1.75}
                              aria-hidden="true"
                              className="text-[#2c2c2b]"
                            />
                            <span className="truncate">{column.label}</span>
                            {isActiveSort ? (
                              isAscendingSort ? (
                                <ChevronUp
                                  size={12}
                                  strokeWidth={2}
                                  aria-hidden="true"
                                  className="shrink-0 text-[#0075de]"
                                />
                              ) : (
                                <ChevronDown
                                  size={12}
                                  strokeWidth={2}
                                  aria-hidden="true"
                                  className="shrink-0 text-[#0075de]"
                                />
                              )
                            ) : (
                              <ArrowUpDown
                                size={11}
                                strokeWidth={1.9}
                                aria-hidden="true"
                                className="shrink-0 text-[#2c2c2b]/45"
                              />
                            )}
                          </button>
                          {column.label === "Supplier" && (
                            <span className="inline-flex items-center rounded-[5px] bg-[#eff6ff] px-1.5 py-0.5 text-[12px] font-semibold leading-4 tracking-[0.2px] text-[#0075de]">
                              AI
                            </span>
                          )}
                          </div>
                        ) : (
                          <span
                            className={`flex items-center gap-1.5 ${
                              isAmount || isAction ? "justify-end" : ""
                            }`}
                          >
                            <Icon
                              size={14}
                              strokeWidth={1.75}
                              aria-hidden="true"
                              className="text-[#2c2c2b]"
                            />
                            {column.label}
                          </span>
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {sortedInvoices.map((invoice, index) => {
                  return (
                    <motion.tr
                      key={invoice.invoiceNo}
                      animate={{ opacity: 1, x: 0 }}
                      className="group h-[var(--dashboard-row-h)] bg-white transition-colors duration-75 hover:bg-[#f7f7f8]"
                      initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -24 }}
                      transition={{
                        delay: shouldReduceMotion ? 0 : index * 0.055,
                        duration: shouldReduceMotion ? 0 : 0.28,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <td className="border-b border-r border-[#f0efed] pl-6 pr-3 text-[14px] font-medium leading-5 text-[#2c2c2b]">
                        <InvoiceNumberCell invoiceNo={invoice.invoiceNo} />
                      </td>
                      <td className="border-b border-r border-[#f0efed] px-3 text-[14px] font-normal leading-5 text-[#2c2c2b]">
                        <SupplierCell supplier={invoice.supplier} />
                      </td>
                      <td className="border-b border-r border-[#f0efed] px-3 text-[14px] font-normal leading-5 text-[#5f5e59]">
                        <DateCell date={invoice.date} />
                      </td>
                      <td className="border-b border-r border-[#f0efed] px-3">
                        <AgentPill name={invoice.agent} />
                      </td>
                      <td className="border-b border-r border-[#f0efed] px-3">
                        <PaymentStatusPill status={invoice.paymentStatus} />
                      </td>
                      <td className="border-b border-r border-[#f0efed] px-3 text-right">
                        <AmountPill amount={invoice.amount} />
                      </td>
                      <td className="border-b border-[#f0efed] pl-3 pr-6 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            className="inline-flex h-7 items-center rounded-[7px] border border-transparent px-2 text-[14px] font-medium leading-5 text-[#0075de] outline-none transition-colors duration-75 hover:border-[#2783DE] hover:bg-[#f7fbff] focus-visible:border-[#2783DE] focus-visible:bg-[#f7fbff] focus-visible:ring-2 focus-visible:ring-[#2783DE]/15 max-xl:hidden"
                          >
                            Pay
                          </button>
                          <button
                            type="button"
                            aria-label={`View ${invoice.invoiceNo}`}
                            onClick={() => setViewingInvoice(invoice)}
                            className="inline-flex size-7 items-center justify-center rounded-[7px] text-[#8f8983] outline-none transition-colors duration-75 hover:bg-[#ededee] hover:text-[#2c2c2b] focus-visible:bg-[#ededee] focus-visible:ring-1 focus-visible:ring-black/5"
                          >
                            <Ellipsis
                              size={15}
                              strokeWidth={1.9}
                              aria-hidden="true"
                            />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
            ) : (
              <table className="w-full min-w-[var(--history-table-min-w)] table-fixed border-separate border-spacing-0 text-left">
                <thead className="sticky top-0 z-10 bg-white">
                  <tr>
                    {[
                      { label: "Taskname", icon: FileText, width: "w-[var(--history-col-task)]" },
                      { label: "Date", icon: CalendarDays, width: "w-[var(--history-col-date)]" },
                      { label: "Supplier", icon: Store, width: "w-[var(--history-col-supplier)]" },
                      { label: "Status", icon: Circle, width: "w-[var(--history-col-status)]" },
                      { label: "Action", icon: Ellipsis, width: "w-[var(--history-col-action)]" },
                    ].map((column, colIdx, allColumns) => {
                      const Icon = column.icon;
                      const isAction = column.label === "Action";
                      const isFirstCol = colIdx === 0;
                      const isLastCol = colIdx === allColumns.length - 1;
                      const colPadding = isFirstCol ? "pl-6 pr-3" : isLastCol ? "pl-3 pr-6" : "px-3";

                      return (
                        <th
                          key={column.label}
                          scope="col"
                          className={`${column.width} h-[var(--dashboard-head-h)] border-b ${isLastCol ? "" : "border-r"} border-[#e6e6e6] ${colPadding} text-[14px] font-medium leading-5 text-[#2c2c2b] ${
                            isAction ? "text-right" : ""
                          }`}
                        >
                          <span className={`flex items-center gap-1.5 ${isAction ? "justify-end" : ""}`}>
                            <Icon
                              size={14}
                              strokeWidth={1.75}
                              aria-hidden="true"
                              className="text-[#2c2c2b]"
                            />
                            {column.label}
                          </span>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {invoiceHistory.map((history, index) => (
                    <motion.tr
                      key={`${history.taskName}-${history.supplier}`}
                      animate={{ opacity: 1, x: 0 }}
                      className="group h-[var(--dashboard-row-h)] bg-white transition-colors duration-75 hover:bg-[#f7f7f8]"
                      initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -24 }}
                      transition={{
                        delay: shouldReduceMotion ? 0 : index * 0.055,
                        duration: shouldReduceMotion ? 0 : 0.28,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <td className="border-b border-r border-[#f0efed] pl-6 pr-3 text-[14px] font-medium leading-5 text-[#2c2c2b]">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="truncate">{history.taskName}</span>
                          <TypeBadge type={history.type} />
                        </div>
                      </td>
                      <td className="border-b border-r border-[#f0efed] px-3 text-[14px] font-normal leading-5 text-[#5f5e59]">
                        <DateCell date={history.date} />
                      </td>
                      <td className="border-b border-r border-[#f0efed] px-3 text-[14px] font-normal leading-5 text-[#2c2c2b]">
                        <SupplierCell supplier={history.supplier} />
                      </td>
                      <td className="border-b border-r border-[#f0efed] px-3">
                        <HistoryStatusPill status={history.status} />
                      </td>
                      <td className="border-b border-[#f0efed] pl-3 pr-6 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openHistoryDrawer(history)}
                            className="inline-flex h-7 items-center rounded-[7px] border border-transparent px-2 text-[14px] font-medium leading-5 text-[#0075de] outline-none transition-colors duration-75 hover:border-[#2783DE] hover:bg-[#f7fbff] focus-visible:border-[#2783DE] focus-visible:bg-[#f7fbff] focus-visible:ring-2 focus-visible:ring-[#2783DE]/15"
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>

      <AnimatePresence>
        {isUploadDrawerOpen && (
          <motion.aside
            key="upload-aside"
            className="relative flex-shrink-0 overflow-hidden border-l border-[#e6e6e6] bg-white"
            style={{ height: "100vh", position: "sticky", top: 0 }}
            initial={{ width: 0 }}
            animate={{ width: 440 }}
            exit={{ width: 0 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex h-full w-[440px] flex-col">
              <UploadDrawer
                mode={uploadDrawerMode}
                historyEntry={selectedHistoryEntry}
                onClose={closeUploadDrawer}
              />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      </div>

      <AnimatePresence>
        {viewingInvoice ? (
          <ViewInvoiceModal
            invoice={viewingInvoice}
            onClose={() => setViewingInvoice(null)}
          />
        ) : null}
      </AnimatePresence>

    </div>
  );
}

