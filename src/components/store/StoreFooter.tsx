'use client'

import { Dictionary } from '@/lib/i18n'
import { useState, useEffect } from 'react'

export function StoreFooter({ storeName, dict }: { storeName: string; dict: Dictionary }) {
    const [year, setYear] = useState<number | null>(null)

    useEffect(() => {
        setYear(new Date().getFullYear())
    }, [])

    return (
        <footer style={{
            background: 'var(--bg-card)',
            borderTop: '1px solid var(--border)',
            padding: '30px 16px',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
        }}>
            <p>&copy; {year ?? ''} {storeName}. {dict.footer?.rights || 'Todos os direitos reservados.'}</p>
            <p style={{ marginTop: 8 }}>{dict.footer?.payments || 'Pagamentos processados de forma segura.'}</p>
        </footer>
    )
}
