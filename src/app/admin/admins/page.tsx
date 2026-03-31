'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2, Shield, KeyRound, Crown, ToggleLeft, ToggleRight } from 'lucide-react'

const MODULE_LABELS: Record<string, string> = {
    dashboard: 'Dashboard',
    products: 'Produtos',
    categories: 'Categorias',
    orders: 'Pedidos',
    cupons: 'Cupons',
    reembolsos: 'Reembolsos',
    leads: 'Leads',
    comunicacao: 'Comunicação',
    mensagens: 'Mensagens',
    admins: 'Administradores',
    integracoes: 'Integrações',
    settings: 'Configurações',
    embed: 'Embed / iFrame',
    perfil: 'Meu Perfil',
}

const ALL_MODULES = Object.keys(MODULE_LABELS)

interface Admin {
    id: string; name: string; email: string; role: string; permissions: string[]; createdAt: string
}

export default function AdminAdminsPage() {
    const [admins, setAdmins] = useState<Admin[]>([])
    const [loading, setLoading] = useState(true)
    const [callerRole, setCallerRole] = useState<string>('admin')
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState({ name: '', email: '', password: '' })
    const [saving, setSaving] = useState(false)
    const [resetTarget, setResetTarget] = useState<Admin | null>(null)
    const [newPwd, setNewPwd] = useState('')
    const [permTarget, setPermTarget] = useState<Admin | null>(null)
    const [permState, setPermState] = useState<string[]>([])

    async function load() {
        setLoading(true)
        const r = await fetch('/api/admin/admins')
        const d = await r.json()
        setAdmins(d.admins || [])
        setCallerRole(d.callerRole || 'admin')
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
        const d = await r.json()
        if (r.ok) { toast.success('Admin removido.'); load() }
        else toast.error(d.error || 'Erro ao remover.')
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

    function openPermissions(admin: Admin) {
        setPermTarget(admin)
        setPermState([...admin.permissions])
    }

    function togglePerm(module: string) {
        setPermState(prev =>
            prev.includes(module) ? prev.filter(m => m !== module) : [...prev, module]
        )
    }

    async function savePermissions() {
        if (!permTarget) return
        const r = await fetch(`/api/admin/admins/${permTarget.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ permissions: permState }),
        })
        if (r.ok) {
            toast.success('Permissões atualizadas!')
            setPermTarget(null)
            load()
        } else {
            const d = await r.json()
            toast.error(d.error || 'Erro ao salvar permissões.')
        }
    }

    const isSuperAdmin = callerRole === 'superadmin'

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Administradores</h1>
                    <span className="badge badge-blue">{admins.length}</span>
                </div>
                {isSuperAdmin && (
                    <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                        <Plus size={16} /> Novo Admin
                    </button>
                )}
            </div>

            {showForm && isSuperAdmin && (
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

            {permTarget && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div className="card fade-in" style={{ maxWidth: 480, width: '100%' }}>
                        <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Permissões</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: 20, fontSize: '0.88rem' }}>
                            Admin: <strong>{permTarget.name}</strong> ({permTarget.email})
                        </p>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                            <button type="button" className="btn btn-secondary" style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                                onClick={() => setPermState([...ALL_MODULES])}>
                                Ativar Tudo
                            </button>
                            <button type="button" className="btn btn-secondary" style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                                onClick={() => setPermState(['dashboard', 'perfil'])}>
                                Mínimo
                            </button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
                            {ALL_MODULES.map(mod => {
                                const active = permState.includes(mod)
                                return (
                                    <button key={mod} type="button" onClick={() => togglePerm(mod)} style={{
                                        display: 'flex', alignItems: 'center', gap: 8,
                                        padding: '10px 12px', borderRadius: 8,
                                        border: `1px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
                                        background: active ? 'rgba(99,102,241,0.1)' : 'transparent',
                                        color: active ? 'var(--text)' : 'var(--text-muted)',
                                        cursor: 'pointer', fontSize: '0.85rem', fontWeight: active ? 600 : 400,
                                        transition: 'all 0.15s',
                                    }}>
                                        {active ? <ToggleRight size={18} color="var(--primary)" /> : <ToggleLeft size={18} />}
                                        {MODULE_LABELS[mod]}
                                    </button>
                                )
                            })}
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button type="button" className="btn btn-primary" onClick={savePermissions}>Salvar Permissões</button>
                            <button type="button" className="btn btn-secondary" onClick={() => setPermTarget(null)}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: 40, textAlign: 'center' }}><span className="spinner" /></div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                {['Admin', 'E-mail', 'Tipo', 'Desde', ...(isSuperAdmin ? ['Ações'] : [])].map(h => (
                                    <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {admins.map(admin => (
                                <tr key={admin.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '14px 20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{
                                                width: 36, height: 36, borderRadius: '50%',
                                                background: admin.role === 'superadmin' ? 'linear-gradient(135deg,#f59e0b,#ef4444)' : 'linear-gradient(135deg,#6366f1,#a855f7)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}>
                                                {admin.role === 'superadmin' ? <Crown size={16} color="white" /> : <Shield size={16} color="white" />}
                                            </div>
                                            <span style={{ fontWeight: 600 }}>{admin.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '14px 20px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>{admin.email}</td>
                                    <td style={{ padding: '14px 20px' }}>
                                        {admin.role === 'superadmin' ? (
                                            <span className="badge" style={{ background: 'linear-gradient(135deg,#f59e0b,#ef4444)', color: 'white', fontSize: '0.72rem' }}>Super Admin</span>
                                        ) : (
                                            <span className="badge badge-blue" style={{ fontSize: '0.72rem' }}>Admin</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '14px 20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                        {new Date(admin.createdAt).toLocaleDateString('pt-BR')}
                                    </td>
                                    {isSuperAdmin && (
                                        <td style={{ padding: '14px 20px' }}>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                {admin.role !== 'superadmin' && (
                                                    <button onClick={() => openPermissions(admin)} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem' }}>
                                                        <Shield size={14} /> Permissões
                                                    </button>
                                                )}
                                                <button onClick={() => setResetTarget(admin)} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem' }}>
                                                    <KeyRound size={14} /> Senha
                                                </button>
                                                {admin.role !== 'superadmin' && (
                                                    <button onClick={() => handleDelete(admin.id, admin.name)} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'transparent', color: 'var(--error)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem' }}>
                                                        <Trash2 size={14} /> Remover
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {admins.length === 0 && (
                                <tr>
                                    <td colSpan={5} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Nenhum administrador cadastrado.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
