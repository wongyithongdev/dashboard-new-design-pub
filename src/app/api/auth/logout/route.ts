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

  if (refreshToken) {
    fetch(`${AUTH_BASE_URL}/api/v1/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    }).catch(() => {});
  }

  cookieStore.set("access_token", "", { ...COOKIE_OPTS, maxAge: 0 });
  cookieStore.set("refresh_token", "", { ...COOKIE_OPTS, maxAge: 0 });

  return Response.json({ ok: true });
}
