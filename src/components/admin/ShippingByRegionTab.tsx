'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { GEO_COUNTRIES, type GeoCountry } from '@/lib/geo-data'

export interface ShippingRule {
    id: string
    country: string
    state: string
    rate: number
    freeAbove: number
}

function newRule(): ShippingRule {
    return { id: Math.random().toString(36).slice(2), country: 'BR', state: '', rate: 0, freeAbove: 0 }
}

function parseRules(raw: string): ShippingRule[] {
    try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) return parsed
    } catch {}
    return []
}

type RuleUpdater = (patch: Partial<ShippingRule>) => void

interface RowProps {
    rule: ShippingRule
    onRemove: () => void
    onUpdate: RuleUpdater
}

function RuleRow({ rule, onRemove, onUpdate }: RowProps) {
    const [search, setSearch] = useState('')
    const [open, setOpen] = useState(false)

    const country: GeoCountry | undefined = GEO_COUNTRIES.find(c => c.code === rule.country)
    const subdivisions = country?.subdivisions ?? []

    const filtered = search.trim()
        ? GEO_COUNTRIES.filter(c =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.code.toLowerCase().includes(search.toLowerCase())
        )
        : GEO_COUNTRIES

    return (
        <div style={{ padding: 14, background: 'var(--bg-card2)', borderRadius: 8, border: '1px solid var(--border)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr auto', gap: 10, alignItems: 'end' }}>

                {/* Country picker */}
                <div style={{ position: 'relative' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4, fontWeight: 600 }}>País</label>
                    <div style={{ position: 'relative' }}>
                        <input
                            className="input"
                            style={{ paddingLeft: 34 }}
                            placeholder="Buscar país..."
                            value={open ? search : (country ? `${country.flag} ${country.name}` : '')}
                            onFocus={() => { setOpen(true); setSearch('') }}
                            onBlur={() => setTimeout(() => { setOpen(false); setSearch('') }, 160)}
                            onChange={e => setSearch(e.target.value)}
                        />
                        <span style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', fontSize: '1.1rem', pointerEvents: 'none' }}>
                            {country?.flag ?? '🌐'}
                        </span>
                        {open && (
                            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, maxHeight: 220, overflowY: 'auto', boxShadow: '0 8px 24px rgba(0,0,0,0.45)' }}>
                                {filtered.slice(0, 40).map(c => (
                                    <div
                                        key={c.code}
                                        onMouseDown={() => {
                                            onUpdate({ country: c.code, state: '' })
                                            setOpen(false)
                                            setSearch('')
                                        }}
                                        style={{
                                            padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                                            fontSize: '0.85rem', borderBottom: '1px solid var(--border)',
                                            background: c.code === rule.country ? 'rgba(99,102,241,0.12)' : 'transparent',
                                        }}
                                        onMouseEnter={e => { if (c.code !== rule.country) (e.currentTarget as HTMLElement).style.background = 'var(--bg-card2)' }}
                                        onMouseLeave={e => { if (c.code !== rule.country) (e.currentTarget as HTMLElement).style.background = c.code === rule.country ? 'rgba(99,102,241,0.12)' : 'transparent' }}
                                    >
                                        <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{c.flag}</span>
                                        <span style={{ flex: 1 }}>{c.name}</span>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{c.code}</span>
                                    </div>
                                ))}
                                {filtered.length === 0 && (
                                    <div style={{ padding: '10px 12px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>Nenhum país encontrado</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* State picker */}
                <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4, fontWeight: 600 }}>Estado / Província</label>
                    <select
                        className="input"
                        value={rule.state}
                        onChange={e => onUpdate({ state: e.target.value })}
                        disabled={subdivisions.length === 0}
                        style={{ opacity: subdivisions.length === 0 ? 0.5 : 1 }}
                    >
                        <option value="">— País inteiro —</option>
                        {subdivisions.map(s => (
                            <option key={s.code} value={s.code}>{s.name}</option>
                        ))}
                    </select>
                    {subdivisions.length === 0 && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 3, display: 'block' }}>Aplica ao país inteiro</span>
                    )}
                </div>

                {/* Rate */}
                <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4, fontWeight: 600 }}>Valor (R$)</label>
                    <input
                        className="input"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={rule.rate}
                        onChange={e => onUpdate({ rate: parseFloat(e.target.value) || 0 })}
                    />
                </div>

                {/* Free above */}
                <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4, fontWeight: 600 }}>Grátis acima R$</label>
                    <input
                        className="input"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0 = nunca"
                        value={rule.freeAbove}
                        onChange={e => onUpdate({ freeAbove: parseFloat(e.target.value) || 0 })}
                    />
                </div>

                {/* Remove */}
                <button
                    onClick={onRemove}
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '8px 10px', cursor: 'pointer', color: '#ef4444', alignSelf: 'flex-end' }}
                    title="Remover regra"
                >
                    <Trash2 size={15} />
                </button>
            </div>
        </div>
    )
}

interface Props {
    value: string
    onChange: (json: string) => void
}

export default function ShippingByRegionTab({ value, onChange }: Props) {
    const [rules, setRules] = useState<ShippingRule[]>(() => {
        const parsed = parseRules(value)
        return parsed.length > 0 ? parsed : [newRule()]
    })

    function update(updated: ShippingRule[]) {
        setRules(updated)
        onChange(JSON.stringify(updated))
    }

    function addRule() { update([...rules, newRule()]) }
    function removeRule(id: string) { update(rules.filter(r => r.id !== id)) }
    function updateRule(id: string, patch: Partial<ShippingRule>) {
        update(rules.map(r => r.id === id ? { ...r, ...patch } : r))
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ padding: 12, background: 'rgba(99,102,241,0.08)', borderRadius: 8, border: '1px solid rgba(99,102,241,0.25)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <p style={{ fontWeight: 600, marginBottom: 4, color: 'var(--text)' }}>🌍 Regras de frete por país / região</p>
                <p>Adicione uma regra por linha. Deixe <strong>Estado/Província</strong> em branco para cobrir o país inteiro. A regra mais específica (país + estado) tem prioridade sobre a regra geral do país.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {rules.map(rule => (
                    <RuleRow
                        key={rule.id}
                        rule={rule}
                        onRemove={() => removeRule(rule.id)}
                        onUpdate={(patch) => updateRule(rule.id, patch)}
                    />
                ))}
            </div>

            <button
                onClick={addRule}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'transparent', border: '1.5px dashed var(--border)', borderRadius: 8, cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, justifyContent: 'center' }}
            >
                <Plus size={16} /> Adicionar regra
            </button>

            <div style={{ padding: 12, background: 'var(--bg-card2)', borderRadius: 8, fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                <strong>Prioridade:</strong> país + estado (específica) → país inteiro → frete indisponível para o destino.
            </div>
        </div>
    )
}
