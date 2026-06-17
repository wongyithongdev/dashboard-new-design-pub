"use client";

let refreshPromise: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = fetch("/api/auth/refresh", { method: "POST" })
    .then((r) => r.ok)
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

export async function apiFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const response = await fetch(input, init);

  if (response.status !== 401) return response;

  const refreshed = await refreshSession();

  if (!refreshed) {
    window.location.href = "/login";
    return response;
  }

  return fetch(input, init);
}
