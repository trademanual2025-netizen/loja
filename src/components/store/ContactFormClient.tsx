'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Send, CheckCircle } from 'lucide-react'
import type { Dictionary } from '@/lib/i18n'

interface Props {
    whatsappLink?: string | null
    phone?: string | null
    email?: string | null
    dict: Dictionary
}

export function ContactFormClient({ whatsappLink, dict }: Props) {
    const c = dict.contactPage
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
    const [hp, setHp] = useState('')
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!form.name || !form.email || !form.message) {
            toast.error(c.requiredFields)
            return
        }
        setLoading(true)
        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, _hp: hp }),
            })
            if (res.ok) {
                setSent(true)
            } else if (res.status === 429) {
                toast.error('Muitas tentativas. Aguarde alguns minutos e tente novamente.')
            } else {
                toast.error(c.sendError)
            }
        } catch {
            toast.error(c.connError)
        } finally {
            setLoading(false)
        }
    }

    if (sent) {
        return (
            <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(200,160,80,0.12)', border: '1px solid rgba(200,160,80,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <CheckCircle size={28} color="rgba(200,160,80,0.9)" />
                </div>
                <h3 style={{ color: 'var(--text-title)', fontWeight: 300, fontSize: '1.4rem', letterSpacing: '0.06em', marginBottom: 12 }}>{c.successTitle}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: 28 }}>
                    {c.successMsg}
                </p>
                {whatsappLink && (
                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer" style={{
                        display: 'inline-flex', alignItems: 'center', gap: 10,
                        background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.3)',
                        borderRadius: 8, padding: '12px 24px', color: '#25D366', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600,
                    }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.532 5.856L.072 23.928l6.228-1.433A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.693-.516-5.228-1.414l-.374-.222-3.896.896.93-3.791-.244-.39A9.959 9.959 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                        {c.successWhatsapp}
                    </a>
                )}
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* honeypot anti-spam: invisível para humanos, bots preenchem */}
            <input
                type="text"
                name="website"
                value={hp}
                onChange={e => setHp(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden', opacity: 0 }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ color: 'var(--text-muted)', fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>{c.formName} *</label>
                    <input
                        className="input"
                        placeholder={c.formNamePh}
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        required
                    />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ color: 'var(--text-muted)', fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>{c.formEmail} *</label>
                    <input
                        className="input"
                        type="email"
                        placeholder={c.formEmailPh}
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        required
                    />
                </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ color: 'var(--text-muted)', fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>{c.formSubject}</label>
                <input
                    className="input"
                    placeholder={c.formSubjectPh}
                    value={form.subject}
                    onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ color: 'var(--text-muted)', fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>{c.formMessage} *</label>
                <textarea
                    className="input"
                    placeholder={c.formMessagePh}
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    rows={5}
                    style={{ resize: 'vertical', fontFamily: 'inherit' }}
                    required
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    background: loading ? 'rgba(200,160,80,0.5)' : 'rgba(200,160,80,0.85)',
                    color: '#0d0a06',
                    border: 'none',
                    borderRadius: 8,
                    padding: '14px 32px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    marginTop: 4,
                }}
            >
                {loading ? <span className="spinner" style={{ borderColor: '#0d0a06', borderRightColor: 'transparent', width: 16, height: 16 }} /> : <Send size={15} />}
                {loading ? c.formSending : c.formSubmit}
            </button>

            {whatsappLink && (
                <div style={{ textAlign: 'center', paddingTop: 8 }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{c.orWhatsapp}{' '}</span>
                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer" style={{ color: '#25D366', fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none' }}>
                        {c.callWhatsapp}
                    </a>
                </div>
            )}
        </form>
    )
}
