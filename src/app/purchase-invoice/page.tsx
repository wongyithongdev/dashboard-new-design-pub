"use client";

import { DashboardSidebar } from "@/components/sidebar";
import {
  Building2,
  CalendarDays,
  Check,
  Circle,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Ellipsis,
  Files,
  Filter,
  ListFilter,
  Plus,
  ReceiptText,
  Search,
  Sparkles,
  UserRound,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const purchaseInvoices = [
  {
    invoiceNo: "PI-2026-0001",
    supplierInvoiceNo: "SUP-INV-8291",
    supplier: "OfficePro Supplies",
    date: "08 Jun 2026",
    agent: "Wong Yi Thong",
    paymentStatus: "Unpaid",
    amount: "RM 1,240.00",
  },
  {
    invoiceNo: "PI-2026-0002",
    supplierInvoiceNo: "MP-2401-77",
    supplier: "Metro Paper Trading",
    date: "07 Jun 2026",
    agent: "Amelia Tan",
    paymentStatus: "Partial",
    amount: "RM 856.30",
  },
  {
    invoiceNo: "PI-2026-0003",
    supplierInvoiceNo: "NSL-00984",
    supplier: "Northstar Logistics",
    date: "06 Jun 2026",
    agent: "Daniel Lim",
    paymentStatus: "Paid",
    amount: "RM 3,420.00",
  },
  {
    invoiceNo: "PI-2026-0004",
    supplierInvoiceNo: "BH-2026-511",
    supplier: "Brightline Hardware",
    date: "05 Jun 2026",
    agent: "Rachel Koh",
    paymentStatus: "Overdue",
    amount: "RM 612.90",
  },
  {
    invoiceNo: "PI-2026-0005",
    supplierInvoiceNo: "GPK-66120",
    supplier: "Greenfield Packaging",
    date: "04 Jun 2026",
    agent: "Marcus Lee",
    paymentStatus: "Unpaid",
    amount: "RM 2,105.45",
  },
  {
    invoiceNo: "PI-2026-0006",
    supplierInvoiceNo: "AOS-1044",
    supplier: "Apex Office Systems",
    date: "03 Jun 2026",
    agent: "Wong Yi Thong",
    paymentStatus: "Paid",
    amount: "RM 498.00",
  },
  {
    invoiceNo: "PI-2026-0007",
    supplierInvoiceNo: "SUM-2880",
    supplier: "Summit Maintenance",
    date: "02 Jun 2026",
    agent: "Amelia Tan",
    paymentStatus: "Partial",
    amount: "RM 1,780.20",
  },
  {
    invoiceNo: "PI-2026-0008",
    supplierInvoiceNo: "ES-77214",
    supplier: "Evermark Services",
    date: "01 Jun 2026",
    agent: "Daniel Lim",
    paymentStatus: "Unpaid",
    amount: "RM 925.00",
  },
];

const actionItems = ["View", "Edit", "Download PDF", "Delete"] as const;
const sortOptions = [
  { key: "date", label: "Date", helper: "Newest first" },
  { key: "amount", label: "Amount", helper: "Highest first" },
  { key: "supplier", label: "Supplier", helper: "A to Z" },
  {
    key: "supplierInvoiceNo",
    label: "Supplier Invoice No",
    helper: "A to Z",
  },
  { key: "invoiceNo", label: "Invoice No", helper: "Latest invoice first" },
  { key: "agent", label: "Agent", helper: "A to Z" },
  { key: "paymentStatus", label: "Payment Status", helper: "Attention first" },
] as const;

type PurchaseInvoice = (typeof purchaseInvoices)[number];
type SortKey = (typeof sortOptions)[number]["key"];
type SortDirection = "asc" | "desc";
type StatusFilter = "all" | PurchaseInvoice["paymentStatus"];

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
  supplierInvoiceNo: "asc",
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

function InvoiceCheckbox({
  checked,
  label,
  onToggle,
}: Readonly<{
  checked: boolean;
  label: string;
  onToggle: () => void;
}>) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onToggle}
      className={`flex size-4 items-center justify-center rounded-[5px] border outline-none transition-colors duration-75 ${
        checked
          ? "border-[#0075de] bg-[#0075de] text-white shadow-[0_1px_1px_rgba(0,117,222,0.18)]"
          : "border-[#d8d6d2] bg-white text-transparent hover:border-[#b9b5ae] hover:bg-[#fbfbfa]"
      } focus-visible:ring-2 focus-visible:ring-[#62aef0]/20`}
    >
      <Check size={11} strokeWidth={2.4} aria-hidden="true" />
    </button>
  );
}

