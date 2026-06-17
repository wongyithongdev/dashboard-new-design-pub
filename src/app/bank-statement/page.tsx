"use client";

import { DashboardSidebar } from "@/components/sidebar";
import {
  ArrowUpDown,
  Check,
  ChevronDown,
  ChevronUp,
  Circle,
  Ellipsis,
  FolderOpen,
  Hash,
  Info,
  ListFilter,
  Menu,
  Plus,
  Search,
  Sparkles,
  Tag,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileExt(file: File) {
  const ext = file.name.split(".").pop()?.toUpperCase() ?? "FILE";
  if (file.type === "application/pdf") return { ext, bg: "#fef2f2", color: "#dc2626" };
  return { ext, bg: "#eff6ff", color: "#0075de" };
}

function UploadDrawer({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const ease = [0.22, 1, 0.36, 1] as const;
  const [isDragOver, setIsDragOver] = useState(false);
  const [files, setFiles]           = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasFiles = files.length > 0;

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function addFiles(fl: FileList | null) {
    if (!fl) return;
    setFiles((p) => [...p, ...Array.from(fl)]);
  }
  function removeFile(i: number) { setFiles((p) => p.filter((_, j) => j !== i)); }
  function handleDragOver(e: React.DragEvent) { e.preventDefault(); setIsDragOver(true); }
  function handleDragLeave(e: React.DragEvent) { e.preventDefault(); setIsDragOver(false); }
  function handleDrop(e: React.DragEvent) { e.preventDefault(); setIsDragOver(false); addFiles(e.dataTransfer.files); }

  function handleUpload() {
    const taskId = `TASK-${String(Date.now()).slice(-6)}`;
    router.push(`/bank-statement/${taskId}`);
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-[var(--dashboard-header-h)] shrink-0 items-center justify-between border-b border-[#e6e6e6] px-7">
              <h2 className="text-[17px] font-semibold leading-6 tracking-[-0.15px] text-[#2c2c2b]">Upload PDF</h2>
              <button type="button" onClick={onClose} className="ml-4 flex size-7 shrink-0 items-center justify-center rounded-[7px] text-[#a39e98] outline-none transition-colors duration-75 hover:bg-[#f6f5f4] hover:text-[#5f5e59]">
                <X size={15} strokeWidth={1.8} />
              </button>
            </div>

            <div
              className={`relative flex-1 cursor-pointer overflow-y-auto px-7 py-6 transition-colors duration-150 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${isDragOver ? "bg-[#f4f9ff]" : "bg-white"}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {!hasFiles && (
                <div className="pointer-events-none absolute inset-0 flex select-none flex-col items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 opacity-[0.55]" style={{ backgroundImage: "radial-gradient(circle, #ccc8c2 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
                  <motion.div className="absolute inset-0" animate={{ opacity: isDragOver ? 1 : 0.7 }} transition={{ duration: 0.4, ease }} style={{ background: "radial-gradient(ellipse 80% 60% at 50% 46%, rgba(0,117,222,0.11) 0%, transparent 70%)" }} />
                  <div className="relative flex flex-col items-center">
                    <div className="relative h-[148px] w-[180px]">
                      <motion.div className="absolute inset-0" animate={isDragOver && !shouldReduceMotion ? { rotate: -8, x: -26, y: -8, scale: 1.02 } : shouldReduceMotion ? { rotate: -5, x: -16, y: 0 } : { rotate: [-5, -6, -5], x: [-16, -18, -16], y: [0, -3, 0] }} transition={isDragOver ? { duration: 0.38, ease } : { duration: 4, repeat: Infinity, ease: "easeInOut" }}>
                        <div className="w-[168px] rounded-[10px] border border-[#e8e5df] bg-white/60 p-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.05)] opacity-50">
                          <div className="mb-2 h-2 w-20 rounded-full bg-[#e0dcd5]" />
                          <div className="mb-1 h-1.5 w-14 rounded-full bg-[#eae7e1]" />
                          <div className="mb-3 h-1.5 w-10 rounded-full bg-[#eae7e1]" />
                          <div className="mb-2.5 h-px bg-[#f0ede8]" />
                          {[44, 32, 52].map((w, i) => <div key={i} className="mb-1.5 flex justify-between"><div className="h-1.5 rounded-full bg-[#ebe8e2]" style={{ width: w }} /><div className="h-1.5 w-8 rounded-full bg-[#ebe8e2]" /></div>)}
                        </div>
                      </motion.div>
                      <motion.div className="absolute inset-0" animate={isDragOver && !shouldReduceMotion ? { rotate: 7, x: 24, y: -10, scale: 1.04 } : shouldReduceMotion ? { rotate: 4, x: 14, y: 0 } : { rotate: [4, 5, 4], x: [14, 16, 14], y: [0, -4, 0] }} transition={isDragOver ? { duration: 0.38, ease } : { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}>
                        <div className="w-[168px] rounded-[10px] border border-[#e0ddd6] bg-white/85 p-3.5 shadow-[0_4px_16px_rgba(0,0,0,0.09)]">
                          <div className="mb-1 flex items-center justify-between"><div className="h-2 w-16 rounded-full bg-[#d8d4cd]" /><div className="h-1.5 w-10 rounded-full bg-[#e5e1da]" /></div>
                          <div className="mb-3 h-1.5 w-12 rounded-full bg-[#eae7e1]" />
                          <div className="mb-2.5 h-[14px] w-20 rounded-[5px] bg-[#d4d0c8]" />
                          <div className="mb-2.5 h-px bg-[#eeebe5]" />
                          {[56, 40, 64, 36].map((w, i) => <div key={i} className="mb-1.5 flex justify-between"><div className="h-1.5 rounded-full bg-[#e5e1da]" style={{ width: w }} /><div className="h-1.5 w-9 rounded-full bg-[#e5e1da]" /></div>)}
                        </div>
                      </motion.div>
                      <motion.span className="absolute -right-1 -top-2 text-[#62aef0]" animate={shouldReduceMotion ? { opacity: 0.7 } : { opacity: [0.3, 1, 0.3], scale: [0.88, 1.15, 0.88] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}>
                        <Sparkles size={15} strokeWidth={1.8} />
                      </motion.span>
                    </div>
                    <div className="mt-5 flex flex-col items-center">
                      <motion.p className="text-[14px] font-semibold tracking-[-0.1px]" animate={{ color: isDragOver ? "#0075de" : "#2c2b29" }} transition={{ duration: 0.2 }}>
                        {isDragOver ? "Release to add" : "Drop PDF here"}
                      </motion.p>
                      <p className="mt-1 text-[12px] text-[#b5b0aa]">PDF only · AI will process the task</p>
                    </div>
                  </div>
                  <AnimatePresence>
                    {isDragOver && (
                      <motion.div className="pointer-events-none absolute inset-3 rounded-[12px] border-2 border-dashed border-[#0075de]/50" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.2, ease }} />
                    )}
                  </AnimatePresence>
                </div>
              )}

              <AnimatePresence>
                {hasFiles && (
                  <motion.div key="filelist" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-4 flex flex-col gap-2">
                    <AnimatePresence initial={false}>
                      {files.map((file, i) => {
                        const fe = getFileExt(file);
                        return (
                          <motion.div key={`${file.name}-${i}`} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.2, ease }} className="flex items-center gap-3 rounded-[10px] border border-[#e6e6e6] bg-white px-3 py-2.5">
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-[7px] text-[10px] font-bold tracking-wide" style={{ background: fe.bg, color: fe.color }}>{fe.ext}</span>
                            <span className="min-w-0 flex-1">
                              <p className="truncate text-[13px] font-medium leading-5 text-[#31302e]">{file.name}</p>
                              <p className="flex items-center gap-1 text-[11px] leading-4 text-[#a39e98]"><span className="size-[5px] rounded-full bg-[#1aae39]" />Ready · {formatBytes(file.size)}</p>
                            </span>
                            <button type="button" onClick={(e) => { e.stopPropagation(); removeFile(i); }} className="flex size-6 shrink-0 items-center justify-center rounded-[6px] text-[#c9c4be] outline-none transition-colors duration-75 hover:bg-[#f6f5f4] hover:text-[#5f5e59]">
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
                  <motion.button key="upload-btn" type="button" onClick={handleUpload} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15, ease }} className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[10px] bg-[#0075de] px-4 text-[14px] font-medium text-white shadow-[0_1px_2px_rgba(0,117,222,0.22),_0_0_0_1px_rgba(0,117,222,0.12)] outline-none transition-all duration-75 hover:bg-[#005bab] active:scale-[0.99]">
                    <Sparkles size={14} strokeWidth={1.8} aria-hidden="true" />
                    Upload {files.length} {files.length === 1 ? "file" : "files"}
                  </motion.button>
                ) : (
                  <motion.div key="sources" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15, ease }}>
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-[10px] bg-[#2783DE] text-[13px] font-medium text-white shadow-[0_1px_1px_rgba(39,131,222,0.16)] outline-none transition-colors duration-75 hover:bg-[#1f76c9]">
                      <FolderOpen size={14} strokeWidth={1.8} />Choose file
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
      <input ref={fileInputRef} type="file" multiple accept=".pdf" className="hidden" onChange={(e) => addFiles(e.target.files)} />
    </div>
  );
}

type Status = "queued" | "investigating" | "extracting" | "verifying" | "exporting" | "completed" | "failed" | "timeout";

interface Task {
  id: string;
  name: string;
  user: string;
  status: Status;
  createdAt: string;
}

const tasks: Task[] = [
  { id: "TASK-0001", name: "Reconcile June bank statements",   user: "Alice Tan",  status: "completed",    createdAt: "01 Jun 2026" },
  { id: "TASK-0002", name: "Prepare monthly payroll report",   user: "Carol Wong", status: "extracting",   createdAt: "02 Jun 2026" },
  { id: "TASK-0003", name: "Review outstanding invoices",      user: "David Ng",   status: "queued",       createdAt: "03 Jun 2026" },
  { id: "TASK-0004", name: "Submit SST filing for May",        user: "Alice Tan",  status: "completed",    createdAt: "04 Jun 2026" },
  { id: "TASK-0005", name: "Update fixed asset register",      user: "Frank Yap",  status: "verifying",    createdAt: "05 Jun 2026" },
  { id: "TASK-0006", name: "Audit petty cash fund",            user: "Carol Wong", status: "investigating", createdAt: "06 Jun 2026" },
  { id: "TASK-0007", name: "Prepare board financial summary",  user: "Eve Loh",    status: "exporting",    createdAt: "07 Jun 2026" },
  { id: "TASK-0008", name: "Review accounts payable aging",    user: "Bob Lim",    status: "failed",       createdAt: "08 Jun 2026" },
  { id: "TASK-0009", name: "Close Q2 journal entries",         user: "Alice Tan",  status: "timeout",      createdAt: "09 Jun 2026" },
  { id: "TASK-0010", name: "Verify EPF & SOCSO contributions", user: "David Ng",   status: "completed",    createdAt: "10 Jun 2026" },
  { id: "TASK-0011", name: "Prepare cash flow forecast",       user: "Eve Loh",    status: "queued",       createdAt: "11 Jun 2026" },
  { id: "TASK-0012", name: "Review vendor payment terms",      user: "Frank Yap",  status: "verifying",    createdAt: "12 Jun 2026" },
];

type SortKey = "id" | "name" | "status" | "createdAt";
type SortDir = "asc" | "desc";
type StatusFilter = "all" | Status;

const statusConfig: Record<Status, { bg: string; text: string; dot: string }> = {
  queued:        { bg: "bg-[#f5f5f4]",  text: "text-[#57534e]", dot: "#a8a29e" },
  investigating: { bg: "bg-[#eff6ff]",  text: "text-[#1d4ed8]", dot: "#93c5fd" },
  extracting:    { bg: "bg-[#f5f3ff]",  text: "text-[#6d28d9]", dot: "#a78bfa" },
  verifying:     { bg: "bg-[#fff7ed]",  text: "text-[#9a3412]", dot: "#fdba74" },
  exporting:     { bg: "bg-[#ecfdf5]",  text: "text-[#065f46]", dot: "#6ee7b7" },
  completed:     { bg: "bg-[#e9f7ef]",  text: "text-[#1f7a4d]", dot: "#4ade80" },
  failed:        { bg: "bg-[#fef2f2]",  text: "text-[#b91c1c]", dot: "#f87171" },
  timeout:       { bg: "bg-[#fff7ed]",  text: "text-[#b45309]", dot: "#fcd34d" },
};

const statusOptions: { key: StatusFilter; label: string }[] = [
  { key: "all",          label: "All statuses"  },
  { key: "queued",       label: "Queued"        },
  { key: "investigating",label: "Investigating" },
  { key: "extracting",   label: "Extracting"    },
  { key: "verifying",    label: "Verifying"     },
  { key: "exporting",    label: "Exporting"     },
  { key: "completed",    label: "Completed"     },
  { key: "failed",       label: "Failed"        },
  { key: "timeout",      label: "Timeout"       },
];

const sortOptions: { key: SortKey; label: string; helper: string }[] = [
  { key: "createdAt", label: "Created At",  helper: "Newest first" },
  { key: "id",        label: "Task ID",     helper: "Alphabetically" },
  { key: "name",      label: "Task Name",   helper: "A → Z" },
  { key: "status",    label: "Status",      helper: "Alphabetically" },
];

function StatusPill({ status }: { status: Status }) {
  const { bg, text, dot } = statusConfig[status];
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span className={`inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-[6px] px-2 text-[13px] font-medium leading-5 max-xl:gap-1 max-xl:px-1.5 max-xl:text-[12px] ${bg} ${text}`}>
      <span className="size-1.5 shrink-0 rounded-full" style={{ background: dot }} />
      {label}
    </span>
  );
}

const agentColors: Record<string, string> = {
  "Alice Tan":  "bg-[#d93025] text-white",
  "Carol Wong": "bg-[#0f9d58] text-white",
  "David Ng":   "bg-[#1a73e8] text-white",
  "Frank Yap":  "bg-[#7c3aed] text-white",
  "Eve Loh":    "bg-[#f4511e] text-white",
  "Bob Lim":    "bg-[#0f766e] text-white",
};

function UserCell({ user }: { user: string }) {
  const initial = user.split(" ").filter(Boolean)[0]?.[0]?.toUpperCase() ?? "?";
  const avatarCls = agentColors[user] ?? "bg-[#5f6368] text-white";
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-[#f1f0ee] px-1.5 py-0.5 text-[14px] font-medium leading-5 text-[#5f5e59]">
      <span className={`flex size-4 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold ${avatarCls}`}>
        {initial}
      </span>
      <span className="truncate font-semibold text-[#5f5e59]">{user}</span>
    </span>
  );
}

export default function BankStatementPage() {
  const [isSidebarOpen, setIsSidebarOpen]   = useState(false);
  const [isDrawerOpen, setIsDrawerOpen]     = useState(false);
  const [sortKey, setSortKey]               = useState<SortKey>("createdAt");
  const [sortDir, setSortDir]               = useState<SortDir>("desc");
  const [statusFilter, setStatusFilter]     = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery]       = useState("");
  const [isSortOpen, setIsSortOpen]         = useState(false);
  const [isStatusOpen, setIsStatusOpen]     = useState(false);

  const sortRef   = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const filtered = tasks
    .filter((t) => statusFilter === "all" || t.status === statusFilter)
    .filter((t) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return t.id.toLowerCase().includes(q) || t.name.toLowerCase().includes(q) || t.user.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      const cmp = typeof av === "string" ? av.localeCompare(bv as string) : 0;
      return sortDir === "desc" ? -cmp : cmp;
    });

  function toggleSort(key: SortKey) {
    if (key === sortKey) { setSortDir((d) => d === "asc" ? "desc" : "asc"); return; }
    setSortKey(key);
    setSortDir("asc");
  }

  useEffect(() => {
    function onPointer(e: PointerEvent) {
      const t = e.target as Node;
      if (!sortRef.current?.contains(t))   setIsSortOpen(false);
      if (!statusRef.current?.contains(t)) setIsStatusOpen(false);
    }
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, []);

  const dropdownClass = "absolute left-0 top-9 z-20 w-[200px] origin-top-left rounded-[10px] border border-[#e6e6e6] bg-white p-1 shadow-[0_12px_28px_rgba(15,15,15,0.11)]";
  const dropdownMotion = { animate: { opacity: 1, y: 0 }, initial: { opacity: 0, y: shouldReduceMotion ? 0 : -6 }, exit: { opacity: 0, y: shouldReduceMotion ? 0 : -4 }, transition: { duration: shouldReduceMotion ? 0 : 0.16, ease: [0.16, 1, 0.3, 1] as const } };

  return (
    <div className="dashboard-shell min-h-screen bg-white md:flex">
      <DashboardSidebar activeItem="bank-statement" isMobileOpen={isSidebarOpen} onMobileClose={() => setIsSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 overflow-hidden">
      <main className="min-w-0 flex-1 overflow-y-auto bg-white text-[#2c2c2b]">
        <section className="flex min-h-screen flex-col">

          {/* Header */}
          <header className="flex h-[var(--dashboard-header-h)] items-center justify-between border-b border-[#e6e6e6] px-[var(--dashboard-main-x)]">
            <div className="flex min-w-0 items-center gap-2">
              <button type="button" aria-label="Open navigation" onClick={() => setIsSidebarOpen(true)} className="flex size-7 shrink-0 items-center justify-center rounded-[7px] text-[#6f6a64] outline-none transition-colors duration-75 hover:bg-[#ededee] hover:text-[#2c2c2b] xl:hidden">
                <Menu size={18} strokeWidth={1.8} aria-hidden="true" />
              </button>
              <h1 className="truncate text-[20px] font-semibold leading-7 tracking-[-0.125px] text-[#2c2c2b]">Bank Statement</h1>
              <div className="group relative flex shrink-0 items-center">
                <button type="button" aria-label="About Bank Statement" className="flex items-center justify-center text-[#c9c4bf] outline-none transition-colors duration-75 hover:text-[#8f8983]">
                  <Info size={15} strokeWidth={1.7} aria-hidden="true" />
                </button>
                <div className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 w-max max-w-[220px] -translate-x-1/2 rounded-[8px] bg-[#2c2c2b] px-3 py-2 text-[12px] leading-[1.45] text-white opacity-0 shadow-[0_4px_16px_rgba(15,15,15,0.18)] transition-opacity duration-150 group-hover:opacity-100">
                  Track and manage accounting tasks across your team.
                  <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-[#2c2c2b]" />
                </div>
              </div>
            </div>
            <div aria-hidden="true" />
          </header>

          {/* Create row */}
          <div className="relative flex h-[var(--dashboard-toolbar-h)] items-center justify-end px-[var(--dashboard-main-x)]">
            <span className="pointer-events-none absolute bottom-0 left-[var(--dashboard-main-x)] right-[var(--dashboard-main-x)] h-px bg-[#e6e6e6]" aria-hidden="true" />
            <button
              type="button"
              className={`inline-flex h-7 items-center gap-1.5 rounded-[7px] px-2.5 text-[13px] font-medium leading-5 text-white outline-none shadow-[0_1px_1px_rgba(39,131,222,0.16)] transition-colors duration-75 ${isDrawerOpen ? "bg-[#e8453c] hover:bg-[#d63c34]" : "bg-[#2783DE] hover:bg-[#1f76c9]"}`}
              onClick={() => setIsDrawerOpen((o) => !o)}
            >
              {isDrawerOpen ? <X size={13} strokeWidth={2} aria-hidden="true" /> : <Plus size={13} strokeWidth={1.9} aria-hidden="true" />}
              {isDrawerOpen ? "Dismiss" : "Create task"}
            </button>
          </div>

          {/* Search + filter toolbar */}
          <div className="relative flex h-[var(--dashboard-toolbar-h)] items-center gap-2 px-[var(--dashboard-main-x)]">
            <span className="pointer-events-none absolute bottom-0 left-[var(--dashboard-main-x)] right-[var(--dashboard-main-x)] h-px bg-[#e6e6e6]" aria-hidden="true" />
            <label className="relative w-[var(--dashboard-toolbar-search-w)] max-w-[42vw] shrink">
              <span className="sr-only">Search tasks</span>
              <Search size={14} strokeWidth={1.8} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8f8983]" />
              <input type="search" placeholder="Search tasks..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-8 w-full rounded-[7px] border border-[#e6e6e6] bg-white pl-8.5 pr-2 text-[14px] leading-5 text-[#2c2c2b] outline-none transition-colors duration-75 placeholder:text-[#a39e98] focus:border-[#0075de] focus:ring-2 focus:ring-[#62aef0]/20" />
            </label>

            {/* Sort */}
            <div ref={sortRef} className="relative">
              <button type="button" onClick={() => setIsSortOpen((o) => !o)} className="inline-flex h-8 items-center gap-1.5 rounded-[7px] border border-[#e6e6e6] bg-white px-3 text-[14px] font-medium text-[#2c2c2b] outline-none transition-colors duration-75 hover:bg-[#f7f7f8]">
                <ListFilter size={13} strokeWidth={1.8} aria-hidden="true" />
                Sort
              </button>
              <AnimatePresence>
                {isSortOpen && (
                  <motion.div role="menu" className={dropdownClass} {...dropdownMotion}>
                    {sortOptions.map((o) => (
                      <button key={o.key} type="button" role="menuitem" onClick={() => { toggleSort(o.key); setIsSortOpen(false); }} className="flex min-h-9 w-full items-center justify-between gap-3 rounded-[7px] px-2 text-left outline-none transition-colors duration-75 hover:bg-[#f6f5f4]">
                        <span>
                          <span className="block text-[13px] font-medium text-[#2c2c2b]">{o.label}</span>
                          <span className="block text-[11px] text-[#8f8983]">{o.helper}</span>
                        </span>
                        {sortKey === o.key && <Check size={13} strokeWidth={2} className="shrink-0 text-[#0075de]" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Status filter */}
            <div ref={statusRef} className="relative">
              <button type="button" onClick={() => setIsStatusOpen((o) => !o)} className="inline-flex h-8 items-center gap-1.5 rounded-[7px] border border-[#e6e6e6] bg-white px-3 text-[14px] font-medium text-[#2c2c2b] outline-none transition-colors duration-75 hover:bg-[#f7f7f8]">
                <Tag size={13} strokeWidth={1.8} aria-hidden="true" />
                Status
                {statusFilter !== "all" && (
                  <StatusPill status={statusFilter as Status} />
                )}
              </button>
              <AnimatePresence>
                {isStatusOpen && (
                  <motion.div role="menu" className={dropdownClass} {...dropdownMotion}>
                    {statusOptions.map((o) => (
                      <button key={o.key} type="button" role="menuitem" onClick={() => { setStatusFilter(o.key); setIsStatusOpen(false); }} className="flex min-h-9 w-full items-center justify-between gap-2 rounded-[7px] px-2 text-left outline-none transition-colors duration-75 hover:bg-[#f6f5f4]">
                        <span className="flex items-center gap-2">
                          {o.key !== "all" && (
                            <span className="size-1.5 rounded-full shrink-0" style={{ background: statusConfig[o.key as Status].dot }} />
                          )}
                          <span className="text-[13px] font-medium text-[#2c2c2b]">{o.label}</span>
                        </span>
                        {statusFilter === o.key && <Check size={13} strokeWidth={2} className="shrink-0 text-[#0075de]" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button type="button" aria-label="Add filter" className="flex size-7 items-center justify-center rounded-[7px] border border-dashed border-[#dedbd7] text-[#8f8983] outline-none transition-colors duration-75 hover:bg-[#f7f7f8] hover:text-[#2c2c2b]">
              <Plus size={14} strokeWidth={1.8} aria-hidden="true" />
            </button>

            <span className="ml-auto text-[12px] text-[#a39e98]">{filtered.length} task{filtered.length !== 1 ? "s" : ""}</span>
          </div>

          {/* Table */}
          <div className="min-h-0 flex-1 overflow-auto px-[var(--dashboard-main-x)]">
            <table className="w-full min-w-[760px] table-fixed border-separate border-spacing-0 text-left">
              <thead className="sticky top-0 z-10 bg-white">
                <tr>
                  {([
                    { label: "Task ID",    icon: Hash,      key: "id",        width: "w-[140px]" },
                    { label: "Task Name",  icon: ListFilter, key: "name",      width: "" },
                    { label: "Users",      icon: Users,     key: null,        width: "w-[180px]" },
                    { label: "Status",     icon: Circle,    key: "status",    width: "w-[140px]" },
                    { label: "Created At", icon: ListFilter, key: "createdAt", width: "w-[140px]" },
                    { label: "Action",     icon: Ellipsis,  key: null,        width: "w-[72px]" },
                  ] as const).map((col, ci, all) => {
                    const Icon = col.icon;
                    const isFirst = ci === 0;
                    const isLast  = ci === all.length - 1;
                    const pad     = isFirst ? "pl-0 pr-3" : isLast ? "pl-3 pr-0" : "px-3";
                    const sortable = col.key !== null;
                    const active   = sortable && col.key === sortKey;
                    return (
                      <th key={col.label} scope="col" className={`${col.width} h-[var(--dashboard-head-h)] border-b ${isLast ? "" : "border-r"} border-[#e6e6e6] ${pad} text-[13px] font-medium text-[#2c2c2b] ${isLast ? "text-right" : ""}`}>
                        {sortable ? (
                          <button type="button" onClick={() => toggleSort(col.key as SortKey)} className="flex items-center gap-1.5 outline-none hover:text-[#2c2c2b]">
                            <Icon size={13} strokeWidth={1.75} aria-hidden="true" />
                            {col.label}
                            {active
                              ? sortDir === "asc"
                                ? <ChevronUp size={11} strokeWidth={2} className="text-[#0075de]" />
                                : <ChevronDown size={11} strokeWidth={2} className="text-[#0075de]" />
                              : <ArrowUpDown size={10} strokeWidth={1.9} className="text-[#2c2c2b]/40" />}
                          </button>
                        ) : (
                          <span className={`flex items-center gap-1.5 ${isLast ? "justify-end" : ""}`}>
                            <Icon size={13} strokeWidth={1.75} aria-hidden="true" />
                            {col.label}
                          </span>
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {filtered.map((task, i) => (
                  <motion.tr
                    key={task.id}
                    className="group h-[var(--dashboard-row-h)] bg-white transition-colors duration-75 hover:bg-[#f7f7f8]"
                    initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: shouldReduceMotion ? 0 : i * 0.03, duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <td className="border-b border-r border-[#f0efed] pr-3">
                      <span className="text-[12px] font-mono text-[#8f8983]">{task.id}</span>
                    </td>
                    <td className="border-b border-r border-[#f0efed] px-3">
                      <span className="truncate text-[14px] font-medium text-[#31302e]">{task.name}</span>
                    </td>
                    <td className="border-b border-r border-[#f0efed] px-3">
                      <UserCell user={task.user} />
                    </td>
                    <td className="border-b border-r border-[#f0efed] px-3">
                      <StatusPill status={task.status} />
                    </td>
                    <td className="border-b border-r border-[#f0efed] px-3">
                      <span className="text-[13px] text-[#8f8983]">{task.createdAt}</span>
                    </td>
                    <td className="border-b border-[#f0efed] pl-3 text-right">
                      <button type="button" aria-label={`Actions for ${task.id}`} className="inline-flex size-7 items-center justify-center rounded-[7px] text-[#8f8983] outline-none transition-colors duration-75 hover:bg-[#ededee] hover:text-[#2c2c2b]">
                        <Ellipsis size={15} strokeWidth={1.9} aria-hidden="true" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="border-b border-[#f0efed] py-16 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Circle size={32} strokeWidth={1.4} className="text-[#d1d0ce]" />
                        <p className="text-[14px] font-medium text-[#a39e98]">No tasks found</p>
                        <p className="text-[12px] text-[#c5c0bb]">Try adjusting your search or filters</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </section>
      </main>

      <AnimatePresence>
        {isDrawerOpen && (
          <motion.aside
            key="upload-aside"
            className="relative shrink-0 overflow-hidden border-l border-[#e6e6e6] bg-white"
            style={{ height: "100vh", position: "sticky", top: 0 }}
            initial={{ width: 0 }}
            animate={{ width: 440 }}
            exit={{ width: 0 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex h-full w-[440px] flex-col">
              <UploadDrawer onClose={() => setIsDrawerOpen(false)} />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      </div>
    </div>
  );
}
