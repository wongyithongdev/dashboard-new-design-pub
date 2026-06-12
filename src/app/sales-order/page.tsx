"use client";

import { DashboardSidebar } from "@/components/sidebar";
import {
  ArrowUpDown,
  Box,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
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
  Zap,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import React, { useEffect, useMemo, useRef, useState } from "react";

type SalesOrder = {
  orderNo: string;
  customer: string;
  date: string;
  agent: string;
  amount: string;
};

type SortKey = "date" | "orderNo" | "customer" | "agent" | "amount";
type SortDirection = "asc" | "desc";
type ActiveTab = "orders" | "history";

const salesOrders: SalesOrder[] = [
  { orderNo: "SO-2026-0001", customer: "Vertex Retail Sdn Bhd", date: "09 Jun 2026", agent: "Wong Yi Thong", amount: "RM 1,640.00" },
  { orderNo: "SO-2026-0002", customer: "BluePeak Foods", date: "08 Jun 2026", agent: "Amelia Tan", amount: "RM 856.30" },
  { orderNo: "SO-2026-0003", customer: "Northstar Cafe Group", date: "07 Jun 2026", agent: "Daniel Lim", amount: "RM 3,420.00" },
  { orderNo: "SO-2026-0004", customer: "Brightline Studio", date: "06 Jun 2026", agent: "Rachel Koh", amount: "RM 612.90" },
  { orderNo: "SO-2026-0005", customer: "Greenfield Packaging", date: "05 Jun 2026", agent: "Marcus Lee", amount: "RM 2,105.45" },
  { orderNo: "SO-2026-0006", customer: "Apex Office Systems", date: "04 Jun 2026", agent: "Wong Yi Thong", amount: "RM 498.00" },
  { orderNo: "SO-2026-0007", customer: "Summit Maintenance", date: "03 Jun 2026", agent: "Amelia Tan", amount: "RM 1,780.20" },
  { orderNo: "SO-2026-0008", customer: "Evermark Services", date: "01 Jun 2026", agent: "Daniel Lim", amount: "RM 925.00" },
];

const salesOrderHistory = [
  { taskName: "Created sales order", date: "09 Jun 2026 10:24:18", customer: "Vertex Retail Sdn Bhd", status: "Completed" },
  { taskName: "Reviewed customer request", date: "09 Jun 2026 09:48:32", customer: "BluePeak Foods", status: "Completed" },
  { taskName: "Matched delivery schedule", date: "08 Jun 2026 04:16:09", customer: "Northstar Cafe Group", status: "Processing" },
  { taskName: "Checked stock allocation", date: "08 Jun 2026 02:39:51", customer: "Brightline Studio", status: "Pending" },
  { taskName: "Synced order details", date: "07 Jun 2026 11:02:44", customer: "Greenfield Packaging", status: "Completed" },
  { taskName: "Flagged pricing exception", date: "07 Jun 2026 09:15:27", customer: "Apex Office Systems", status: "Failed" },
] as const;

const sortOptions = [
  { key: "date", label: "Date", helper: "Newest first" },
  { key: "amount", label: "Amount", helper: "Highest first" },
  { key: "customer", label: "Customer", helper: "A to Z" },
  { key: "orderNo", label: "Order No", helper: "Latest order first" },
  { key: "agent", label: "Agent", helper: "A to Z" },
] as const;

const defaultSortDirections: Record<SortKey, SortDirection> = {
  date: "desc",
  amount: "desc",
  customer: "asc",
  orderNo: "desc",
  agent: "asc",
};

type HistoryStatus = (typeof salesOrderHistory)[number]["status"];

const companyMetaMap: Record<string, { color: string; Icon: React.ElementType }> = {
  "Vertex Retail Sdn Bhd": { color: "#dd5b00", Icon: Box },
  "BluePeak Foods": { color: "#2563eb", Icon: FileText },
  "Northstar Cafe Group": { color: "#7c3aed", Icon: Truck },
  "Brightline Studio": { color: "#1aae39", Icon: Zap },
  "Greenfield Packaging": { color: "#2a9d99", Icon: Package },
  "Apex Office Systems": { color: "#c026d3", Icon: Monitor },
  "Summit Maintenance": { color: "#b45309", Icon: Wrench },
  "Evermark Services": { color: "#92400e", Icon: Megaphone },
};

function parseAmount(amount: string) {
  return Number(amount.replace(/[^\d.]/g, ""));
}

function getSortValue(order: SalesOrder, sortKey: SortKey) {
  if (sortKey === "amount") {
    return parseAmount(order.amount);
  }

  if (sortKey === "date") {
    return new Date(order.date).getTime();
  }

  return order[sortKey];
}

function resolveCompanyMeta(customer: string) {
  return companyMetaMap[customer] ?? { color: "#615d59", Icon: Store };
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

function CompanyCell({ customer }: Readonly<{ customer: string }>) {
  const { color, Icon } = resolveCompanyMeta(customer);

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
        {customer}
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
      <CalendarDays
        size={14}
        strokeWidth={1.8}
        aria-hidden="true"
        className="shrink-0 max-xl:hidden"
        style={{ color: icon }}
      />
      {dateText}
      {timeText ? <span className="max-xl:hidden">{timeText}</span> : null}
    </span>
  );
}

function AmountPill({ amount }: Readonly<{ amount: string }>) {
  const value = parseAmount(amount);
  const amountStyle =
    value >= 3000
      ? "bg-[#fdecec] text-[#a84422]"
      : value >= 1000
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

function HistoryStatusPill({ status }: Readonly<{ status: HistoryStatus }>) {
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

function InvoiceTabButton({
  active,
  count,
  icon: Icon,
  label,
  onClick,
}: Readonly<{
  active: boolean;
  count: number;
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-7 items-center gap-1.5 rounded-[6px] px-2 text-[13px] font-medium leading-5 outline-none transition-colors duration-75 ${
        active
          ? "bg-white text-[#2c2c2b] shadow-[0_1px_2px_rgba(15,15,15,0.08)]"
          : "text-[#5f5e59] hover:bg-white/70 hover:text-[#2c2c2b]"
      }`}
    >
      <Icon size={13} strokeWidth={1.8} aria-hidden="true" />
      <span>{label}</span>
      <span className="text-[#a39e98]">{count}</span>
    </button>
  );
}

export default function SalesOrderPage() {
  const shouldReduceMotion = useReducedMotion();
  const [searchValue, setSearchValue] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("orders");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sortMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!sortMenuRef.current?.contains(event.target as Node)) {
        setIsSortMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const currentSortOption = sortOptions.find((option) => option.key === sortKey);

  const filteredOrders = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    const filtered = normalizedSearch
      ? salesOrders.filter((order) =>
          [order.orderNo, order.customer, order.agent, order.date].some((value) =>
            value.toLowerCase().includes(normalizedSearch),
          ),
        )
      : salesOrders;

    return [...filtered].sort((a, b) => {
      const aValue = getSortValue(a, sortKey);
      const bValue = getSortValue(b, sortKey);
      const comparison =
        typeof aValue === "number" && typeof bValue === "number"
          ? aValue - bValue
          : String(aValue).localeCompare(String(bValue));

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [searchValue, sortDirection, sortKey]);

  const filteredHistory = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    if (!normalizedSearch) {
      return salesOrderHistory;
    }

    return salesOrderHistory.filter((entry) =>
      [entry.taskName, entry.customer, entry.date, entry.status].some((value) =>
        value.toLowerCase().includes(normalizedSearch),
      ),
    );
  }, [searchValue]);

  function setSortColumn(nextSortKey: SortKey) {
    if (sortKey === nextSortKey) {
      setSortDirection((currentDirection) =>
        currentDirection === "asc" ? "desc" : "asc",
      );
      return;
    }

    setSortKey(nextSortKey);
    setSortDirection(defaultSortDirections[nextSortKey]);
  }

  return (
    <div className="dashboard-shell min-h-screen bg-white text-[#2c2c2b]">
      <div className="flex min-h-screen">
        <DashboardSidebar
          activeItem="sales-order"
          isMobileOpen={isSidebarOpen}
          onMobileClose={() => setIsSidebarOpen(false)}
        />

        <main className="min-w-0 flex-1 bg-white lg:pl-0">
          <section className="flex min-h-screen flex-col">
            <header className="flex h-[var(--dashboard-header-h)] items-center justify-between border-b border-[#e6e6e6] px-[var(--dashboard-main-x)]">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  aria-label="Open sidebar"
                  onClick={() => setIsSidebarOpen(true)}
                  className="flex size-7 shrink-0 items-center justify-center rounded-[7px] text-[#6f6a64] outline-none transition-colors duration-75 hover:bg-[#ededee] hover:text-[#2c2c2b] xl:hidden"
                >
                  <Menu size={16} strokeWidth={1.9} aria-hidden="true" />
                </button>
                <h1 className="truncate text-[18px] font-semibold leading-7 text-[#2c2c2b]">
                  Sales order
                </h1>
                <div className="group relative flex shrink-0 items-center">
                  <button
                    type="button"
                    aria-label="About Sales order"
                    className="flex items-center justify-center text-[#c9c4bf] outline-none transition-colors duration-75 hover:text-[#8f8983]"
                  >
                    <Info size={15} strokeWidth={1.7} aria-hidden="true" />
                  </button>
                  <div className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 w-max max-w-[220px] -translate-x-1/2 rounded-[8px] bg-[#2c2c2b] px-3 py-2 text-[12px] leading-[1.45] text-white opacity-0 shadow-[0_4px_16px_rgba(15,15,15,0.18)] transition-opacity duration-150 group-hover:opacity-100">
                    Track and manage all sales orders - review customer details, assigned agent, and order value.
                    <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-[#2c2c2b]" />
                  </div>
                </div>
              </div>
            </header>

            <div className="flex h-[var(--dashboard-toolbar-h)] items-center justify-between gap-3 px-[var(--dashboard-main-x)]">
              <div className="inline-flex items-center gap-1 rounded-[8px] bg-[#f6f5f4] p-1">
                <InvoiceTabButton
                  active={activeTab === "orders"}
                  count={salesOrders.length}
                  icon={FileText}
                  label="Orders"
                  onClick={() => setActiveTab("orders")}
                />
                <InvoiceTabButton
                  active={activeTab === "history"}
                  count={salesOrderHistory.length}
                  icon={Clock3}
                  label="History"
                  onClick={() => setActiveTab("history")}
                />
              </div>
              <button
                type="button"
                className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-[8px] bg-[#2783DE] px-3 text-[14px] font-medium leading-5 text-white shadow-[0_1px_1px_rgba(39,131,222,0.16)] outline-none transition-colors duration-100 hover:bg-[#1f76cc] focus-visible:ring-2 focus-visible:ring-[#62aef0]/35"
              >
                <Plus size={14} strokeWidth={1.9} aria-hidden="true" />
                Create order
              </button>
            </div>
            <div className="mx-[var(--dashboard-main-x)] border-b border-[#e6e6e6]" />

            <div className="flex h-[var(--dashboard-toolbar-h)] items-center gap-2 px-[var(--dashboard-main-x)]">
              <label className="relative w-[var(--dashboard-toolbar-search-w)] max-w-[42vw] shrink">
                <span className="sr-only">
                  {activeTab === "orders" ? "Search sales orders" : "Search sales order history"}
                </span>
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
                  placeholder={activeTab === "orders" ? "Search orders..." : "Search history..."}
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
              {activeTab === "orders" ? (
                <table className="w-full min-w-[var(--salesinvoice-table-min-w)] table-fixed border-separate border-spacing-0 text-left">
                  <thead className="sticky top-0 z-10 bg-white">
                    <tr>
                      {[
                        {
                          label: "Order No",
                          icon: Hash,
                          width: "w-[var(--salesinvoice-col-number)]",
                          key: "orderNo",
                        },
                        {
                          label: "Customer",
                          icon: Store,
                          width: "w-[var(--salesinvoice-col-customer)]",
                          key: "customer",
                        },
                        {
                          label: "Date",
                          icon: CalendarDays,
                          width: "w-[var(--salesinvoice-col-date)]",
                          key: "date",
                        },
                        {
                          label: "Agent",
                          icon: UserRound,
                          width: "w-[var(--salesinvoice-col-agent)]",
                          key: "agent",
                        },
                        {
                          label: "Amount",
                          icon: Sparkles,
                          width: "w-[var(--salesinvoice-col-amount)]",
                          key: "amount",
                        },
                        {
                          label: "Action",
                          icon: Ellipsis,
                          width: "w-[var(--salesinvoice-col-action)]",
                        },
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
                              {column.label === "Customer" && (
                                <span className="inline-flex items-center rounded-[5px] bg-[#eff6ff] px-1.5 py-0.5 text-[12px] font-semibold leading-4 tracking-[0.2px] text-[#0075de]">
                                  AI
                                </span>
                              )}
                              </div>
                            ) : (
                              <span className={`flex items-center gap-1.5 ${isAction ? "justify-end" : ""}`}>
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
                    {filteredOrders.map((order, index) => (
                      <motion.tr
                        key={order.orderNo}
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
                          <InvoiceNumberCell invoiceNo={order.orderNo} />
                        </td>
                        <td className="border-b border-r border-[#f0efed] px-3">
                          <CompanyCell customer={order.customer} />
                        </td>
                        <td className="border-b border-r border-[#f0efed] px-3">
                          <DateCell date={order.date} />
                        </td>
                        <td className="border-b border-r border-[#f0efed] px-3">
                          <AgentPill name={order.agent} />
                        </td>
                        <td className="border-b border-r border-[#f0efed] px-3 text-right">
                          <AmountPill amount={order.amount} />
                        </td>
                        <td className="border-b border-[#f0efed] pl-3 pr-6 text-right">
                          <div className="inline-flex items-center">
                            <button
                              type="button"
                              aria-label={`Open actions for ${order.orderNo}`}
                              className="inline-flex size-7 items-center justify-center rounded-[7px] text-[#8f8983] outline-none transition-colors duration-75 hover:bg-[#f7f7f8] hover:text-[#2c2c2b] focus-visible:bg-[#f7f7f8] focus-visible:text-[#2c2c2b] focus-visible:ring-1 focus-visible:ring-black/5"
                            >
                              <Ellipsis size={14} strokeWidth={1.9} aria-hidden="true" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="w-full min-w-[var(--history-table-min-w)] table-fixed border-separate border-spacing-0 text-left">
                  <thead className="sticky top-0 z-10 bg-white">
                    <tr>
                      {[
                        { label: "Taskname", icon: FileText, width: "w-[var(--history-col-task)]" },
                        { label: "Date", icon: Clock3, width: "w-[var(--history-col-date)]" },
                        { label: "Customer", icon: Store, width: "w-[var(--history-col-supplier)]" },
                        { label: "Status", icon: CheckCircle2, width: "w-[var(--history-col-status)]" },
                        { label: "Action", icon: Ellipsis, width: "w-[var(--history-col-action)]" },
                      ].map((column, colIdx, allColumns) => {
                        const Icon = column.icon;
                        const isLastCol = colIdx === allColumns.length - 1;
                        const colPadding = colIdx === 0 ? "pl-4 pr-3" : isLastCol ? "pl-3 pr-4" : "px-3";

                        return (
                          <th
                            key={column.label}
                            scope="col"
                            className={`${column.width} h-[var(--dashboard-head-h)] border-b ${isLastCol ? "" : "border-r"} border-[#e6e6e6] ${colPadding} text-[14px] font-medium leading-5 text-[#2c2c2b] ${isLastCol ? "text-right" : ""}`}
                          >
                            <span className={`flex items-center gap-1.5 ${isLastCol ? "justify-end" : ""}`}>
                              <Icon size={14} strokeWidth={1.75} aria-hidden="true" className="text-[#2c2c2b]" />
                              {column.label}
                            </span>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.map((entry, index) => (
                      <motion.tr
                        key={`${entry.taskName}-${entry.date}`}
                        animate={{ opacity: 1, x: 0 }}
                        className="group h-[var(--dashboard-row-h)] bg-white transition-colors duration-75 hover:bg-[#f7f7f8]"
                        initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -24 }}
                        transition={{
                          delay: shouldReduceMotion ? 0 : index * 0.055,
                          duration: shouldReduceMotion ? 0 : 0.28,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      >
                        <td className="border-b border-r border-[#f0efed] pl-4 pr-3 text-[14px] font-medium leading-5 text-[#31302e]">
                          <span className="block truncate">{entry.taskName}</span>
                        </td>
                        <td className="border-b border-r border-[#f0efed] px-3 text-[14px] font-normal leading-5 text-[#5f5e59]">
                          <DateCell date={entry.date} />
                        </td>
                        <td className="border-b border-r border-[#f0efed] px-3">
                          <CompanyCell customer={entry.customer} />
                        </td>
                        <td className="border-b border-r border-[#f0efed] px-3">
                          <HistoryStatusPill status={entry.status} />
                        </td>
                        <td className="border-b border-[#f0efed] pl-3 pr-4 text-right">
                          <button
                            type="button"
                            className="inline-flex h-7 items-center rounded-[7px] border border-transparent px-2 text-[14px] font-medium leading-5 text-[#0075de] outline-none transition-colors duration-75 hover:border-[#2783DE] hover:bg-[#f7fbff] focus-visible:border-[#2783DE] focus-visible:bg-[#f7fbff] focus-visible:ring-2 focus-visible:ring-[#2783DE]/15"
                          >
                            View
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
