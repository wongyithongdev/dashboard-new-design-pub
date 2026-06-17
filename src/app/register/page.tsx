"use client";

import { Check, ChevronDown, Globe2 } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, startTransition, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "dashboard-language";
const AUTH_BASE_URL =
  process.env.NEXT_PUBLIC_AUTH_BASE_URL ?? "https://auth.my365biz.com/auth";

const languages = [
  {
    value: "en-US",
    label: "English (US)",
    description: "English (US)",
    isChinese: false,
  },
  {
    value: "zh-SG",
    label: "简体中文",
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
    inviteContext: string;
    email: string;
    emailPlaceholder: string;
    emailRequired: string;
    emailInvalid: string;
    helper: string;
    username: string;
    usernamePlaceholder: string;
    usernameRequired: string;
    password: string;
    passwordPlaceholder: string;
    passwordRequired: string;
    mfa: string;
    mfaPlaceholder: string;
    mfaRequired: string;
    scanTitle: string;
    scanHelper: string;
    scanContinue: string;
    continue: string;
    continuing: string;
    divider: string;
    google: string;
    termsPrefix: string;
    terms: string;
    termsJoin: string;
    privacy: string;
    language: string;
    invalidInvite: string;
    invalidInviteHelper: string;
  }
> = {
  "en-US": {
    title: "Your AI workspace.",
    subtitle: "Create your 365Biz account",
    inviteContext: "You've been invited to join",
    email: "Email",
    emailPlaceholder: "Enter your email address...",
    emailRequired: "Enter your email address",
    emailInvalid: "Enter a valid email address",
    helper: "Use an organization email to easily collaborate with teammates",
    username: "Username",
    usernamePlaceholder: "Choose a username",
    usernameRequired: "Enter a username",
    password: "Password",
    passwordPlaceholder: "Create your password",
    passwordRequired: "Create your password",
    mfa: "MFA code",
    mfaPlaceholder: "Enter verification code",
    mfaRequired: "Enter the 6-digit MFA code",
    scanTitle: "Scan the QR code",
    scanHelper: "Scan with your authenticator app, then enter the code below.",
    scanContinue: "I have scanned",
    continue: "Continue",
    continuing: "Continuing",
    divider: "or sign up with",
    google: "Google",
    termsPrefix:
      "By creating an account, you acknowledge that you understand and agree to",
    terms: "Terms & Conditions",
    termsJoin: "and",
    privacy: "Privacy Policy",
    language: "Language:",
    invalidInvite: "This invite link is invalid or has expired.",
    invalidInviteHelper: "Please request a new invite from your administrator.",
  },
  "zh-SG": {
    title: "你的 AI 工作空间。",
    subtitle: "创建你的 365Biz 账户",
    inviteContext: "你被邀请加入",
    email: "电子邮箱",
    emailPlaceholder: "输入你的电子邮箱...",
    emailRequired: "请输入电子邮箱",
    emailInvalid: "请输入有效的电子邮箱",
    helper: "使用公司邮箱，更方便与团队协作",
    username: "用户名",
    usernamePlaceholder: "选择一个用户名",
    usernameRequired: "请输入用户名",
    password: "密码",
    passwordPlaceholder: "创建你的密码",
    passwordRequired: "请创建密码",
    mfa: "MFA 验证码",
    mfaPlaceholder: "输入验证码",
    mfaRequired: "请输入 6 位 MFA 验证码",
    scanTitle: "扫描 QR Code",
    scanHelper: "使用身份验证应用扫描，然后输入下方的验证码。",
    scanContinue: "我已扫描",
    continue: "继续",
    continuing: "处理中",
    divider: "或使用以下方式注册",
    google: "Google",
    termsPrefix: "创建账户即表示你已了解并同意",
    terms: "条款与条件",
    termsJoin: "和",
    privacy: "隐私政策",
    language: "语言:",
    invalidInvite: "此邀请链接无效或已过期。",
    invalidInviteHelper: "请向管理员申请新的邀请。",
  },
};

function getStoredLanguage(): Language | null {
  if (typeof window === "undefined") return null;
  const storedValue = window.localStorage.getItem(STORAGE_KEY);
  return languages.find((l) => l.value === storedValue) ?? null;
}

function getStoredInviteCode(): string {
  if (typeof window === "undefined") return "";
  return window.sessionStorage.getItem("invite_code") ?? "";
}

type PageState = "verifying" | "invalid" | "form";
type FormStep = "credentials" | "qr" | "mfa";

export default function Register() {
  const router = useRouter();
  const initialInviteCode = getStoredInviteCode();

  // invite
  const [pageState, setPageState] = useState<PageState>(
    initialInviteCode ? "verifying" : "invalid",
  );
  const [inviteCode] = useState(initialInviteCode);
  const [bookName, setBookName] = useState("");
  const [countdown, setCountdown] = useState(5);

  // form
  const [formStep, setFormStep] = useState<FormStep>("credentials");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [setupToken, setSetupToken] = useState("");
  const [qrBase64, setQrBase64] = useState("");

  // errors
  const [emailError, setEmailError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [mfaError, setMfaError] = useState("");
  const [authError, setAuthError] = useState("");

  // ui
  const [showUsername, setShowUsername] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(languages[0]);

  const usernameInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const mfaInputRef = useRef<HTMLInputElement>(null);
  const languageMenuRef = useRef<HTMLDivElement>(null);

  const copy = translations[selectedLanguage.value];
  const isChinese = selectedLanguage.isChinese;

  // verify invite on mount
  useEffect(() => {
    if (!inviteCode) {
      return;
    }

    fetch("/api/auth/invite/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invite_code: inviteCode }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.valid) {
          setBookName(data.book_name ?? "");
          setPageState("form");
        } else {
          setPageState("invalid");
        }
      })
      .catch(() => setPageState("invalid"));
  }, [inviteCode]);

  // countdown redirect when invalid
  useEffect(() => {
    if (pageState !== "invalid") return;
    if (countdown <= 0) { router.replace("/login"); return; }
    const id = window.setTimeout(() => setCountdown((n) => n - 1), 1000);
    return () => window.clearTimeout(id);
  }, [countdown, pageState, router]);

  // language init
  useEffect(() => {
    const stored = getStoredLanguage();
    if (stored) {
      startTransition(() => setSelectedLanguage(stored));
      document.documentElement.setAttribute("lang", stored.value);
    }
  }, []);

  // language menu close
  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!languageMenuRef.current?.contains(event.target as Node)) {
        setIsLanguageOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsLanguageOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function handleLanguageChange(language: Language) {
    setSelectedLanguage(language);
    setIsLanguageOpen(false);
    window.localStorage.setItem(STORAGE_KEY, language.value);
    document.documentElement.setAttribute("lang", language.value);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthError("");

    // ── credentials step ──
    if (formStep === "credentials") {
      const trimmedEmail = email.trim();
      const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);

      if (!showUsername) {
        if (!trimmedEmail) { setEmailError(copy.emailRequired); return; }
        if (!isEmailValid) { setEmailError(copy.emailInvalid); return; }
        setEmailError("");
        setShowUsername(true);
        window.requestAnimationFrame(() => usernameInputRef.current?.focus());
        return;
      }

      if (!showPassword) {
        if (!username.trim()) {
          setUsernameError(copy.usernameRequired);
          window.requestAnimationFrame(() => usernameInputRef.current?.focus());
          return;
        }
        setUsernameError("");
        setShowPassword(true);
        window.requestAnimationFrame(() => passwordInputRef.current?.focus());
        return;
      }

      if (!password.trim()) {
        setPasswordError(copy.passwordRequired);
        window.requestAnimationFrame(() => passwordInputRef.current?.focus());
        return;
      }
      setPasswordError("");
      setIsSubmitting(true);

      try {
        const res = await fetch("/api/auth/register/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            invite_code: inviteCode,
            username: username.trim(),
            email: email.trim(),
            password,
          }),
        });
        const data = await res.json();

        if (!res.ok) {
          const code: string = data?.error ?? "";
          if (code === "email_already_exists") { setEmailError("This email is already registered."); return; }
          if (code === "user_already_exists") { setUsernameError("This username is already taken."); return; }
          if (code === "invalid_invite_code") { setPageState("invalid"); return; }
          setAuthError("Something went wrong. Please try again.");
          return;
        }

        setSetupToken(data.setup_token);
        setQrBase64(data.mfa.qr_code_png_base64);
        setFormStep("qr");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // ── mfa step ──
    if (formStep === "mfa") {
      if (mfaCode.length < 6) {
        setMfaError(copy.mfaRequired);
        window.requestAnimationFrame(() => mfaInputRef.current?.focus());
        return;
      }
      setIsSubmitting(true);

      try {
        const verifyRes = await fetch("/api/auth/register/verify-mfa", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ setup_token: setupToken, otp_code: mfaCode }),
        });

        if (!verifyRes.ok) {
          const d = await verifyRes.json();
          if (d?.error === "invalid_mfa_code") {
            setMfaError(copy.mfaRequired);
          } else {
            setAuthError("Verification failed. Please try again.");
          }
          return;
        }

        // auto-login
        const loginRes = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), password, otp_code: mfaCode }),
        });

        if (!loginRes.ok) {
          setAuthError("Registration complete but login failed. Please log in manually.");
          router.push("/login");
          return;
        }

        sessionStorage.removeItem("invite_code");
        const loginData = await loginRes.json().catch(() => ({}));
        router.push(loginData.need_setup ? "/welcome" : "/purchase-invoice");
      } finally {
        setIsSubmitting(false);
      }
    }
  }

  function handleGoogleSignUp() {
    sessionStorage.setItem("pending_invite_code", inviteCode);
    const params = new URLSearchParams({
      client_id: "dev-app",
      response_type: "code",
      scope: "openid profile email",
      redirect_uri: `${window.location.origin}/auth/callback`,
      kc_idp_hint: "google",
    });
    window.location.href = `${AUTH_BASE_URL}/realms/dev/protocol/openid-connect/auth?${params}`;
  }

  // ── loading ──
  if (pageState === "verifying") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <span className="size-8 animate-spin rounded-full border-2 border-[#e6e6e6] border-t-[#0075de]" />
      </main>
    );
  }

  // ── invalid invite ──
  if (pageState === "invalid") {
    return (
      <main className={`flex min-h-screen items-center justify-center bg-white px-6 py-10 text-[#000000] ${isChinese ? "font-zh" : ""}`}>
        <section className="w-full max-w-[380px] text-center">
          <p className="text-[17px] font-semibold text-[#31302e]">{copy.invalidInvite}</p>
          <p className="mt-2 text-[14px] text-[#8f8983]">{copy.invalidInviteHelper}</p>
          <p className="mt-4 text-[13px] text-[#a39e98]">
            Redirecting to login in{" "}
            <span className="tabular-nums text-[#615d59]">{countdown}</span>s…
          </p>
        </section>
      </main>
    );
  }

  // ── registration form ──
  return (
    <main className={`flex min-h-screen items-center justify-center bg-[#ffffff] px-6 py-10 text-[#000000] ${isChinese ? "font-zh" : ""}`}>
      <section className="w-full max-w-[380px]">
        <div className="mb-9 text-center">
          <h1 className="text-[24px] font-semibold leading-[1.23]">{copy.title}</h1>
          <p className="mt-1 text-[22px] font-semibold leading-[1.23] text-[#8f8983]">{copy.subtitle}</p>
          {bookName ? (
            <p className="mt-3 text-[13px] text-[#615d59]">
              {copy.inviteContext}{" "}
              <span className="font-medium text-[#31302e]">{bookName}</span>
            </p>
          ) : null}
        </div>

        {formStep === "credentials" ? (
          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <label className="block">
              <span className="mb-2 block text-[15px] font-medium leading-5 text-[#31302e]">{copy.email}</span>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                autoComplete="email"
                inputMode="email"
                placeholder={copy.emailPlaceholder}
                aria-invalid={emailError ? "true" : "false"}
                className={`h-11 w-full rounded-[8px] border bg-white px-4 text-[15px] text-[#000000] shadow-[0_1px_2px_rgba(0,0,0,0.04)] outline-none transition placeholder:text-[#a39e98] focus:border-[#0075de] focus:ring-4 focus:ring-[#62aef0]/20 ${emailError ? "border-[#d92d20]" : "border-[#e6e6e6]"}`}
              />
            </label>
            {emailError ? (
              <p className="mt-2 text-[13px] leading-5 text-[#d92d20]">{emailError}</p>
            ) : (
              <p className="mt-2 whitespace-nowrap text-[clamp(11px,3vw,13px)] leading-5 text-[#615d59]">{copy.helper}</p>
            )}

            {/* Username */}
            {showUsername ? (
              <motion.label
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 block"
                initial={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                <span className="mb-2 block text-[15px] font-medium leading-5 text-[#31302e]">{copy.username}</span>
                <input
                  ref={usernameInputRef}
                  type="text"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setUsernameError(""); }}
                  autoComplete="username"
                  placeholder={copy.usernamePlaceholder}
                  aria-invalid={usernameError ? "true" : "false"}
                  className={`h-11 w-full rounded-[8px] border bg-white px-4 text-[15px] text-[#000000] shadow-[0_1px_2px_rgba(0,0,0,0.04)] outline-none transition placeholder:text-[#a39e98] focus:border-[#0075de] focus:ring-4 focus:ring-[#62aef0]/20 ${usernameError ? "border-[#d92d20]" : "border-[#e6e6e6]"}`}
                />
                {usernameError ? (
                  <p className="mt-2 text-[13px] leading-5 text-[#d92d20]">{usernameError}</p>
                ) : null}
              </motion.label>
            ) : null}

            {/* Password */}
            {showPassword ? (
              <motion.label
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 block"
                initial={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                <span className="mb-2 block text-[15px] font-medium leading-5 text-[#31302e]">{copy.password}</span>
                <input
                  ref={passwordInputRef}
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setPasswordError(""); }}
                  autoComplete="new-password"
                  placeholder={copy.passwordPlaceholder}
                  aria-invalid={passwordError ? "true" : "false"}
                  className={`h-11 w-full rounded-[8px] border bg-white px-4 text-[15px] text-[#000000] shadow-[0_1px_2px_rgba(0,0,0,0.04)] outline-none transition placeholder:text-[#a39e98] focus:border-[#0075de] focus:ring-4 focus:ring-[#62aef0]/20 ${passwordError ? "border-[#d92d20]" : "border-[#e6e6e6]"}`}
                />
                {passwordError ? (
                  <p className="mt-2 text-[13px] leading-5 text-[#d92d20]">{passwordError}</p>
                ) : null}
              </motion.label>
            ) : null}

            {authError ? (
              <p className="mt-3 text-center text-[13px] leading-5 text-[#d92d20]">{authError}</p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="relative mt-6 flex h-11 w-full items-center justify-center rounded-[8px] bg-[#0075de] px-5 text-base font-semibold text-white shadow-[0_1px_2px_rgba(0,91,171,0.28)] transition hover:bg-[#0b83ea] focus:outline-none focus:ring-4 focus:ring-[#62aef0]/25 disabled:cursor-not-allowed disabled:bg-[#62aef0]"
            >
              {isSubmitting ? copy.continuing : copy.continue}
              {isSubmitting ? (
                <span aria-hidden="true" className="absolute right-4 size-4 animate-spin rounded-full border-2 border-white/45 border-t-white" />
              ) : null}
            </button>
          </form>
        ) : formStep === "qr" ? (
          <motion.div animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: -4 }} transition={{ duration: 0.18, ease: "easeOut" }}>
            <p className="mb-3 text-[15px] font-medium leading-5 text-[#31302e]">{copy.scanTitle}</p>
            <div className="rounded-[8px] border border-[#e6e6e6] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`data:image/png;base64,${qrBase64}`}
                alt="MFA QR code"
                className="mx-auto size-[132px]"
              />
              <p className="mt-3 text-center text-[13px] leading-5 text-[#615d59]">{copy.scanHelper}</p>
              <button
                type="button"
                onClick={() => {
                  setFormStep("mfa");
                  window.requestAnimationFrame(() => mfaInputRef.current?.focus());
                }}
                className="mt-4 flex h-10 w-full items-center justify-center rounded-[8px] border border-[#e6e6e6] bg-white px-4 text-[14px] font-medium text-[#31302e] transition hover:bg-[#f6f5f4] focus:outline-none focus:ring-4 focus:ring-[#62aef0]/20"
              >
                {copy.scanContinue}
              </button>
            </div>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <motion.label
              animate={{ opacity: 1, y: 0 }}
              className="block"
              initial={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <span className="mb-2 block text-[15px] font-medium leading-5 text-[#31302e]">{copy.mfa}</span>
              <div className="relative">
                <input
                  ref={mfaInputRef}
                  type="text"
                  value={mfaCode}
                  onChange={(e) => {
                    const next = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setMfaCode(next);
                    setMfaError("");
                  }}
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  maxLength={6}
                  pattern="[0-9]*"
                  placeholder={copy.mfaPlaceholder}
                  aria-invalid={mfaError ? "true" : "false"}
                  className={`h-11 w-full rounded-[8px] border bg-white px-4 pr-11 text-[15px] text-[#000000] shadow-[0_1px_2px_rgba(0,0,0,0.04)] outline-none transition placeholder:text-[#a39e98] focus:border-[#0075de] focus:ring-4 focus:ring-[#62aef0]/20 ${mfaError ? "border-[#d92d20]" : "border-[#e6e6e6]"}`}
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
                <p className="mt-2 text-[13px] leading-5 text-[#d92d20]">{mfaError}</p>
              ) : null}
            </motion.label>

            {authError ? (
              <p className="mt-3 text-center text-[13px] leading-5 text-[#d92d20]">{authError}</p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="relative mt-6 flex h-11 w-full items-center justify-center rounded-[8px] bg-[#0075de] px-5 text-base font-semibold text-white shadow-[0_1px_2px_rgba(0,91,171,0.28)] transition hover:bg-[#0b83ea] focus:outline-none focus:ring-4 focus:ring-[#62aef0]/25 disabled:cursor-not-allowed disabled:bg-[#62aef0]"
            >
              {isSubmitting ? copy.continuing : copy.continue}
              {isSubmitting ? (
                <span aria-hidden="true" className="absolute right-4 size-4 animate-spin rounded-full border-2 border-white/45 border-t-white" />
              ) : null}
            </button>
          </form>
        )}

        {formStep === "credentials" ? (
          <>
            <div className="mb-5 mt-6 flex items-center gap-3 text-sm text-[#a39e98]">
              <span className="h-px flex-1 bg-[#e6e6e6]" />
              <span>{copy.divider}</span>
              <span className="h-px flex-1 bg-[#e6e6e6]" />
            </div>

            <button
              type="button"
              onClick={handleGoogleSignUp}
              className="flex h-11 w-full items-center justify-center gap-3 rounded-[8px] border border-[#e6e6e6] bg-white px-5 text-[15px] font-medium text-[#000000] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition hover:border-[#e6e6e6] hover:bg-[#f6f5f4] focus:outline-none focus:ring-4 focus:ring-[#62aef0]/20"
            >
              <Image src="/google.svg" alt="" width={20} height={20} />
              <span>{copy.google}</span>
            </button>
          </>
        ) : null}

        <p className="mt-5 text-center text-[12px] leading-5 text-[#a39e98]">
          {copy.termsPrefix}{" "}
          <a href="#" className="font-normal text-[#a39e98] underline decoration-[#a39e98] decoration-[1px] underline-offset-[2px] transition hover:text-[#0075de] hover:decoration-[#0075de]">
            {copy.terms}
          </a>{" "}
          {copy.termsJoin}{" "}
          <a href="#" className="font-normal text-[#a39e98] underline decoration-[#a39e98] decoration-[1px] underline-offset-[2px] transition hover:text-[#0075de] hover:decoration-[#0075de]">
            {copy.privacy}
          </a>
        </p>
      </section>

      {/* Language switcher */}
      <div ref={languageMenuRef} className="fixed bottom-3 left-1/2 h-11 -translate-x-1/2 text-[14px] text-[#615d59]">
        <div className="relative flex h-11 items-center">
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={isLanguageOpen}
            onClick={() => setIsLanguageOpen((v) => !v)}
            className={`flex h-8 items-center gap-1.5 rounded-[5px] px-1.5 text-[14px] font-normal text-[#615d59] outline-none transition hover:bg-[#f6f5f4] focus:bg-[#f6f5f4] ${isLanguageOpen ? "bg-[#f6f5f4]" : "bg-transparent"}`}
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
            <div className="absolute bottom-full left-1/2 w-[220px] -translate-x-1/2 rounded-[8px] border border-[#e6e6e6] bg-white p-1 shadow-[0_8px_24px_rgba(0,0,0,0.08)]" role="listbox">
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
                      <span className={`text-[14px] font-normal leading-5 text-[#31302e] ${language.isChinese ? "font-zh tracking-[0.01em]" : ""}`}>
                        {language.label}
                      </span>
                      <span className="text-[12px] leading-4 text-[#8f8983]">{language.description}</span>
                    </span>
                    {isSelected ? <Check size={14} className="shrink-0 text-[#0075de]" /> : null}
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
