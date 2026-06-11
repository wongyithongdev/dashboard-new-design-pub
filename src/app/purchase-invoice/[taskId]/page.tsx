"use client";

import { DashboardSidebar } from "@/components/sidebar";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Menu,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useMemo, useState } from "react";

const taskData = {
  analyzerTaskId: "7f01eaae-8d65-4385-91fe-ec7a57b9290c",
  analyzerGroupStatus: "completed" as const,
  createdAt: "2026-06-09T09:42:21.68223507Z",
  draft: {
    header: {
      creditorCode: "400-G001",
      creditorName: "Camplus",
      currencyCode: "MYR",
      currencyRate: 1,
      description: "PURCHASE INVOICE",
      displayTerm: "Net 14 days",
      docDate: "2026-05-14",
      purchaseAgent: "JULIANWG",
      supplierInvoiceNo: "01-HQ-1018123",
    },
    details: [
      {
        amount: 4350,
        description: "LENOVO YOGA 7 2-in-1 14ILL10",
        itemCode: "NBK-LENOVO-Y1401",
        qty: 1,
        unitPrice: 4350,
      },
      {
        amount: 360,
        description: "USB-C Docking Station",
        itemCode: "ACC-DOCK-Y2002",
        qty: 1,
        unitPrice: 360,
      },
    ],
  },
  fileServer: {
    imageUrl:
      "https://files.my365biz.com/images/17a5446d85ada5498efd869bf0a71f1aaf1839271161dfd48fc5c04a4ca41fff",
    link: "https://files.my365biz.com/files/17a5446d85ada5498efd869bf0a71f1aaf1839271161dfd48fc5c04a4ca41fff",
  },
};

type HeaderForm = {
  creditorCode: string;
  creditorName: string;
  supplierInvoiceNo: string;
  docDate: string;
  purchaseAgent: string;
  currencyCode: string;
  displayTerm: string;
  description: string;
};

type DetailRow = {
  id: string;
  itemCode: string;
  description: string;
  qty: number;
  unitPrice: number;
  amount: number;
};

