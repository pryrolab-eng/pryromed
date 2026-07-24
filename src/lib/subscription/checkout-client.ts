/** Client helpers for paid subscription checkout (Polar). */

export type { PaidCheckoutContext, ScheduledChangeResponse, SubscriptionUpgradeResponse } from "@/lib/http/subscription";

export {
  cancelScheduledChange,
  cancelSubscription,
  createPendingBranchAddon,
  createPendingSubscription,
  getScheduledChange as fetchScheduledChange,
  renewSubscription,
  scheduleSubscriptionDowngrade,
  startPolarSubscriptionCheckout,
  upgradeSubscription,
} from "@/lib/http/subscription";

export async function fetchSubscriptionStatus() {
  const { getSubscriptionStatus } = await import("@/lib/http/subscription");
  return getSubscriptionStatus();
}
