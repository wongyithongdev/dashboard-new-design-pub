"use client";

import { DashboardSidebar } from "@/components/sidebar";
import { apiFetch } from "@/lib/api";
import { Camera, Check, LoaderCircle, Menu, Pencil } from "lucide-react";
import { useEffect, useState } from "react";

type ProfileResponse = {
  user_id: string;
  username: string;
  first_name: string;
  last_name: string;
  job_title: string;
  color: string;
  display_name: string;
  email: string;
};

type BookItem = {
  id: string;
  book_id: string;
  book_name: string;
  status: string;
  role: string;
  bound_at: string;
};

type UserContextResponse = {
  email: string;
  books: BookItem[];
  current_book: { book_id: string; book_name: string; role: string } | null;
};

type ProfileForm = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  jobTitle: string;
};

const EMPTY_FORM: ProfileForm = {
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  jobTitle: "",
};

function Avatar({ initials, size = 80 }: { initials: string; size?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#d86ff3_0%,#b968f4_100%)] font-semibold text-white shadow-[0_0_0_3px_rgba(185,104,244,0.15)]"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
    >
      {initials}
    </div>
  );
}

function Field({
  label,
  value,
  placeholder,
  type = "text",
  readOnly = false,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  type?: string;
  readOnly?: boolean;
  onChange?: (value: string) => void;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="group flex flex-col gap-1.5">
      <label className="text-[12px] font-medium text-[#8f8983]">{label}</label>
      <div
        className={`flex items-center rounded-[9px] border bg-white px-3 transition-all duration-150 ${
          readOnly
            ? "border-[#ebe7e3] bg-[#f7f5f3]"
            : focused
              ? "border-[#0075de] shadow-[0_0_0_3px_rgba(0,117,222,0.12)]"
              : "border-[#e6e3df] shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:border-[#d0ccc7]"
        }`}
      >
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          readOnly={readOnly}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => onChange?.(e.target.value)}
          className="h-9 w-full bg-transparent text-[13.5px] text-[#2c2c2b] placeholder:text-[#c5c0bb] outline-none read-only:cursor-default"
        />
        <Pencil
          size={13}
          strokeWidth={1.8}
          className={`ml-2 shrink-0 text-[#c5c0bb] transition-opacity duration-75 ${
            readOnly ? "opacity-35" : "opacity-0 group-hover:opacity-100"
          }`}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

function getInitials(form: ProfileForm) {
  const combined = `${form.firstName} ${form.lastName}`.trim() || form.username || form.email;
  const words = combined
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (words.length === 0) {
    return "U";
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase();
}

function toProfileForm(profile: ProfileResponse): ProfileForm {
  return {
    firstName: profile.first_name ?? "",
    lastName: profile.last_name ?? "",
    username: profile.username ?? "",
    email: profile.email ?? "",
    jobTitle: profile.job_title ?? "",
  };
}

export default function ProfilePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [form, setForm] = useState<ProfileForm>(EMPTY_FORM);
  const [savedForm, setSavedForm] = useState<ProfileForm>(EMPTY_FORM);
  const [workspaces, setWorkspaces] = useState<BookItem[]>([]);
  const [activeBookId, setActiveBookId] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSwitchingBookId, setIsSwitchingBookId] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadProfilePage() {
      setLoading(true);
      setLoadError("");

      try {
        const [profileRes, contextRes] = await Promise.all([
          apiFetch("/api/auth/profile", { cache: "no-store" }),
          apiFetch("/api/auth/me", { cache: "no-store" }),
        ]);

        if (!profileRes.ok || !contextRes.ok) {
          throw new Error("load_failed");
        }

        const profile = (await profileRes.json()) as ProfileResponse;
        const context = (await contextRes.json()) as UserContextResponse;
        const nextForm = toProfileForm(profile);

        if (ignore) return;

        setForm(nextForm);
        setSavedForm(nextForm);
        setWorkspaces(context.books ?? []);
        setActiveBookId(context.current_book?.book_id ?? "");
      } catch {
        if (ignore) return;
        setLoadError("Unable to load profile.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadProfilePage();

    return () => {
      ignore = true;
    };
  }, []);

  const displayName = `${form.firstName} ${form.lastName}`.trim() || form.username || "User";
  const initials = getInitials(form);
  const isDirty =
    form.firstName !== savedForm.firstName ||
    form.lastName !== savedForm.lastName ||
    form.email !== savedForm.email ||
    form.jobTitle !== savedForm.jobTitle;

  function updateField<K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setSaveSuccess("");
    setSaveError("");
  }

  async function handleSave() {
    setIsSaving(true);
    setSaveError("");
    setSaveSuccess("");

    try {
      const res = await apiFetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: form.firstName,
          last_name: form.lastName,
          email: form.email,
          job_title: form.jobTitle,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setSaveError(
          data?.error === "invalid_email"
            ? "Please enter a valid email."
            : data?.error === "invalid_job_title"
              ? "Job title is invalid."
              : "Unable to save profile.",
        );
        return;
      }

      const nextForm = toProfileForm(data as ProfileResponse);
      setForm(nextForm);
      setSavedForm(nextForm);
      setSaveSuccess("Profile updated.");
    } catch {
      setSaveError("Unable to save profile.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleWorkspaceChange(bookId: string) {
    if (bookId === activeBookId || isSwitchingBookId) return;

    setIsSwitchingBookId(bookId);

    try {
      const res = await apiFetch("/api/auth/me/current-book", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book_id: bookId }),
      });

      if (!res.ok) {
        throw new Error("switch_failed");
      }

      setActiveBookId(bookId);
    } catch {
      setSaveError("Unable to switch workspace.");
    } finally {
      setIsSwitchingBookId("");
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
              Profile
            </h1>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[580px] px-6 py-10">
            {loading ? (
              <div className="flex min-h-[280px] items-center justify-center text-[14px] text-[#8f8983]">
                <LoaderCircle size={18} className="mr-2 animate-spin" aria-hidden="true" />
                Loading profile...
              </div>
            ) : loadError ? (
              <div className="rounded-[12px] border border-[#f1d4d2] bg-[#fff6f5] px-4 py-3 text-[13px] text-[#b23b2a]">
                {loadError}
              </div>
            ) : (
              <>
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <Avatar initials={initials} size={72} />
                    <button
                      type="button"
                      aria-label="Change profile picture"
                      className="absolute -bottom-0.5 -right-0.5 flex size-6 items-center justify-center rounded-full border-2 border-white bg-[#2c2c2b] text-white shadow-sm transition-colors duration-75 hover:bg-[#404040]"
                    >
                      <Camera size={11} strokeWidth={2} aria-hidden="true" />
                    </button>
                  </div>
                  <div>
                    <p className="text-[16px] font-semibold leading-6 text-[#2c2c2b]">{displayName}</p>
                    <p className="mt-0.5 text-[13px] text-[#8f8983]">{form.email}</p>
                  </div>
                </div>

                <div className="my-7 h-px bg-[#f0ede8]" />

                <div className="flex flex-col gap-4">
                  <Field
                    label="First name"
                    value={form.firstName}
                    placeholder="Enter your first name"
                    onChange={(value) => updateField("firstName", value)}
                  />
                  <Field
                    label="Last name"
                    value={form.lastName}
                    placeholder="Enter your last name"
                    onChange={(value) => updateField("lastName", value)}
                  />
                  <Field
                    label="Username"
                    value={form.username}
                    placeholder="Username"
                    readOnly
                  />
                  <Field
                    label="Email"
                    value={form.email}
                    type="email"
                    placeholder="Enter your email"
                    onChange={(value) => updateField("email", value)}
                  />
                  <Field
                    label="Title / Job role"
                    value={form.jobTitle}
                    placeholder="e.g. Software Engineer"
                    onChange={(value) => updateField("jobTitle", value)}
                  />
                </div>

                <div className="mt-3 min-h-5 text-[12.5px]">
                  {saveError ? <p className="text-[#b23b2a]">{saveError}</p> : null}
                  {saveSuccess ? <p className="text-[#24704a]">{saveSuccess}</p> : null}
                </div>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving || !isDirty}
                  className="mt-3 flex h-9 items-center gap-1.5 rounded-[8px] bg-[#0075de] px-4 text-[14px] font-medium text-white shadow-[0_1px_2px_rgba(0,117,222,0.2)] transition-colors duration-75 hover:bg-[#0b83ea] active:bg-[#005bab] disabled:cursor-not-allowed disabled:bg-[#b9d9f7] disabled:shadow-none"
                >
                  {isSaving ? (
                    <LoaderCircle size={13} strokeWidth={2.2} className="animate-spin" aria-hidden="true" />
                  ) : (
                    <Check size={13} strokeWidth={2.2} aria-hidden="true" />
                  )}
                  {isSaving ? "Saving..." : "Save changes"}
                </button>

                <div className="my-7 h-px bg-[#f0ede8]" />

                <div>
                  <p className="mb-1 text-[12px] font-medium text-[#8f8983]">Workspaces</p>
                  <p className="mb-4 text-[12.5px] text-[#b5b0aa]">Switch between your available workspaces.</p>

                  <div className="flex flex-col">
                    {workspaces.map((workspace) => {
                      const isActive = workspace.book_id === activeBookId;
                      const isSwitching = isSwitchingBookId === workspace.book_id;
                      const initialsLabel = workspace.book_name
                        .split(/\s+/)
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((part) => part[0])
                        .join("")
                        .toUpperCase();

                      return (
                        <button
                          key={workspace.book_id}
                          type="button"
                          onClick={() => handleWorkspaceChange(workspace.book_id)}
                          disabled={Boolean(isSwitchingBookId)}
                          className={`group flex h-9 w-full items-center gap-2.5 rounded-[8px] px-2 text-left transition-colors duration-75 ${
                            isActive ? "bg-[#ededee]" : "hover:bg-[#f6f5f4]"
                          }`}
                        >
                          <span className="flex size-5 shrink-0 items-center justify-center rounded-[6px] bg-[#0075de] text-[9px] font-bold text-white">
                            {initialsLabel || "BK"}
                          </span>

                          <span className={`flex-1 truncate text-[14px] font-medium leading-5 ${isActive ? "text-[#2c2c2b]" : "text-[#5f5e59]"}`}>
                            {workspace.book_name}
                          </span>

                          <span className="shrink-0 rounded-[5px] bg-[#f1f0ee] px-1.5 py-0.5 text-[11px] font-medium capitalize text-[#8f8983]">
                            {workspace.role}
                          </span>

                          <span className="flex w-5 shrink-0 items-center justify-center">
                            {isSwitching ? (
                              <LoaderCircle size={14} strokeWidth={2.2} className="animate-spin text-[#0075de]" aria-hidden="true" />
                            ) : isActive ? (
                              <Check size={14} strokeWidth={2.2} className="text-[#0075de]" aria-hidden="true" />
                            ) : null}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
