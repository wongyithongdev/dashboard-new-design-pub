import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const SERVICE_BASE_URL = "https://service.my365biz.com";

async function getToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("access_token")?.value ?? null;
}

export async function GET() {
  const token = await getToken();
  if (!token) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const res = await fetch(`${SERVICE_BASE_URL}/biz/settings/user`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) return NextResponse.json({ error: "failed" }, { status: res.status });
  return NextResponse.json(await res.json());
}

export async function PATCH(request: NextRequest) {
  const token = await getToken();
  if (!token) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const body = await request.json();
  const res = await fetch(`${SERVICE_BASE_URL}/biz/settings/user`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ language: body.language }),
  });

  if (!res.ok) return NextResponse.json({ error: "failed" }, { status: res.status });
  return NextResponse.json(await res.json());
}
