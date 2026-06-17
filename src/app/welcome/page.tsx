"use client";

import { Check, ChevronRight } from "lucide-react";
import {
  AnimatePresence,
  motion,
  type Transition,
  useReducedMotion,
} from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

const languages = [
  {
    value: "en-US",
    apiValue: "en",
    title: "English (US)",
    subtitle: "Use English for workspace labels and messages.",
    isChinese: false,
  },
  {
    value: "zh-SG",
    apiValue: "zh",
    title: "简体中文",
    subtitle:
      "使用简体中文作为工作区语言。",
    isChinese: true,
  },
] as const;

type Language = (typeof languages)[number];
type LanguageValue = Language["value"];

const READONLY_ROLES = ["employee", "support"] as const;

const expenseItems = [
  { key: "EPF", label: { "en-US": "EPF", "zh-SG": "EPF" } },
  { key: "SOSCO", label: { "en-US": "SOSCO", "zh-SG": "SOSCO" } },
  {
    key: "Tax Expense",
    label: { "en-US": "Tax Expense", "zh-SG": "税务费用" },
  },
  {
    key: "Rental",
    label: { "en-US": "Rental", "zh-SG": "租金" },
  },
  {
    key: "Staff Allowance",
    label: {
      "en-US": "Staff Allowance",
      "zh-SG": "员工津贴",
    },
  },
  {
    key: "Water Expense",
    label: { "en-US": "Water Expense", "zh-SG": "水费" },
  },
  {
    key: "Staff Cost",
    label: { "en-US": "Staff Cost", "zh-SG": "员工成本" },
  },
  {
    key: "Communication",
    label: {
      "en-US": "Communication",
      "zh-SG": "通讯费",
    },
  },
  {
    key: "Electricity Expense",
    label: {
      "en-US": "Electricity Expense",
      "zh-SG": "电费",
    },
  },
] as const;

type SetupStep = "workspace" | "expenses";

const translations: Record<
  LanguageValue,
  {
    workspaceTitle: string;
    expensesTitle: string;
    expensesSubtitle: string;
    languageLegend: string;
    companyLabel: string;
    companyPlaceholder: string;
    companyHelper: string;
    expensesHelper: string;
    continue: string;
    readonlyNotice: string;
  }
> = {
  "en-US": {
    workspaceTitle: "Set up your workspace",
    expensesTitle: "Set up your expenses",
    expensesSubtitle:
      "Add typical monthly amounts so AI can create better reports.",
    languageLegend: "Workspace language",
    companyLabel: "What does your company do?",
    companyPlaceholder:
      "Example: We distribute office supplies and manage recurring supplier invoices.",
    companyHelper:
      "A short description helps prepare the workspace around your daily work.",
    expensesHelper:
      "These values are only used to understand your reporting context. You can change them later.",
    continue: "Continue",
    readonlyNotice:
      "Only workspace owners and admins can change these settings.",
  },
  "zh-SG": {
    workspaceTitle: "设置你的工作区",
    expensesTitle: "设置你的费用项目",
    expensesSubtitle:
      "输入常见的每月金额，让 AI 更好地生成报表。",
    languageLegend: "工作区语言",
    companyLabel: "你的公司主要做什么？",
    companyPlaceholder:
      "例如：我们分销办公用品，并管理固定供应商发票。",
    companyHelper:
      "简短描述可以帮助工作区更贴近你的日常作业。",
    expensesHelper:
      "这些金额只用于理解你的报表背景，之后可以再修改。",
    continue: "继续",
    readonlyNotice:
      "只有工作区拥有者和管理员才能更改这些设置。",
  },
};

