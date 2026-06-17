import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type AuthUser = {
  user_id: string;
  username: string;
  first_name: string;
  last_name: string;
  display_name: string;
  job_title: string;
  color: string;
  email: string;
  books: Array<{ book_id: string; book_name: string; role: string }>;
  mfa_enabled: boolean;
};

export async function getSession(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) return null;

  try {
    const res = await fetch(
      `${process.env.AUTH_BASE_URL}/api/v1/users/me`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      },
    );

    if (!res.ok) return null;
    return (await res.json()) as AuthUser;
  } catch {
    return null;
  }
}

export async function requireSession(): Promise<AuthUser> {
  const user = await getSession();
  if (!user) redirect("/login");
  return user;
}
