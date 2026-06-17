const AUTH_BASE_URL = process.env.AUTH_BASE_URL!;

export async function POST(request: Request) {
  let body: { setup_token?: string; otp_code?: string };

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const res = await fetch(`${AUTH_BASE_URL}/api/v1/register/verify-mfa`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      setup_token: body.setup_token,
      otp_code: body.otp_code,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    const code: string = data?.error?.code ?? "unknown_error";
    const status = code === "invalid_mfa_code" ? 401 : res.status >= 500 ? 502 : res.status;
    return Response.json({ error: code }, { status });
  }

  return Response.json({ ok: true });
}
