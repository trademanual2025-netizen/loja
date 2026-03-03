'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import Link from 'next/link'
import { getCookie } from 'cookies-next'
import { dictionaries, Locale, defaultLocale } from '@/lib/i18n'

type Mode = 'login' | 'register'

interface LoginForm { email: string; password: string }
interface RegisterForm { name: string; email: string; phone: string; cpf: string; password: string; confirm: string }

import { Suspense } from 'react'

function AuthContent() {
    const [mode, setMode] = useState<Mode>('login')
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    const redirect = searchParams.get('redirect') || '/'

    const [dict, setDict] = useState(dictionaries[defaultLocale])

    useEffect(() => {
        const localeCookie = getCookie('NEXT_LOCALE') as Locale
        if (localeCookie && dictionaries[localeCookie]) {
            setDict(dictionaries[localeCookie])
        }
    }, [])

    const loginForm = useForm<LoginForm>()
    const registerForm = useForm<RegisterForm>()

    async function handleLogin(data: LoginForm) {
        setLoading(true)
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
        const json = await res.json()
        setLoading(false)
        if (!res.ok) { toast.error(json.error); return }
        toast.success(dict.auth.welcome)
        router.push(redirect)
        router.refresh()
    }

    async function handleRegister(data: RegisterForm) {
        if (data.password !== data.confirm) { toast.error(dict.auth.passwordMismatch); return }
        setLoading(true)
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
        const json = await res.json()
        setLoading(false)
        if (!res.ok) { toast.error(json.error); return }
        // Auto login após cadastro
        await fetch('/api/auth/login', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: data.email, password: data.password }),
        })
        toast.success(dict.auth.registered)
        router.push(redirect)
        router.refresh()
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <div className="card fade-in" style={{ width: '100%', maxWidth: 440 }}>
                {/* Tabs */}
                <div style={{ display: 'flex', marginBottom: 24, borderBottom: '1px solid var(--border)' }}>
                    {(['login', 'register'] as Mode[]).map((m) => (
                        <button key={m} onClick={() => setMode(m)}
                            style={{ flex: 1, padding: '12px', background: 'none', border: 'none', color: mode === m ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', borderBottom: mode === m ? '2px solid var(--primary)' : '2px solid transparent', transition: 'color 0.2s', fontSize: '0.95rem' }}>
                            {m === 'login' ? dict.auth.loginTitle || 'Entrar' : dict.auth.registerBtn}
                        </button>
                    ))}
                </div>

                {/* Login */}
                {mode === 'login' && (
                    <form onSubmit={loginForm.handleSubmit(handleLogin)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div className="form-group">
                            <label className="form-label">{dict.auth.email}</label>
                            <input className="input" type="email" {...loginForm.register('email', { required: true })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">{dict.auth.password}</label>
                            <input className="input" type="password" {...loginForm.register('password', { required: true })} />
                        </div>
                        <button className="btn btn-primary btn-full" disabled={loading}>
                            {loading ? <span className="spinner" /> : dict.auth.loginBtn}
                        </button>
                    </form>
                )}

                {/* Register */}
                {mode === 'register' && (
                    <form onSubmit={registerForm.handleSubmit(handleRegister)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div className="form-group">
                            <label className="form-label">{dict.auth.name} *</label>
                            <input className="input" {...registerForm.register('name', { required: true })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">{dict.auth.email} *</label>
                            <input className="input" type="email" {...registerForm.register('email', { required: true })} />
                        </div>
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">{dict.auth.phone}</label>
                                <input className="input" placeholder="(11) 99999-0000" {...registerForm.register('phone')} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">{dict.auth.cpf}</label>
                                <input className="input" placeholder="000.000.000-00" {...registerForm.register('cpf')} />
                            </div>
                        </div>
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">{dict.auth.password} *</label>
                                <input className="input" type="password" {...registerForm.register('password', { required: true, minLength: 6 })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">{dict.auth.password} *</label>
                                <input className="input" type="password" {...registerForm.register('confirm', { required: true })} />
                            </div>
                        </div>
                        <button className="btn btn-primary btn-full" disabled={loading}>
                            {loading ? <span className="spinner" /> : dict.auth.registerBtn}
                        </button>
                    </form>
                )}

                <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <Link href="/loja" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{dict.auth.backToStore}</Link>
                </div>
            </div>
        </div>
    )
}

export default function AuthPage() {
    return (
        <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="spinner" /></div>}>
            <AuthContent />
        </Suspense>
    )
}

