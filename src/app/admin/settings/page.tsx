'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Save, TestTube2 } from 'lucide-react'

const TABS = ['Banco de Dados', 'Pagamentos', 'Tracking', 'Webhooks', 'Frete', 'Loja', 'SEO', 'Banner']

const ImageF = ({ label, k, help = '', settings, uploadFile }: { label: string; k: string; help?: string; settings: any; uploadFile: any }) => (
    <div className="form-group">
        <label className="form-label">{label}</label>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', background: 'var(--bg-card2)', padding: 12, borderRadius: 8, border: '1px border var(--border)' }}>
            {settings[k] ? (
                <img src={settings[k]} alt="Preview" style={{ height: 48, width: 48, objectFit: 'contain', background: '#fff', borderRadius: 6 }} />
            ) : (
                <div style={{ height: 48, width: 48, background: 'var(--bg)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center' }}>Sem img</div>
            )}
            <div style={{ flex: 1 }}>
                <input type="file" accept="image/*" className="input" onChange={e => {
                    if (e.target.files?.[0]) uploadFile(e.target.files[0], k)
                }} />
                {settings[k] && <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4, wordBreak: 'break-all' }}>URL: {settings[k].substring(0, 40)}...</p>}
            </div>
        </div>
        {help && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 6 }}>{help}</p>}
    </div>
)

const F = ({ label, k, type = 'text', placeholder = '', help = '', settings, set }: { label: string; k: string; type?: string; placeholder?: string; help?: string; settings: any; set: any }) => (
    <div className="form-group">
        <label className="form-label">{label}</label>
        {type === 'textarea' ? (
            <textarea className="input" rows={4} placeholder={placeholder} value={settings[k] || ''} onChange={e => set(k, e.target.value)} />
        ) : (
            <input className="input" type={type} placeholder={placeholder} value={settings[k] || ''} onChange={e => set(k, e.target.value)} />
        )}
        {help && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 6 }}>{help}</p>}
    </div>
)

const ColorF = ({ label, k, defaultColor, settings, set }: { label: string; k: string; defaultColor: string; settings: any; set: any }) => {
    const val = settings[k] || defaultColor
    return (
        <div className="form-group">
            <label className="form-label">{label}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                    width: 40, height: 40, borderRadius: 8, border: '1px solid var(--border)',
                    background: val, flexShrink: 0, position: 'relative', overflow: 'hidden'
                }}>
                    <input type="color" value={val} onChange={e => set(k, e.target.value)}
                        style={{ position: 'absolute', opacity: 0, inset: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
                </div>
                <input className="input" type="text" value={val} onChange={e => set(k, e.target.value)}
                    placeholder="#000000" style={{ fontFamily: 'monospace', textTransform: 'uppercase' }} />
            </div>
        </div>
    )
}

const formatCEP = (val: string) => val.replace(/\D/g, '').substring(0, 8)

type ThemeColors = {
    store_primary_color: string; store_bg_color: string; store_bg_card_color: string;
    store_text_color: string; store_text_title: string; store_btn_buy: string;
    store_btn_header: string; store_icon_cart: string;
}

const PRESET_THEMES: { name: string; colors: ThemeColors }[] = [
    { name: 'Velour Classic', colors: { store_primary_color: '#6366f1', store_bg_color: '#0a0a0f', store_bg_card_color: '#12121a', store_text_color: '#f1f1f8', store_text_title: '#ffffff', store_btn_buy: '#6366f1', store_btn_header: '#6366f1', store_icon_cart: '#f1f1f8' } },
    { name: 'Light Minimal', colors: { store_primary_color: '#111827', store_bg_color: '#fafafa', store_bg_card_color: '#ffffff', store_text_color: '#334155', store_text_title: '#0f172a', store_btn_buy: '#111827', store_btn_header: '#111827', store_icon_cart: '#111827' } },
    { name: 'Glamour Gold', colors: { store_primary_color: '#d4af37', store_bg_color: '#000000', store_bg_card_color: '#0a0a0a', store_text_color: '#fafafa', store_text_title: '#ffffff', store_btn_buy: '#d4af37', store_btn_header: '#d4af37', store_icon_cart: '#d4af37' } },
    { name: 'Nature Green', colors: { store_primary_color: '#4d7c5f', store_bg_color: '#fdfbf7', store_bg_card_color: '#ffffff', store_text_color: '#14532d', store_text_title: '#064e3b', store_btn_buy: '#4d7c5f', store_btn_header: '#4d7c5f', store_icon_cart: '#4d7c5f' } },
    { name: 'Rose Elegance', colors: { store_primary_color: '#831843', store_bg_color: '#fff5f5', store_bg_card_color: '#ffffff', store_text_color: '#4a4a4a', store_text_title: '#111827', store_btn_buy: '#831843', store_btn_header: '#831843', store_icon_cart: '#831843' } },
]

