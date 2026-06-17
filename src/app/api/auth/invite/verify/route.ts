const AUTH_BASE_URL = process.env.AUTH_BASE_URL!;

export async function POST(request: Request) {
  let body: { invite_code?: string };

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const res = await fetch(`${AUTH_BASE_URL}/api/v1/invites/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ invite_code: body.invite_code }),
  });

  const data = await res.json();
  return Response.json(data, { status: res.ok ? 200 : res.status });
}
