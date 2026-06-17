"use client";

import { DashboardSidebar } from "@/components/sidebar";
import { apiFetch } from "@/lib/api";
import {
  AlertCircle,
  Check,
  ChevronDown,
  Copy,
  Ellipsis,
  LoaderCircle,
  Menu,
  RefreshCw,
  UserPlus,
  X,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

type Role = "owner" | "admin" | "employee" | "support";

type TeamMember = {
  user_id: string;
  username: string;
  email: string;
  display_name: string;
  role: Role;
};

type TeamUpdateResponse = {
  user_id: string;
  book_id: string;
  role: Role;
};

type TeamRemoveResponse = {
  deleted: true;
  user_id: string;
  book_id: string;
};

type InviteResponse = {
  id: string;
  invite_code: string;
  code_prefix: string;
  book_id: string;
  role: Role;
  status: string;
  expires_at: string;
  created_by: string;
  created_at: string;
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

const ROLE_META: Record<
  Role,
  { label: string; badgeBg: string; badgeText: string; helper: string }
> = {
  owner: {
    label: "Owner",
    badgeBg: "#f3f0ff",
    badgeText: "#7c3aed",
    helper: "Full access",
  },
  admin: {
    label: "Admin",
    badgeBg: "#eff6ff",
    badgeText: "#1d4ed8",
    helper: "Manage workspace",
  },
  employee: {
    label: "Employee",
    badgeBg: "#f0fdf4",
    badgeText: "#15803d",
    helper: "Standard access",
  },
  support: {
    label: "Support",
    badgeBg: "#fff7ed",
    badgeText: "#c2410c",
    helper: "Limited access",
  },
};

const ROLE_ORDER: Role[] = ["owner", "admin", "employee", "support"];

function getInitials(member: Pick<TeamMember, "display_name" | "username" | "email">) {
  const source = member.display_name.trim() || member.username.trim() || member.email.trim();
  const words = source.split(/\s+/).filter(Boolean);

  if (words.length === 0) return "U";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();

  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function getMemberName(member: TeamMember) {
  return member.display_name.trim() || member.username.trim() || member.email.trim() || member.user_id;
}

function getMemberColor(member: TeamMember) {
  const palette = [
    "#b968f4",
    "#d93025",
    "#0f9d58",
    "#f4511e",
    "#7c3aed",
    "#0075de",
    "#b7791f",
    "#00897b",
  ];
  let hash = 0;
  const seed = member.user_id || member.email || member.username;

  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }

  return palette[hash % palette.length];
}

function getRoleUpdateErrorMessage(error: string) {
  switch (error) {
    case "forbidden":
      return "You do not have permission to update this member.";
    case "invalid_request":
      return "Unable to update this role.";
    default:
      return "Unable to update team member role.";
  }
}

function getInviteErrorMessage(error: string) {
  switch (error) {
    case "forbidden":
      return "You do not have permission to create invites.";
    case "invalid_request":
      return "Unable to generate invite link.";
    default:
      return "Unable to generate invite link.";
  }
}

function getRemoveErrorMessage(error: string) {
  switch (error) {
    case "forbidden":
      return "You do not have permission to remove this member.";
    case "invalid_request":
      return "Unable to remove this member.";
    default:
      return "Unable to remove this member.";
  }
}

function InviteModal({
  canInviteMembers,
  onClose,
  onError,
}: Readonly<{
  canInviteMembers: boolean;
  onClose: () => void;
  onError: (message: string) => void;
}>) {
  const shouldReduceMotion = useReducedMotion();
  const [role, setRole] = useState<Role>("employee");
  const [roleOpen, setRoleOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!canInviteMembers) return;

    let ignore = false;

    async function generateInvite(nextRole: Role) {
      setIsGenerating(true);
      setCopied(false);

      try {
        const res = await apiFetch("/api/auth/team/invites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: nextRole }),
        });

        const data = (await res.json().catch(() => null)) as
          | { error?: string }
          | InviteResponse
          | null;

        if (!res.ok) {
          if (!ignore) {
            setInviteCode("");
            setInviteLink("");
            onError(getInviteErrorMessage(data?.error ?? "failed"));
          }
          return;
        }

        if (ignore) return;

        const code = (data as InviteResponse).invite_code;
        const baseUrl =
          typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

        setInviteLink(`${baseUrl}/invite/${code}`);
      } catch {
        if (!ignore) {
          setInviteLink("");
          onError("Unable to generate invite link.");
        }
      } finally {
        if (!ignore) setIsGenerating(false);
      }
    }

    generateInvite(role);

    return () => {
      ignore = true;
    };
  }, [canInviteMembers, onError, role]);

  function copyLink() {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.18 }}
        onClick={onClose}
      />

      <motion.div
        className="relative z-10 w-full max-w-[400px] rounded-[14px] border border-[#e6e3df] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.14)]"
        initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 4 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center justify-between px-5 pb-4 pt-5">
          <div>
            <h2 className="text-[16px] font-semibold leading-6 tracking-[-0.1px] text-[#2c2c2b]">
              Invite member
            </h2>
            <p className="mt-0.5 text-[12.5px] text-[#a39e98]">Add someone to workspace</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-7 items-center justify-center rounded-[7px] text-[#a39e98] outline-none transition-colors duration-75 hover:bg-[#f6f5f4] hover:text-[#5f5e59]"
          >
            <X size={15} strokeWidth={1.8} />
          </button>
        </div>

        <div className="h-px bg-[#f0ede8]" />

        <div className="flex flex-col gap-4 px-5 py-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-[#8f8983]">Role</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setRoleOpen((open) => !open)}
                disabled={!canInviteMembers}
                className="flex h-9 w-full items-center justify-between rounded-[9px] border border-[#e6e3df] bg-white px-3 text-left shadow-[0_1px_2px_rgba(0,0,0,0.04)] outline-none transition-all duration-150 hover:border-[#d0ccc7] disabled:cursor-not-allowed disabled:bg-[#f7f5f3] disabled:text-[#c5c0bb]"
              >
                <span
                  className="rounded-[4px] px-1.5 py-0.5 text-[11px] font-medium"
                  style={{
                    background: ROLE_META[role].badgeBg,
                    color: ROLE_META[role].badgeText,
                  }}
                >
                  {ROLE_META[role].label}
                </span>
                <ChevronDown
                  size={14}
                  strokeWidth={1.8}
                  className={`shrink-0 text-[#a39e98] transition-transform duration-150 ${
                    roleOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {roleOpen && canInviteMembers ? (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setRoleOpen(false)} />
                    <motion.div
                      className="absolute left-0 top-10 z-20 w-full overflow-hidden rounded-[10px] border border-[#e6e3df] bg-white py-1 shadow-[0_8px_24px_rgba(0,0,0,0.1)]"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {ROLE_ORDER.map((nextRole) => (
                        <button
                          key={nextRole}
                          type="button"
                          onClick={() => {
                            setRole(nextRole);
                            setRoleOpen(false);
                          }}
                          className="flex w-full items-center justify-between px-3 py-2 text-left transition-colors duration-75 hover:bg-[#f6f5f4]"
                        >
                          <span className="flex items-center gap-2">
                            <span
                              className="rounded-[4px] px-1.5 py-0.5 text-[11px] font-medium"
                              style={{
                                background: ROLE_META[nextRole].badgeBg,
                                color: ROLE_META[nextRole].badgeText,
                              }}
                            >
                              {ROLE_META[nextRole].label}
                            </span>
                            <span className="text-[12px] text-[#a39e98]">
                              {ROLE_META[nextRole].helper}
                            </span>
                          </span>
                          {role === nextRole ? (
                            <Check size={13} strokeWidth={2.2} className="shrink-0 text-[#0075de]" />
                          ) : null}
                        </button>
                      ))}
                    </motion.div>
                  </>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 px-5">
          <div className="h-px flex-1 bg-[#f0ede8]" />
          <span className="text-[11px] font-medium text-[#c5c0bb]">or</span>
          <div className="h-px flex-1 bg-[#f0ede8]" />
        </div>

        <div className="flex flex-col gap-1.5 px-5 pb-5 pt-4">
          <div className="flex items-center justify-between">
            <label className="text-[12px] font-medium text-[#8f8983]">Invite link</label>
            <button
              type="button"
              disabled={!canInviteMembers || isGenerating}
              className="flex items-center gap-1 text-[11.5px] font-medium text-[#a39e98] outline-none transition-colors duration-75 hover:text-[#5f5e59]"
            >
              <RefreshCw
                size={11}
                strokeWidth={2}
                className={isGenerating ? "animate-spin" : ""}
              />
              Regenerate
            </button>
          </div>
          <div className="flex items-center gap-2 rounded-[9px] border border-[#e6e3df] bg-[#fafaf9] px-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <span className="flex-1 truncate py-2.5 text-[12px] text-[#a39e98]">
              {isGenerating ? "Generating invite link..." : inviteLink || "Invite link unavailable"}
            </span>
            <button
              type="button"
              onClick={copyLink}
              disabled={!inviteLink}
              className={`flex shrink-0 items-center gap-1 rounded-[6px] px-2 py-1 text-[12px] font-medium transition-all duration-150 ${
                copied
                  ? "bg-[#e9f7ef] text-[#15803d]"
                  : "text-[#5f5e59] hover:bg-[#ededee] hover:text-[#2c2c2b] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-transparent disabled:hover:text-[#5f5e59]"
              }`}
            >
              {copied ? <Check size={12} strokeWidth={2.5} /> : <Copy size={12} strokeWidth={1.8} />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        <div className="h-px bg-[#f0ede8]" />
        <div className="flex items-center justify-end gap-2 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 items-center rounded-[7px] border border-[#e6e3df] bg-white px-3.5 text-[13px] font-medium text-[#5f5e59] shadow-[0_1px_2px_rgba(0,0,0,0.04)] outline-none transition-colors duration-75 hover:bg-[#f6f5f4]"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function MemberRow({
  canManageRoles,
  currentUserRole,
  isRemoving,
  isUpdating,
  member,
  onRemove,
  onRoleChange,
}: Readonly<{
  canManageRoles: boolean;
  currentUserRole: Role | "";
  isRemoving: boolean;
  isUpdating: boolean;
  member: TeamMember;
  onRemove: () => void;
  onRoleChange: (role: Role) => void;
}>) {
  const [menuOpen, setMenuOpen] = useState(false);
  const meta = ROLE_META[member.role];

  function isRoleOptionDisabled(nextRole: Role) {
    if (member.role === nextRole) return true;
    if (currentUserRole === "admin" && member.role === "owner") return true;
    if (currentUserRole === "admin" && nextRole === "owner") return true;
    return isUpdating || isRemoving;
  }

  function isRemoveDisabled() {
    if (!canManageRoles) return true;
    if (currentUserRole === "admin" && member.role === "owner") return true;
    return isUpdating || isRemoving;
  }

  return (
    <div className="group flex items-center gap-3 px-6 py-2 transition-colors duration-75 hover:bg-[#f6f5f4]">
      <span
        className="flex size-8 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold text-white"
        style={{ background: getMemberColor(member) }}
      >
        {getInitials(member)}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-medium leading-5 text-[#2c2c2b]">{getMemberName(member)}</p>
        <p className="truncate text-[12px] leading-4 text-[#a39e98]">{member.email || member.username || member.user_id}</p>
      </div>

      <span
        className="shrink-0 rounded-[5px] px-1.5 py-0.5 text-[11px] font-medium"
        style={{ background: meta.badgeBg, color: meta.badgeText }}
      >
        {meta.label}
      </span>

      <div className="relative">
        <button
          type="button"
          disabled={!canManageRoles}
          onClick={() => {
            if (!canManageRoles) return;
            setMenuOpen((open) => !open);
          }}
          className={`flex size-6 items-center justify-center rounded-[6px] outline-none transition-all duration-75 ${
            canManageRoles
              ? "text-[#c5c0bb] opacity-0 hover:bg-[#ededee] hover:text-[#5f5e59] group-hover:opacity-100"
              : "cursor-not-allowed bg-[#f3f1ef] text-[#cfcac4] opacity-100"
          }`}
        >
          {isUpdating || isRemoving ? (
            <LoaderCircle size={14} strokeWidth={1.8} className="animate-spin" aria-hidden="true" />
          ) : (
            <Ellipsis size={14} strokeWidth={1.8} aria-hidden="true" />
          )}
        </button>

        {menuOpen && canManageRoles ? (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-7 z-20 w-[160px] overflow-hidden rounded-[9px] border border-[#e6e3df] bg-white py-1 shadow-[0_8px_24px_rgba(0,0,0,0.1)]">
              <p className="px-3 pb-1 pt-1.5 text-[11px] font-medium text-[#c5c0bb]">Change role</p>
              {ROLE_ORDER.map((nextRole) => {
                const disabled = isRoleOptionDisabled(nextRole);
                return (
                  <button
                    key={nextRole}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      if (disabled) return;
                      setMenuOpen(false);
                      onRoleChange(nextRole);
                    }}
                    className="flex w-full items-center justify-between px-3 py-1.5 text-left transition-colors duration-75 hover:bg-[#f6f5f4] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-white"
                  >
                    <span
                      className="rounded-[4px] px-1.5 py-px text-[11px] font-medium"
                      style={{
                        background: ROLE_META[nextRole].badgeBg,
                        color: ROLE_META[nextRole].badgeText,
                      }}
                    >
                      {ROLE_META[nextRole].label}
                    </span>
                    {member.role === nextRole ? (
                      <Check size={12} strokeWidth={2.5} className="text-[#0075de]" />
                    ) : null}
                  </button>
                );
              })}
              <div className="mx-2 my-1 h-px bg-[#f0ede8]" />
              <button
                type="button"
                disabled={isRemoveDisabled()}
                onClick={() => {
                  if (isRemoveDisabled()) return;
                  setMenuOpen(false);
                  onRemove();
                }}
                className="flex w-full items-center px-3 py-1.5 text-left text-[13px] text-[#dc2626] transition-colors duration-75 hover:bg-[#fef2f2] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-white"
              >
                Remove member
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default function TeamManagePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<Role | "">("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [updateError, setUpdateError] = useState("");
  const [removeSuccess, setRemoveSuccess] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState("");
  const [removingUserId, setRemovingUserId] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadTeamPage() {
      setLoading(true);
      setLoadError("");

      try {
        const [teamRes, meRes] = await Promise.all([
          apiFetch("/api/auth/team", { cache: "no-store" }),
          apiFetch("/api/auth/me", { cache: "no-store" }),
        ]);

        if (!teamRes.ok || !meRes.ok) {
          throw new Error("load_failed");
        }

        const team = (await teamRes.json()) as TeamMember[];
        const me = (await meRes.json()) as AuthUserContext;

        if (ignore) return;

        setMembers(Array.isArray(team) ? team : []);
        setCurrentUserRole(me.current_book?.role ?? "");
      } catch {
        if (ignore) return;
        setLoadError("Unable to load team.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadTeamPage();

    return () => {
      ignore = true;
    };
  }, []);

  const canManageRoles = currentUserRole === "owner" || currentUserRole === "admin";
  const canInviteMembers = currentUserRole === "owner" || currentUserRole === "admin";
  const grouped = ROLE_ORDER.map((role) => ({
    role,
    members: members.filter((member) => member.role === role),
  })).filter((group) => group.members.length > 0);

  async function handleRoleChange(member: TeamMember, role: Role) {
    setUpdatingUserId(member.user_id);
    setUpdateError("");
    setRemoveSuccess("");
    setInviteError("");

    try {
      const res = await apiFetch(`/api/auth/team/${member.user_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      const data = (await res.json().catch(() => null)) as
        | { error?: string }
        | TeamUpdateResponse
        | null;

      if (!res.ok) {
        setUpdateError(getRoleUpdateErrorMessage(data?.error ?? "failed"));
        return;
      }

      setMembers((currentMembers) =>
        currentMembers.map((currentMember) =>
          currentMember.user_id === member.user_id
            ? { ...currentMember, role: (data as TeamUpdateResponse).role }
            : currentMember,
        ),
      );
    } catch {
      setUpdateError("Unable to update team member role.");
    } finally {
      setUpdatingUserId("");
    }
  }

  async function handleRemove(member: TeamMember) {
    setRemovingUserId(member.user_id);
    setUpdateError("");
    setRemoveSuccess("");
    setInviteError("");

    try {
      const res = await apiFetch(`/api/auth/team/${member.user_id}`, {
        method: "DELETE",
      });

      const data = (await res.json().catch(() => null)) as
        | { error?: string }
        | TeamRemoveResponse
        | null;

      if (!res.ok) {
        setUpdateError(getRemoveErrorMessage(data?.error ?? "failed"));
        return;
      }

      setMembers((currentMembers) =>
        currentMembers.filter((currentMember) => currentMember.user_id !== member.user_id),
      );
      setRemoveSuccess("Member removed.");
    } catch {
      setUpdateError("Unable to remove this member.");
    } finally {
      setRemovingUserId("");
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
              Team
            </h1>
            <span className="rounded-[6px] bg-[#f1f0ee] px-2 py-0.5 text-[12px] font-medium text-[#8f8983]">
              {members.length}
            </span>
          </div>

          <button
            type="button"
            disabled={!canInviteMembers}
            onClick={() => {
              if (!canInviteMembers) return;
              setInviteError("");
              setInviteOpen(true);
            }}
            className="inline-flex h-7 items-center gap-1.5 rounded-[7px] bg-[#2783DE] px-2.5 text-[13px] font-medium text-white shadow-[0_1px_1px_rgba(39,131,222,0.16)] outline-none transition-colors duration-75 hover:bg-[#1f76c9] disabled:cursor-not-allowed disabled:bg-[#d9d6d2] disabled:text-[#8f8983] disabled:shadow-none"
          >
            <UserPlus size={13} strokeWidth={1.9} aria-hidden="true" />
            Invite member
          </button>
        </header>

        <div className="flex min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[580px] py-8">
            {loading ? (
              <div className="flex min-h-[260px] items-center justify-center px-6 text-[14px] text-[#8f8983]">
                <LoaderCircle size={18} className="mr-2 animate-spin" aria-hidden="true" />
                Loading team...
              </div>
            ) : loadError ? (
              <div className="px-6">
                <div className="rounded-[12px] border border-[#f1d4d2] bg-[#fff6f5] px-4 py-3 text-[13px] text-[#b23b2a]">
                  {loadError}
                </div>
              </div>
            ) : members.length === 0 ? (
              <div className="px-6">
                <div className="rounded-[12px] border border-dashed border-[#e6e3df] bg-[#fafaf9] px-4 py-8 text-center">
                  <p className="text-[14px] font-medium text-[#5f5e59]">No team members found.</p>
                  <p className="mt-1 text-[12.5px] text-[#a39e98]">This workspace does not have any visible members yet.</p>
                </div>
              </div>
            ) : (
              <>
                {updateError ? (
                  <div className="mb-5 px-6">
                    <div className="flex items-start gap-2 rounded-[12px] border border-[#f1d4d2] bg-[#fff6f5] px-4 py-3 text-[13px] text-[#b23b2a]">
                      <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                      <span>{updateError}</span>
                    </div>
                  </div>
                ) : null}

                {removeSuccess ? (
                  <div className="mb-5 px-6">
                    <div className="rounded-[12px] border border-[#d6efdf] bg-[#f4fbf7] px-4 py-3 text-[13px] text-[#24704a]">
                      {removeSuccess}
                    </div>
                  </div>
                ) : null}

                {inviteError ? (
                  <div className="mb-5 px-6">
                    <div className="rounded-[12px] border border-[#f1d4d2] bg-[#fff6f5] px-4 py-3 text-[13px] text-[#b23b2a]">
                      {inviteError}
                    </div>
                  </div>
                ) : null}

                <div className="flex flex-col gap-6">
                  {grouped.map(({ role, members: groupMembers }) => {
                    const meta = ROLE_META[role];
                    return (
                      <div key={role}>
                        <div className="mb-1 flex items-center gap-2 bg-[#f6f5f4] px-6 py-1.5">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[#8f8983]">
                            {meta.label}
                          </span>
                          <span className="text-[11px] font-medium text-[#c5c0bb]">
                            {groupMembers.length}
                          </span>
                        </div>
                        <div className="flex flex-col gap-px">
                          {groupMembers.map((member) => (
                            <MemberRow
                              key={member.user_id}
                              canManageRoles={canManageRoles}
                              currentUserRole={currentUserRole}
                              isRemoving={removingUserId === member.user_id}
                              isUpdating={updatingUserId === member.user_id}
                              member={member}
                              onRemove={() => handleRemove(member)}
                              onRoleChange={(nextRole) => handleRoleChange(member, nextRole)}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {inviteOpen ? (
          <InviteModal
            canInviteMembers={canInviteMembers}
            onClose={() => setInviteOpen(false)}
            onError={setInviteError}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