export default function AdminSettings() {
    const [tab, setTab] = useState('Banco de Dados')
    const [settings, setSettings] = useState<Record<string, string>>({})
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetch('/api/admin/settings').then(r => r.json()).then(setSettings)
    }, [])

    function set(key: string, value: string) {
        setSettings(p => ({ ...p, [key]: value }))
    }

    async function save(keys: string[]) {
        setSaving(true)
        const body: Record<string, string> = {}
        keys.forEach(k => { body[k] = settings[k] || '' })
        await fetch('/api/admin/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        })
        setSaving(false)
        toast.success('Configurações salvas!')
    }

    async function testWebhook(type: 'lead' | 'buyer') {
        const url = type === 'lead' ? settings.webhook_lead_url : settings.webhook_buyer_url
        if (!url) { toast.error('Configure a URL primeiro.'); return }
        const payload = type === 'lead'
            ? { event: 'new_lead', data: { name: 'Teste', email: 'teste@email.com', phone: '11999990000', source: 'test' } }
            : { event: 'purchase', data: { order_id: 'test-123', name: 'Teste', email: 'teste@email.com', total: 99.90, currency: 'BRL', gateway: 'test' } }
        try {
            const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
            toast.success(`Webhook disparado! Status: ${res.status}`)
        } catch { toast.error('Erro ao disparar webhook.') }
    }

    async function uploadFile(file: File, key: string) {
        setSaving(true)
        const formData = new FormData()
        formData.append('file', file)
        try {
            const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
            if (!res.ok) throw new Error()
            const { url } = await res.json()
            set(key, url)
            toast.success('Imagem carregada! Não esqueça de Salvar as alterações.')
        } catch {
            toast.error('Erro ao fazer upload da imagem.')
        }
        setSaving(false)
    }


    const formatCEP = (val: string) => val.replace(/\D/g, '').substring(0, 8)

    return (
        <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 28 }}>Configurações</h1>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 24, flexWrap: 'wrap' }}>
                {TABS.map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        style={{ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', background: tab === t ? 'var(--primary)' : 'var(--bg-card2)', color: tab === t ? 'white' : 'var(--text-muted)', transition: 'all 0.2s' }}>
                        {t}
                    </button>
                ))}
            </div>

            <div className="card" style={{ maxWidth: 680 }}>
                {/* Banco de Dados */}
                {tab === 'Banco de Dados' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ padding: 16, background: 'rgba(99,102,241,0.1)', borderRadius: 8, border: '1px solid rgba(99,102,241,0.3)', marginBottom: 4 }}>
                            <p style={{ fontWeight: 700, marginBottom: 6 }}>🗄️ Neon PostgreSQL</p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>O banco de dados está configurado via variável de ambiente <code>DATABASE_URL</code>. Esta é a <strong>única variável de ambiente obrigatória</strong> ao fazer deploy no Render.</p>
                        </div>

                        <div style={{ padding: 16, background: 'var(--bg-card2)', borderRadius: 8 }}>
                            <p style={{ fontWeight: 700, marginBottom: 12 }}>Variáveis de ambiente necessárias no Render</p>
                            {[
                                { key: 'DATABASE_URL', desc: 'String de conexão Neon (postgresql://...)' },
                                { key: 'JWT_SECRET', desc: 'Qualquer string aleatória longa para autenticação' },
                                { key: 'ADMIN_JWT_SECRET', desc: 'Outra string aleatória para o painel admin' },
                            ].map(v => (
                                <div key={v.key} style={{ marginBottom: 10, padding: 10, background: 'var(--bg)', borderRadius: 6, border: '1px solid var(--border)' }}>
                                    <code style={{ color: 'var(--primary)', fontWeight: 700 }}>{v.key}</code>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: 3 }}>{v.desc}</p>
                                </div>
                            ))}
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 8 }}>Todas as outras configurações (Mercado Pago, Stripe, Pixel, Frete, etc.) são gerenciadas pelo painel admin e salvas no banco de dados.</p>
                        </div>

                        <F settings={settings} set={set} label="DATABASE_URL (visualizar/atualizar)" k="database_url" placeholder="postgresql://usuario:senha@ep-xxx.neon.tech/neondb?sslmode=require" type="password" />
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: -8 }}>⚠️ Alterar aqui atualiza apenas a referência salva no banco. A variável de ambiente no servidor precisa ser atualizada separadamente no painel do Render.</p>
                        <button className="btn btn-primary" onClick={() => save(['database_url'])} disabled={saving}><Save size={16} />{saving ? 'Salvando...' : 'Salvar URL'}</button>
                    </div>
                )}

                {/* Pagamentos */}
                {tab === 'Pagamentos' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ padding: 16, background: 'var(--bg-card2)', borderRadius: 8, marginBottom: 8 }}>
                            <p style={{ fontWeight: 700, marginBottom: 12 }}>🟡 Mercado Pago</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <F settings={settings} set={set} label="Public Key" k="mp_public_key" placeholder="APP_USR-xxxx" />
                                <F settings={settings} set={set} label="Access Token" k="mp_access_token" type="password" placeholder="APP_USR-xxxx" />
                                <F settings={settings} set={set} label="Webhook Secret" k="mp_webhook_secret" type="password" placeholder="Chave secreta do webhook (opcional)" help="Encontre em: Mercado Pago → Seu negócio → Configurações → Webhooks → Chave secreta. Usado para validar que as notificações vêm do MercadoPago." />
                                <div style={{ padding: 12, background: 'rgba(234,179,8,0.08)', borderRadius: 8, border: '1px solid rgba(234,179,8,0.2)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                    <p style={{ fontWeight: 700, marginBottom: 6, color: '#d97706' }}>⚠️ Configurar Webhook no Painel do MercadoPago</p>
                                    <p style={{ marginBottom: 6 }}>Para que pagamentos via Pix e Boleto sejam confirmados automaticamente, você precisa cadastrar a URL do webhook no painel do MercadoPago:</p>
                                    <ol style={{ paddingLeft: 18, marginBottom: 8, lineHeight: 1.8 }}>
                                        <li>Acesse <a href="https://www.mercadopago.com.br/developers/panel/app" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>mercadopago.com.br/developers</a></li>
                                        <li>Vá em <strong>Seu negócio → Configurações → Webhooks</strong></li>
                                        <li>Adicione a URL: <code style={{ background: 'var(--bg)', padding: '2px 6px', borderRadius: 4 }}>{typeof window !== 'undefined' ? window.location.origin : 'https://seudominio.com'}/api/webhooks/mercadopago</code></li>
                                        <li>Marque o evento <strong>Pagamentos</strong></li>
                                    </ol>
                                    <p style={{ fontSize: '0.78rem', opacity: 0.8 }}>Sem o webhook configurado, pedidos Pix e Boleto ficarão como "Pendente" mesmo após o pagamento.</p>
                                </div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                                    <input type="checkbox" checked={settings.mp_enabled === 'true'} onChange={e => set('mp_enabled', e.target.checked ? 'true' : 'false')} />
                                    <span style={{ fontSize: '0.88rem' }}>Habilitar Mercado Pago</span>
                                </label>
                            </div>
                        </div>
                        <div style={{ padding: 16, background: 'var(--bg-card2)', borderRadius: 8 }}>
                            <p style={{ fontWeight: 700, marginBottom: 12 }}>🔵 Stripe</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <F settings={settings} set={set} label="Public Key" k="stripe_public_key" placeholder="pk_test_..." />
                                <F settings={settings} set={set} label="Secret Key" k="stripe_secret_key" type="password" placeholder="sk_test_..." />
                                <F settings={settings} set={set} label="Webhook Secret" k="stripe_webhook_secret" type="password" placeholder="whsec_..." help="Encontre em: Stripe Dashboard → Developers → Webhooks → Signing secret" />
                                <div style={{ padding: 12, background: 'rgba(99,102,241,0.08)', borderRadius: 8, border: '1px solid rgba(99,102,241,0.25)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                    <p style={{ fontWeight: 700, marginBottom: 6, color: 'var(--primary)' }}>ℹ️ Configurar Webhook no Stripe</p>
                                    <p style={{ marginBottom: 6 }}>Para confirmar pagamentos assíncronos (Pix, Boleto), configure o webhook no Stripe:</p>
                                    <ol style={{ paddingLeft: 18, marginBottom: 8, lineHeight: 1.8 }}>
                                        <li>Acesse <a href="https://dashboard.stripe.com/webhooks" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>dashboard.stripe.com/webhooks</a></li>
                                        <li>Clique em <strong>Add endpoint</strong></li>
                                        <li>URL: <code style={{ background: 'var(--bg)', padding: '2px 6px', borderRadius: 4 }}>{typeof window !== 'undefined' ? window.location.origin : 'https://seudominio.com'}/api/webhooks/stripe</code></li>
                                        <li>Eventos: <strong>payment_intent.succeeded</strong>, <strong>payment_intent.payment_failed</strong>, <strong>charge.refunded</strong></li>
                                        <li>Copie o <strong>Signing secret</strong> e cole acima</li>
                                    </ol>
                                </div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                                    <input type="checkbox" checked={settings.stripe_enabled === 'true'} onChange={e => set('stripe_enabled', e.target.checked ? 'true' : 'false')} />
                                    <span style={{ fontSize: '0.88rem' }}>Habilitar Stripe</span>
                                </label>
                            </div>
                        </div>
                        <button className="btn btn-primary" onClick={() => save(['mp_public_key', 'mp_access_token', 'mp_webhook_secret', 'mp_enabled', 'stripe_public_key', 'stripe_secret_key', 'stripe_webhook_secret', 'stripe_enabled'])} disabled={saving}><Save size={16} />{saving ? 'Salvando...' : 'Salvar'}</button>
                    </div>
                )}

                {/* Tracking */}
                {tab === 'Tracking' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ padding: 16, background: 'var(--bg-card2)', borderRadius: 8, marginBottom: 8 }}>
                            <p style={{ fontWeight: 700, marginBottom: 12 }}>🔵 Facebook Pixel</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <F settings={settings} set={set} label="Pixel ID" k="fb_pixel_id" placeholder="123456789012345" />
                                <F settings={settings} set={set} label="Access Token (CAPI server-side)" k="fb_capi_token" type="password" />
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                                    <input type="checkbox" checked={settings.fb_pixel_enabled === 'true'} onChange={e => set('fb_pixel_enabled', e.target.checked ? 'true' : 'false')} />
                                    <span style={{ fontSize: '0.88rem' }}>Habilitar Pixel</span>
                                </label>
                            </div>
                        </div>
                        <div style={{ padding: 16, background: 'var(--bg-card2)', borderRadius: 8 }}>
                            <p style={{ fontWeight: 700, marginBottom: 12 }}>🟢 Google Ads</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <F settings={settings} set={set} label="Google Ads ID" k="google_ads_id" placeholder="AW-XXXXXXXXX" />
                                <F settings={settings} set={set} label="Conversion Label (Purchase)" k="google_ads_label" placeholder="AbCdEfGhIj" />
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                                    <input type="checkbox" checked={settings.google_ads_enabled === 'true'} onChange={e => set('google_ads_enabled', e.target.checked ? 'true' : 'false')} />
                                    <span style={{ fontSize: '0.88rem' }}>Habilitar Google Ads</span>
                                </label>
                            </div>
                        </div>
                        <button className="btn btn-primary" onClick={() => save(['fb_pixel_id', 'fb_capi_token', 'fb_pixel_enabled', 'google_ads_id', 'google_ads_label', 'google_ads_enabled'])} disabled={saving}><Save size={16} />{saving ? 'Salvando...' : 'Salvar'}</button>
                    </div>
                )}

                {/* Webhooks */}
                {tab === 'Webhooks' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ padding: 16, background: 'var(--bg-card2)', borderRadius: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                <p style={{ fontWeight: 700 }}>Webhook de Leads</p>
                                <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => testWebhook('lead')}><TestTube2 size={14} />Testar</button>
                            </div>
                            <F settings={settings} set={set} label="URL" k="webhook_lead_url" placeholder="https://seu-crm.com/webhook/lead" />
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 6 }}>Disparado ao novo cadastro de usuário.</p>

                            <details style={{ marginTop: 12 }}>
                                <summary style={{ cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: 'var(--primary)' }}>Ver campos enviados</summary>
                                <div style={{ marginTop: 10, padding: 12, background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)', fontSize: '0.78rem', fontFamily: 'monospace', lineHeight: 2 }}>
                                    <p style={{ fontWeight: 700, marginBottom: 6, fontFamily: 'inherit', fontSize: '0.82rem' }}>Formato: POST JSON</p>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                                <th style={{ textAlign: 'left', padding: '4px 8px', fontWeight: 700 }}>Campo</th>
                                                <th style={{ textAlign: 'left', padding: '4px 8px', fontWeight: 700 }}>Tipo</th>
                                                <th style={{ textAlign: 'left', padding: '4px 8px', fontWeight: 700 }}>Descricao</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[
                                                ['event', 'string', '"new_lead"'],
                                                ['timestamp', 'string', 'Data/hora ISO 8601'],
                                                ['data.id', 'string', 'ID do lead'],
                                                ['data.name', 'string', 'Nome completo'],
                                                ['data.email', 'string', 'E-mail'],
                                                ['data.phone', 'string|null', 'Telefone'],
                                                ['data.cpf', 'string|null', 'CPF'],
                                                ['data.source', 'string', 'Origem ("checkout")'],
                                                ['data.created_at', 'string', 'Data de cadastro ISO 8601'],
                                            ].map(([campo, tipo, desc]) => (
                                                <tr key={campo} style={{ borderBottom: '1px solid var(--border)' }}>
                                                    <td style={{ padding: '4px 8px', color: 'var(--primary)' }}>{campo}</td>
                                                    <td style={{ padding: '4px 8px', color: 'var(--text-muted)' }}>{tipo}</td>
                                                    <td style={{ padding: '4px 8px', color: 'var(--text-muted)', fontFamily: 'sans-serif' }}>{desc}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <p style={{ marginTop: 10, fontFamily: 'sans-serif', fontSize: '0.78rem', color: 'var(--text-muted)' }}>Exemplo:</p>
                                    <pre style={{ background: 'var(--bg-card2)', padding: 10, borderRadius: 6, overflow: 'auto', fontSize: '0.72rem', marginTop: 4 }}>{`{
  "event": "new_lead",
  "timestamp": "2025-01-15T14:30:00.000Z",
  "data": {
    "id": "clx1abc...",
    "name": "Maria Silva",
    "email": "maria@email.com",
    "phone": "(11) 99999-0000",
    "cpf": "123.456.789-00",
    "source": "checkout",
    "created_at": "2025-01-15T14:30:00.000Z"
  }
}`}</pre>
                                </div>
                            </details>
                        </div>

                        <div style={{ padding: 16, background: 'var(--bg-card2)', borderRadius: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                <p style={{ fontWeight: 700 }}>Webhook de Compradores</p>
                                <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => testWebhook('buyer')}><TestTube2 size={14} />Testar</button>
                            </div>
                            <F settings={settings} set={set} label="URL" k="webhook_buyer_url" placeholder="https://seu-crm.com/webhook/purchase" />
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 6 }}>Disparado apos pagamento confirmado.</p>

                            <details style={{ marginTop: 12 }}>
                                <summary style={{ cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: 'var(--primary)' }}>Ver campos enviados</summary>
                                <div style={{ marginTop: 10, padding: 12, background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)', fontSize: '0.78rem', fontFamily: 'monospace', lineHeight: 2 }}>
                                    <p style={{ fontWeight: 700, marginBottom: 6, fontFamily: 'inherit', fontSize: '0.82rem' }}>Formato: POST JSON</p>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                                <th style={{ textAlign: 'left', padding: '4px 8px', fontWeight: 700 }}>Campo</th>
                                                <th style={{ textAlign: 'left', padding: '4px 8px', fontWeight: 700 }}>Tipo</th>
                                                <th style={{ textAlign: 'left', padding: '4px 8px', fontWeight: 700 }}>Descricao</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[
                                                ['event', 'string', '"purchase"'],
                                                ['timestamp', 'string', 'Data/hora ISO 8601'],
                                                ['data.order_id', 'string', 'ID do pedido'],
                                                ['data.gateway_id', 'string', 'ID da transacao no gateway'],
                                                ['data.name', 'string', 'Nome do comprador'],
                                                ['data.email', 'string', 'E-mail do comprador'],
                                                ['data.phone', 'string|null', 'Telefone'],
                                                ['data.cpf', 'string|null', 'CPF'],
                                                ['data.address.street', 'string', 'Rua'],
                                                ['data.address.number', 'string', 'Numero'],
                                                ['data.address.complement', 'string|null', 'Complemento'],
                                                ['data.address.neighborhood', 'string', 'Bairro'],
                                                ['data.address.city', 'string', 'Cidade'],
                                                ['data.address.state', 'string', 'Estado (UF)'],
                                                ['data.address.zip', 'string', 'CEP'],
                                                ['data.subtotal', 'number', 'Subtotal (R$)'],
                                                ['data.shipping', 'number', 'Frete (R$)'],
                                                ['data.total', 'number', 'Total pago (R$)'],
                                                ['data.currency', 'string', '"BRL"'],
                                                ['data.gateway', 'string', '"mercadopago" ou "stripe"'],
                                                ['data.products[]', 'array', 'Lista de produtos'],
                                                ['data.products[].name', 'string', 'Nome do produto'],
                                                ['data.products[].qty', 'number', 'Quantidade'],
                                                ['data.products[].price', 'number', 'Preco unitario (R$)'],
                                            ].map(([campo, tipo, desc]) => (
                                                <tr key={campo} style={{ borderBottom: '1px solid var(--border)' }}>
                                                    <td style={{ padding: '4px 8px', color: 'var(--primary)' }}>{campo}</td>
                                                    <td style={{ padding: '4px 8px', color: 'var(--text-muted)' }}>{tipo}</td>
                                                    <td style={{ padding: '4px 8px', color: 'var(--text-muted)', fontFamily: 'sans-serif' }}>{desc}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <p style={{ marginTop: 10, fontFamily: 'sans-serif', fontSize: '0.78rem', color: 'var(--text-muted)' }}>Exemplo:</p>
                                    <pre style={{ background: 'var(--bg-card2)', padding: 10, borderRadius: 6, overflow: 'auto', fontSize: '0.72rem', marginTop: 4 }}>{`{
  "event": "purchase",
  "timestamp": "2025-01-15T15:00:00.000Z",
  "data": {
    "order_id": "clx2def...",
    "gateway_id": "12345678",
    "name": "Maria Silva",
    "email": "maria@email.com",
    "phone": "(11) 99999-0000",
    "cpf": "123.456.789-00",
    "address": {
      "street": "Rua das Flores",
      "number": "123",
      "complement": "Apto 4",
      "neighborhood": "Centro",
      "city": "Sao Paulo",
      "state": "SP",
      "zip": "01310100"
    },
    "subtotal": 199.90,
    "shipping": 15.00,
    "total": 214.90,
    "currency": "BRL",
    "gateway": "mercadopago",
    "products": [
      { "name": "Camiseta P", "qty": 2, "price": 79.95 },
      { "name": "Bone", "qty": 1, "price": 40.00 }
    ]
  }
}`}</pre>
                                </div>
                            </details>
                        </div>
                        <button className="btn btn-primary" onClick={() => save(['webhook_lead_url', 'webhook_buyer_url'])} disabled={saving}><Save size={16} />{saving ? 'Salvando...' : 'Salvar'}</button>
                    </div>
                )}

                {/* Frete */}
                {tab === 'Frete' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div className="form-group">
                            <label className="form-label">Modo de Frete</label>
                            <select className="input" value={settings.shipping_mode || 'free'} onChange={e => set('shipping_mode', e.target.value)}>
                                <option value="free">Frete Grátis (sempre)</option>
                                <option value="fixed">Valor Fixo</option>
                                <option value="by_state">Por Estado (tabela)</option>
                                <option value="correios">📦 Correios (PAC + SEDEX — preço e prazo reais)</option>
                            </select>
                        </div>

                        {settings.shipping_mode === 'fixed' && (
                            <>
                                <F settings={settings} set={set} label="Valor do Frete (R$)" k="shipping_fixed_value" placeholder="15.00" />
                                <F settings={settings} set={set} label="Frete Grátis acima de (R$) — deixe 0 para desativar" k="shipping_free_above" placeholder="0" />
                            </>
                        )}

                        {settings.shipping_mode === 'by_state' && (
                            <div className="form-group">
                                <label className="form-label">Tabela por Estado (JSON: {'{"SP": 15, "RJ": 20, "DEFAULT": 30}'})</label>
                                <textarea className="input" rows={6} value={settings.shipping_state_table || '{}'} onChange={e => set('shipping_state_table', e.target.value)} style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: '0.85rem' }} />
                            </div>
                        )}

                        {settings.shipping_mode === 'correios' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                <div style={{ padding: 12, background: 'rgba(99,102,241,0.08)', borderRadius: 8, border: '1px solid rgba(99,102,241,0.25)', fontSize: '0.83rem', color: 'var(--text-muted)' }}>
                                    📦 Usa o webservice público dos Correios — sem necessidade de contrato. Para cotações com desconto contratual, preencha também o Código Empresa e Senha abaixo.
                                </div>
                                <div className="form-group">
                                    <label className="form-label">CEP de Origem (Apenas números) *</label>
                                    <input className="input" placeholder="01310100" maxLength={8}
                                        value={settings.shipping_origin_cep || ''}
                                        onChange={e => set('shipping_origin_cep', formatCEP(e.target.value))} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    <div className="form-group">
                                        <label className="form-label">Peso padrão (kg)</label>
                                        <input className="input" placeholder="0.5" type="number" step="0.1" value={settings.shipping_default_weight || ''} onChange={e => set('shipping_default_weight', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Frete Grátis acima de R$ (0 = desativado)</label>
                                        <input className="input" placeholder="0" type="number" step="0.01" value={settings.shipping_free_above || ''} onChange={e => set('shipping_free_above', e.target.value)} />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                                    <div className="form-group">
                                        <label className="form-label">Comprimento (cm)</label>
                                        <input className="input" placeholder="20" type="number" value={settings.shipping_default_length || ''} onChange={e => set('shipping_default_length', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Altura (cm)</label>
                                        <input className="input" placeholder="10" type="number" value={settings.shipping_default_height || ''} onChange={e => set('shipping_default_height', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Largura (cm)</label>
                                        <input className="input" placeholder="15" type="number" value={settings.shipping_default_width || ''} onChange={e => set('shipping_default_width', e.target.value)} />
                                    </div>
                                </div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: -4 }}>
                                    ⚠️ Use as dimensões do pacote que você envia. Afeta diretamente o preço cotado.
                                </p>
                                <hr className="divider" />
                                <p style={{ fontWeight: 600, fontSize: '0.88rem' }}>Credenciais de Contrato (Opcional)</p>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: -8 }}>
                                    Deixe em branco se você não tem contrato com os Correios. Se você possui um contrato (Correios Fácil), insira o código e a senha para habilitar o cálculo com desconto.
                                </p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    <div className="form-group">
                                        <label className="form-label">Código Empresa</label>
                                        <input className="input" placeholder="(deixe vazio sem contrato)" value={settings.shipping_correios_user || ''} onChange={e => set('shipping_correios_user', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Senha</label>
                                        <input className="input" type="password" placeholder="(deixe vazio sem contrato)" value={settings.shipping_correios_pass || ''} onChange={e => set('shipping_correios_pass', e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        )}

                        <button className="btn btn-primary" onClick={() => save(['shipping_mode', 'shipping_fixed_value', 'shipping_free_above', 'shipping_state_table', 'shipping_origin_cep', 'shipping_default_weight', 'shipping_default_height', 'shipping_default_width', 'shipping_default_length', 'shipping_correios_user', 'shipping_correios_pass'])} disabled={saving}><Save size={16} />{saving ? 'Salvando...' : 'Salvar'}</button>
                    </div>
                )}


                {/* Loja */}
                {tab === 'Loja' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <F settings={settings} set={set} label="Nome da Loja" k="store_name" placeholder="Ex: Velour" />
                        <ImageF label="Logo da Loja" k="store_logo" help="Recomendado: PNG transparente, max 160x40px" settings={settings} uploadFile={uploadFile} />
                        <ImageF label="Favicon" k="store_favicon" help="Ícone da aba do navegador. Recomendado: PNG quadrado 32x32 ou 64x64" settings={settings} uploadFile={uploadFile} />

                        <div style={{ background: 'var(--bg-card2)', padding: 16, borderRadius: 8, border: '1px solid var(--border)' }}>
                            <p style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 12 }}>🎨 Temas Prontos</p>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>Selecione um tema predefinido para preencher automaticamente as cores. Você pode customizar as cores individualmente abaixo.</p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
                                {PRESET_THEMES.map((theme) => (
                                    <button
                                        key={theme.name}
                                        onClick={() => {
                                            Object.entries(theme.colors).forEach(([key, color]) => set(key, color))
                                        }}
                                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 12, borderRadius: 8, border: '1px solid var(--border)', background: theme.colors.store_bg_color, cursor: 'pointer', transition: 'all 0.2s' }}
                                    >
                                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: theme.colors.store_primary_color, border: '2px solid rgba(255,255,255,0.2)' }} />
                                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: theme.colors.store_text_title }}>{theme.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, background: 'var(--bg-card2)', padding: 16, borderRadius: 8, border: '1px solid var(--border)' }}>
                            <div style={{ gridColumn: '1 / -1' }}><p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>Cores Globais</p></div>
                            <ColorF label="Cor Primária" k="store_primary_color" defaultColor="#6366f1" settings={settings} set={set} />
                            <ColorF label="Fundo da Loja (Global)" k="store_bg_color" defaultColor="#0a0a0f" settings={settings} set={set} />
                            <ColorF label="Fundo de Cards/Secundário" k="store_bg_card_color" defaultColor="#12121a" settings={settings} set={set} />
                            <ColorF label="Texto Principal (Descrições)" k="store_text_color" defaultColor="#f1f1f8" settings={settings} set={set} />
                            <ColorF label="Títulos e Destaques (H1/H2)" k="store_text_title" defaultColor="#ffffff" settings={settings} set={set} />

                            <div style={{ gridColumn: '1 / -1', marginTop: 8 }}><p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>Cores Isoladas de Interação</p></div>
                            <ColorF label="Botão 'Comprar' (Pág. Produto)" k="store_btn_buy" defaultColor="#6366f1" settings={settings} set={set} />
                            <ColorF label="Botão 'Entrar' (Cabeçalho)" k="store_btn_header" defaultColor="#6366f1" settings={settings} set={set} />
                            <ColorF label="Ícone de Carrinho (Sacola)" k="store_icon_cart" defaultColor="#f1f1f8" settings={settings} set={set} />
                        </div>

                        <F settings={settings} set={set} label="Texto do Rodapé" k="store_footer_text" />
                        <button className="btn btn-primary" onClick={() => save(['store_name', 'store_logo', 'store_favicon', 'store_primary_color', 'store_text_color', 'store_bg_color', 'store_bg_card_color', 'store_text_title', 'store_btn_buy', 'store_btn_header', 'store_icon_cart', 'store_footer_text'])} disabled={saving}><Save size={16} />{saving ? 'Salvando...' : 'Salvar'}</button>
                    </div>
                )}

                {/* SEO */}
                {tab === 'SEO' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ padding: 16, background: 'rgba(99,102,241,0.1)', borderRadius: 8, border: '1px solid rgba(99,102,241,0.3)', marginBottom: 4 }}>
                            <p style={{ fontWeight: 700, marginBottom: 6 }}>🔍 Otimização para Buscadores (SEO)</p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Essas configurações definem como a página inicial da sua loja aparece no Google e quando compartilhada em redes sociais (WhatsApp, Facebook, etc).</p>
                        </div>
                        <F settings={settings} set={set} label="Meta Title (Título da Página)" k="seo_meta_title" placeholder="Velour | Moda Elegante" help="Título ideal: entre 50 e 60 caracteres." />
                        <F settings={settings} set={set} label="Meta Description (Descrição)" k="seo_meta_description" type="textarea" placeholder="Encontre as melhores peças..." help="Resumo da loja. Ideal: até 160 caracteres." />
                        <ImageF label="Imagem de Compartilhamento (OG Image)" k="seo_og_image" help="Imagem que aparece ao enviar o link (ex: WhatsApp). Recomendado: Retangular 1200x630px." settings={settings} uploadFile={uploadFile} />
                        <button className="btn btn-primary" onClick={() => save(['seo_meta_title', 'seo_meta_description', 'seo_og_image'])} disabled={saving}><Save size={16} />{saving ? 'Salvando...' : 'Salvar'}</button>
                    </div>
                )}

                {/* Banner */}
                {tab === 'Banner' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ padding: 16, background: 'rgba(99,102,241,0.1)', borderRadius: 8, border: '1px solid rgba(99,102,241,0.3)', marginBottom: 4 }}>
                            <p style={{ fontWeight: 700, marginBottom: 6 }}>🖼️ Banner Principal (Home)</p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Se um banner for enviado, a página principal mostrará um Hero Cinema com a imagem de fundo, título e descrição por cima.</p>
                        </div>
                        <F settings={settings} set={set} label="Título do Banner" k="store_banner_title" placeholder="Nova Coleção Primavera" />
                        <F settings={settings} set={set} label="Subtítulo do Banner" k="store_banner_subtitle" type="textarea" placeholder="Descubra a nova linha..." />
                        <ImageF label="Imagem de Fundo (Banner)" k="store_banner_url" help="Recomendado: 1920x600 pixels, alta qualidade." settings={settings} uploadFile={uploadFile} />
                        <button className="btn btn-primary" onClick={() => save(['store_banner_title', 'store_banner_subtitle', 'store_banner_url'])} disabled={saving}><Save size={16} />{saving ? 'Salvando...' : 'Salvar'}</button>
                    </div>
                )}
            </div>
        </div>
    )
}
