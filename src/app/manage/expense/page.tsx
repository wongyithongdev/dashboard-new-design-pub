"use client";

import { DashboardSidebar } from "@/components/sidebar";
import { apiFetch } from "@/lib/api";
import {
  AlertCircle,
  Check,
  LoaderCircle,
  Menu,
} from "lucide-react";
import { motion, useReducedMotion, type Transition } from "motion/react";
import { useEffect, useState } from "react";

type Role = "owner" | "admin" | "employee" | "support";

type CompanySettingsResponse = {
  bookId: string;
  companyDescription: string;
  expenseCategories: string[];
  canEdit: boolean;
};

type AuthUserContext = {
  email: string;
  books: Array<{
    id: string;
    book_id: string;
    book_name: string;
    status: string;
    role: Role;
    bound_at: string;
  }>;
  current_book: { book_id: string; book_name: string; role: Role } | null;
};

const READONLY_ROLES: Role[] = ["employee", "support"];
const DEFAULT_EXPENSE_FIELDS = [
  "EPF",
  "SOSCO",
  "Tax Expense",
  "Rental",
  "Staff Allowance",
  "Water Expense",
  "Staff Cost",
  "Communication",
  "Electricity Expense",
] as const;
const READONLY_TOOLTIP = "Only workspace owners and admins can change expense categories.";

function getSaveErrorMessage(error: string) {
  switch (error) {
    case "unauthenticated":
      return "You need to sign in again before saving.";
    case "forbidden":
      return "Only owners and admins can update expense categories.";
    case "book_context_required":
      return "A workspace must be selected before updating expense categories.";
    case "bad_request":
    case "invalid_request":
      return "Expense categories are invalid.";
    case "auth_unavailable":
      return "Auth service is temporarily unavailable.";
    case "auth_invalid":
      return "Workspace identity data from auth is incomplete.";
    default:
      return `Unable to save expense categories. (${error})`;
  }
}

