import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const SERVICE_BASE_URL = "https://service.my365biz.com";
const ALLOWED_SORT_BY = new Set(["invoiceNo", "agent", "status", "amount", "date"]);
const ALLOWED_STATUS = new Set(["unpaid", "partial", "paid", "overdue", "cancelled"]);

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

  const requestParams = request.nextUrl.searchParams;
  const upstreamParams = new URLSearchParams();
  const limit = requestParams.get("limit");
  const offset = requestParams.get("offset");
  const sortBy = requestParams.get("sort_by");
  const status = requestParams.get("status");

  if (limit) {
    upstreamParams.set("limit", limit);
  }

  if (offset) {
    upstreamParams.set("offset", offset);
  }

  if (sortBy && ALLOWED_SORT_BY.has(sortBy)) {
    upstreamParams.set("sort_by", sortBy);
  }

  if (status && ALLOWED_STATUS.has(status)) {
    upstreamParams.set("status", status);
  }

  const query = upstreamParams.toString();
  const res = await fetch(
    `${SERVICE_BASE_URL}/biz/purchase-invoice${query ? `?${query}` : ""}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    },
  );

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return NextResponse.json({ error: getErrorCode(data) }, { status: res.status });
  }

  return NextResponse.json(data);
}
