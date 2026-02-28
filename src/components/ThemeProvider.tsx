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

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('dark')

    useEffect(() => {
        const saved = localStorage.getItem('theme') as Theme | null
        if (saved === 'light' || saved === 'dark') {
            setThemeState(saved)
            document.documentElement.setAttribute('data-theme', saved)
        }
    }, [])

    const setTheme = useCallback((t: Theme) => {
        setThemeState(t)
        localStorage.setItem('theme', t)
        document.documentElement.setAttribute('data-theme', t)
    }, [])

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}