export default function ExpensePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [companyDescription, setCompanyDescription] = useState("");
  const [expenseValues, setExpenseValues] = useState<Record<string, string>>(
    () =>
      Object.fromEntries(
        DEFAULT_EXPENSE_FIELDS.map((field) => [field, ""]),
      ) as Record<string, string>,
  );
  const [savedExpenseValues, setSavedExpenseValues] = useState<Record<string, string>>(
    () =>
      Object.fromEntries(
        DEFAULT_EXPENSE_FIELDS.map((field) => [field, ""]),
      ) as Record<string, string>,
  );
  const shouldReduceMotion = useReducedMotion();

  const itemTransition: Transition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.28, ease: [0.22, 1, 0.36, 1] };

  useEffect(() => {
    let ignore = false;

    async function loadExpenseSettings() {
      setLoading(true);
      setLoadError("");

      try {
        const [settingsRes, meRes] = await Promise.all([
          apiFetch("/api/settings/company", { cache: "no-store" }),
          apiFetch("/api/auth/me", { cache: "no-store" }),
        ]);

        if (!settingsRes.ok || !meRes.ok) {
          throw new Error("load_failed");
        }

        const settings = (await settingsRes.json()) as CompanySettingsResponse;
        const me = (await meRes.json()) as AuthUserContext;
        const rawCategories = Array.isArray(settings.expenseCategories)
          ? settings.expenseCategories
          : [];
        const nextValues = Object.fromEntries(
          DEFAULT_EXPENSE_FIELDS.map((field, index) => {
            const candidate = rawCategories[index] ?? "";
            return [field, typeof candidate === "string" ? candidate.replace(/[^\d.]/g, "") : ""];
          }),
        ) as Record<string, string>;
        const nextRole = me.current_book?.role ?? "";
        const nextCanEdit =
          settings.canEdit && !READONLY_ROLES.includes(nextRole as Role);

        if (ignore) return;

        setCompanyDescription(settings.companyDescription ?? "");
        setExpenseValues(nextValues);
        setSavedExpenseValues(nextValues);
        setCanEdit(nextCanEdit);
      } catch {
        if (!ignore) setLoadError("Unable to load expense settings.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadExpenseSettings();

    return () => {
      ignore = true;
    };
  }, []);

  const isDirty =
    JSON.stringify(expenseValues) !== JSON.stringify(savedExpenseValues);

  function updateExpenseValue(field: string, value: string) {
    const numericValue = value.replace(/[^\d.]/g, "");
    setExpenseValues((current) => ({ ...current, [field]: numericValue }));
    setSaveError("");
  }

  async function handleSave() {
    const normalized = DEFAULT_EXPENSE_FIELDS.map((field) => expenseValues[field]?.trim() ?? "");

    setIsSaving(true);
    setSaveError("");

    try {
      const res = await apiFetch("/api/settings/company", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyDescription,
          expenseCategories: normalized,
        }),
      });

      const data = (await res.json().catch(() => null)) as
        | { error?: string }
        | CompanySettingsResponse
        | null;

      if (!res.ok) {
        setSaveError(getSaveErrorMessage(data?.error ?? "failed"));
        return;
      }

      const rawCategories = Array.isArray((data as CompanySettingsResponse).expenseCategories)
        ? (data as CompanySettingsResponse).expenseCategories
        : [];
      const nextValues = Object.fromEntries(
        DEFAULT_EXPENSE_FIELDS.map((field, index) => {
          const candidate = rawCategories[index] ?? "";
          return [field, typeof candidate === "string" ? candidate.replace(/[^\d.]/g, "") : ""];
        }),
      ) as Record<string, string>;

      setExpenseValues(nextValues);
      setSavedExpenseValues(nextValues);
    } catch {
      setSaveError("Unable to save expense values.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="dashboard-shell h-screen overflow-hidden bg-white md:flex">
      <DashboardSidebar
        isMobileOpen={isSidebarOpen}
        onMobileClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
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
              Expense
            </h1>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[720px] px-5 py-10">
            {loading ? (
              <div className="flex min-h-[260px] items-center justify-center text-[14px] text-[#8f8983]">
                <LoaderCircle size={18} className="mr-2 animate-spin" aria-hidden="true" />
                Loading expense settings...
              </div>
            ) : loadError ? (
              <div className="rounded-[12px] border border-[#f1d4d2] bg-[#fff6f5] px-4 py-3 text-[13px] text-[#b23b2a]">
                {loadError}
              </div>
            ) : (
              <>
                <motion.div
                  className="mb-9 text-center"
                  initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={itemTransition}
                >
                  <h2 className="text-[24px] font-semibold leading-[1.23] text-[#000000]">
                    Manage expense categories
                  </h2>
                  <p className="mt-2 text-[15px] leading-6 text-[#615d59]">
                    Add, rename, remove, and reorder the expense categories used by your workspace.
                  </p>
                </motion.div>

                {saveError ? (
                  <div className="mb-6 flex items-start gap-2 rounded-[12px] border border-[#f1d4d2] bg-[#fff6f5] px-4 py-3 text-[13px] text-[#b23b2a]">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                    <span>{saveError}</span>
                  </div>
                ) : null}

                <motion.div
                  className="grid gap-3 sm:grid-cols-2"
                  animate="show"
                  initial="hidden"
                  variants={{
                    hidden: {},
                    show: { transition: { staggerChildren: shouldReduceMotion ? 0 : 0.035 } },
                  }}
                >
                  {DEFAULT_EXPENSE_FIELDS.map((defaultCategory) => (
                    <motion.div
                      key={defaultCategory}
                      className="block"
                      variants={{
                        hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 10 },
                        show: { opacity: 1, y: 0, transition: itemTransition },
                      }}
                    >
                      <span className="mb-2 block text-[15px] font-medium leading-5 text-[#31302e]">
                        {defaultCategory}
                      </span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={expenseValues[defaultCategory] ?? ""}
                        disabled={!canEdit}
                        title={!canEdit ? READONLY_TOOLTIP : undefined}
                        onChange={(event) => updateExpenseValue(defaultCategory, event.target.value)}
                        placeholder="0.00"
                        className={`h-11 w-full rounded-[8px] border border-[#e6e6e6] bg-white px-4 text-[15px] text-[#000000] shadow-[0_1px_2px_rgba(0,0,0,0.04)] outline-none transition placeholder:text-[#a39e98] focus:border-[#0075de] focus:ring-4 focus:ring-[#62aef0]/20 ${
                          !canEdit ? "cursor-not-allowed bg-[#f6f5f4] opacity-60" : ""
                        }`}
                      />
                    </motion.div>
                  ))}
                </motion.div>

                <motion.p
                  className="mt-5 text-[13px] leading-5 text-[#615d59]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: shouldReduceMotion ? 0 : 0.24, duration: 0.24 }}
                >
                  This page only manages the fixed expense fields used in welcome setup.
                </motion.p>

                <motion.button
                  type="button"
                  disabled={!canEdit || !isDirty || isSaving}
                  title={!canEdit ? READONLY_TOOLTIP : undefined}
                  onClick={handleSave}
                  className="mt-7 flex h-11 w-full items-center justify-center gap-2 rounded-[8px] bg-[#0075de] px-5 text-[16px] font-semibold text-white shadow-[0_1px_2px_rgba(0,91,171,0.28)] transition hover:bg-[#0b83ea] focus:outline-none focus:ring-4 focus:ring-[#62aef0]/25 disabled:cursor-not-allowed disabled:bg-[#b9d9f7] disabled:text-white disabled:shadow-none"
                  initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: shouldReduceMotion ? 0 : 0.3, ...itemTransition }}
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.992 }}
                >
                  {isSaving ? (
                    <>
                      <LoaderCircle size={17} className="animate-spin" aria-hidden="true" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check size={17} aria-hidden="true" />
                      Save changes
                    </>
                  )}
                </motion.button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
