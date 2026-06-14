"use client";

import { DashboardSidebar } from "@/components/sidebar";
import {
  AlertCircle,
  ArrowUpDown,
  Box,
  Building2,
  Calculator,
  CalendarDays,
  Camera,
  Car,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Clock3,
  Code2,
  Cpu,
  Droplets,
  Ellipsis,
  Factory,
  FileText,
  Film,
  FlaskConical,
  Flame,
  Globe,
  GraduationCap,
  Hammer,
  HardHat,
  Hash,
  HeartPulse,
  Info,
  Landmark,
  MapPin,
  ListFilter,
  Megaphone,
  Menu,
  Monitor,
  Newspaper,
  Package,
  Phone,
  Plane,
  Pencil,
  Plus,
  Recycle,
  Scale,
  Search,
  Shield,
  Shirt,
  Sofa,
  Sparkles,
  Store,
  Tag,
  Thermometer,
  Truck,
  UserRound,
  Utensils,
  Wheat,
  Wind,
  Trash2,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

const jobOrders = [
  {
    jobNo: "JO-2026-0001",
    customer: "Parkway Mall Sdn Bhd",
    serviceDate: "12 Jun 2026",
    status: "In Progress",
    technician: "Ahmad Farid",
    serviceCategory: "HVAC",
  },
  {
    jobNo: "JO-2026-0002",
    customer: "TechCore Solutions Sdn Bhd",
    serviceDate: "11 Jun 2026",
    status: "Completed",
    technician: "Wong Yi Thong",
    serviceCategory: "IT Support",
  },
  {
    jobNo: "JO-2026-0003",
    customer: "Sunrise Residence",
    serviceDate: "10 Jun 2026",
    status: "Pending",
    technician: "Raj Kumar",
    serviceCategory: "Electrical",
  },
  {
    jobNo: "JO-2026-0004",
    customer: "Green Valley Café",
    serviceDate: "10 Jun 2026",
    status: "Completed",
    technician: "Sarah Lim",
    serviceCategory: "Plumbing",
  },
  {
    jobNo: "JO-2026-0005",
    customer: "Meridian Hotel Sdn Bhd",
    serviceDate: "09 Jun 2026",
    status: "Cancelled",
    technician: "Ahmad Farid",
    serviceCategory: "Cleaning",
  },
  {
    jobNo: "JO-2026-0006",
    customer: "Blueprint Architecture Sdn Bhd",
    serviceDate: "08 Jun 2026",
    status: "In Progress",
    technician: "Raj Kumar",
    serviceCategory: "Carpentry",
  },
  {
    jobNo: "JO-2026-0007",
    customer: "Maple Heights Condo",
    serviceDate: "07 Jun 2026",
    status: "Pending",
    technician: "Wong Yi Thong",
    serviceCategory: "Pest Control",
  },
  {
    jobNo: "JO-2026-0008",
    customer: "FreshMart Superstore",
    serviceDate: "06 Jun 2026",
    status: "Completed",
    technician: "Sarah Lim",
    serviceCategory: "Electrical",
  },
];

const sortOptions = [
  { key: "serviceDate", label: "Service Date", helper: "Newest first" },
  { key: "customer",    label: "Customer",     helper: "A to Z" },
  { key: "jobNo",       label: "Job No",        helper: "Latest first" },
  { key: "technician",  label: "Technician",   helper: "A to Z" },
  { key: "status",      label: "Status",        helper: "Attention first" },
  { key: "serviceCategory", label: "Category",  helper: "A to Z" },
] as const;

type JobOrder = (typeof jobOrders)[number];
type SortKey = (typeof sortOptions)[number]["key"];
type SortDirection = "asc" | "desc";
type StatusFilter = "all" | JobOrder["status"];

const statusOptions = [
  { key: "all",         label: "All statuses",  helper: "Show every job order" },
  { key: "Pending",     label: "Pending",        helper: "Awaiting start" },
  { key: "In Progress", label: "In Progress",    helper: "Currently active" },
  { key: "Completed",   label: "Completed",      helper: "Job done" },
  { key: "Cancelled",   label: "Cancelled",      helper: "Cancelled job" },
] as const;

const defaultSortDirections: Record<SortKey, SortDirection> = {
  serviceDate: "desc",
  customer: "asc",
  jobNo: "desc",
  technician: "asc",
  status: "desc",
  serviceCategory: "asc",
};

function getSortValue(order: JobOrder, key: SortKey) {
  if (key === "serviceDate") return new Date(order.serviceDate).getTime();
  if (key === "status") return ({ "Pending": 4, "In Progress": 3, "Completed": 2, "Cancelled": 1 }[order.status] ?? 0);
  return order[key];
}

/* ── Customer industry resolution (same pattern as purchase-invoice) ── */
type CustomerMeta = { color: string; Icon: React.ElementType };

const customerMetaMap: Record<string, CustomerMeta> = {
  "Parkway Mall Sdn Bhd":          { color: "#7c3aed", Icon: Store },
  "TechCore Solutions Sdn Bhd":    { color: "#6366f1", Icon: Code2 },
  "Sunrise Residence":             { color: "#78350f", Icon: Building2 },
  "Green Valley Café":             { color: "#16a34a", Icon: Utensils },
  "Meridian Hotel Sdn Bhd":        { color: "#0ea5e9", Icon: Plane },
  "Blueprint Architecture Sdn Bhd":{ color: "#d97706", Icon: HardHat },
  "Maple Heights Condo":           { color: "#92400e", Icon: Building2 },
  "FreshMart Superstore":          { color: "#7c3aed", Icon: Store },
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

/* ── Job Order Detail ── */
type JobOrderDetail = {
  jobNo: string;
  customerName: string;
  customerRef: string;
  debtorType: string;
  customerSource: string;
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
  serviceItemSource: string;
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
    debtorType: "STD-CUST", customerSource: "debtor", phone: "082-412 888",
    serviceDate: "12 Jun 2026 09:30:00", status: "In Progress",
    customerInfo: "LOT 42, PARKWAY PARADE, JALAN UTAMA, 93000 KUCHING",
    customerReq: "HVAC unit not cooling, temperature unstable",
    note: "Check refrigerant levels and compressor", agentNote: "Customer requests completion by EOD",
    agent: "Ahmad Farid", serviceType: "HVAC MAINTENANCE CONTRACT",
    serviceItem: "Air Conditioning Unit", serviceItemSource: "standard", serviceItemRef: "HVAC-001",
    serialNo: "AC-2024-0042", furtherDescription: "Split unit 2.0HP ceiling cassette",
    serviceCharge: 280.00, commision: 5, itemsTotal: 120.00,
    photos: [], inprogressAt: "12 Jun 2026 09:30:00", completedAt: "", createdAt: "12 Jun 2026 08:15:00",
  },
  "JO-2026-0002": {
    jobNo: "JO-2026-0002", customerName: "TechCore Solutions Sdn Bhd", customerRef: "300-C002",
    debtorType: "STD-CUST", customerSource: "debtor", phone: "082-233 456",
    serviceDate: "11 Jun 2026 14:00:00", status: "Completed",
    customerInfo: "LEVEL 8, WISMA TECHCORE, JALAN TUNKU ABDUL RAHMAN, 93100 KUCHING",
    customerReq: "Network server down, unable to access shared drives",
    note: "Reset network switch, reconfigured DHCP", agentNote: "",
    agent: "Wong Yi Thong", serviceType: "IT REMOTE SUPPORT (CONTRACT CUSTOMER)",
    serviceItem: "Network Switch", serviceItemSource: "standard", serviceItemRef: "IT-022",
    serialNo: "NS-2023-0088", furtherDescription: "Cisco SG350 24-port managed switch",
    serviceCharge: 0, commision: 2, itemsTotal: 0,
    photos: [], inprogressAt: "11 Jun 2026 14:00:00", completedAt: "11 Jun 2026 15:30:00", createdAt: "11 Jun 2026 13:00:00",
  },
  "JO-2026-0003": {
    jobNo: "JO-2026-0003", customerName: "Sunrise Residence", customerRef: "300-C003",
    debtorType: "STD-CUST", customerSource: "debtor", phone: "019-882 7712",
    serviceDate: "10 Jun 2026 10:00:00", status: "Pending",
    customerInfo: "NO 12, JALAN MATAHARI 3, TAMAN SUNRISE, 93350 KUCHING",
    customerReq: "Power trip in master bedroom circuit",
    note: "", agentNote: "",
    agent: "Raj Kumar", serviceType: "ELECTRICAL INSPECTION",
    serviceItem: "Circuit Breaker", serviceItemSource: "custom", serviceItemRef: "EL-009",
    serialNo: "--", furtherDescription: "40A MCB main panel replacement",
    serviceCharge: 150.00, commision: 3, itemsTotal: 85.00,
    photos: [], inprogressAt: "", completedAt: "", createdAt: "09 Jun 2026 17:45:00",
  },
  "JO-2026-0004": {
    jobNo: "JO-2026-0004", customerName: "Green Valley Café", customerRef: "300-C004",
    debtorType: "STD-CUST", customerSource: "debtor", phone: "011-2398 4410",
    serviceDate: "10 Jun 2026 08:30:00", status: "Completed",
    customerInfo: "LOT 7, GROUND FLOOR, GREEN VALLEY SQUARE, 93400 KUCHING",
    customerReq: "Kitchen sink blocked, water not draining",
    note: "Cleared blockage, checked grease trap", agentNote: "Advised customer to use enzyme cleaner monthly",
    agent: "Sarah Lim", serviceType: "PLUMBING SERVICE",
    serviceItem: "Drain Cleaning", serviceItemSource: "standard", serviceItemRef: "PL-003",
    serialNo: "--", furtherDescription: "Commercial kitchen drain unclogging",
    serviceCharge: 120.00, commision: 2, itemsTotal: 30.00,
    photos: [], inprogressAt: "10 Jun 2026 08:30:00", completedAt: "10 Jun 2026 10:00:00", createdAt: "09 Jun 2026 22:10:00",
  },
  "JO-2026-0005": {
    jobNo: "JO-2026-0005", customerName: "Meridian Hotel Sdn Bhd", customerRef: "300-C005",
    debtorType: "STD-CUST", customerSource: "debtor", phone: "082-779 000",
    serviceDate: "09 Jun 2026 13:00:00", status: "Cancelled",
    customerInfo: "JALAN MATHIES, KAMPUNG AIR, 93000 KUCHING",
    customerReq: "Full hotel floor deep cleaning — 5th floor",
    note: "Cancelled by customer, rescheduled to next week", agentNote: "Hotel undergoing renovation, access blocked",
    agent: "Ahmad Farid", serviceType: "CLEANING SERVICE",
    serviceItem: "Deep Cleaning", serviceItemSource: "standard", serviceItemRef: "CL-011",
    serialNo: "--", furtherDescription: "Level 5, 18 rooms + corridor",
    serviceCharge: 0, commision: 0, itemsTotal: 0,
    photos: [], inprogressAt: "", completedAt: "", createdAt: "08 Jun 2026 10:00:00",
  },
  "JO-2026-0006": {
    jobNo: "JO-2026-0006", customerName: "Blueprint Architecture Sdn Bhd", customerRef: "300-C006",
    debtorType: "STD-CUST", customerSource: "debtor", phone: "082-445 678",
    serviceDate: "08 Jun 2026 09:00:00", status: "In Progress",
    customerInfo: "SUITE 3A, LEVEL 3, BANGUNAN BLUEPRINT, JALAN SONG, 93350 KUCHING",
    customerReq: "Built-in cabinet installation in conference room",
    note: "Custom walnut veneer, 3 panels", agentNote: "",
    agent: "Raj Kumar", serviceType: "CARPENTRY & JOINERY",
    serviceItem: "Built-in Cabinet", serviceItemSource: "custom", serviceItemRef: "CP-004",
    serialNo: "--", furtherDescription: "Floor-to-ceiling built-in, conference room B",
    serviceCharge: 1800.00, commision: 8, itemsTotal: 620.00,
    photos: [], inprogressAt: "08 Jun 2026 09:00:00", completedAt: "", createdAt: "05 Jun 2026 14:30:00",
  },
  "JO-2026-0007": {
    jobNo: "JO-2026-0007", customerName: "Maple Heights Condo", customerRef: "300-C007",
    debtorType: "STD-CUST", customerSource: "debtor", phone: "013-774 9920",
    serviceDate: "07 Jun 2026 10:30:00", status: "Pending",
    customerInfo: "MAPLE HEIGHTS CONDOMINIUM, JALAN BATU KAWA, 93250 KUCHING",
    customerReq: "Cockroach infestation — B1 carpark level",
    note: "", agentNote: "",
    agent: "Wong Yi Thong", serviceType: "PEST CONTROL SERVICE",
    serviceItem: "Cockroach Extermination", serviceItemSource: "standard", serviceItemRef: "PC-007",
    serialNo: "--", furtherDescription: "B1 carpark + refuse area, gel bait + spray treatment",
    serviceCharge: 350.00, commision: 4, itemsTotal: 0,
    photos: [], inprogressAt: "", completedAt: "", createdAt: "06 Jun 2026 16:00:00",
  },
  "JO-2026-0008": {
    jobNo: "JO-2026-0008", customerName: "FreshMart Superstore", customerRef: "300-C008",
    debtorType: "STD-CUST", customerSource: "debtor", phone: "082-561 230",
    serviceDate: "06 Jun 2026 11:00:00", status: "Completed",
    customerInfo: "LOT 1, JALAN STAPOK, 93300 KUCHING",
    customerReq: "Faulty wiring in produce section, flickering lights",
    note: "Replaced 3 junction boxes, re-wired produce section", agentNote: "Recommended full rewire next quarter",
    agent: "Sarah Lim", serviceType: "ELECTRICAL REPAIR",
    serviceItem: "Wiring & Junction Box", serviceItemSource: "standard", serviceItemRef: "EL-017",
    serialNo: "--", furtherDescription: "Produce section, zones 4–6",
    serviceCharge: 320.00, commision: 3, itemsTotal: 210.00,
    photos: [], inprogressAt: "06 Jun 2026 11:00:00", completedAt: "06 Jun 2026 14:45:00", createdAt: "05 Jun 2026 09:30:00",
  },
};

/* ── View Job Order Drawer — Compact Side Sheet ── */
function SectionLabel({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <span className="text-[11px] font-semibold uppercase tracking-[0.55px] text-[#b0b7c3] whitespace-nowrap">
        {children}
      </span>
      <div className="h-px flex-1 bg-[#f0f1f3]" />
    </div>
  );
}

function ViewJobOrderDrawer({
  detail,
  onClose,
}: Readonly<{ detail: JobOrderDetail; onClose: () => void }>) {
  const shouldReduceMotion = useReducedMotion();

  const { color: customerColor, Icon: CustomerIcon } = resolveCustomerMeta(detail.customerName);

  const statusChip: Record<string, string> = {
    "Completed":   "bg-[#e9f7ef] text-[#1f7a4d]",
    "In Progress": "bg-[#eff6ff] text-[#1d4ed8]",
    "Pending":     "bg-[#fff4db] text-[#9a6700]",
    "Cancelled":   "bg-[#f1f0ee] text-[#5f5e59]",
  };

  const techAvatarBg: Record<string, string> = {
    "Ahmad Farid":   "#0891b2",
    "Wong Yi Thong": "#1a73e8",
    "Raj Kumar":     "#7c3aed",
    "Sarah Lim":     "#db2777",
  };
  const agentInitial = detail.agent.split(" ").filter(Boolean)[0]?.[0]?.toUpperCase() ?? "?";

  const dateparts = detail.serviceDate.split(" ");
  const dateDisplay = dateparts.slice(0, 3).join(" ");
  const timeDisplay = dateparts[3]?.slice(0, 5) ?? null;

  const total = detail.serviceCharge + detail.itemsTotal;

  const timelineSteps = [
    { label: "Created",     ts: detail.createdAt,    dotColor: "#64748b" },
    { label: "In Progress", ts: detail.inprogressAt, dotColor: "#2563eb" },
    { label: "Completed",   ts: detail.completedAt,  dotColor: "#16a34a" },
  ];

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 flex justify-end overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-black/[0.16] backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: shouldReduceMotion ? 0.14 : 0.22, ease: [0.16, 1, 0.3, 1] }}
        onClick={onClose}
      />

      <motion.div
        className="relative z-10 flex h-full w-[var(--dashboard-drawer-w)] max-w-full transform-gpu flex-col bg-white shadow-[-1px_0_0_#e8eaed,_-24px_0_64px_rgba(0,0,0,0.06)]"
        initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 72, scale: 0.985, filter: "blur(2px)" }}
        animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
        exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 48, scale: 0.99, filter: "blur(1.5px)" }}
        transition={{ duration: shouldReduceMotion ? 0.16 : 0.34, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformOrigin: "right center", willChange: "transform, opacity, filter" }}
      >
        {/* ── 1: Header ── */}
        <div className="flex shrink-0 items-start justify-between gap-2 px-6 pt-5 pb-4 border-b border-[#f0f1f3]">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[14px] font-semibold tracking-[-0.1px] text-[#0f172a]">
                {detail.jobNo}
              </span>
              <span className={`inline-flex h-[20px] items-center rounded-[5px] px-2 text-[11px] font-semibold shrink-0 ${statusChip[detail.status] ?? "bg-[#f1f0ee] text-[#5f5e59]"}`}>
                {detail.status}
              </span>
            </div>
            <p className="mt-1.5 text-[18px] font-bold leading-[1.3] tracking-[-0.4px] text-[#0f172a]">
              {detail.customerName}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] text-[#64748b]">
              <span>{detail.customerRef}</span>
              {detail.phone && (
                <>
                  <span className="text-[#cbd5e1]">·</span>
                  <a href={`tel:${detail.phone}`} className="hover:text-[#2563eb] transition-colors duration-75">{detail.phone}</a>
                </>
              )}
            </div>
            {detail.customerInfo && (
              <p className="mt-0.5 text-[11px] leading-[16px] text-[#94a3b8]">{detail.customerInfo}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-[6px] text-[#94a3b8] outline-none transition-colors duration-75 hover:bg-[#f1f5f9] hover:text-[#475569]"
          >
            <X size={14} strokeWidth={2} />
          </button>
        </div>

        {/* ── 2: Tag pills row ── */}
        <div className="shrink-0 px-6 py-3 border-b border-[#f0f1f3] flex flex-wrap gap-1.5">
          <span className="inline-flex h-[26px] items-center gap-1.5 rounded-[6px] bg-[#f1f5f9] px-2.5 text-[12px] font-medium text-[#475569]">
            <CalendarDays size={12} strokeWidth={1.8} className="text-[#94a3b8] shrink-0" aria-hidden="true" />
            {dateDisplay}{timeDisplay && <span className="text-[#94a3b8]">{timeDisplay}</span>}
          </span>
          <span className="inline-flex h-[26px] items-center gap-1.5 rounded-full bg-[#f1f5f9] pl-1.5 pr-2.5 text-[12px] font-medium text-[#475569]">
            <span
              className="flex size-[16px] shrink-0 items-center justify-center rounded-full text-[8px] font-bold text-white"
              style={{ background: techAvatarBg[detail.agent] ?? "#64748b" }}
            >
              {agentInitial}
            </span>
            {detail.agent}
          </span>
          <span className="inline-flex h-[26px] items-center gap-1.5 rounded-[6px] bg-[#f1f5f9] px-2.5 text-[12px] font-medium text-[#475569]">
            {detail.serviceType}
          </span>
        </div>

        {/* ── 3: Scrollable body ── */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

          {/* Service Item */}
          <SectionLabel>Service Item</SectionLabel>
          <div className="mb-5 flex items-start gap-3">
            <span
              className="flex size-9 shrink-0 items-center justify-center rounded-[8px]"
              style={{ background: `${customerColor}12` }}
            >
              <CustomerIcon size={16} strokeWidth={1.8} aria-hidden="true" style={{ color: customerColor }} />
            </span>
            <div className="min-w-0 pt-0.5">
              <p className="text-[14px] font-semibold leading-5 text-[#0f172a]">{detail.serviceItem}</p>
              <p className="mt-0.5 font-mono text-[11px] text-[#94a3b8]">
                {detail.serviceItemRef}
                {detail.serialNo && detail.serialNo !== "--" && ` · S/N ${detail.serialNo}`}
              </p>
              {detail.furtherDescription && (
                <p className="mt-1.5 text-[12px] leading-[18px] text-[#64748b]">{detail.furtherDescription}</p>
              )}
            </div>
          </div>

          {/* Requirement */}
          {detail.customerReq && (
            <>
              <SectionLabel>Requirement</SectionLabel>
              <p className="mb-5 text-[13px] leading-[20px] text-[#334155]">{detail.customerReq}</p>
            </>
          )}

          {/* Notes */}
          {(detail.note || detail.agentNote) && (
            <>
              <SectionLabel>Notes</SectionLabel>
              <div className="mb-5 flex flex-col gap-2.5">
                {detail.note && (
                  <div className="flex gap-2.5">
                    <span className="mt-[7px] size-1 shrink-0 rounded-full bg-[#cbd5e1]" />
                    <p className="text-[13px] leading-[20px] text-[#334155]">{detail.note}</p>
                  </div>
                )}
                {detail.agentNote && (
                  <div className="flex gap-2.5">
                    <span className="mt-[7px] size-1 shrink-0 rounded-full bg-[#93c5fd]" />
                    <p className="text-[13px] leading-[20px] text-[#334155]">{detail.agentNote}</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Photos */}
          <SectionLabel>Photos</SectionLabel>
          <div className="mb-5">
            {detail.photos.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {detail.photos.map((src, i) => (
                  <div key={i} className="aspect-square overflow-hidden rounded-[8px] bg-[#f1f5f9]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-[8px] border border-dashed border-[#e2e8f0] bg-[#f8fafc] px-4 py-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white border border-[#e2e8f0]">
                  <Camera size={12} strokeWidth={1.8} className="text-[#94a3b8]" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[12px] font-medium text-[#475569]">No photos attached</p>
                  <p className="text-[11px] text-[#94a3b8]">On-site photos will appear here</p>
                </div>
              </div>
            )}
          </div>

          {/* Timeline */}
          <SectionLabel>Timeline</SectionLabel>
          <div className="mb-2 flex flex-col">
            {timelineSteps.map((step, i) => {
              const isDone = Boolean(step.ts);
              const isLast = i === timelineSteps.length - 1;
              const tsShort = isDone
                ? step.ts.replace(/^\d+ \w+ \d+ /, "").replace(/:\d\d$/, "") || step.ts
                : "—";
              return (
                <div key={step.label} className="flex gap-3">
                  <div className="flex w-[14px] flex-col items-center">
                    <span
                      className="mt-[3px] size-[14px] shrink-0 rounded-full border-2 transition-colors duration-75 flex items-center justify-center"
                      style={isDone
                        ? { borderColor: step.dotColor, background: step.dotColor }
                        : { borderColor: "#e2e8f0", background: "#fff" }
                      }
                    >
                      {isDone && <span className="size-[4px] rounded-full bg-white" />}
                    </span>
                    {!isLast && (
                      <span
                        className="mt-0.5 w-[2px] flex-1 min-h-[18px] rounded-full"
                        style={{ background: isDone ? `${step.dotColor}30` : "#f1f5f9" }}
                      />
                    )}
                  </div>
                  <div className={`flex flex-1 items-baseline justify-between gap-2 ${isLast ? "pb-0" : "pb-3.5"}`}>
                    <span
                      className="text-[12px] font-medium"
                      style={{ color: isDone ? step.dotColor : "#94a3b8" }}
                    >
                      {step.label}
                    </span>
                    <span className="font-mono text-[11px] tabular-nums text-[#94a3b8]">{tsShort}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 4: Footer ── */}
        <div className="shrink-0 border-t border-[#f0f1f3] px-6 py-4">
          <div className="flex items-center justify-between gap-2 text-[12px] text-[#94a3b8]">
            <span>Svc <span className="font-mono text-[#475569]">RM {detail.serviceCharge.toFixed(2)}</span></span>
            <span className="text-[#e2e8f0]">+</span>
            <span>Items <span className="font-mono text-[#475569]">RM {detail.itemsTotal.toFixed(2)}</span></span>
            {detail.commision > 0 && (
              <>
                <span className="text-[#e2e8f0]">·</span>
                <span>Comm <span className="font-mono text-[#475569]">{detail.commision}%</span></span>
              </>
            )}
          </div>
          <div className="mt-2 mb-3 flex items-baseline justify-between">
            <span className="text-[12px] font-medium text-[#64748b]">Total</span>
            <span className="font-mono text-[20px] font-bold tracking-[-0.5px] tabular-nums text-[#0f172a]">
              RM {total.toFixed(2)}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-[7px] border border-[#e2e8f0] bg-white text-[13px] font-medium text-[#334155] outline-none transition-colors duration-75 hover:bg-[#f8fafc] hover:border-[#cbd5e1]"
            >
              <Pencil size={12} strokeWidth={1.9} aria-hidden="true" />
              Edit
            </button>
            <button
              type="button"
              className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-[7px] bg-[#fef2f2] text-[13px] font-medium text-[#dc2626] outline-none transition-colors duration-75 hover:bg-[#fee2e2]"
            >
              <Trash2 size={12} strokeWidth={1.9} aria-hidden="true" />
              Delete
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Cell components ── */

function JobNoCell({ jobNo }: Readonly<{ jobNo: string }>) {
  return (
    <span className="whitespace-nowrap text-[14px] font-medium leading-5 text-[#2c2c2b] max-xl:text-[13px]">
      {jobNo}
    </span>
  );
}

function CustomerCell({ customer }: Readonly<{ customer: string }>) {
  const { color, Icon } = resolveCustomerMeta(customer);
  return (
    <span className="inline-flex max-w-full items-center gap-2">
      <Icon size={16} strokeWidth={1.9} aria-hidden="true" className="shrink-0" style={{ color }} />
      <span className="truncate text-[14px] font-medium leading-5 text-[#31302e] max-xl:text-[13px]">
        {customer}
      </span>
    </span>
  );
}

function DateCell({ date }: Readonly<{ date: string }>) {
  const parts = date.split(" ");
  const month = parts[1] ?? "";
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
      <CalendarDays size={14} strokeWidth={1.8} aria-hidden="true" style={{ color: icon }} className="shrink-0 max-xl:hidden" />
      {date}
    </span>
  );
}

function JobStatusPill({ status }: Readonly<{ status: string }>) {
  const { pill, Icon } =
    {
      "Completed":   { pill: "bg-[#e9f7ef] text-[#1f7a4d]",  Icon: CheckCircle2 },
      "In Progress": { pill: "bg-[#eff6ff] text-[#1d4ed8]",  Icon: Clock3 },
      "Pending":     { pill: "bg-[#fff4db] text-[#9a6700]",  Icon: AlertCircle },
      "Cancelled":   { pill: "bg-[#f1f0ee] text-[#5f5e59]",  Icon: Circle },
    }[status] ?? { pill: "bg-[#f1f0ee] text-[#5f5e59]", Icon: Circle };

  return (
    <span className={`inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-[6px] px-2 text-[13px] font-medium leading-5 max-xl:gap-1 max-xl:px-1.5 max-xl:text-[12px] ${pill}`}>
      <Icon size={12} strokeWidth={2} aria-hidden="true" className="shrink-0" />
      {status}
    </span>
  );
}

function TechnicianPill({ name }: Readonly<{ name: string }>) {
  const initial = name.split(" ").filter(Boolean)[0]?.[0]?.toUpperCase() ?? "?";
  const avatarBg =
    {
      "Ahmad Farid":   "bg-[#0891b2] text-white",
      "Wong Yi Thong": "bg-[#1a73e8] text-white",
      "Raj Kumar":     "bg-[#7c3aed] text-white",
      "Sarah Lim":     "bg-[#db2777] text-white",
    }[name] ?? "bg-[#5f6368] text-white";

  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-[#f1f0ee] px-1.5 py-0.5 text-[14px] font-medium leading-5 text-[#5f5e59] max-xl:text-[13px]">
      <span className={`flex size-4 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold ${avatarBg}`}>
        {initial}
      </span>
      <span className="truncate font-semibold text-[#5f5e59]">{name}</span>
    </span>
  );
}

function ServiceCategoryBadge({ category }: Readonly<{ category: string }>) {
  const meta = SERVICE_CATEGORY_META[category] ?? { color: "#615d59", Icon: Wrench };
  const { color, Icon } = meta;
  return (
    <span className="inline-flex max-w-full items-center gap-1.5">
      <Icon size={14} strokeWidth={1.9} aria-hidden="true" className="shrink-0" style={{ color }} />
      <span className="truncate text-[14px] font-medium leading-5 text-[#31302e] max-xl:text-[13px]">
        {category}
      </span>
    </span>
  );
}

function StatusFilterPill({ status }: Readonly<{ status: StatusFilter }>) {
  if (status === "all") return null;
  const statusStyle =
    {
      "Completed":   "bg-[#e9f7ef] text-[#1f7a4d]",
      "In Progress": "bg-[#eff6ff] text-[#1d4ed8]",
      "Pending":     "bg-[#fff4db] text-[#9a6700]",
      "Cancelled":   "bg-[#f1f0ee] text-[#5f5e59]",
    }[status] ?? "bg-[#f1f0ee] text-[#5f5e59]";
  return (
    <span className={`inline-flex items-center rounded-[5px] px-1.5 ${statusStyle}`}>
      {status}
    </span>
  );
}

/* ── Page ── */
export default function JobOrderEmployeePage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen]   = useState(false);
  const [viewingOrderNo, setViewingOrderNo] = useState<string | null>(null);
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [sortKey, setSortKey]               = useState<SortKey>("serviceDate");
  const [sortDirection, setSortDirection]   = useState<SortDirection>("desc");
  const [statusFilter, setStatusFilter]     = useState<StatusFilter>("all");
  const sortMenuRef   = useRef<HTMLDivElement>(null);
  const statusMenuRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const viewingDetail = viewingOrderNo ? (JOB_ORDER_DETAILS[viewingOrderNo] ?? null) : null;

  const currentSortOption   = sortOptions.find(o => o.key === sortKey);
  const currentStatusOption = statusOptions.find(o => o.key === statusFilter);

  const sortedOrders = [...jobOrders]
    .filter(o => statusFilter === "all" ? true : o.status === statusFilter)
    .sort((a, b) => {
      const av = getSortValue(a, sortKey);
      const bv = getSortValue(b, sortKey);
      if (typeof av === "number" && typeof bv === "number") {
        return sortDirection === "desc" ? bv - av : av - bv;
      }
      const cmp = String(av).localeCompare(String(bv));
      return sortDirection === "desc" ? -cmp : cmp;
    });

  function setSortColumn(next: SortKey) {
    if (next === sortKey) {
      setSortDirection(d => d === "asc" ? "desc" : "asc");
      return;
    }
    setSortKey(next);
    setSortDirection(defaultSortDirections[next]);
  }

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      const t = e.target as Node;
      if (!sortMenuRef.current?.contains(t))   setIsSortMenuOpen(false);
      if (!statusMenuRef.current?.contains(t)) setIsStatusMenuOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  return (
    <div className="dashboard-shell min-h-screen bg-white md:flex">
      <DashboardSidebar
        activeItem="joborder-employee"
        isMobileOpen={isSidebarOpen}
        onMobileClose={() => setIsSidebarOpen(false)}
      />

      <main className="min-w-0 flex-1 overflow-y-auto bg-white text-[#2c2c2b]">
        <section className="flex min-h-screen flex-col">

          {/* Header */}
          <header className="flex h-[var(--dashboard-header-h)] items-center justify-between border-b border-[#e6e6e6] px-[var(--dashboard-main-x)]">
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
                Joborder (Employee)
              </h1>
              <div className="group relative flex shrink-0 items-center">
                <button
                  type="button"
                  aria-label="About Joborder Employee"
                  className="flex items-center justify-center text-[#c9c4bf] outline-none transition-colors duration-75 hover:text-[#8f8983]"
                >
                  <Info size={15} strokeWidth={1.7} aria-hidden="true" />
                </button>
                <div className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 w-max max-w-[220px] -translate-x-1/2 rounded-[8px] bg-[#2c2c2b] px-3 py-2 text-[12px] leading-[1.45] text-white opacity-0 shadow-[0_4px_16px_rgba(15,15,15,0.18)] transition-opacity duration-150 group-hover:opacity-100">
                  View and manage your assigned job orders — track status, customer, and service details.
                  <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-[#2c2c2b]" />
                </div>
              </div>
            </div>
            <div aria-hidden="true" />
          </header>

          {/* Toolbar row 1 — actions */}
          <div className="flex h-[var(--dashboard-toolbar-h)] items-center justify-end gap-3 px-[var(--dashboard-main-x)]">
            <Link
              href="/joborder-employee/new"
              className="inline-flex h-7 items-center gap-1.5 rounded-[7px] bg-[#2783DE] px-2.5 text-[13px] font-medium leading-5 text-white shadow-[0_1px_1px_rgba(39,131,222,0.16)] outline-none transition-colors duration-75 hover:bg-[#1f76c9]"
            >
              <Plus size={13} strokeWidth={1.9} aria-hidden="true" />
              New Job Order
            </Link>
          </div>
          <div className="mx-[var(--dashboard-main-x)] border-b border-[#e6e6e6]" />

          {/* Toolbar row 2 — search & filters */}
          <div className="flex h-[var(--dashboard-toolbar-h)] items-center gap-2 px-[var(--dashboard-main-x)]">
            <label className="relative w-[var(--dashboard-toolbar-search-w)] max-w-[42vw] shrink">
              <span className="sr-only">Search job orders</span>
              <Search size={14} strokeWidth={1.8} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8f8983]" />
              <input
                type="search"
                placeholder="Search job orders..."
                className="h-8 w-full rounded-[7px] border border-[#e6e6e6] bg-white pl-8.5 pr-2 text-[14px] leading-5 text-[#2c2c2b] outline-none transition-colors duration-75 placeholder:text-[#a39e98] focus:border-[#0075de] focus:ring-2 focus:ring-[#62aef0]/20"
              />
            </label>

            {/* Sort menu */}
            <div ref={sortMenuRef} className="relative">
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={isSortMenuOpen}
                onClick={() => setIsSortMenuOpen(o => !o)}
                className="inline-flex h-8 items-center gap-1.5 rounded-[7px] border border-[#e6e6e6] bg-white px-3 text-[14px] font-medium leading-5 text-[#2c2c2b] outline-none transition-colors duration-75 hover:bg-[#f7f7f8] focus-visible:ring-1 focus-visible:ring-black/5"
              >
                <ListFilter size={13} strokeWidth={1.8} aria-hidden="true" />
                Sort with {currentSortOption?.label}
              </button>
              <AnimatePresence>
                {isSortMenuOpen && (
                  <motion.div
                    role="menu"
                    className="absolute left-0 top-8 z-20 w-[208px] origin-top-left rounded-[10px] border border-[#e6e6e6] bg-white p-1 shadow-[0_12px_28px_rgba(15,15,15,0.11)]"
                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -4 }}
                    transition={{ duration: shouldReduceMotion ? 0 : 0.16, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {sortOptions.map(option => (
                      <button
                        key={option.key}
                        type="button"
                        role="menuitem"
                        onClick={() => { setSortKey(option.key); setSortDirection(defaultSortDirections[option.key]); setIsSortMenuOpen(false); }}
                        className="flex min-h-9 w-full items-center justify-between gap-3 rounded-[7px] px-2 text-left outline-none transition-colors duration-75 hover:bg-[#f6f5f4] focus-visible:bg-[#f6f5f4]"
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <span className="min-w-0">
                            <span className="block truncate text-[13px] font-medium leading-5 text-[#2c2c2b]">{option.label}</span>
                            <span className="block truncate text-[11px] font-medium leading-4 text-[#8f8983]">{option.helper}</span>
                          </span>
                        </span>
                        {sortKey === option.key && <Check size={13} strokeWidth={2} aria-hidden="true" className="shrink-0 text-[#0075de]" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Status filter */}
            <div ref={statusMenuRef} className="relative">
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={isStatusMenuOpen}
                onClick={() => setIsStatusMenuOpen(o => !o)}
                className="inline-flex h-8 items-center gap-1.5 rounded-[7px] border border-[#e6e6e6] bg-white px-3 text-[14px] font-medium leading-5 text-[#2c2c2b] outline-none transition-colors duration-75 hover:bg-[#f7f7f8] focus-visible:ring-1 focus-visible:ring-black/5"
              >
                <Tag size={13} strokeWidth={1.8} aria-hidden="true" />
                Status
                {currentStatusOption && currentStatusOption.key !== "all" && (
                  <>
                    <span className="text-[#a39e98]">is</span>
                    <StatusFilterPill status={statusFilter} />
                  </>
                )}
              </button>
              <AnimatePresence>
                {isStatusMenuOpen && (
                  <motion.div
                    role="menu"
                    className="absolute left-0 top-8 z-20 w-[196px] origin-top-left rounded-[10px] border border-[#e6e6e6] bg-white p-1 shadow-[0_12px_28px_rgba(15,15,15,0.11)]"
                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -4 }}
                    transition={{ duration: shouldReduceMotion ? 0 : 0.16, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {statusOptions.map(option => (
                      <button
                        key={option.key}
                        type="button"
                        role="menuitem"
                        onClick={() => { setStatusFilter(option.key as StatusFilter); setIsStatusMenuOpen(false); }}
                        className="flex min-h-9 w-full items-center justify-between gap-3 rounded-[7px] px-2 text-left outline-none transition-colors duration-75 hover:bg-[#f6f5f4] focus-visible:bg-[#f6f5f4]"
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <span className="size-2 shrink-0 rounded-full" style={{ background: { all: "#d1d0ce", Completed: "#1f7a4d", "In Progress": "#1d4ed8", Pending: "#f59e0b", Cancelled: "#a39e98" }[option.key] }} />
                          <span className="min-w-0">
                            <span className="block truncate text-[13px] font-medium leading-5 text-[#2c2c2b]">{option.label}</span>
                            <span className="block truncate text-[11px] font-medium leading-4 text-[#8f8983]">{option.helper}</span>
                          </span>
                        </span>
                        {statusFilter === option.key && <Check size={13} strokeWidth={2} aria-hidden="true" className="shrink-0 text-[#0075de]" />}
                      </button>
                    ))}
                  </motion.div>
                )}
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
          <div className="mx-[var(--dashboard-main-x)] border-b border-[#e6e6e6]" />

          {/* Table */}
          <div className="min-h-0 flex-1 overflow-auto px-[var(--dashboard-main-x)]">
            <table className="w-full min-w-[var(--joborder-table-min-w)] table-fixed border-separate border-spacing-0 text-left">
              <thead className="sticky top-0 z-10 bg-white">
                <tr>
                  {([
                    { label: "Job No",           icon: Hash,       width: "w-[var(--joborder-col-number)]",     key: "jobNo" },
                    { label: "Customer",         icon: Store,      width: "w-[var(--joborder-col-customer)]",   key: "customer" },
                    { label: "Service Date",     icon: CalendarDays, width: "w-[var(--joborder-col-date)]",     key: "serviceDate" },
                    { label: "Status",           icon: Circle,     width: "w-[var(--joborder-col-status)]",     key: "status" },
                    { label: "Technician",       icon: UserRound,  width: "w-[var(--joborder-col-technician)]", key: "technician" },
                    { label: "Service Category", icon: Sparkles,   width: "w-[var(--joborder-col-category)]",   key: "serviceCategory" },
                    { label: "Actions",          icon: Ellipsis,   width: "w-[var(--joborder-col-action)]" },
                  ] as const).map((col, colIdx, all) => {
                    const Icon      = col.icon;
                    const isAction  = col.label === "Actions";
                    const isSortable = "key" in col;
                    const isActive  = isSortable && col.key === sortKey;
                    const isAsc     = isActive && sortDirection === "asc";
                    const isFirst   = colIdx === 0;
                    const isLast    = colIdx === all.length - 1;
                    const pad       = isFirst ? "pl-6 pr-3" : isLast ? "pl-3 pr-6" : "px-3";

                    return (
                      <th
                        key={col.label}
                        scope="col"
                        aria-sort={isSortable && isActive ? (isAsc ? "ascending" : "descending") : undefined}
                        className={`${col.width} h-[var(--dashboard-head-h)] border-b ${isLast ? "" : "border-r"} border-[#e6e6e6] ${pad} text-[14px] font-medium leading-5 text-[#2c2c2b] ${isAction ? "text-right" : ""}`}
                      >
                        {isSortable ? (
                          <div className="flex items-center justify-between">
                            <button
                              type="button"
                              aria-label={`Sort by ${col.label}`}
                              onClick={() => setSortColumn(col.key as SortKey)}
                              className="flex items-center gap-1.5 outline-none transition-colors duration-75 hover:text-[#2c2c2b] focus-visible:text-[#2c2c2b]"
                            >
                              <Icon size={14} strokeWidth={1.75} aria-hidden="true" className="text-[#2c2c2b]" />
                              <span className="truncate">{col.label}</span>
                              {isActive ? (
                                isAsc
                                  ? <ChevronUp size={12} strokeWidth={2} aria-hidden="true" className="shrink-0 text-[#0075de]" />
                                  : <ChevronDown size={12} strokeWidth={2} aria-hidden="true" className="shrink-0 text-[#0075de]" />
                              ) : (
                                <ArrowUpDown size={11} strokeWidth={1.9} aria-hidden="true" className="shrink-0 text-[#2c2c2b]/45" />
                              )}
                            </button>
                            {(col.label === "Customer" || col.label === "Service Category") && (
                              <span className="inline-flex items-center rounded-[5px] bg-[#eff6ff] px-1.5 py-0.5 text-[12px] font-semibold leading-4 tracking-[0.2px] text-[#0075de]">
                                AI
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className={`flex items-center gap-1.5 ${isAction ? "justify-end" : ""}`}>
                            <Icon size={14} strokeWidth={1.75} aria-hidden="true" className="text-[#2c2c2b]" />
                            {col.label}
                          </span>
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {sortedOrders.map((order, index) => (
                  <motion.tr
                    key={order.jobNo}
                    animate={{ opacity: 1, x: 0 }}
                    className="group h-[var(--dashboard-row-h)] bg-white transition-colors duration-75 hover:bg-[#f7f7f8]"
                    initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -24 }}
                    transition={{
                      delay: shouldReduceMotion ? 0 : index * 0.055,
                      duration: shouldReduceMotion ? 0 : 0.28,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <td className="border-b border-r border-[#f0efed] pl-6 pr-3">
                      <Link href={`/joborder-employee/${order.jobNo}`} className="outline-none hover:underline underline-offset-2 decoration-[#cbd5e1]">
                        <JobNoCell jobNo={order.jobNo} />
                      </Link>
                    </td>
                    <td className="border-b border-r border-[#f0efed] px-3">
                      <CustomerCell customer={order.customer} />
                    </td>
                    <td className="border-b border-r border-[#f0efed] px-3">
                      <DateCell date={order.serviceDate} />
                    </td>
                    <td className="border-b border-r border-[#f0efed] px-3">
                      <JobStatusPill status={order.status} />
                    </td>
                    <td className="border-b border-r border-[#f0efed] px-3">
                      <TechnicianPill name={order.technician} />
                    </td>
                    <td className="border-b border-r border-[#f0efed] px-3">
                      <ServiceCategoryBadge category={order.serviceCategory} />
                    </td>
                    <td className="border-b border-[#f0efed] pl-3 pr-6 text-right">
                      <button
                        type="button"
                        aria-label={`View ${order.jobNo}`}
                        onClick={() => router.push(`/joborder-employee/${order.jobNo}`)}
                        className="inline-flex size-7 items-center justify-center rounded-[7px] text-[#8f8983] outline-none transition-colors duration-75 hover:bg-[#ededee] hover:text-[#2c2c2b] focus-visible:bg-[#ededee] focus-visible:ring-1 focus-visible:ring-black/5"
                      >
                        <Ellipsis size={15} strokeWidth={1.9} aria-hidden="true" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

        </section>
      </main>

      <AnimatePresence>
        {viewingDetail && (
          <ViewJobOrderDrawer
            detail={viewingDetail}
            onClose={() => setViewingOrderNo(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
