"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function InvitePage() {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const router = useRouter();

  useEffect(() => {
    if (inviteCode) {
      sessionStorage.setItem("invite_code", inviteCode);
    }
    router.replace("/register");
  }, [inviteCode]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-white">
      <span className="size-8 animate-spin rounded-full border-2 border-[#e6e6e6] border-t-[#0075de]" />
    </main>
  );
}
