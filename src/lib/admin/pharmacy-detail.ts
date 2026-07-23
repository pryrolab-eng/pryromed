export type AdminPharmacyBranchAddonRow = {
  id: string;
  status: string;
  branchName: string | null;
  planName: string;
  price: number;
};

export type AdminPharmacyDetail = {
  pharmacy: Record<string, unknown>;
  owner: { name: string | null; email: string | null } | null;
  plan: {
    name: string;
    priceLabel: string;
    isFree: boolean;
    enumKey: string;
  };
  access: { status: string; label: string };
  mainSubscription: {
    id: string;
    status: string;
    expiresAt: string | null;
    planName: string;
    price: number;
  } | null;
  pendingMainSubscription: {
    id: string;
    status: string;
    expiresAt: string | null;
    planName: string;
    price: number;
  } | null;
  branchAddons: {
    activeCount: number;
    items: AdminPharmacyBranchAddonRow[];
    catalogProductName: string | null;
    catalogProductPrice: number | null;
  };
  capacity: {
    branchesInUse: number;
    slotsFromMainPlan: number;
    slotsFromAddons: number;
    totalSlots: number;
    canAddBranch: boolean;
  };
  entitlements: {
    isAccessAllowed: boolean;
    isExpired: boolean;
    daysRemaining: number | null;
    expiresAt: string | null;
    limits: {
      maxUsers: number;
      maxBranches: number;
      monthlyTxPerBranch: number;
      totalBranchSlots: number;
    };
    usage: { activeUsers: number; activeBranches: number };
    featureCount: number;
  };
};
