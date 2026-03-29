'use client'

import { useState, useEffect } from 'react'
import { Plus, Loader2, Trash2, Pencil, X, Check, Tag } from 'lucide-react'
import { toast } from 'sonner'

interface Coupon {
    id: string
    code: string
    type: string
    value: number
    scope: string
    categoryIds: string | null
    productIds: string | null
    maxUses: number | null
    usedCount: number
    expiresAt: string | null
    active: boolean
    createdAt: string
    _count: { orders: number }
}

interface Category { id: string; name: string }
interface Product { id: string; name: string }

const SCOPE_LABELS: Record<string, string> = { all: 'Toda a Loja', categories: 'Categorias', products: 'Produtos' }

export default function AdminCuponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
    const [categories, setCategories] = useState<Category[]>([])
    const [products, setProducts] = useState<Product[]>([])

    const emptyForm = { code: '', type: 'percentage', value: '', scope: 'all', categoryIds: '' as string, productIds: '' as string, maxUses: '', expiresAt: '', active: true }
    const [form, setForm] = useState(emptyForm)

    const fetchCoupons = async () => {
        setLoading(true)
        const res = await fetch('/api/admin/coupons')
        const data = await res.json()
        setCoupons(Array.isArray(data) ? data : [])
        setLoading(false)
    }

    const fetchMeta = async () => {
        const [catRes, prodRes] = await Promise.all([
            fetch('/api/admin/categories'),
            fetch('/api/admin/products?limit=500'),
        ])
        const cats = await catRes.json()
        const prods = await prodRes.json()
        setCategories(Array.isArray(cats) ? cats : cats.categories || [])
        setProducts(Array.isArray(prods) ? prods : prods.products || [])
    }

    useEffect(() => { fetchCoupons(); fetchMeta() }, [])

    const openNew = () => {
        setForm(emptyForm)
        setEditingId(null)
        setShowForm(true)
    }

    const openEdit = (c: Coupon) => {
        setForm({
            code: c.code,
            type: c.type,
            value: String(c.value),
            scope: c.scope,
            categoryIds: c.categoryIds || '',
            productIds: c.productIds || '',
            maxUses: c.maxUses ? String(c.maxUses) : '',
            expiresAt: c.expiresAt ? c.expiresAt.slice(0, 16) : '',
            active: c.active,
        })
        setEditingId(c.id)
        setShowForm(true)
    }

    const handleSave = async () => {
        if (!form.code.trim()) { toast.error('Código é obrigatório.'); return }
        if (!form.value || Number(form.value) <= 0) { toast.error('Valor deve ser maior que 0.'); return }
        if (form.type === 'percentage' && Number(form.value) > 100) { toast.error('Porcentagem máxima é 100%.'); return }

        setSaving(true)
        try {
            const payload = {
                ...(editingId && { id: editingId }),
                code: form.code,
                type: form.type,
                value: Number(form.value),
                scope: form.scope,
                categoryIds: form.scope === 'categories' ? form.categoryIds : null,
                productIds: form.scope === 'products' ? form.productIds : null,
                maxUses: form.maxUses ? Number(form.maxUses) : null,
                expiresAt: form.expiresAt || null,
                active: form.active,
            }

            const res = await fetch('/api/admin/coupons', {
                method: editingId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Erro')
            toast.success(editingId ? 'Cupom atualizado!' : 'Cupom criado!')
            setShowForm(false)
            fetchCoupons()
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/admin/coupons?id=${id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Erro ao excluir')
            toast.success('Cupom excluído!')
            setConfirmDeleteId(null)
            fetchCoupons()
        } catch {
            toast.error('Erro ao excluir cupom.')
        }
    }

    const toggleActive = async (c: Coupon) => {
        try {
            await fetch('/api/admin/coupons', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: c.id, active: !c.active }),
            })
            fetchCoupons()
        } catch {
            toast.error('Erro ao atualizar status.')
        }
    }

    const toggleCategoryId = (catId: string) => {
        const ids = form.categoryIds ? form.categoryIds.split(',').filter(Boolean) : []
        const idx = ids.indexOf(catId)
        if (idx >= 0) ids.splice(idx, 1)
        else ids.push(catId)
        setForm(f => ({ ...f, categoryIds: ids.join(',') }))
    }

    const toggleProductId = (prodId: string) => {
        const ids = form.productIds ? form.productIds.split(',').filter(Boolean) : []
        const idx = ids.indexOf(prodId)
        if (idx >= 0) ids.splice(idx, 1)
        else ids.push(prodId)
        setForm(f => ({ ...f, productIds: ids.join(',') }))
    }

    const selectedCategoryIds = form.categoryIds ? form.categoryIds.split(',').filter(Boolean) : []
    const selectedProductIds = form.productIds ? form.productIds.split(',').filter(Boolean) : []

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Cupons de Desconto</h1>
                <button className="btn btn-primary" onClick={openNew} style={{ gap: 6 }}>
                    <Plus size={16} /> Novo Cupom
                </button>
            </div>

            {showForm && (
                <div className="card" style={{ marginBottom: 24, padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{editingId ? 'Editar Cupom' : 'Novo Cupom'}</h2>
                        <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Código do Cupom</label>
                            <input className="input" placeholder="Ex: DESCONTO10" value={form.code}
                                onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                                style={{ textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }} />
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Tipo de Desconto</label>
                            <select className="input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                                <option value="percentage">Porcentagem (%)</option>
                                <option value="fixed">Valor Fixo (R$)</option>
                            </select>
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Valor {form.type === 'percentage' ? '(%)' : '(R$)'}</label>
                            <input className="input" type="number" min="0" step={form.type === 'percentage' ? '1' : '0.01'}
                                placeholder={form.type === 'percentage' ? 'Ex: 10' : 'Ex: 50.00'}
                                value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} />
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Aplicar em</label>
                            <select className="input" value={form.scope} onChange={e => setForm(f => ({ ...f, scope: e.target.value }))}>
                                <option value="all">Toda a Loja</option>
                                <option value="categories">Categorias Selecionadas</option>
                                <option value="products">Produtos Selecionados</option>
                            </select>
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Quantidade Máxima de Uso</label>
                            <input className="input" type="number" min="1" placeholder="Ilimitado" value={form.maxUses}
                                onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))} />
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Data de Expiração</label>
                            <input className="input" type="datetime-local" value={form.expiresAt}
                                onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} />
                        </div>
                    </div>

                    {form.scope === 'categories' && (
                        <div style={{ marginTop: 16 }}>
                            <label className="form-label">Categorias</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {categories.map(cat => (
                                    <button key={cat.id} type="button" onClick={() => toggleCategoryId(cat.id)}
                                        style={{
                                            padding: '6px 14px', borderRadius: 20, fontSize: '0.82rem', fontWeight: 600,
                                            cursor: 'pointer', border: '1px solid',
                                            borderColor: selectedCategoryIds.includes(cat.id) ? 'var(--primary)' : 'var(--border)',
                                            background: selectedCategoryIds.includes(cat.id) ? 'rgba(99,102,241,0.15)' : 'transparent',
                                            color: selectedCategoryIds.includes(cat.id) ? 'var(--primary)' : 'var(--text-muted)',
                                        }}>
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {form.scope === 'products' && (
                        <div style={{ marginTop: 16 }}>
                            <label className="form-label">Produtos</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, maxHeight: 200, overflowY: 'auto' }}>
                                {products.map(prod => (
                                    <button key={prod.id} type="button" onClick={() => toggleProductId(prod.id)}
                                        style={{
                                            padding: '6px 14px', borderRadius: 20, fontSize: '0.82rem', fontWeight: 600,
                                            cursor: 'pointer', border: '1px solid',
                                            borderColor: selectedProductIds.includes(prod.id) ? 'var(--primary)' : 'var(--border)',
                                            background: selectedProductIds.includes(prod.id) ? 'rgba(99,102,241,0.15)' : 'transparent',
                                            color: selectedProductIds.includes(prod.id) ? 'var(--primary)' : 'var(--text-muted)',
                                        }}>
                                        {prod.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.88rem' }}>
                            <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} />
                            Cupom ativo
                        </label>
                    </div>

                    <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                        <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
                        <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ gap: 6 }}>
                            {saving ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={15} />}
                            {editingId ? 'Salvar' : 'Criar Cupom'}
                        </button>
                    </div>
                </div>
            )}

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                        <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }} />
                    </div>
                ) : coupons.length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                        Nenhum cupom cadastrado.
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'var(--bg-card2)', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                    {['Código', 'Desconto', 'Aplicar em', 'Usos', 'Expira', 'Status', ''].map(h => (
                                        <th key={h} style={{ textAlign: 'left', padding: '12px 16px' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {coupons.map(c => (
                                    <tr key={c.id} style={{ borderTop: '1px solid var(--border)', fontSize: '0.87rem' }}>
                                        <td style={{ padding: '12px 16px' }}>
                                            <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary)', background: 'rgba(99,102,241,0.1)', padding: '3px 10px', borderRadius: 6 }}>
                                                {c.code}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                                            {c.type === 'percentage' ? `${c.value}%` : `R$ ${c.value.toFixed(2).replace('.', ',')}`}
                                        </td>
                                        <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                                            {SCOPE_LABELS[c.scope] || c.scope}
                                        </td>
                                        <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                                            {c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ''}
                                        </td>
                                        <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                                            {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('pt-BR') : 'Sem prazo'}
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <button onClick={() => toggleActive(c)}
                                                style={{
                                                    padding: '4px 12px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600,
                                                    border: 'none', cursor: 'pointer',
                                                    background: c.active ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.1)',
                                                    color: c.active ? '#22c55e' : '#ef4444',
                                                }}>
                                                {c.active ? 'Ativo' : 'Inativo'}
                                            </button>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <button onClick={() => openEdit(c)} title="Editar"
                                                    style={{ padding: '5px 8px', background: 'var(--bg-card2)', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', color: 'var(--text-muted)' }}>
                                                    <Pencil size={14} />
                                                </button>
                                                {confirmDeleteId === c.id ? (
                                                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                                                        <button onClick={() => handleDelete(c.id)}
                                                            style={{ padding: '5px 10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>
                                                            Confirmar
                                                        </button>
                                                        <button onClick={() => setConfirmDeleteId(null)}
                                                            style={{ padding: '5px 8px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                                                            <X size={12} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button onClick={() => setConfirmDeleteId(c.id)} title="Excluir"
                                                        style={{ padding: '5px 8px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 6, cursor: 'pointer', color: '#ef4444' }}>
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
