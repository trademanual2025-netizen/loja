'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2, Shield, KeyRound } from 'lucide-react'

interface Admin { id: string; name: string; email: string; createdAt: string }

export default function AdminAdminsPage() {
    const [admins, setAdmins] = useState<Admin[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState({ name: '', email: '', password: '' })
    const [saving, setSaving] = useState(false)
    const [resetTarget, setResetTarget] = useState<Admin | null>(null)
    const [newPwd, setNewPwd] = useState('')

    async function load() {
        setLoading(true)
        const r = await fetch('/api/admin/admins')
        const d = await r.json()
        setAdmins(d.admins || [])
        setLoading(false)
    }
    useEffect(() => { load() }, [])

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault()
        setSaving(true)
        const r = await fetch('/api/admin/admins', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        })
        const d = await r.json()
        setSaving(false)
        if (!r.ok) { toast.error(d.error); return }
        toast.success('Admin criado com sucesso!')
        setForm({ name: '', email: '', password: '' })
        setShowForm(false)
        load()
    }

    async function handleDelete(id: string, name: string) {
        if (!confirm(`Remover admin "${name}"? Esta ação não pode ser desfeita.`)) return
        const r = await fetch(`/api/admin/admins/${id}`, { method: 'DELETE' })
        if (r.ok) { toast.success('Admin removido.'); load() }
        else toast.error('Erro ao remover.')
    }

    async function handleResetPwd(e: React.FormEvent) {
        e.preventDefault()
        if (!resetTarget) return
        const r = await fetch(`/api/admin/admins/${resetTarget.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: newPwd }),
        })
        if (r.ok) { toast.success('Senha alterada!'); setResetTarget(null); setNewPwd('') }
        else toast.error('Erro ao alterar senha.')
    }

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Administradores</h1>
                    <span className="badge badge-blue">{admins.length}</span>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                    <Plus size={16} /> Novo Admin
                </button>
            </div>

            {/* Formulário de criação */}
            {showForm && (
                <div className="card fade-in" style={{ marginBottom: 24, maxWidth: 480 }}>
                    <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Adicionar Administrador</h3>
                    <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <input className="input" placeholder="Nome completo *" required value={form.name}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                        <input className="input" type="email" placeholder="E-mail *" required value={form.email}
                            onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                        <input className="input" type="password" placeholder="Senha (mínimo 6 caracteres) *" minLength={6} required value={form.password}
                            onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? <span className="spinner" /> : 'Criar Admin'}
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Modal trocar senha */}
            {resetTarget && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div className="card fade-in" style={{ maxWidth: 380, width: '100%' }}>
                        <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Alterar Senha</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: 16, fontSize: '0.88rem' }}>Admin: <strong>{resetTarget.name}</strong></p>
                        <form onSubmit={handleResetPwd} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <input className="input" type="password" placeholder="Nova senha *" minLength={6} required
                                value={newPwd} onChange={e => setNewPwd(e.target.value)} />
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button type="submit" className="btn btn-primary">Salvar</button>
                                <button type="button" className="btn btn-secondary" onClick={() => setResetTarget(null)}>Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Tabela */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: 40, textAlign: 'center' }}><span className="spinner" /></div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                {['Admin', 'E-mail', 'Desde', 'Ações'].map(h => (
                                    <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {admins.map(admin => (
                                <tr key={admin.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '14px 20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Shield size={16} color="white" />
                                            </div>
                                            <span style={{ fontWeight: 600 }}>{admin.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '14px 20px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>{admin.email}</td>
                                    <td style={{ padding: '14px 20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                        {new Date(admin.createdAt).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td style={{ padding: '14px 20px' }}>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button onClick={() => setResetTarget(admin)} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem' }}>
                                                <KeyRound size={14} /> Senha
                                            </button>
                                            <button onClick={() => handleDelete(admin.id, admin.name)} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'transparent', color: 'var(--error)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem' }}>
                                                <Trash2 size={14} /> Remover
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {admins.length === 0 && (
                                <tr>
                                    <td colSpan={4} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Nenhum administrador cadastrado.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
