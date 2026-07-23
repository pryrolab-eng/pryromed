export function parseNumberSetting(raw: unknown, defaultValue: number): number {
  const v =
    raw && typeof raw === "object" && "value" in raw
      ? (raw as { value: unknown }).value
      : raw;
  if (typeof v === "number" && Number.isFinite(v)) return Math.max(0, Math.floor(v));
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    if (Number.isFinite(n)) return Math.max(0, Math.floor(n));
  }
  return defaultValue;
}

/** Platform-wide: when true, in-app + push notifications are dispatched. */
export async function getEnableNotifications(): Promise<boolean> {
  return true;
}
