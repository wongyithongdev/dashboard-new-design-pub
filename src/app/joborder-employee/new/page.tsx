"use client";

import { DashboardSidebar } from "@/components/sidebar";
import {
  ArrowLeft,
  Building2,
  Calculator,
  CalendarDays,
  Car,
  ChevronLeft,
  ChevronRight,
  Code2,
  Cpu,
  Droplets,
  Factory,
  Film,
  FlaskConical,
  Flame,
  Globe,
  GraduationCap,
  Hammer,
  HardHat,
  Hash,
  HeartPulse,
  Landmark,
  Menu,
  Monitor,
  Newspaper,
  Package,
  Phone,
  Plane,
  Plus,
  Recycle,
  Scale,
  Shield,
  Shirt,
  Sofa,
  Sparkles,
  Store,
  Tag,
  Thermometer,
  User,
  Utensils,
  Wheat,
  Wrench,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

/* ── Customer industry resolution ── */
type CustomerMeta = { color: string; Icon: React.ElementType };

const customerMetaMap: Record<string, CustomerMeta> = {
  "Parkway Mall Sdn Bhd":           { color: "#7c3aed", Icon: Store },
  "TechCore Solutions Sdn Bhd":     { color: "#6366f1", Icon: Code2 },
  "Sunrise Residence":              { color: "#78350f", Icon: Building2 },
  "Green Valley Café":              { color: "#16a34a", Icon: Utensils },
  "Meridian Hotel Sdn Bhd":         { color: "#0ea5e9", Icon: Plane },
  "Blueprint Architecture Sdn Bhd": { color: "#d97706", Icon: HardHat },
  "Maple Heights Condo":            { color: "#92400e", Icon: Building2 },
  "FreshMart Superstore":           { color: "#7c3aed", Icon: Store },
};

const industryPatterns: Array<{ pattern: RegExp; meta: CustomerMeta }> = [
  { pattern: /food|bakery|caf[eé]|cater|restaur|bever|grocer|dairy|meat|seafood|spice|organic|kitchen|confection/i,    meta: { color: "#16a34a", Icon: Utensils } },
  { pattern: /medical|clinic|hospital|pharma|health|drug|lab|diagnos|dental|optom|biotech|surgical/i,                  meta: { color: "#0891b2", Icon: HeartPulse } },
  { pattern: /construct|build|contrac|archit|cement|concrete|steel|roofing|plumb|drainage|civil|infra/i,               meta: { color: "#d97706", Icon: HardHat } },
  { pattern: /auto|car\b|vehicle|motor|tyre|tire|workshop|garage|spare.?part|automo/i,                                 meta: { color: "#1d4ed8", Icon: Car } },
  { pattern: /retail|mart|supermarket|hypermarket|mini.?market|bazaar|department.?store|convenience/i,                 meta: { color: "#7c3aed", Icon: Store } },
  { pattern: /bank|financ|fund|invest|insur|credit|loan|leas|capital|asset.?manage|wealth/i,                          meta: { color: "#0f766e", Icon: Landmark } },
  { pattern: /software|tech|digital|cloud|web|app\b|system|solution|network|cyber|data|saas|develop|i\.t\b/i,         meta: { color: "#6366f1", Icon: Code2 } },
  { pattern: /telecom|telco|mobile|cellular|internet|broadband|wifi|fibre|fiber|satell/i,                              meta: { color: "#2563eb", Icon: Phone } },
  { pattern: /educat|school|college|universi|tuition|training|learn|academy|instit|skill/i,                            meta: { color: "#b45309", Icon: GraduationCap } },
  { pattern: /property|real.?estate|realty|hous|developer|rental|leasehold|strata|condo|residence|heights/i,          meta: { color: "#78350f", Icon: Building2 } },
  { pattern: /energy|electric|solar|power|fuel|petroleum|gas\b|oil\b|petrochem|utility|utilities/i,                   meta: { color: "#ca8a04", Icon: Flame } },
  { pattern: /agri|farm|plantat|crop|seed|fertiliz|pesticid|vegetable|fruit|livestock/i,                               meta: { color: "#65a30d", Icon: Wheat } },
  { pattern: /manufactur|factory|industri|product|assembly|fabricat/i,                                                 meta: { color: "#475569", Icon: Factory } },
  { pattern: /fashion|textile|fabric|garment|apparel|cloth|tailor|sewi|uniform|linen/i,                                meta: { color: "#db2777", Icon: Shirt } },
  { pattern: /securi|guard|surveil|cctv|alarm|protect|patrol|investigat/i,                                             meta: { color: "#1e40af", Icon: Shield } },
  { pattern: /hotel|resort|hostel|airline|flight|holiday|tour\b|hospitality|accommo|travel|tourism/i,                 meta: { color: "#0ea5e9", Icon: Plane } },
  { pattern: /media|broadcast|film|cinema|studio|entertain|music|event.?organis/i,                                     meta: { color: "#9333ea", Icon: Film } },
  { pattern: /legal|law.?firm|consult|audit|advisory|counsel|attorney|advocate|notary/i,                               meta: { color: "#374151", Icon: Scale } },
  { pattern: /waste|recycl|environ|greentech|eco\b|sewage|disposal|scrap/i,                                            meta: { color: "#15803d", Icon: Recycle } },
  { pattern: /chemic|polymer|plastic|rubber|compound|resin|adhesive|solvent|pigment/i,                                 meta: { color: "#9333ea", Icon: FlaskConical } },
  { pattern: /electron|semicond|circuit|component|pcb|sensor|batter|chip|module/i,                                     meta: { color: "#0284c7", Icon: Cpu } },
  { pattern: /furnitur|sofa|chair|table\b|interior|decor|carpet|curtain|furnish|fitout/i,                              meta: { color: "#92400e", Icon: Sofa } },
  { pattern: /import|export|trading|wholesale|distribut|supply.?chain|cargo|freight.?forward/i,                        meta: { color: "#0369a1", Icon: Globe } },
  { pattern: /account|bookkeep|tax\b|payroll|gst|sst|erp\b/i,                                                         meta: { color: "#4b5563", Icon: Calculator } },
  { pattern: /clean|janitor|sanitiz|pest.?control|laundry|hygiene|facility.?manage|housekeep/i,                       meta: { color: "#0891b2", Icon: Droplets } },
  { pattern: /publish|print|book\b|magazine|newspa|catalog|brochure|press/i,                                           meta: { color: "#6d28d9", Icon: Newspaper } },
];

function resolveCustomerMeta(customer: string): CustomerMeta {
  if (customerMetaMap[customer]) return customerMetaMap[customer];
  for (const { pattern, meta } of industryPatterns) {
    if (pattern.test(customer)) return meta;
  }
  return { color: "#615d59", Icon: Store };
}

const SERVICE_CATEGORY_META: Record<string, { color: string; Icon: React.ElementType }> = {
  "HVAC":         { color: "#0891b2", Icon: Thermometer },
  "IT Support":   { color: "#7c3aed", Icon: Monitor },
  "Electrical":   { color: "#ca8a04", Icon: Zap },
  "Plumbing":     { color: "#2563eb", Icon: Droplets },
  "Cleaning":     { color: "#16a34a", Icon: Sparkles },
  "Carpentry":    { color: "#92400e", Icon: Hammer },
  "Pest Control": { color: "#dc2626", Icon: Shield },
  "Landscaping":  { color: "#65a30d", Icon: Wheat },
  "Painting":     { color: "#9333ea", Icon: Package },
  "Mechanical":   { color: "#475569", Icon: Wrench },
};

const categoryEmoji: Record<string, string> = {
  "HVAC":         "❄️",
  "IT Support":   "💻",
  "Electrical":   "⚡",
  "Plumbing":     "🔧",
  "Cleaning":     "✨",
  "Carpentry":    "🪚",
  "Pest Control": "🐛",
  "Landscaping":  "🌿",
  "Painting":     "🎨",
  "Mechanical":   "⚙️",
};

/* ── Notion date picker ── */
const DAYS_SHORT = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function NotionDatePicker({
  value, timeValue, onDateChange, onTimeChange, onClose,
}: {
  value: string; timeValue: string;
  onDateChange: (d: string) => void;
  onTimeChange: (t: string) => void;
  onClose: () => void;
}) {
  const [year, setYear]   = React.useState(() => parseInt(value.split("-")[0] ?? "2026"));
  const [month, setMonth] = React.useState(() => parseInt(value.split("-")[1] ?? "1") - 1);
  const todayStr    = new Date().toISOString().slice(0, 10);
  const selectedStr = value;
  function prevMonth() { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); }
  function nextMonth() { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); }
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  return (
    <div className="w-[260px] rounded-[10px] border border-[#e9e9e7] bg-white shadow-[0_8px_32px_rgba(15,15,15,0.14)]" onPointerDown={e => e.stopPropagation()}>
      <div className="flex items-center justify-between px-3 pt-3 pb-1.5">
        <button type="button" onClick={prevMonth} className="flex size-[26px] items-center justify-center rounded-[5px] text-[#9b9a97] hover:bg-[#f1f0ee] hover:text-[#37352f] transition-colors duration-75"><ChevronLeft size={14} strokeWidth={2} /></button>
        <span className="text-[13px] font-semibold text-[#37352f]">{MONTH_NAMES[month]} {year}</span>
        <button type="button" onClick={nextMonth} className="flex size-[26px] items-center justify-center rounded-[5px] text-[#9b9a97] hover:bg-[#f1f0ee] hover:text-[#37352f] transition-colors duration-75"><ChevronRight size={14} strokeWidth={2} /></button>
      </div>
      <div className="grid grid-cols-7 px-2 pb-0.5">
        {DAYS_SHORT.map(d => <div key={d} className="flex h-[28px] items-center justify-center text-[11px] font-medium text-[#9b9a97]">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 px-2 pb-2">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const cellStr   = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isSelected = cellStr === selectedStr;
          const isToday    = cellStr === todayStr;
          return (
            <button key={cellStr} type="button" onClick={() => onDateChange(cellStr)}
              className={["flex h-[30px] w-full items-center justify-center rounded-[6px] text-[13px] transition-colors duration-75",
                isSelected ? "bg-[#2383e2] font-semibold text-white" : isToday ? "font-semibold text-[#2383e2] hover:bg-[#f1f0ee]" : "text-[#37352f] hover:bg-[#f1f0ee]"].join(" ")}>
              {day}
            </button>
          );
        })}
      </div>
      <div className="border-t border-[#e9e9e7] px-3 py-2.5 flex items-center gap-2">
        <CalendarDays size={13} className="text-[#9b9a97] shrink-0" />
        <span className="text-[12px] text-[#9b9a97]">Time</span>
        <input type="time" value={timeValue} onChange={e => onTimeChange(e.target.value)}
          className="ml-auto w-[90px] rounded-[5px] border border-[#e9e9e7] bg-[#f7f6f3] px-2 py-0.5 text-[12px] font-mono text-[#37352f] outline-none focus:border-[#2383e2] transition-colors duration-75" />
      </div>
      <div className="border-t border-[#e9e9e7] px-3 py-2 flex justify-end">
        <button type="button" onClick={onClose} className="rounded-[5px] bg-[#2383e2] px-3 py-1 text-[12px] font-medium text-white hover:bg-[#1a73d4] transition-colors duration-75">Done</button>
      </div>
    </div>
  );
}

