'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ShieldCheck } from 'lucide-react'

export default function AdminLoginPage() {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        setLoading(true)
        const res = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(Object.fromEntries(fd)),
        })
        const json = await res.json()
        setLoading(false)
        if (!res.ok) { toast.error(json.error); return }
        router.push('/admin')
        router.refresh()
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'var(--bg)' }}>
            <div className="card fade-in" style={{ width: '100%', maxWidth: 380 }}>
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    <div style={{ display: 'inline-flex', padding: 14, background: 'linear-gradient(135deg,#6366f1,#a855f7)', borderRadius: 14, marginBottom: 14 }}>
                        <ShieldCheck size={28} color="white" />
                    </div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Painel Admin</h1>
                </div>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div className="form-group">
                        <label className="form-label">E-mail</label>
                        <input name="email" type="email" className="input" required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Senha</label>
                        <input name="password" type="password" className="input" required />
                    </div>
                    <button className="btn btn-primary btn-full" style={{ padding: '12px', marginTop: 8 }} disabled={loading}>
                        {loading ? <span className="spinner" /> : 'Entrar'}
                    </button>
                </form>
            </div>
        </div>
    )
}
