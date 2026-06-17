import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const res = await fetch(`${process.env.AUTH_BASE_URL}/api/v1/users/me/current-book/team`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const code = data?.error?.code ?? "failed";
    return NextResponse.json({ error: code }, { status: res.status });
  }

  return NextResponse.json(data);
}
