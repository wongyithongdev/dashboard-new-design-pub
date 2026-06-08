"use client";

import {
  ChevronDown,
  Check,
  ClipboardList,
  FileText,
  Plus,
  PackageCheck,
  ReceiptText,
  Settings,
  UserPlus,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const sidebarItems = [
  {
    id: "purchase-invoice",
    label: "Purchase invoice",
    icon: ReceiptText,
  },
  {
    id: "ap-invoice",
    label: "APInvoice",
    icon: FileText,
  },
  {
    id: "ap-payment",
    label: "APPayment",
    icon: ClipboardList,
  },
  {
    id: "good-receive-note",
    label: "Good Receive note",
    icon: PackageCheck,
  },
] as const;

const bookItems = [
  {
    id: "antsmicro-main",
    label: "ANtsmicro",
  },
  {
    id: "antsmicro-2025",
    label: "ANtsmicro 2025",
  },
  {
    id: "antsmicro-archive",
    label: "ANtsmicro Archive",
  },
] as const;

type SidebarItemId = (typeof sidebarItems)[number]["id"];
type BookItemId = (typeof bookItems)[number]["id"];

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
      className="flex shrink-0 items-center justify-center rounded-[6px] bg-[#2f5fd0] font-semibold tracking-[-0.04em] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)]"
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
  activeItem,
}: Readonly<{
  activeItem: SidebarItemId;
}>) {
  const [isBookMenuOpen, setIsBookMenuOpen] = useState(false);
  const [selectedBookId, setSelectedBookId] =
    useState<BookItemId>("antsmicro-main");
  const bookMenuRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const selectedBook =
    bookItems.find((book) => book.id === selectedBookId) ?? bookItems[0];

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!bookMenuRef.current?.contains(event.target as Node)) {
        setIsBookMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  return (
    <aside className="bg-[#f6f5f4] md:h-screen md:w-[240px] md:shrink-0 md:shadow-[inset_-1px_0_0_rgba(0,0,0,0.055)]">
      <div className="flex h-full gap-1 overflow-x-auto px-3 py-3 md:flex-col md:gap-1 md:overflow-visible md:px-3 md:py-3">
        <div ref={bookMenuRef} className="relative hidden md:block">
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={isBookMenuOpen}
            onClick={() => setIsBookMenuOpen((isOpen) => !isOpen)}
            className="flex h-8 w-full items-center gap-2 rounded-[6px] px-2 text-left text-[14px] font-semibold leading-5 text-[#37352f] outline-none transition hover:bg-[#eeece8] focus-visible:bg-[#eeece8] focus-visible:ring-1 focus-visible:ring-black/5"
          >
            <span className="flex size-6 shrink-0 items-center justify-center rounded-[7px] bg-[#2f5fd0] text-[9.5px] font-semibold tracking-[-0.04em] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)]">
              {getCompanyInitials(selectedBook.label)}
            </span>
            <span className="min-w-0 flex-1 truncate">
              {selectedBook.label}
            </span>
            <ChevronDown
              size={14}
              strokeWidth={1.8}
              aria-hidden="true"
              className={`shrink-0 text-[#8f8983] transition-transform duration-150 ${
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
                  duration: shouldReduceMotion ? 0 : 0.22,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <div className="p-2.5">
                  <div className="flex items-center gap-2">
                    <BrandMark label={selectedBook.label} size={24} />
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-semibold leading-5 text-[#37352f]">
                        {selectedBook.label}
                      </p>
                      <p className="text-[12px] leading-4 text-[#8f8983]">
                        Boss · 1 member
                      </p>
                    </div>
                  </div>

                  <div className="mt-2.5 flex gap-1.5">
                    <button
                      type="button"
                      className="flex h-7 items-center gap-1 rounded-[6px] border border-[#e6e6e6] bg-white px-2 text-[12px] font-medium text-[#615d59] transition hover:bg-[#f6f5f4] focus-visible:bg-[#f6f5f4] focus-visible:outline-none"
                    >
                      <Settings size={13} strokeWidth={1.8} aria-hidden="true" />
                      Settings
                    </button>
                    <button
                      type="button"
                      className="flex h-7 items-center gap-1 rounded-[6px] border border-[#e6e6e6] bg-white px-2 text-[12px] font-medium text-[#615d59] transition hover:bg-[#f6f5f4] focus-visible:bg-[#f6f5f4] focus-visible:outline-none"
                    >
                      <UserPlus size={13} strokeWidth={1.8} aria-hidden="true" />
                      Invite members
                    </button>
                  </div>
                </div>

                <div className="mx-3 h-px bg-[#dedbd7]" />

                <div className="p-1.5">
                  <div className="mb-0.5 flex h-7 items-center gap-2 px-1">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-[6px] bg-[#b36b2c] text-[10px] font-semibold text-white">
                      W
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-[#8f8983]">
                      wongyithong17@gmail.com
                    </span>
                  </div>

                  {bookItems.map((book, index) => {
                    const isSelected = book.id === selectedBookId;

                    return (
                      <motion.button
                        key={book.id}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        animate={{ opacity: 1, y: 0 }}
                        initial={{
                          opacity: 0,
                          y: shouldReduceMotion ? 0 : -2,
                        }}
                        onClick={() => {
                          setSelectedBookId(book.id);
                          setIsBookMenuOpen(false);
                        }}
                        className="flex h-7 w-full items-center gap-2 rounded-[6px] px-2 text-left outline-none transition hover:bg-[#f6f5f4] focus-visible:bg-[#f6f5f4]"
                        transition={{
                          delay: shouldReduceMotion ? 0 : 0.035 + index * 0.02,
                          duration: shouldReduceMotion ? 0 : 0.16,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      >
                        <BrandMark label={book.label} size={15} />
                        <span className="min-w-0 flex-1 truncate text-[12px] font-medium leading-5 text-[#37352f]">
                          {book.label}
                        </span>
                        {isSelected ? (
                          <Check
                            size={15}
                            strokeWidth={1.8}
                            aria-hidden="true"
                            className="shrink-0 text-[#37352f]"
                          />
                        ) : null}
                      </motion.button>
                    );
                  })}

                  <button
                    type="button"
                    className="mt-0.5 flex h-7 w-full items-center gap-2 rounded-[6px] px-2 text-left text-[12px] font-medium text-[#0075de] outline-none transition hover:bg-[#f6f5f4] focus-visible:bg-[#f6f5f4]"
                  >
                    <Plus size={15} strokeWidth={1.8} aria-hidden="true" />
                    New workspace
                  </button>
                </div>

                <div className="mx-3 h-px bg-[#dedbd7]" />

                <div className="p-1.5">
                  <button
                    type="button"
                    className="flex h-7 w-full items-center rounded-[6px] px-2 text-left text-[12px] font-medium text-[#615d59] outline-none transition hover:bg-[#f6f5f4] focus-visible:bg-[#f6f5f4]"
                  >
                    Log out
                  </button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="flex gap-1 md:mt-3 md:flex-col md:gap-0.5">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === activeItem;

            return (
              <button
                key={item.id}
                type="button"
                aria-current={isActive ? "page" : undefined}
                className={`flex h-[30px] shrink-0 items-center gap-2 rounded-[6px] px-2 text-left text-[14px] font-medium leading-5 outline-none transition focus-visible:bg-[#eeece8] focus-visible:ring-1 focus-visible:ring-black/5 md:w-full ${
                  isActive
                    ? "bg-[#ebe9e5] text-[#37352f]"
                    : "text-[#615d59] hover:bg-[#eeece8] hover:text-[#37352f]"
                }`}
              >
                <Icon
                  size={15}
                  strokeWidth={1.8}
                  aria-hidden="true"
                  className="shrink-0"
                />
                <span className="whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
