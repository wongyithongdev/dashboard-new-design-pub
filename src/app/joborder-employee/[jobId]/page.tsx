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
  Pencil,
  Phone,
  Plane,
  Recycle,
  Scale,
  Shield,
  Shirt,
  Sofa,
  Sparkles,
  Store,
  Tag,
  Thermometer,
  Trash2,
  User,
  Utensils,
  Wheat,
  Wrench,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useParams } from "next/navigation";
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

/* ── Service category metadata ── */
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

const JOB_SERVICE_CATEGORIES: Record<string, string> = {
  "JO-2026-0001": "HVAC",
  "JO-2026-0002": "IT Support",
  "JO-2026-0003": "Electrical",
  "JO-2026-0004": "Plumbing",
  "JO-2026-0005": "Cleaning",
  "JO-2026-0006": "Carpentry",
  "JO-2026-0007": "Pest Control",
  "JO-2026-0008": "Electrical",
};

/* ── Job Order Detail data ── */
type JobOrderDetail = {
  jobNo: string;
  customerName: string;
  customerRef: string;
  phone: string;
  serviceDate: string;
  status: string;
  customerInfo: string;
  customerReq: string;
  note: string;
  agentNote: string;
  agent: string;
  serviceType: string;
  serviceItem: string;
  serviceItemRef: string;
  serialNo: string;
  furtherDescription: string;
  serviceCharge: number;
  commision: number;
  itemsTotal: number;
  photos: string[];
  inprogressAt: string;
  completedAt: string;
  createdAt: string;
};

