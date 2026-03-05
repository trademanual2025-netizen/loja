'use client'

import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { Camera, User, Lock, Upload, Eye, EyeOff, Check } from 'lucide-react'

interface AdminUser { id: string; name: string; email: string; avatarUrl?: string | null }

function Avatar({ src, initials }: { src?: string | null; initials: string }) {
    if (src) return <img src={src} alt="avatar" style={{ width: 96, height: 96, borderRadius: 20, objectFit: 'cover', display: 'block' }} />
    return (
        <div style={{
            width: 96, height: 96, borderRadius: 20,
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.8rem', fontWeight: 800, color: 'white', letterSpacing: '0.02em',
        }}>{initials}</div>
    )
}

export default function AdminPerfilPage() {
    const [admin, setAdmin] = useState<AdminUser | null>(null)
    const [loading, setLoading] = useState(true)

    const [nameVal, setNameVal] = useState('')
    const [nameSaving, setNameSaving] = useState(false)

    const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
    const [avatarUploading, setAvatarUploading] = useState(false)
    const [avatarSaving, setAvatarSaving] = useState(false)
    const fileRef = useRef<HTMLInputElement>(null)

    const [pwdForm, setPwdForm] = useState({ current: '', newPwd: '', confirm: '' })
    const [showCurrent, setShowCurrent] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [pwdSaving, setPwdSaving] = useState(false)

    useEffect(() => {
        fetch('/api/admin/me')
            .then(r => r.ok ? r.json() : null)
            .then(d => {
                if (d) {
                    setAdmin(d)
                    setNameVal(d.name)
                    setAvatarPreview(d.avatarUrl || null)
                }
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    const initials = admin?.name
        ? admin.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
        : 'A'

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        if (file.size > 5 * 1024 * 1024) { toast.error('Imagem muito grande. Máximo 5MB.'); return }
        setAvatarUploading(true)
        const fd = new FormData()
        fd.append('file', file)
        const r = await fetch('/api/admin/upload', { method: 'POST', body: fd })
        const d = await r.json()
        if (!r.ok) { toast.error(d.error || 'Erro ao enviar imagem.'); setAvatarUploading(false); return }
        setAvatarPreview(d.url)
        setAvatarUploading(false)
    }

    async function handleSaveAvatar() {
        setAvatarSaving(true)
        const r = await fetch('/api/admin/me', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ avatarUrl: avatarPreview }),
        })
        const d = await r.json()
        if (!r.ok) { toast.error(d.error || 'Erro ao salvar.'); setAvatarSaving(false); return }
        setAdmin(d)
        setAvatarPreview(d.avatarUrl || null)
        toast.success('Foto atualizada!')
        setAvatarSaving(false)
    }

    async function handleRemoveAvatar() {
        setAvatarSaving(true)
        const r = await fetch('/api/admin/me', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ avatarUrl: null }),
        })
        const d = await r.json()
        if (!r.ok) { toast.error(d.error || 'Erro.'); setAvatarSaving(false); return }
        setAdmin(d)
        setAvatarPreview(null)
        toast.success('Foto removida.')
        setAvatarSaving(false)
    }

    async function handleSaveName(e: React.FormEvent) {
        e.preventDefault()
        if (!nameVal.trim()) { toast.error('Nome não pode ser vazio.'); return }
        setNameSaving(true)
        const r = await fetch('/api/admin/me', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: nameVal }),
        })
        const d = await r.json()
        if (!r.ok) { toast.error(d.error || 'Erro ao salvar.'); setNameSaving(false); return }
        setAdmin(d)
        toast.success('Nome atualizado!')
        setNameSaving(false)
    }

    async function handleSavePwd(e: React.FormEvent) {
        e.preventDefault()
        if (pwdForm.newPwd !== pwdForm.confirm) { toast.error('A confirmação não confere com a nova senha.'); return }
        if (pwdForm.newPwd.length < 6) { toast.error('Nova senha deve ter no mínimo 6 caracteres.'); return }
        setPwdSaving(true)
        const r = await fetch('/api/admin/me', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPassword: pwdForm.current, newPassword: pwdForm.newPwd }),
        })
        const d = await r.json()
        if (!r.ok) { toast.error(d.error || 'Erro ao alterar senha.'); setPwdSaving(false); return }
        toast.success('Senha alterada com sucesso!')
        setPwdForm({ current: '', newPwd: '', confirm: '' })
        setPwdSaving(false)
    }

    const avatarChanged = avatarPreview !== (admin?.avatarUrl || null)

    if (loading) return <div style={{ color: 'var(--text-muted)', padding: 40 }}>Carregando...</div>

    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '10px 14px', borderRadius: 10,
        border: '1px solid var(--border)', background: 'var(--bg)',
        color: 'var(--text)', fontSize: '0.92rem', outline: 'none',
        boxSizing: 'border-box',
    }

    const labelStyle: React.CSSProperties = {
        display: 'block', fontSize: '0.8rem', fontWeight: 600,
        color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase',
    }

    const btnPrimary: React.CSSProperties = {
        display: 'inline-flex', alignItems: 'center', gap: 7,
        padding: '10px 20px', borderRadius: 10, border: 'none',
        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
        color: 'white', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer',
    }

    const btnGhost: React.CSSProperties = {
        display: 'inline-flex', alignItems: 'center', gap: 7,
        padding: '10px 16px', borderRadius: 10, border: '1px solid var(--border)',
        background: 'transparent', color: 'var(--text-muted)', fontWeight: 600,
        fontSize: '0.88rem', cursor: 'pointer',
    }

    return (
        <div style={{ maxWidth: 560 }}>
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--text)', margin: 0 }}>Meu Perfil</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '4px 0 0' }}>Gerencie suas informações de administrador</p>
            </div>

            {/* ── FOTO DE PERFIL ── */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Camera size={16} color="#6366f1" />
                    </div>
                    <div>
                        <h2 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)', margin: 0 }}>Foto de perfil</h2>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>JPG, PNG ou WEBP — máximo 5MB</p>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                    {/* Preview */}
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                        <Avatar src={avatarPreview} initials={initials} />
                        <button onClick={() => fileRef.current?.click()} style={{
                            position: 'absolute', bottom: -6, right: -6,
                            width: 30, height: 30, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                            border: '2px solid var(--bg-card)', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
                        }}>
                            <Camera size={13} />
                        </button>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                        <button onClick={() => fileRef.current?.click()} disabled={avatarUploading} style={btnGhost}>
                            <Upload size={14} /> {avatarUploading ? 'Enviando...' : 'Escolher imagem'}
                        </button>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button
                                onClick={handleSaveAvatar}
                                disabled={!avatarChanged || avatarSaving || avatarUploading}
                                style={{ ...btnPrimary, opacity: (!avatarChanged || avatarSaving) ? 0.5 : 1, cursor: (!avatarChanged || avatarSaving) ? 'not-allowed' : 'pointer' }}>
                                <Check size={14} /> {avatarSaving ? 'Salvando...' : 'Salvar foto'}
                            </button>
                            {(avatarPreview || admin?.avatarUrl) && (
                                <button onClick={handleRemoveAvatar} disabled={avatarSaving} style={{ ...btnGhost, color: 'var(--error)', borderColor: 'var(--error)' }}>
                                    Remover
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── NOME ── */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={16} color="#6366f1" />
                    </div>
                    <div>
                        <h2 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)', margin: 0 }}>Informações pessoais</h2>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>Altere seu nome de exibição</p>
                    </div>
                </div>

                <form onSubmit={handleSaveName}>
                    <div style={{ marginBottom: 14 }}>
                        <label style={labelStyle}>Nome</label>
                        <input
                            style={inputStyle}
                            value={nameVal}
                            onChange={e => setNameVal(e.target.value)}
                            placeholder="Seu nome"
                        />
                    </div>
                    <div style={{ marginBottom: 14 }}>
                        <label style={labelStyle}>E-mail</label>
                        <input style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }} value={admin?.email || ''} readOnly />
                        <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: 4 }}>O e-mail não pode ser alterado por aqui.</p>
                    </div>
                    <button type="submit" disabled={nameSaving || nameVal === admin?.name} style={{ ...btnPrimary, opacity: (nameSaving || nameVal === admin?.name) ? 0.5 : 1, cursor: (nameSaving || nameVal === admin?.name) ? 'not-allowed' : 'pointer' }}>
                        <Check size={14} /> {nameSaving ? 'Salvando...' : 'Salvar nome'}
                    </button>
                </form>
            </div>

            {/* ── SENHA ── */}
            <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Lock size={16} color="#6366f1" />
                    </div>
                    <div>
                        <h2 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)', margin: 0 }}>Alterar senha</h2>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>Mínimo de 6 caracteres</p>
                    </div>
                </div>

                <form onSubmit={handleSavePwd} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                        <label style={labelStyle}>Senha atual</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                style={{ ...inputStyle, paddingRight: 42 }}
                                type={showCurrent ? 'text' : 'password'}
                                value={pwdForm.current}
                                onChange={e => setPwdForm(f => ({ ...f, current: e.target.value }))}
                                placeholder="••••••••"
                            />
                            <button type="button" onClick={() => setShowCurrent(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label style={labelStyle}>Nova senha</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                style={{ ...inputStyle, paddingRight: 42 }}
                                type={showNew ? 'text' : 'password'}
                                value={pwdForm.newPwd}
                                onChange={e => setPwdForm(f => ({ ...f, newPwd: e.target.value }))}
                                placeholder="••••••••"
                            />
                            <button type="button" onClick={() => setShowNew(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label style={labelStyle}>Confirmar nova senha</label>
                        <input
                            style={{ ...inputStyle, borderColor: pwdForm.confirm && pwdForm.confirm !== pwdForm.newPwd ? 'var(--error)' : undefined }}
                            type="password"
                            value={pwdForm.confirm}
                            onChange={e => setPwdForm(f => ({ ...f, confirm: e.target.value }))}
                            placeholder="••••••••"
                        />
                        {pwdForm.confirm && pwdForm.confirm !== pwdForm.newPwd && (
                            <p style={{ fontSize: '0.75rem', color: 'var(--error)', marginTop: 4 }}>As senhas não conferem.</p>
                        )}
                    </div>
                    <div>
                        <button type="submit" disabled={pwdSaving || !pwdForm.current || !pwdForm.newPwd || !pwdForm.confirm} style={{ ...btnPrimary, opacity: (pwdSaving || !pwdForm.current || !pwdForm.newPwd || !pwdForm.confirm) ? 0.5 : 1, cursor: (pwdSaving || !pwdForm.current || !pwdForm.newPwd || !pwdForm.confirm) ? 'not-allowed' : 'pointer' }}>
                            <Lock size={14} /> {pwdSaving ? 'Alterando...' : 'Alterar senha'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