function AgentPill({ name }: Readonly<{ name: string }>) {
  const initial = name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const agentStyle =
    {
      "Wong Yi Thong": {
        avatar: "bg-[#dbeafe] text-[#1d4ed8]",
      },
      "Amelia Tan": {
        avatar: "bg-[#fce7f3] text-[#be185d]",
      },
      "Daniel Lim": {
        avatar: "bg-[#dcfce7] text-[#15803d]",
      },
      "Rachel Koh": {
        avatar: "bg-[#fef3c7] text-[#b45309]",
      },
      "Marcus Lee": {
        avatar: "bg-[#ede9fe] text-[#6d28d9]",
      },
    }[name] ?? {
      avatar: "bg-[#e0f2fe] text-[#0369a1]",
    };

  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-[6px] bg-[#f1f0ee] px-1.5 py-0.5 text-[13px] font-medium leading-5 text-[#5f5e59]">
      <span
        className={`flex size-4 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold ${agentStyle.avatar}`}
      >
        {initial}
      </span>
      <span className="truncate font-semibold text-[#5f5e59]">{name}</span>
    </span>
  );
}

function PaymentStatusPill({ status }: Readonly<{ status: string }>) {
  const statusStyle =
    {
      Paid: "bg-[#e9f7ef] text-[#1f7a4d]",
      Partial: "bg-[#fff4db] text-[#9a6700]",
      Overdue: "bg-[#fdecec] text-[#c2410c]",
      Unpaid: "bg-[#f1f0ee] text-[#5f5e59]",
    }[status] ?? "bg-[#f1f0ee] text-[#5f5e59]";

  return (
    <span
      className={`inline-flex h-6 items-center rounded-[6px] px-2 text-[12px] font-medium leading-5 ${statusStyle}`}
    >
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
      className={`inline-flex h-6 items-center rounded-[6px] px-2 text-[13px] font-medium leading-5 tabular-nums ${amountStyle}`}
    >
      {amount}
    </span>
  );
}

