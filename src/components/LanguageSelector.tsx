'use client'

import { useState, useEffect } from 'react'
import Cookies from 'js-cookie'
import { Locale } from '@/lib/i18n'

export function LanguageSelector() {
    const [locale, setLocale] = useState<Locale>('pt')

    useEffect(() => {
        const saved = Cookies.get('NEXT_LOCALE') as Locale
        if (saved && ['pt', 'en', 'es'].includes(saved)) {
            setLocale(saved)
        }
    }, [])

    const changeLocale = (newLocale: Locale) => {
        Cookies.set('NEXT_LOCALE', newLocale, { expires: 365 })
        setLocale(newLocale)
        window.location.reload()
    }

    return (
        <select
            value={locale}
            onChange={(e) => changeLocale(e.target.value as Locale)}
            style={{
                background: 'var(--bg-card2)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                padding: '4px 8px',
                borderRadius: 8,
                fontSize: '0.85rem',
                outline: 'none',
                cursor: 'pointer'
            }}
        >
            <option value="pt">🇧🇷 PT</option>
            <option value="en">🇺🇸 EN</option>
            <option value="es">🇪🇸 ES</option>
        </select>
    )
}
