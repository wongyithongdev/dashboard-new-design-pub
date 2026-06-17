import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const res = await fetch(`${process.env.AUTH_BASE_URL}/api/v1/users/me/context`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.json({ error: "failed" }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "private, max-age=300, stale-while-revalidate=60",
    },
  });
}