const JOB_ORDER_DETAILS: Record<string, JobOrderDetail> = {
  "JO-2026-0001": {
    jobNo: "JO-2026-0001", customerName: "Parkway Mall Sdn Bhd", customerRef: "300-C001",
    phone: "082-412 888", serviceDate: "12 Jun 2026 09:30:00", status: "In Progress",
    customerInfo: "LOT 42, PARKWAY PARADE, JALAN UTAMA, 93000 KUCHING",
    customerReq: "HVAC unit not cooling, temperature unstable",
    note: "Check refrigerant levels and compressor", agentNote: "Customer requests completion by EOD",
    agent: "Ahmad Farid", serviceType: "HVAC MAINTENANCE CONTRACT",
    serviceItem: "Air Conditioning Unit", serviceItemRef: "HVAC-001",
    serialNo: "AC-2024-0042", furtherDescription: "Split unit 2.0HP ceiling cassette",
    serviceCharge: 280.00, commision: 5, itemsTotal: 120.00,
    photos: [], inprogressAt: "12 Jun 2026 09:30:00", completedAt: "", createdAt: "12 Jun 2026 08:15:00",
  },
  "JO-2026-0002": {
    jobNo: "JO-2026-0002", customerName: "TechCore Solutions Sdn Bhd", customerRef: "300-C002",
    phone: "082-233 456", serviceDate: "11 Jun 2026 14:00:00", status: "Completed",
    customerInfo: "LEVEL 8, WISMA TECHCORE, JALAN TUNKU ABDUL RAHMAN, 93100 KUCHING",
    customerReq: "Network server down, unable to access shared drives",
    note: "Reset network switch, reconfigured DHCP", agentNote: "",
    agent: "Wong Yi Thong", serviceType: "IT REMOTE SUPPORT (CONTRACT CUSTOMER)",
    serviceItem: "Network Switch", serviceItemRef: "IT-022",
    serialNo: "NS-2023-0088", furtherDescription: "Cisco SG350 24-port managed switch",
    serviceCharge: 0, commision: 2, itemsTotal: 0,
    photos: [], inprogressAt: "11 Jun 2026 14:00:00", completedAt: "11 Jun 2026 15:30:00", createdAt: "11 Jun 2026 13:00:00",
  },
  "JO-2026-0003": {
    jobNo: "JO-2026-0003", customerName: "Sunrise Residence", customerRef: "300-C003",
    phone: "019-882 7712", serviceDate: "10 Jun 2026 10:00:00", status: "Pending",
    customerInfo: "NO 12, JALAN MATAHARI 3, TAMAN SUNRISE, 93350 KUCHING",
    customerReq: "Power trip in master bedroom circuit",
    note: "", agentNote: "",
    agent: "Raj Kumar", serviceType: "ELECTRICAL INSPECTION",
    serviceItem: "Circuit Breaker", serviceItemRef: "EL-009",
    serialNo: "--", furtherDescription: "40A MCB main panel replacement",
    serviceCharge: 150.00, commision: 3, itemsTotal: 85.00,
    photos: [], inprogressAt: "", completedAt: "", createdAt: "09 Jun 2026 17:45:00",
  },
  "JO-2026-0004": {
    jobNo: "JO-2026-0004", customerName: "Green Valley Café", customerRef: "300-C004",
    phone: "011-2398 4410", serviceDate: "10 Jun 2026 08:30:00", status: "Completed",
    customerInfo: "LOT 7, GROUND FLOOR, GREEN VALLEY SQUARE, 93400 KUCHING",
    customerReq: "Kitchen sink blocked, water not draining",
    note: "Cleared blockage, checked grease trap", agentNote: "Advised customer to use enzyme cleaner monthly",
    agent: "Sarah Lim", serviceType: "PLUMBING SERVICE",
    serviceItem: "Drain Cleaning", serviceItemRef: "PL-003",
    serialNo: "--", furtherDescription: "Commercial kitchen drain unclogging",
    serviceCharge: 120.00, commision: 2, itemsTotal: 30.00,
    photos: [], inprogressAt: "10 Jun 2026 08:30:00", completedAt: "10 Jun 2026 10:00:00", createdAt: "09 Jun 2026 22:10:00",
  },
  "JO-2026-0005": {
    jobNo: "JO-2026-0005", customerName: "Meridian Hotel Sdn Bhd", customerRef: "300-C005",
    phone: "082-779 000", serviceDate: "09 Jun 2026 13:00:00", status: "Cancelled",
    customerInfo: "JALAN MATHIES, KAMPUNG AIR, 93000 KUCHING",
    customerReq: "Full hotel floor deep cleaning — 5th floor",
    note: "Cancelled by customer, rescheduled to next week", agentNote: "Hotel undergoing renovation, access blocked",
    agent: "Ahmad Farid", serviceType: "CLEANING SERVICE",
    serviceItem: "Deep Cleaning", serviceItemRef: "CL-011",
    serialNo: "--", furtherDescription: "Level 5, 18 rooms + corridor",
    serviceCharge: 0, commision: 0, itemsTotal: 0,
    photos: [], inprogressAt: "", completedAt: "", createdAt: "08 Jun 2026 10:00:00",
  },
  "JO-2026-0006": {
    jobNo: "JO-2026-0006", customerName: "Blueprint Architecture Sdn Bhd", customerRef: "300-C006",
    phone: "082-445 678", serviceDate: "08 Jun 2026 09:00:00", status: "In Progress",
    customerInfo: "SUITE 3A, LEVEL 3, BANGUNAN BLUEPRINT, JALAN SONG, 93350 KUCHING",
    customerReq: "Built-in cabinet installation in conference room",
    note: "Custom walnut veneer, 3 panels", agentNote: "",
    agent: "Raj Kumar", serviceType: "CARPENTRY & JOINERY",
    serviceItem: "Built-in Cabinet", serviceItemRef: "CP-004",
    serialNo: "--", furtherDescription: "Floor-to-ceiling built-in, conference room B",
    serviceCharge: 1800.00, commision: 8, itemsTotal: 620.00,
    photos: [], inprogressAt: "08 Jun 2026 09:00:00", completedAt: "", createdAt: "05 Jun 2026 14:30:00",
  },
  "JO-2026-0007": {
    jobNo: "JO-2026-0007", customerName: "Maple Heights Condo", customerRef: "300-C007",
    phone: "013-774 9920", serviceDate: "07 Jun 2026 10:30:00", status: "Pending",
    customerInfo: "MAPLE HEIGHTS CONDOMINIUM, JALAN BATU KAWA, 93250 KUCHING",
    customerReq: "Cockroach infestation — B1 carpark level",
    note: "", agentNote: "",
    agent: "Wong Yi Thong", serviceType: "PEST CONTROL SERVICE",
    serviceItem: "Cockroach Extermination", serviceItemRef: "PC-007",
    serialNo: "--", furtherDescription: "B1 carpark + refuse area, gel bait + spray treatment",
    serviceCharge: 350.00, commision: 4, itemsTotal: 0,
    photos: [], inprogressAt: "", completedAt: "", createdAt: "06 Jun 2026 16:00:00",
  },
  "JO-2026-0008": {
    jobNo: "JO-2026-0008", customerName: "FreshMart Superstore", customerRef: "300-C008",
    phone: "082-561 230", serviceDate: "06 Jun 2026 11:00:00", status: "Completed",
    customerInfo: "LOT 1, JALAN STAPOK, 93300 KUCHING",
    customerReq: "Faulty wiring in produce section, flickering lights",
    note: "Replaced 3 junction boxes, re-wired produce section", agentNote: "Recommended full rewire next quarter",
    agent: "Sarah Lim", serviceType: "ELECTRICAL REPAIR",
    serviceItem: "Wiring & Junction Box", serviceItemRef: "EL-017",
    serialNo: "--", furtherDescription: "Produce section, zones 4–6",
    serviceCharge: 320.00, commision: 3, itemsTotal: 210.00,
    photos: [], inprogressAt: "06 Jun 2026 11:00:00", completedAt: "06 Jun 2026 14:45:00", createdAt: "05 Jun 2026 09:30:00",
  },
};

