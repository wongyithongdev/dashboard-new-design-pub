import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

type ProfilePatchBody = {
  first_name?: string;
  last_name?: string;
  email?: string;
  job_title?: string;
};

function pickProfileFields(body: ProfilePatchBody) {
  const payload: ProfilePatchBody = {};

  if (typeof body.first_name === "string") payload.first_name = body.first_name;
  if (typeof body.last_name === "string") payload.last_name = body.last_name;
  if (typeof body.email === "string") payload.email = body.email;
  if (typeof body.job_title === "string") payload.job_title = body.job_title;

  return payload;
}

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const res = await fetch(`${process.env.AUTH_BASE_URL}/api/v1/users/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.json({ error: "failed" }, { status: res.status });
  }

  return NextResponse.json(await res.json());
}

export async function PATCH(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  let body: ProfilePatchBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const payload = pickProfileFields(body);

  if (Object.keys(payload).length === 0) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const res = await fetch(`${process.env.AUTH_BASE_URL}/api/v1/users/me/profile`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const code = data?.error?.code ?? "failed";
    return NextResponse.json({ error: code }, { status: res.status });
  }

  return NextResponse.json(data);
}
