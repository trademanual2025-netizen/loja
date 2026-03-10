import { getSettings, SETTINGS_KEYS } from '@/lib/config'
import { getAuthUser } from '@/lib/auth'
import { StoreHeader } from '@/components/store/StoreHeader'
import { StoreFooter } from '@/components/store/StoreFooter'
import { cookies } from 'next/headers'
import { dictionaries, defaultLocale, Locale } from '@/lib/i18n'

export async function generateMetadata() {
    const cookieStore = await cookies()
    const localeCookie = cookieStore.get('NEXT_LOCALE')?.value as Locale
    const currentLocale = (localeCookie && dictionaries[localeCookie]) ? localeCookie : defaultLocale
    const dict = dictionaries[currentLocale] || dictionaries[defaultLocale]

    return {
        title: dict.cart.title,
        description: dict.cart.emptyDescription,
    }
}

export default async function CarrinhoLayout({ children }: { children: React.ReactNode }) {
    const [settings, authUser] = await Promise.all([
        getSettings([SETTINGS_KEYS.STORE_NAME, SETTINGS_KEYS.STORE_LOGO, SETTINGS_KEYS.STORE_FOOTER_TEXT]),
        getAuthUser(),
    ])
    const storeName = settings[SETTINGS_KEYS.STORE_NAME] || 'Loja'
    const logoUrl = settings[SETTINGS_KEYS.STORE_LOGO] || null
    const footerText = settings[SETTINGS_KEYS.STORE_FOOTER_TEXT] || undefined
    const cookieStore = await cookies()
    const locale = (cookieStore.get('NEXT_LOCALE')?.value as Locale) || defaultLocale
    const dict = dictionaries[locale] || dictionaries[defaultLocale]
    const user = authUser ? { name: authUser.name, email: authUser.email, avatarUrl: authUser.avatarUrl ?? null } : null

    return (
        <>
            <StoreHeader storeName={storeName} logoUrl={logoUrl} user={user} dict={dict} />
            {children}
            <StoreFooter storeName={storeName} dict={dict} footerText={footerText} />
        </>
    )
}
