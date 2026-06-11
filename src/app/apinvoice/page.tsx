"use client";

import {
  ArrowUpDown,
  Box,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Ellipsis,
  FileText,
  Hash,
  Info,
  ListFilter,
  Megaphone,
  Menu,
  Monitor,
  Package,
  Plus,
  Search,
  Sparkles,
  Store,
  Tag,
  Clock3,
  AlertCircle,
  Truck,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import React, { useEffect, useMemo, useRef, useState } from "react";

import { DashboardSidebar } from "@/components/sidebar";

type ApInvoiceDetail = {
  description: string;
  amount: number;
  netAmount: number;
};

type ApInvoice = {
  invoiceNo: string;
  paymentStatus: "Unpaid" | "Partial" | "Paid" | "Overdue";
  date: string;
  companyName: string;
  amount: number;
  supplierInvoiceNo: string;
  creditorCode: string;
  currency: string;
  netTotal: number;
  outstandingAmount: number;
  canCreateAPPayment: boolean;
  details: ApInvoiceDetail[];
};

type SortKey = "date" | "invoiceNo" | "paymentStatus" | "companyName" | "amount";
type SortDirection = "asc" | "desc";
type StatusFilter = "all" | ApInvoice["paymentStatus"];

const sortOptions: Array<{
  key: SortKey;
  label: string;
  helper: string;
}> = [
  { key: "date", label: "Date", helper: "Newest or oldest AP invoices" },
  { key: "invoiceNo", label: "Invoice No", helper: "Sort by internal invoice number" },
  {
    key: "paymentStatus",
    label: "Status",
    helper: "Sort by payment status",
  },
  { key: "companyName", label: "Company", helper: "Sort by creditor company" },
  { key: "amount", label: "Amount", helper: "Sort by invoice amount" },
];

const statusOptions: Array<{
  key: StatusFilter;
  label: string;
  helper: string;
}> = [
  { key: "all", label: "All statuses", helper: "Show every AP invoice" },
  { key: "Unpaid", label: "Unpaid", helper: "No payment made" },
  { key: "Partial", label: "Partial", helper: "Some payment made" },
  { key: "Paid", label: "Paid", helper: "Completed payment" },
  { key: "Overdue", label: "Overdue", helper: "Past due date" },
];

const apInvoices: ApInvoice[] = [
  {
    invoiceNo: "PIY1426#06001", supplierInvoiceNo: "MDW-2026-0601", creditorCode: "C001",
    currency: "MYR", paymentStatus: "Unpaid", date: "2026-06-09",
    companyName: "MEADOW IT DISTRIBUTION SDN BHD",
    amount: 900, netTotal: 900, outstandingAmount: 900, canCreateAPPayment: true,
    details: [
      { description: "Laptop Stand Pro (x2)", amount: 450, netAmount: 450 },
      { description: "USB-C Hub 7-in-1 (x3)", amount: 300, netAmount: 300 },
      { description: "Delivery Charge", amount: 150, netAmount: 150 },
    ],
  },
  {
    invoiceNo: "PIY1426#06002", supplierInvoiceNo: "OPS-INV-8291", creditorCode: "C002",
    currency: "MYR", paymentStatus: "Unpaid", date: "2026-06-08",
    companyName: "OfficePro Supplies",
    amount: 1240, netTotal: 1240, outstandingAmount: 1240, canCreateAPPayment: true,
    details: [
      { description: "A4 Paper Ream 80gsm (x10 BOX)", amount: 850, netAmount: 850 },
      { description: "Ballpoint Pen Assorted (x5 BOX)", amount: 60, netAmount: 60 },
      { description: "Stapler Heavy Duty (x2)", amount: 330, netAmount: 330 },
    ],
  },
  {
    invoiceNo: "PIY1426#06003", supplierInvoiceNo: "MP-2401-77", creditorCode: "C003",
    currency: "MYR", paymentStatus: "Partial", date: "2026-06-07",
    companyName: "Metro Paper Trading",
    amount: 856.3, netTotal: 856.3, outstandingAmount: 428.15, canCreateAPPayment: true,
    details: [
      { description: "Carbonless Paper NCR A4 (x200)", amount: 190, netAmount: 190 },
      { description: "Thermal Roll 80mm x 80m (x3 CTN)", amount: 264, netAmount: 264 },
      { description: "Glossy Photo Paper 200gsm (x4 PKT)", amount: 202.3, netAmount: 202.3 },
    ],
  },
  {
    invoiceNo: "PIY1426#06004", supplierInvoiceNo: "NSL-00984", creditorCode: "C004",
    currency: "MYR", paymentStatus: "Paid", date: "2026-06-06",
    companyName: "Northstar Logistics",
    amount: 3420, netTotal: 3420, outstandingAmount: 0, canCreateAPPayment: false,
    details: [
      { description: "Freight Charges — Peninsular", amount: 1800, netAmount: 1800 },
      { description: "Pallet Wrapping Service (x12 PLT)", amount: 1020, netAmount: 1020 },
      { description: "Handling & Storage Fee (x2 MTH)", amount: 600, netAmount: 600 },
    ],
  },
  {
    invoiceNo: "PIY1426#06005", supplierInvoiceNo: "BH-2026-511", creditorCode: "C005",
    currency: "MYR", paymentStatus: "Overdue", date: "2026-06-05",
    companyName: "Brightline Hardware",
    amount: 612.9, netTotal: 612.9, outstandingAmount: 612.9, canCreateAPPayment: true,
    details: [
      { description: "PVC Conduit Pipe 20mm x 4m (x30)", amount: 135, netAmount: 135 },
      { description: "Circuit Breaker 40A (x3)", amount: 267.9, netAmount: 267.9 },
      { description: "Junction Box IP65 (x10)", amount: 210, netAmount: 210 },
    ],
  },
  {
    invoiceNo: "PIY1426#06006", supplierInvoiceNo: "GPK-66120", creditorCode: "C006",
    currency: "MYR", paymentStatus: "Unpaid", date: "2026-06-04",
    companyName: "Greenfield Packaging",
    amount: 2105.45, netTotal: 2105.45, outstandingAmount: 2105.45, canCreateAPPayment: true,
    details: [
      { description: "Corrugated Box 40x30x30cm (x500)", amount: 925, netAmount: 925 },
      { description: "Bubble Wrap Roll 1m x 50m (x6 ROL)", amount: 468, netAmount: 468 },
      { description: "Stretch Film 500mm x 300m (x8 ROL)", amount: 712.45, netAmount: 712.45 },
    ],
  },
  {
    invoiceNo: "PIY1426#06007", supplierInvoiceNo: "AOS-1044", creditorCode: "C007",
    currency: "MYR", paymentStatus: "Paid", date: "2026-06-03",
    companyName: "Apex Office Systems",
    amount: 498, netTotal: 498, outstandingAmount: 0, canCreateAPPayment: false,
    details: [
      { description: "Toner Cartridge HP 85A (x2)", amount: 298, netAmount: 298 },
      { description: "Mouse Wireless Logitech (x2)", amount: 130, netAmount: 130 },
      { description: "USB Hub 4-Port 3.0 (x2)", amount: 70, netAmount: 70 },
    ],
  },
  {
    invoiceNo: "PIY1426#06008", supplierInvoiceNo: "ES-77214", creditorCode: "C008",
    currency: "MYR", paymentStatus: "Unpaid", date: "2026-06-01",
    companyName: "Evermark Services",
    amount: 925, netTotal: 925, outstandingAmount: 925, canCreateAPPayment: true,
    details: [
      { description: "Name Card Printing 500pcs (x2 SET)", amount: 170, netAmount: 170 },
      { description: "A3 Poster Printing Glossy (x50)", amount: 225, netAmount: 225 },
      { description: "Pull-Up Banner 85x200cm (x2)", amount: 530, netAmount: 530 },
    ],
  },
];

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-MY", {
    currency: "MYR",
    currencyDisplay: "code",
    minimumFractionDigits: 2,
    style: "currency",
  })
    .format(amount)
    .replace("MYR", "RM");
}

