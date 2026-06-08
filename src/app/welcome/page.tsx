"use client";

import { Check, ChevronRight } from "lucide-react";
import {
  AnimatePresence,
  motion,
  type Transition,
  useReducedMotion,
} from "motion/react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "dashboard-language";

const languages = [
  {
    value: "en-US",
    title: "English (US)",
    subtitle: "Use English for workspace labels and messages.",
    isChinese: false,
  },
  {
    value: "zh-SG",
    title: "\u7b80\u4f53\u4e2d\u6587",
    subtitle: "\u4f7f\u7528\u7b80\u4f53\u4e2d\u6587\u4f5c\u4e3a\u5de5\u4f5c\u533a\u8bed\u8a00\u3002",
    isChinese: true,
  },
] as const;

type Language = (typeof languages)[number];
type LanguageValue = Language["value"];

const expenseItems = [
  {
    key: "EPF",
    label: {
      "en-US": "EPF",
      "zh-SG": "EPF",
    },
  },
  {
    key: "SOSCO",
    label: {
      "en-US": "SOSCO",
      "zh-SG": "SOSCO",
    },
  },
  {
    key: "Tax Expense",
    label: {
      "en-US": "Tax Expense",
      "zh-SG": "\u7a0e\u52a1\u8d39\u7528",
    },
  },
  {
    key: "Rental",
    label: {
      "en-US": "Rental",
      "zh-SG": "\u79df\u91d1",
    },
  },
  {
    key: "Staff Allowance",
    label: {
      "en-US": "Staff Allowance",
      "zh-SG": "\u5458\u5de5\u6d25\u8d34",
    },
  },
  {
    key: "Water Expense",
    label: {
      "en-US": "Water Expense",
      "zh-SG": "\u6c34\u8d39",
    },
  },
  {
    key: "Staff Cost",
    label: {
      "en-US": "Staff Cost",
      "zh-SG": "\u5458\u5de5\u6210\u672c",
    },
  },
  {
    key: "Communication",
    label: {
      "en-US": "Communication",
      "zh-SG": "\u901a\u8baf\u8d39",
    },
  },
  {
    key: "Electricity Expense",
    label: {
      "en-US": "Electricity Expense",
      "zh-SG": "\u7535\u8d39",
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
  },
  "zh-SG": {
    workspaceTitle: "\u8bbe\u7f6e\u4f60\u7684\u5de5\u4f5c\u533a",
    expensesTitle: "\u8bbe\u7f6e\u4f60\u7684\u8d39\u7528\u9879\u76ee",
    expensesSubtitle:
      "\u8f93\u5165\u5e38\u89c1\u7684\u6bcf\u6708\u91d1\u989d\uff0c\u8ba9 AI \u66f4\u597d\u5730\u751f\u6210\u62a5\u8868\u3002",
    languageLegend: "\u5de5\u4f5c\u533a\u8bed\u8a00",
    companyLabel: "\u4f60\u7684\u516c\u53f8\u4e3b\u8981\u505a\u4ec0\u4e48\uff1f",
    companyPlaceholder:
      "\u4f8b\u5982\uff1a\u6211\u4eec\u5206\u9500\u529e\u516c\u7528\u54c1\uff0c\u5e76\u7ba1\u7406\u56fa\u5b9a\u4f9b\u5e94\u5546\u53d1\u7968\u3002",
    companyHelper:
      "\u7b80\u77ed\u63cf\u8ff0\u53ef\u4ee5\u5e2e\u52a9\u5de5\u4f5c\u533a\u66f4\u8d34\u8fd1\u4f60\u7684\u65e5\u5e38\u4f5c\u4e1a\u3002",
    expensesHelper:
      "\u8fd9\u4e9b\u91d1\u989d\u53ea\u7528\u4e8e\u7406\u89e3\u4f60\u7684\u62a5\u8868\u80cc\u666f\uff0c\u4e4b\u540e\u53ef\u4ee5\u518d\u4fee\u6539\u3002",
    continue: "\u7ee7\u7eed",
  },
};

function getStoredLanguage(): Language | null {
  if (typeof window === "undefined") {
    return null;
  }

  const storedValue = window.localStorage.getItem(STORAGE_KEY);
  return languages.find((language) => language.value === storedValue) ?? null;
}

function WelcomeSetup({
  step,
  setStep,
}: Readonly<{
  step: SetupStep;
  setStep: (step: SetupStep) => void;
}>) {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(
    () => getStoredLanguage() ?? languages[0],
  );
  const [companyDescription, setCompanyDescription] = useState("");
  const [expenseValues, setExpenseValues] = useState<Record<string, string>>(
    () =>
      Object.fromEntries(
        expenseItems.map((expense) => [expense.key, ""]),
      ) as Record<string, string>,
  );
  const [isLoadingNextStep, setIsLoadingNextStep] = useState(false);
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
    window.localStorage.setItem(STORAGE_KEY, language.value);
    document.documentElement.setAttribute("lang", language.value);
  }

  function handleWorkspaceContinue() {
    setIsLoadingNextStep(true);
    window.setTimeout(() => {
      setIsLoadingNextStep(false);
      setStep("expenses");
    }, 650);
  }

  function handleExpenseChange(expense: string, value: string) {
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
                    show: {
                      opacity: 1,
                      y: 0,
                      transition: itemTransition,
                    },
                  }}
                >
                  <legend className="mb-3 text-[15px] font-medium leading-5 text-[#31302e]">
                    {copy.languageLegend}
                  </legend>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {languages.map((language) => {
                      const isSelected = language.value === selectedLanguage.value;

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
                                initial={{ scale: shouldReduceMotion ? 1 : 0.86 }}
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
                    show: {
                      opacity: 1,
                      y: 0,
                      transition: itemTransition,
                    },
                  }}
                >
                  <span className="mb-2 block text-[15px] font-medium leading-5 text-[#31302e]">
                    {copy.companyLabel}
                  </span>
                  <textarea
                    value={companyDescription}
                    onChange={(event) =>
                      setCompanyDescription(event.target.value)
                    }
                    placeholder={copy.companyPlaceholder}
                    rows={5}
                    className="min-h-[132px] w-full resize-none rounded-[8px] border border-[#e6e6e6] bg-white px-4 py-3 text-[15px] leading-6 text-[#000000] shadow-[0_1px_2px_rgba(0,0,0,0.04)] outline-none transition placeholder:text-[#a39e98] focus:border-[#0075de] focus:ring-4 focus:ring-[#62aef0]/20"
                  />
                  <span className="mt-2 block text-[13px] leading-5 text-[#615d59]">
                    {copy.companyHelper}
                  </span>
                </motion.label>

                <motion.button
                  type="button"
                  disabled={isLoadingNextStep}
                  onClick={handleWorkspaceContinue}
                  className="relative flex h-11 w-full items-center justify-center gap-2 rounded-[8px] bg-[#0075de] px-5 text-[16px] font-semibold text-white shadow-[0_1px_2px_rgba(0,91,171,0.28)] transition hover:bg-[#0b83ea] focus:outline-none focus:ring-4 focus:ring-[#62aef0]/25 disabled:cursor-not-allowed disabled:bg-[#62aef0]"
                  variants={{
                    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 10 },
                    show: {
                      opacity: 1,
                      y: 0,
                      transition: itemTransition,
                    },
                  }}
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.992 }}
                >
                  {copy.continue}
                  {isLoadingNextStep ? (
                    <span
                      aria-hidden="true"
                      className="absolute right-4 size-4 animate-spin rounded-full border-2 border-white/45 border-t-white"
                    />
                  ) : (
                    <ChevronRight size={17} aria-hidden="true" />
                  )}
                </motion.button>
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
                        placeholder="0.00"
                        className="h-11 w-full rounded-[8px] border border-[#e6e6e6] bg-white px-4 text-[15px] text-[#000000] shadow-[0_1px_2px_rgba(0,0,0,0.04)] outline-none transition placeholder:text-[#a39e98] focus:border-[#0075de] focus:ring-4 focus:ring-[#62aef0]/20"
                      />
                    </motion.label>
                  ))}
                </div>

                <motion.p
                  className="text-[13px] leading-5 text-[#615d59]"
                  variants={{
                    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 8 },
                    show: {
                      opacity: 1,
                      y: 0,
                      transition: itemTransition,
                    },
                  }}
                >
                  {copy.expensesHelper}
                </motion.p>

                <motion.button
                  type="button"
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-[8px] bg-[#0075de] px-5 text-[16px] font-semibold text-white shadow-[0_1px_2px_rgba(0,91,171,0.28)] transition hover:bg-[#0b83ea] focus:outline-none focus:ring-4 focus:ring-[#62aef0]/25"
                  variants={{
                    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 10 },
                    show: {
                      opacity: 1,
                      y: 0,
                      transition: itemTransition,
                    },
                  }}
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.992 }}
                >
                  {copy.continue}
                  <ChevronRight size={17} aria-hidden="true" />
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
  const [step, setStep] = useState<SetupStep>("workspace");

  return (
    <div className="min-h-screen bg-white text-[#000000]">
      <WelcomeSetup step={step} setStep={setStep} />
    </div>
  );
}
