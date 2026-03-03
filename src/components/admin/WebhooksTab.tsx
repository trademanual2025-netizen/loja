'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Save, TestTube2, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { LEAD_FIELDS, BUYER_FIELDS, type FieldMapping, type FieldDef } from '@/lib/webhook-fields'

function buildDefault(fields: FieldDef[]): FieldMapping {
    const m: FieldMapping = {}
    for (const f of fields) {
        m[f.key] = { enabled: true, customName: f.defaultName }
    }
    return m
}

function FieldRow({ f, cfg, onToggle, onRename }: {
    f: FieldDef
    cfg: { enabled: boolean; customName: string }
    onToggle: () => void
    onRename: (name: string) => void
}) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 10px', borderRadius: 6,
            background: cfg.enabled ? 'var(--bg)' : 'transparent',
            border: '1px solid var(--border)',
            opacity: cfg.enabled ? 1 : 0.5,
            transition: 'opacity 0.15s',
        }}>
            <input
                type="checkbox"
                checked={cfg.enabled}
                onChange={onToggle}
                style={{ accentColor: 'var(--primary)', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', minWidth: 110, flexShrink: 0 }}>{f.label}</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', flexShrink: 0 }}>&#8594;</span>
            <input
                type="text"
                value={cfg.customName}
                onChange={e => onRename(e.target.value)}
                disabled={!cfg.enabled}
                placeholder={f.defaultName}
                style={{
                    flex: 1, padding: '3px 8px', borderRadius: 4, fontSize: '0.78rem',
                    fontFamily: 'monospace', border: '1px solid var(--border)',
                    background: cfg.enabled ? 'var(--bg-card2)' : 'transparent',
                    color: cfg.customName !== f.defaultName ? 'var(--primary)' : 'var(--text)',
                    fontWeight: cfg.customName !== f.defaultName ? 600 : 400,
                }}
            />
            {cfg.customName !== f.defaultName && cfg.enabled && (
                <button type="button" onClick={() => onRename(f.defaultName)} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', fontSize: '0.7rem', padding: 2,
                }}>
                    <RotateCcw size={12} />
                </button>
            )}
        </div>
    )
}

function FieldMapper({ fields, mapping, onChange }: {
    fields: FieldDef[]
    mapping: FieldMapping
    onChange: (m: FieldMapping) => void
}) {
    const toggle = (key: string) => {
        onChange({ ...mapping, [key]: { ...mapping[key], enabled: !mapping[key]?.enabled } })
    }

    const rename = (key: string, customName: string) => {
        onChange({ ...mapping, [key]: { ...mapping[key], customName } })
    }

    const reset = () => onChange(buildDefault(fields))

    const enableAll = () => {
        const m: FieldMapping = {}
        for (const f of fields) {
            m[f.key] = { enabled: true, customName: mapping[f.key]?.customName || f.defaultName }
        }
        onChange(m)
    }

    const enabledCount = fields.filter(f => mapping[f.key]?.enabled !== false).length

    const preview: Record<string, unknown> = {}
    const addressPreview: Record<string, unknown> = {}
    const dataPreview: Record<string, unknown> = {}
    for (const f of fields) {
        const cfg = mapping[f.key]
        if (cfg && !cfg.enabled) continue
        const outputKey = cfg?.customName || f.defaultName
        const sampleVal = f.key === 'products' ? [{ name: '...', qty: 1, price: 0 }] : `{${f.label}}`
        if (f.group === 'meta') {
            preview[outputKey] = sampleVal
        } else if (f.group === 'address') {
            addressPreview[outputKey] = sampleVal
        } else {
            dataPreview[outputKey] = sampleVal
        }
    }
    if (Object.keys(addressPreview).length > 0) {
        dataPreview.address = addressPreview
    }
    preview.data = dataPreview

    const groups: Array<{ label: string; group: string; items: FieldDef[] }> = []
    let currentGroup: typeof groups[0] | null = null
    for (const f of fields) {
        if (!currentGroup || currentGroup.group !== f.group) {
            const label = f.group === 'meta' ? 'Envelope' : f.group === 'address' ? 'Endereco (data.address)' : 'Dados (data)'
            currentGroup = { label, group: f.group, items: [] }
            groups.push(currentGroup)
        }
        currentGroup.items.push(f)
    }

    return (
        <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <p style={{ fontSize: '0.82rem', fontWeight: 600 }}>Campos enviados ({enabledCount}/{fields.length})</p>
                <div style={{ display: 'flex', gap: 6 }}>
                    <button type="button" className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.72rem' }} onClick={enableAll}>Todos</button>
                    <button type="button" className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.72rem' }} onClick={reset}><RotateCcw size={12} /> Resetar</button>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {groups.map((g, gi) => (
                    <React.Fragment key={g.group}>
                        <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: gi > 0 ? 8 : 0, letterSpacing: 1 }}>
                            {g.label}
                        </p>
                        {g.items.map(f => {
                            const cfg = mapping[f.key] || { enabled: true, customName: f.defaultName }
                            return (
                                <FieldRow key={f.key} f={f} cfg={cfg} onToggle={() => toggle(f.key)} onRename={(name) => rename(f.key, name)} />
                            )
                        })}
                    </React.Fragment>
                ))}
            </div>

            <details style={{ marginTop: 10 }}>
                <summary style={{ cursor: 'pointer', fontSize: '0.78rem', color: 'var(--text-muted)' }}>Pre-visualizar JSON</summary>
                <pre style={{ background: 'var(--bg)', padding: 10, borderRadius: 6, overflow: 'auto', fontSize: '0.72rem', marginTop: 6, border: '1px solid var(--border)' }}>
                    {JSON.stringify(preview, null, 2)}
                </pre>
            </details>
        </div>
    )
}