function getSortValue(invoice: ApInvoice, key: SortKey) {
  if (key === "date") {
    return new Date(`${invoice.date}T00:00:00`).getTime();
  }

  if (key === "amount") {
    return invoice.amount;
  }

  if (key === "paymentStatus") {
    return {
      Overdue: 4,
      Unpaid: 3,
      Partial: 2,
      Paid: 1,
    }[invoice.paymentStatus];
  }

  return invoice[key].toLowerCase();
}

type CompanyMeta = { color: string; Icon: React.ElementType };

const companyMetaMap: Record<string, CompanyMeta> = {
  "MEADOW IT DISTRIBUTION SDN BHD": { color: "#dd5b00", Icon: Box },
  "OfficePro Supplies": { color: "#dd5b00", Icon: Box },
  "Metro Paper Trading": { color: "#2563eb", Icon: FileText },
  "Northstar Logistics": { color: "#7c3aed", Icon: Truck },
  "Brightline Hardware": { color: "#1aae39", Icon: Zap },
  "Greenfield Packaging": { color: "#2a9d99", Icon: Package },
  "Apex Office Systems": { color: "#c026d3", Icon: Monitor },
  "Evermark Services": { color: "#92400e", Icon: Megaphone },
};

function resolveCompanyMeta(companyName: string): CompanyMeta {
  return companyMetaMap[companyName] ?? { color: "#615d59", Icon: Store };
}

