import { getSettings, SETTINGS_KEYS } from '@/lib/config'
import AuthClient from './AuthClient'

export default async function AuthPage() {
    const settings = await getSettings([SETTINGS_KEYS.STORE_LOGO])
    const logoUrl = settings[SETTINGS_KEYS.STORE_LOGO] || undefined

    return <AuthClient logoUrl={logoUrl} />
}
