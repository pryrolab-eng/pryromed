import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/auth/get-auth-user'
import { selectPrimaryMembership } from '@/utils/select-pharmacy-membership'
import { SidebarInset } from '@/components/ui/sidebar'
import { SuperadminSidebar } from '@/components/superadmin-sidebar'
import { PharmacySidebar } from '@/components/pharmacy-sidebar'
import { StaffWorkspaceSidebar } from '@/components/sidebar/staff-workspace-sidebar'
import { isStaffWorkspaceRole } from '@/lib/rbac/pharmacy-roles'
import SubscriptionBlocker from '@/components/subscription-blocker'
import { FeatureRouteGuard } from '@/components/subscription/feature-route-guard'
import { StaffRoleRouteGuard } from '@/components/subscription/staff-role-route-guard'
import { resolveActivePharmacyContext } from '@/lib/pharmacy/active-pharmacy'
import { DashboardShellBar } from '@/components/shell/dashboard-shell-bar'
import {
  DashboardMainScroll,
  DashboardProviders,
} from '@/components/shell/dashboard-providers'
import { DashboardCommandPalette, AdminCommandPalette } from '@/components/dashboard'
import { AiSlideOverPanel } from '@/components/ai-panel'
import { BranchScopeProvider } from '@/hooks/useBranchScope'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getAuthUser();
  if (!user) {
    redirect('/sign-in')
  }

  const ctx = await resolveActivePharmacyContext(user.id)
  const isPlatformAdmin = ctx.isPlatformAdmin
  const userProfile = selectPrimaryMembership(ctx.memberships)
  const userRole = userProfile?.role || ctx.role || 'pharmacy_owner'

  const getSidebar = () => {
    if (isPlatformAdmin) return <SuperadminSidebar />
    if (isStaffWorkspaceRole(userRole)) return <StaffWorkspaceSidebar />
    return <PharmacySidebar />
  }

  const dashboardBody = (
    <>
      {getSidebar()}
      <SidebarInset className="flex h-svh min-h-0 min-w-0 flex-col overflow-hidden">
        <SubscriptionBlocker userRole={userRole} />
        <DashboardShellBar showBranchSwitcher={!isPlatformAdmin} />
        {!isPlatformAdmin ? <DashboardCommandPalette /> : <AdminCommandPalette />}
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <DashboardMainScroll className="min-w-0 flex-1">
            {!isPlatformAdmin ? (
              <FeatureRouteGuard>
                <StaffRoleRouteGuard>{children}</StaffRoleRouteGuard>
              </FeatureRouteGuard>
            ) : (
              children
            )}
          </DashboardMainScroll>
          <AiSlideOverPanel />
        </div>
      </SidebarInset>
    </>
  )

  return (
    <BranchScopeProvider>
      <DashboardProviders withPharmacyContext={!isPlatformAdmin}>
        {dashboardBody}
      </DashboardProviders>
    </BranchScopeProvider>
  )
}
