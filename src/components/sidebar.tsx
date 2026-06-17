"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BadgeDollarSign,
  BanknoteArrowUp,
  ChevronDown,
  Check,
  BookOpenCheck,
  BriefcaseBusiness,
  CircleUser,
  ClipboardList,
  CreditCard,
  Home,
  Inbox,
  Landmark,
  ScrollText,
  MessageCircle,
  PackageCheck,
  Palette,
  ReceiptText,
  Search,
  Settings,
  Send,
  Truck,
  UserCog,
  UserPlus,
  Users,
  PiggyBank,
  Wallet,
  X,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";

const sidebarSections = [
  {
    id: "cashbook",
    title: "Cashbook",
    items: [
      {
        id: "cashbook",
        label: "Cashbook",
        icon: Landmark,
      },
      {
        id: "bank-statement",
        label: "Bank statement",
        icon: ScrollText,
      },
    ],
  },
  {
    id: "accounts-payable",
    title: "Accounts payable",
    items: [
      {
        id: "purchase-invoice",
        label: "Purchase invoice",
        icon: ReceiptText,
      },
      {
        id: "ap-invoice",
        label: "APInvoice",
        icon: BookOpenCheck,
      },
      {
        id: "ap-payment",
        label: "APPayment",
        icon: CreditCard,
      },
      {
        id: "good-receive-note",
        label: "Good Receive note",
        icon: Truck,
      },
    ],
  },
  {
    id: "accounts-receivable",
    title: "Accounts receivable",
    items: [
      {
        id: "sales-invoice",
        label: "Sales invoice",
        icon: BanknoteArrowUp,
      },
      {
        id: "arpayment",
        label: "ARPayment",
        icon: BadgeDollarSign,
      },
      {
        id: "sales-order",
        label: "Sales order",
        icon: Send,
      },
    ],
  },
  {
    id: "service",
    title: "Service",
    items: [
      {
        id: "joborder-management",
        label: "Joborder (management)",
        icon: BriefcaseBusiness,
      },
      {
        id: "joborder-employee",
        label: "Joborder (employee)",
        icon: UserCog,
      },
    ],
  },
  {
    id: "report",
    title: "Report",
    items: [
      {
        id: "cashflow-report",
        label: "Cashflow report",
        icon: Wallet,
      },
      {
        id: "sales-report",
        label: "Salesreport",
        icon: BarChart3,
      },
    ],
  },
] as const;

const manageSections = [
  {
    id: "management",
    title: "Management",
    items: [
      { id: "profiles",     label: "Profiles",     icon: CircleUser },
      { id: "team-manage",  label: "TeamManage",   icon: Users      },
      { id: "expense",      label: "Expense",      icon: PiggyBank       },
    ],
  },
  {
    id: "manage-joborder",
    title: "Joborder",
    items: [
      { id: "customer-requests-note", label: "Customer requests note", icon: ClipboardList },
      { id: "equipment-received",     label: "Equipment Received",     icon: PackageCheck  },
      { id: "joborder-design",        label: "Design",                 icon: Palette       },
    ],
  },
  {
    id: "manage-sales-order",
    title: "Sales order",
    items: [
      { id: "sales-order-design", label: "Design", icon: Palette },
    ],
  },
] as const;

type ManageItemId = (typeof manageSections)[number]["items"][number]["id"];

const manageItemHrefs: Partial<Record<ManageItemId, string>> = {
  profiles:               "/manage/profiles",
  "team-manage":          "/manage/team",
  expense:                "/manage/expense",
  "customer-requests-note": "/manage/customer-requests",
  "equipment-received":   "/manage/equipment",
  "joborder-design":      "/manage/joborder-design",
  "sales-order-design":   "/manage/sales-order-design",
};

type SidebarItemId = (typeof sidebarSections)[number]["items"][number]["id"];

type BookItem = {
  id: string;
  book_id: string;
  book_name: string;
  status: string;
  role: string;
  bound_at: string;
};

type AuthUserContext = {
  email: string;
  books: BookItem[];
  current_book: { book_id: string; book_name: string; role: string } | null;
};

const USER_CONTEXT_TTL = 5 * 60 * 1000;
let userContextCache: { data: AuthUserContext; expiresAt: number } | null = null;

