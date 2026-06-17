"use client";

import React from "react";
import { DashboardSidebar } from "@/components/sidebar";
import { Check, CircleCheck, CircleX, Download, Hourglass, Info, Menu, ScanSearch, ShieldCheck, Table, TimerOff } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, useCallback } from "react";

/* ─── sequence definition ─── */
type Event =
  | { type: "thinking" }
  | { type: "tool"; label: string; detail: string }
  | { type: "text"; text: string; warn?: boolean };

const SEQUENCE: { delay: number; event: Event }[] = [
  { delay: 0,    event: { type: "thinking" } },
  { delay: 900,  event: { type: "tool", label: "read_file",          detail: "bank_statement_june_2026.pdf" } },
  { delay: 1800, event: { type: "tool", label: "ocr_extract",        detail: "Extracting text · 24 pages" } },
  { delay: 3000, event: { type: "text", text: "OCR complete. Detected 143 transaction rows across 6 account sections." } },
  { delay: 4400, event: { type: "tool", label: "parse_transactions",  detail: "Dates, references, amounts" } },
  { delay: 5200, event: { type: "tool", label: "match_ledger",        detail: "Cross-referencing ledger records" } },
  { delay: 6600, event: { type: "tool", label: "flag_duplicates",     detail: "Scanning for duplicate refs" } },
  { delay: 7800, event: { type: "text", text: "Found 3 duplicate transaction references — flagging for review.", warn: true } },
  { delay: 9000, event: { type: "tool", label: "check_contra",        detail: "Checking contra entries" } },
  { delay: 10000, event: { type: "text", text: "2 unmatched contra entries detected on 14 Jun and 22 Jun.", warn: true } },
  { delay: 11200, event: { type: "tool", label: "reconcile_payroll",  detail: "Payroll report 30 Jun 2026" } },
  { delay: 12400, event: { type: "text", text: "All 18 payroll entries matched. No discrepancies found." } },
  { delay: 13600, event: { type: "tool", label: "verify_sst",         detail: "LHDN submission records" } },
  { delay: 14800, event: { type: "text", text: "SST payments confirmed. Total RM 4,320 reconciled." } },
  { delay: 16000, event: { type: "tool", label: "calc_cashflow",      detail: "Inflow RM 84,320 · Outflow RM 71,870" } },
  { delay: 17200, event: { type: "text", text: "Net cash position improved by RM 12,450 vs prior period. Workflow complete. Results ready for export." } },
];

/* ─── rendered event shape ─── */
type RenderedThinking = { type: "thinking" };
type RenderedTool     = { type: "tool"; label: string; detail: string; done?: boolean };
type RenderedText     = { type: "text"; words: string[]; revealed: number; warn?: boolean };
type RenderedEvent    = RenderedThinking | RenderedTool | RenderedText;

/* ─── ToolCall component ─── */
function ToolCall({ label, done }: { label: string; done?: boolean }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 2 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
      className={`font-mono text-[12px] transition-all duration-300 ${done ? "text-[#c9c4be]" : "ai-thinking"}`}
    >
      {label}
    </motion.p>
  );
}

/* ─── streaming text component ─── */
function StreamingText({ words, revealed, warn }: { words: string[]; revealed: number; warn?: boolean }) {
  const shown = words.slice(0, revealed).join(" ");
  const streaming = revealed < words.length;
  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      className={`text-[13.5px] leading-[1.75] ${warn ? "text-[#b45309]" : "text-[#2c2c2b]"}`}
    >
      {shown}
      {streaming && (
        <motion.span
          className="ml-[1px] inline-block h-[14px] w-[2px] translate-y-[2px] rounded-sm bg-current align-middle opacity-80"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
        />
      )}
    </motion.p>
  );
}

/* ─── Workflow status pipeline ─── */
type WfStatus = "queued" | "investigating" | "extracting" | "verifying" | "exporting" | "completed" | "failed" | "timeout";

