import { cookies } from "next/headers";

const AUTH_BASE_URL = process.env.AUTH_BASE_URL!;

export async function POST(request: Request) {
  let body: { invite_code?: string };

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return Response.json({ error: "bearer_token_required" }, { status: 401 });
  }

  const res = await fetch(`${AUTH_BASE_URL}/api/v1/register/google/complete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ invite_code: body.invite_code }),
  });

  const data = await res.json();

  if (!res.ok) {
    const code: string = data?.error?.code ?? "unknown_error";
    const status = res.status >= 500 ? 502 : res.status;
    return Response.json({ error: code }, { status });
  }

  const meRes = await fetch(`${AUTH_BASE_URL}/api/v1/users/me/context`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (!meRes.ok) {
    return Response.json({ error: "user_fetch_failed" }, { status: 502 });
  }

  const user = await meRes.json();

  return Response.json({
    ok: true,
    need_setup: user.need_setup ?? false,
  });
}