/* ── Notion-style Date Picker ── */
const DAYS_SHORT = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function NotionDatePicker({
  value,
  timeValue,
  onDateChange,
  onTimeChange,
  onClose,
}: {
  value: string;         // "YYYY-MM-DD"
  timeValue: string;     // "HH:mm"
  onDateChange: (d: string) => void;
  onTimeChange: (t: string) => void;
  onClose: () => void;
}) {
  const [year, setYear] = React.useState(() => parseInt(value.split("-")[0] ?? "2026"));
  const [month, setMonth] = React.useState(() => parseInt(value.split("-")[1] ?? "1") - 1);

  const todayStr = new Date().toISOString().slice(0, 10);
  const selectedStr = value;

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div
      className="w-[260px] rounded-[10px] border border-[#e9e9e7] bg-white shadow-[0_8px_32px_rgba(15,15,15,0.14)]"
      onPointerDown={e => e.stopPropagation()}
    >
      {/* Month nav */}
      <div className="flex items-center justify-between px-3 pt-3 pb-1.5">
        <button
          type="button"
          onClick={prevMonth}
          className="flex size-[26px] items-center justify-center rounded-[5px] text-[#9b9a97] transition-colors duration-75 hover:bg-[#f1f0ee] hover:text-[#37352f]"
        >
          <ChevronLeft size={14} strokeWidth={2} />
        </button>
        <span className="text-[13px] font-semibold text-[#37352f]">
          {MONTH_NAMES[month]} {year}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="flex size-[26px] items-center justify-center rounded-[5px] text-[#9b9a97] transition-colors duration-75 hover:bg-[#f1f0ee] hover:text-[#37352f]"
        >
          <ChevronRight size={14} strokeWidth={2} />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 px-2 pb-0.5">
        {DAYS_SHORT.map(d => (
          <div key={d} className="flex h-[28px] items-center justify-center text-[11px] font-medium text-[#9b9a97]">{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 px-2 pb-2">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const cellStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isSelected = cellStr === selectedStr;
          const isToday = cellStr === todayStr;
          return (
            <button
              key={cellStr}
              type="button"
              onClick={() => { onDateChange(cellStr); }}
              className={[
                "flex h-[30px] w-full items-center justify-center rounded-[6px] text-[13px] transition-colors duration-75",
                isSelected
                  ? "bg-[#2383e2] font-semibold text-white"
                  : isToday
                  ? "font-semibold text-[#2383e2] hover:bg-[#f1f0ee]"
                  : "text-[#37352f] hover:bg-[#f1f0ee]",
              ].join(" ")}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Time input */}
      <div className="border-t border-[#e9e9e7] px-3 py-2.5 flex items-center gap-2">
        <CalendarDays size={13} className="text-[#9b9a97] shrink-0" />
        <span className="text-[12px] text-[#9b9a97]">Time</span>
        <input
          type="time"
          value={timeValue}
          onChange={e => onTimeChange(e.target.value)}
          className="ml-auto w-[90px] rounded-[5px] border border-[#e9e9e7] bg-[#f7f6f3] px-2 py-0.5 text-[12px] font-mono text-[#37352f] outline-none focus:border-[#2383e2] transition-colors duration-75"
        />
      </div>

      {/* Done button */}
      <div className="border-t border-[#e9e9e7] px-3 py-2 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="rounded-[5px] bg-[#2383e2] px-3 py-1 text-[12px] font-medium text-white transition-colors duration-75 hover:bg-[#1a73d4]"
        >
          Done
        </button>
      </div>
    </div>
  );
}

/* ── SectionLabel (Notion warm style) ── */
function SectionLabel({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <span className="text-[11px] font-semibold uppercase tracking-[0.6px] text-[#9b9a97] whitespace-nowrap">
        {children}
      </span>
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
function toInputTime(s: string) {
  return s.split(" ")[3]?.slice(0, 5) ?? "00:00";
}
function fromInputDateTime(date: string, time: string) {
  const [y, m, d] = date.split("-");
  const mon = NUM_TO_MONTH[parseInt(m ?? "1") - 1] ?? "Jan";
  return `${parseInt(d ?? "1")} ${mon} ${y} ${time}:00`;
}

/* ── Page ── */
/* Notion edit-mode: soft gray bg, no border */
const INLINE_INPUT =
  "w-full bg-[#f1f0ee] rounded-[4px] px-2 py-1 outline-none border-none text-[#37352f] placeholder:text-[#c4c2be] caret-[#2383e2] focus:bg-[#e9e9e7] transition-colors duration-75";
const INLINE_TEXTAREA =
  "w-full resize-none bg-[#f1f0ee] rounded-[4px] px-2 py-1.5 outline-none border-none text-[#37352f] placeholder:text-[#c4c2be] caret-[#2383e2] leading-[20px] focus:bg-[#e9e9e7] transition-colors duration-75";

export default function JobOrderDetailPage() {
  const params = useParams();
  const jobId = typeof params.jobId === "string" ? params.jobId : "";
  const detail = JOB_ORDER_DETAILS[jobId] ?? null;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<JobOrderDetail>(detail ?? ({} as JobOrderDetail));
  const [openProp, setOpenProp] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const fu = (delay: number) => ({
    initial: { opacity: 0, y: shouldReduceMotion ? 0 : 14 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: shouldReduceMotion ? 0 : delay, duration: 0.32, ease: [0.22, 1, 0.36, 1] as const },
  });

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
    // setTimeout 0 让当次开启的 click 事件先完成，再挂监听器，避免立即触发关闭
    const id = setTimeout(() => document.addEventListener("pointerdown", onPointer), 0);
    return () => { clearTimeout(id); document.removeEventListener("pointerdown", onPointer); };
  }, [showDatePicker]);

  if (!detail) {
    notFound();
    return null;
  }

  const set = (key: keyof JobOrderDetail, val: string | number) =>
    setForm(prev => ({ ...prev, [key]: val }));

  function handleSave() { setIsEditing(false); setOpenProp(null); }
  function handleCancel() { setForm({ ...detail }); setIsEditing(false); setOpenProp(null); }

  const { color: customerColor, Icon: CustomerIcon } = resolveCustomerMeta(detail.customerName);

  const serviceCategory = JOB_SERVICE_CATEGORIES[detail.jobNo] ?? "";

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
  const pageEmoji = categoryEmoji[serviceCategory] ?? "📋";
  const { color: svcColor, Icon: SvcIcon } = SERVICE_CATEGORY_META[serviceCategory] ?? { color: "#64748b", Icon: Wrench };

  const statusMeta: Record<string, { cls: string; dot: string }> = {
    "Completed":   { cls: "bg-[#ddedea] text-[#2d8653]",  dot: "#2d8653" },
    "In Progress": { cls: "bg-[#ddebf7] text-[#1d6fbd]",  dot: "#1d6fbd" },
    "Pending":     { cls: "bg-[#fdecc8] text-[#b45309]",  dot: "#b45309" },
    "Cancelled":   { cls: "bg-[#e3e2e0] text-[#787774]",  dot: "#9b9a97" },
  };
  const chip = statusMeta[form.status] ?? { cls: "bg-[#e3e2e0] text-[#787774]", dot: "#9b9a97" };

  const techAvatarBg: Record<string, string> = {
    "Ahmad Farid":   "#0891b2",
    "Wong Yi Thong": "#1a73e8",
    "Raj Kumar":     "#7c3aed",
    "Sarah Lim":     "#db2777",
  };
  const agentColor = techAvatarBg[form.agent] ?? "#64748b";
  const agentInitial = form.agent.split(" ").filter(Boolean)[0]?.[0]?.toUpperCase() ?? "?";

  const dateParts = form.serviceDate.split(" ");
  const dateDisplay = dateParts.slice(0, 3).join(" ");
  const timeDisplay = dateParts[3]?.slice(0, 5) ?? null;

  const timelineSteps = [
    { label: "Created",     ts: detail.createdAt,    dotColor: "#64748b" },
    { label: "In Progress", ts: detail.inprogressAt, dotColor: "#2563eb" },
    { label: "Completed",   ts: detail.completedAt,  dotColor: "#16a34a" },
  ];

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
            <Menu size={16} strokeWidth={1.8} aria-hidden="true" />
          </button>

          <Link
            href="/joborder-employee"
            className="flex items-center gap-1.5 text-[14px] text-[#9b9a97] transition-colors duration-75 hover:text-[#37352f]"
          >
            <ArrowLeft size={13} strokeWidth={2} aria-hidden="true" />
            Joborder Employee
          </Link>

          <div className="ml-auto flex items-center gap-1.5">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="inline-flex h-[30px] items-center gap-1.5 rounded-[6px] px-3 text-[14px] text-[#787774] outline-none transition-colors duration-75 hover:bg-[#f1f0ee] hover:text-[#37352f]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex h-[30px] items-center gap-1.5 rounded-[6px] bg-[#2383e2] px-3.5 text-[14px] font-medium text-white outline-none transition-colors duration-75 hover:bg-[#1a73d4]"
                >
                  Save
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex h-[30px] items-center gap-1.5 rounded-[6px] px-3 text-[14px] text-[#787774] outline-none transition-colors duration-75 hover:bg-[#f1f0ee] hover:text-[#37352f]"
                >
                  <Pencil size={13} strokeWidth={1.8} aria-hidden="true" />
                  Edit
                </button>
                <button
                  type="button"
                  className="inline-flex h-[30px] items-center gap-1.5 rounded-[6px] px-3 text-[14px] text-[#eb5757] outline-none transition-colors duration-75 hover:bg-[#ffeef0]"
                >
                  <Trash2 size={13} strokeWidth={1.8} aria-hidden="true" />
                  Delete
                </button>
              </>
            )}
          </div>
        </header>

        {/* ── Two-column body ── */}
        <div className="flex flex-1 min-h-0 overflow-hidden">

          {/* Left column */}
          <div className="flex-1 overflow-y-auto px-10 py-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

            <motion.div {...fu(0.04)}>
              {/* Page icon — one emoji, Notion style */}
              <div className="mb-3 text-[52px] leading-none select-none">{pageEmoji}</div>

              {/* Page title */}
              <h1 className="text-[26px] font-bold tracking-[-0.4px] text-[#37352f] leading-[1.25]">
                {detail.customerName}
              </h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[13px] text-[#9b9a97]">
                <span>{detail.customerRef}</span>
                {detail.phone && (
                  <>
                    <span className="text-[#e3e2e0]">·</span>
                    <a href={`tel:${detail.phone}`} className="transition-colors duration-75 hover:text-[#37352f]">
                      {detail.phone}
                    </a>
                  </>
                )}
              </div>
              {detail.customerInfo && (
                <p className="mt-0.5 text-[12px] leading-[20px] text-[#9b9a97]">{detail.customerInfo}</p>
              )}

              <div className="my-6 h-px bg-[#e9e9e7]" />
            </motion.div>

            {/* SERVICE ITEM */}
            <motion.div {...fu(0.11)}>
            <SectionLabel>Service Item</SectionLabel>
            <div className="mb-6 min-w-0">
              {isEditing ? (
                <div className="flex flex-col -mx-2">
                  {([
                    { label: "Name",        field: "serviceItem",      mono: false },
                    { label: "Ref",         field: "serviceItemRef",   mono: true  },
                    { label: "Serial No",   field: "serialNo",         mono: true  },
                    { label: "Description", field: "furtherDescription", mono: false },
                  ] as const).map(({ label, field, mono }) => (
                    <div key={field} className="flex items-center min-h-[36px] rounded-[4px] px-2 hover:bg-[#f1f0ee] transition-colors duration-75">
                      <span className="w-[130px] shrink-0 text-[14px] text-[#9b9a97]">{label}</span>
                      <input
                        className={`${INLINE_INPUT} ${mono ? "font-mono text-[13px] text-[#787774]" : "text-[14px]"}`}
                        value={field === "serialNo" && form[field] === "--" ? "" : String(form[field])}
                        onChange={e => set(field, field === "serialNo" ? (e.target.value || "--") : e.target.value)}
                        placeholder={label}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <p className="text-[14px] font-semibold text-[#37352f]">{form.serviceItem}</p>
                  <p className="mt-0.5 font-mono text-[12px] text-[#9b9a97]">
                    {form.serviceItemRef}
                    {form.serialNo && form.serialNo !== "--" && ` · S/N ${form.serialNo}`}
                  </p>
                  {form.furtherDescription && (
                    <p className="mt-1.5 text-[13px] leading-[20px] text-[#787774]">{form.furtherDescription}</p>
                  )}
                </>
              )}
            </div>
            </motion.div>

            {/* REQUIREMENT */}
            {(isEditing || form.customerReq) && (
              <motion.div {...fu(0.18)}>
                <SectionLabel>Requirement</SectionLabel>
                {isEditing ? (
                  <div className="mb-6 -mx-2 rounded-[4px] px-2 py-1.5 hover:bg-[#f1f0ee] transition-colors duration-75">
                    <textarea
                      className={`${INLINE_TEXTAREA} text-[13px]`}
                      rows={3}
                      value={form.customerReq}
                      onChange={e => set("customerReq", e.target.value)}
                      placeholder="Customer requirement"
                    />
                  </div>
                ) : (
                  <p className="mb-6 text-[13px] leading-[20px] text-[#37352f]">{form.customerReq}</p>
                )}
              </motion.div>
            )}

            {/* NOTES */}
            {(isEditing || form.note || form.agentNote) && (
              <motion.div {...fu(0.25)}>
                <SectionLabel>Notes</SectionLabel>
                {isEditing ? (
                  <div className="mb-6">
                    <textarea
                      className={`${INLINE_TEXTAREA} text-[13px]`}
                      rows={3}
                      value={[form.note, form.agentNote].filter(Boolean).join("\n")}
                      onChange={e => { set("note", e.target.value); set("agentNote", ""); }}
                      placeholder="Add a note…"
                    />
                  </div>
                ) : (
                  <div className="mb-6 flex flex-col gap-2">
                    {form.note && (
                      <div className="flex gap-2.5">
                        <span className="mt-[8px] size-[4px] shrink-0 rounded-full bg-[#c7c7c7]" />
                        <p className="text-[13px] leading-[20px] text-[#37352f]">{form.note}</p>
                      </div>
                    )}
                    {form.agentNote && (
                      <div className="flex gap-2.5">
                        <span className="mt-[8px] size-[4px] shrink-0 rounded-full bg-[#a8c8ee]" />
                        <p className="text-[13px] leading-[20px] text-[#37352f]">{form.agentNote}</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* TIMELINE */}
            <motion.div {...fu(0.32)}>
            <SectionLabel>Timeline</SectionLabel>
            <div className="flex flex-col">
              {timelineSteps.map((step, i) => {
                const isDone = Boolean(step.ts);
                const isLast = i === timelineSteps.length - 1;
                const parts = step.ts?.split(" ") ?? [];
                const tsDisplay = isDone
                  ? parts.slice(0, 3).join(" ") + (parts[3] ? " " + parts[3].slice(0, 5) : "")
                  : "—";
                return (
                  <div key={step.label} className="flex gap-3">
                    <div className="flex w-[13px] flex-col items-center">
                      <span
                        className="mt-[3px] size-[13px] shrink-0 rounded-full border-2 flex items-center justify-center"
                        style={isDone
                          ? { borderColor: step.dotColor, background: step.dotColor }
                          : { borderColor: "#d4d3d0", background: "#fff" }
                        }
                      >
                        {isDone && <span className="size-[3px] rounded-full bg-white" />}
                      </span>
                      {!isLast && (
                        <span
                          className="mt-0.5 w-[2px] flex-1 min-h-[16px] rounded-full"
                          style={{ background: isDone ? `${step.dotColor}35` : "#e9e9e7" }}
                        />
                      )}
                    </div>
                    <div className={`flex flex-1 items-baseline justify-between gap-2 ${isLast ? "pb-0" : "pb-4"}`}>
                      <span
                        className="text-[13px] font-medium"
                        style={{ color: isDone ? step.dotColor : "#c7c7c7" }}
                      >
                        {step.label}
                      </span>
                      <span className="font-mono text-[12px] tabular-nums text-[#9b9a97]">{tsDisplay}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            </motion.div>

          </div>

          {/* Right sidebar — Notion property panel */}
          <div className="w-[440px] shrink-0 border-l border-[#e9e9e7] overflow-y-auto px-8 py-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

            {/* Status — custom dropdown */}
            <motion.div {...fu(0.07)}>
            <div className="mb-1 relative" ref={openProp === "status" ? dropdownRef : undefined}>
              <button
                type="button"
                onClick={() => isEditing && setOpenProp(p => p === "status" ? null : "status")}
                className={`inline-flex h-[24px] items-center gap-1.5 rounded-[4px] px-2.5 text-[13px] font-medium ${isEditing ? "bg-[#f1f0ee] text-[#37352f] cursor-pointer" : `${chip.cls} cursor-default`}`}
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
                    {(["In Progress", "Pending", "Completed", "Cancelled"] as const).map(s => {
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
                {isEditing ? (
                  <button
                    type="button"
                    onClick={() => setShowDatePicker(p => !p)}
                    className="flex items-center gap-1.5 rounded-[4px] px-2 py-0.5 text-[14px] text-[#37352f] transition-colors duration-75 hover:bg-[#e9e9e7] bg-[#f1f0ee]"
                  >
                    <span>{dateDisplay}</span>
                    {timeDisplay && <span className="font-mono text-[12px] text-[#9b9a97]">{timeDisplay}</span>}
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span className="text-[14px] text-[#37352f]">{dateDisplay}</span>
                    {timeDisplay && <span className="font-mono text-[13px] text-[#9b9a97]">{timeDisplay}</span>}
                  </div>
                )}
                <AnimatePresence>
                  {showDatePicker && isEditing && (
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
                  onClick={() => isEditing && setOpenProp(p => p === "agent" ? null : "agent")}
                  className={`flex items-center gap-2 text-[14px] text-[#37352f] text-left rounded-[4px] px-2 py-0.5 transition-colors duration-75 ${isEditing ? "bg-[#f1f0ee] cursor-pointer hover:bg-[#e9e9e7]" : "cursor-default"}`}
                >
                  <span
                    className="flex size-[18px] shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white"
                    style={{ background: agentColor }}
                  >{agentInitial}</span>
                  {form.agent}
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
                        const colors: Record<string, string> = {
                          "Ahmad Farid": "#0891b2", "Wong Yi Thong": "#1a73e8",
                          "Raj Kumar": "#7c3aed", "Sarah Lim": "#db2777",
                        };
                        const ini = name.split(" ")[0]?.[0]?.toUpperCase() ?? "?";
                        return (
                          <button
                            key={name}
                            type="button"
                            onClick={() => { set("agent", name); setOpenProp(null); }}
                            className="flex w-full items-center gap-2.5 rounded-[5px] px-2 py-2 text-left text-[13px] text-[#37352f] transition-colors duration-75 hover:bg-[#f1f0ee]"
                          >
                            <span className="flex size-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white" style={{ background: colors[name] ?? "#64748b" }}>{ini}</span>
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
                {isEditing ? (
                  <input className={`${INLINE_INPUT} text-[14px]`} value={form.serviceType} onChange={e => set("serviceType", e.target.value)} />
                ) : (
                  <span className="text-[14px] leading-[22px] text-[#37352f]">{form.serviceType}</span>
                )}
              </div>

              {/* Item */}
              <div className="flex items-center min-h-[36px] rounded-[4px] px-2 transition-colors duration-75 hover:bg-[#f1f0ee]">
                <div className="flex items-center gap-2 w-[150px] shrink-0">
                  <Package size={14} className="text-[#9b9a97] shrink-0" strokeWidth={1.8} />
                  <span className="text-[14px] text-[#787774]">Item</span>
                </div>
                <span className="text-[14px] text-[#37352f]">{form.serviceItem}</span>
              </div>

              {/* Ref */}
              <div className="flex items-center min-h-[36px] rounded-[4px] px-2 transition-colors duration-75 hover:bg-[#f1f0ee]">
                <div className="flex items-center gap-2 w-[150px] shrink-0">
                  <Tag size={14} className="text-[#9b9a97] shrink-0" strokeWidth={1.8} />
                  <span className="text-[14px] text-[#787774]">Ref</span>
                </div>
                <span className="font-mono text-[13px] text-[#787774]">{form.serviceItemRef}</span>
              </div>

              {/* S/N */}
              {form.serialNo && form.serialNo !== "--" && (
                <div className="flex items-center min-h-[36px] rounded-[4px] px-2 transition-colors duration-75 hover:bg-[#f1f0ee]">
                  <div className="flex items-center gap-2 w-[150px] shrink-0">
                    <Hash size={14} className="text-[#9b9a97] shrink-0" strokeWidth={1.8} />
                    <span className="text-[14px] text-[#787774]">Serial No</span>
                  </div>
                  <span className="font-mono text-[13px] text-[#787774]">{form.serialNo}</span>
                </div>
              )}

              {/* Phone */}
              {detail.phone && (
                <div className="flex items-center min-h-[36px] rounded-[4px] px-2 transition-colors duration-75 hover:bg-[#f1f0ee]">
                  <div className="flex items-center gap-2 w-[150px] shrink-0">
                    <Phone size={14} className="text-[#9b9a97] shrink-0" strokeWidth={1.8} />
                    <span className="text-[14px] text-[#787774]">Phone</span>
                  </div>
                  <a href={`tel:${detail.phone}`} className="text-[14px] text-[#37352f] transition-colors duration-75 hover:text-[#2383e2]">
                    {detail.phone}
                  </a>
                </div>
              )}

            </div>
            </motion.div>

            <motion.div {...fu(0.21)}>
            <div className="my-5 h-px bg-[#e9e9e7]" />

            {/* Financial rows */}
            <div className="flex flex-col -mx-2">

              <div className="flex items-center min-h-[36px] rounded-[4px] px-2 transition-colors duration-75 hover:bg-[#f1f0ee]">
                <span className="w-[150px] shrink-0 text-[14px] text-[#787774]">Service charge</span>
                {isEditing ? (
                  <div className="flex items-center gap-1 flex-1">
                    <span className="text-[13px] text-[#9b9a97]">RM</span>
                    <input
                      type="number"
                      className={`${INLINE_INPUT} font-mono text-[14px] tabular-nums`}
                      value={form.serviceCharge}
                      onChange={e => set("serviceCharge", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                ) : (
                  <span className="font-mono text-[14px] tabular-nums text-[#37352f]">RM {form.serviceCharge.toFixed(2)}</span>
                )}
              </div>

              <div className="flex items-center min-h-[36px] rounded-[4px] px-2 transition-colors duration-75 hover:bg-[#f1f0ee]">
                <span className="w-[150px] shrink-0 text-[14px] text-[#787774]">Items</span>
                {isEditing ? (
                  <div className="flex items-center gap-1 flex-1">
                    <span className="text-[13px] text-[#9b9a97]">RM</span>
                    <input
                      type="number"
                      className={`${INLINE_INPUT} font-mono text-[14px] tabular-nums`}
                      value={form.itemsTotal}
                      onChange={e => set("itemsTotal", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                ) : (
                  <span className="font-mono text-[14px] tabular-nums text-[#37352f]">RM {form.itemsTotal.toFixed(2)}</span>
                )}
              </div>

            </div>
            </motion.div>

            <motion.div {...fu(0.28)}>
            <div className="my-5 h-px bg-[#37352f]/10" />

            {/* Total */}
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
