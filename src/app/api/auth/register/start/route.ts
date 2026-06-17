const AUTH_BASE_URL = process.env.AUTH_BASE_URL!;

export async function POST(request: Request) {
  let body: {
    invite_code?: string;
    username?: string;
    email?: string;
    password?: string;
  };

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const res = await fetch(`${AUTH_BASE_URL}/api/v1/register/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      invite_code: body.invite_code,
      username: body.username,
      email: body.email,
      password: body.password,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    const code: string = data?.error?.code ?? "unknown_error";
    const status = res.status >= 500 ? 502 : res.status;
    return Response.json({ error: code }, { status });
  }

  return Response.json(data);
}
