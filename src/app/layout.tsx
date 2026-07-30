import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/app-providers";
import { PRYROX_BRAND_BLUE } from "@/lib/brand/colors";
import { PRYROX_APP_ICONS } from "@/lib/brand/icons";

const inter = Inter({ subsets: ["latin"] });

const APP_NAME = "Pryrox";
const APP_DESCRIPTION =
  "Pharmacy management — inventory, POS, prescriptions, staff, and billing.";
const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  metadataBase: new URL(APP_BASE_URL),
  title: {
    default: APP_NAME,
    template: `%s · ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: PRYROX_APP_ICONS.favicon, sizes: "any" },
      {
        url: PRYROX_APP_ICONS.favicon16,
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: PRYROX_APP_ICONS.favicon32,
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: PRYROX_APP_ICONS.favicon48,
        sizes: "48x48",
        type: "image/png",
      },
      { url: PRYROX_APP_ICONS.icon192, sizes: "192x192", type: "image/png" },
      { url: PRYROX_APP_ICONS.icon512, sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: PRYROX_APP_ICONS.appleTouch, sizes: "180x180" }],
    shortcut: PRYROX_APP_ICONS.favicon32,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: [
      {
        url: PRYROX_APP_ICONS.icon512,
        width: 512,
        height: 512,
        alt: APP_NAME,
      },
    ],
  },
  twitter: {
    card: "summary",
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: [PRYROX_APP_ICONS.icon512],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: PRYROX_BRAND_BLUE },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
