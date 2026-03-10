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
import { CartNotification } from "@/components/store/CartNotification";
import { NavigationProgress } from "@/components/NavigationProgress";
import { cookies } from "next/headers";
import { dictionaries, defaultLocale, Locale } from "@/lib/i18n";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: "Giovana Dias Joias — Joias Artesanais",
    template: "%s | Giovana Dias Joias",
  },
  description: "Joias autênticas para pessoas autênticas. Conheça as coleções exclusivas da Giovana Dias Joias.",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0d0a06',
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
  const [settings, cookieStore] = await Promise.all([
    getLayoutSettings(),
    cookies(),
  ]);

  const localeCookie = cookieStore.get('NEXT_LOCALE')?.value as Locale;
  const currentLocale = (localeCookie && dictionaries[localeCookie]) ? localeCookie : defaultLocale;
  const langMap: Record<string, string> = { pt: 'pt-BR', en: 'en', es: 'es' };
  const htmlLang = langMap[currentLocale] || 'pt-BR';

  const fbPixelId = settings[SETTINGS_KEYS.FB_PIXEL_ID];
  const fbEnabled = settings[SETTINGS_KEYS.FB_PIXEL_ENABLED] === "true";
  const googleAdsId = settings[SETTINGS_KEYS.GOOGLE_ADS_ID];
  const googleEnabled = settings[SETTINGS_KEYS.GOOGLE_ADS_ENABLED] === "true";

  const storeName = settings[SETTINGS_KEYS.STORE_NAME] || "Giovana Dias Joias";
  const logoUrl = settings[SETTINGS_KEYS.STORE_LOGO] || "";
  const primaryColor = settings[SETTINGS_KEYS.STORE_PRIMARY_COLOR] || "#6366f1";
  const btnBuyColor = settings[SETTINGS_KEYS.STORE_BTN_BUY] || primaryColor;
  const btnHeaderColor = settings[SETTINGS_KEYS.STORE_BTN_HEADER] || primaryColor;
  const favicon = settings[SETTINGS_KEYS.STORE_FAVICON] || "";
  const metaTitle = settings[SETTINGS_KEYS.SEO_META_TITLE] || `${storeName} — Joias Artesanais`;
  const metaDesc = settings[SETTINGS_KEYS.SEO_META_DESCRIPTION] || `Joias autênticas para pessoas autênticas. Conheça as coleções exclusivas da ${storeName}.`;
  const ogImage = settings[SETTINGS_KEYS.SEO_OG_IMAGE] || "";

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://giovanadiasjewelry.com.br');

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: storeName,
    url: baseUrl,
    ...(logoUrl ? { logo: logoUrl } : {}),
    ...(ogImage ? { image: ogImage } : {}),
  };

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: storeName,
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/loja?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const siteNavJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: [
      {
        '@type': 'SiteNavigationElement',
        position: 1,
        name: 'Loja',
        description: 'Conheça nossa coleção completa de joias artesanais',
        url: `${baseUrl}/loja`,
      },
      {
        '@type': 'SiteNavigationElement',
        position: 2,
        name: 'Nossa Marca',
        description: 'A história e essência da Giovana Dias Joias',
        url: `${baseUrl}/nossamarca`,
      },
      {
        '@type': 'SiteNavigationElement',
        position: 3,
        name: 'Guia do Anel',
        description: 'Descubra seu tamanho de anel ideal',
        url: `${baseUrl}/ringsize`,
      },
      {
        '@type': 'SiteNavigationElement',
        position: 4,
        name: 'Contato',
        description: 'Entre em contato com a Giovana Dias Joias',
        url: `${baseUrl}/contato`,
      },
    ],
  };

  return (
    <html
      lang={htmlLang}
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
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}})()` }} />
        <link rel="dns-prefetch" href="https://connect.facebook.net" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <meta property="og:site_name" content={storeName} />
        <meta property="og:locale" content={currentLocale === 'en' ? 'en_US' : currentLocale === 'es' ? 'es_ES' : 'pt_BR'} />
        {favicon && <link rel="icon" href={favicon} />}
        {!favicon && (
          <>
            <link rel="icon" href="/favicon.ico" sizes="any" />
            <link rel="icon" href="/favicon-32x32.png" sizes="32x32" type="image/png" />
            <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          </>
        )}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteNavJsonLd) }} />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider>
          <NavigationProgress />
          {fbEnabled && fbPixelId && <FacebookPixel pixelId={fbPixelId} />}
          {googleEnabled && googleAdsId && <GoogleAds adsId={googleAdsId} />}
          <Toaster theme="dark" position="bottom-center" />
          <CartSync />
          <CartNotification />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
