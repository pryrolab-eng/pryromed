/** CSS variables applied while a pharmacy tenant is active in the dashboard. */

export const PHARMACY_BRAND_CSS_VARS = {
  primary: "--pharmacy-primary",
  primaryMuted: "--pharmacy-primary-muted",
} as const;

function hexToHsl(hex: string): string {
  const raw = hex.replace("#", "");
  const r = parseInt(raw.substring(0, 2), 16) / 255;
  const g = parseInt(raw.substring(2, 4), 16) / 255;
  const b = parseInt(raw.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  const l = (max + min) / 2;
  let h = 0;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));

  if (d !== 0) {
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function applyPharmacyBrandingTheme(primaryColor: string) {
  const root = document.documentElement;
  const hsl = primaryColor.startsWith("#") ? hexToHsl(primaryColor) : primaryColor;
  root.style.setProperty("--primary", hsl);
  root.style.setProperty("--pharmacy-primary", primaryColor);
  root.style.setProperty(PHARMACY_BRAND_CSS_VARS.primaryMuted, `${primaryColor}1a`);
}

export function clearPharmacyBrandingTheme() {
  const root = document.documentElement;
  root.style.removeProperty("--primary");
  root.style.removeProperty("--pharmacy-primary");
  root.style.removeProperty(PHARMACY_BRAND_CSS_VARS.primaryMuted);
}
