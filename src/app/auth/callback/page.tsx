"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const code = searchParams.get("code");
    const errorParam = searchParams.get("error");

    if (errorParam || !code) {
      sessionStorage.setItem("google_auth_error", "failed");
      router.replace("/login");
      return;
    }

    const redirectUri = `${window.location.origin}/auth/callback`;

    fetch("/api/auth/callback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, redirect_uri: redirectUri }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (!data.ok) {
          sessionStorage.setItem("google_auth_error", "failed");
          router.replace("/login");
          return;
        }
        if (data.needsInvite) {
          const pendingCode = sessionStorage.getItem("pending_invite_code");
          if (pendingCode) {
            sessionStorage.removeItem("pending_invite_code");
            fetch("/api/auth/google/complete", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ invite_code: pendingCode }),
            })
              .then((r) => r.json())
              .then((d) => {
                if (d.ok) {
                  router.replace(d.need_setup ? "/welcome" : "/purchase-invoice");
                } else {
                  sessionStorage.setItem("google_auth_error", "failed");
                  router.replace("/login");
                }
              })
              .catch(() => {
                sessionStorage.setItem("google_auth_error", "failed");
                router.replace("/login");
              });
          } else {
            sessionStorage.setItem("google_auth_error", "not_registered");
            router.replace("/login");
          }
        } else {
          router.replace(data.need_setup ? "/welcome" : "/purchase-invoice");
        }
      })
      .catch(() => {
        sessionStorage.setItem("google_auth_error", "failed");
        router.replace("/login");
      });
  }, [router, searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-white">
      <span
        aria-label="Signing you in…"
        className="size-8 animate-spin rounded-full border-2 border-[#e6e6e6] border-t-[#0075de]"
      />
    </main>
  );
}