function formatMoney(value: number, currency = "MYR") {
  return `${currency} ${value.toLocaleString("en-MY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function buildInitialHeader(taskId: string): HeaderForm {
  if (taskId === "new") {
    return {
      creditorCode: "",
      creditorName: "",
      supplierInvoiceNo: "",
      docDate: new Date().toISOString().slice(0, 10),
      purchaseAgent: "",
      currencyCode: "MYR",
      displayTerm: "Net 30 days",
      description: "PURCHASE INVOICE",
    };
  }

  return { ...taskData.draft.header };
}

function buildInitialRows(taskId: string): DetailRow[] {
  if (taskId === "new") {
    return [
      {
        id: "row-1",
        itemCode: "",
        description: "",
        qty: 1,
        unitPrice: 0,
        amount: 0,
      },
    ];
  }

  return taskData.draft.details.map((detail, index) => ({
    id: `row-${index}`,
    itemCode: detail.itemCode,
    description: detail.description,
    qty: detail.qty,
    unitPrice: detail.unitPrice,
    amount: detail.amount,
  }));
}

function FieldBlock({
  label,
  value,
  onChange,
  type = "text",
  multiline = false,
}: Readonly<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  multiline?: boolean;
}>) {
  return (
    <div className="border-b border-[#ece9e6] px-5 py-4 last:border-b-0">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.32px] text-[#8f8983]">
        {label}
      </p>
      {multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={3}
          className="w-full resize-none rounded-[8px] border border-[#e6e6e6] bg-white px-3 py-2 text-[14px] text-[#2c2c2b] outline-none transition-colors duration-75 placeholder:text-[#c9c4be] hover:bg-[#fafaf9] focus:border-[#b8d6f8]"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-full rounded-[8px] border border-[#e6e6e6] bg-white px-3 text-[14px] text-[#2c2c2b] outline-none transition-colors duration-75 placeholder:text-[#c9c4be] hover:bg-[#fafaf9] focus:border-[#b8d6f8]"
        />
      )}
    </div>
  );
}

export default function PurchaseInvoiceTaskPage() {
  const params = useParams<{ taskId: string }>();
  const taskId = params?.taskId ?? "new";
  const isNew = taskId === "new";

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [header, setHeader] = useState<HeaderForm>(() => buildInitialHeader(taskId));
  const [rows, setRows] = useState<DetailRow[]>(() => buildInitialRows(taskId));

  const total = useMemo(
    () => rows.reduce((sum, row) => sum + Number(row.amount || 0), 0),
    [rows],
  );

  const itemCount = rows.filter((row) => row.description.trim().length > 0).length;
  const title = isNew ? "New Purchase Invoice" : `Purchase Invoice ${taskId}`;

  function patchHeader<K extends keyof HeaderForm>(key: K, value: HeaderForm[K]) {
    setHeader((prev) => ({ ...prev, [key]: value }));
  }

  function patchRow(id: string, field: keyof DetailRow, value: string | number) {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        const next = { ...row, [field]: value };
        if (field === "qty" || field === "unitPrice") {
          next.amount = Number(next.qty) * Number(next.unitPrice);
        }
        return next;
      }),
    );
  }

  function addRow() {
    setRows((prev) => [
      ...prev,
      {
        id: `row-${Date.now()}`,
        itemCode: "",
        description: "",
        qty: 1,
        unitPrice: 0,
        amount: 0,
      },
    ]);
  }

  function removeRow(id: string) {
    setRows((prev) => {
      if (prev.length === 1) {
        return [{ ...prev[0], itemCode: "", description: "", qty: 1, unitPrice: 0, amount: 0 }];
      }
      return prev.filter((row) => row.id !== id);
    });
  }

  return (
    <div className="dashboard-shell h-screen overflow-hidden bg-white md:flex">
      <DashboardSidebar
        activeItem="purchase-invoice"
        isMobileOpen={isSidebarOpen}
        onMobileClose={() => setIsSidebarOpen(false)}
      />

      <main className="flex h-screen min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#fcfcfb]">
        <header className="flex h-[var(--dashboard-header-h)] shrink-0 items-center gap-3 border-b border-[#e6e6e6] bg-white px-[var(--dashboard-main-x)]">
          <button
            type="button"
            aria-label="Open navigation"
            onClick={() => setIsSidebarOpen(true)}
            className="flex size-7 items-center justify-center rounded-[7px] text-[#6f6a64] transition-colors duration-75 hover:bg-[#f3f2f1] lg:hidden"
          >
            <Menu size={18} strokeWidth={1.8} />
          </button>

          <Link
            href="/purchase-invoice"
            className="flex size-7 items-center justify-center rounded-[7px] text-[#6f6a64] transition-colors duration-75 hover:bg-[#f3f2f1]"
          >
            <ArrowLeft size={16} strokeWidth={1.8} />
          </Link>

          <div className="flex min-w-0 items-center gap-2 text-[14px]">
            <span className="text-[#a39e98]">Purchase invoice</span>
            <ChevronRight size={12} strokeWidth={1.8} className="text-[#c9c4be]" />
            <span className="truncate font-medium text-[#2c2c2b]">{title}</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <span className="inline-flex h-7 items-center rounded-[7px] border border-[#d9ebde] bg-[#f3fbf5] px-2.5 text-[12px] font-medium text-[#1f7a4d]">
              Completed
            </span>
            <button
              type="button"
              className="hidden h-8 items-center gap-1.5 rounded-[8px] border border-[#e6e6e6] bg-white px-3 text-[13px] font-medium text-[#2c2c2b] transition-colors duration-75 hover:bg-[#f6f5f4] md:inline-flex"
            >
              <Save size={14} strokeWidth={1.8} />
              Save draft
            </button>
            <button
              type="button"
              className="inline-flex h-8 items-center gap-1.5 rounded-[8px] bg-[#0075de] px-3 text-[13px] font-medium text-white transition-colors duration-75 hover:bg-[#005bab]"
            >
              <Check size={14} strokeWidth={2} />
              Confirm
            </button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 overflow-hidden">
          <section className="flex min-w-0 flex-1 flex-col overflow-hidden border-r border-[#e6e6e6] bg-white">
            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="border-b border-[#e6e6e6] px-5 py-4">
                <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-[#2c2c2b]">
                  {isNew ? "Prepare purchase invoice" : "Invoice details"}
                </h1>
                <p className="mt-2 text-[14px] leading-6 text-[#8f8983]">
                  Review supplier information, adjust line items, and verify the invoice
                  preview before confirming.
                </p>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px]">
                <div className="border-r border-[#e6e6e6]">
                  <div className="border-b border-[#e6e6e6] px-5 py-3">
                    <h2 className="text-[11px] font-semibold uppercase tracking-[0.32px] text-[#8f8983]">
                      Header
                    </h2>
                  </div>

                  <FieldBlock
                    label="Creditor code"
                    value={header.creditorCode}
                    onChange={(value) => patchHeader("creditorCode", value)}
                  />
                  <FieldBlock
                    label="Supplier"
                    value={header.creditorName}
                    onChange={(value) => patchHeader("creditorName", value)}
                  />
                  <FieldBlock
                    label="Supplier invoice no."
                    value={header.supplierInvoiceNo}
                    onChange={(value) => patchHeader("supplierInvoiceNo", value)}
                  />
                  <FieldBlock
                    label="Date"
                    type="date"
                    value={header.docDate}
                    onChange={(value) => patchHeader("docDate", value)}
                  />
                  <FieldBlock
                    label="Agent"
                    value={header.purchaseAgent}
                    onChange={(value) => patchHeader("purchaseAgent", value)}
                  />
                  <FieldBlock
                    label="Currency"
                    value={header.currencyCode}
                    onChange={(value) => patchHeader("currencyCode", value)}
                  />
                  <FieldBlock
                    label="Payment terms"
                    value={header.displayTerm}
                    onChange={(value) => patchHeader("displayTerm", value)}
                  />
                  <FieldBlock
                    label="Description"
                    value={header.description}
                    onChange={(value) => patchHeader("description", value)}
                    multiline
                  />
                </div>

                <div className="bg-[#fafaf9]">
                  <div className="border-b border-[#e6e6e6] px-5 py-3">
                    <h2 className="text-[11px] font-semibold uppercase tracking-[0.32px] text-[#8f8983]">
                      Summary
                    </h2>
                  </div>
                  <dl className="divide-y divide-[#ece9e6]">
                    {[
                      ["Items", `${itemCount}`],
                      ["Currency", header.currencyCode || "MYR"],
                      ["Payment terms", header.displayTerm || "-"],
                      ["Created", "09 Jun 2026"],
                      ["Total", formatMoney(total, header.currencyCode || "MYR")],
                    ].map(([label, value]) => (
                      <div key={label} className="flex items-start justify-between gap-3 px-5 py-4">
                        <dt className="text-[12px] font-medium text-[#8f8983]">{label}</dt>
                        <dd className="text-right text-[14px] font-medium text-[#2c2c2b]">
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>

              <div className="border-y border-[#e6e6e6] bg-[#fafaf9] px-5 py-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-[11px] font-semibold uppercase tracking-[0.32px] text-[#8f8983]">
                    Line items
                  </h2>
                  <button
                    type="button"
                    onClick={addRow}
                    className="inline-flex h-7 items-center gap-1.5 rounded-[7px] px-2 text-[13px] font-medium text-[#8f8983] transition-colors duration-75 hover:bg-[#f1f0ee] hover:text-[#2c2c2b]"
                  >
                    <Plus size={13} strokeWidth={1.8} />
                    Add line
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] border-separate border-spacing-0 bg-white">
                  <thead>
                    <tr>
                      <th className="h-10 border-b border-r border-[#e6e6e6] px-5 text-left text-[12px] font-semibold text-[#2c2c2b]">
                        Item code
                      </th>
                      <th className="h-10 border-b border-r border-[#e6e6e6] px-5 text-left text-[12px] font-semibold text-[#2c2c2b]">
                        Description
                      </th>
                      <th className="h-10 border-b border-r border-[#e6e6e6] px-3 text-right text-[12px] font-semibold text-[#2c2c2b]">
                        Qty
                      </th>
                      <th className="h-10 border-b border-r border-[#e6e6e6] px-3 text-right text-[12px] font-semibold text-[#2c2c2b]">
                        Unit price
                      </th>
                      <th className="h-10 border-b border-r border-[#e6e6e6] px-3 text-right text-[12px] font-semibold text-[#2c2c2b]">
                        Amount
                      </th>
                      <th className="h-10 w-12 border-b border-[#e6e6e6]" />
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, index) => (
                      <tr
                        key={row.id}
                        className="group bg-white transition-colors duration-75 hover:bg-[#fcfcfb]"
                      >
                        <td className={`border-r border-[#e6e6e6] px-0 ${index < rows.length - 1 ? "border-b border-[#f0efed]" : ""}`}>
                          <input
                            type="text"
                            value={row.itemCode}
                            onChange={(event) => patchRow(row.id, "itemCode", event.target.value)}
                            className="h-11 w-full bg-transparent px-5 text-[14px] text-[#2c2c2b] outline-none placeholder:text-[#c9c4be]"
                          />
                        </td>
                        <td className={`border-r border-[#e6e6e6] px-0 ${index < rows.length - 1 ? "border-b border-[#f0efed]" : ""}`}>
                          <input
                            type="text"
                            value={row.description}
                            onChange={(event) =>
                              patchRow(row.id, "description", event.target.value)
                            }
                            className="h-11 w-full bg-transparent px-5 text-[14px] text-[#2c2c2b] outline-none placeholder:text-[#c9c4be]"
                          />
                        </td>
                        <td className={`border-r border-[#e6e6e6] px-0 ${index < rows.length - 1 ? "border-b border-[#f0efed]" : ""}`}>
                          <input
                            type="number"
                            value={row.qty}
                            onChange={(event) =>
                              patchRow(row.id, "qty", Number(event.target.value || 0))
                            }
                            className="h-11 w-full bg-transparent px-3 text-right text-[14px] text-[#2c2c2b] outline-none"
                          />
                        </td>
                        <td className={`border-r border-[#e6e6e6] px-0 ${index < rows.length - 1 ? "border-b border-[#f0efed]" : ""}`}>
                          <input
                            type="number"
                            value={row.unitPrice}
                            onChange={(event) =>
                              patchRow(row.id, "unitPrice", Number(event.target.value || 0))
                            }
                            className="h-11 w-full bg-transparent px-3 text-right text-[14px] text-[#2c2c2b] outline-none"
                          />
                        </td>
                        <td className={`border-r border-[#e6e6e6] px-3 text-right ${index < rows.length - 1 ? "border-b border-[#f0efed]" : ""}`}>
                          <span className="text-[14px] font-medium tabular-nums text-[#2c2c2b]">
                            {formatMoney(row.amount, header.currencyCode || "MYR")}
                          </span>
                        </td>
                        <td className={`px-1 text-center ${index < rows.length - 1 ? "border-b border-[#f0efed]" : ""}`}>
                          <button
                            type="button"
                            onClick={() => removeRow(row.id)}
                            className="inline-flex size-7 items-center justify-center rounded-[7px] text-[#c0bbb5] opacity-0 transition-all duration-75 hover:bg-[#fdecec] hover:text-[#c2410c] group-hover:opacity-100"
                          >
                            <Trash2 size={14} strokeWidth={1.8} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <aside className="hidden w-[min(38rem,48vw)] min-w-[420px] shrink-0 bg-[#f6f5f4] xl:flex xl:flex-col">
            <div className="flex items-center justify-between border-b border-[#e6e6e6] bg-white px-5 py-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.32px] text-[#8f8983]">
                  Preview
                </p>
                <p className="mt-1 text-[13px] text-[#8f8983]">
                  Source document reference
                </p>
              </div>
              <a
                href={taskData.fileServer.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[12px] font-medium text-[#0075de] transition-colors duration-75 hover:text-[#005bab]"
              >
                Open original
              </a>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              <div className="overflow-hidden rounded-[12px] border border-[#e6e6e6] bg-white shadow-[0_2px_14px_rgba(0,0,0,0.04)]">
                <img
                  src={taskData.fileServer.imageUrl}
                  alt="Invoice preview"
                  className="block w-full"
                />
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
