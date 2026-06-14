"use client";

import { DashboardSidebar } from "@/components/sidebar";
import {
  AlertCircle,
  ArrowUpDown,
  BadgeCheck,
  BadgeDollarSign,
  Building2,
  Calculator,
  CalendarDays,
  Car,
  Check,
  CheckCircle2,
  Copy,
  X,
  ClipboardCheck,
  ChevronDown,
  ChevronUp,
  Circle,
  Clock3,
  Code2,
  Cpu,
  Droplets,
  Ellipsis,
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
  Info,
  Landmark,
  ListFilter,
  Menu,
  Monitor,
  Newspaper,
  Package,
  Phone,
  Plane,
  Plus,
  QrCode,
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
  UserRound,
  Utensils,
  Wheat,
  Wrench,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import React, { useEffect, useRef, useState } from "react";

/* ── Data ── */
const jobOrders = [
  { jobNo: "JO-2026-0001", customer: "Parkway Mall Sdn Bhd",           serviceDate: "12 Jun 2026", status: "In Progress", agent: "Ahmad Farid",   serviceCategory: "HVAC",        commision: 320  },
  { jobNo: "JO-2026-0002", customer: "TechCore Solutions Sdn Bhd",     serviceDate: "11 Jun 2026", status: "Completed",   agent: "Wong Yi Thong", serviceCategory: "IT Support",  commision: 180  },
  { jobNo: "JO-2026-0003", customer: "Sunrise Residence",              serviceDate: "10 Jun 2026", status: "Pending",     agent: "Raj Kumar",     serviceCategory: "Electrical",  commision: 210  },
  { jobNo: "JO-2026-0004", customer: "Green Valley Café",              serviceDate: "10 Jun 2026", status: "Completed",   agent: "Sarah Lim",     serviceCategory: "Plumbing",    commision: 150  },
  { jobNo: "JO-2026-0005", customer: "Meridian Hotel Sdn Bhd",         serviceDate: "09 Jun 2026", status: "Cancelled",   agent: "Ahmad Farid",   serviceCategory: "Cleaning",    commision: 0    },
  { jobNo: "JO-2026-0006", customer: "Blueprint Architecture Sdn Bhd", serviceDate: "08 Jun 2026", status: "In Progress", agent: "Raj Kumar",     serviceCategory: "Carpentry",   commision: 480  },
  { jobNo: "JO-2026-0007", customer: "Maple Heights Condo",            serviceDate: "07 Jun 2026", status: "Pending",     agent: "Wong Yi Thong", serviceCategory: "Pest Control",commision: 240  },
  { jobNo: "JO-2026-0008", customer: "FreshMart Superstore",           serviceDate: "06 Jun 2026", status: "Completed",   agent: "Sarah Lim",     serviceCategory: "Electrical",  commision: 175  },
  { jobNo: "JO-2026-0009", customer: "Sunrise Residence",              serviceDate: "05 Jun 2026", status: "Claimed",     agent: "Ahmad Farid",   serviceCategory: "Plumbing",    commision: 310  },
  { jobNo: "JO-2026-0010", customer: "TechCore Solutions Sdn Bhd",     serviceDate: "04 Jun 2026", status: "Settled",     agent: "Wong Yi Thong", serviceCategory: "IT Support",  commision: 450  },
];

/* ── Sort / filter ── */
const sortOptions = [
  { key: "serviceDate",     label: "Service Date",     helper: "Newest first"    },
  { key: "customer",        label: "Customer",         helper: "A to Z"          },
  { key: "jobNo",           label: "Job No",           helper: "Latest first"    },
  { key: "agent",           label: "Agent",            helper: "A to Z"          },
  { key: "status",          label: "Status",           helper: "Attention first" },
  { key: "serviceCategory", label: "Service Category", helper: "A to Z"          },
  { key: "commision",       label: "Commission",       helper: "Highest first"   },
] as const;

type JobOrder      = (typeof jobOrders)[number];
type SortKey       = (typeof sortOptions)[number]["key"];
type SortDirection = "asc" | "desc";
type StatusFilter  = "all" | JobOrder["status"];

const statusOptions = [
  { key: "all",         label: "All statuses",  helper: "Show every job order"  },
  { key: "Pending",     label: "Pending",        helper: "Awaiting start"        },
  { key: "In Progress", label: "In Progress",    helper: "Currently active"      },
  { key: "Completed",   label: "Completed",      helper: "Job done"              },
  { key: "Claimed",     label: "Claimed",        helper: "Commission claimed"    },
  { key: "Settled",     label: "Settled",        helper: "Fully settled"         },
  { key: "Cancelled",   label: "Cancelled",      helper: "Cancelled job"         },
] as const;

const agentOptions = [
  { key: "all",           label: "All agents",    color: "#d1d0ce" },
  { key: "Ahmad Farid",   label: "Ahmad Farid",   color: "#0891b2" },
  { key: "Wong Yi Thong", label: "Wong Yi Thong", color: "#1a73e8" },
  { key: "Raj Kumar",     label: "Raj Kumar",     color: "#7c3aed" },
  { key: "Sarah Lim",     label: "Sarah Lim",     color: "#db2777" },
] as const;

type AgentFilter = (typeof agentOptions)[number]["key"];

const defaultSortDirections: Record<SortKey, SortDirection> = {
  serviceDate: "desc", customer: "asc", jobNo: "desc",
  agent: "asc", status: "desc", serviceCategory: "asc", commision: "desc",
};

function getSortValue(o: JobOrder, key: SortKey) {
  if (key === "serviceDate") return new Date(o.serviceDate).getTime();
  if (key === "status")      return ({ Pending: 6, "In Progress": 5, Completed: 4, Claimed: 3, Settled: 2, Cancelled: 1 }[o.status] ?? 0);
  if (key === "commision")   return o.commision;
  return o[key as "customer" | "jobNo" | "agent" | "serviceCategory"];
}

/* ── Customer icon resolution ── */
type CustomerMeta = { color: string; Icon: React.ElementType };

const customerMetaMap: Record<string, CustomerMeta> = {
  "Parkway Mall Sdn Bhd":           { color: "#7c3aed", Icon: Store     },
  "TechCore Solutions Sdn Bhd":     { color: "#6366f1", Icon: Code2     },
  "Sunrise Residence":              { color: "#78350f", Icon: Building2 },
  "Green Valley Café":              { color: "#16a34a", Icon: Utensils  },
  "Meridian Hotel Sdn Bhd":         { color: "#0ea5e9", Icon: Plane     },
  "Blueprint Architecture Sdn Bhd": { color: "#d97706", Icon: HardHat   },
  "Maple Heights Condo":            { color: "#92400e", Icon: Building2 },
  "FreshMart Superstore":           { color: "#7c3aed", Icon: Store     },
};

const industryPatterns: Array<{ pattern: RegExp; meta: CustomerMeta }> = [
  { pattern: /food|bakery|caf[eé]|cater|restaur|bever|grocer|dairy|meat|seafood|kitchen/i,  meta: { color: "#16a34a", Icon: Utensils    } },
  { pattern: /medical|clinic|hospital|pharma|health|drug|lab|diagnos|dental|biotech/i,      meta: { color: "#0891b2", Icon: HeartPulse  } },
  { pattern: /construct|build|contrac|archit|cement|steel|roofing|plumb|civil/i,            meta: { color: "#d97706", Icon: HardHat     } },
  { pattern: /auto|car\b|vehicle|motor|tyre|tire|workshop|garage|spare.?part/i,             meta: { color: "#1d4ed8", Icon: Car         } },
  { pattern: /retail|mart|supermarket|hypermarket|mini.?market|department.?store/i,         meta: { color: "#7c3aed", Icon: Store       } },
  { pattern: /bank|financ|fund|invest|insur|credit|loan|capital|wealth/i,                   meta: { color: "#0f766e", Icon: Landmark    } },
  { pattern: /software|tech|digital|cloud|web|app\b|system|solution|network|cyber|saas/i,  meta: { color: "#6366f1", Icon: Code2       } },
  { pattern: /telecom|telco|mobile|cellular|internet|broadband|wifi|fibre/i,                meta: { color: "#2563eb", Icon: Phone       } },
  { pattern: /educat|school|college|universi|tuition|training|learn|academy/i,              meta: { color: "#b45309", Icon: GraduationCap } },
  { pattern: /property|real.?estate|realty|hous|developer|rental|condo|residence/i,        meta: { color: "#78350f", Icon: Building2   } },
  { pattern: /energy|electric|solar|power|fuel|petroleum|gas\b|oil\b|utility/i,            meta: { color: "#ca8a04", Icon: Flame       } },
  { pattern: /agri|farm|plantat|crop|seed|vegetable|fruit|livestock/i,                     meta: { color: "#65a30d", Icon: Wheat       } },
  { pattern: /manufactur|factory|industri|product|assembly/i,                              meta: { color: "#475569", Icon: Factory     } },
  { pattern: /fashion|textile|fabric|garment|apparel|cloth|uniform/i,                      meta: { color: "#db2777", Icon: Shirt       } },
  { pattern: /securi|guard|surveil|cctv|alarm|protect|patrol/i,                            meta: { color: "#1e40af", Icon: Shield      } },
  { pattern: /hotel|resort|hostel|airline|flight|holiday|tour\b|hospitality|travel/i,      meta: { color: "#0ea5e9", Icon: Plane       } },
  { pattern: /media|broadcast|film|cinema|studio|entertain|music/i,                        meta: { color: "#9333ea", Icon: Film        } },
  { pattern: /legal|law.?firm|consult|audit|advisory|counsel/i,                            meta: { color: "#374151", Icon: Scale       } },
  { pattern: /waste|recycl|environ|greentech|sewage|disposal/i,                            meta: { color: "#15803d", Icon: Recycle     } },
  { pattern: /chemic|polymer|plastic|rubber|compound|resin/i,                              meta: { color: "#9333ea", Icon: FlaskConical} },
  { pattern: /electron|semicond|circuit|component|pcb|sensor|chip/i,                       meta: { color: "#0284c7", Icon: Cpu         } },
  { pattern: /furnitur|sofa|chair|interior|decor|carpet|furnish/i,                         meta: { color: "#92400e", Icon: Sofa        } },
  { pattern: /import|export|trading|wholesale|distribut|cargo/i,                           meta: { color: "#0369a1", Icon: Globe       } },
  { pattern: /account|bookkeep|tax\b|payroll|gst|sst|erp\b/i,                             meta: { color: "#4b5563", Icon: Calculator  } },
  { pattern: /clean|janitor|sanitiz|pest.?control|laundry|hygiene/i,                      meta: { color: "#0891b2", Icon: Droplets    } },
  { pattern: /publish|print|book\b|magazine|newspa|catalog/i,                             meta: { color: "#6d28d9", Icon: Newspaper   } },
];

function resolveCustomerMeta(customer: string): CustomerMeta {
  if (customerMetaMap[customer]) return customerMetaMap[customer];
  for (const { pattern, meta } of industryPatterns) {
    if (pattern.test(customer)) return meta;
  }
  return { color: "#615d59", Icon: Store };
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
  const month = date.split(" ")[1] ?? "";
  const { bg, text, icon } = ({
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
  }[month] ?? { bg: "#f6f5f4", text: "#615d59", icon: "#a39e98" });
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
  const { pill, Icon } = ({
    "Completed":   { pill: "bg-[#e9f7ef] text-[#1f7a4d]",  Icon: CheckCircle2   },
    "In Progress": { pill: "bg-[#eff6ff] text-[#1d4ed8]",  Icon: Clock3         },
    "Pending":     { pill: "bg-[#fff4db] text-[#9a6700]",  Icon: AlertCircle    },
    "Claimed":     { pill: "bg-[#f5f3ff] text-[#6d28d9]",  Icon: ClipboardCheck },
    "Settled":     { pill: "bg-[#eee0da] text-[#9f6b53]",  Icon: BadgeCheck     },
    "Cancelled":   { pill: "bg-[#f1f0ee] text-[#5f5e59]",  Icon: Circle         },
  }[status] ?? { pill: "bg-[#f1f0ee] text-[#5f5e59]", Icon: Circle });
  return (
    <span className={`inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-[6px] px-2 text-[13px] font-medium leading-5 max-xl:gap-1 max-xl:px-1.5 max-xl:text-[12px] ${pill}`}>
      <Icon size={12} strokeWidth={2} aria-hidden="true" className="shrink-0" />
      {status}
    </span>
  );
}

function AgentPill({ name }: Readonly<{ name: string }>) {
  const initial = name.split(" ").filter(Boolean)[0]?.[0]?.toUpperCase() ?? "?";
  const avatarBg = ({
    "Ahmad Farid":   "bg-[#0891b2] text-white",
    "Wong Yi Thong": "bg-[#1a73e8] text-white",
    "Raj Kumar":     "bg-[#7c3aed] text-white",
    "Sarah Lim":     "bg-[#db2777] text-white",
  }[name] ?? "bg-[#5f6368] text-white");
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-[#f1f0ee] px-1.5 py-0.5 text-[14px] font-medium leading-5 text-[#5f5e59] max-xl:text-[13px]">
      <span className={`flex size-4 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold ${avatarBg}`}>
        {initial}
      </span>
      <span className="truncate font-semibold text-[#5f5e59]">{name}</span>
    </span>
  );
}

const SERVICE_CATEGORY_META: Record<string, { color: string; Icon: React.ElementType }> = {
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

function ServiceCategoryBadge({ category }: Readonly<{ category: string }>) {
  const meta = SERVICE_CATEGORY_META[category] ?? { color: "#615d59", Icon: Wrench };
  const { color, Icon: CatIcon } = meta;
  return (
    <span className="inline-flex max-w-full items-center gap-1.5">
      <CatIcon size={14} strokeWidth={1.9} aria-hidden="true" className="shrink-0" style={{ color }} />
      <span className="truncate text-[14px] font-medium leading-5 text-[#31302e] max-xl:text-[13px]">{category}</span>
    </span>
  );
}

function CommisionBadge({ value }: Readonly<{ value: number }>) {
  const style =
    value >= 400 ? "bg-[#e9f7ef] text-[#1f7a4d]"
    : value >= 200 ? "bg-[#fff4db] text-[#8a5a00]"
    : value > 0   ? "bg-[#f1f0ee] text-[#5f5e59]"
    :               "bg-[#f6f5f4] text-[#c4c2be]";
  return (
    <span className={`inline-flex h-6 items-center whitespace-nowrap rounded-[6px] px-2 text-[14px] font-medium leading-5 tabular-nums max-xl:px-1.5 max-xl:text-[12px] ${style}`}>
      RM {value.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </span>
  );
}

function StatusFilterPill({ status }: Readonly<{ status: StatusFilter }>) {
  if (status === "all") return null;
  const cls = ({
    "Completed":   "bg-[#e9f7ef] text-[#1f7a4d]",
    "In Progress": "bg-[#eff6ff] text-[#1d4ed8]",
    "Pending":     "bg-[#fff4db] text-[#9a6700]",
    "Claimed":     "bg-[#f5f3ff] text-[#6d28d9]",
    "Settled":     "bg-[#eee0da] text-[#9f6b53]",
    "Cancelled":   "bg-[#f1f0ee] text-[#5f5e59]",
  }[status] ?? "bg-[#f1f0ee] text-[#5f5e59]");
  return <span className={`inline-flex items-center rounded-[5px] px-1.5 ${cls}`}>{status}</span>;
}

/* ── QR Drawer ── */
function slugify(val: string) {
  return val.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

function QrDrawer({ onClose }: Readonly<{ onClose: () => void }>) {
  const [company, setCompany]       = useState("");
  const [slug, setSlug]             = useState("");
  const [copied, setCopied]         = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);

  const publicUrl = slug ? `https://app.my365biz.com/jo/${slug}` : "";

  function handleCompanyChange(val: string) {
    setCompany(val);
    if (!slugEdited) setSlug(slugify(val));
  }
  function handleSlugChange(val: string) {
    setSlugEdited(true);
    setSlug(slugify(val));
  }
  function handleCopy() {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <motion.aside
      className="flex w-[320px] shrink-0 flex-col overflow-hidden border-l border-[#e6e6e6] bg-[#fbfaf9]"
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 320, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* inner wrapper fixed at 320px so content doesn't reflow during animation */}
      <div className="flex w-[320px] flex-1 flex-col overflow-y-auto">

        {/* Header — exact same height as page header for border alignment */}
        <div className="flex h-[var(--dashboard-header-h)] shrink-0 items-center justify-between border-b border-[#e6e6e6] bg-white px-4">
          <div className="flex items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded-[6px] bg-[#f1f0ee]">
              <QrCode size={13} strokeWidth={1.8} className="text-[#5f5e59]" aria-hidden="true" />
            </div>
            <span className="text-[13px] font-semibold text-[#37352f]">View QR</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-6 items-center justify-center rounded-[6px] text-[#9b9a97] outline-none transition-colors duration-75 hover:bg-[#f1f0ee] hover:text-[#37352f]"
          >
            <X size={13} strokeWidth={1.8} aria-hidden="true" />
          </button>
        </div>

        {/* QR display */}
        <div className="flex shrink-0 flex-col items-center gap-4 border-b border-[#e6e6e6] bg-white px-5 py-6">
          <div className={`flex items-center justify-center rounded-[10px] border p-3 transition-all duration-200 ${publicUrl ? "border-[#e6e6e6] shadow-[0_1px_6px_rgba(15,15,15,0.06)]" : "border-dashed border-[#e0deda]"} bg-white`}>
            {publicUrl ? (
              <QRCodeSVG value={publicUrl} size={148} level="M" bgColor="#ffffff" fgColor="#2c2c2b" />
            ) : (
              <div className="flex size-[148px] flex-col items-center justify-center gap-2.5">
                <div className="flex size-10 items-center justify-center rounded-[8px] bg-[#f1f0ee]">
                  <QrCode size={20} strokeWidth={1.5} className="text-[#b8b4af]" />
                </div>
                <span className="px-6 text-center text-[11px] leading-[15px] text-[#b8b4af]">
                  Fill in the slug below to preview your QR
                </span>
              </div>
            )}
          </div>
          {publicUrl && (
            <p className="text-center text-[11px] leading-[15px] text-[#9b9a97]">
              Scan to open the public job order page
            </p>
          )}
        </div>

        {/* Form */}
        <div className="flex flex-1 flex-col gap-5 px-4 py-5">

          {/* Company name */}
          <div className="flex flex-col gap-[6px]">
            <label className="text-[11px] font-medium text-[#9b9a97]">Company Name</label>
            <input
              type="text"
              placeholder="e.g. My365Biz Solutions"
              value={company}
              onChange={e => handleCompanyChange(e.target.value)}
              className="h-8 w-full rounded-[6px] border border-transparent bg-[#f1f0ee] px-2.5 text-[13px] text-[#37352f] outline-none placeholder:text-[#c4c2be] focus:border-[#d4d0cb] focus:bg-white transition-colors duration-75"
            />
          </div>

          {/* Slug */}
          <div className="flex flex-col gap-[6px]">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-medium text-[#9b9a97]">Company Slug</label>
              {slug && <span className="text-[10px] text-[#b8b4af]">auto-generated</span>}
            </div>
            <div className="flex h-8 items-center rounded-[6px] border border-transparent bg-[#f1f0ee] px-2.5 focus-within:border-[#d4d0cb] focus-within:bg-white transition-colors duration-75">
              <span className="shrink-0 select-none text-[12px] text-[#a8a49f]">jo /</span>
              <input
                type="text"
                placeholder="my365biz"
                value={slug}
                onChange={e => handleSlugChange(e.target.value)}
                className="h-full flex-1 bg-transparent pl-1 text-[13px] text-[#37352f] outline-none placeholder:text-[#c4c2be]"
              />
            </div>
          </div>

          {/* Public URL */}
          <div className="flex flex-col gap-[6px]">
            <label className="text-[11px] font-medium text-[#9b9a97]">Public URL</label>
            <div className={`flex items-center gap-1 rounded-[6px] border px-2.5 py-1.5 ${publicUrl ? "border-[#e0deda] bg-white" : "border-[#ece9e6] bg-[#f7f6f4]"}`}>
              <span className={`flex-1 truncate font-mono text-[11px] leading-[18px] ${publicUrl ? "text-[#5f5e59]" : "text-[#c4c2be]"}`}>
                {publicUrl || "https://app.my365biz.com/jo/—"}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                disabled={!publicUrl}
                className="flex shrink-0 items-center gap-1 rounded-[4px] px-1.5 py-0.5 text-[11px] font-medium text-[#9b9a97] outline-none transition-colors duration-75 hover:bg-[#f1f0ee] hover:text-[#37352f] disabled:cursor-not-allowed disabled:text-[#d4d0cb]"
              >
                {copied
                  ? <Check size={11} strokeWidth={2} className="text-[#2d8653]" />
                  : <Copy size={11} strokeWidth={1.8} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-[#e6e6e6] bg-white px-4 py-3">
          <button
            type="button"
            disabled={!publicUrl}
            className="inline-flex h-8 w-full items-center justify-center gap-2 rounded-[7px] bg-[#2383e2] text-[13px] font-medium text-white outline-none transition-colors duration-75 hover:bg-[#1a73d4] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <QrCode size={13} strokeWidth={1.8} aria-hidden="true" />
            Download QR
          </button>
        </div>

      </div>
    </motion.aside>
  );
}

/* ── Page ── */
export default function JobOrderManagementPage() {
  const [isSidebarOpen, setIsSidebarOpen]       = useState(false);
  const [isSortMenuOpen, setIsSortMenuOpen]     = useState(false);
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [isAgentMenuOpen, setIsAgentMenuOpen]   = useState(false);
  const [showQrModal, setShowQrModal]           = useState(false);
  const [sortKey, setSortKey]                   = useState<SortKey>("serviceDate");
  const [sortDirection, setSortDirection]       = useState<SortDirection>("desc");
  const [statusFilter, setStatusFilter]         = useState<StatusFilter>("all");
  const [agentFilter, setAgentFilter]           = useState<AgentFilter>("all");
  const sortMenuRef   = useRef<HTMLDivElement>(null);
  const statusMenuRef = useRef<HTMLDivElement>(null);
  const agentMenuRef  = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const currentSortOption   = sortOptions.find(o => o.key === sortKey);
  const currentStatusOption = statusOptions.find(o => o.key === statusFilter);
  const currentAgentOption  = agentOptions.find(o => o.key === agentFilter);

  const sortedOrders = [...jobOrders]
    .filter(o => statusFilter === "all" ? true : o.status === statusFilter)
    .filter(o => agentFilter  === "all" ? true : o.agent  === agentFilter)
    .sort((a, b) => {
      const av = getSortValue(a, sortKey);
      const bv = getSortValue(b, sortKey);
      if (typeof av === "number" && typeof bv === "number")
        return sortDirection === "desc" ? bv - av : av - bv;
      const cmp = String(av).localeCompare(String(bv));
      return sortDirection === "desc" ? -cmp : cmp;
    });

  function setSortColumn(next: SortKey) {
    if (next === sortKey) { setSortDirection(d => d === "asc" ? "desc" : "asc"); return; }
    setSortKey(next);
    setSortDirection(defaultSortDirections[next]);
  }

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      const t = e.target as Node;
      if (!sortMenuRef.current?.contains(t))   setIsSortMenuOpen(false);
      if (!statusMenuRef.current?.contains(t)) setIsStatusMenuOpen(false);
      if (!agentMenuRef.current?.contains(t))  setIsAgentMenuOpen(false);

    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  return (
    <div className="dashboard-shell bg-white md:flex" style={{ height: "100dvh" }}>
      <DashboardSidebar
        activeItem="joborder-management"
        isMobileOpen={isSidebarOpen}
        onMobileClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 overflow-hidden">
      <main className="min-w-0 flex-1 overflow-y-auto bg-white text-[#2c2c2b]">
        <section className="flex min-h-full flex-col">

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
                Joborder (Management)
              </h1>
              <div className="group relative flex shrink-0 items-center">
                <button
                  type="button"
                  aria-label="About Joborder Management"
                  className="flex items-center justify-center text-[#c9c4bf] outline-none transition-colors duration-75 hover:text-[#8f8983]"
                >
                  <Info size={15} strokeWidth={1.7} aria-hidden="true" />
                </button>
                <div className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 w-max max-w-[240px] -translate-x-1/2 rounded-[8px] bg-[#2c2c2b] px-3 py-2 text-[12px] leading-[1.45] text-white opacity-0 shadow-[0_4px_16px_rgba(15,15,15,0.18)] transition-opacity duration-150 group-hover:opacity-100">
                  Create and manage all job orders — assign agents, set commission, and monitor status.
                  <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-[#2c2c2b]" />
                </div>
              </div>
            </div>
            <div aria-hidden="true" />
          </header>

          {/* Toolbar row 1 — actions */}
          <div className="flex h-[var(--dashboard-toolbar-h)] items-center justify-end gap-2 px-[var(--dashboard-main-x)]">
            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              className="inline-flex h-7 items-center gap-1.5 rounded-[7px] border border-[#e6e6e6] bg-white px-2.5 text-[13px] font-medium leading-5 text-[#5f5e59] outline-none transition-colors duration-75 hover:bg-[#f7f7f8] hover:text-[#2c2c2b]"
            >
              <QrCode size={13} strokeWidth={1.8} aria-hidden="true" />
              View QR
            </button>
            <Link
              href="/joborder-management/settle-commission"
              className="inline-flex h-7 items-center rounded-[7px] bg-[#2783DE] px-2.5 text-[13px] font-medium leading-5 text-white shadow-[0_1px_1px_rgba(39,131,222,0.16)] outline-none transition-colors duration-75 hover:bg-[#1f76c9]"
            >
              Settle Commission
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
                          <span className="size-2 shrink-0 rounded-full" style={{ background: { all: "#d1d0ce", Completed: "#1f7a4d", "In Progress": "#1d4ed8", Pending: "#f59e0b", Claimed: "#6d28d9", Settled: "#9f6b53", Cancelled: "#a39e98" }[option.key] }} />
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

            {/* Agent filter */}
            <div ref={agentMenuRef} className="relative">
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={isAgentMenuOpen}
                onClick={() => setIsAgentMenuOpen(o => !o)}
                className="inline-flex h-8 items-center gap-1.5 rounded-[7px] border border-[#e6e6e6] bg-white px-3 text-[14px] font-medium leading-5 text-[#2c2c2b] outline-none transition-colors duration-75 hover:bg-[#f7f7f8] focus-visible:ring-1 focus-visible:ring-black/5"
              >
                <UserRound size={13} strokeWidth={1.8} aria-hidden="true" />
                Agent
                {agentFilter !== "all" && currentAgentOption && (
                  <>
                    <span className="text-[#a39e98]">is</span>
                    <span
                      className="inline-flex items-center gap-1 rounded-[5px] px-1.5 text-[12px] font-medium"
                      style={{ background: currentAgentOption.color + "22", color: currentAgentOption.color }}
                    >
                      <span className="size-1.5 rounded-full" style={{ background: currentAgentOption.color }} />
                      {currentAgentOption.label}
                    </span>
                  </>
                )}
              </button>
              <AnimatePresence>
                {isAgentMenuOpen && (
                  <motion.div
                    role="menu"
                    className="absolute left-0 top-8 z-20 w-[192px] origin-top-left rounded-[10px] border border-[#e6e6e6] bg-white p-1 shadow-[0_12px_28px_rgba(15,15,15,0.11)]"
                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -4 }}
                    transition={{ duration: shouldReduceMotion ? 0 : 0.16, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {agentOptions.map(option => (
                      <button
                        key={option.key}
                        type="button"
                        role="menuitem"
                        onClick={() => { setAgentFilter(option.key); setIsAgentMenuOpen(false); }}
                        className="flex min-h-9 w-full items-center justify-between gap-3 rounded-[7px] px-2 text-left outline-none transition-colors duration-75 hover:bg-[#f6f5f4] focus-visible:bg-[#f6f5f4]"
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <span className="size-2 shrink-0 rounded-full" style={{ background: option.color }} />
                          <span className="truncate text-[13px] font-medium leading-5 text-[#2c2c2b]">{option.label}</span>
                        </span>
                        {agentFilter === option.key && <Check size={13} strokeWidth={2} aria-hidden="true" className="shrink-0 text-[#0075de]" />}
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
                    { label: "Job No",           icon: Hash,           width: "w-[var(--joborder-col-number)]",     key: "jobNo"           },
                    { label: "Customer",         icon: Store,          width: "w-[var(--joborder-col-customer)]",   key: "customer"        },
                    { label: "Service Date",     icon: CalendarDays,   width: "w-[var(--joborder-col-date)]",       key: "serviceDate"     },
                    { label: "Status",           icon: Circle,         width: "w-[var(--joborder-col-status)]",     key: "status"          },
                    { label: "Agent",            icon: UserRound,      width: "w-[var(--joborder-col-technician)]", key: "agent"           },
                    { label: "Service Category", icon: Tag,            width: "w-[var(--joborder-col-category)]",   key: "serviceCategory" },
                    { label: "Commission",       icon: BadgeDollarSign,width: "w-[var(--joborder-col-commission)]", key: "commision"       },
                    { label: "Actions",          icon: Ellipsis,       width: "w-[var(--joborder-col-action)]"                             },
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
                            {col.label === "Customer" && (
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
                      <AgentPill name={order.agent} />
                    </td>
                    <td className="border-b border-r border-[#f0efed] px-3">
                      <ServiceCategoryBadge category={order.serviceCategory} />
                    </td>
                    <td className="border-b border-r border-[#f0efed] px-3 text-right">
                      <CommisionBadge value={order.commision} />
                    </td>
                    <td className="border-b border-[#f0efed] pl-3 pr-6 text-right">
                      <Link
                        href={`/joborder-management/${order.jobNo}`}
                        aria-label={`Open ${order.jobNo}`}
                        className="inline-flex size-7 items-center justify-center rounded-[7px] text-[#8f8983] outline-none transition-colors duration-75 hover:bg-[#ededee] hover:text-[#2c2c2b] focus-visible:bg-[#ededee] focus-visible:ring-1 focus-visible:ring-black/5"
                      >
                        <Ellipsis size={15} strokeWidth={1.9} aria-hidden="true" />
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

        </section>
      </main>
      <AnimatePresence>
        {showQrModal && <QrDrawer onClose={() => setShowQrModal(false)} />}
      </AnimatePresence>
      </div>
    </div>
  );
}
