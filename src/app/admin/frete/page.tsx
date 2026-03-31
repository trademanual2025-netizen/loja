'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Save } from 'lucide-react'
import ShippingByRegionTab from '@/components/admin/ShippingByRegionTab'

const F = ({ label, k, type = 'text', placeholder = '', help = '', settings, set }: { label: string; k: string; type?: string; placeholder?: string; help?: string; settings: any; set: any }) => (
    <div className="form-group">
        <label className="form-label">{label}</label>
        <input className="input" type={type} placeholder={placeholder} value={settings[k] || ''} onChange={e => set(k, e.target.value)} />
        {help && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 6 }}>{help}</p>}
    </div>
)

export default function FretePage() {
    const [settings, setSettings] = useState<Record<string, string>>({})
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetch('/api/admin/settings').then(r => r.json()).then(setSettings)
    }, [])

    function set(key: string, value: string) {
        setSettings(p => ({ ...p, [key]: value }))
    }

    const formatCEP = (val: string) => val.replace(/\D/g, '').substring(0, 8)

    async function save() {
        setSaving(true)
        await fetch('/api/admin/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                shipping_mode: settings.shipping_mode || '',
                shipping_fixed_value: settings.shipping_fixed_value || '',
                shipping_free_above: settings.shipping_free_above || '',
                shipping_state_table: settings.shipping_state_table || '',
                shipping_origin_cep: settings.shipping_origin_cep || '',
                shipping_default_weight: settings.shipping_default_weight || '',
                shipping_default_height: settings.shipping_default_height || '',
                shipping_default_width: settings.shipping_default_width || '',
                shipping_default_length: settings.shipping_default_length || '',
                shipping_correios_user: settings.shipping_correios_user || '',
                shipping_correios_pass: settings.shipping_correios_pass || '',
            }),
        })
        setSaving(false)
        toast.success('Configurações de frete salvas!')
    }

    return (
        <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 28 }}>Frete</h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 700 }}>
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div className="form-group">
                        <label className="form-label">Modo de Frete</label>
                        <select className="input" value={settings.shipping_mode || 'free'} onChange={e => set('shipping_mode', e.target.value)}>
                            <option value="free">Frete Grátis (sempre)</option>
                            <option value="fixed">Valor Fixo</option>
                            <option value="by_state">Por Estado (tabela)</option>
                            <option value="correios">Correios (PAC + SEDEX — preço e prazo reais)</option>
                        </select>
                    </div>

                    {settings.shipping_mode === 'fixed' && (
                        <>
                            <F settings={settings} set={set} label="Valor do Frete (R$)" k="shipping_fixed_value" placeholder="15.00" />
                            <F settings={settings} set={set} label="Frete Grátis acima de (R$) — deixe 0 para desativar" k="shipping_free_above" placeholder="0" />
                        </>
                    )}

                    {settings.shipping_mode === 'by_state' && (
                        <ShippingByRegionTab
                            value={settings.shipping_state_table || '[]'}
                            onChange={v => set('shipping_state_table', v)}
                        />
                    )}

                    {settings.shipping_mode === 'correios' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div style={{ padding: 12, background: 'rgba(99,102,241,0.08)', borderRadius: 8, border: '1px solid rgba(99,102,241,0.25)', fontSize: '0.83rem', color: 'var(--text-muted)' }}>
                                Usa o webservice público dos Correios — sem necessidade de contrato. Para cotações com desconto contratual, preencha também o Código Empresa e Senha abaixo.
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">CEP de Origem (só números) *</label>
                                    <input className="input" placeholder="01310100" maxLength={8}
                                        value={settings.shipping_origin_cep || ''}
                                        onChange={e => set('shipping_origin_cep', formatCEP(e.target.value))} />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Frete Grátis acima de R$ (0 = nunca)</label>
                                    <input className="input" placeholder="0" type="number" step="0.01" value={settings.shipping_free_above || ''} onChange={e => set('shipping_free_above', e.target.value)} />
                                </div>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: -4 }}>
                                Peso e dimensões são configurados por produto. O Correios usará os dados do produto para calcular o frete real.
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
                </div>

                <button className="btn btn-primary" onClick={save} disabled={saving}>
                    <Save size={16} />{saving ? 'Salvando...' : 'Salvar'}
                </button>
            </div>
        </div>
    )
}
