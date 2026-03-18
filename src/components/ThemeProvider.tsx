'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

type Theme = 'light' | 'dark'

const ThemeContext = createContext<{
    theme: Theme
    setTheme: (t: Theme) => void
}>({ theme: 'dark', setTheme: () => {} })

export function useTheme() {
    return useContext(ThemeContext)
}

export function ThemeProvider({
    children,
    storageKey = 'theme',
    applyTo = 'html',
}: {
    children: React.ReactNode
    storageKey?: string
    applyTo?: 'html' | 'wrapper'
}) {
    const [theme, setThemeState] = useState<Theme>('dark')

    useEffect(() => {
        const saved = localStorage.getItem(storageKey) as Theme | null
        if (saved === 'light' || saved === 'dark') {
            setThemeState(saved)
            if (applyTo === 'html') {
                document.documentElement.setAttribute('data-theme', saved)
            }
        }
    }, [storageKey, applyTo])

    const setTheme = useCallback((t: Theme) => {
        setThemeState(t)
        localStorage.setItem(storageKey, t)
        if (applyTo === 'html') {
            document.documentElement.setAttribute('data-theme', t)
        }
    }, [storageKey, applyTo])

    if (applyTo === 'wrapper') {
        return (
            <ThemeContext.Provider value={{ theme, setTheme }}>
                <div data-theme={theme} suppressHydrationWarning style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
                    {children}
                </div>
            </ThemeContext.Provider>
        )
    }

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}