export default function WebhooksTab({ settings, set, save, saving, testWebhook }: {
    settings: Record<string, string>
    set: (k: string, v: string) => void
    save: (keys: string[]) => Promise<void>
    saving: boolean
    testWebhook: (type: 'lead' | 'buyer') => void | Promise<void>
}) {
    const [leadMapping, setLeadMapping] = useState<FieldMapping>(() => {
        try {
            return settings.webhook_lead_fields ? JSON.parse(settings.webhook_lead_fields) : buildDefault(LEAD_FIELDS)
        } catch { return buildDefault(LEAD_FIELDS) }
    })

    const [buyerMapping, setBuyerMapping] = useState<FieldMapping>(() => {
        try {
            return settings.webhook_buyer_fields ? JSON.parse(settings.webhook_buyer_fields) : buildDefault(BUYER_FIELDS)
        } catch { return buildDefault(BUYER_FIELDS) }
    })

    useEffect(() => {
        try {
            if (settings.webhook_lead_fields) setLeadMapping(JSON.parse(settings.webhook_lead_fields))
        } catch {}
    }, [settings.webhook_lead_fields])

    useEffect(() => {
        try {
            if (settings.webhook_buyer_fields) setBuyerMapping(JSON.parse(settings.webhook_buyer_fields))
        } catch {}
    }, [settings.webhook_buyer_fields])

    const handleLeadChange = useCallback((m: FieldMapping) => {
        setLeadMapping(m)
        set('webhook_lead_fields', JSON.stringify(m))
    }, [set])

    const handleBuyerChange = useCallback((m: FieldMapping) => {
        setBuyerMapping(m)
        set('webhook_buyer_fields', JSON.stringify(m))
    }, [set])

    const handleSave = () => {
        set('webhook_lead_fields', JSON.stringify(leadMapping))
        set('webhook_buyer_fields', JSON.stringify(buyerMapping))
        save(['webhook_lead_url', 'webhook_buyer_url', 'webhook_lead_fields', 'webhook_buyer_fields'])
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ padding: 16, background: 'var(--bg-card2)', borderRadius: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <p style={{ fontWeight: 700 }}>Webhook de Leads</p>
                    <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => testWebhook('lead')}><TestTube2 size={14} /> Testar</button>
                </div>
                <div className="form-group">
                    <label className="form-label">URL</label>
                    <input className="input" value={settings.webhook_lead_url || ''} onChange={e => set('webhook_lead_url', e.target.value)} placeholder="https://seu-crm.com/webhook/lead" />
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 6 }}>Disparado ao novo cadastro de usuario. Escolha os campos e personalize os nomes para compatibilidade com sua ferramenta.</p>
                <FieldMapper fields={LEAD_FIELDS} mapping={leadMapping} onChange={handleLeadChange} />
            </div>

            <div style={{ padding: 16, background: 'var(--bg-card2)', borderRadius: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <p style={{ fontWeight: 700 }}>Webhook de Compradores</p>
                    <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => testWebhook('buyer')}><TestTube2 size={14} /> Testar</button>
                </div>
                <div className="form-group">
                    <label className="form-label">URL</label>
                    <input className="input" value={settings.webhook_buyer_url || ''} onChange={e => set('webhook_buyer_url', e.target.value)} placeholder="https://seu-crm.com/webhook/purchase" />
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 6 }}>Disparado apos pagamento confirmado. Escolha os campos e personalize os nomes para compatibilidade com sua ferramenta.</p>
                <FieldMapper fields={BUYER_FIELDS} mapping={buyerMapping} onChange={handleBuyerChange} />
            </div>

            <button className="btn btn-primary" onClick={handleSave} disabled={saving}><Save size={16} /> {saving ? 'Salvando...' : 'Salvar'}</button>
        </div>
    )
}
