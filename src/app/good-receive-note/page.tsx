"use client";

import {
  ArrowUpDown,
  Box,
  CalendarDays,
  Camera,
  Check,
  Circle,
  Clock3,
  ChevronDown,
  ChevronUp,
  Ellipsis,
  FileText,
  FolderOpen,
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

type SortKey =
  | "date"
  | "grnNo"
  | "companyName"
  | "agent"
  | "amount"
  | "taskName"
  | "supplier"
  | "status";
type SortDirection = "asc" | "desc";
type ActiveTab = "invoices" | "history";

type GoodReceiveNote = {
  grnNo: string;
  companyName: string;
  agent: string;
  date: string;
  amount: number;
};

type GoodReceiveHistory = {
  taskName: string;
  supplier: string;
  dateTime: string;
  status: "Completed" | "Processing" | "Pending" | "Failed";
};

type GoodReceiveNoteDetail = {
  header: {
    transferTo: string;
    docNo: string;
    supplierDONo: string;
    date: string;
    creditorName: string;
    agent: string;
    subTotal: number;
    gst: number;
    total: number;
  };
  details: Array<{
    description: string;
    qty: number;
    unitPrice: number;
    subTotal: number;
  }>;
};

const invoiceSortOptions: Array<{
  key: SortKey;
  label: string;
  helper: string;
}> = [
  { key: "date", label: "Date", helper: "Newest or oldest GRN" },
  { key: "grnNo", label: "GRNNo", helper: "Sort by GRN number" },
  { key: "companyName", label: "Company", helper: "Sort by company" },
  { key: "agent", label: "Agent", helper: "Sort by agent" },
  { key: "amount", label: "Amount", helper: "Sort by amount" },
];

const historySortOptions: Array<{
  key: SortKey;
  label: string;
  helper: string;
}> = [
  { key: "date", label: "Date", helper: "Latest history first" },
  { key: "taskName", label: "Taskname", helper: "Sort by task name" },
  { key: "supplier", label: "Supplier", helper: "Sort by supplier" },
  { key: "status", label: "Status", helper: "Sort by status" },
];

const notes: GoodReceiveNote[] = [
  { grnNo: "GRN-2026-0001", companyName: "OfficePro Supplies", agent: "Wong Yi Thong", date: "2026-06-09", amount: 1240 },
  { grnNo: "GRN-2026-0002", companyName: "Metro Paper Trading", agent: "Amelia Tan", date: "2026-06-08", amount: 856.3 },
  { grnNo: "GRN-2026-0003", companyName: "Northstar Logistics", agent: "Daniel Lim", date: "2026-06-07", amount: 3420 },
  { grnNo: "GRN-2026-0004", companyName: "Brightline Hardware", agent: "Rachel Koh", date: "2026-06-06", amount: 612.9 },
  { grnNo: "GRN-2026-0005", companyName: "Greenfield Packaging", agent: "Marcus Lee", date: "2026-06-05", amount: 2105.45 },
  { grnNo: "GRN-2026-0006", companyName: "Apex Office Systems", agent: "Wong Yi Thong", date: "2026-06-04", amount: 498 },
  { grnNo: "GRN-2026-0007", companyName: "Summit Maintenance", agent: "Amelia Tan", date: "2026-06-03", amount: 1780.2 },
  { grnNo: "GRN-2026-0008", companyName: "Evermark Services", agent: "Daniel Lim", date: "2026-06-01", amount: 925 },
];

const noteHistory: GoodReceiveHistory[] = [
  {
    taskName: "Created good receive note",
    supplier: "OfficePro Supplies",
    dateTime: "2026-06-09T10:24:18",
    status: "Completed",
  },
  {
    taskName: "Reviewed delivery details",
    supplier: "Metro Paper Trading",
    dateTime: "2026-06-09T09:48:32",
    status: "Completed",
  },
  {
    taskName: "Matched supplier delivery order",
    supplier: "Northstar Logistics",
    dateTime: "2026-06-08T04:16:09",
    status: "Processing",
  },
  {
    taskName: "Checked received item quantity",
    supplier: "Brightline Hardware",
    dateTime: "2026-06-08T02:39:15",
    status: "Pending",
  },
  {
    taskName: "Synced warehouse receive note",
    supplier: "Greenfield Packaging",
    dateTime: "2026-06-07T11:02:44",
    status: "Completed",
  },
  {
    taskName: "Flagged receive note exception",
    supplier: "Apex Office Systems",
    dateTime: "2026-06-07T09:15:27",
    status: "Failed",
  },
];

const noteDetailsMap: Record<string, GoodReceiveNoteDetail> = {
  "GRN-2026-0001": {
    header: {
      transferTo: "PIY1426#05014",
      docNo: "APO2604-GR11102",
      supplierDONo: "KKPLASTIC-NEW",
      date: "2026-04-20",
      creditorName: "AUTO COUNT SDN. BHD.",
      agent: "JULIANWG",
      subTotal: 1600,
      gst: 128,
      total: 1728,
    },
    details: [
      {
        description: "AUTOCOUNT POS 5.0 RETAIL STANDARD EDITION",
        qty: 1,
        unitPrice: 1100,
        subTotal: 1100,
      },
      {
        description: "AUTOCOUNT POS 5.0 ADD-ON # POS A",
        qty: 1,
        unitPrice: 0,
        subTotal: 0,
      },
      {
        description: "AUTOCOUNT POS 5.0 ADD-ON # ACCOUNT (INCLUDE RECURRENCE GL)",
        qty: 1,
        unitPrice: 500,
        subTotal: 500,
      },
      {
        description: "AUTOCOUNT POS 5.0 ADD-ON # SALES MODULE",
        qty: 1,
        unitPrice: 0,
        subTotal: 0,
      },
    ],
  },
};

type CompanyMeta = { color: string; Icon: React.ElementType };

const companyMetaMap: Record<string, CompanyMeta> = {
  "OfficePro Supplies": { color: "#dd5b00", Icon: Box },
  "Metro Paper Trading": { color: "#2563eb", Icon: FileText },
  "Northstar Logistics": { color: "#7c3aed", Icon: Truck },
  "Brightline Hardware": { color: "#1aae39", Icon: Zap },
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

function formatDateTime(dateTime: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date(dateTime));
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
    currencyDisplay: "code",
    minimumFractionDigits: 2,
  })
    .format(amount)
    .replace("MYR", "RM");
}