/* ── SectionLabel ── */
function SectionLabel({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <span className="text-[11px] font-semibold uppercase tracking-[0.6px] text-[#9b9a97] whitespace-nowrap">{children}</span>
      <div className="h-px flex-1 bg-[#e9e9e7]" />
    </div>
  );
}

/* ── Date helpers ── */
const MONTH_TO_NUM: Record<string, string> = {
  Jan:"01",Feb:"02",Mar:"03",Apr:"04",May:"05",Jun:"06",
  Jul:"07",Aug:"08",Sep:"09",Oct:"10",Nov:"11",Dec:"12",
};
const NUM_TO_MONTH = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function toInputDate(s: string) {
  const p = s.split(" ");
  const y = p[2] ?? "2026", m = MONTH_TO_NUM[p[1] ?? ""] ?? "01", d = (p[0] ?? "1").padStart(2,"0");
  return `${y}-${m}-${d}`;
}
function toInputTime(s: string) { return s.split(" ")[3]?.slice(0, 5) ?? "09:00"; }
function fromInputDateTime(date: string, time: string) {
  const [y, m, d] = date.split("-");
  const mon = NUM_TO_MONTH[parseInt(m ?? "1") - 1] ?? "Jan";
  return `${parseInt(d ?? "1")} ${mon} ${y} ${time}:00`;
}

