import type { MetadataRoute } from "next";
import { PRYROX_BRAND_BLUE } from "@/lib/brand/colors";
import { PRYROX_APP_ICONS } from "@/lib/brand/icons";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Pryrox",
    short_name: "Pryrox",
    description:
      "Pharmacy management — inventory, POS, prescriptions, staff, and billing.",
    start_url: "/app",
    scope: "/",
    display: "standalone",
    display_override: ["window-controls-overlay", "standalone", "minimal-ui"],
    orientation: "any",
    background_color: "#ffffff",
    theme_color: PRYROX_BRAND_BLUE,
    categories: ["business", "medical", "productivity"],
    lang: "en",
    dir: "ltr",
    prefer_related_applications: false,
    icons: [
      {
        src: PRYROX_APP_ICONS.icon192,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: PRYROX_APP_ICONS.icon512,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: PRYROX_APP_ICONS.maskable192,
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: PRYROX_APP_ICONS.maskable512,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: PRYROX_APP_ICONS.appleTouch,
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
    shortcuts: [
      {
        name: "POS",
        short_name: "POS",
        description: "Open point of sale",
        url: "/pharmacy/pos",
        icons: [{ src: PRYROX_APP_ICONS.icon192, sizes: "192x192" }],
      },
      {
        name: "Inventory",
        short_name: "Stock",
        description: "Open inventory",
        url: "/pharmacy/inventory",
        icons: [{ src: PRYROX_APP_ICONS.icon192, sizes: "192x192" }],
      },
      {
        name: "Dashboard",
        short_name: "Home",
        description: "Open pharmacy dashboard",
        url: "/pharmacy/dashboard",
        icons: [{ src: PRYROX_APP_ICONS.icon192, sizes: "192x192" }],
      },
    ],
  };
}
