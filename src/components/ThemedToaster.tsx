'use client'

import { Toaster } from 'sonner'
import { useTheme } from '@/components/ThemeProvider'

export function ThemedToaster() {
    const { theme } = useTheme()
    return <Toaster theme={theme} position="bottom-center" />
}