export default function PurchaseInvoicePage() {
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const actionMenuRef = useRef<HTMLDivElement>(null);
  const sortMenuRef = useRef<HTMLDivElement>(null);
  const statusMenuRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const hasSelection = selectedInvoiceIds.length > 0;
  const allSelected = selectedInvoiceIds.length === purchaseInvoices.length;
  const currentSortOption = sortOptions.find((option) => option.key === sortKey);
  const currentStatusOption = statusOptions.find(
    (option) => option.key === statusFilter,
  );
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

  function toggleInvoiceSelection(invoiceNo: string) {
    setSelectedInvoiceIds((currentIds) =>
      currentIds.includes(invoiceNo)
        ? currentIds.filter((currentId) => currentId !== invoiceNo)
        : [...currentIds, invoiceNo],
    );
  }

  function toggleAllInvoices() {
    setSelectedInvoiceIds((currentIds) =>
      currentIds.length === purchaseInvoices.length
        ? []
        : purchaseInvoices.map((invoice) => invoice.invoiceNo),
    );
  }

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;

      if (!actionMenuRef.current?.contains(target)) {
        setOpenActionId(null);
      }

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

  return (
    <div className="min-h-screen bg-white md:flex">
      <DashboardSidebar activeItem="purchase-invoice" />

      <main className="min-h-[calc(100vh-64px)] min-w-0 flex-1 bg-white text-[#2c2c2b] md:min-h-screen">
        <motion.section
          animate={{ opacity: 1, y: 0 }}
          className="flex min-h-screen flex-col"
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 4 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.2,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <header className="flex h-12 items-center justify-between border-b border-[#e6e6e6] px-5">
            <div className="flex min-w-0 items-center">
              <h1 className="truncate text-[18px] font-semibold leading-6 text-[#2c2c2b]">
                Purchase invoice
              </h1>
            </div>

            <div aria-hidden="true" />
          </header>

          <div className="flex h-11 items-center justify-end gap-2 border-b border-[#e6e6e6] px-5">
            {hasSelection ? (
              <button
                type="button"
                className="inline-flex h-7 items-center rounded-[7px] border border-[#e6e6e6] bg-white px-2.5 text-[13px] font-medium leading-5 text-[#0075de] shadow-[0_1px_1px_rgba(15,15,15,0.02)] outline-none transition-colors duration-75 hover:bg-[#f7f7f8] focus-visible:ring-1 focus-visible:ring-black/5"
              >
                Pay
              </button>
            ) : null}
            <button
              type="button"
              className="inline-flex h-7 items-center gap-1.5 rounded-[7px] bg-[#2783DE] px-2.5 text-[13px] font-medium leading-5 text-white shadow-[0_1px_1px_rgba(39,131,222,0.16)] outline-none transition-colors duration-75 hover:bg-[#1f76c9] focus-visible:ring-2 focus-visible:ring-[#2783DE]/20"
            >
              <Plus size={13} strokeWidth={1.9} aria-hidden="true" />
              Create invoice
            </button>
          </div>

          <div className="flex h-11 items-center gap-2 border-b border-[#e6e6e6] px-5">
            <label className="relative w-[230px] shrink-0">
              <span className="sr-only">Search invoices</span>
              <Search
                size={14}
                strokeWidth={1.8}
                aria-hidden="true"
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8f8983]"
              />
              <input
                type="search"
                placeholder="Search invoices..."
                className="h-7 w-full rounded-[7px] border border-[#e6e6e6] bg-white pl-8 pr-2 text-[13px] leading-5 text-[#2c2c2b] outline-none transition-colors duration-75 placeholder:text-[#a39e98] focus:border-[#0075de] focus:ring-2 focus:ring-[#62aef0]/20"
              />
            </label>
            <div ref={sortMenuRef} className="relative">
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={isSortMenuOpen}
                onClick={() => setIsSortMenuOpen((isOpen) => !isOpen)}
                      className="inline-flex h-7 items-center gap-1.5 rounded-[7px] border border-[#e6e6e6] bg-white px-2 text-[13px] font-medium leading-5 text-[#5f5e59] outline-none transition-colors duration-75 hover:bg-[#f7f7f8] hover:text-[#2c2c2b] focus-visible:ring-1 focus-visible:ring-black/5"
                    >
                      <ListFilter size={13} strokeWidth={1.8} aria-hidden="true" />
                      Sort with {currentSortOption?.label}
                    </button>

              <AnimatePresence>
                {isSortMenuOpen ? (
                  <motion.div
                    role="menu"
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="absolute left-0 top-8 z-20 w-[208px] origin-top-left rounded-[10px] border border-[#e6e6e6] bg-white p-1 shadow-[0_12px_28px_rgba(15,15,15,0.11)]"
                    exit={{
                      opacity: 0,
                      y: shouldReduceMotion ? 0 : -3,
                      scale: shouldReduceMotion ? 1 : 0.98,
                    }}
                    initial={{
                      opacity: 0,
                      y: shouldReduceMotion ? 0 : -3,
                      scale: shouldReduceMotion ? 1 : 0.98,
                    }}
                    transition={{
                      duration: shouldReduceMotion ? 0 : 0.18,
                      ease: [0.22, 1, 0.36, 1],
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
            <div ref={statusMenuRef} className="relative">
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={isStatusMenuOpen}
                onClick={() => setIsStatusMenuOpen((isOpen) => !isOpen)}
                className="inline-flex h-7 items-center gap-1.5 rounded-[7px] border border-[#e6e6e6] bg-white px-2 text-[13px] font-medium leading-5 text-[#5f5e59] outline-none transition-colors duration-75 hover:bg-[#f7f7f8] hover:text-[#2c2c2b] focus-visible:ring-1 focus-visible:ring-black/5"
              >
                <Filter size={13} strokeWidth={1.8} aria-hidden="true" />
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
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="absolute left-0 top-8 z-20 w-[196px] origin-top-left rounded-[10px] border border-[#e6e6e6] bg-white p-1 shadow-[0_12px_28px_rgba(15,15,15,0.11)]"
                    exit={{
                      opacity: 0,
                      y: shouldReduceMotion ? 0 : -3,
                      scale: shouldReduceMotion ? 1 : 0.98,
                    }}
                    initial={{
                      opacity: 0,
                      y: shouldReduceMotion ? 0 : -3,
                      scale: shouldReduceMotion ? 1 : 0.98,
                    }}
                    transition={{
                      duration: shouldReduceMotion ? 0 : 0.18,
                      ease: [0.22, 1, 0.36, 1],
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
                          <span className="min-w-0">
                            <span className="block truncate text-[13px] font-medium leading-5 text-[#2c2c2b]">
                              {option.label}
                            </span>
                            <span className="block truncate text-[11px] font-medium leading-4 text-[#8f8983]">
                              {option.helper}
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
            <button
              type="button"
              aria-label="Add filter"
              className="flex size-7 items-center justify-center rounded-[7px] border border-dashed border-[#dedbd7] text-[#8f8983] outline-none transition-colors duration-75 hover:bg-[#f7f7f8] hover:text-[#2c2c2b] focus-visible:ring-1 focus-visible:ring-black/5"
            >
              <Plus size={14} strokeWidth={1.8} aria-hidden="true" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-auto">
            <table className="w-full min-w-[1180px] border-separate border-spacing-0 text-left">
              <thead className="sticky top-0 z-10 bg-[#fbfbfa]">
                <tr>
                  <th className="h-9 w-10 border-b border-r border-[#e6e6e6] px-3">
                    <InvoiceCheckbox
                      label="Select all invoices"
                      checked={allSelected}
                      onToggle={toggleAllInvoices}
                    />
                  </th>
                  {[
                    {
                      label: "Invoice No",
                      icon: ReceiptText,
                      width: "w-[170px]",
                      key: "invoiceNo",
                    },
                    {
                      label: "Supplier Invoice No",
                      icon: Files,
                      width: "w-[210px]",
                      key: "supplierInvoiceNo",
                    },
                    {
                      label: "Supplier",
                      icon: Building2,
                      width: "w-[240px]",
                      key: "supplier",
                    },
                    {
                      label: "Date",
                      icon: CalendarDays,
                      width: "w-[150px]",
                      key: "date",
                    },
                    {
                      label: "Agent",
                      icon: UserRound,
                      width: "w-[180px]",
                      key: "agent",
                    },
                    {
                      label: "Payment Status",
                      icon: Circle,
                      width: "w-[160px]",
                      key: "paymentStatus",
                    },
                    {
                      label: "Amount",
                      icon: Sparkles,
                      width: "w-[170px]",
                      key: "amount",
                    },
                    { label: "Action", icon: Ellipsis, width: "w-[120px]" },
                  ].map((column) => {
                    const Icon = column.icon;
                    const isAmount = column.label === "Amount";
                    const isAction = column.label === "Action";
                    const isSortable = Boolean(column.key);
                    const isActiveSort = column.key === sortKey;
                    const isAscendingSort = isActiveSort && sortDirection === "asc";
                    const sortColumnKey = column.key as SortKey | undefined;

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
                        className={`${column.width} h-9 border-b border-r border-[#e6e6e6] px-3 text-[12px] font-medium leading-5 text-[#5f5e59] ${
                          isAmount || isAction ? "text-right" : ""
                        }`}
                      >
                        {isSortable ? (
                          <button
                            type="button"
                            aria-label={`Sort by ${column.label}`}
                            onClick={() => {
                              if (sortColumnKey) {
                                setSortColumn(sortColumnKey);
                              }
                            }}
                            className={`flex w-full items-center gap-1.5 outline-none transition-colors duration-75 hover:text-[#2c2c2b] focus-visible:text-[#2c2c2b] ${
                              isAmount ? "justify-end" : "justify-start"
                            }`}
                          >
                            <Icon
                              size={13}
                              strokeWidth={1.75}
                              aria-hidden="true"
                              className={`${
                                isActiveSort ? "text-[#2c2c2b]" : "text-[#8f8983]"
                              }`}
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
                                className="shrink-0 text-[#c3bfb8]"
                              />
                            )}
                          </button>
                        ) : (
                          <span
                            className={`flex items-center gap-1.5 ${
                              isAmount || isAction ? "justify-end" : ""
                            }`}
                          >
                            <Icon
                              size={13}
                              strokeWidth={1.75}
                              aria-hidden="true"
                              className="text-[#8f8983]"
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
                  const isMenuOpen = openActionId === invoice.invoiceNo;
                  const isSelected = selectedInvoiceIds.includes(
                    invoice.invoiceNo,
                  );

                  return (
                    <motion.tr
                      key={invoice.invoiceNo}
                      animate={{ opacity: 1 }}
                      className="group h-9 bg-white transition-colors duration-75 hover:bg-[#f7f7f8]"
                      initial={{ opacity: 0 }}
                      transition={{
                        delay: shouldReduceMotion ? 0 : index * 0.018,
                        duration: shouldReduceMotion ? 0 : 0.14,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <td className="border-b border-r border-[#f0efed] px-3">
                        <InvoiceCheckbox
                          label={`Select ${invoice.invoiceNo}`}
                          checked={isSelected}
                          onToggle={() => toggleInvoiceSelection(invoice.invoiceNo)}
                        />
                      </td>
                      <td className="border-b border-r border-[#f0efed] px-3 text-[13px] font-medium leading-5 text-[#2c2c2b]">
                        {invoice.invoiceNo}
                      </td>
                      <td className="border-b border-r border-[#f0efed] px-3 text-[13px] font-normal leading-5 text-[#5f5e59]">
                        {invoice.supplierInvoiceNo}
                      </td>
                      <td className="border-b border-r border-[#f0efed] px-3 text-[13px] font-normal leading-5 text-[#2c2c2b]">
                        <span className="truncate">{invoice.supplier}</span>
                      </td>
                      <td className="border-b border-r border-[#f0efed] px-3 text-[13px] font-normal leading-5 text-[#5f5e59]">
                        {invoice.date}
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
                      <td className="relative border-b border-r border-[#f0efed] px-3 text-right">
                        <div
                          ref={isMenuOpen ? actionMenuRef : null}
                          className="relative inline-flex items-center gap-1"
                        >
                          <button
                            type="button"
                            className="inline-flex h-7 items-center rounded-[7px] px-2 text-[13px] font-medium leading-5 text-[#0075de] outline-none transition-colors duration-75 hover:bg-[#f7f7f8] focus-visible:bg-[#f7f7f8] focus-visible:ring-1 focus-visible:ring-black/5"
                          >
                            Pay
                          </button>
                          <button
                            type="button"
                            aria-haspopup="menu"
                            aria-expanded={isMenuOpen}
                            aria-label={`Open actions for ${invoice.invoiceNo}`}
                            onClick={() =>
                              setOpenActionId((currentId) =>
                                currentId === invoice.invoiceNo
                                  ? null
                                  : invoice.invoiceNo,
                              )
                            }
                            className="inline-flex size-7 items-center justify-center rounded-[7px] text-[#8f8983] outline-none transition-colors duration-75 hover:bg-[#ededee] hover:text-[#2c2c2b] focus-visible:bg-[#ededee] focus-visible:ring-1 focus-visible:ring-black/5"
                          >
                            <Ellipsis
                              size={15}
                              strokeWidth={1.9}
                              aria-hidden="true"
                            />
                          </button>

                          <AnimatePresence>
                            {isMenuOpen ? (
                              <motion.div
                                role="menu"
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className="absolute right-0 top-8 z-20 w-[148px] origin-top-right rounded-[10px] border border-[#e6e6e6] bg-white p-1 shadow-[0_12px_28px_rgba(15,15,15,0.11)]"
                                exit={{
                                  opacity: 0,
                                  y: shouldReduceMotion ? 0 : -3,
                                  scale: shouldReduceMotion ? 1 : 0.98,
                                }}
                                initial={{
                                  opacity: 0,
                                  y: shouldReduceMotion ? 0 : -3,
                                  scale: shouldReduceMotion ? 1 : 0.98,
                                }}
                                transition={{
                                  duration: shouldReduceMotion ? 0 : 0.18,
                                  ease: [0.22, 1, 0.36, 1],
                                }}
                              >
                                {actionItems.map((action) => (
                                  <button
                                    key={action}
                                    type="button"
                                    role="menuitem"
                                    className={`flex h-7 w-full items-center rounded-[7px] px-2 text-left text-[13px] font-medium leading-5 outline-none transition-colors duration-75 hover:bg-[#f6f5f4] focus-visible:bg-[#f6f5f4] ${
                                      action === "Delete"
                                        ? "text-[#d92d20]"
                                        : "text-[#5f5e59] hover:text-[#2c2c2b]"
                                    }`}
                                  >
                                    {action}
                                  </button>
                                ))}
                              </motion.div>
                            ) : null}
                          </AnimatePresence>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
