import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { prisma } from "@/lib/prisma";
import { SETTINGS_KEYS } from "@/lib/config";
import { FacebookPixel } from "@/components/tracking/FacebookPixel";
import { GoogleAds } from "@/components/tracking/GoogleAds";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemedToaster } from "@/components/ThemedToaster";
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

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getLayoutSettings();
  const storeName = settings[SETTINGS_KEYS.STORE_NAME] || "Giovana Dias Joias";
  const metaTitle = settings[SETTINGS_KEYS.SEO_META_TITLE] || `${storeName} — Joias Artesanais`;
  const metaDesc = settings[SETTINGS_KEYS.SEO_META_DESCRIPTION] || `Joias autênticas para pessoas autênticas. Conheça as coleções exclusivas da ${storeName}.`;

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://giovanadiasjewelry.com.br'),
    title: {
      default: metaTitle,
      template: `%s | ${storeName}`,
    },
    description: metaDesc,
  };
}

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
            SETTINGS_KEYS.LANDING_INSTAGRAM,
            SETTINGS_KEYS.LANDING_WHATSAPP,
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
  const primaryColor = settings[SETTINGS_KEYS.STORE_PRIMARY_COLOR] || "";
  const btnBuyColor = settings[SETTINGS_KEYS.STORE_BTN_BUY] || "";
  const btnHeaderColor = settings[SETTINGS_KEYS.STORE_BTN_HEADER] || "";
  const textColor = settings[SETTINGS_KEYS.STORE_TEXT_COLOR] || "";
  const bgColor = settings[SETTINGS_KEYS.STORE_BG_COLOR] || "";
  const bgCardColor = settings[SETTINGS_KEYS.STORE_BG_CARD_COLOR] || "";
  const textTitleColor = settings[SETTINGS_KEYS.STORE_TEXT_TITLE] || "";
  const iconCartColor = settings[SETTINGS_KEYS.STORE_ICON_CART] || "";
  const favicon = settings[SETTINGS_KEYS.STORE_FAVICON] || "";
  const metaTitle = settings[SETTINGS_KEYS.SEO_META_TITLE] || `${storeName} — Joias Artesanais`;
  const metaDesc = settings[SETTINGS_KEYS.SEO_META_DESCRIPTION] || `Joias autênticas para pessoas autênticas. Conheça as coleções exclusivas da ${storeName}.`;
  const ogImage = settings[SETTINGS_KEYS.SEO_OG_IMAGE] || "";
  const instagram = settings[SETTINGS_KEYS.LANDING_INSTAGRAM] || "";
  const whatsapp = settings[SETTINGS_KEYS.LANDING_WHATSAPP] || "";

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://giovanadiasjewelry.com.br');

  const sameAs: string[] = [];
  if (instagram) sameAs.push(instagram.startsWith('http') ? instagram : `https://www.instagram.com/${instagram.replace(/^@/, '')}`);

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${baseUrl}/#organization`,
    name: storeName,
    url: baseUrl,
    ...(logoUrl ? { logo: { '@type': 'ImageObject', url: logoUrl } } : {}),
    ...(ogImage ? { image: ogImage } : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
    ...(whatsapp ? { contactPoint: [{ '@type': 'ContactPoint', telephone: whatsapp, contactType: 'customer service', availableLanguage: 'Portuguese' }] } : {}),
  };

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${baseUrl}/#website`,
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
        ...(primaryColor ? { ["--primary" as string]: primaryColor, ["--primary-dark" as string]: primaryColor } : {}),
        ...(btnBuyColor ? { ["--btn-buy" as string]: btnBuyColor } : {}),
        ...(btnHeaderColor ? { ["--btn-header" as string]: btnHeaderColor } : {}),
      } as React.CSSProperties}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}})()` }} />
        <style dangerouslySetInnerHTML={{ __html: `
          [data-theme='dark'] {
            ${textColor ? `--text: ${textColor};` : ''}
            ${bgColor ? `--bg: ${bgColor};` : ''}
            ${bgCardColor ? `--bg-card: ${bgCardColor};` : ''}
            ${textTitleColor ? `--text-title: ${textTitleColor};` : ''}
            ${iconCartColor ? `--icon-cart: ${iconCartColor};` : ''}
          }
        ` }} />
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
          <ThemedToaster />
          <CartSync />
          <CartNotification />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
