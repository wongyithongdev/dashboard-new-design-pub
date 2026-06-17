import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const body = await request.json();

  const res = await fetch(`${process.env.AUTH_BASE_URL}/api/v1/users/me/current-book`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ book_id: body.book_id }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "failed" }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
