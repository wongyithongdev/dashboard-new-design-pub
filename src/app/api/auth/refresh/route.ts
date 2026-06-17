import { cookies } from "next/headers";

const AUTH_BASE_URL = process.env.AUTH_BASE_URL!;
const IS_PROD = process.env.NODE_ENV === "production";

const COOKIE_OPTS = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: "lax" as const,
  path: "/",
};

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (!refreshToken) {
    return Response.json({ error: "no_refresh_token" }, { status: 401 });
  }

  const res = await fetch(`${AUTH_BASE_URL}/api/v1/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!res.ok) {
    cookieStore.set("access_token", "", { ...COOKIE_OPTS, maxAge: 0 });
    cookieStore.set("refresh_token", "", { ...COOKIE_OPTS, maxAge: 0 });
    return Response.json({ error: "session_expired" }, { status: 401 });
  }

  const data = await res.json();

  cookieStore.set("access_token", data.access_token, {
    ...COOKIE_OPTS,
    maxAge: data.expires_in ?? 300,
  });
  cookieStore.set("refresh_token", data.refresh_token, {
    ...COOKIE_OPTS,
    maxAge: data.refresh_expires_in ?? 1800,
  });

  return Response.json({ ok: true });
}