function getSortValue(note: GoodReceiveNote, key: SortKey) {
  if (key === "date") {
    return new Date(`${note.date}T00:00:00`).getTime();
  }

  if (key === "amount") {
    return note.amount;
  }

  return note[key].toLowerCase();
}

function getHistorySortValue(history: GoodReceiveHistory, key: SortKey) {
  if (key === "date") {
    return new Date(history.dateTime).getTime();
  }

  if (key === "taskName" || key === "supplier" || key === "status") {
    return history[key].toLowerCase();
  }

  return "";
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
      className="inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-[5px] px-2 text-[13px] font-medium leading-5"
      style={{ background: bg, color: text }}
    >
      <CalendarDays
        size={14}
        strokeWidth={1.8}
        aria-hidden="true"
        className="shrink-0"
        style={{ color: icon }}
      />
      {formattedDate}
    </span>
  );
}

function DateTimeCell({ dateTime }: Readonly<{ dateTime: string }>) {
  return (
    <span className="inline-flex h-6 items-center rounded-[5px] bg-[#eff6ff] px-2 text-[12px] font-medium leading-5 text-[#315c9c]">
      {formatDateTime(dateTime)}
    </span>
  );
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
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-[#f1f0ee] px-1.5 py-0.5 text-[14px] font-medium leading-5 text-[#5f5e59]">
      <span
        className={`flex size-4 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold ${agentStyle.avatar}`}
      >
        {initial}
      </span>
      <span className="truncate font-semibold text-[#5f5e59]">{name}</span>
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
      className={`inline-flex h-6 items-center rounded-[6px] px-2 text-[14px] font-medium leading-5 tabular-nums ${amountStyle}`}
    >
      {formatCurrency(amount)}
    </span>
  );
}

function HistoryStatusPill({ status }: Readonly<{ status: GoodReceiveHistory["status"] }>) {
  const { pill, dot } = {
    Completed: { pill: "bg-[#e9f7ef] text-[#1f7a4d]", dot: "bg-[#1f7a4d]" },
    Processing: { pill: "bg-[#eef4ff] text-[#315c9c]", dot: "bg-[#315c9c]" },
    Pending: { pill: "bg-[#fff4db] text-[#a35b00]", dot: "bg-[#f59e0b]" },
    Failed: { pill: "bg-[#fdecec] text-[#c2410c]", dot: "bg-[#c2410c]" },
  }[status];

  return (
    <span className={`inline-flex h-6 items-center gap-1.5 rounded-[6px] px-2 text-[13px] font-medium leading-5 ${pill}`}>
      <span className={`size-1.5 shrink-0 rounded-full ${dot}`} />
      {status}
    </span>
  );
}

function getNoteDetail(note: GoodReceiveNote): GoodReceiveNoteDetail {
  return (
    noteDetailsMap[note.grnNo] ?? {
      header: {
        transferTo: `PI-${note.grnNo.replace("GRN-", "")}`,
        docNo: note.grnNo,
        supplierDONo: `${note.companyName.toUpperCase().replace(/\s+/g, "-")}-DO`,
        date: note.date,
        creditorName: note.companyName,
        agent: note.agent,
        subTotal: note.amount,
        gst: 0,
        total: note.amount,
      },
      details: [
        {
          description: `${note.companyName} received goods`,
          qty: 1,
          unitPrice: note.amount,
          subTotal: note.amount,
        },
      ],
    }
  );
}

