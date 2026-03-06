'use client'

import { useState, useEffect, useCallback } from 'react'
import { Save, RefreshCw, Wifi, WifiOff, Loader2, MessageSquare, Smartphone } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
    settings: Record<string, string>
    set: (key: string, value: string) => void
    save: (keys: string[]) => Promise<void>
    saving: boolean
}

type ConnState = 'unconfigured' | 'open' | 'close' | 'connecting' | 'error' | 'loading' | 'unknown'

const SETTINGS_KEYS = ['evolution_api_url', 'evolution_api_key', 'evolution_instance_name']

export default function WhatsAppTab({ settings, set, save, saving }: Props) {
    const [connState, setConnState] = useState<ConnState>('loading')
    const [qrSrc, setQrSrc] = useState<string | null>(null)
    const [qrLoading, setQrLoading] = useState(false)
    const [qrError, setQrError] = useState<string | null>(null)
    const [disconnecting, setDisconnecting] = useState(false)
    const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null)

    const checkStatus = useCallback(async (quiet = false) => {
        try {
            const res = await fetch('/api/admin/whatsapp/status')
            const data = await res.json()
            setConnState(data.state as ConnState)
            if (data.state === 'open') {
                setQrSrc(null)
                setQrError(null)
            }
            return data.state as ConnState
        } catch {
            if (!quiet) setConnState('error')
            return 'error'
        }
    }, [])

    useEffect(() => {
        checkStatus()
    }, [checkStatus])

    useEffect(() => {
        if (connState === 'open' && pollInterval) {
            clearInterval(pollInterval)
            setPollInterval(null)
            toast.success('WhatsApp conectado!')
        }
    }, [connState, pollInterval])

    function stopPolling() {
        if (pollInterval) {
            clearInterval(pollInterval)
            setPollInterval(null)
        }
    }

    async function loadQrCode() {
        setQrLoading(true)
        setQrError(null)
        setQrSrc(null)
        stopPolling()

        try {
            const res = await fetch('/api/admin/whatsapp/qrcode')
            const data = await res.json()

            if (!res.ok || data.error) {
                setQrError(data.error || 'Erro ao obter QR Code')
                setQrLoading(false)
                return
            }

            setQrSrc(data.src)
            setQrLoading(false)

            const interval = setInterval(async () => {
                const state = await checkStatus(true)
                if (state === 'open') clearInterval(interval)
            }, 3000)
            setPollInterval(interval)
        } catch (err: any) {
            setQrError(err.message || 'Erro ao carregar QR Code')
            setQrLoading(false)
        }
    }

    async function disconnect() {
        if (!confirm('Desconectar o WhatsApp desta instância?')) return
        setDisconnecting(true)
        stopPolling()
        try {
            const res = await fetch('/api/admin/whatsapp/disconnect', { method: 'POST' })
            const data = await res.json()
            if (!res.ok) { toast.error(data.error || 'Erro ao desconectar'); return }
            toast.success('WhatsApp desconectado.')
            setConnState('close')
            setQrSrc(null)
        } catch { toast.error('Erro ao desconectar.') }
        finally { setDisconnecting(false) }
    }

    async function handleSave() {
        await save(SETTINGS_KEYS)
        setQrSrc(null)
        setQrError(null)
        setTimeout(() => checkStatus(), 500)
    }

    const isConfigured = !!(settings.evolution_api_url && settings.evolution_api_key && settings.evolution_instance_name)

    const stateLabel: Record<ConnState, { label: string; color: string; icon: React.ReactNode }> = {
        open: { label: 'Conectado', color: '#22c55e', icon: <Wifi size={16} /> },
        close: { label: 'Desconectado', color: '#ef4444', icon: <WifiOff size={16} /> },
        connecting: { label: 'Conectando...', color: '#eab308', icon: <Loader2 size={16} className="spin" /> },
        error: { label: 'Erro de conexão', color: '#ef4444', icon: <WifiOff size={16} /> },
        loading: { label: 'Verificando...', color: 'var(--text-muted)', icon: <Loader2 size={16} /> },
        unconfigured: { label: 'Não configurado', color: 'var(--text-muted)', icon: <Smartphone size={16} /> },
        unknown: { label: 'Estado desconhecido', color: '#eab308', icon: <WifiOff size={16} /> },
    }

    const st = stateLabel[connState] ?? stateLabel.unknown

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.2)', borderRadius: 10 }}>
                <MessageSquare size={20} color="#25d366" />
                <div>
                    <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>Integração WhatsApp via Evolution API</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        Conecte seu número para enviar notificações automáticas de pedidos aos clientes.
                    </p>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, border: `1px solid ${st.color}30`, background: `${st.color}10` }}>
                <span style={{ color: st.color, display: 'flex', alignItems: 'center' }}>{st.icon}</span>
                <span style={{ fontWeight: 600, fontSize: '0.88rem', color: st.color }}>{st.label}</span>
                {isConfigured && (
                    <button
                        onClick={() => checkStatus()}
                        style={{ marginLeft: 'auto', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem' }}
                    >
                        <RefreshCw size={13} /> Atualizar
                    </button>
                )}
            </div>

            <div className="form-group">
                <label className="form-label">URL da Evolution API</label>
                <input
                    className="input"
                    placeholder="https://evolution.suavps.com.br"
                    value={settings.evolution_api_url || ''}
                    onChange={e => set('evolution_api_url', e.target.value)}
                />
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 6 }}>
                    URL base onde sua Evolution API está rodando (sem barra no final).
                </p>
            </div>

            <div className="form-group">
                <label className="form-label">API Key (Global)</label>
                <input
                    className="input"
                    type="password"
                    placeholder="••••••••••••••••"
                    value={settings.evolution_api_key || ''}
                    onChange={e => set('evolution_api_key', e.target.value)}
                />
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 6 }}>
                    Chave global definida na sua instalação da Evolution API.
                </p>
            </div>

            <div className="form-group">
                <label className="form-label">Nome da Instância</label>
                <input
                    className="input"
                    placeholder="loja-giovana"
                    value={settings.evolution_instance_name || ''}
                    onChange={e => set('evolution_instance_name', e.target.value)}
                />
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 6 }}>
                    Nome da instância já criada na Evolution API.
                </p>
            </div>

            <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Save size={16} />
                {saving ? 'Salvando...' : 'Salvar Configurações'}
            </button>

            {isConfigured && (
                <>
                    <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />

                    <div>
                        <p style={{ fontWeight: 700, marginBottom: 14, fontSize: '0.95rem' }}>Conexão do WhatsApp</p>

                        {connState === 'open' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div style={{ padding: '14px 18px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 10, fontSize: '0.88rem', color: '#22c55e', fontWeight: 600 }}>
                                    ✓ WhatsApp conectado e pronto para enviar mensagens.
                                </div>
                                <button
                                    onClick={disconnect}
                                    disabled={disconnecting}
                                    className="btn"
                                    style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: 'transparent', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', cursor: 'pointer', borderRadius: 8, fontWeight: 600 }}
                                >
                                    <WifiOff size={15} />
                                    {disconnecting ? 'Desconectando...' : 'Desconectar'}
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                                    Clique em <strong>Gerar QR Code</strong> e escaneie com o WhatsApp no celular<br />
                                    (Menu → Aparelhos conectados → Conectar aparelho).
                                </p>

                                <button
                                    onClick={loadQrCode}
                                    disabled={qrLoading}
                                    className="btn btn-primary"
                                    style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 8 }}
                                >
                                    {qrLoading
                                        ? <><Loader2 size={16} /> Aguarde...</>
                                        : <><RefreshCw size={16} /> {qrSrc ? 'Atualizar QR Code' : 'Gerar QR Code'}</>}
                                </button>

                                {qrError && (
                                    <div style={{ padding: '12px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#ef4444', fontSize: '0.85rem' }}>
                                        {qrError}
                                    </div>
                                )}

                                {qrSrc && (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                                        <div style={{ padding: 16, background: 'white', borderRadius: 12, display: 'inline-block', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>
                                            <img src={qrSrc} alt="QR Code WhatsApp" style={{ width: 220, height: 220, display: 'block' }} />
                                        </div>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                                            Aguardando leitura do QR Code... verificando a cada 3 segundos.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}
