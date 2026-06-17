import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

type TeamRole = "owner" | "admin" | "employee" | "support";

type InviteBody = {
  role?: TeamRole;
};

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  let body: InviteBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!body.role) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const res = await fetch(`${process.env.AUTH_BASE_URL}/api/v1/users/me/current-book/invites`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ role: body.role }),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const code = data?.error?.code ?? "failed";
    return NextResponse.json({ error: code }, { status: res.status });
  }

  return NextResponse.json(data);
}