function WelcomeSetup({
  step,
  setStep,
  readonly,
  onComplete,
}: Readonly<{
  step: SetupStep;
  setStep: (step: SetupStep) => void;
  readonly: boolean;
  onComplete: () => void;
}>) {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(
    languages[0],
  );
  const [companyDescription, setCompanyDescription] = useState("");
  const [expenseValues, setExpenseValues] = useState<Record<string, string>>(
    () =>
      Object.fromEntries(
        expenseItems.map((expense) => [expense.key, ""]),
      ) as Record<string, string>,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const copy = translations[selectedLanguage.value];
  const isChinese = selectedLanguage.isChinese;
  const pageTransition: Transition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.34, ease: [0.22, 1, 0.36, 1] as const };
  const itemTransition: Transition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const };

  useEffect(() => {
    document.documentElement.setAttribute("lang", selectedLanguage.value);
  }, [selectedLanguage.value]);

  function handleLanguageChange(language: Language) {
    setSelectedLanguage(language);
    document.documentElement.setAttribute("lang", language.value);
  }

  async function saveCompanySettings() {
    const normalizedExpenses = expenseItems.map(
      (expense) => expenseValues[expense.key]?.trim() ?? "",
    );

    const res = await apiFetch("/api/settings/company", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyDescription,
        expenseCategories: normalizedExpenses,
      }),
    });

    if (!res.ok) {
      throw new Error("company_save_failed");
    }
  }

  async function handleWorkspaceContinue() {
    setSaveError(false);
    setIsSubmitting(true);
    try {
      const res = await apiFetch("/api/settings/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: selectedLanguage.apiValue }),
      });
      if (!res.ok) {
        setSaveError(true);
        return;
      }
    } catch {
      setSaveError(true);
      return;
    } finally {
      setIsSubmitting(false);
    }
    setStep("expenses");
  }

  async function handleComplete() {
    setSaveError(false);
    setIsSubmitting(true);

    try {
      if (!readonly) {
        await saveCompanySettings();
      }
      onComplete();
    } catch {
      setSaveError(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleExpenseChange(expense: string, value: string) {
    if (readonly) return;
    setExpenseValues((currentValues) => ({
      ...currentValues,
      [expense]: value.replace(/[^\d.]/g, ""),
    }));
  }

  return (
    <main
      className={`relative flex min-h-screen items-center overflow-hidden bg-white px-5 py-8 md:px-8 md:py-10 ${
        isChinese ? "font-zh" : ""
      }`}
    >
      <motion.div
        aria-hidden="true"
        animate={{
          opacity: shouldReduceMotion ? 0 : 1,
          scale: shouldReduceMotion ? 1 : 1.04,
        }}
        className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(246,245,244,0.72)_0%,rgba(246,245,244,0.28)_38%,rgba(255,255,255,0)_70%)]"
        initial={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
      <motion.section
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative mx-auto w-full max-w-[560px]"
        initial={{
          opacity: 0,
          scale: shouldReduceMotion ? 1 : 0.985,
          y: shouldReduceMotion ? 0 : 14,
        }}
        transition={pageTransition}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            animate={{ opacity: 1, y: 0 }}
            exit={{
              opacity: 0,
              y: shouldReduceMotion ? 0 : -8,
              transition: { duration: shouldReduceMotion ? 0 : 0.14 },
            }}
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
            transition={pageTransition}
          >
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="mb-9 text-center"
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
              transition={itemTransition}
            >
              <h1 className="text-[24px] font-semibold leading-[1.23] text-[#000000]">
                {step === "workspace" ? copy.workspaceTitle : null}
                {step === "expenses" ? copy.expensesTitle : null}
              </h1>
              {step === "expenses" ? (
                <p className="mt-2 text-[15px] leading-6 text-[#615d59]">
                  {copy.expensesSubtitle}
                </p>
              ) : null}
            </motion.div>

            {step === "workspace" ? (
              <motion.div
                animate="show"
                className="space-y-7"
                initial="hidden"
                variants={{
                  hidden: {},
                  show: {
                    transition: {
                      staggerChildren: shouldReduceMotion ? 0 : 0.055,
                    },
                  },
                }}
              >
                <motion.fieldset
                  variants={{
                    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 10 },
                    show: { opacity: 1, y: 0, transition: itemTransition },
                  }}
                >
                  <legend className="mb-3 text-[15px] font-medium leading-5 text-[#31302e]">
                    {copy.languageLegend}
                  </legend>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {languages.map((language) => {
                      const isSelected =
                        language.value === selectedLanguage.value;
                      return (
                        <motion.button
                          key={language.value}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => handleLanguageChange(language)}
                          className={`min-h-[92px] rounded-[8px] border bg-white p-4 text-left outline-none transition hover:bg-[#f6f5f4] focus:ring-4 focus:ring-[#62aef0]/20 ${
                            isSelected
                              ? "border-[#0075de]"
                              : "border-[#e6e6e6]"
                          }`}
                          whileTap={
                            shouldReduceMotion ? undefined : { scale: 0.992 }
                          }
                        >
                          <span className="flex items-start justify-between gap-3">
                            <span>
                              <span
                                className={`block text-[15px] font-medium leading-5 text-[#31302e] ${
                                  language.value === "zh-SG"
                                    ? "font-zh tracking-[0.01em]"
                                    : ""
                                }`}
                              >
                                {language.title}
                              </span>
                              <span className="mt-1 block text-[13px] font-normal leading-5 text-[#615d59]">
                                {language.subtitle}
                              </span>
                            </span>
                            {isSelected ? (
                              <motion.span
                                animate={{ scale: 1 }}
                                className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#0075de] text-white"
                                initial={{
                                  scale: shouldReduceMotion ? 1 : 0.86,
                                }}
                                transition={itemTransition}
                              >
                                <Check size={13} aria-hidden="true" />
                              </motion.span>
                            ) : (
                              <span className="size-5 shrink-0 rounded-full border border-[#e6e6e6]" />
                            )}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.fieldset>

                <motion.label
                  className="block"
                  variants={{
                    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 10 },
                    show: { opacity: 1, y: 0, transition: itemTransition },
                  }}
                >
                  <span className="mb-2 block text-[15px] font-medium leading-5 text-[#31302e]">
                    {copy.companyLabel}
                  </span>
                  <textarea
                    value={companyDescription}
                    onChange={(event) => {
                      if (!readonly)
                        setCompanyDescription(event.target.value);
                    }}
                    disabled={readonly}
                    title={readonly ? copy.readonlyNotice : undefined}
                    placeholder={copy.companyPlaceholder}
                    rows={5}
                    className={`min-h-[132px] w-full resize-none rounded-[8px] border border-[#e6e6e6] bg-white px-4 py-3 text-[15px] leading-6 text-[#000000] shadow-[0_1px_2px_rgba(0,0,0,0.04)] outline-none transition placeholder:text-[#a39e98] focus:border-[#0075de] focus:ring-4 focus:ring-[#62aef0]/20 ${
                      readonly
                        ? "cursor-not-allowed opacity-50 bg-[#f6f5f4]"
                        : ""
                    }`}
                  />
                  <span className="mt-2 block text-[13px] leading-5 text-[#615d59]">
                    {copy.companyHelper}
                  </span>
                </motion.label>

                <motion.button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleWorkspaceContinue}
                  className="relative flex h-11 w-full items-center justify-center gap-2 rounded-[8px] bg-[#0075de] px-5 text-[16px] font-semibold text-white shadow-[0_1px_2px_rgba(0,91,171,0.28)] transition hover:bg-[#0b83ea] focus:outline-none focus:ring-4 focus:ring-[#62aef0]/25 disabled:cursor-not-allowed disabled:bg-[#62aef0]"
                  variants={{
                    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 10 },
                    show: { opacity: 1, y: 0, transition: itemTransition },
                  }}
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.992 }}
                >
                  {copy.continue}
                  {isSubmitting ? (
                    <span
                      aria-hidden="true"
                      className="absolute right-4 size-4 animate-spin rounded-full border-2 border-white/45 border-t-white"
                    />
                  ) : (
                    <ChevronRight size={17} aria-hidden="true" />
                  )}
                </motion.button>

                {saveError ? (
                  <motion.p
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center text-[13px] text-red-500"
                    initial={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.2 }}
                  >
                    {selectedLanguage.value === "zh-SG"
                      ? "保存失败，请重试。"
                      : "Failed to save. Please try again."}
                  </motion.p>
                ) : null}
              </motion.div>
            ) : (
              <motion.div
                animate="show"
                className="space-y-7"
                initial="hidden"
                variants={{
                  hidden: {},
                  show: {
                    transition: {
                      staggerChildren: shouldReduceMotion ? 0 : 0.035,
                    },
                  },
                }}
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  {expenseItems.map((expense) => (
                    <motion.label
                      key={expense.key}
                      className="block"
                      variants={{
                        hidden: {
                          opacity: 0,
                          y: shouldReduceMotion ? 0 : 10,
                        },
                        show: {
                          opacity: 1,
                          y: 0,
                          transition: itemTransition,
                        },
                      }}
                    >
                      <span className="mb-2 block text-[15px] font-medium leading-5 text-[#31302e]">
                        {expense.label[selectedLanguage.value]}
                      </span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={expenseValues[expense.key]}
                        onChange={(event) =>
                          handleExpenseChange(expense.key, event.target.value)
                        }
                        disabled={readonly}
                        title={readonly ? copy.readonlyNotice : undefined}
                        placeholder="0.00"
                        className={`h-11 w-full rounded-[8px] border border-[#e6e6e6] bg-white px-4 text-[15px] text-[#000000] shadow-[0_1px_2px_rgba(0,0,0,0.04)] outline-none transition placeholder:text-[#a39e98] focus:border-[#0075de] focus:ring-4 focus:ring-[#62aef0]/20 ${
                          readonly
                            ? "cursor-not-allowed opacity-50 bg-[#f6f5f4]"
                            : ""
                        }`}
                      />
                    </motion.label>
                  ))}
                </div>

                <motion.p
                  className="text-[13px] leading-5 text-[#615d59]"
                  variants={{
                    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 8 },
                    show: { opacity: 1, y: 0, transition: itemTransition },
                  }}
                >
                  {copy.expensesHelper}
                </motion.p>

                <motion.button
                  type="button"
                  onClick={handleComplete}
                  disabled={isSubmitting}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-[8px] bg-[#0075de] px-5 text-[16px] font-semibold text-white shadow-[0_1px_2px_rgba(0,91,171,0.28)] transition hover:bg-[#0b83ea] focus:outline-none focus:ring-4 focus:ring-[#62aef0]/25 disabled:cursor-not-allowed disabled:bg-[#62aef0]"
                  variants={{
                    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 10 },
                    show: { opacity: 1, y: 0, transition: itemTransition },
                  }}
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.992 }}
                >
                  {copy.continue}
                  {isSubmitting ? (
                    <span
                      aria-hidden="true"
                      className="size-4 animate-spin rounded-full border-2 border-white/45 border-t-white"
                    />
                  ) : (
                    <ChevronRight size={17} aria-hidden="true" />
                  )}
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.section>
    </main>
  );
}

export default function WelcomePage() {
  const router = useRouter();
  const [pageState, setPageState] = useState<"checking" | "ready">("checking");
  const [readonly, setReadonly] = useState(false);
  const [step, setStep] = useState<SetupStep>("workspace");

  useEffect(() => {
    apiFetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { need_setup?: boolean; current_book?: { role: string } } | null) => {
        if (!data) {
          router.replace("/login");
          return;
        }
        if (!data.need_setup) {
          router.replace("/purchase-invoice");
          return;
        }
        const role = data.current_book?.role ?? "";
        setReadonly(
          (READONLY_ROLES as readonly string[]).includes(role),
        );
        setPageState("ready");
      })
      .catch(() => router.replace("/login"));
  }, [router]);

  if (pageState === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <span
          aria-label="Loading…"
          className="size-8 animate-spin rounded-full border-2 border-[#e6e6e6] border-t-[#0075de]"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#000000]">
      <WelcomeSetup
        step={step}
        setStep={setStep}
        readonly={readonly}
        onComplete={() => router.replace("/purchase-invoice")}
      />
    </div>
  );
}