/* ── Styles ── */
const INLINE_INPUT =
  "w-full bg-[#f1f0ee] rounded-[4px] px-2 py-1 outline-none border-none text-[#37352f] placeholder:text-[#c4c2be] caret-[#2383e2] focus:bg-[#e9e9e7] transition-colors duration-75";
const INLINE_TEXTAREA =
  "w-full resize-none bg-[#f1f0ee] rounded-[4px] px-2 py-1.5 outline-none border-none text-[#37352f] placeholder:text-[#c4c2be] caret-[#2383e2] leading-[20px] focus:bg-[#e9e9e7] transition-colors duration-75";

/* ── Default form ── */
function todayDateStr() {
  const now = new Date();
  const d   = now.getDate();
  const mon = NUM_TO_MONTH[now.getMonth()] ?? "Jun";
  const y   = now.getFullYear();
  const hh  = String(now.getHours()).padStart(2,"0");
  const mm  = String(now.getMinutes()).padStart(2,"0");
  return `${d} ${mon} ${y} ${hh}:${mm}:00`;
}

type NewForm = {
  customerName: string; customerRef: string; phone: string; customerInfo: string;
  serviceDate: string; status: string; agent: string;
  serviceType: string; serviceItem: string; serviceItemRef: string;
  serialNo: string; furtherDescription: string;
  customerReq: string; note: string;
  serviceCharge: number; itemsTotal: number;
};

