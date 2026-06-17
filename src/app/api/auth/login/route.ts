import { cookies } from "next/headers";

const AUTH_BASE_URL = process.env.AUTH_BASE_URL!;
const IS_PROD = process.env.NODE_ENV === "production";

const COOKIE_OPTS = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: "lax" as const,
  path: "/",
};

export async function POST(request: Request) {
  let body: { email?: string; password?: string; otp_code?: string };

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const res = await fetch(`${AUTH_BASE_URL}/api/v1/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: body.email,
      password: body.password,
      otp_code: body.otp_code ?? "",
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    const code: string = data?.error?.code ?? "unknown_error";
    const status =
      code === "invalid_credentials" ||
      code === "invalid_mfa_code" ||
      code === "mfa_required"
        ? 401
        : res.status >= 500
          ? 502
          : 400;
    return Response.json({ error: code }, { status });
  }

  const cookieStore = await cookies();
  cookieStore.set("access_token", data.access_token, {
    ...COOKIE_OPTS,
    maxAge: data.expires_in ?? 300,
  });
  cookieStore.set("refresh_token", data.refresh_token, {
    ...COOKIE_OPTS,
    maxAge: data.refresh_expires_in ?? 1800,
  });

  return Response.json({ ok: true, need_setup: data.need_setup ?? false });
}