const MAIN_PIPELINE: { key: WfStatus; label: string; desc: string; records: string; Icon: React.ElementType }[] = [
  { key: "queued",        label: "Queued",        desc: "Waiting for worker",     records: "1 task",    Icon: Hourglass   },
  { key: "investigating", label: "Investigating",  desc: "Reading document",       records: "24 pages",  Icon: ScanSearch  },
  { key: "extracting",    label: "Extracting",     desc: "Parsing transactions",   records: "143 rows",  Icon: Table       },
  { key: "verifying",     label: "Verifying",      desc: "Level 1 & 2 checks",    records: "18 checks", Icon: ShieldCheck },
  { key: "exporting",     label: "Exporting",      desc: "Generating spreadsheet", records: "1 file",    Icon: Download    },
];

const TERMINAL_PIPELINE: { key: WfStatus; label: string; desc: string; records: string; Icon: React.ElementType }[] = [
  { key: "completed", label: "Completed", desc: "All checks passed",  records: "ready",    Icon: CircleCheck },
  { key: "failed",    label: "Failed",    desc: "Retries exhausted",  records: "3 errors", Icon: CircleX     },
  { key: "timeout",   label: "Timeout",   desc: "Max turns exceeded", records: "30 min",   Icon: TimerOff    },
];

const STATUS_STYLE: Record<WfStatus, { border: string; iconBg: string; iconColor: string; labelColor: string; dot: string }> = {
  queued:        { border: "border-[#e5e2de]",  iconBg: "bg-[#f6f5f4]",    iconColor: "text-[#a8a29e]", labelColor: "text-[#78716c]", dot: "#a8a29e" },
  investigating: { border: "border-[#bfdbfe]",  iconBg: "bg-[#eff6ff]",    iconColor: "text-[#2563eb]", labelColor: "text-[#1d4ed8]", dot: "#3b82f6" },
  extracting:    { border: "border-[#ddd6fe]",  iconBg: "bg-[#f5f3ff]",    iconColor: "text-[#7c3aed]", labelColor: "text-[#6d28d9]", dot: "#8b5cf6" },
  verifying:     { border: "border-[#fed7aa]",  iconBg: "bg-[#fff7ed]",    iconColor: "text-[#ea580c]", labelColor: "text-[#c2410c]", dot: "#f97316" },
  exporting:     { border: "border-[#54D490]",  iconBg: "bg-[#ecfdf5]",    iconColor: "text-[#059669]", labelColor: "text-[#065f46]", dot: "#10b981" },
  completed:     { border: "border-[#54D490]",   iconBg: "bg-[#f0fdf4]",    iconColor: "text-[#16a34a]", labelColor: "text-[#15803d]", dot: "#54D490"  },
  failed:        { border: "border-[#fecaca]",  iconBg: "bg-[#fef2f2]",    iconColor: "text-[#dc2626]", labelColor: "text-[#b91c1c]", dot: "#ef4444" },
  timeout:       { border: "border-[#fde68a]",  iconBg: "bg-[#fffbeb]",    iconColor: "text-[#d97706]", labelColor: "text-[#b45309]", dot: "#f59e0b" },
};

const CURRENT: WfStatus = "failed";

function VConn({ cx, top, h, color, arrowColor, gapTop = 10, gapBottom = 8, noArrow = false }: {
  cx: number; top: number; h: number; color: string; arrowColor?: string; gapTop?: number; gapBottom?: number; noArrow?: boolean;
}) {
  const tipY   = h - gapBottom;
  const wingH  = 7;
  const arrCol = arrowColor ?? color;
  return (
    <svg className="pointer-events-none absolute" style={{ left: cx - 8, top, width: 16, height: h, overflow: "visible" }} fill="none">
      <line x1="8" y1={gapTop} x2="8" y2={tipY} stroke={color} strokeWidth="2" strokeLinecap="round" />
      {!noArrow && <>
        <line x1="8" y1={tipY} x2="3" y2={tipY - wingH} stroke={arrCol} strokeWidth="2" strokeLinecap="round" />
        <line x1="8" y1={tipY} x2="13" y2={tipY - wingH} stroke={arrCol} strokeWidth="2" strokeLinecap="round" />
      </>}
    </svg>
  );
}

function WorkflowPipeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const dragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    setPan(p => ({ x: p.x + dx, y: p.y + dy }));
  }, []);

  const stopDrag = useCallback(() => { dragging.current = false; }, []);

  const onWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(s => Math.min(2, Math.max(0.3, s * delta)));
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [onWheel]);

  const CW    = 300;
  const CH    = 80;
  const HO    = 340;
  const STEP  = 170; // card spacing: CH(80) + gap(90)

  // fork/branch drops
  const FORK_DROP   = 80;
  const FORK_Y      = STEP * 4 + CH + FORK_DROP;
  const BRANCH_DROP = 80;
  const BRANCH_TOP  = FORK_Y + BRANCH_DROP;

  const currentIdx   = MAIN_PIPELINE.findIndex(s => s.key === CURRENT);
  const isTerminal   = (["completed", "failed", "timeout"] as WfStatus[]).includes(CURRENT);
  const isFailedPath = CURRENT === "failed" || CURRENT === "timeout";
  const mainDone     = isTerminal ? MAIN_PIPELINE.length : currentIdx;

  const doneLineColor  = isFailedPath ? "#fca5a5" : "#54D490";
  const doneArrowColor = isFailedPath ? "#f87171" : "#34d399";

  const POS: Record<WfStatus, { x: number; y: number }> = {
    queued:        { x: 0,    y: 0              },
    investigating: { x: 0,    y: STEP           },
    extracting:    { x: 0,    y: STEP * 2       },
    verifying:     { x: 0,    y: STEP * 3       },
    exporting:     { x: 0,    y: STEP * 4       },
    completed:     { x: -HO,  y: BRANCH_TOP     },
    failed:        { x: +HO,  y: BRANCH_TOP     },
    timeout:       { x: +HO,  y: BRANCH_TOP + STEP },
  };

  const allSteps = [...MAIN_PIPELINE, ...TERMINAL_PIPELINE];

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden cursor-grab active:cursor-grabbing select-none"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={stopDrag}
      onMouseLeave={stopDrag}
    >
      <div
        className="absolute origin-top"
        style={{ left: `calc(50% + ${pan.x}px)`, top: `${48 + pan.y}px`, transform: `scale(${scale})` }}
      >
        {/* ── Connectors: each SVG draws line + ↓ arrowhead together ── */}

        {/* Main flow — 4 vertical connectors */}
        {[0, 1, 2, 3].map(i => (
          <VConn key={i} cx={0} top={i * STEP + CH} h={STEP - CH}
            color={i < mainDone ? doneLineColor : "#e5e2de"}
            arrowColor={i < mainDone ? doneArrowColor : "#d6d2cd"} />
        ))}

        {/* Exporting bottom → horizontal fork bar (no arrowhead, just splits) */}
        <VConn cx={0} top={STEP * 4 + CH} h={FORK_DROP}
          color={isTerminal ? doneLineColor : "#e5e2de"} gapTop={10} gapBottom={0} noArrow />

        {/* Horizontal bar — two halves */}
        <div className="pointer-events-none absolute" style={{
          left: -HO, top: FORK_Y, width: HO, height: 2,
          background: CURRENT === "completed" ? "#54D490" : "#e5e2de",
        }} />
        <div className="pointer-events-none absolute" style={{
          left: 0, top: FORK_Y, width: HO, height: 2,
          background: CURRENT === "failed" || CURRENT === "timeout" ? "#fca5a5" : "#e5e2de",
        }} />

        {/* Left arm → Completed */}
        <VConn cx={-HO} top={FORK_Y} h={BRANCH_DROP}
          color={CURRENT === "completed" ? "#54D490" : "#e5e2de"}
          arrowColor={CURRENT === "completed" ? "#34d399" : "#d6d2cd"} gapTop={0} />

        {/* Right arm → Failed */}
        <VConn cx={HO} top={FORK_Y} h={BRANCH_DROP}
          color={CURRENT === "failed" || CURRENT === "timeout" ? "#fca5a5" : "#e5e2de"} gapTop={0} />

        {/* Failed → Timeout */}
        <VConn cx={HO} top={BRANCH_TOP + CH} h={STEP - CH}
          color={CURRENT === "timeout" ? "#fde68a" : "#e5e2de"} />

        {/* Cards */}
        {allSteps.map((step, i) => {
          const pos = POS[step.key];
          const mainIdx = MAIN_PIPELINE.findIndex(s => s.key === step.key);
          const isMainStep = mainIdx !== -1;
          const isDone    = isMainStep && mainIdx < mainDone;
          const isActive  = step.key === CURRENT;
          const isPending = !isDone && !isActive;

          const style     = STATUS_STYLE[step.key];
          const { Icon }  = step;

          return (
            <React.Fragment key={step.key}>
              {/* Badge — sits above the card, right-aligned, fully separate */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.18, delay: i * 0.055 + 0.1 }}
                className="absolute flex justify-end"
                style={{ left: pos.x - CW / 2, top: pos.y - 22, width: CW }}
              >
                <span className={`flex items-center gap-1 rounded-[5px] border px-1.5 py-0.5 text-[10.5px] font-medium leading-4 shadow-[0_1px_3px_rgba(0,0,0,0.07)] ${
                  isDone
                    ? isFailedPath
                      ? "border-[#fecaca] bg-[#fef2f2] text-[#dc2626]"
                      : "border-[#bbf7d0] bg-[#f0fdf4] text-[#16a34a]"
                    : isActive
                    ? "border-[#bfdbfe] bg-[#eff6ff] text-[#2563eb]"
                    : "border-[#eeebe5] bg-white text-[#c9c4be]"
                }`}>
                  {isDone ? (
                    <><Check size={10} strokeWidth={2.5} />Completed</>
                  ) : isActive ? (
                    <><motion.span className="size-1.5 rounded-full" style={{ background: "#3b82f6" }}
                      animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }} />
                    Running</>
                  ) : (
                    <>Pending</>
                  )}
                </span>
              </motion.div>

              {/* Card */}
              <div
                className="absolute"
                style={{ left: pos.x - CW / 2, top: pos.y, width: CW }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.055, ease: [0.22, 1, 0.36, 1] }}
                  className={`relative rounded-[12px] border bg-white px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-all duration-300 ${
                    isActive  ? `${style.border} shadow-[0_0_0_3px_rgba(0,0,0,0.04),0_1px_4px_rgba(0,0,0,0.08)]` :
                    isPending ? "border-[#f0ede8] opacity-40" :
                    isDone    ? isFailedPath ? "border-[#fca5a5]" : "border-[#54D490]" :
                                "border-[#eeebe5]"
                  }`}
                >
                  {/* Top row: icon + label */}
                  <div className="flex items-center gap-2">
                    <span className={`flex size-6 shrink-0 items-center justify-center rounded-[7px] transition-colors duration-300 ${
                      isDone ? style.iconBg : isActive ? style.iconBg : "bg-[#f6f5f4]"
                    }`}>
                      <Icon size={13} strokeWidth={1.8} className={isDone || isActive ? style.iconColor : "text-[#d1cec9]"} />
                    </span>
                    <p className={`flex-1 text-[12.5px] font-semibold leading-5 transition-colors duration-300 ${
                      isDone ? "text-[#2c2c2b]" : isActive ? style.labelColor : "text-[#c9c4be]"
                    }`}>{step.label}</p>
                  </div>
                  {/* Divider */}
                  <div className={`my-2 h-px transition-colors duration-300 ${isPending ? "bg-[#f6f5f4]" : "bg-[#f0ede8]"}`} />
                  {/* Description */}
                  <p className={`text-[11px] leading-4 transition-colors duration-300 ${
                    isPending ? "text-[#d6d2cd]" : "text-[#a39e98]"
                  }`}>{step.desc}</p>


                </motion.div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export default function TaskDetailPage({ params }: { params: { taskId: string } }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [events, setEvents] = useState<RenderedEvent[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  /* scroll to bottom whenever events change */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [events]);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    SEQUENCE.forEach(({ delay, event }) => {
      timers.push(setTimeout(() => {
        if (event.type === "thinking") {
          setEvents([{ type: "thinking" }]);
          return;
        }

        if (event.type === "tool") {
          setEvents((prev) => {
            const next = prev
              .filter((e) => e.type !== "thinking")
              .map((e) => e.type === "tool" ? { ...e, done: true } : e);
            return [...next, { type: "tool", label: event.label, detail: event.detail, done: false }];
          });
          return;
        }

        /* text — stream word by word */
        const words = event.text.split(" ");
        const warn  = event.warn;

        setEvents((prev) => {
          const next = prev
            .filter((e) => e.type !== "thinking")
            .map((e) => e.type === "tool" ? { ...e, done: true } : e);
          return [...next, { type: "text", words, revealed: 0, warn }];
        });

        words.forEach((_, wi) => {
          timers.push(setTimeout(() => {
            setEvents((prev) => {
              const copy = [...prev];
              /* find last text block and increment its revealed count */
              for (let i = copy.length - 1; i >= 0; i--) {
                const e = copy[i];
                if (e.type === "text" && e.words === words) {
                  copy[i] = { ...e, revealed: wi + 1 };
                  break;
                }
              }
              return copy;
            });
          }, (wi + 1) * 48));
        });

      }, delay));
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  /* group consecutive tool calls together */
  const grouped: Array<{ kind: "tools"; items: RenderedTool[] } | { kind: "thinking" } | { kind: "text"; e: RenderedText }> = [];
  for (const e of events) {
    if (e.type === "thinking") {
      grouped.push({ kind: "thinking" });
    } else if (e.type === "tool") {
      const last = grouped[grouped.length - 1];
      if (last?.kind === "tools") last.items.push(e);
      else grouped.push({ kind: "tools", items: [e] });
    } else {
      grouped.push({ kind: "text", e });
    }
  }

  return (
    <div className="dashboard-shell h-screen overflow-hidden bg-white md:flex">
      <DashboardSidebar
        activeItem="bank-statement"
        isMobileOpen={isSidebarOpen}
        onMobileClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-[var(--dashboard-header-h)] shrink-0 items-center justify-between border-b border-[#e6e6e6] px-[var(--dashboard-main-x)]">
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
              Workflow
            </h1>
            <div className="group relative flex shrink-0 items-center">
              <button type="button" aria-label="About Workflow" className="flex items-center justify-center text-[#c9c4bf] outline-none transition-colors duration-75 hover:text-[#8f8983]">
                <Info size={15} strokeWidth={1.7} aria-hidden="true" />
              </button>
              <div className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 w-max max-w-[220px] -translate-x-1/2 rounded-[8px] bg-[#2c2c2b] px-3 py-2 text-[12px] leading-[1.45] text-white opacity-0 shadow-[0_4px_16px_rgba(15,15,15,0.18)] transition-opacity duration-150 group-hover:opacity-100">
                View and manage the processing workflow for this task.
                <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-[#2c2c2b]" />
              </div>
            </div>
          </div>
          <div aria-hidden="true" />
        </header>

        {/* Body */}
        <div className="flex min-h-0 flex-1 overflow-hidden">
          {/* Main content — workflow pipeline */}
          <div className="min-w-0 flex-1 overflow-hidden bg-white">
            <div className="hidden">
              <WorkflowPipeline />
            </div>
          </div>

          {/* AI panel */}
          <div className="flex w-[420px] shrink-0 flex-col xl:w-[460px]">
            <div className="flex h-[var(--dashboard-header-h)] shrink-0 items-center justify-between border-b border-[#e6e6e6] px-5">
              <span className="text-[14px] font-semibold leading-5 tracking-[-0.1px] text-[#2c2c2b]">AI Assistant</span>
              <span className="inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-[6px] bg-[#e9f7ef] px-2 text-[13px] font-medium leading-5 text-[#1f7a4d]">
                <span className="size-1.5 shrink-0 animate-pulse rounded-full bg-[#1f7a4d]" />
                Live
              </span>
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex flex-col gap-3">
                {grouped.map((g, gi) => {
                  if (g.kind === "thinking") {
                    return (
                      <motion.div key="thinking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <span className="ai-thinking text-[13.5px] font-medium">Thinking…</span>
                      </motion.div>
                    );
                  }
                  if (g.kind === "tools") {
                    return (
                      <div key={`tools-${gi}`} className="flex flex-col gap-0.5">
                        {g.items.map((t, ti) => (
                          <ToolCall key={ti} label={t.label} done={t.done} />
                        ))}
                      </div>
                    );
                  }
                  return (
                    <StreamingText
                      key={`text-${gi}`}
                      words={g.e.words}
                      revealed={g.e.revealed}
                      warn={g.e.warn}
                    />
                  );
                })}
                <div ref={bottomRef} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
