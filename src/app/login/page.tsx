"use client";

import { Check, ChevronDown, Globe2 } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { FormEvent, startTransition, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "dashboard-language";

const languages = [
  {
    value: "en-US",
    label: "English (US)",
    description: "English (US)",
    isChinese: false,
  },
  {
    value: "zh-SG",
    label: "\u7b80\u4f53\u4e2d\u6587",
    description: "Simplified Chinese",
    isChinese: true,
  },
];

type Language = (typeof languages)[number];
type LanguageValue = Language["value"];

const translations: Record<
  LanguageValue,
  {
    title: string;
    subtitle: string;
    email: string;
    emailPlaceholder: string;
    emailRequired: string;
    emailInvalid: string;
    helper: string;
    password: string;
    passwordPlaceholder: string;
    passwordRequired: string;
    mfa: string;
    mfaPlaceholder: string;
    mfaRequired: string;
    continue: string;
    continuing: string;
    divider: string;
    google: string;
    termsPrefix: string;
    terms: string;
    termsJoin: string;
    privacy: string;
    language: string;
  }
> = {
  "en-US": {
    title: "Your AI workspace.",
    subtitle: "Log in to your 365Biz account",
    email: "Email",
    emailPlaceholder: "Enter your email address...",
    emailRequired: "Enter your email address",
    emailInvalid: "Enter a valid email address",
    helper: "Use an organization email to easily collaborate with teammates",
    password: "Password",
    passwordPlaceholder: "Enter your password",
    passwordRequired: "Enter your password",
    mfa: "MFA code",
    mfaPlaceholder: "Enter verification code",
    mfaRequired: "Enter the 6-digit MFA code",
    continue: "Continue",
    continuing: "Continuing",
    divider: "or continue with",
    google: "Google",
    termsPrefix:
      "By continuing, you acknowledge that you understand and agree to",
    terms: "Terms & Conditions",
    termsJoin: "and",
    privacy: "Privacy Policy",
    language: "Language:",
  },
  "zh-SG": {
    title: "\u4f60\u7684 AI \u5de5\u4f5c\u7a7a\u95f4\u3002",
    subtitle: "\u767b\u5165\u4f60\u7684 365Biz \u8d26\u6237",
    email: "\u7535\u5b50\u90ae\u7bb1",
    emailPlaceholder: "\u8f93\u5165\u4f60\u7684\u7535\u5b50\u90ae\u7bb1...",
    emailRequired: "\u8bf7\u8f93\u5165\u7535\u5b50\u90ae\u7bb1",
    emailInvalid: "\u8bf7\u8f93\u5165\u6709\u6548\u7684\u7535\u5b50\u90ae\u7bb1",
    helper:
      "\u4f7f\u7528\u516c\u53f8\u90ae\u7bb1\uff0c\u66f4\u65b9\u4fbf\u4e0e\u56e2\u961f\u534f\u4f5c",
    password: "\u5bc6\u7801",
    passwordPlaceholder: "\u8f93\u5165\u4f60\u7684\u5bc6\u7801",
    passwordRequired: "\u8bf7\u8f93\u5165\u5bc6\u7801",
    mfa: "MFA \u9a8c\u8bc1\u7801",
    mfaPlaceholder: "\u8f93\u5165\u9a8c\u8bc1\u7801",
    mfaRequired: "\u8bf7\u8f93\u5165 6 \u4f4d MFA \u9a8c\u8bc1\u7801",
    continue: "\u7ee7\u7eed",
    continuing: "\u5904\u7406\u4e2d",
    divider: "\u6216\u4f7f\u7528\u4ee5\u4e0b\u65b9\u5f0f\u7ee7\u7eed",
    google: "Google",
    termsPrefix:
      "\u7ee7\u7eed\u5373\u8868\u793a\u4f60\u5df2\u4e86\u89e3\u5e76\u540c\u610f",
    terms: "\u6761\u6b3e\u4e0e\u6761\u4ef6",
    termsJoin: "\u548c",
    privacy: "\u9690\u79c1\u653f\u7b56",
    language: "\u8bed\u8a00:",
  },
};

function getStoredLanguage(): Language | null {
  if (typeof window === "undefined") {
    return null;
  }

  const storedValue = window.localStorage.getItem(STORAGE_KEY);
  return languages.find((language) => language.value === storedValue) ?? null;
}

export default function Home() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showMfa, setShowMfa] = useState(false);
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [mfaError, setMfaError] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(
    languages[0],
  );
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const mfaInputRef = useRef<HTMLInputElement>(null);
  const languageMenuRef = useRef<HTMLDivElement>(null);

  const copy = translations[selectedLanguage.value];
  const isChinese = selectedLanguage.isChinese;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedEmail = email.trim();
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);

    if (!showPassword && trimmedEmail.length === 0) {
      setEmailError(copy.emailRequired);
      return;
    }

    if (!showPassword && !isEmailValid) {
      setEmailError(copy.emailInvalid);
      return;
    }

    if (showPassword && password.trim().length === 0) {
      setPasswordError(copy.passwordRequired);
      window.requestAnimationFrame(() => passwordInputRef.current?.focus());
      return;
    }

    if (showMfa && mfaCode.length < 6) {
      setMfaError(copy.mfaRequired);
      window.requestAnimationFrame(() => mfaInputRef.current?.focus());
      return;
    }

    setEmailError("");
    setPasswordError("");
    setMfaError("");
    setIsSubmitting(true);
    window.setTimeout(() => {
      setIsSubmitting(false);

      if (!showPassword) {
        setShowPassword(true);
        window.requestAnimationFrame(() => passwordInputRef.current?.focus());
        return;
      }

      if (!showMfa) {
        setShowMfa(true);
        window.requestAnimationFrame(() => mfaInputRef.current?.focus());
      }
    }, 650);
  }

  function handleLanguageChange(language: Language) {
    setSelectedLanguage(language);
    setIsLanguageOpen(false);
    window.localStorage.setItem(STORAGE_KEY, language.value);
    document.documentElement.setAttribute("lang", language.value);
  }

  useEffect(() => {
    const storedLanguage = getStoredLanguage();

    if (storedLanguage) {
      startTransition(() => setSelectedLanguage(storedLanguage));
      document.documentElement.setAttribute("lang", storedLanguage.value);
    }
  }, []);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!languageMenuRef.current?.contains(event.target as Node)) {
        setIsLanguageOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsLanguageOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <main
      className={`flex min-h-screen items-center justify-center bg-[#ffffff] px-6 py-10 text-[#000000] ${
        isChinese ? "font-zh" : ""
      }`}
    >
      <section className="w-full max-w-[380px]">
        <div className="mb-9 text-center">
          <h1 className="text-[24px] font-semibold leading-[1.23]">
            {copy.title}
          </h1>
          <p className="mt-1 text-[22px] font-semibold leading-[1.23] text-[#8f8983]">
            {copy.subtitle}
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <label className="block">
            <span className="mb-2 block text-[15px] font-medium leading-5 text-[#31302e]">
              {copy.email}
            </span>
            <input
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setEmailError("");
              }}
              autoComplete="email"
              inputMode="email"
              placeholder={copy.emailPlaceholder}
              aria-invalid={emailError ? "true" : "false"}
              className={`h-11 w-full rounded-[8px] border bg-white px-4 text-[15px] text-[#000000] shadow-[0_1px_2px_rgba(0,0,0,0.04)] outline-none transition placeholder:text-[#a39e98] focus:border-[#0075de] focus:ring-4 focus:ring-[#62aef0]/20 ${
                emailError ? "border-[#d92d20]" : "border-[#e6e6e6]"
              }`}
            />
          </label>

          {emailError ? (
            <p className="mt-2 text-[13px] leading-5 text-[#d92d20]">
              {emailError}
            </p>
          ) : (
            <p className="mt-2 whitespace-nowrap text-[clamp(11px,3vw,13px)] leading-5 text-[#615d59]">
              {copy.helper}
            </p>
          )}

          {showPassword ? (
            <>
              <motion.label
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 block"
                initial={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                <span className="mb-2 block text-[15px] font-medium leading-5 text-[#31302e]">
                  {copy.password}
                </span>
                <input
                  ref={passwordInputRef}
                  type="password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setPasswordError("");
                  }}
                  autoComplete="current-password"
                  placeholder={copy.passwordPlaceholder}
                  aria-invalid={passwordError ? "true" : "false"}
                  className={`h-11 w-full rounded-[8px] border bg-white px-4 text-[15px] text-[#000000] shadow-[0_1px_2px_rgba(0,0,0,0.04)] outline-none transition placeholder:text-[#a39e98] focus:border-[#0075de] focus:ring-4 focus:ring-[#62aef0]/20 ${
                    passwordError ? "border-[#d92d20]" : "border-[#e6e6e6]"
                  }`}
                />
                {passwordError ? (
                  <p className="mt-2 text-[13px] leading-5 text-[#d92d20]">
                    {passwordError}
                  </p>
                ) : null}
              </motion.label>

              {showMfa ? (
                <motion.label
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-5 block"
                  initial={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                >
                  <span className="mb-2 block text-[15px] font-medium leading-5 text-[#31302e]">
                    {copy.mfa}
                  </span>
                  <div>
                    <div className="relative">
                      <input
                        ref={mfaInputRef}
                        type="text"
                        value={mfaCode}
                        onChange={(event) => {
                          const nextCode = event.target.value
                            .replace(/\D/g, "")
                            .slice(0, 6);

                          setMfaCode(nextCode);
                          setMfaError("");
                        }}
                        autoComplete="one-time-code"
                        inputMode="numeric"
                        maxLength={6}
                        pattern="[0-9]*"
                        placeholder={copy.mfaPlaceholder}
                        aria-invalid={mfaError ? "true" : "false"}
                        className={`h-11 w-full rounded-[8px] border bg-white px-4 pr-11 text-[15px] text-[#000000] shadow-[0_1px_2px_rgba(0,0,0,0.04)] outline-none transition placeholder:text-[#a39e98] focus:border-[#0075de] focus:ring-4 focus:ring-[#62aef0]/20 ${
                          mfaError ? "border-[#d92d20]" : "border-[#e6e6e6]"
                        }`}
                      />
                      <motion.span
                        key={mfaCode.length}
                        animate={{ opacity: 1, y: "-50%" }}
                        aria-live="polite"
                        className="pointer-events-none absolute right-4 top-1/2 text-[13px] font-medium text-[#a39e98]"
                        initial={{ opacity: 0, y: "-38%" }}
                        transition={{ duration: 0.16, ease: "easeOut" }}
                      >
                        {6 - mfaCode.length}
                      </motion.span>
                    </div>
                    {mfaError ? (
                      <p className="mt-2 text-[13px] leading-5 text-[#d92d20]">
                        {mfaError}
                      </p>
                    ) : null}
                  </div>
                </motion.label>
              ) : null}
            </>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="relative mt-6 flex h-11 w-full items-center justify-center rounded-[8px] bg-[#0075de] px-5 text-base font-semibold text-white shadow-[0_1px_2px_rgba(0,91,171,0.28)] transition hover:bg-[#0b83ea] focus:outline-none focus:ring-4 focus:ring-[#62aef0]/25 disabled:cursor-not-allowed disabled:bg-[#62aef0]"
          >
            {isSubmitting ? copy.continuing : copy.continue}
            {isSubmitting ? (
              <span
                aria-hidden="true"
                className="absolute right-4 size-4 animate-spin rounded-full border-2 border-white/45 border-t-white"
              />
            ) : null}
          </button>
        </form>

        <div className="mb-5 mt-6 flex items-center gap-3 text-sm text-[#a39e98]">
          <span className="h-px flex-1 bg-[#e6e6e6]" />
          <span>{copy.divider}</span>
          <span className="h-px flex-1 bg-[#e6e6e6]" />
        </div>

        <button
          type="button"
          className="flex h-11 w-full items-center justify-center gap-3 rounded-[8px] border border-[#e6e6e6] bg-white px-5 text-[15px] font-medium text-[#000000] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition hover:border-[#e6e6e6] hover:bg-[#f6f5f4] focus:outline-none focus:ring-4 focus:ring-[#62aef0]/20"
        >
          <Image src="/google.svg" alt="" width={20} height={20} />
          <span>{copy.google}</span>
        </button>

        <p className="mt-5 text-center text-[12px] leading-5 text-[#a39e98]">
          {copy.termsPrefix}{" "}
          <a
            href="#"
            className="font-normal text-[#a39e98] underline decoration-[#a39e98] decoration-[1px] underline-offset-[2px] transition hover:text-[#0075de] hover:decoration-[#0075de]"
          >
            {copy.terms}
          </a>{" "}
          {copy.termsJoin}{" "}
          <a
            href="#"
            className="font-normal text-[#a39e98] underline decoration-[#a39e98] decoration-[1px] underline-offset-[2px] transition hover:text-[#0075de] hover:decoration-[#0075de]"
          >
            {copy.privacy}
          </a>
        </p>
      </section>

      <div
        ref={languageMenuRef}
        className="fixed bottom-3 left-1/2 h-11 -translate-x-1/2 text-[14px] text-[#615d59]"
      >
        <div className="relative flex h-11 items-center">
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={isLanguageOpen}
            onClick={() => setIsLanguageOpen((value) => !value)}
            className={`flex h-8 items-center gap-1.5 rounded-[5px] px-1.5 text-[14px] font-normal text-[#615d59] outline-none transition hover:bg-[#f6f5f4] focus:bg-[#f6f5f4] ${
              isLanguageOpen ? "bg-[#f6f5f4]" : "bg-transparent"
            }`}
          >
            <Globe2 size={15} className="text-current" aria-hidden="true" />
            <span>{copy.language}</span>
            <span>{selectedLanguage.label}</span>
            <motion.span
              aria-hidden="true"
              animate={{ rotate: isLanguageOpen ? 180 : 0 }}
              className="flex text-current"
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <ChevronDown size={14} />
            </motion.span>
          </button>

          {isLanguageOpen ? (
            <div
              className="absolute bottom-full left-1/2 w-[220px] -translate-x-1/2 rounded-[8px] border border-[#e6e6e6] bg-white p-1 shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
              role="listbox"
            >
              {languages.map((language) => {
                const isSelected = language.value === selectedLanguage.value;

                return (
                  <button
                    key={language.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleLanguageChange(language)}
                    className="flex min-h-12 w-full items-center justify-between gap-3 rounded-[6px] px-3 py-2 text-left transition hover:bg-[#f6f5f4]"
                  >
                    <span className="flex min-w-0 flex-col">
                      <span
                        className={`text-[14px] font-normal leading-5 text-[#31302e] ${
                          language.isChinese ? "font-zh tracking-[0.01em]" : ""
                        }`}
                      >
                        {language.label}
                      </span>
                      <span className="text-[12px] leading-4 text-[#8f8983]">
                        {language.description}
                      </span>
                    </span>
                    {isSelected ? (
                      <Check size={14} className="shrink-0 text-[#0075de]" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
