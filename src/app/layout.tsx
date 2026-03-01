import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { prisma } from "@/lib/prisma";
import { SETTINGS_KEYS } from "@/lib/config";
import { FacebookPixel } from "@/components/tracking/FacebookPixel";
import { GoogleAds } from "@/components/tracking/GoogleAds";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "sonner";
import { CartSync } from "@/components/store/CartSync";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Loja Virtual",
  description: "Bem-vindo à nossa loja",
};

async function getLayoutSettings() {
  try {
    const settings = await prisma.settings.findMany({
      where: {
        key: {
          in: [
            SETTINGS_KEYS.FB_PIXEL_ID,
            SETTINGS_KEYS.FB_PIXEL_ENABLED,
            SETTINGS_KEYS.GOOGLE_ADS_ID,
            SETTINGS_KEYS.GOOGLE_ADS_ENABLED,
            SETTINGS_KEYS.STORE_NAME,
            SETTINGS_KEYS.STORE_PRIMARY_COLOR,
            SETTINGS_KEYS.STORE_TEXT_COLOR,
            SETTINGS_KEYS.STORE_BG_COLOR,
            SETTINGS_KEYS.STORE_BG_CARD_COLOR,
            SETTINGS_KEYS.STORE_TEXT_TITLE,
            SETTINGS_KEYS.STORE_BTN_BUY,
            SETTINGS_KEYS.STORE_BTN_HEADER,
            SETTINGS_KEYS.STORE_ICON_CART,
            SETTINGS_KEYS.STORE_LOGO,
            SETTINGS_KEYS.STORE_FAVICON,
            SETTINGS_KEYS.SEO_META_TITLE,
            SETTINGS_KEYS.SEO_META_DESCRIPTION,
            SETTINGS_KEYS.SEO_OG_IMAGE,
          ],
        },
      },
    });
    const map: Record<string, string> = {};
    for (const s of settings) map[s.key] = s.value;
    return map;
  } catch {
    return {};
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getLayoutSettings();

  const fbPixelId = settings[SETTINGS_KEYS.FB_PIXEL_ID];
  const fbEnabled = settings[SETTINGS_KEYS.FB_PIXEL_ENABLED] === "true";
  const googleAdsId = settings[SETTINGS_KEYS.GOOGLE_ADS_ID];
  const googleEnabled = settings[SETTINGS_KEYS.GOOGLE_ADS_ENABLED] === "true";

  const storeName = settings[SETTINGS_KEYS.STORE_NAME] || "Loja Virtual";
  const primaryColor = settings[SETTINGS_KEYS.STORE_PRIMARY_COLOR] || "#6366f1";
  const btnBuyColor = settings[SETTINGS_KEYS.STORE_BTN_BUY] || primaryColor;
  const btnHeaderColor = settings[SETTINGS_KEYS.STORE_BTN_HEADER] || primaryColor;
  const favicon = settings[SETTINGS_KEYS.STORE_FAVICON] || "";
  const metaTitle = settings[SETTINGS_KEYS.SEO_META_TITLE] || storeName;
  const metaDesc = settings[SETTINGS_KEYS.SEO_META_DESCRIPTION] || `Bem-vindo à ${storeName}`;
  const ogImage = settings[SETTINGS_KEYS.SEO_OG_IMAGE] || "";

  return (
    <html
      lang="pt-BR"
      data-theme="dark"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      style={{
        // Only brand/accent colors in inline styles — theme bg/text are CSS-controlled
        ["--primary" as string]: primaryColor,
        ["--primary-dark" as string]: primaryColor,
        ["--btn-buy" as string]: btnBuyColor,
        ["--btn-header" as string]: btnHeaderColor,
      } as React.CSSProperties}
    >
      <head>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDesc} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDesc} />
        <meta property="og:type" content="website" />
        {ogImage && <meta property="og:image" content={ogImage} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDesc} />
        {ogImage && <meta name="twitter:image" content={ogImage} />}
        {favicon && <link rel="icon" href={favicon} />}
        {!favicon && <link rel="icon" href="/favicon.ico" />}
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider>
          {fbEnabled && fbPixelId && <FacebookPixel pixelId={fbPixelId} />}
          {googleEnabled && googleAdsId && <GoogleAds adsId={googleAdsId} />}
          <Toaster theme="dark" position="bottom-center" />
          <CartSync />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
