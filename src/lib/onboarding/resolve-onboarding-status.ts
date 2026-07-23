import { resolveApiUrl } from "@/lib/http/migrated-api-prefixes";

type BackendPharmacy = {
  id: string;
  name: string;
  city: string;
  phone: string;
  email: string;
  status: string;
  created_at: string;
};

type BackendOnboardingResponse = {
  step: number;
  pharmacy: BackendPharmacy | null;
  pendingPlan: unknown;
  completed: boolean;
  isPlatformAdmin?: true;
  redirect?: "/admin";
  needsPharmacyProfile?: true;
  subscriptionActive?: true;
};

export type OnboardingStep = 1 | 2 | 3 | 4 | 5;

export type OnboardingStatusResult =
  | {
      step: OnboardingStep;
      pharmacy: {
        id: string;
        name: string;
        city: string;
        phone: string;
        email: string;
      } | null;
      pendingPlan: unknown;
      completed: false;
      isPlatformAdmin: true;
      redirect: "/admin";
    }
  | {
      step: 1;
      pharmacy: null;
      pendingPlan: null;
      completed: false;
      needsPharmacyProfile: true;
    }
  | {
      step: 4;
      pharmacy: {
        id: string;
        name: string;
        city: string;
        phone: string;
        email: string;
      };
      pendingPlan: null;
      completed: false;
      subscriptionActive: true;
    }
  | {
      step: 3;
      pharmacy: {
        id: string;
        name: string;
        city: string;
        phone: string;
        email: string;
      };
      pendingPlan: {
        id: string;
        name: string;
        price: number;
        period: string;
        features: unknown;
        is_popular: boolean;
        subscriptionId: string;
      };
      completed: false;
    }
  | {
      step: 2;
      pharmacy: {
        id: string;
        name: string;
        city: string;
        phone: string;
        email: string;
      };
      pendingPlan: null;
      completed: false;
    };

export async function resolveOnboardingStatus(
  _userId: string,
): Promise<OnboardingStatusResult> {
  const { url } = resolveApiUrl("/api/onboarding/status");
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) {
    return {
      step: 1,
      pharmacy: null,
      pendingPlan: null,
      completed: false,
      needsPharmacyProfile: true,
    };
  }
  const data = (await res.json()) as BackendOnboardingResponse;
  return data as unknown as OnboardingStatusResult;
}
