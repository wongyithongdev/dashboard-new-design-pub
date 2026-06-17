import { cookies } from "next/headers";

const AUTH_BASE_URL = process.env.AUTH_BASE_URL!;
const KEYCLOAK_CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID!;
const IS_PROD = process.env.NODE_ENV === "production";

const COOKIE_OPTS = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: "lax" as const,
  path: "/",
};

export async function POST(request: Request) {
  let body: { code?: string; redirect_uri?: string };

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!body.code || !body.redirect_uri) {
    return Response.json({ error: "missing_params" }, { status: 400 });
  }

  const tokenParams = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: KEYCLOAK_CLIENT_ID,
    code: body.code,
    redirect_uri: body.redirect_uri,
  });

  const tokenRes = await fetch(
    `${AUTH_BASE_URL}/realms/dev/protocol/openid-connect/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: tokenParams.toString(),
    },
  );

  if (!tokenRes.ok) {
    return Response.json({ error: "code_exchange_failed" }, { status: 400 });
  }

  const tokenData = await tokenRes.json();
  const { access_token, refresh_token, expires_in, refresh_expires_in } =
    tokenData;

  const meRes = await fetch(`${AUTH_BASE_URL}/api/v1/users/me/context`, {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  if (!meRes.ok) {
    return Response.json({ error: "user_fetch_failed" }, { status: 502 });
  }

  const user = await meRes.json();

  const cookieStore = await cookies();
  cookieStore.set("access_token", access_token, {
    ...COOKIE_OPTS,
    maxAge: expires_in ?? 300,
  });
  cookieStore.set("refresh_token", refresh_token, {
    ...COOKIE_OPTS,
    maxAge: refresh_expires_in ?? 1800,
  });

  const needsInvite = !user.books || user.books.length === 0;
  return Response.json({ ok: true, needsInvite, need_setup: user.need_setup ?? false });
}
