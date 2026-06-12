"use client";

import {
  ArrowUpDown,
  Box,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Ellipsis,
  FileText,
  Hash,
  Info,
  ListFilter,
  Menu,
  Megaphone,
  Monitor,
  Package,
  Plus,
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
import React, { useEffect, useMemo, useRef, useState } from "react";

import { DashboardSidebar } from "@/components/sidebar";

type ReceiptInvoice = {
  invoiceNo: string;
  date: string;
  applied: number;
};

type ARPayment = {
  receiptNo: string;
  companyName: string;
  date: string;
  description: string;
  amount: number;
  customerCode: string;
  receiptMethod: string;
  receivedBy: string;
  appliedInvoices: ReceiptInvoice[];
};

type SortKey =
  | "date"
  | "receiptNo"
  | "companyName"
  | "description"
  | "amount";
type SortDirection = "asc" | "desc";

const sortOptions: Array<{
  key: SortKey;
  label: string;
  helper: string;
}> = [
  { key: "date", label: "Date", helper: "Newest or oldest receipts" },
  { key: "receiptNo", label: "Receipt No", helper: "Sort by receipt no" },
  { key: "companyName", label: "Company", helper: "Sort by customer company" },
  { key: "description", label: "Description", helper: "Sort by description" },
  { key: "amount", label: "Amount", helper: "Sort by receipt amount" },
];

const receipts: ARPayment[] = [
  {
    receiptNo: "RV-2026-0001",
    customerCode: "300-C001",
    companyName: "Vertex Retail Sdn Bhd",
    date: "2026-06-09",
    description: "Received payment for June printer supply invoice",
    amount: 1640,
    receiptMethod: "MYR BANK TRANSFER",
    receivedBy: "A COUNTS RECEIVABLE",
    appliedInvoices: [{ invoiceNo: "SI-2026-0001", date: "2026-06-08", applied: 1640 }],
  },
  {
    receiptNo: "RV-2026-0002",
    customerCode: "300-C002",
    companyName: "BluePeak Foods",
    date: "2026-06-08",
    description: "Partial settlement for catering consumables invoice",
    amount: 856.3,
    receiptMethod: "MYR CHEQUE",
    receivedBy: "A COUNTS RECEIVABLE",
    appliedInvoices: [{ invoiceNo: "SI-2026-0002", date: "2026-06-07", applied: 856.3 }],
  },
  {
    receiptNo: "RV-2026-0003",
    customerCode: "300-C003",
    companyName: "Northstar Cafe Group",
    date: "2026-06-07",
    description: "Payment received for logistics and cafe setup items",
    amount: 3420,
    receiptMethod: "MYR BANK TRANSFER",
    receivedBy: "A COUNTS RECEIVABLE",
    appliedInvoices: [{ invoiceNo: "SI-2026-0003", date: "2026-06-06", applied: 3420 }],
  },
  {
    receiptNo: "RV-2026-0004",
    customerCode: "300-C004",
    companyName: "Brightline Studio",
    date: "2026-06-06",
    description: "Collected payment for hardware support services",
    amount: 612.9,
    receiptMethod: "MYR CASH",
    receivedBy: "M PETTY CASH",
    appliedInvoices: [{ invoiceNo: "SI-2026-0004", date: "2026-06-05", applied: 612.9 }],
  },
  {
    receiptNo: "RV-2026-0005",
    customerCode: "300-C005",
    companyName: "Greenfield Packaging",
    date: "2026-06-05",
    description: "Receipt for monthly packaging replenishment order",
    amount: 2105.45,
    receiptMethod: "MYR BANK TRANSFER",
    receivedBy: "A COUNTS RECEIVABLE",
    appliedInvoices: [{ invoiceNo: "SI-2026-0005", date: "2026-06-04", applied: 2105.45 }],
  },
  {
    receiptNo: "RV-2026-0006",
    customerCode: "300-C006",
    companyName: "Apex Office Systems",
    date: "2026-06-04",
    description: "Receipt against office systems implementation invoice",
    amount: 498,
    receiptMethod: "MYR CASH",
    receivedBy: "M PETTY CASH",
    appliedInvoices: [{ invoiceNo: "SI-2026-0006", date: "2026-06-03", applied: 498 }],
  },
  {
    receiptNo: "RV-2026-0007",
    customerCode: "300-C007",
    companyName: "Summit Maintenance",
    date: "2026-06-03",
    description: "Advance receipt for recurring site maintenance work",
    amount: 1780.2,
    receiptMethod: "MYR BANK TRANSFER",
    receivedBy: "A COUNTS RECEIVABLE",
    appliedInvoices: [{ invoiceNo: "SI-2026-0007", date: "2026-06-02", applied: 1780.2 }],
  },
  {
    receiptNo: "RV-2026-0008",
    customerCode: "300-C008",
    companyName: "Evermark Services",
    date: "2026-06-01",
    description: "Received balance payment for service renewal invoice",
    amount: 925,
    receiptMethod: "MYR CHEQUE",
    receivedBy: "A COUNTS RECEIVABLE",
    appliedInvoices: [{ invoiceNo: "SI-2026-0008", date: "2026-06-01", applied: 925 }],
  },
];

type CompanyMeta = { color: string; Icon: React.ElementType };

const companyMetaMap: Record<string, CompanyMeta> = {
  "Vertex Retail Sdn Bhd": { color: "#dd5b00", Icon: Box },
  "BluePeak Foods": { color: "#2563eb", Icon: FileText },
  "Northstar Cafe Group": { color: "#7c3aed", Icon: Truck },
  "Brightline Studio": { color: "#1aae39", Icon: Zap },
  "Greenfield Packaging": { color: "#2a9d99", Icon: Package },
  "Apex Office Systems": { color: "#c026d3", Icon: Monitor },
  "Summit Maintenance": { color: "#b45309", Icon: Wrench },
  "Evermark Services": { color: "#92400e", Icon: Megaphone },
};

function resolveCompanyMeta(companyName: string): CompanyMeta {
  return companyMetaMap[companyName] ?? { color: "#615d59", Icon: Store };
}

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

function getSortValue(receipt: ARPayment, key: SortKey) {
  if (key === "date") {
    return new Date(`${receipt.date}T00:00:00`).getTime();
  }

  if (key === "amount") {
    return receipt.amount;
  }

  return receipt[key].toLowerCase();
}

function CompanyCell({ companyName }: Readonly<{ companyName: string }>) {
  const { color, Icon } = resolveCompanyMeta(companyName);

  return (
    <span className="inline-flex max-w-full items-center gap-2">
      <Icon
        size={16}
        strokeWidth={1.9}
        aria-hidden="true"
        className="shrink-0"
        style={{ color }}
      />
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
      className="inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-[5px] px-2 text-[13px] font-medium leading-5 max-xl:px-1.5 max-xl:text-[12px]"
      style={{ background: bg, color: text }}
    >
      <CalendarDays
        size={14}
        strokeWidth={1.8}
        aria-hidden="true"
        className="shrink-0 max-xl:hidden"
        style={{ color: icon }}
      />
      {formattedDate}
    </span>
  );
}

function AmountPill({ amount }: Readonly<{ amount: number }>) {
  const amountStyle =
    amount >= 3000
      ? "bg-[#fdecec] text-[#a84422]"
      : amount >= 1000
        ? "bg-[#fff4db] text-[#8a5a00]"
        : "bg-[#f1f0ee] text-[#5f5e59]";

  return (
    <span
      className={`inline-flex h-6 items-center whitespace-nowrap rounded-[6px] px-2 text-[14px] font-medium leading-5 tabular-nums max-xl:px-1.5 max-xl:text-[12px] ${amountStyle}`}
    >
      {formatCurrency(amount)}
    </span>
  );
}

function ViewARPaymentDrawer({
  receipt,
  onClose,
}: Readonly<{
  receipt: ARPayment;
  onClose: () => void;
}>) {
  const shouldReduceMotion = useReducedMotion();
  const { color: companyColor, Icon: CompanyIcon } = resolveCompanyMeta(
    receipt.companyName,
  );

  const formattedDate = formatDate(receipt.date);
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
        style={{
          transformOrigin: "right center",
          willChange: "transform, opacity, filter",
        }}
      >
        <div className="flex items-center justify-between gap-4 px-7 pt-6 pb-1">
          <h2 className="truncate text-[20px] font-semibold leading-7 tracking-[-0.125px] text-[#2c2c2b]">
            {receipt.receiptNo}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-7 shrink-0 items-center justify-center rounded-[7px] text-[#a39e98] outline-none transition-colors duration-75 hover:bg-[#f6f5f4] hover:text-[#5f5e59]"
          >
            <X size={15} strokeWidth={1.8} />
          </button>
        </div>

        <div className="px-7 pt-4 pb-5">
          <div className="flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-[10px] bg-[#f6f5f4]">
              <CompanyIcon
                size={22}
                strokeWidth={1.75}
                aria-hidden="true"
                style={{ color: companyColor }}
              />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[16px] font-semibold leading-6 text-[#2c2c2b]">
                {receipt.companyName}
              </p>
              <p className="mt-0.5 text-[13px] leading-5 text-[#a39e98]">
                {receipt.customerCode}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-[#e6e6e6] px-7 py-4">
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
            {formattedDate}
          </span>
          <span className="inline-flex h-7 items-center gap-1.5 rounded-[6px] bg-[#f6f5f4] px-2.5 text-[13px] font-medium text-[#5f5e59]">
            <CreditCard
              size={12}
              strokeWidth={2}
              aria-hidden="true"
              className="shrink-0 text-[#a39e98]"
            />
            {receipt.receiptMethod}
          </span>
          <span className="inline-flex h-7 items-center gap-1.5 rounded-[6px] bg-[#f6f5f4] px-2.5 text-[13px] font-medium text-[#5f5e59]">
            <UserRound
              size={12}
              strokeWidth={2}
              aria-hidden="true"
              className="shrink-0 text-[#a39e98]"
            />
            {receipt.receivedBy}
          </span>
        </div>

        <div className="border-t border-[#e6e6e6] px-7 py-5">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.4px] text-[#a39e98]">
            Description
          </p>
          <p className="text-[14px] leading-6 text-[#31302e]">
            {receipt.description}
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-auto border-t border-[#e6e6e6]">
          <div className="px-7 pt-4 pb-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.4px] text-[#a39e98]">
              Applied invoices
            </p>
          </div>
          <table className="w-full border-separate border-spacing-0 text-left">
            <thead>
              <tr>
                {(
                  [
                    { col: "Invoice No", align: "left" },
                    { col: "Date", align: "left" },
                    { col: "Applied", align: "right" },
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
              {receipt.appliedInvoices.map((invoice) => (
                <tr
                  key={invoice.invoiceNo}
                  className="transition-colors duration-75 hover:bg-[#f7f7f8]"
                >
                  <td className="border-b border-[#f0efed] py-3 pl-7 pr-3">
                    <span className="text-[14px] font-medium leading-5 text-[#2c2c2b]">
                      {invoice.invoiceNo}
                    </span>
                  </td>
                  <td className="border-b border-[#f0efed] px-3 py-3 text-[13px] text-[#5f5e59]">
                    {formatDate(invoice.date)}
                  </td>
                  <td className="border-b border-[#f0efed] py-3 pl-3 pr-7 text-right text-[14px] font-medium tabular-nums text-[#31302e]">
                    {formatCurrency(invoice.applied)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-[#e6e6e6] px-7 py-5">
          <div className="flex items-baseline gap-3">
            <span className="w-[96px] text-[11px] font-semibold uppercase tracking-[0.4px] text-[#a39e98]">
              Amount
            </span>
            <span className="text-[15px] font-semibold tabular-nums text-[#2c2c2b]">
              {formatCurrency(receipt.amount)}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function ARPaymentPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [viewingReceipt, setViewingReceipt] = useState<ARPayment | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const sortMenuRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const activeSortOption =
    sortOptions.find((option) => option.key === sortKey) ?? sortOptions[0];

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!sortMenuRef.current?.contains(event.target as Node)) {
        setIsSortMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () =>
      document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  function setSortColumn(nextSortKey: SortKey) {
    if (nextSortKey === sortKey) {
      setSortDirection((currentDirection) =>
        currentDirection === "asc" ? "desc" : "asc",
      );
      return;
    }

    setSortKey(nextSortKey);
    setSortDirection(nextSortKey === "date" ? "desc" : "asc");
  }

  const filteredReceipts = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    return receipts.filter((receipt) => {
      if (!normalizedSearch) {
        return true;
      }

      return [receipt.receiptNo, receipt.companyName, receipt.description].some(
        (value) => value.toLowerCase().includes(normalizedSearch),
      );
    });
  }, [searchValue]);

  const sortedReceipts = useMemo(() => {
    return [...filteredReceipts].sort((a, b) => {
      const firstValue = getSortValue(a, sortKey);
      const secondValue = getSortValue(b, sortKey);

      if (typeof firstValue === "number" && typeof secondValue === "number") {
        return sortDirection === "asc"
          ? firstValue - secondValue
          : secondValue - firstValue;
      }

      return sortDirection === "asc"
        ? String(firstValue).localeCompare(String(secondValue))
        : String(secondValue).localeCompare(String(firstValue));
    });
  }, [filteredReceipts, sortDirection, sortKey]);

  return (
    <div className="dashboard-shell min-h-screen bg-white md:flex">
      <DashboardSidebar
        activeItem="arpayment"
        isMobileOpen={isSidebarOpen}
        onMobileClose={() => setIsSidebarOpen(false)}
      />

      <main
        className="min-h-[calc(100vh-64px)] min-w-0 flex-1 bg-white text-[#2c2c2b] md:min-h-screen"
        style={{
          fontFamily:
            'var(--font-inter), "Inter Variable", Inter, sans-serif',
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
                className="flex size-7 shrink-0 items-center justify-center rounded-[7px] text-[#6f6a64] outline-none transition-colors duration-75 hover:bg-[#ededee] hover:text-[#2c2c2b] xl:hidden"
              >
                <Menu size={18} strokeWidth={1.8} aria-hidden="true" />
              </button>
              <h1 className="truncate text-[20px] font-semibold leading-7 tracking-[-0.125px] text-[#2c2c2b]">
                AR Payment
              </h1>
              <div className="group relative flex shrink-0 items-center">
                <button
                  type="button"
                  aria-label="About AR Payment"
                  className="flex items-center justify-center text-[#c9c4bf] outline-none transition-colors duration-75 hover:text-[#8f8983]"
                >
                  <Info size={15} strokeWidth={1.7} aria-hidden="true" />
                </button>
                <div className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 w-max max-w-[220px] -translate-x-1/2 rounded-[8px] bg-[#2c2c2b] px-3 py-2 text-[12px] leading-[1.45] text-white opacity-0 shadow-[0_4px_16px_rgba(15,15,15,0.18)] transition-opacity duration-150 group-hover:opacity-100">
                  Review AR receipts and customer payment records.
                  <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-[#2c2c2b]" />
                </div>
              </div>
            </div>
          </header>

          <div className="flex h-[var(--dashboard-toolbar-h)] items-center justify-end gap-3 px-[var(--dashboard-main-x)]">
            <button
              type="button"
              className="inline-flex h-7 items-center gap-1.5 rounded-[7px] bg-[#2783DE] px-2.5 text-[13px] font-medium leading-5 text-white shadow-[0_1px_1px_rgba(39,131,222,0.16)] outline-none transition-colors duration-75 hover:bg-[#1f76c9] focus-visible:ring-2 focus-visible:ring-[#2783DE]/20"
            >
              <Plus size={13} strokeWidth={1.9} aria-hidden="true" />
              Create receipt
            </button>
          </div>
          <div className="mx-[var(--dashboard-main-x)] border-b border-[#e6e6e6]" />

          <div className="flex h-[var(--dashboard-toolbar-h)] items-center gap-2 px-[var(--dashboard-main-x)]">
            <label className="relative w-[var(--dashboard-toolbar-search-w)] max-w-[42vw] shrink">
              <span className="sr-only">Search receipts</span>
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
                placeholder="Search receipts..."
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
          </div>
          <div className="mx-[var(--dashboard-main-x)] border-b border-[#e6e6e6]" />

          <div className="min-h-0 flex-1 overflow-auto px-[var(--dashboard-main-x)]">
            <table className="w-full min-w-[var(--arpayment-table-min-w)] table-fixed border-separate border-spacing-0 text-left">
              <thead className="sticky top-0 z-10 bg-white">
                <tr>
                  {[
                    {
                      label: "Receipt No",
                      icon: Hash,
                      width: "w-[var(--arpayment-col-number)]",
                      key: "receiptNo",
                    },
                    {
                      label: "Company",
                      icon: Store,
                      width: "w-[var(--arpayment-col-company)]",
                      key: "companyName",
                    },
                    {
                      label: "Date",
                      icon: CalendarDays,
                      width: "w-[var(--arpayment-col-date)]",
                      key: "date",
                    },
                    {
                      label: "Description",
                      icon: FileText,
                      width: "w-[var(--arpayment-col-description)]",
                      key: "description",
                    },
                    {
                      label: "Amount",
                      icon: Sparkles,
                      width: "w-[var(--arpayment-col-amount)]",
                      key: "amount",
                    },
                    {
                      label: "Action",
                      icon: Ellipsis,
                      width: "w-[var(--arpayment-col-action)]",
                      key: undefined,
                    },
                  ].map((column, columnIndex, columns) => {
                    const Icon = column.icon;
                    const isLastColumn = columnIndex === columns.length - 1;
                    const isAmountColumn = column.label === "Amount";
                    const isActionColumn = column.label === "Action";
                    const isSortable = Boolean(column.key);
                    const isActiveSort = column.key === sortKey;
                    const isAscendingSort =
                      isActiveSort && sortDirection === "asc";
                    const sortColumnKey = column.key as SortKey | undefined;
                    const columnPadding =
                      columnIndex === 0
                        ? "pl-6 pr-3"
                        : isLastColumn
                          ? "pl-3 pr-6"
                          : "px-3";

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
                          isAmountColumn || isActionColumn ? "text-right" : ""
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
                                isAmountColumn
                                  ? "justify-end"
                                  : "justify-start"
                              }`}
                            >
                              <Icon
                                size={14}
                                strokeWidth={1.75}
                                aria-hidden="true"
                                className="shrink-0 text-[#2c2c2b]"
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
                            {column.label === "Company" ? (
                              <span className="inline-flex items-center rounded-[5px] bg-[#eff6ff] px-1.5 py-0.5 text-[12px] font-semibold leading-4 tracking-[0.2px] text-[#0075de]">
                                AI
                              </span>
                            ) : null}
                          </div>
                        ) : (
                          <span
                            className={`flex items-center gap-1.5 ${
                              isActionColumn ? "justify-end" : ""
                            }`}
                          >
                            <Icon
                              size={14}
                              strokeWidth={1.75}
                              aria-hidden="true"
                              className="shrink-0 text-[#2c2c2b]"
                            />
                            <span className="truncate">{column.label}</span>
                          </span>
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {sortedReceipts.map((receipt, index) => (
                  <motion.tr
                    key={receipt.receiptNo}
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
                      {receipt.receiptNo}
                    </td>
                    <td className="border-b border-r border-[#f0efed] px-3">
                      <CompanyCell companyName={receipt.companyName} />
                    </td>
                    <td className="border-b border-r border-[#f0efed] px-3">
                      <DateCell date={receipt.date} />
                    </td>
                    <td className="border-b border-r border-[#f0efed] px-3">
                      <span className="block truncate text-[14px] font-medium leading-5 text-[#5f5e59]">
                        {receipt.description}
                      </span>
                    </td>
                    <td className="border-b border-r border-[#f0efed] px-3 text-right">
                      <AmountPill amount={receipt.amount} />
                    </td>
                    <td className="border-b border-[#f0efed] pl-3 pr-6 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          aria-label={`View ${receipt.receiptNo}`}
                          onClick={() => setViewingReceipt(receipt)}
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
        {viewingReceipt ? (
          <ViewARPaymentDrawer
            key={viewingReceipt.receiptNo}
            receipt={viewingReceipt}
            onClose={() => setViewingReceipt(null)}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
