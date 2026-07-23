import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth/get-auth-user";
import { resolveApiUrl } from "@/lib/http/migrated-api-prefixes";
import { cookies } from "next/headers";

export default async function AuthSuccessPage() {
  const user = await getAuthUser();
  if (!user) redirect("/sign-in");

  const cookieStore = await cookies();
  const authCookie = cookieStore.get("pryrox_session")?.value || cookieStore.get("__Secure-pryrox_session")?.value;

  if (authCookie) {
    const { url } = resolveApiUrl("/api/auth/home");
    const res = await fetch(url, { headers: { Cookie: `pryrox_session=${authCookie}` } });
    if (res.ok) {
      const data = await res.json();
      if (data?.path) redirect(data.path);
    }
  }

  redirect("/app");
}
