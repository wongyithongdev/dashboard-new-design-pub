import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const SERVICE_BASE_URL = "https://service.my365biz.com";

type CompanySettingsBody = {
  companyDescription?: string;
  expenseCategories?: string[];
};

async function getToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("access_token")?.value ?? null;
}

export async function GET() {
  const token = await getToken();
  if (!token) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const res = await fetch(`${SERVICE_BASE_URL}/biz/settings/company`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return NextResponse.json({ error: data?.error?.code ?? "failed" }, { status: res.status });
  }

  return NextResponse.json(data);
}

export async function PATCH(request: NextRequest) {
  const token = await getToken();
  if (!token) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  let body: CompanySettingsBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const res = await fetch(`${SERVICE_BASE_URL}/biz/settings/company`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      companyDescription: body.companyDescription ?? "",
      expenseCategories: Array.isArray(body.expenseCategories) ? body.expenseCategories : [],
    }),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return NextResponse.json({ error: data?.error?.code ?? "failed" }, { status: res.status });
  }

  return NextResponse.json(data);
}