function ViewGRNDrawer({
  note,
  onClose,
}: Readonly<{
  note: GoodReceiveNote;
  onClose: () => void;
}>) {
  const shouldReduceMotion = useReducedMotion();
  const detail = getNoteDetail(note);

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
        <div className="flex items-center justify-between gap-4 border-b border-[#e6e6e6] px-7 py-6">
          <div className="min-w-0">
            <h2 className="truncate text-[20px] font-semibold leading-7 tracking-[-0.125px] text-[#2c2c2b]">
              {detail.header.docNo}
            </h2>
            <p className="mt-1 text-[13px] leading-5 text-[#8f8983]">
              Ref · {detail.header.supplierDONo}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-7 shrink-0 items-center justify-center rounded-[7px] text-[#a39e98] outline-none transition-colors duration-75 hover:bg-[#f6f5f4] hover:text-[#5f5e59]"
          >
            <X size={15} strokeWidth={1.8} />
          </button>
        </div>

        <div className="flex flex-col gap-5 px-7 py-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.4px] text-[#a39e98]">
              Supplier
            </p>
            <p className="mt-2 text-[16px] font-semibold leading-6 text-[#2c2c2b]">
              {detail.header.creditorName}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-0 border-y border-[#e6e6e6] sm:grid-cols-3">
            <div className="py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.4px] text-[#a39e98]">
                Date
              </p>
              <p className="mt-2 text-[14px] font-medium leading-5 text-[#2c2c2b]">
                {formatDate(detail.header.date)}
              </p>
            </div>
            <div className="border-t border-[#e6e6e6] py-4 sm:border-l sm:border-t-0 sm:px-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.4px] text-[#a39e98]">
                Agent
              </p>
              <div className="mt-2">
                <AgentPill name={detail.header.agent} />
              </div>
            </div>
            <div className="border-t border-[#e6e6e6] py-4 sm:border-l sm:border-t-0 sm:px-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.4px] text-[#a39e98]">
                Transfer to
              </p>
              <p className="mt-2 text-[14px] font-medium leading-5 text-[#2c2c2b]">
                {detail.header.transferTo}
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.4px] text-[#a39e98]">
                Financials
              </p>
              <p className="text-[11px] font-semibold uppercase tracking-[0.4px] text-[#a39e98]">
                MYR
              </p>
            </div>
            <dl className="mt-3 border-y border-[#e6e6e6]">
              {[
                { label: "Sub total", value: detail.header.subTotal },
                { label: "SST / GST", value: detail.header.gst },
                { label: "Total", value: detail.header.total },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-4 border-b border-[#e6e6e6] py-3 last:border-b-0"
                >
                  <dt className="text-[14px] leading-5 text-[#615d59]">{item.label}</dt>
                  <dd className="text-[14px] font-semibold leading-5 text-[#2c2c2b]">
                    {formatCurrency(item.value)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.4px] text-[#a39e98]">
                Line items
              </p>
              <p className="text-[11px] font-medium tracking-[0.2px] text-[#a39e98]">
                {detail.details.length} line
              </p>
            </div>
            <div className="mt-3 overflow-hidden border-y border-[#e6e6e6]">
              <table className="w-full table-fixed border-separate border-spacing-0 text-left">
                <thead className="bg-white">
                  <tr>
                    <th className="w-auto border-b border-r border-[#e6e6e6] py-2 pr-4 text-[12px] font-medium uppercase tracking-[0.2px] text-[#8f8983]">
                      Description
                    </th>
                    <th className="w-[56px] border-b border-r border-[#e6e6e6] px-3 py-2 text-center text-[12px] font-medium uppercase tracking-[0.2px] text-[#8f8983]">
                      Qty
                    </th>
                    <th className="w-[108px] border-b border-r border-[#e6e6e6] px-3 py-2 text-right text-[12px] font-medium uppercase tracking-[0.2px] text-[#8f8983]">
                      Unit price
                    </th>
                    <th className="w-[116px] border-b border-[#e6e6e6] pl-3 py-2 text-right text-[12px] font-medium uppercase tracking-[0.2px] text-[#8f8983]">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {detail.details.map((item, index) => (
                    <tr key={`${detail.header.docNo}-${index}`} className="h-11">
                      <td className="border-b border-r border-[#f0efed] py-3 pr-4 text-[14px] leading-5 text-[#2c2c2b]">
                        <span className="block whitespace-normal break-words">
                          {item.description}
                        </span>
                      </td>
                      <td className="border-b border-r border-[#f0efed] px-3 py-3 text-center text-[14px] leading-5 text-[#615d59]">
                        {item.qty}
                      </td>
                      <td className="border-b border-r border-[#f0efed] px-3 py-3 text-right text-[14px] leading-5 text-[#615d59]">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="border-b border-[#f0efed] pl-3 py-3 text-right text-[14px] font-semibold leading-5 text-[#2c2c2b]">
                        {formatCurrency(item.subTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
  if (file.type === "application/pdf") return { ext, color: "#dc2626", bg: "#fef2f2" };
  if (file.type.startsWith("image/")) return { ext, color: "#0075de", bg: "#eff6ff" };
  return { ext, color: "#8f8983", bg: "#f6f5f4" };
}

function getHistoryMockFiles(entry: GoodReceiveHistory) {
  const slug = entry.supplier.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return [
    { name: `${slug}-delivery-order.pdf`, size: 20284, type: "application/pdf" },
    { name: `${slug}-grn-photo.png`, size: 90512, type: "image/png" },
  ];
}

function UploadDrawer({
  mode,
  historyEntry,
  onClose,
}: Readonly<{ mode: "upload" | "history"; historyEntry: GoodReceiveHistory | null; onClose: () => void }>) {
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
    function onKey(e: KeyboardEvent) { if (e.key === "Escape" && (mode === "history" || phase === "upload")) onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, phase, onClose]);

  if (mode === "history" && historyEntry) {
    const mockFiles = getHistoryMockFiles(historyEntry);
    return (
      <div className="flex h-full flex-col">
        <div className="flex h-[var(--dashboard-header-h)] flex-shrink-0 items-center justify-between border-b border-[#e6e6e6] px-7">
          <div className="min-w-0">
            <h2 className="truncate text-[17px] font-semibold leading-6 tracking-[-0.15px] text-[#2c2c2b]">Uploaded files</h2>
            <p className="mt-0.5 truncate text-[13px] leading-5 text-[#a39e98]">{historyEntry.taskName}</p>
          </div>
          <button type="button" onClick={onClose} className="ml-4 flex size-7 shrink-0 items-center justify-center rounded-[7px] text-[#a39e98] outline-none transition-colors duration-75 hover:bg-[#f6f5f4] hover:text-[#5f5e59]">
            <X size={15} strokeWidth={1.8} />
          </button>
        </div>
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="border-b border-[#f0efed] px-7 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate text-[20px] font-semibold leading-7 tracking-[-0.18px] text-[#2c2c2b]">{historyEntry.supplier}</p>
                <p className="mt-1 text-[13px] leading-5 text-[#a39e98]">Completed import package</p>
              </div>
              <HistoryStatusPill status={historyEntry.status} />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="divide-y divide-[#f4f3f1]">
              {mockFiles.map((file, index) => {
                const ext = file.name.split(".").pop()?.toUpperCase() ?? "FILE";
                const fileMeta = file.type === "application/pdf" ? { color: "#dc2626", bg: "#fef2f2" } : { color: "#0075de", bg: "#eff6ff" };
                return (
                  <div key={`${file.name}-${index}`} className="flex items-center gap-3 px-7 py-3">
                    <div className="flex size-5 shrink-0 items-center justify-center">
                      <span className="flex size-5 items-center justify-center rounded-full bg-[#e6f4eb]"><Check size={9} strokeWidth={3} className="text-[#1a7a46]" /></span>
                    </div>
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-[7px] text-[10px] font-bold tracking-wide" style={{ background: fileMeta.bg, color: fileMeta.color }}>{ext}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-medium leading-5 text-[#31302e]">{file.name}</p>
                      <p className="mt-0.5 text-[12px] leading-4 text-[#b5b0aa]">{formatBytes(file.size)}</p>
                    </div>
                    <button type="button" className="inline-flex h-7 shrink-0 items-center rounded-[7px] border border-transparent px-2 text-[13px] font-medium text-[#0075de] outline-none transition-colors duration-75 hover:border-[#2783DE] hover:bg-[#f7fbff] focus-visible:border-[#2783DE] focus-visible:bg-[#f7fbff] focus-visible:ring-2 focus-visible:ring-[#2783DE]/15">View</button>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="border-t border-[#e6e6e6] px-7 py-5">
            <div className="flex items-center justify-between gap-3 text-[13px] leading-5 text-[#a39e98]">
              <span>{mockFiles.length} files ready to review</span>
              <span>{historyEntry.dateTime}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function addFiles(incoming: FileList | null) {
    if (!incoming) return;
    setFiles(prev => [...prev, ...Array.from(incoming)]);
  }
  function removeFile(index: number) { setFiles(prev => prev.filter((_, i) => i !== index)); }
  function handleDragOver(e: React.DragEvent) { e.preventDefault(); setIsDragOver(true); }
  function handleDragLeave(e: React.DragEvent) { e.preventDefault(); setIsDragOver(false); }
  function handleDrop(e: React.DragEvent) { e.preventDefault(); setIsDragOver(false); addFiles(e.dataTransfer.files); }

  function handleUpload() {
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];
    setStatuses(new Array(files.length).fill(0));
    setPhase("processing");
    const stagger = shouldReduceMotion ? 15 : Math.min(300, Math.floor(2500 / Math.max(files.length, 1)));
    const readDur = shouldReduceMotion ? 40 : 1200;
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
              <h2 className="text-[17px] font-semibold leading-6 tracking-[-0.15px] text-[#2c2c2b]">Upload documents</h2>
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
              {!hasFiles && (
                <div className="pointer-events-none absolute inset-0 select-none overflow-hidden flex flex-col items-center justify-center">
                  <div className="absolute inset-0 opacity-[0.55]" style={{ backgroundImage: "radial-gradient(circle, #ccc8c2 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
                  <motion.div className="absolute inset-0" animate={{ opacity: isDragOver ? 1 : 0.7 }} transition={{ duration: 0.4, ease: easeOut }} style={{ background: "radial-gradient(ellipse 80% 60% at 50% 46%, rgba(0,117,222,0.11) 0%, transparent 70%)" }} />
                  <div className="relative flex flex-col items-center">
                    <div className="relative h-[148px] w-[180px]">
                      <motion.div className="absolute inset-0" animate={isDragOver && !shouldReduceMotion ? { rotate: -8, x: -26, y: -8, scale: 1.02 } : shouldReduceMotion ? { rotate: -5, x: -16, y: 0 } : { rotate: [-5, -6, -5], x: [-16, -18, -16], y: [0, -3, 0] }} transition={isDragOver ? { duration: 0.38, ease: easeOut } : { duration: 4, repeat: Infinity, ease: "easeInOut" }}>
                        <div className="w-[168px] rounded-[10px] border border-[#e8e5df] bg-white/60 p-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.05)] opacity-50">
                          <div className="mb-2 h-2 w-20 rounded-full bg-[#e0dcd5]" />
                          <div className="mb-1 h-1.5 w-14 rounded-full bg-[#eae7e1]" />
                          <div className="mb-3 h-1.5 w-10 rounded-full bg-[#eae7e1]" />
                          <div className="mb-2.5 h-px bg-[#f0ede8]" />
                          {[44, 32, 52].map((w, i) => (<div key={i} className="mb-1.5 flex justify-between"><div className="h-1.5 rounded-full bg-[#ebe8e2]" style={{ width: w }} /><div className="h-1.5 w-8 rounded-full bg-[#ebe8e2]" /></div>))}
                          <div className="mt-2.5 flex justify-end"><div className="h-2 w-16 rounded-full bg-[#dedad3]" /></div>
                        </div>
                      </motion.div>
                      <motion.div className="absolute inset-0" animate={isDragOver && !shouldReduceMotion ? { rotate: 7, x: 24, y: -10, scale: 1.04 } : shouldReduceMotion ? { rotate: 4, x: 14, y: 0 } : { rotate: [4, 5, 4], x: [14, 16, 14], y: [0, -4, 0] }} transition={isDragOver ? { duration: 0.38, ease: easeOut } : { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}>
                        <div className="w-[168px] rounded-[10px] border border-[#e0ddd6] bg-white/85 p-3.5 shadow-[0_4px_16px_rgba(0,0,0,0.09)]">
                          <div className="mb-1 flex items-center justify-between"><div className="h-2 w-16 rounded-full bg-[#d8d4cd]" /><div className="h-1.5 w-10 rounded-full bg-[#e5e1da]" /></div>
                          <div className="mb-3 h-1.5 w-12 rounded-full bg-[#eae7e1]" />
                          <div className="mb-2.5 h-[14px] w-20 rounded-[5px] bg-[#d4d0c8]" />
                          <div className="mb-2.5 h-px bg-[#eeebe5]" />
                          {[56, 40, 64, 36].map((w, i) => (<div key={i} className="mb-1.5 flex justify-between"><div className="h-1.5 rounded-full bg-[#e5e1da]" style={{ width: w }} /><div className="h-1.5 w-9 rounded-full bg-[#e5e1da]" /></div>))}
                        </div>
                      </motion.div>
                      <motion.span className="absolute -right-1 -top-2 text-[#62aef0]" animate={shouldReduceMotion ? { opacity: 0.7 } : { opacity: [0.3, 1, 0.3], scale: [0.88, 1.15, 0.88] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}>
                        <Sparkles size={15} strokeWidth={1.8} />
                      </motion.span>
                    </div>
                    <div className="mt-5 flex flex-col items-center">
                      <motion.p className="text-[14px] font-semibold tracking-[-0.1px]" animate={{ color: isDragOver ? "#0075de" : "#2c2b29" }} transition={{ duration: 0.2 }}>
                        {isDragOver ? "Release to add" : "Drop documents here"}
                      </motion.p>
                      <p className="mt-1 text-[12px] text-[#b5b0aa]">PDF, JPG, PNG · AI extracts details automatically</p>
                    </div>
                  </div>
                  <AnimatePresence>
                    {isDragOver && (
                      <motion.div className="pointer-events-none absolute inset-3 rounded-[12px] border-2 border-dashed border-[#0075de]/50" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.2, ease: easeOut }} />
                    )}
                  </AnimatePresence>
                </div>
              )}
              <AnimatePresence>
                {hasFiles && (
                  <motion.div key="filelist" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.12, ease: easeOut } }} className="mt-4 flex flex-col gap-2">
                    <AnimatePresence initial={false}>
                      {files.map((file, index) => {
                        const { ext, color, bg } = getFileExt(file);
                        return (
                          <motion.div key={`${file.name}-${file.size}-${index}`} layout initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.2, ease: easeOut }} className="flex items-center gap-3 rounded-[10px] border border-[#e6e6e6] bg-white px-3 py-2.5">
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-[7px] text-[10px] font-bold tracking-wide" style={{ background: bg, color }}>{ext}</span>
                            <span className="min-w-0 flex-1">
                              <p className="truncate text-[13px] font-medium leading-5 text-[#31302e]">{file.name}</p>
                              <p className="flex items-center gap-1 text-[11px] leading-4 text-[#a39e98]"><span className="size-[5px] rounded-full bg-[#1aae39]" />Ready &middot; {formatBytes(file.size)}</p>
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
                    {`Extract ${files.length} ${files.length === 1 ? "document" : "documents"} with AI`}
                  </motion.button>
                ) : (
                  <motion.div key="sources" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15, ease: easeOut }} className="flex gap-2">
                    <button type="button" onClick={() => cameraInputRef.current?.click()} className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-[10px] bg-[#2783DE] text-[13px] font-medium text-white shadow-[0_1px_1px_rgba(39,131,222,0.16)] outline-none transition-colors duration-75 hover:bg-[#1f76c9]">
                      <Camera size={14} strokeWidth={1.8} /> Take photo
                    </button>
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-[10px] bg-[#2783DE] text-[13px] font-medium text-white shadow-[0_1px_1px_rgba(39,131,222,0.16)] outline-none transition-colors duration-75 hover:bg-[#1f76c9]">
                      <FolderOpen size={14} strokeWidth={1.8} /> Choose file
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
                        {files.length} {files.length === 1 ? "document" : "documents"} ready
                      </motion.h2>
                    ) : (
                      <motion.h2 key="proc-h" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[17px] font-semibold leading-6 tracking-[-0.15px] text-[#2c2c2b]">
                        Extracting documents
                      </motion.h2>
                    )}
                  </AnimatePresence>
                  <p className="mt-0.5 text-[13px] leading-5 text-[#a39e98]">{`${doneCount} of ${files.length} done`}</p>
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
                  const done = s === 3;
                  const active = s === 1 || s === 2;
                  return (
                    <div key={i} className="group flex items-center gap-3 px-7 py-3">
                      <div className="flex size-5 shrink-0 items-center justify-center">
                        {done ? (
                          <span className="flex size-5 items-center justify-center rounded-full bg-[#e6f4eb]"><Check size={9} strokeWidth={3} className="text-[#1a7a46]" /></span>
                        ) : active ? (
                          <span className="size-[14px] animate-spin rounded-full border-[1.5px] border-[#0075de]/20 border-t-[#0075de]" />
                        ) : (
                          <span className="size-[7px] rounded-full bg-[#dedad5]" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-medium leading-5 text-[#31302e]">{file.name}</p>
                        <p className="mt-0.5 text-[12px] leading-4 text-[#b5b0aa]">{formatBytes(file.size)}</p>
                      </div>
                      {done && (
                        <button type="button" className="inline-flex h-7 shrink-0 items-center rounded-[7px] border border-transparent px-2 text-[13px] font-medium text-[#0075de] outline-none transition-colors duration-75 hover:border-[#2783DE] hover:bg-[#f7fbff] focus-visible:border-[#2783DE] focus-visible:bg-[#f7fbff] focus-visible:ring-2 focus-visible:ring-[#2783DE]/15">View</button>
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
                  AI is reading your documents…
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

export default function GoodReceiveNotePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUploadDrawerOpen, setIsUploadDrawerOpen] = useState(false);
  const [uploadDrawerMode, setUploadDrawerMode] = useState<"upload" | "history">("upload");
  const [selectedHistoryEntry, setSelectedHistoryEntry] = useState<GoodReceiveHistory | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("invoices");
  const [searchValue, setSearchValue] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [viewingNote, setViewingNote] = useState<GoodReceiveNote | null>(null);
  const sortMenuRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const isHistoryTab = activeTab === "history";
  const activeSortOptions = isHistoryTab ? historySortOptions : invoiceSortOptions;

  const activeSortOption =
    activeSortOptions.find((option) => option.key === sortKey) ?? activeSortOptions[0];

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!sortMenuRef.current?.contains(event.target as Node)) {
        setIsSortMenuOpen(false);
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

  function openHistoryDrawer(entry: GoodReceiveHistory) {
    setUploadDrawerMode("history");
    setSelectedHistoryEntry(entry);
    setIsUploadDrawerOpen(true);
  }

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

  const filteredNotes = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    return notes.filter((note) => {
      if (!normalizedSearch) {
        return true;
      }

      return [note.grnNo, note.companyName, note.agent].some((value) =>
        value.toLowerCase().includes(normalizedSearch),
      );
    });
  }, [searchValue]);

  const filteredHistory = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    return noteHistory.filter((history) => {
      if (!normalizedSearch) {
        return true;
      }

      return [history.taskName, history.supplier, history.status, formatDateTime(history.dateTime)].some(
        (value) => value.toLowerCase().includes(normalizedSearch),
      );
    });
  }, [searchValue]);

  const sortedNotes = useMemo(() => {
    return [...filteredNotes].sort((a, b) => {
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
  }, [filteredNotes, sortDirection, sortKey]);

  const sortedHistory = useMemo(() => {
    return [...filteredHistory].sort((a, b) => {
      const firstValue = getHistorySortValue(a, sortKey);
      const secondValue = getHistorySortValue(b, sortKey);

      if (typeof firstValue === "number" && typeof secondValue === "number") {
        return sortDirection === "asc"
          ? firstValue - secondValue
          : secondValue - firstValue;
      }

      return sortDirection === "asc"
        ? String(firstValue).localeCompare(String(secondValue))
        : String(secondValue).localeCompare(String(firstValue));
    });
  }, [filteredHistory, sortDirection, sortKey]);

  function handleTabChange(nextTab: ActiveTab) {
    setActiveTab(nextTab);
    setSearchValue("");
    setSortKey("date");
    setSortDirection("desc");
    setIsSortMenuOpen(false);
  }

  return (
    <div className="dashboard-shell min-h-screen bg-white">
      <div className="flex min-h-screen">
        <DashboardSidebar
          activeItem="good-receive-note"
          isMobileOpen={isSidebarOpen}
          onMobileClose={() => setIsSidebarOpen(false)}
        />

        <div className="flex min-w-0 flex-1 overflow-hidden">
        <main
          className="min-w-0 flex-1 overflow-y-auto bg-white text-[#2c2c2b]"
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
                  onClick={() => setIsSidebarOpen(true)}
                  aria-label="Open navigation menu"
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-[8px] text-[#615d59] outline-none transition-colors duration-75 hover:bg-[#f7f7f8] hover:text-[#2c2c2b] focus-visible:bg-[#f7f7f8] focus-visible:text-[#2c2c2b] xl:hidden"
                >
                  <Menu size={17} strokeWidth={1.9} aria-hidden="true" />
                </button>
                <h1 className="truncate text-[20px] font-semibold leading-7 tracking-[-0.125px] text-[#2c2c2b]">
                  Good Receive note
                </h1>
                <div className="group relative flex shrink-0 items-center">
                  <button
                    type="button"
                    aria-label="About Good Receive note"
                    className="flex items-center justify-center text-[#c9c4bf] outline-none transition-colors duration-75 hover:text-[#8f8983]"
                  >
                    <Info size={15} strokeWidth={1.7} aria-hidden="true" />
                  </button>
                  <div className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 w-max max-w-[220px] -translate-x-1/2 rounded-[8px] bg-[#2c2c2b] px-3 py-2 text-[12px] leading-[1.45] text-white opacity-0 shadow-[0_4px_16px_rgba(15,15,15,0.18)] transition-opacity duration-150 group-hover:opacity-100">
                    Review received goods by GRN number, company, agent, and amount.
                    <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-[#2c2c2b]" />
                  </div>
                </div>
              </div>
            </header>

            <div className="flex h-[var(--dashboard-toolbar-h)] items-center justify-between gap-3 px-[var(--dashboard-main-x)]">
              <div className="inline-flex items-center gap-1 rounded-[8px] bg-[#f6f5f4] p-1">
                {([
                  { key: "invoices", label: "Invoices", count: notes.length, Icon: FileText },
                  { key: "history", label: "History", count: noteHistory.length, Icon: Clock3 },
                ] as const).map(({ key, label, count, Icon }) => {
                  const isActive = activeTab === key;

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleTabChange(key)}
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
                onClick={() => isUploadDrawerOpen ? closeUploadDrawer() : (setUploadDrawerMode("upload"), setSelectedHistoryEntry(null), setIsUploadDrawerOpen(true))}
                className={`inline-flex h-7 items-center gap-1.5 rounded-[7px] px-2.5 text-[13px] font-medium leading-5 outline-none transition-colors duration-75 ${isUploadDrawerOpen ? "bg-[#e8453c] text-white shadow-[0_1px_1px_rgba(232,69,60,0.18)] hover:bg-[#d63c34]" : "bg-[#2783DE] text-white shadow-[0_1px_1px_rgba(39,131,222,0.16)] hover:bg-[#1f76c9]"}`}
              >
                {isUploadDrawerOpen ? <X size={13} strokeWidth={2} aria-hidden="true" /> : <Plus size={13} strokeWidth={1.9} aria-hidden="true" />}
                {isUploadDrawerOpen ? "Dismiss" : "Create Note"}
              </button>
            </div>
            <div className="mx-[var(--dashboard-main-x)] border-b border-[#e6e6e6]" />

            <div className="flex h-[var(--dashboard-toolbar-h)] items-center gap-2 px-[var(--dashboard-main-x)]">
              <label className="relative w-[var(--dashboard-toolbar-search-w)] max-w-[42vw] shrink">
                <span className="sr-only">{isHistoryTab ? "Search receive note history" : "Search good receive notes"}</span>
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
                  placeholder={isHistoryTab ? "Search history..." : "Search receive notes..."}
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
                      {activeSortOptions.map((option) => {
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
              {isHistoryTab ? (
                <table className="w-full min-w-[var(--history-table-min-w)] table-fixed border-separate border-spacing-0 text-left">
                  <thead className="sticky top-0 z-10 bg-white">
                    <tr>
                      {[
                        { label: "Taskname", icon: FileText, width: "w-[var(--history-col-task)]", key: "taskName" },
                        { label: "Date", icon: CalendarDays, width: "w-[var(--history-col-date)]", key: "date" },
                        { label: "Supplier", icon: Store, width: "w-[var(--history-col-supplier)]", key: "supplier" },
                        { label: "Status", icon: Circle, width: "w-[var(--history-col-status)]", key: "status" },
                        { label: "Action", icon: Ellipsis, width: "w-[var(--history-col-action)]", key: undefined },
                      ].map((column, columnIndex, columns) => {
                        const Icon = column.icon;
                        const isLastColumn = columnIndex === columns.length - 1;
                        const isActionColumn = column.label === "Action";
                        const isSortable = Boolean(column.key);
                        const isActiveSort = column.key === sortKey;
                        const isAscendingSort = isActiveSort && sortDirection === "asc";
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
                            className={`${column.width} h-[var(--dashboard-head-h)] border-b ${isLastColumn ? "" : "border-r"} border-[#e6e6e6] ${columnPadding} text-[14px] font-medium leading-5 text-[#2c2c2b] ${isActionColumn ? "text-right" : ""}`}
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
                                className="flex min-w-0 items-center gap-1.5 outline-none transition-colors duration-75 hover:text-[#2c2c2b] focus-visible:text-[#2c2c2b]"
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
                                    <ChevronUp size={12} strokeWidth={2} aria-hidden="true" className="shrink-0 text-[#0075de]" />
                                  ) : (
                                    <ChevronDown size={12} strokeWidth={2} aria-hidden="true" className="shrink-0 text-[#0075de]" />
                                  )
                                ) : (
                                  <ArrowUpDown size={11} strokeWidth={1.9} aria-hidden="true" className="shrink-0 text-[#2c2c2b]/45" />
                                )}
                              </button>
                            ) : (
                              <span className="flex items-center justify-end gap-1.5">
                                <Icon size={14} strokeWidth={1.75} aria-hidden="true" className="shrink-0 text-[#2c2c2b]" />
                                <span className="truncate">{column.label}</span>
                              </span>
                            )}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedHistory.map((history, index) => (
                      <motion.tr
                        key={`${history.taskName}-${history.supplier}-${history.dateTime}`}
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
                          {history.taskName}
                        </td>
                        <td className="border-b border-r border-[#f0efed] px-3">
                          <DateTimeCell dateTime={history.dateTime} />
                        </td>
                        <td className="border-b border-r border-[#f0efed] px-3">
                          <CompanyCell companyName={history.supplier} />
                        </td>
                        <td className="border-b border-r border-[#f0efed] px-3">
                          <HistoryStatusPill status={history.status} />
                        </td>
                        <td className="border-b border-[#f0efed] pl-3 pr-6 text-right">
                          <button
                            type="button"
                            onClick={() => openHistoryDrawer(history)}
                            className="inline-flex h-7 items-center rounded-[7px] border border-transparent px-2 text-[13px] font-medium leading-5 text-[#0075de] outline-none transition-colors duration-75 hover:border-[#2783DE] hover:bg-[#f7fbff] focus-visible:border-[#2783DE] focus-visible:bg-[#f7fbff] focus-visible:ring-2 focus-visible:ring-[#2783DE]/15"
                          >
                            View
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              ) : (
              <table className="w-full min-w-[var(--grn-table-min-w)] table-fixed border-separate border-spacing-0 text-left">
                <thead className="sticky top-0 z-10 bg-white">
                  <tr>
                    {[
                      { label: "GRNNo", icon: Hash, width: "w-[var(--grn-col-number)]", key: "grnNo" },
                      { label: "Company", icon: Store, width: "w-[var(--grn-col-company)]", key: "companyName" },
                      { label: "Agent", icon: UserRound, width: "w-[var(--grn-col-agent)]", key: "agent" },
                      { label: "Date", icon: CalendarDays, width: "w-[var(--grn-col-date)]", key: "date" },
                      { label: "Amount", icon: Sparkles, width: "w-[var(--grn-col-amount)]", key: "amount" },
                      { label: "Action", icon: Ellipsis, width: "w-[var(--grn-col-action)]", key: undefined },
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
                          className={`${column.width} h-[var(--dashboard-head-h)] border-b ${isLastColumn ? "" : "border-r"} border-[#e6e6e6] ${columnPadding} text-[14px] font-medium leading-5 text-[#2c2c2b] ${
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
                                  isAmountColumn ? "justify-end" : "justify-start"
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
                  {sortedNotes.map((note, index) => (
                    <motion.tr
                      key={note.grnNo}
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
                        {note.grnNo}
                      </td>
                      <td className="border-b border-r border-[#f0efed] px-3">
                        <CompanyCell companyName={note.companyName} />
                      </td>
                      <td className="border-b border-r border-[#f0efed] px-3">
                        <AgentPill name={note.agent} />
                      </td>
                      <td className="border-b border-r border-[#f0efed] px-3">
                        <DateCell date={note.date} />
                      </td>
                      <td className="border-b border-r border-[#f0efed] px-3 text-right">
                        <AmountPill amount={note.amount} />
                      </td>
                      <td className="border-b border-[#f0efed] pl-3 pr-6 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            aria-label={`View ${note.grnNo}`}
                            onClick={() => setViewingNote(note)}
                            className="inline-flex size-7 items-center justify-center rounded-[7px] text-[#8f8983] outline-none transition-colors duration-75 hover:bg-[#ededee] hover:text-[#2c2c2b] focus-visible:bg-[#ededee] focus-visible:ring-1 focus-visible:ring-black/5"
                          >
                            <Ellipsis size={15} strokeWidth={1.9} aria-hidden="true" />
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
                <UploadDrawer mode={uploadDrawerMode} historyEntry={selectedHistoryEntry} onClose={closeUploadDrawer} />
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {viewingNote ? (
          <ViewGRNDrawer
            key={viewingNote.grnNo}
            note={viewingNote}
            onClose={() => setViewingNote(null)}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
