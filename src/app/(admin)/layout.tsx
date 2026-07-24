import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth/get-auth-user";
import { SidebarInset } from "@/components/ui/sidebar";
import { SuperadminSidebar } from "@/components/superadmin-sidebar";
import { DashboardShellBar } from "@/components/shell/dashboard-shell-bar";
import {
  DashboardMainScroll,
  AdminProviders,
} from "@/components/shell/dashboard-providers";
import { AdminCommandPalette } from "@/components/dashboard";
import { AiSlideOverPanel } from "@/components/ai-panel";
import { AdminShell } from "@/components/admin/admin-shell";
import { resolveApiUrl } from "@/lib/http/migrated-api-prefixes";

async function getBootstrapData() {
  const { cookies: serverCookies, headers: serverHeaders } = await import("next/headers");
  const store = await serverCookies();
  const secureCookie = store.get("__Secure-pryrox_session")?.value;
  const cookie = secureCookie ?? store.get("pryrox_session")?.value;
  if (!cookie) {
    console.error("[AdminLayout] getBootstrapData: no session cookie found");
    return null;
  }

  const cookieStr = `${secureCookie ? "__Secure-pryrox_session" : "pryrox_session"}=${cookie}`;
  const hdrs = await serverHeaders();
  const host = hdrs.get("x-forwarded-host") ?? hdrs.get("host");
  const protocol = hdrs.get("x-forwarded-proto") ?? "https";

  const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  const { url } = resolveApiUrl("/api/auth/bootstrap");
  const requestUrl = apiBase && url.startsWith("/")
    ? `${apiBase}${url}`
    : url;

  const res = await fetch(requestUrl, {
    headers: { Cookie: cookieStr },
    cache: "no-store",
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data as Promise<{
    ok: boolean;
    me: {
      user: { isPlatformAdmin: boolean };
      memberships: Array<{ pharmacyId: string; pharmacyName: string | null; role: string | null; isActive: boolean }>;
    };
  }>;
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();
  if (!user) {
    redirect("/sign-in");
  }

  const bootstrap = await getBootstrapData();
  const isPlatformAdmin =
    bootstrap?.me?.user?.isPlatformAdmin ||
    bootstrap?.me?.memberships?.some((m) => m.role === "superadmin" || m.role === "admin") ||
    false;

  console.log("[AdminLayout] user:", user?.id, "bootstrap:", JSON.stringify(bootstrap?.me?.user), "isPlatformAdmin:", isPlatformAdmin);

  if (!isPlatformAdmin) {
    redirect("/app");
  }

  return (
    <AdminProviders>
      <SuperadminSidebar />
      <SidebarInset className="flex h-svh min-h-0 min-w-0 flex-col overflow-hidden">
        <DashboardShellBar showBranchSwitcher={false} />
        <AdminCommandPalette />
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <DashboardMainScroll className="min-w-0 flex-1">
            <AdminShell>{children}</AdminShell>
          </DashboardMainScroll>
          <AiSlideOverPanel />
        </div>
      </SidebarInset>
    </AdminProviders>
  );
}
