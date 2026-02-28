'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Store, ShieldCheck } from 'lucide-react'

export default function AdminSetupPage() {
    const [loading, setLoading] = useState(false)
    const [checking, setChecking] = useState(true)
    const router = useRouter()

    useEffect(() => {
        fetch('/api/admin/setup').then(r => r.json()).then(d => {
            if (d.setupDone) router.replace('/admin/login')
            else setChecking(false)
        }).catch(() => setChecking(false))
    }, [router])

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        setLoading(true)
        try {
            const res = await fetch('/api/admin/setup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(Object.fromEntries(fd)),
            })
            const json = await res.json()
            setLoading(false)
            if (!res.ok) {
                console.error('Setup API Error:', json)
                toast.error(json.error || 'Erro desconhecido');
                return
            }
            toast.success('Loja configurada com sucesso!')
            router.push('/admin')
        } catch (err) {
            console.error('Fetch Failed:', err)
            setLoading(false)
            toast.error('Erro de conexão com o servidor')
        }
    }

    if (checking) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}><span className="spinner" /></div>

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'var(--bg)' }}>
            <div className="card fade-in" style={{ width: '100%', maxWidth: 500 }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{ display: 'inline-flex', padding: 16, background: 'linear-gradient(135deg,#6366f1,#a855f7)', borderRadius: 16, marginBottom: 16 }}>
                        <Store size={32} color="white" />
                    </div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 8 }}>Configurar Loja</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Primeira configuração — preencha os dados básicos</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="form-group">
                        <label className="form-label">Nome da Loja *</label>
                        <input name="storeName" className="input" placeholder="Minha Loja" required />
                    </div>
                    <hr className="divider" />
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <ShieldCheck size={14} /> Conta do Administrador
                    </p>
                    <div className="form-group">
                        <label className="form-label">Nome completo</label>
                        <input name="adminName" className="input" placeholder="Admin" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">E-mail do Admin *</label>
                        <input name="adminEmail" type="email" className="input" required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Senha *</label>
                        <input name="adminPassword" type="password" className="input" minLength={6} required />
                    </div>
                    <button className="btn btn-primary btn-full" style={{ marginTop: 8, padding: '14px' }} disabled={loading}>
                        {loading ? <span className="spinner" /> : 'Configurar e Acessar Painel →'}
                    </button>
                </form>
            </div>
        </div>
    )
}
