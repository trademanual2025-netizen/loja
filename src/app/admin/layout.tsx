import '@/app/globals.css'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getAdminEmailFromCookie } from '@/lib/admin-auth'
import { ThemeProvider } from '@/components/ThemeProvider'
import AdminLayoutClient from './AdminLayoutClient'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const headersList = await headers()
    const pathname = headersList.get('x-pathname') || ''

    const isLoginOrSetup = pathname.startsWith('/admin/login') || pathname.startsWith('/admin/setup')

    if (isLoginOrSetup) {
        return (
            <ThemeProvider storageKey="admin-theme" applyTo="wrapper">
                {children}
            </ThemeProvider>
        )
    }

    const email = await getAdminEmailFromCookie()
    if (!email) {
        redirect('/admin/login')
    }

    return <AdminLayoutClient>{children}</AdminLayoutClient>
}