function CompanyCell({ companyName }: Readonly<{ companyName: string }>) {
  const { color, Icon } = resolveCompanyMeta(companyName);

  return (
    <span className="inline-flex max-w-full items-center gap-2">
      <Icon size={16} strokeWidth={1.9} aria-hidden="true" className="shrink-0" style={{ color }} />
      <span className="truncate text-[14px] font-medium leading-5 text-[#31302e]">
        {companyName}
      </span>
    </span>
  );
}

function DateCell({ date }: Readonly<{ date: string }>) {
  const formattedDate = formatDate(date);
  const month = formattedDate.split(" ")[1] ?? "";
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
      <CalendarDays
        size={14}
        strokeWidth={1.8}
        aria-hidden="true"
        style={{ color: icon }}
        className="shrink-0 max-xl:hidden"
      />
      {formattedDate}
    </span>
  );
}

function AmountCell({ amount }: Readonly<{ amount: number }>) {
  const amountStyle =
    amount >= 3000
      ? "bg-[#fdecec] text-[#a84422]"
      : amount >= 1000
        ? "bg-[#fff4db] text-[#8a5a00]"
        : "bg-[#f1f0ee] text-[#5f5e59]";

  return (
    <span className={`inline-flex h-6 items-center rounded-[6px] px-2 text-[14px] font-medium leading-5 tabular-nums ${amountStyle}`}>
      {formatCurrency(amount)}
    </span>
  );
}