const sidebarItemHrefs: Partial<Record<SidebarItemId, string>> = {
  cashbook: "/cashbook",
  "bank-statement": "/bank-statement",
  "cashflow-report": "/cashflow-report",
  "purchase-invoice": "/purchase-invoice",
  "ap-invoice": "/apinvoice",
  "ap-payment": "/appayment",
  "good-receive-note": "/good-receive-note",
  "sales-invoice": "/sales-invoice",
  arpayment: "/arpayment",
  "sales-order": "/sales-order",
  "joborder-employee": "/joborder-employee",
  "joborder-management": "/joborder-management",
};

function getCompanyInitials(name: string) {
  const words = name
    .replace(/[^a-zA-Z0-9 ]/g, " ")
    .split(" ")
    .filter(Boolean);

  if (words.length === 0) {
    return "A";
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function BrandMark({
  label,
  size = 18,
}: Readonly<{ label: string; size?: number }>) {
  return (
    <span
      aria-hidden="true"
      className="flex shrink-0 items-center justify-center rounded-[10px] bg-[linear-gradient(135deg,#d86ff3_0%,#b968f4_100%)] font-semibold tracking-[-0.04em] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.24)]"
      style={{
        width: size,
        height: size,
        fontSize: Math.max(9, Math.round(size * 0.42)),
        lineHeight: 1,
      }}
    >
      {getCompanyInitials(label)}
    </span>
  );
}

export function DashboardSidebar({
  isMobileOpen = false,
  onMobileClose,
}: Readonly<{
  activeItem?: SidebarItemId;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}>) {
  const pathname = usePathname();
  const [isBookMenuOpen, setIsBookMenuOpen] = useState(false);
  const [activeQuickNav, setActiveQuickNav] = useState<"home" | "chat" | "manage">(
    pathname.startsWith("/manage") ? "manage" : "home"
  );

  const [collapsedSectionIds, setCollapsedSectionIds] = useState<Set<string>>(
    new Set(),
  );
  const [user, setUser] = useState<AuthUserContext | null>(() => {
    if (userContextCache && Date.now() < userContextCache.expiresAt) {
      return userContextCache.data;
    }
    return null;
  });
  const [selectedBookId, setSelectedBookId] = useState<string>(() => {
    if (userContextCache && Date.now() < userContextCache.expiresAt) {
      const d = userContextCache.data;
      return d.current_book?.book_id ?? d.books[0]?.book_id ?? "";
    }
    return "";
  });

  useEffect(() => {
    if (userContextCache && Date.now() < userContextCache.expiresAt) return;

    apiFetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: AuthUserContext | null) => {
        if (!data) return;
        userContextCache = { data, expiresAt: Date.now() + USER_CONTEXT_TTL };
        setUser(data);
        const defaultId =
          data.current_book?.book_id ?? data.books[0]?.book_id ?? "";
        setSelectedBookId(defaultId);
      })
      .catch(() => null);
  }, []);
  const bookMenuRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const selectedBook =
    user?.books.find((b) => b.book_id === selectedBookId) ?? user?.books[0] ?? null;

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!bookMenuRef.current?.contains(event.target as Node)) {
        setIsBookMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  function toggleSection(sectionId: string) {
    setCollapsedSectionIds((currentSectionIds) => {
      const nextSectionIds = new Set(currentSectionIds);

      if (nextSectionIds.has(sectionId)) {
        nextSectionIds.delete(sectionId);
      } else {
        nextSectionIds.add(sectionId);
      }

      return nextSectionIds;
    });
  }

  return (
    <>
      <AnimatePresence>
        {isMobileOpen ? (
          <motion.div
            aria-hidden="true"
            className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[1px] xl:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.22, ease: "easeOut" }}
            onClick={onMobileClose}
          />
        ) : null}
      </AnimatePresence>
      <aside
        className={`[&_a]:cursor-default [&_button]:cursor-default bg-[#f7f7f8] shadow-[inset_-1px_0_0_rgba(0,0,0,0.055)] fixed inset-y-0 left-0 z-50 w-[280px] overflow-x-hidden overflow-y-auto xl:relative xl:inset-auto xl:z-auto xl:h-screen xl:w-[var(--dashboard-sidebar-w)] xl:shrink-0 xl:overflow-visible xl:translate-x-0 xl:shadow-[inset_-1px_0_0_rgba(0,0,0,0.055)] ${
          shouldReduceMotion
            ? isMobileOpen ? "translate-x-0" : "-translate-x-full"
            : "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] " + (isMobileOpen ? "translate-x-0" : "-translate-x-full")
        } xl:transition-none`}
        style={{
          fontFamily:
            'var(--font-inter), "Inter Variable", Inter, sans-serif',
          fontOpticalSizing: "auto",
          fontSynthesis: "none",
          textRendering: "optimizeLegibility",
          WebkitFontSmoothing: "antialiased",
        }}
      >
      <div className="flex h-full flex-col gap-1 overflow-visible px-3 py-3 lg:px-[var(--dashboard-sidebar-x)] lg:py-[var(--dashboard-sidebar-y)]">
        {/* Mobile close row */}
        <div className="flex shrink-0 items-center justify-between px-1 pt-1 pb-2 xl:hidden">
          <span className="text-[12px] font-semibold uppercase tracking-[0.4px] text-[#b5b0aa]">Menu</span>
          <button
            type="button"
            aria-label="Close navigation"
            onClick={onMobileClose}
            className="flex size-7 items-center justify-center rounded-[7px] text-[#8f8983] outline-none transition-colors duration-75 hover:bg-[#ededee] hover:text-[#2c2c2b]"
          >
            <X size={15} strokeWidth={1.8} aria-hidden="true" />
          </button>
        </div>
        <div ref={bookMenuRef} className="relative hidden md:block">
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={isBookMenuOpen}
            onClick={() => setIsBookMenuOpen((isOpen) => !isOpen)}
            className="flex h-8 w-full items-center gap-2.5 rounded-[8px] px-2 text-left text-[14px] font-medium leading-5 tracking-normal text-[#2c2c2b] outline-none transition-colors duration-75 hover:bg-[#ededee] focus-visible:bg-[#ededee] focus-visible:ring-1 focus-visible:ring-black/5"
          >
            {selectedBook ? (
              <>
                <span className="flex size-6 shrink-0 items-center justify-center rounded-[10px] bg-[linear-gradient(135deg,#d86ff3_0%,#b968f4_100%)] text-[9.5px] font-semibold tracking-[-0.04em] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.24)]">
                  {getCompanyInitials(selectedBook.book_name)}
                </span>
                <span className="min-w-0 flex-1 truncate">
                  {selectedBook.book_name}
                </span>
              </>
            ) : (
              <span className="h-4 w-28 animate-pulse rounded bg-[#e8e7e5]" />
            )}
            <ChevronDown
              size={15}
              strokeWidth={1.8}
              aria-hidden="true"
              className={`shrink-0 text-[#8f8983] transition-transform duration-250 ${
                isBookMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          <AnimatePresence>
            {isBookMenuOpen ? (
              <motion.div
                role="listbox"
                aria-label="Select book"
                animate={{
                  filter: "blur(0px)",
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}
                className="absolute left-0 top-9 z-20 w-[272px] origin-top overflow-hidden rounded-[11px] border border-[#e6e6e6] bg-white shadow-[0_12px_30px_rgba(15,15,15,0.12)]"
                exit={{
                  filter: shouldReduceMotion ? "blur(0px)" : "blur(3px)",
                  opacity: 0,
                  scale: shouldReduceMotion ? 1 : 0.975,
                  y: shouldReduceMotion ? 0 : -6,
                }}
                initial={{
                  filter: shouldReduceMotion ? "blur(0px)" : "blur(3px)",
                  opacity: 0,
                  scale: shouldReduceMotion ? 1 : 0.975,
                  y: shouldReduceMotion ? 0 : -6,
                }}
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.34,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <div className="p-2.5">
                  <div className="flex items-center gap-2">
                    <BrandMark label={selectedBook?.book_name ?? ""} size={24} />
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-semibold leading-5 text-[#37352f]">
                        {selectedBook?.book_name ?? ""}
                      </p>
                      <p className="text-[12px] leading-4 text-[#8f8983]">
                        {selectedBook?.role ?? ""}
                      </p>
                    </div>
                  </div>

                  <div className="mt-2.5 flex gap-1.5">
                    <button
                      type="button"
                      className="flex h-7 items-center gap-1 rounded-[6px] border border-[#e6e6e6] bg-white px-2 text-[12px] font-medium text-[#615d59] transition-colors duration-75 hover:bg-[#f6f5f4] focus-visible:bg-[#f6f5f4] focus-visible:outline-none"
                    >
                      <Settings size={14} strokeWidth={1.8} aria-hidden="true" />
                      Settings
                    </button>
                    <button
                      type="button"
                      className="flex h-7 items-center gap-1 rounded-[6px] border border-[#e6e6e6] bg-white px-2 text-[12px] font-medium text-[#615d59] transition-colors duration-75 hover:bg-[#f6f5f4] focus-visible:bg-[#f6f5f4] focus-visible:outline-none"
                    >
                      <UserPlus size={14} strokeWidth={1.8} aria-hidden="true" />
                      Invite members
                    </button>
                  </div>
                </div>

                <div className="mx-3 h-px bg-[#dedbd7]" />

                <div className="p-1.5">
                  <div className="mb-0.5 flex h-7 items-center gap-2 px-1">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-[6px] bg-[#0075de] text-[10px] font-semibold text-white">
                      {user?.email?.[0]?.toUpperCase() ?? "?"}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-[#8f8983]">
                      {user?.email ?? ""}
                    </span>
                  </div>

                  {(user?.books ?? []).map((book, index) => {
                    const isSelected = book.book_id === selectedBookId;

                    return (
                      <motion.button
                        key={book.book_id}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        animate={{ opacity: 1, y: 0 }}
                        initial={{
                          opacity: 0,
                          y: shouldReduceMotion ? 0 : -2,
                        }}
                        onClick={() => {
                          setSelectedBookId(book.book_id);
                          setIsBookMenuOpen(false);
                          fetch("/api/auth/me/current-book", {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ book_id: book.book_id }),
                          }).catch(() => null);
                        }}
                        className="flex h-7 w-full items-center gap-2 rounded-[6px] px-2 text-left outline-none transition-colors duration-75 hover:bg-[#f6f5f4] focus-visible:bg-[#f6f5f4]"
                        transition={{
                          delay: shouldReduceMotion ? 0 : 0.06 + index * 0.03,
                          duration: shouldReduceMotion ? 0 : 0.24,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      >
                        <BrandMark label={book.book_name} size={15} />
                        <span className="min-w-0 flex-1 truncate text-[12px] font-medium leading-5 text-[#37352f]">
                          {book.book_name}
                        </span>
                        {isSelected ? (
                          <Check
                            size={16}
                            strokeWidth={1.8}
                            aria-hidden="true"
                            className="shrink-0 text-[#37352f]"
                          />
                        ) : null}
                      </motion.button>
                    );
                  })}

                </div>

                <div className="mx-3 h-px bg-[#dedbd7]" />

                <div className="p-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      fetch("/api/auth/logout", { method: "POST" }).finally(
                        () => { window.location.href = "/login"; },
                      );
                    }}
                    className="flex h-7 w-full items-center rounded-[6px] px-2 text-left text-[12px] font-medium text-[#615d59] outline-none transition-colors duration-75 hover:bg-[#f6f5f4] focus-visible:bg-[#f6f5f4]"
                  >
                    Log out
                  </button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <div className="mt-3 flex h-8 w-full items-center gap-1">
            {[
              {
                id: "home",
                label: "Home",
                tooltip: "Home",
                shortcut: "H",
                icon: Home,
              },
              {
                id: "chat",
                label: "Chat",
                tooltip: "Chat with Amate",
                shortcut: "⌃Alt+C",
                icon: MessageCircle,
              },
              {
                id: "manage",
                label: "Manage",
                tooltip: "Manage",
                shortcut: "⌃Alt+M",
                icon: Inbox,
              },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = item.id === activeQuickNav;

              return (
                <button
                  key={item.id}
                  type="button"
                  aria-current={isActive ? "page" : undefined}
                  aria-label={item.label}
                  onClick={() =>
                    setActiveQuickNav(item.id as "home" | "chat" | "manage")
                  }
                className={`group/quick relative flex h-8 items-center justify-center rounded-full text-[14px] font-medium leading-5 outline-none transition-all duration-[250ms] ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:ring-1 focus-visible:ring-black/5 ${
                    isActive
                      ? "gap-2 bg-[#e9e9ea] px-3 text-[#2c2c2b] hover:bg-[#e3e3e4] focus-visible:bg-[#e3e3e4]"
                      : "w-8 px-0 text-[#6f6a64] hover:bg-[#ededee] hover:text-[#2c2c2b] focus-visible:bg-[#ededee]"
                  }`}
                >
                  <Icon
                    size={18}
                    strokeWidth={1.9}
                    aria-hidden="true"
                    className="shrink-0"
                  />
                  {isActive ? <span>{item.label}</span> : null}
                  <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-[8px] bg-[#2c2c2b] px-2.5 py-1.5 text-[12px] font-medium leading-4 text-white opacity-0 shadow-[0_8px_22px_rgba(0,0,0,0.22)] transition-opacity duration-[180ms] group-hover/quick:opacity-100 group-focus-visible/quick:opacity-100">
                    <span>{item.tooltip}</span>
                    <span className="text-[#a8a8a5]">{item.shortcut}</span>
                  </span>
                </button>
              );
            })}
            <button
              type="button"
              aria-label="Search"
              className="group/search relative ml-auto flex size-8 items-center justify-center rounded-full text-[#6f6a64] outline-none transition-colors duration-75 hover:bg-[#ededee] hover:text-[#2c2c2b] focus-visible:bg-[#ededee] focus-visible:ring-1 focus-visible:ring-black/5"
            >
              <Search size={18} strokeWidth={1.9} aria-hidden="true" />
              <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-[8px] bg-[#2c2c2b] px-2.5 py-1.5 text-[12px] font-medium leading-4 text-white opacity-0 shadow-[0_8px_22px_rgba(0,0,0,0.22)] transition-opacity duration-100 group-hover/search:opacity-100 group-focus-visible/search:opacity-100">
                <span>Search</span>
                <span className="text-[#a8a8a5]">⌃K</span>
              </span>
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeQuickNav}
            initial={{ opacity: 0, x: activeQuickNav === "manage" ? 10 : -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: activeQuickNav === "manage" ? -10 : 10 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="flex gap-1 md:mt-4 md:flex-1 md:flex-col md:gap-5 md:overflow-y-auto"
          >
            {(activeQuickNav === "manage" ? manageSections : sidebarSections).map((section) => (
              <div key={section.id} className="min-w-0 md:flex md:flex-col">
                <button
                  type="button"
                  aria-expanded={!collapsedSectionIds.has(section.id)}
                  onClick={() => toggleSection(section.id)}
                  className="group/sec flex h-5 w-full items-center gap-1.5 px-2 text-left outline-none"
                >
                  <ChevronDown
                    size={11}
                    strokeWidth={2.2}
                    aria-hidden="true"
                    className={`shrink-0 text-[#c5c0bb] transition-transform duration-150 group-hover/sec:text-[#a39e98] ${
                      collapsedSectionIds.has(section.id) ? "-rotate-90" : ""
                    }`}
                  />
                  <span className="truncate text-[11px] font-semibold uppercase tracking-[0.5px] text-[#b5b0aa] transition-colors duration-75 group-hover/sec:text-[#8a8480]">{section.title}</span>
                </button>
                {collapsedSectionIds.has(section.id) ? null : (
                  <div className="mt-1 flex gap-1 md:flex-col md:gap-px">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const href = activeQuickNav === "manage"
                        ? (manageItemHrefs[item.id as ManageItemId] ?? "#")
                        : (sidebarItemHrefs[item.id as keyof typeof sidebarItemHrefs] ?? "#");
                      const isActive = href !== "#" && pathname.startsWith(href);

                      return (
                        <Link
                          key={item.id}
                          href={href}
                          aria-current={isActive ? "page" : undefined}
                          className={`group flex h-7 max-w-full shrink-0 items-center gap-2 rounded-[8px] px-2 text-left text-[14px] font-medium leading-5 tracking-normal outline-none transition-colors duration-75 focus-visible:ring-1 focus-visible:ring-black/5 md:w-full ${
                            isActive
                              ? "bg-[#0075de] text-white focus-visible:bg-[#0075de]"
                              : "text-[#5f5e59] hover:bg-[#ededee] hover:text-[#2c2c2b] focus-visible:bg-[#ededee]"
                          }`}
                        >
                          <span className={`flex size-5 shrink-0 items-center justify-center transition-colors duration-75 ${isActive ? "text-white" : "text-[#6f6a64] group-hover:text-[#2c2c2b]"}`}>
                            <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
                          </span>
                          <span className="whitespace-nowrap">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
      </aside>
    </>
  );
}
