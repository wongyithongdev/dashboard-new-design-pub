import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const SERVICE_BASE_URL = "https://service.my365biz.com";

async function getToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("access_token")?.value ?? null;
}

function getErrorCode(data: unknown) {
  if (data && typeof data === "object") {
    const maybeError = (data as { error?: unknown }).error;

    if (typeof maybeError === "string") {
      return maybeError;
    }

    if (maybeError && typeof maybeError === "object") {
      const maybeCode = (maybeError as { code?: unknown }).code;
      if (typeof maybeCode === "string") {
        return maybeCode;
      }
    }
  }

  return "failed";
}

export async function GET(request: NextRequest) {
  const token = await getToken();

  if (!token) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const docKey = request.nextUrl.searchParams.get("docKey")?.trim();

  if (!docKey) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const params = new URLSearchParams({ docKey });
  const res = await fetch(`${SERVICE_BASE_URL}/biz/purchase-invoice/detail?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return NextResponse.json({ error: getErrorCode(data) }, { status: res.status });
  }

  return NextResponse.json(data);
}
