'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Save } from 'lucide-react'

const F = ({ label, k, type = 'text', placeholder = '', help = '', settings, set }: { label: string; k: string; type?: string; placeholder?: string; help?: string; settings: any; set: any }) => (
    <div className="form-group">
        <label className="form-label">{label}</label>
        <input className="input" type={type} placeholder={placeholder} value={settings[k] || ''} onChange={e => set(k, e.target.value)} />
        {help && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 6 }}>{help}</p>}
    </div>
)

export default function TrackingPage() {
    const [settings, setSettings] = useState<Record<string, string>>({})
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetch('/api/admin/settings').then(r => r.json()).then(setSettings)
    }, [])

    function set(key: string, value: string) {
        setSettings(p => ({ ...p, [key]: value }))
    }

    async function save() {
        setSaving(true)
        await fetch('/api/admin/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fb_pixel_id: settings.fb_pixel_id || '',
                fb_capi_token: settings.fb_capi_token || '',
                fb_pixel_enabled: settings.fb_pixel_enabled || '',
                google_ads_id: settings.google_ads_id || '',
                google_ads_label: settings.google_ads_label || '',
                google_ads_enabled: settings.google_ads_enabled || '',
            }),
        })
        setSaving(false)
        toast.success('Configurações de tracking salvas!')
    }

    return (
        <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 28 }}>Tracking</h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 700 }}>
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <p style={{ fontWeight: 700, marginBottom: 4 }}>Meta Pixel + Conversions API (CAPI)</p>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 14 }}>
                        O Pixel rastreia eventos no navegador. O CAPI envia os mesmos eventos pelo servidor com dados adicionais (IP, email, telefone, endereço) para nota máxima de correspondência no Gerenciador de Eventos.
                    </p>
                    <F settings={settings} set={set} label="Pixel ID" k="fb_pixel_id" placeholder="123456789012345" />
                    <F settings={settings} set={set} label="Access Token (CAPI server-side)" k="fb_capi_token" type="password" />
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                        <input type="checkbox" checked={settings.fb_pixel_enabled === 'true'} onChange={e => set('fb_pixel_enabled', e.target.checked ? 'true' : 'false')} />
                        <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Habilitar Meta Pixel + CAPI</span>
                    </label>
                    <div style={{ marginTop: 14, padding: 12, background: 'var(--bg)', borderRadius: 6, border: '1px solid var(--border)' }}>
                        <p style={{ fontWeight: 700, fontSize: '0.8rem', marginBottom: 8, color: 'var(--primary)' }}>Eventos enviados (Browser + Servidor)</p>
                        {[
                            { ev: 'PageView', desc: 'Todas as páginas visitadas' },
                            { ev: 'ViewContent', desc: 'Visualizou página de produto' },
                            { ev: 'AddToCart', desc: 'Adicionou produto ao carrinho' },
                            { ev: 'InitiateCheckout', desc: 'Entrou no checkout' },
                            { ev: 'Purchase', desc: 'Compra confirmada (valor, produtos, pedido)' },
                        ].map(e => (
                            <div key={e.ev} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                <span style={{ fontSize: '0.72rem', fontWeight: 700, background: 'rgba(59,130,246,0.15)', color: '#3b82f6', padding: '1px 6px', borderRadius: 4, fontFamily: 'monospace' }}>{e.ev}</span>
                                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{e.desc}</span>
                            </div>
                        ))}
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.5 }}>
                            Todos os eventos usam <strong>event_id</strong> para deduplicação (Browser + CAPI não duplicam). O CAPI envia: IP, User-Agent, email, telefone, nome, cidade, estado, CEP, país (tudo hasheado SHA-256), cookies _fbc/_fbp e fbclid.
                        </p>
                    </div>
                </div>

                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <p style={{ fontWeight: 700, marginBottom: 4 }}>Google Ads + Enhanced Conversions</p>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 14 }}>
                        Rastreia eventos de e-commerce e envia dados do usuário para melhorar a correspondência de conversões.
                    </p>
                    <F settings={settings} set={set} label="Google Ads ID" k="google_ads_id" placeholder="AW-XXXXXXXXX" />
                    <F settings={settings} set={set} label="Conversion Label (apenas Purchase)" k="google_ads_label" placeholder="AbCdEfGhIj" />
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                        <input type="checkbox" checked={settings.google_ads_enabled === 'true'} onChange={e => set('google_ads_enabled', e.target.checked ? 'true' : 'false')} />
                        <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Habilitar Google Ads</span>
                    </label>
                    <div style={{ marginTop: 14, padding: 12, background: 'var(--bg)', borderRadius: 6, border: '1px solid var(--border)' }}>
                        <p style={{ fontWeight: 700, fontSize: '0.8rem', marginBottom: 8, color: '#22c55e' }}>Eventos enviados</p>
                        {[
                            { ev: 'page_view', desc: 'Todas as páginas visitadas', label: false },
                            { ev: 'view_item', desc: 'Visualizou página de produto', label: false },
                            { ev: 'add_to_cart', desc: 'Adicionou produto ao carrinho', label: false },
                            { ev: 'begin_checkout', desc: 'Entrou no checkout (com dados do usuário)', label: false },
                            { ev: 'purchase', desc: 'Compra confirmada (evento GA4 padrão)', label: false },
                            { ev: 'conversion', desc: 'Conversão Google Ads (usa o Label acima)', label: true },
                        ].map(e => (
                            <div key={e.ev} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                <span style={{ fontSize: '0.72rem', fontWeight: 700, background: e.label ? 'rgba(234,179,8,0.15)' : 'rgba(34,197,94,0.15)', color: e.label ? '#eab308' : '#22c55e', padding: '1px 6px', borderRadius: 4, fontFamily: 'monospace' }}>{e.ev}</span>
                                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{e.desc}</span>
                                {e.label && <span style={{ fontSize: '0.68rem', background: 'rgba(234,179,8,0.15)', color: '#eab308', padding: '1px 5px', borderRadius: 3, fontWeight: 600 }}>precisa do Label</span>}
                            </div>
                        ))}
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.5 }}>
                            Os eventos padrão (page_view até purchase) <strong>não precisam de Label</strong> — são rastreados automaticamente pelo Google. Somente o evento <strong>conversion</strong> (usado para otimizar campanhas de Google Ads) precisa do Label configurado acima. Enhanced Conversions envia email, telefone, nome e endereço do cliente para melhorar a taxa de correspondência.
                        </p>
                    </div>
                </div>

                <button className="btn btn-primary" onClick={save} disabled={saving}>
                    <Save size={16} />{saving ? 'Salvando...' : 'Salvar'}
                </button>
            </div>
        </div>
    )
}
