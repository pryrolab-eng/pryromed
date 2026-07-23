import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth/get-auth-user";

export default async function AuthSuccessPage() {
  const user = await getAuthUser();
  if (!user) redirect("/sign-in");
  // The /app gate resolves the role-specific destination using the same
  // session; keep this legacy callback free of a second server-side request.
  redirect("/app");
}
