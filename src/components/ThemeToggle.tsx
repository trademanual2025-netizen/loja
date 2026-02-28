'use client'

import { useTheme } from '@/components/ThemeProvider'
import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return <div style={{ width: 36, height: 36 }} />
    }

    return (
        <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={`Mudar para modo ${theme === 'dark' ? 'claro' : 'escuro'}`}
            style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 36, height: 36, borderRadius: '50%',
                background: 'var(--bg-card2)', border: '1px solid var(--border)',
                cursor: 'pointer', color: 'var(--text)'
            }}
        >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
    )
}
