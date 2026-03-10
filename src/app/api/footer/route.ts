import { NextResponse } from 'next/server'
import { getSettings, SETTINGS_KEYS } from '@/lib/config'

export async function GET() {
    const settings = await getSettings([
        SETTINGS_KEYS.LANDING_WHATSAPP,
        SETTINGS_KEYS.LANDING_INSTAGRAM,
        SETTINGS_KEYS.LANDING_EMAIL,
        SETTINGS_KEYS.LANDING_PHONE,
    ])

    return NextResponse.json({
        whatsapp: settings[SETTINGS_KEYS.LANDING_WHATSAPP] || '',
        instagram: settings[SETTINGS_KEYS.LANDING_INSTAGRAM] || '',
        email: settings[SETTINGS_KEYS.LANDING_EMAIL] || '',
        phone: settings[SETTINGS_KEYS.LANDING_PHONE] || '',
    })
}
