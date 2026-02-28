'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Tag, Check, X } from 'lucide-react'

interface Category {
    id: string
    name: string
    slug: string
    _count: { products: number }
}

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [form, setForm] = useState({ name: '', slug: '' })
    const [saving, setSaving] = useState(false)

    async function load() {
        setLoading(true)
        const r = await fetch('/api/admin/categories')
        const d = await r.json()
        setCategories(d.categories || [])
        setLoading(false)
    }
    useEffect(() => { load() }, [])

    function openCreate() { setEditingId(null); setForm({ name: '', slug: '' }); setShowForm(true) }
    function openEdit(c: Category) { setEditingId(c.id); setForm({ name: c.name, slug: c.slug }); setShowForm(true) }
    function cancel() { setShowForm(false); setEditingId(null); setForm({ name: '', slug: '' }) }

    // Auto-gera slug a partir do nome
    function handleNameChange(name: string) {
        const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        setForm({ name, slug })
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault()
        setSaving(true)
        const url = editingId ? `/api/admin/categories/${editingId}` : '/api/admin/categories'
        const method = editingId ? 'PATCH' : 'POST'
        const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
        const d = await r.json()
        setSaving(false)
        if (!r.ok) { toast.error(d.error); return }
        toast.success(editingId ? 'Categoria atualizada!' : 'Categoria criada!')
        cancel(); load()
    }

    async function handleDelete(id: string, name: string, count: number) {
        const msg = count > 0
            ? `Excluir "${name}"? Os ${count} produto(s) ficarão sem categoria.`
            : `Excluir categoria "${name}"?`
        if (!confirm(msg)) return
        const r = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
        if (r.ok) { toast.success('Categoria removida.'); load() }
        else toast.error('Erro ao remover.')
    }

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Categorias</h1>
                    <span className="badge badge-blue">{categories.length}</span>
                </div>
                <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Nova Categoria</button>
            </div>

            {/* Formulário inline */}
            {showForm && (
                <div className="card fade-in" style={{ marginBottom: 24, maxWidth: 520 }}>
                    <h3 style={{ fontWeight: 700, marginBottom: 16 }}>{editingId ? 'Editar Categoria' : 'Nova Categoria'}</h3>
                    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div className="form-group">
                            <label className="form-label">Nome *</label>
                            <input className="input" value={form.name} onChange={e => handleNameChange(e.target.value)} placeholder="Ex: Camisetas" required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Slug (URL)</label>
                            <input className="input" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                                placeholder="camisetas" style={{ fontFamily: 'monospace', fontSize: '0.88rem' }} />
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 4 }}>
                                Gerado automaticamente. Usado na URL: /categoria/<strong>{form.slug || 'nome'}</strong>
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                <Check size={15} /> {saving ? 'Salvando...' : 'Salvar'}
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={cancel}>
                                <X size={15} /> Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Grid de categorias */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner" /></div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                    {categories.map(cat => (
                        <div key={cat.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px' }}>
                            <div style={{ width: 42, height: 42, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Tag size={20} color="white" />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 2 }}>{cat.name}</p>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontFamily: 'monospace' }}>{cat.slug}</p>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 2 }}>
                                    {cat._count.products} produto{cat._count.products !== 1 ? 's' : ''}
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                                <button onClick={() => openEdit(cat)}
                                    style={{ padding: '6px 8px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}
                                    title="Editar">
                                    <Pencil size={14} />
                                </button>
                                <button onClick={() => handleDelete(cat.id, cat.name, cat._count.products)}
                                    style={{ padding: '6px 8px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'transparent', color: 'var(--error)', cursor: 'pointer' }}
                                    title="Excluir">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {categories.length === 0 && (
                        <div className="card" style={{ padding: 40, textAlign: 'center', gridColumn: '1/-1' }}>
                            <Tag size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
                            <p style={{ color: 'var(--text-muted)' }}>Nenhuma categoria criada ainda.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