function PaymentStatusPill({ status }: Readonly<{ status: ApInvoice["paymentStatus"] }>) {
  const { pill, Icon } =
    {
      Paid: { pill: "bg-[#e9f7ef] text-[#1f7a4d]", Icon: CheckCircle2 },
      Partial: { pill: "bg-[#fff4db] text-[#9a6700]", Icon: Clock3 },
      Overdue: { pill: "bg-[#fdecec] text-[#c2410c]", Icon: AlertCircle },
      Unpaid: { pill: "bg-[#f1f0ee] text-[#5f5e59]", Icon: Circle },
    }[status] ?? { pill: "bg-[#f1f0ee] text-[#5f5e59]", Icon: Circle };

  return (
    <span className={`inline-flex h-6 items-center gap-1.5 rounded-[6px] px-2 text-[13px] font-medium leading-5 ${pill}`}>
      <Icon size={12} strokeWidth={2} aria-hidden="true" className="shrink-0" />
      {status}
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

function ViewAPInvoiceDrawer({
  invoice,
  onClose,
}: Readonly<{
  invoice: ApInvoice;
  onClose: () => void;
}>) {
  const shouldReduceMotion = useReducedMotion();

  const { color: companyColor, Icon: CompanyIcon } = resolveCompanyMeta(invoice.companyName);

  const statusStyle =
    {
      Paid: "bg-[#e9f7ef] text-[#1f7a4d]",
      Partial: "bg-[#fff4db] text-[#9a6700]",
      Overdue: "bg-[#fdecec] text-[#c2410c]",
      Unpaid: "bg-[#f1f0ee] text-[#5f5e59]",
    }[invoice.paymentStatus] ?? "bg-[#f1f0ee] text-[#5f5e59]";

  const formattedDate = formatDate(invoice.date);
  const month = formattedDate.split(" ")[1] ?? "";
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
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: shouldReduceMotion ? 0.14 : 0.24, ease: [0.16, 1, 0.3, 1] }}
        onClick={onClose}
      />

      {/* Drawer */}
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
        transition={{ duration: shouldReduceMotion ? 0.16 : 0.34, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformOrigin: "right center", willChange: "transform, opacity, filter" }}
      >
        {/* Section 1: Invoice No + status + close */}
        <div className="flex items-center justify-between gap-4 px-7 pt-6 pb-1">
          <div className="flex min-w-0 items-center gap-2.5">
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

        {/* Section 2: Company identity */}
        <div className="px-7 pt-4 pb-5">
          <div className="flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-[10px] bg-[#f6f5f4]">
              <CompanyIcon size={22} strokeWidth={1.75} aria-hidden="true" style={{ color: companyColor }} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[16px] font-semibold leading-6 text-[#2c2c2b]">
                {invoice.companyName}
              </p>
              <p className="mt-0.5 text-[13px] leading-5 text-[#a39e98]">
                {invoice.creditorCode} · {invoice.currency}
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Date + Supplier INV ref */}
        <div className="flex items-center gap-2 border-t border-[#e6e6e6] px-7 py-4">
          <span
            className="inline-flex h-7 items-center gap-1.5 rounded-[6px] px-2.5 text-[13px] font-medium"
            style={{ background: dateColor.bg, color: dateColor.text }}
          >
            <CalendarDays size={13} strokeWidth={1.8} style={{ color: dateColor.icon }} className="shrink-0" />
            {formattedDate}
          </span>
          <span className="inline-flex h-7 items-center gap-1.5 rounded-[6px] bg-[#f6f5f4] px-2.5 text-[13px] font-medium text-[#5f5e59]">
            <Hash size={12} strokeWidth={2} aria-hidden="true" className="shrink-0 text-[#a39e98]" />
            {invoice.supplierInvoiceNo}
          </span>
        </div>

        {/* Section 4: Line items */}
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
                    { col: "Amount", align: "right" },
                    { col: "Net Amount", align: "right" },
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
              {invoice.details.map((item, idx) => (
                <tr key={idx} className="transition-colors duration-75 hover:bg-[#f7f7f8]">
                  <td className="border-b border-[#f0efed] py-3 pl-7 pr-3 text-[14px] leading-5 text-[#31302e]">
                    {item.description}
                  </td>
                  <td className="border-b border-[#f0efed] px-3 py-3 text-right text-[14px] tabular-nums text-[#5f5e59]">
                    {item.amount.toFixed(2)}
                  </td>
                  <td className="border-b border-[#f0efed] py-3 pl-3 pr-7 text-right text-[14px] font-medium tabular-nums text-[#31302e]">
                    {item.netAmount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Section 5: Totals + action */}
        <div className="border-t border-[#e6e6e6] px-7 py-5">
          <div className="flex items-end justify-between">
            <div className="space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="w-[88px] text-[11px] font-semibold uppercase tracking-[0.4px] text-[#a39e98]">
                  Total
                </span>
                <span className="text-[15px] font-semibold tabular-nums text-[#2c2c2b]">
                  {formatCurrency(invoice.netTotal)}
                </span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="w-[88px] text-[11px] font-semibold uppercase tracking-[0.4px] text-[#a39e98]">
                  Outstanding
                </span>
                <span
                  className={`text-[15px] font-semibold tabular-nums ${
                    invoice.outstandingAmount === 0 ? "text-[#1f7a4d]" : "text-[#c2410c]"
                  }`}
                >
                  {formatCurrency(invoice.outstandingAmount)}
                </span>
              </div>
            </div>
            {invoice.canCreateAPPayment && invoice.outstandingAmount > 0 && (
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

export default function APInvoicePage() {
  const [searchValue, setSearchValue] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<ApInvoice | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const sortMenuRef = useRef<HTMLDivElement>(null);
  const statusMenuRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const activeSortOption =
    sortOptions.find((option) => option.key === sortKey) ?? sortOptions[0];
  const currentStatusOption = statusOptions.find((option) => option.key === statusFilter);

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

  const filteredInvoices = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    return apInvoices.filter((invoice) => {
      if (statusFilter !== "all" && invoice.paymentStatus !== statusFilter) {
        return false;
      }

      if (normalizedSearch.length === 0) {
        return true;
      }

      return [
        invoice.invoiceNo,
        invoice.paymentStatus,
        invoice.companyName,
      ].some((value) => value.toLowerCase().includes(normalizedSearch));
    });
  }, [searchValue, statusFilter]);

  const sortedInvoices = useMemo(() => {
    return [...filteredInvoices].sort((leftInvoice, rightInvoice) => {
      const leftValue = getSortValue(leftInvoice, sortKey);
      const rightValue = getSortValue(rightInvoice, sortKey);

      if (leftValue < rightValue) {
        return sortDirection === "asc" ? -1 : 1;
      }

      if (leftValue > rightValue) {
        return sortDirection === "asc" ? 1 : -1;
      }

      return 0;
    });
  }, [filteredInvoices, sortDirection, sortKey]);

  function setSortColumn(nextSortKey: SortKey) {
    if (nextSortKey === sortKey) {
      setSortDirection((currentDirection) =>
        currentDirection === "asc" ? "desc" : "asc",
      );
      return;
    }

    setSortKey(nextSortKey);
    setSortDirection(nextSortKey === "date" || nextSortKey === "amount" ? "desc" : "asc");
  }

  return (
    <div className="dashboard-shell min-h-screen bg-white md:flex">
      <DashboardSidebar
        activeItem="ap-invoice"
        isMobileOpen={isSidebarOpen}
        onMobileClose={() => setIsSidebarOpen(false)}
      />
      <main
        className="min-h-[calc(100vh-64px)] min-w-0 flex-1 bg-white text-[#2c2c2b] md:min-h-screen"
        style={{
          fontFamily: 'var(--font-inter), "Inter Variable", Inter, sans-serif',
          fontOpticalSizing: "auto",
          fontSynthesis: "none",
          textRendering: "optimizeLegibility",
          WebkitFontSmoothing: "antialiased",
        }}
      >
        <section className="flex min-h-screen flex-col">
          <header className="flex h-[var(--dashboard-header-h)] items-center justify-between border-b border-[#e6e6e6] px-[var(--dashboard-main-x)]">
            <div className="flex min-w-0 items-center gap-2">
              <button
                type="button"
                aria-label="Open navigation"
                onClick={() => setIsSidebarOpen(true)}
                className="flex size-7 shrink-0 items-center justify-center rounded-[7px] text-[#6f6a64] outline-none transition-colors duration-75 hover:bg-[#ededee] hover:text-[#2c2c2b] lg:hidden"
              >
                <Menu size={18} strokeWidth={1.8} aria-hidden="true" />
              </button>
              <h1 className="truncate text-[20px] font-semibold leading-7 tracking-[-0.125px] text-[#2c2c2b]">
                AP Invoice
              </h1>
              <div className="group relative flex shrink-0 items-center">
                <button
                  type="button"
                  aria-label="About AP Invoice"
                  className="flex items-center justify-center text-[#c9c4bf] outline-none transition-colors duration-75 hover:text-[#8f8983]"
                >
                  <Info size={15} strokeWidth={1.7} aria-hidden="true" />
                </button>
                <div className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 w-max max-w-[220px] -translate-x-1/2 rounded-[8px] bg-[#2c2c2b] px-3 py-2 text-[12px] leading-[1.45] text-white opacity-0 shadow-[0_4px_16px_rgba(15,15,15,0.18)] transition-opacity duration-150 group-hover:opacity-100">
                  View and manage accounts payable invoices — track payment status and outstanding balances.
                  <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-[#2c2c2b]" />
                </div>
              </div>
            </div>
          </header>

          <div className="flex h-[var(--dashboard-toolbar-h)] items-center justify-end gap-3 px-[var(--dashboard-main-x)]">
            <button
              type="button"
              className="inline-flex h-7 items-center gap-1.5 rounded-[7px] bg-[#2783DE] px-2.5 text-[13px] font-medium leading-5 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)] outline-none transition-colors duration-75 hover:bg-[#1f75ca] focus-visible:ring-2 focus-visible:ring-[#2783DE]/20"
            >
              <Plus size={14} strokeWidth={1.9} aria-hidden="true" />
              Create invoice
            </button>
          </div>
          <div className="mx-[var(--dashboard-main-x)] border-b border-[#e6e6e6]" />

          <div className="flex h-[var(--dashboard-toolbar-h)] items-center gap-2 px-[var(--dashboard-main-x)]">
            <label className="relative w-[var(--dashboard-toolbar-search-w)] max-w-[42vw] shrink">
              <span className="sr-only">Search invoices</span>
              <Search
                size={14}
                strokeWidth={1.8}
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8f8983]"
              />
              <input
                type="search"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search invoices..."
                className="h-8 w-full rounded-[7px] border border-[#e6e6e6] bg-white pl-8.5 pr-2 text-[14px] leading-5 text-[#2c2c2b] outline-none transition-colors duration-75 placeholder:text-[#a39e98] focus:border-[#0075de] focus:ring-2 focus:ring-[#62aef0]/20"
              />
            </label>

            <div className="relative" ref={sortMenuRef}>
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={isSortMenuOpen}
                onClick={() => setIsSortMenuOpen((isOpen) => !isOpen)}
                className="inline-flex h-8 items-center gap-1.5 rounded-[7px] border border-[#e6e6e6] bg-white px-3 text-[14px] font-medium leading-5 text-[#2c2c2b] outline-none transition-colors duration-75 hover:bg-[#f7f7f8] hover:text-[#2c2c2b] focus-visible:ring-1 focus-visible:ring-black/5"
              >
                <ListFilter size={13} strokeWidth={1.8} aria-hidden="true" />
                Sort with {activeSortOption.label}
              </button>

              <AnimatePresence>
                {isSortMenuOpen ? (
                  <motion.div
                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -4 }}
                    transition={{
                      duration: shouldReduceMotion ? 0 : 0.16,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="absolute left-0 top-8 z-20 w-[208px] origin-top-left rounded-[10px] border border-[#e6e6e6] bg-white p-1 shadow-[0_12px_28px_rgba(15,15,15,0.11)]"
                  >
                    {sortOptions.map((option) => {
                      const isActiveSort = option.key === sortKey;

                      return (
                        <button
                          key={option.key}
                          type="button"
                          onClick={() => {
                            setSortColumn(option.key);
                            setIsSortMenuOpen(false);
                          }}
                          className="flex min-h-9 w-full items-center justify-between gap-3 rounded-[7px] px-2 text-left outline-none transition-colors duration-75 hover:bg-[#f6f5f4] focus-visible:bg-[#f6f5f4]"
                        >
                          <span className="min-w-0">
                            <span className="block truncate text-[13px] font-medium leading-5 text-[#2c2c2b]">
                              {option.label}
                            </span>
                            <span className="block truncate text-[11px] font-medium leading-4 text-[#8f8983]">
                              {option.helper}
                            </span>
                          </span>
                          {isActiveSort ? (
                            <Check
                              size={13}
                              strokeWidth={2}
                              aria-hidden="true"
                              className="shrink-0 text-[#0075de]"
                            />
                          ) : null}
                        </button>
                      );
                    })}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
            <div className="relative" ref={statusMenuRef}>
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
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute left-0 top-8 z-20 w-[196px] origin-top-left rounded-[10px] border border-[#e6e6e6] bg-white p-1 shadow-[0_12px_28px_rgba(15,15,15,0.11)]"
                    exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.96 }}
                    initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.96 }}
                    transition={{
                      duration: shouldReduceMotion ? 0 : 0.15,
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
                              style={{
                                background: {
                                  all: "#d1d0ce",
                                  Paid: "#1f7a4d",
                                  Partial: "#f59e0b",
                                  Overdue: "#c2410c",
                                  Unpaid: "#a39e98",
                                }[option.key],
                              }}
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
                            <Check
                              size={13}
                              strokeWidth={2}
                              aria-hidden="true"
                              className="shrink-0 text-[#0075de]"
                            />
                          ) : null}
                        </button>
                      );
                    })}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
          <div className="mx-[var(--dashboard-main-x)] border-b border-[#e6e6e6]" />

          <div className="min-h-0 flex-1 overflow-auto px-[var(--dashboard-main-x)]">
            <table className="w-full min-w-[var(--apinvoice-table-min-w)] table-fixed border-separate border-spacing-0 text-left">
              <thead className="sticky top-0 z-10 bg-white">
                <tr>
                  {[
                    {
                      label: "Invoice No",
                      icon: Hash,
                      width: "w-[var(--apinvoice-col-number)]",
                      key: "invoiceNo",
                    },
                    {
                      label: "Company",
                      icon: Store,
                      width: "w-[var(--apinvoice-col-company)]",
                      key: "companyName",
                    },
                    {
                      label: "Date",
                      icon: CalendarDays,
                      width: "w-[var(--apinvoice-col-date)]",
                      key: "date",
                    },
                    {
                      label: "Status",
                      icon: Circle,
                      width: "w-[var(--apinvoice-col-status)]",
                      key: "paymentStatus",
                    },
                    {
                      label: "Amount",
                      icon: Sparkles,
                      width: "w-[var(--apinvoice-col-amount)]",
                      key: "amount",
                    },
                    {
                      label: "Action",
                      icon: Ellipsis,
                      width: "w-[var(--apinvoice-col-action)]",
                      key: undefined,
                    },
                  ].map((column, columnIndex, columns) => {
                    const Icon = column.icon;
                    const isLastColumn = columnIndex === columns.length - 1;
                    const isAmountColumn = column.label === "Amount";
                    const isActionColumn = column.label === "Action";
                    const isSortable = Boolean(column.key);
                    const isActiveSort = column.key === sortKey;
                    const isAscendingSort = isActiveSort && sortDirection === "asc";
                    const sortColumnKey = column.key as SortKey | undefined;
                    const columnPadding =
                      columnIndex === 0 ? "pl-6 pr-3" : isLastColumn ? "pl-3 pr-6" : "px-3";

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
                        className={`${column.width} h-[var(--dashboard-head-h)] border-b ${
                          isLastColumn ? "" : "border-r"
                        } border-[#e6e6e6] ${columnPadding} text-[14px] font-medium leading-5 text-[#2c2c2b] ${
                          isAmountColumn ? "text-right" : ""
                        } ${
                          isActionColumn ? "text-right" : ""
                        }`}
                      >
                        {isSortable ? (
                          <div
                            className={`flex w-full items-center gap-1.5 ${
                              column.label === "Company"
                                ? "justify-between"
                                : isAmountColumn
                                  ? "justify-end"
                                  : ""
                            }`}
                          >
                            <button
                              type="button"
                              aria-label={`Sort by ${column.label}`}
                              onClick={() => {
                                if (sortColumnKey) {
                                  setSortColumn(sortColumnKey);
                                }
                              }}
                              className={`flex min-w-0 items-center gap-1.5 outline-none transition-colors duration-75 hover:text-[#2c2c2b] focus-visible:text-[#2c2c2b] ${
                                isAmountColumn ? "justify-end" : "justify-start"
                              }`}
                            >
                              {Icon ? (
                                <Icon
                                  size={14}
                                  strokeWidth={1.75}
                                  aria-hidden="true"
                                  className="shrink-0 text-[#2c2c2b]"
                                />
                              ) : null}
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
                            {column.label === "Company" && (
                              <span className="inline-flex items-center rounded-[5px] bg-[#eff6ff] px-1.5 py-0.5 text-[12px] font-semibold leading-4 tracking-[0.2px] text-[#0075de]">
                                AI
                              </span>
                            )}
                          </div>
                        ) : (
                          <span
                            className={`flex items-center gap-1.5 ${
                              isActionColumn ? "justify-end" : ""
                            }`}
                          >
                            {Icon ? (
                              <Icon
                                size={14}
                                strokeWidth={1.75}
                                aria-hidden="true"
                                className="shrink-0 text-[#2c2c2b]"
                              />
                            ) : null}
                            <span className="truncate">{column.label}</span>
                          </span>
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {sortedInvoices.map((invoice, index) => (
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
                      <span className="text-[14px] font-medium leading-5 text-[#2c2c2b]">
                        {invoice.invoiceNo}
                      </span>
                    </td>
                    <td className="border-b border-r border-[#f0efed] px-3 text-[14px] font-normal leading-5">
                      <CompanyCell companyName={invoice.companyName} />
                    </td>
                    <td className="border-b border-r border-[#f0efed] px-3">
                      <DateCell date={invoice.date} />
                    </td>
                    <td className="border-b border-r border-[#f0efed] px-3">
                      <PaymentStatusPill status={invoice.paymentStatus} />
                    </td>
                    <td className="border-b border-r border-[#f0efed] pl-3 pr-6 text-right">
                      <AmountCell amount={invoice.amount} />
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
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <AnimatePresence>
        {viewingInvoice ? (
          <ViewAPInvoiceDrawer
            key={viewingInvoice.invoiceNo}
            invoice={viewingInvoice}
            onClose={() => setViewingInvoice(null)}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
