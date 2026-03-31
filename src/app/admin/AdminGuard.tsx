'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

const ROUTE_TO_MODULE: Record<string, string> = {
    '/admin': 'dashboard',
    '/admin/products': 'products',
    '/admin/categories': 'categories',
    '/admin/orders': 'orders',
    '/admin/cupons': 'cupons',
    '/admin/reembolsos': 'reembolsos',
    '/admin/leads': 'leads',
    '/admin/comunicacao': 'comunicacao',
    '/admin/mensagens': 'mensagens',
    '/admin/admins': 'admins',
    '/admin/integracoes': 'integracoes',
    '/admin/settings': 'settings',
    '/admin/tracking': 'tracking',
    '/admin/webhooks': 'webhooks',
    '/admin/frete': 'frete',
    '/admin/embed': 'embed',
    '/admin/perfil': 'perfil',
}

export function AdminGuard({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()
    const [allowed, setAllowed] = useState(true)
    const [checked, setChecked] = useState(false)

    useEffect(() => {
        if (pathname === '/admin/login' || pathname === '/admin/setup') {
            setAllowed(true)
            setChecked(true)
            return
        }

        fetch('/api/admin/me')
            .then(r => r.json())
            .then(data => {
                if (data.role === 'superadmin') {
                    setAllowed(true)
                    setChecked(true)
                    return
                }

                const perms: string[] = data.permissions || []
                const matchedModule = Object.entries(ROUTE_TO_MODULE).find(([route]) => {
                    if (route === '/admin') return pathname === '/admin'
                    return pathname.startsWith(route)
                })

                if (matchedModule && !perms.includes(matchedModule[1])) {
                    setAllowed(false)
                    setChecked(true)
                    router.replace('/admin')
                } else {
                    setAllowed(true)
                    setChecked(true)
                }
            })
            .catch(() => {
                setAllowed(true)
                setChecked(true)
            })
    }, [pathname])

    if (!checked) return null
    if (!allowed) return null
    return <>{children}</>
}