const EMPTY: NewForm = {
  customerName: "", customerRef: "", phone: "", customerInfo: "",
  serviceDate: todayDateStr(), status: "Pending", agent: "",
  serviceType: "", serviceItem: "", serviceItemRef: "",
  serialNo: "", furtherDescription: "",
  customerReq: "", note: "",
  serviceCharge: 0, itemsTotal: 0,
};

/* ── Page ── */
export default function NewJobOrderPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [form, setForm]         = useState<NewForm>({ ...EMPTY });
  const [openProp, setOpenProp] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const dropdownRef  = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const fu = (delay: number) => ({
    initial: { opacity: 0, y: shouldReduceMotion ? 0 : 14 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: shouldReduceMotion ? 0 : delay, duration: 0.32, ease: [0.22, 1, 0.36, 1] as const },
  });

  const set = (key: keyof NewForm, val: string | number) =>
    setForm(prev => ({ ...prev, [key]: val }));

  useEffect(() => {
    function onPointer(e: PointerEvent) {
      if (!dropdownRef.current?.contains(e.target as Node)) setOpenProp(null);
    }
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, []);

  useEffect(() => {
    if (!showDatePicker) return;
    function onPointer(e: PointerEvent) {
      if (!datePickerRef.current?.contains(e.target as Node)) setShowDatePicker(false);
    }
    const id = setTimeout(() => document.addEventListener("pointerdown", onPointer), 0);
    return () => { clearTimeout(id); document.removeEventListener("pointerdown", onPointer); };
  }, [showDatePicker]);

  /* derived */
  const { color: customerColor, Icon: CustomerIcon } = resolveCustomerMeta(form.customerName);

  /* resolve service category from serviceType text */
  const resolvedCategory = Object.keys(SERVICE_CATEGORY_META).find(cat =>
    form.serviceType.toLowerCase().includes(cat.toLowerCase())
  ) ?? "";
  const pageEmoji = categoryEmoji[resolvedCategory] ?? "📋";
  const { color: svcColor, Icon: SvcIcon } = SERVICE_CATEGORY_META[resolvedCategory] ?? { color: "#64748b", Icon: Wrench };

  const statusMeta: Record<string, { cls: string; dot: string }> = {
    "Completed":   { cls: "bg-[#ddedea] text-[#2d8653]",  dot: "#2d8653" },
    "In Progress": { cls: "bg-[#ddebf7] text-[#1d6fbd]",  dot: "#1d6fbd" },
    "Pending":     { cls: "bg-[#fdecc8] text-[#b45309]",  dot: "#b45309" },
    "Cancelled":   { cls: "bg-[#e3e2e0] text-[#787774]",  dot: "#9b9a97" },
  };
  const chip = statusMeta[form.status] ?? { cls: "bg-[#fdecc8] text-[#b45309]", dot: "#b45309" };

  const techAvatarBg: Record<string, string> = {
    "Ahmad Farid":   "#0891b2",
    "Wong Yi Thong": "#1a73e8",
    "Raj Kumar":     "#7c3aed",
    "Sarah Lim":     "#db2777",
  };
  const agentColor   = techAvatarBg[form.agent] ?? "#c4c2be";
  const agentInitial = form.agent ? (form.agent.split(" ")[0]?.[0]?.toUpperCase() ?? "?") : null;

  const dateParts  = form.serviceDate.split(" ");
  const dateDisplay = dateParts.slice(0, 3).join(" ");
  const timeDisplay = dateParts[3]?.slice(0, 5) ?? null;

  return (
    <div className="dashboard-shell bg-white md:flex overflow-hidden" style={{ height: "100dvh" }}>
      <DashboardSidebar
        activeItem="joborder-employee"
        isMobileOpen={isSidebarOpen}
        onMobileClose={() => setIsSidebarOpen(false)}
      />

      <main className="min-w-0 flex-1 flex flex-col bg-white overflow-hidden">

        {/* ── Header ── */}
        <header className="shrink-0 flex items-center gap-2 h-[52px] border-b border-[#e9e9e7] px-6">
          <button
            type="button"
            aria-label="Open navigation"
            onClick={() => setIsSidebarOpen(true)}
            className="flex size-7 shrink-0 items-center justify-center rounded-[6px] text-[#9b9a97] outline-none transition-colors duration-75 hover:bg-[#f1f0ee] hover:text-[#37352f] xl:hidden"
          >
            <Menu size={16} strokeWidth={1.8} />
          </button>

          <Link
            href="/joborder-employee"
            className="flex items-center gap-1.5 text-[14px] text-[#9b9a97] transition-colors duration-75 hover:text-[#37352f]"
          >
            <ArrowLeft size={13} strokeWidth={2} />
            Joborder Employee
          </Link>

          <div className="ml-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => router.push("/joborder-employee")}
              className="inline-flex h-[30px] items-center gap-1.5 rounded-[6px] px-3 text-[14px] text-[#787774] outline-none transition-colors duration-75 hover:bg-[#f1f0ee] hover:text-[#37352f]"
            >
              Cancel
            </button>
            <button
              type="button"
              className="inline-flex h-[30px] items-center gap-1.5 rounded-[6px] bg-[#2383e2] px-3.5 text-[14px] font-medium text-white outline-none transition-colors duration-75 hover:bg-[#1a73d4]"
            >
              <Plus size={13} strokeWidth={2} aria-hidden="true" />
              Create
            </button>
          </div>
        </header>

        {/* ── Two-column body ── */}
        <div className="flex flex-1 min-h-0 overflow-hidden">

          {/* ── Left column ── */}
          <div className="flex-1 overflow-y-auto px-10 py-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

            <motion.div {...fu(0.04)}>
              {/* Page emoji */}
              <div className="mb-3 text-[52px] leading-none select-none">{pageEmoji}</div>

              {/* Customer name — large Notion title input */}
              <input
                className="w-full bg-[#f1f0ee] rounded-[6px] px-2 py-1 outline-none text-[26px] font-bold tracking-[-0.4px] text-[#37352f] leading-[1.25] placeholder:text-[#c4c2be] caret-[#2383e2] focus:bg-[#e9e9e7] transition-colors duration-75"
                placeholder="Customer name"
                value={form.customerName}
                onChange={e => set("customerName", e.target.value)}
              />

              {/* Customer meta row */}
              <div className="mt-2 flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <input
                    className="w-[140px] bg-[#f1f0ee] px-2 py-0.5 rounded-[4px] text-[13px] text-[#9b9a97] outline-none placeholder:text-[#c4c2be] focus:bg-[#e9e9e7] focus:text-[#37352f] transition-colors duration-75 caret-[#2383e2]"
                    placeholder="Ref (300-C001)"
                    value={form.customerRef}
                    onChange={e => set("customerRef", e.target.value)}
                  />
                  <input
                    className="flex-1 bg-[#f1f0ee] px-2 py-0.5 rounded-[4px] text-[13px] text-[#9b9a97] outline-none placeholder:text-[#c4c2be] focus:bg-[#e9e9e7] focus:text-[#37352f] transition-colors duration-75 caret-[#2383e2]"
                    placeholder="Phone"
                    value={form.phone}
                    onChange={e => set("phone", e.target.value)}
                  />
                </div>
                <input
                  className="w-full bg-[#f1f0ee] px-2 py-0.5 rounded-[4px] text-[12px] text-[#9b9a97] outline-none placeholder:text-[#c4c2be] focus:bg-[#e9e9e7] focus:text-[#37352f] transition-colors duration-75 caret-[#2383e2] leading-[20px]"
                  placeholder="Address"
                  value={form.customerInfo}
                  onChange={e => set("customerInfo", e.target.value)}
                />
              </div>

              <div className="my-6 h-px bg-[#e9e9e7]" />
            </motion.div>

            {/* SERVICE ITEM */}
            <motion.div {...fu(0.11)}>
              <SectionLabel>Service Item</SectionLabel>
              <div className="mb-6 min-w-0">
                <div className="flex flex-col -mx-2">
                  {([
                    { label: "Name",        field: "serviceItem",        mono: false },
                    { label: "Ref",         field: "serviceItemRef",     mono: true  },
                    { label: "Serial No",   field: "serialNo",           mono: true  },
                    { label: "Description", field: "furtherDescription", mono: false },
                  ] as const).map(({ label, field, mono }) => (
                    <div key={field} className="flex items-center min-h-[36px] rounded-[4px] px-2 hover:bg-[#f1f0ee] transition-colors duration-75">
                      <span className="w-[130px] shrink-0 text-[14px] text-[#9b9a97]">{label}</span>
                      <input
                        className={`${INLINE_INPUT} ${mono ? "font-mono text-[13px] text-[#787774]" : "text-[14px]"}`}
                        value={String(form[field])}
                        onChange={e => set(field, e.target.value)}
                        placeholder={label}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* REQUIREMENT */}
            <motion.div {...fu(0.18)}>
              <SectionLabel>Requirement</SectionLabel>
              <textarea
                className={`${INLINE_TEXTAREA} text-[13px] mb-6`}
                rows={3}
                value={form.customerReq}
                onChange={e => set("customerReq", e.target.value)}
                placeholder="Describe the customer's requirement…"
              />
            </motion.div>

            {/* NOTES */}
            <motion.div {...fu(0.25)}>
              <SectionLabel>Notes</SectionLabel>
              <textarea
                className={`${INLINE_TEXTAREA} text-[13px] mb-6`}
                rows={3}
                value={form.note}
                onChange={e => set("note", e.target.value)}
                placeholder="Add a note…"
              />
            </motion.div>

          </div>

          {/* ── Right sidebar ── */}
          <div className="w-[440px] shrink-0 border-l border-[#e9e9e7] overflow-y-auto px-8 py-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

            {/* Status */}
            <motion.div {...fu(0.07)}>
              <div className="mb-1 relative" ref={openProp === "status" ? dropdownRef : undefined}>
                <button
                  type="button"
                  onClick={() => setOpenProp(p => p === "status" ? null : "status")}
                  className={`inline-flex h-[24px] items-center gap-1.5 rounded-[4px] px-2.5 text-[13px] font-medium cursor-pointer ${chip.cls}`}
                >
                  <span className="size-[6px] shrink-0 rounded-full" style={{ background: chip.dot }} />
                  {form.status}
                </button>
                <AnimatePresence>
                  {openProp === "status" && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.97 }}
                      transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute left-0 top-7 z-30 w-[180px] origin-top-left rounded-[8px] border border-[#e9e9e7] bg-white p-1 shadow-[0_8px_24px_rgba(15,15,15,0.12)]"
                    >
                      {(["Pending", "In Progress", "Completed", "Cancelled"] as const).map(s => {
                        const m = statusMeta[s] ?? { cls: "bg-[#e3e2e0] text-[#787774]", dot: "#9b9a97" };
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => { set("status", s); setOpenProp(null); }}
                            className="flex w-full items-center gap-2.5 rounded-[5px] px-2 py-1.5 text-left text-[13px] text-[#37352f] transition-colors duration-75 hover:bg-[#f1f0ee]"
                          >
                            <span className={`inline-flex h-[20px] items-center gap-1.5 rounded-[3px] px-2 font-medium ${m.cls}`}>
                              <span className="size-[5px] shrink-0 rounded-full" style={{ background: m.dot }} />
                              {s}
                            </span>
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="my-5 h-px bg-[#e9e9e7]" />
            </motion.div>

            {/* Property rows */}
            <motion.div {...fu(0.14)}>
              <div className="flex flex-col -mx-2">

                {/* Date */}
                <div className="relative flex items-start min-h-[36px] rounded-[4px] px-2 py-1.5 transition-colors duration-75 hover:bg-[#f1f0ee]" ref={datePickerRef}>
                  <div className="flex items-center gap-2 w-[150px] shrink-0 pt-0.5">
                    <CalendarDays size={14} className="text-[#9b9a97] shrink-0" strokeWidth={1.8} />
                    <span className="text-[14px] text-[#787774]">Date</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDatePicker(p => !p)}
                    className="flex items-center gap-1.5 rounded-[4px] px-2 py-0.5 text-[14px] text-[#37352f] transition-colors duration-75 hover:bg-[#e9e9e7] bg-[#f1f0ee]"
                  >
                    <span>{dateDisplay}</span>
                    {timeDisplay && <span className="font-mono text-[12px] text-[#9b9a97]">{timeDisplay}</span>}
                  </button>
                  <AnimatePresence>
                    {showDatePicker && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
                        style={{ transformOrigin: "top left", position: "absolute", left: 0, top: "calc(100% + 4px)", zIndex: 50 }}
                      >
                        <NotionDatePicker
                          value={toInputDate(form.serviceDate)}
                          timeValue={toInputTime(form.serviceDate)}
                          onDateChange={d => set("serviceDate", fromInputDateTime(d, toInputTime(form.serviceDate)))}
                          onTimeChange={t => set("serviceDate", fromInputDateTime(toInputDate(form.serviceDate), t))}
                          onClose={() => setShowDatePicker(false)}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Agent */}
                <div
                  className="relative flex items-center min-h-[36px] rounded-[4px] px-2 transition-colors duration-75 hover:bg-[#f1f0ee]"
                  ref={openProp === "agent" ? dropdownRef : undefined}
                >
                  <div className="flex items-center gap-2 w-[150px] shrink-0">
                    <User size={14} className="text-[#9b9a97] shrink-0" strokeWidth={1.8} />
                    <span className="text-[14px] text-[#787774]">Agent</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpenProp(p => p === "agent" ? null : "agent")}
                    className="flex items-center gap-2 text-[14px] text-left rounded-[4px] px-2 py-0.5 transition-colors duration-75 bg-[#f1f0ee] cursor-pointer hover:bg-[#e9e9e7]"
                  >
                    {agentInitial ? (
                      <>
                        <span className="flex size-[18px] shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white" style={{ background: agentColor }}>{agentInitial}</span>
                        <span className="text-[#37352f]">{form.agent}</span>
                      </>
                    ) : (
                      <span className="text-[#c4c2be]">Select agent…</span>
                    )}
                  </button>
                  <AnimatePresence>
                    {openProp === "agent" && (
                      <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.97 }}
                        transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute left-[150px] top-10 z-30 w-[210px] origin-top-left rounded-[8px] border border-[#e9e9e7] bg-white p-1 shadow-[0_8px_24px_rgba(15,15,15,0.12)]"
                      >
                        {(["Ahmad Farid", "Wong Yi Thong", "Raj Kumar", "Sarah Lim"] as const).map(name => {
                          const ini = name.split(" ")[0]?.[0]?.toUpperCase() ?? "?";
                          return (
                            <button
                              key={name}
                              type="button"
                              onClick={() => { set("agent", name); setOpenProp(null); }}
                              className="flex w-full items-center gap-2.5 rounded-[5px] px-2 py-2 text-left text-[13px] text-[#37352f] transition-colors duration-75 hover:bg-[#f1f0ee]"
                            >
                              <span className="flex size-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white" style={{ background: techAvatarBg[name] ?? "#64748b" }}>{ini}</span>
                              {name}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Service Type */}
                <div className="flex items-start min-h-[36px] rounded-[4px] px-2 py-2 transition-colors duration-75 hover:bg-[#f1f0ee]">
                  <div className="flex items-center gap-2 w-[150px] shrink-0">
                    <SvcIcon size={14} className="shrink-0" style={{ color: svcColor }} strokeWidth={1.8} />
                    <span className="text-[14px] text-[#787774]">Type</span>
                  </div>
                  <input
                    className={`${INLINE_INPUT} text-[14px]`}
                    value={form.serviceType}
                    onChange={e => set("serviceType", e.target.value)}
                    placeholder="e.g. HVAC MAINTENANCE"
                  />
                </div>

                {/* Item */}
                <div className="flex items-center min-h-[36px] rounded-[4px] px-2 transition-colors duration-75 hover:bg-[#f1f0ee]">
                  <div className="flex items-center gap-2 w-[150px] shrink-0">
                    <Package size={14} className="text-[#9b9a97] shrink-0" strokeWidth={1.8} />
                    <span className="text-[14px] text-[#787774]">Item</span>
                  </div>
                  <input
                    className={`${INLINE_INPUT} text-[14px]`}
                    value={form.serviceItem}
                    onChange={e => set("serviceItem", e.target.value)}
                    placeholder="Service item name"
                  />
                </div>

                {/* Ref */}
                <div className="flex items-center min-h-[36px] rounded-[4px] px-2 transition-colors duration-75 hover:bg-[#f1f0ee]">
                  <div className="flex items-center gap-2 w-[150px] shrink-0">
                    <Tag size={14} className="text-[#9b9a97] shrink-0" strokeWidth={1.8} />
                    <span className="text-[14px] text-[#787774]">Ref</span>
                  </div>
                  <input
                    className={`${INLINE_INPUT} font-mono text-[13px] text-[#787774]`}
                    value={form.serviceItemRef}
                    onChange={e => set("serviceItemRef", e.target.value)}
                    placeholder="e.g. HVAC-001"
                  />
                </div>

                {/* S/N */}
                <div className="flex items-center min-h-[36px] rounded-[4px] px-2 transition-colors duration-75 hover:bg-[#f1f0ee]">
                  <div className="flex items-center gap-2 w-[150px] shrink-0">
                    <Hash size={14} className="text-[#9b9a97] shrink-0" strokeWidth={1.8} />
                    <span className="text-[14px] text-[#787774]">Serial No</span>
                  </div>
                  <input
                    className={`${INLINE_INPUT} font-mono text-[13px] text-[#787774]`}
                    value={form.serialNo}
                    onChange={e => set("serialNo", e.target.value)}
                    placeholder="Optional"
                  />
                </div>

                {/* Phone */}
                <div className="flex items-center min-h-[36px] rounded-[4px] px-2 transition-colors duration-75 hover:bg-[#f1f0ee]">
                  <div className="flex items-center gap-2 w-[150px] shrink-0">
                    <Phone size={14} className="text-[#9b9a97] shrink-0" strokeWidth={1.8} />
                    <span className="text-[14px] text-[#787774]">Phone</span>
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    className={`${INLINE_INPUT} text-[14px]`}
                    value={form.phone}
                    onChange={e => set("phone", e.target.value.replace(/[^0-9+\-() ]/g, ""))}
                    placeholder="082-000 000"
                  />
                </div>

              </div>
            </motion.div>

            {/* Financial rows */}
            <motion.div {...fu(0.21)}>
              <div className="my-5 h-px bg-[#e9e9e7]" />
              <div className="flex flex-col -mx-2">

                <div className="flex items-center min-h-[36px] rounded-[4px] px-2 transition-colors duration-75 hover:bg-[#f1f0ee]">
                  <span className="w-[150px] shrink-0 text-[14px] text-[#787774]">Service charge</span>
                  <div className="flex items-center gap-1 flex-1">
                    <span className="text-[13px] text-[#9b9a97]">RM</span>
                    <input
                      type="number"
                      className={`${INLINE_INPUT} font-mono text-[14px] tabular-nums`}
                      value={form.serviceCharge}
                      onChange={e => set("serviceCharge", parseFloat(e.target.value) || 0)}
                      onFocus={e => e.target.select()}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="flex items-center min-h-[36px] rounded-[4px] px-2 transition-colors duration-75 hover:bg-[#f1f0ee]">
                  <span className="w-[150px] shrink-0 text-[14px] text-[#787774]">Items</span>
                  <div className="flex items-center gap-1 flex-1">
                    <span className="text-[13px] text-[#9b9a97]">RM</span>
                    <input
                      type="number"
                      className={`${INLINE_INPUT} font-mono text-[14px] tabular-nums`}
                      value={form.itemsTotal}
                      onChange={e => set("itemsTotal", parseFloat(e.target.value) || 0)}
                      onFocus={e => e.target.select()}
                      placeholder="0.00"
                    />
                  </div>
                </div>

              </div>
            </motion.div>

            {/* Total */}
            <motion.div {...fu(0.28)}>
              <div className="my-5 h-px bg-[#37352f]/10" />
              <div className="flex items-baseline justify-between px-2">
                <span className="text-[15px] font-semibold text-[#37352f]">Total</span>
                <span className="font-mono text-[22px] font-bold tracking-[-0.5px] tabular-nums text-[#37352f]">
                  RM {(form.serviceCharge + form.itemsTotal).toFixed(2)}
                </span>
              </div>
            </motion.div>

          </div>
        </div>
      </main>
    </div>
  );
}
