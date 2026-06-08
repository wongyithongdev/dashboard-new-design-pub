"use client";

import { DashboardSidebar } from "@/components/sidebar";
import {
  Building2,
  CalendarDays,
  Check,
  Circle,
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
    amount: "RM 1,240.00",
  },
  {
    invoiceNo: "PI-2026-0002",
    supplierInvoiceNo: "MP-2401-77",
    supplier: "Metro Paper Trading",
    date: "07 Jun 2026",
    agent: "Amelia Tan",
    amount: "RM 856.30",
  },
  {
    invoiceNo: "PI-2026-0003",
    supplierInvoiceNo: "NSL-00984",
    supplier: "Northstar Logistics",
    date: "06 Jun 2026",
    agent: "Daniel Lim",
    amount: "RM 3,420.00",
  },
  {
    invoiceNo: "PI-2026-0004",
    supplierInvoiceNo: "BH-2026-511",
    supplier: "Brightline Hardware",
    date: "05 Jun 2026",
    agent: "Rachel Koh",
    amount: "RM 612.90",
  },
  {
    invoiceNo: "PI-2026-0005",
    supplierInvoiceNo: "GPK-66120",
    supplier: "Greenfield Packaging",
    date: "04 Jun 2026",
    agent: "Marcus Lee",
    amount: "RM 2,105.45",
  },
  {
    invoiceNo: "PI-2026-0006",
    supplierInvoiceNo: "AOS-1044",
    supplier: "Apex Office Systems",
    date: "03 Jun 2026",
    agent: "Wong Yi Thong",
    amount: "RM 498.00",
  },
  {
    invoiceNo: "PI-2026-0007",
    supplierInvoiceNo: "SUM-2880",
    supplier: "Summit Maintenance",
    date: "02 Jun 2026",
    agent: "Amelia Tan",
    amount: "RM 1,780.20",
  },
  {
    invoiceNo: "PI-2026-0008",
    supplierInvoiceNo: "ES-77214",
    supplier: "Evermark Services",
    date: "01 Jun 2026",
    agent: "Daniel Lim",
    amount: "RM 925.00",
  },
];

const actionItems = ["View", "Edit", "Download PDF", "Delete"] as const;

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

  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-[6px] bg-[#f1f0ee] px-1.5 py-0.5 text-[13px] font-medium leading-5 text-[#5f5e59]">
      <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-[#dedbd7] text-[9px] font-semibold text-[#5f5e59]">
        {initial}
      </span>
      <span className="truncate">{name}</span>
    </span>
  );
}

export default function PurchaseInvoicePage() {
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);
  const actionMenuRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const hasSelection = selectedInvoiceIds.length > 0;
  const allSelected = selectedInvoiceIds.length === purchaseInvoices.length;

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
      if (!actionMenuRef.current?.contains(event.target as Node)) {
        setOpenActionId(null);
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
              <h1 className="truncate text-[15px] font-semibold leading-5 text-[#2c2c2b]">
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
              className="inline-flex h-7 items-center gap-1.5 rounded-[7px] border border-[#e6e6e6] bg-white px-2.5 text-[13px] font-medium leading-5 text-[#0075de] shadow-[0_1px_1px_rgba(15,15,15,0.02)] outline-none transition-colors duration-75 hover:bg-[#f7f7f8] focus-visible:ring-1 focus-visible:ring-black/5"
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
            <button
              type="button"
              className="inline-flex h-7 items-center gap-1.5 rounded-[7px] border border-[#e6e6e6] bg-white px-2 text-[13px] font-medium leading-5 text-[#5f5e59] outline-none transition-colors duration-75 hover:bg-[#f7f7f8] hover:text-[#2c2c2b] focus-visible:ring-1 focus-visible:ring-black/5"
            >
              <ListFilter size={13} strokeWidth={1.8} aria-hidden="true" />
              Sort
            </button>
            <button
              type="button"
              className="inline-flex h-7 items-center gap-1.5 rounded-[7px] border border-[#e6e6e6] bg-white px-2 text-[13px] font-medium leading-5 text-[#5f5e59] outline-none transition-colors duration-75 hover:bg-[#f7f7f8] hover:text-[#2c2c2b] focus-visible:ring-1 focus-visible:ring-black/5"
            >
              <Filter size={13} strokeWidth={1.8} aria-hidden="true" />
              Status
              <span className="text-[#a39e98]">is</span>
              <span className="inline-flex items-center gap-1 rounded-[5px] bg-[#f1f0ee] px-1.5 text-[#2c2c2b]">
                <Circle
                  size={7}
                  fill="#0075de"
                  strokeWidth={0}
                  aria-hidden="true"
                />
                Open
              </span>
            </button>
            <button
              type="button"
              aria-label="Add filter"
              className="flex size-7 items-center justify-center rounded-[7px] border border-dashed border-[#dedbd7] text-[#8f8983] outline-none transition-colors duration-75 hover:bg-[#f7f7f8] hover:text-[#2c2c2b] focus-visible:ring-1 focus-visible:ring-black/5"
            >
              <Plus size={14} strokeWidth={1.8} aria-hidden="true" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-auto">
            <table className="w-full min-w-[1040px] border-separate border-spacing-0 text-left">
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
                    { label: "Invoice No", icon: ReceiptText, width: "w-[170px]" },
                    {
                      label: "Supplier Invoice No",
                      icon: Files,
                      width: "w-[210px]",
                    },
                    { label: "Supplier", icon: Building2, width: "w-[240px]" },
                    { label: "Date", icon: CalendarDays, width: "w-[150px]" },
                    { label: "Agent", icon: UserRound, width: "w-[180px]" },
                    { label: "Amount", icon: Sparkles, width: "w-[170px]" },
                    { label: "Action", icon: Ellipsis, width: "w-[120px]" },
                  ].map((column) => {
                    const Icon = column.icon;
                    const isAmount = column.label === "Amount";
                    const isAction = column.label === "Action";

                    return (
                      <th
                        key={column.label}
                        scope="col"
                        className={`${column.width} h-9 border-b border-r border-[#e6e6e6] px-3 text-[12px] font-medium leading-5 text-[#5f5e59] ${
                          isAmount || isAction ? "text-right" : ""
                        }`}
                      >
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
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {purchaseInvoices.map((invoice, index) => {
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
                      <td className="border-b border-r border-[#f0efed] px-3 text-right text-[13px] font-medium leading-5 tabular-nums text-[#2c2c2b]">
                        {invoice.amount}
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
