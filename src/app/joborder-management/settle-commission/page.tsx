"use client";

import { DashboardSidebar } from "@/components/sidebar";
import {
  AlertCircle,
  BadgeCheck,
  CalendarDays,
  Check,
  CheckCheck,
  CheckCircle2,
  ChevronRight,
  Circle,
  ClipboardCheck,
  Clock3,
  Droplets,
  Hammer,
  Info,
  Menu,
  Minus,
  Monitor,
  Package,
  Plus,
  Search,
  Shield,
  Sparkles,
  Thermometer,
  Wheat,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import React, { useState, useMemo } from "react";

/* ─── Data ─── */
const ALL_JOBS = [
  { jobNo: "JO-2026-0001", customer: "Parkway Mall Sdn Bhd",           serviceDate: "12 Jun 2026", status: "In Progress", agent: "Ahmad Farid",      serviceCategory: "HVAC",         commision: 320 },
  { jobNo: "JO-2026-0002", customer: "TechCore Solutions Sdn Bhd",     serviceDate: "11 Jun 2026", status: "Completed",   agent: "Wong Yi Thong",    serviceCategory: "IT Support",   commision: 180 },
  { jobNo: "JO-2026-0003", customer: "Sunrise Residence",              serviceDate: "10 Jun 2026", status: "Pending",     agent: "Raj Kumar",        serviceCategory: "Electrical",   commision: 210 },
  { jobNo: "JO-2026-0004", customer: "Green Valley Café",              serviceDate: "10 Jun 2026", status: "Completed",   agent: "Sarah Lim",        serviceCategory: "Plumbing",     commision: 150 },
  { jobNo: "JO-2026-0005", customer: "Meridian Hotel Sdn Bhd",         serviceDate: "09 Jun 2026", status: "Cancelled",   agent: "Ahmad Farid",      serviceCategory: "Cleaning",     commision: 0   },
  { jobNo: "JO-2026-0006", customer: "Blueprint Architecture Sdn Bhd", serviceDate: "08 Jun 2026", status: "In Progress", agent: "Raj Kumar",        serviceCategory: "Carpentry",    commision: 480 },
  { jobNo: "JO-2026-0007", customer: "Maple Heights Condo",            serviceDate: "07 Jun 2026", status: "Pending",     agent: "Wong Yi Thong",    serviceCategory: "Pest Control", commision: 240 },
  { jobNo: "JO-2026-0008", customer: "FreshMart Superstore",           serviceDate: "06 Jun 2026", status: "Completed",   agent: "Sarah Lim",        serviceCategory: "Electrical",   commision: 175 },
  { jobNo: "JO-2026-0009", customer: "Sunrise Residence",              serviceDate: "05 Jun 2026", status: "Claimed",     agent: "Ahmad Farid",      serviceCategory: "Plumbing",     commision: 310 },
  { jobNo: "JO-2026-0010", customer: "TechCore Solutions Sdn Bhd",     serviceDate: "04 Jun 2026", status: "Settled",     agent: "Wong Yi Thong",    serviceCategory: "IT Support",   commision: 450 },
  { jobNo: "JO-2026-0011", customer: "Sunrise Residence",              serviceDate: "03 Jun 2026", status: "Completed",   agent: "David Tan",        serviceCategory: "HVAC",         commision: 390 },
  { jobNo: "JO-2026-0012", customer: "Parkway Mall Sdn Bhd",           serviceDate: "02 Jun 2026", status: "Pending",     agent: "Nurul Ain",        serviceCategory: "Cleaning",     commision: 120 },
  { jobNo: "JO-2026-0013", customer: "Green Valley Café",              serviceDate: "01 Jun 2026", status: "In Progress", agent: "Kevin Ooi",        serviceCategory: "Carpentry",    commision: 560 },
  { jobNo: "JO-2026-0014", customer: "Meridian Hotel Sdn Bhd",         serviceDate: "31 May 2026", status: "Claimed",     agent: "David Tan",        serviceCategory: "Mechanical",   commision: 275 },
  { jobNo: "JO-2026-0015", customer: "TechCore Solutions Sdn Bhd",     serviceDate: "30 May 2026", status: "Completed",   agent: "Nurul Ain",        serviceCategory: "IT Support",   commision: 195 },
  { jobNo: "JO-2026-0016", customer: "Blueprint Architecture Sdn Bhd", serviceDate: "29 May 2026", status: "Cancelled",   agent: "Kevin Ooi",        serviceCategory: "Electrical",   commision: 0   },
  { jobNo: "JO-2026-0017", customer: "FreshMart Superstore",           serviceDate: "28 May 2026", status: "Completed",   agent: "Priya Nair",       serviceCategory: "Pest Control", commision: 140 },
  { jobNo: "JO-2026-0018", customer: "Maple Heights Condo",            serviceDate: "27 May 2026", status: "In Progress", agent: "Marcus Chong",     serviceCategory: "Plumbing",     commision: 330 },
  { jobNo: "JO-2026-0019", customer: "Parkway Mall Sdn Bhd",           serviceDate: "26 May 2026", status: "Pending",     agent: "Priya Nair",       serviceCategory: "HVAC",         commision: 420 },
  { jobNo: "JO-2026-0020", customer: "Sunrise Residence",              serviceDate: "25 May 2026", status: "Completed",   agent: "Marcus Chong",     serviceCategory: "Carpentry",    commision: 260 },
];

const AGENTS = [
  { name: "Ahmad Farid",   color: "#0891b2" },
  { name: "Wong Yi Thong", color: "#1a73e8" },
  { name: "Raj Kumar",     color: "#7c3aed" },
  { name: "Sarah Lim",     color: "#db2777" },
  { name: "David Tan",     color: "#d97706" },
  { name: "Nurul Ain",     color: "#059669" },
  { name: "Kevin Ooi",     color: "#dc2626" },
  { name: "Priya Nair",    color: "#7c3aed" },
  { name: "Marcus Chong",  color: "#0369a1" },
  { name: "Lim Wei Jian",  color: "#65a30d" },
];

const CATEGORY_META: Record<string, { color: string; Icon: React.ElementType }> = {
  "HVAC":         { color: "#0891b2", Icon: Thermometer },
  "IT Support":   { color: "#7c3aed", Icon: Monitor    },
  "Electrical":   { color: "#ca8a04", Icon: Zap        },
  "Plumbing":     { color: "#2563eb", Icon: Droplets   },
  "Cleaning":     { color: "#16a34a", Icon: Sparkles   },
  "Carpentry":    { color: "#92400e", Icon: Hammer     },
  "Pest Control": { color: "#dc2626", Icon: Shield     },
  "Landscaping":  { color: "#65a30d", Icon: Wheat      },
  "Painting":     { color: "#9333ea", Icon: Package    },
  "Mechanical":   { color: "#475569", Icon: Wrench     },
};

const STATUS_META: Record<string, { cls: string; Icon: React.ElementType }> = {
  "Completed":   { cls: "bg-[#e9f7ef] text-[#1f7a4d]", Icon: CheckCircle2   },
  "In Progress": { cls: "bg-[#eff6ff] text-[#1d4ed8]", Icon: Clock3         },
  "Pending":     { cls: "bg-[#fff4db] text-[#9a6700]", Icon: AlertCircle    },
  "Claimed":     { cls: "bg-[#f5f3ff] text-[#6d28d9]", Icon: ClipboardCheck },
  "Settled":     { cls: "bg-[#eee0da] text-[#9f6b53]", Icon: BadgeCheck     },
  "Cancelled":   { cls: "bg-[#f1f0ee] text-[#5f5e59]", Icon: Circle         },
};

type Job = (typeof ALL_JOBS)[number];

function isSettleable(job: Job) {
  return job.commision > 0 && job.status !== "Settled" && job.status !== "Cancelled";
}

function getInitials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

function getAgentStats(agentName: string) {
  const jobs = ALL_JOBS.filter(j => j.agent === agentName);
  const unsettled = jobs.filter(isSettleable);
  return {
    total: jobs.length,
    unsettledCount: unsettled.length,
    unsettledAmt: unsettled.reduce((s, j) => s + j.commision, 0),
  };
}

/* ─── Sub-components ─── */
function StatusPill({ status }: Readonly<{ status: string }>) {
  const meta = STATUS_META[status] ?? STATUS_META["Cancelled"];
  const { cls, Icon } = meta;
  return (
    <span className={`inline-flex h-[22px] items-center gap-[5px] whitespace-nowrap rounded-[5px] px-[7px] text-[11px] font-medium ${cls}`}>
      <Icon size={10} strokeWidth={2.2} aria-hidden="true" />
      {status}
    </span>
  );
}

function CommPill({ value }: Readonly<{ value: number }>) {
  if (value === 0) return <span className="text-[13px] text-[#d0ceca]">—</span>;
  const cls =
    value >= 400 ? "bg-[#e9f7ef] text-[#1f7a4d]"
    : value >= 200 ? "bg-[#fff4db] text-[#8a5a00]"
    : "bg-[#f1f0ee] text-[#5f5e59]";
  return (
    <span className={`inline-flex h-[22px] items-center whitespace-nowrap rounded-[5px] px-[7px] text-[12px] font-medium tabular-nums ${cls}`}>
      RM {value.toFixed(2)}
    </span>
  );
}

/* ─── Page ─── */
export default function SettleCommissionPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(AGENTS[0].name);
  const [agentSearch, setAgentSearch]     = useState("");
  const [selectedNos, setSelectedNos]     = useState<Set<string>>(new Set());
  const [settledState, setSettledState]   = useState(false);

  const shouldReduceMotion = useReducedMotion();
  const fu = (delay: number) => ({
    initial:    { opacity: 0, y: shouldReduceMotion ? 0 : -14 },
    animate:    { opacity: 1, y: 0 },
    transition: { delay: shouldReduceMotion ? 0 : delay, duration: 0.32, ease: [0.22, 1, 0.36, 1] as const },
  });

  const filteredAgents = useMemo(
    () => AGENTS.filter(a => a.name.toLowerCase().includes(agentSearch.toLowerCase())),
    [agentSearch],
  );

  const agentMeta    = AGENTS.find(a => a.name === selectedAgent)!;
  const agentJobs    = ALL_JOBS.filter(j => j.agent === selectedAgent);
  const available    = agentJobs.filter(j => isSettleable(j) && !selectedNos.has(j.jobNo));
  const selectedJobs = agentJobs.filter(j => selectedNos.has(j.jobNo));
  const totalCommission = selectedJobs.reduce((s, j) => s + j.commision, 0);

  function toggleJob(jobNo: string) {
    setSelectedNos(prev => {
      const next = new Set(prev);
      next.has(jobNo) ? next.delete(jobNo) : next.add(jobNo);
      return next;
    });
  }

  function selectAgent(name: string) {
    setSelectedAgent(name);
    setSelectedNos(new Set());
  }

  function addAllAvailable() {
    setSelectedNos(prev => new Set([...prev, ...available.map(j => j.jobNo)]));
  }

  function handleSettle() {
    if (selectedJobs.length === 0) return;
    setSettledState(true);
    setTimeout(() => { setSelectedNos(new Set()); setSettledState(false); }, 2200);
  }

  return (
    <div className="dashboard-shell bg-white md:flex" style={{ height: "100dvh" }}>
      <DashboardSidebar
        activeItem="joborder-management"
        isMobileOpen={isSidebarOpen}
        onMobileClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">

        {/* ── Header ── */}
        <header className="flex h-[var(--dashboard-header-h)] shrink-0 items-center justify-between border-b border-[#e6e6e6] bg-white px-[var(--dashboard-main-x)]">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              aria-label="Open navigation"
              onClick={() => setIsSidebarOpen(true)}
              className="flex size-7 shrink-0 items-center justify-center rounded-[7px] text-[#6f6a64] outline-none transition-colors duration-75 hover:bg-[#ededee] hover:text-[#2c2c2b] xl:hidden"
            >
              <Menu size={18} strokeWidth={1.8} aria-hidden="true" />
            </button>
            <nav className="flex items-center gap-1.5" aria-label="Breadcrumb">
              <Link
                href="/joborder-management"
                className="text-[13px] text-[#9b9a97] outline-none transition-colors duration-75 hover:text-[#37352f]"
              >
                Joborder Management
              </Link>
              <ChevronRight size={12} strokeWidth={1.8} className="text-[#c4c2be]" aria-hidden="true" />
              <span className="text-[13px] font-semibold text-[#37352f]">Settle Commission</span>
            </nav>
          </div>
          <div className="group relative">
            <button type="button" className="flex items-center justify-center text-[#c4c2be] outline-none transition-colors duration-75 hover:text-[#8f8983]">
              <Info size={15} strokeWidth={1.7} aria-hidden="true" />
            </button>
            <div className="pointer-events-none absolute right-0 top-full z-30 mt-2 w-[220px] rounded-[8px] bg-[#2c2c2b] px-3 py-2 text-[12px] leading-[1.5] text-white opacity-0 shadow-[0_4px_16px_rgba(15,15,15,0.18)] transition-opacity duration-150 group-hover:opacity-100">
              Select a technician, pick jobs to settle, then confirm the payout.
              <span className="absolute -top-1 right-4 h-2 w-2 rotate-45 bg-[#2c2c2b]" aria-hidden="true" />
            </div>
          </div>
        </header>

        {/* ── 3-column body ── */}
        <div className="flex min-h-0 flex-1 overflow-hidden">

          {/* ── Col 1: Agent list ── */}
          <motion.div {...fu(0.04)} className="flex w-[220px] shrink-0 flex-col border-r border-[#e6e6e6] bg-[#fbfaf9]">

            {/* Search */}
            <div className="flex h-[var(--dashboard-toolbar-h)] shrink-0 items-center border-b border-[#e6e6e6] px-2.5">
              <label className="relative flex items-center">
                <Search size={13} strokeWidth={1.8} className="pointer-events-none absolute left-2.5 text-[#a8a49f]" aria-hidden="true" />
                <input
                  type="search"
                  placeholder="Search technician..."
                  value={agentSearch}
                  onChange={e => setAgentSearch(e.target.value)}
                  className="h-8 w-full rounded-[7px] border border-transparent bg-[#f1f0ee] pl-8 pr-2.5 text-[13px] text-[#37352f] outline-none placeholder:text-[#c4c2be] focus:border-[#d4d0cb] focus:bg-white transition-colors duration-75"
                />
              </label>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto py-1">
              {filteredAgents.length === 0 ? (
                <p className="px-3 py-6 text-center text-[12px] text-[#b8b4af]">No technician found</p>
              ) : (
                filteredAgents.map((agent, idx) => {
                  const stats    = getAgentStats(agent.name);
                  const isActive = selectedAgent === agent.name;
                  return (
                    <motion.button
                      key={agent.name}
                      type="button"
                      onClick={() => selectAgent(agent.name)}
                      initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: shouldReduceMotion ? 0 : idx * 0.05, duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                      className={`flex w-full items-center gap-2.5 px-3 py-2 text-left outline-none transition-colors duration-75 ${
                        isActive ? "bg-white" : "hover:bg-[#f1f0ee]"
                      }`}
                    >

                      {/* Avatar */}
                      <span
                        className="flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                        style={{ background: agent.color }}
                      >
                        {getInitials(agent.name)}
                      </span>

                      {/* Name + stats */}
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className={`truncate text-[13px] font-medium leading-[18px] ${isActive ? "text-[#37352f]" : "text-[#5f5e59]"}`}>
                          {agent.name}
                        </span>
                        <div className="flex items-center gap-1">
                          {stats.unsettledCount > 0 ? (
                            <>
                              <span className="text-[11px] tabular-nums text-[#9b9a97]">
                                RM {stats.unsettledAmt.toFixed(0)}
                              </span>
                              <span className="text-[10px] text-[#d0ceca]">·</span>
                              <span className="text-[11px] text-[#b8b4af]">{stats.unsettledCount} jobs</span>
                            </>
                          ) : (
                            <span className="text-[11px] text-[#c4c2be]">All settled</span>
                          )}
                        </div>
                      </div>

                      {/* Unsettled dot */}
                      {stats.unsettledCount > 0 && (
                        <span className="flex size-[18px] shrink-0 items-center justify-center rounded-full bg-[#f1f0ee] text-[10px] font-semibold text-[#787774]">
                          {stats.unsettledCount}
                        </span>
                      )}
                    </motion.button>
                  );
                })
              )}
            </div>

          </motion.div>

          {/* ── Col 2: Job table ── */}
          <motion.div {...fu(0.10)} className="flex min-w-0 flex-1 flex-col overflow-hidden">

            {/* Subheader */}
            <div className="flex h-[var(--dashboard-toolbar-h)] shrink-0 items-center gap-2 border-b border-[#e6e6e6] bg-white px-5">
              <span
                className="flex size-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white"
                style={{ background: agentMeta.color }}
                aria-hidden="true"
              >
                {getInitials(agentMeta.name)}
              </span>
              <span className="text-[13px] font-semibold text-[#37352f]">{agentMeta.name}</span>
              <span className="rounded-[5px] bg-[#f1f0ee] px-[7px] py-0.5 text-[11px] font-medium text-[#787774]">
                {agentJobs.length} jobs
              </span>
              {available.length > 0 && (
                <button
                  type="button"
                  onClick={addAllAvailable}
                  className="ml-auto text-[12px] font-medium text-[#2383e2] outline-none transition-colors duration-75 hover:text-[#1a73d4] hover:underline underline-offset-2"
                >
                  Add all ({available.length})
                </button>
              )}
            </div>

            {/* Table */}
            <div className="flex-1 overflow-y-auto">
              {agentJobs.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <div className="relative size-[52px]">
                    <div className="size-full rounded-full border-2 border-dashed border-[#d1d5db]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Wrench size={16} strokeWidth={1.8} className="text-[#9ca3af]" aria-hidden="true" />
                    </div>
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-[#374151]">No jobs assigned</p>
                    <p className="mt-1 text-[12px] leading-relaxed text-[#9ca3af]">This technician has no<br />job orders yet</p>
                  </div>
                </div>
              ) : (
                <table className="w-full min-w-[540px] border-separate border-spacing-0">
                  <thead className="sticky top-0 z-10 bg-white">
                    <tr>
                      {(["Job No","Service Date","Service Category","Status","Commission"] as const).map((label, i) => (
                        <th key={label} className={`h-[var(--dashboard-head-h)] border-b border-[#e6e6e6] text-left text-[11px] font-semibold uppercase tracking-[0.3px] text-[#a8a49f] ${["pl-5 pr-3 w-[140px]","px-3 w-[145px]","px-3","px-3 w-[124px]","px-3 w-[116px]"][i]}`}>
                          {label}
                        </th>
                      ))}
                      <th className="h-[var(--dashboard-head-h)] border-b border-[#e6e6e6] pl-3 pr-5 w-[48px]">
                        {(() => {
                          const settleable = agentJobs.filter(isSettleable);
                          const allSel  = settleable.length > 0 && settleable.every(j => selectedNos.has(j.jobNo));
                          const someSel = !allSel && settleable.some(j => selectedNos.has(j.jobNo));
                          function toggleAll() {
                            if (allSel) setSelectedNos(new Set());
                            else setSelectedNos(prev => new Set([...prev, ...settleable.map(j => j.jobNo)]));
                          }
                          return settleable.length > 0 ? (
                            <button
                              type="button"
                              onClick={toggleAll}
                              aria-label={allSel ? "Deselect all" : "Select all"}
                              className={`inline-flex size-[20px] items-center justify-center rounded-[5px] outline-none transition-all duration-75 ${
                                allSel || someSel
                                  ? "bg-[#2383e2] text-white hover:bg-[#1a73d4]"
                                  : "border border-[#e0deda] text-[#9b9a97] hover:border-[#2383e2] hover:bg-[#f0f7ff] hover:text-[#2383e2]"
                              }`}
                            >
                              {allSel || someSel
                                ? <Minus size={10} strokeWidth={2} aria-hidden="true" />
                                : <Plus  size={10} strokeWidth={2} aria-hidden="true" />}
                            </button>
                          ) : null;
                        })()}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {agentJobs.map((job, rowIdx) => {
                      const catMeta    = CATEGORY_META[job.serviceCategory] ?? { color: "#615d59", Icon: Wrench };
                      const CatIcon    = catMeta.Icon;
                      const settleable = isSettleable(job);
                      const sel        = selectedNos.has(job.jobNo);
                      const dim        = !settleable && !sel;

                      return (
                        <motion.tr
                          key={job.jobNo}
                          initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: shouldReduceMotion ? 0 : rowIdx * 0.05, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                          className={`h-[var(--dashboard-row-h)] transition-colors duration-75 ${
                            sel  ? "bg-[#f0f7ff]"
                            : dim ? "bg-white opacity-40"
                            :       "bg-white hover:bg-[#f7f7f8]"
                          }`}
                        >
                          <td className="border-b border-[#f0efed] pl-5 pr-3">
                            <span className={`text-[13px] font-medium ${sel ? "text-[#1a73d4]" : "text-[#37352f]"}`}>
                              {job.jobNo}
                            </span>
                          </td>
                          <td className="border-b border-[#f0efed] px-3">
                            <span className="inline-flex h-[22px] items-center gap-1 whitespace-nowrap rounded-[5px] bg-[#f1f0ee] px-[7px] text-[11px] font-medium text-[#787774]">
                              <CalendarDays size={10} strokeWidth={1.8} aria-hidden="true" />
                              {job.serviceDate}
                            </span>
                          </td>
                          <td className="border-b border-[#f0efed] px-3">
                            <span className="inline-flex items-center gap-1.5">
                              <CatIcon size={13} strokeWidth={1.9} style={{ color: catMeta.color }} aria-hidden="true" />
                              <span className="text-[13px] text-[#37352f]">{job.serviceCategory}</span>
                            </span>
                          </td>
                          <td className="border-b border-[#f0efed] px-3">
                            <StatusPill status={job.status} />
                          </td>
                          <td className="border-b border-[#f0efed] px-3">
                            <CommPill value={job.commision} />
                          </td>
                          <td className="border-b border-[#f0efed] pl-3 pr-5">
                            {settleable && (
                              <button
                                type="button"
                                onClick={() => toggleJob(job.jobNo)}
                                aria-label={sel ? `Remove ${job.jobNo}` : `Add ${job.jobNo}`}
                                className={`inline-flex size-[20px] items-center justify-center rounded-[5px] outline-none transition-all duration-75 ${
                                  sel
                                    ? "bg-[#2383e2] text-white hover:bg-[#1a73d4]"
                                    : "border border-[#e0deda] text-[#9b9a97] hover:border-[#2383e2] hover:bg-[#f0f7ff] hover:text-[#2383e2]"
                                }`}
                              >
                                {sel
                                  ? <Minus size={10} strokeWidth={2} aria-hidden="true" />
                                  : <Plus  size={10} strokeWidth={2} aria-hidden="true" />}
                              </button>
                            )}
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

          </motion.div>

          {/* ── Col 3: Settlement panel ── */}
          <motion.div {...fu(0.16)} className="flex w-[260px] shrink-0 flex-col border-l border-[#e6e6e6] bg-[#fbfaf9]">

            {/* Panel header */}
            <div className="flex h-[var(--dashboard-toolbar-h)] shrink-0 items-center justify-between border-b border-[#e6e6e6] px-4">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-[#37352f]">To Settle</span>
                {selectedJobs.length > 0 && (
                  <span className="rounded-[5px] bg-[#2383e2]/10 px-[7px] py-0.5 text-[11px] font-bold text-[#2383e2]">
                    {selectedJobs.length}
                  </span>
                )}
              </div>
              {selectedJobs.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedNos(new Set())}
                  className="text-[11px] font-medium text-[#9b9a97] outline-none transition-colors duration-75 hover:text-[#37352f]"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Selected jobs */}
            <div className="flex-1 overflow-y-auto p-2.5">
              {selectedJobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-12">
                  <div className="flex size-10 items-center justify-center rounded-full bg-[#f1f0ee]">
                    <CheckCheck size={18} strokeWidth={1.4} className="text-[#c4c2be]" aria-hidden="true" />
                  </div>
                  <p className="text-center text-[12px] leading-[18px] text-[#b8b4af]">
                    Add jobs from<br />the list to settle
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {selectedJobs.map(job => {
                    const catMeta = CATEGORY_META[job.serviceCategory] ?? { color: "#615d59", Icon: Wrench };
                    const CatIcon = catMeta.Icon;
                    return (
                      <div
                        key={job.jobNo}
                        className="flex items-center gap-2 rounded-[8px] border border-[#ece9e6] bg-white px-2.5 py-2 shadow-[0_1px_2px_rgba(15,15,15,0.04)]"
                      >
                        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <div className="flex items-center gap-1.5">
                            <CatIcon size={10} strokeWidth={2} style={{ color: catMeta.color }} aria-hidden="true" className="shrink-0" />
                            <span className="truncate text-[12px] font-semibold text-[#37352f]">{job.jobNo}</span>
                          </div>
                          <span className="text-[11px] text-[#9b9a97]">{job.serviceCategory} · {job.serviceDate}</span>
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5">
                          <span className="text-[12px] font-bold tabular-nums text-[#37352f]">
                            RM {job.commision.toFixed(2)}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleJob(job.jobNo)}
                            aria-label={`Remove ${job.jobNo}`}
                            className="flex size-5 items-center justify-center rounded-[4px] text-[#b8b4af] outline-none transition-colors duration-75 hover:bg-[#f1f0ee] hover:text-[#5f5e59]"
                          >
                            <X size={11} strokeWidth={2} aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Summary + action */}
            <div className="shrink-0 border-t border-[#e6e6e6] bg-white px-4 py-3.5">
              <div className="mb-3 flex flex-col gap-1.5 rounded-[8px] bg-[#f7f6f4] px-3 py-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#9b9a97]">Jobs selected</span>
                  <span className="text-[12px] font-semibold text-[#5f5e59]">{selectedJobs.length}</span>
                </div>
                <div className="h-px bg-[#ece9e6]" aria-hidden="true" />
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-medium text-[#5f5e59]">Total</span>
                  <span className="text-[15px] font-bold tabular-nums text-[#37352f]">
                    RM {totalCommission.toFixed(2)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSettle}
                disabled={selectedJobs.length === 0 || settledState}
                className={`inline-flex h-8 w-full items-center justify-center gap-2 rounded-[7px] text-[13px] font-semibold text-white outline-none transition-all duration-200 ${
                  settledState
                    ? "bg-[#2d8653]"
                    : "bg-[#2383e2] shadow-[0_1px_3px_rgba(35,131,226,0.24)] hover:bg-[#1a73d4] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                }`}
              >
                {settledState ? (
                  <>
                    <BadgeCheck size={13} strokeWidth={2.2} aria-hidden="true" />
                    Commission Settled!
                  </>
                ) : (
                  <>
                    <CheckCheck size={13} strokeWidth={1.8} aria-hidden="true" />
                    Settle Commission
                  </>
                )}
              </button>
            </div>

          </motion.div>

        </div>
      </div>
    </div>
  );
}
