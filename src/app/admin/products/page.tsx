'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, Pencil, Trash2, Search, ImagePlus, X, Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Category { id: string; name: string }
interface ProductOption { name: string; values: string[] }
interface ProductVariant { id?: string; name: string; price?: number | string; stock: number | string; sku?: string; image?: string }

interface Product {
    id: string
    name: string
    slug: string
    price: number
    comparePrice?: number
    stock: number
    active: boolean
    images: string[]
    bannerUrl?: string
    categoryId?: string
    category?: Category
    options?: ProductOption[]
    variants?: ProductVariant[]
    reserveMinutes?: number
    createdAt: string
}

const emptyForm = { name: '', description: '', price: '', comparePrice: '', hasComparePrice: false, stock: '0', bannerUrl: '', active: true, categoryId: '', weight: '', height: '', width: '', length: '', reserveMinutes: '30' }

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [form, setForm] = useState(emptyForm)
    const [images, setImages] = useState<string[]>([])
    const [options, setOptions] = useState<ProductOption[]>([])
    const [variants, setVariants] = useState<ProductVariant[]>([])
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [categories, setCategories] = useState<Category[]>([])
    const [uploading, setUploading] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
    const fileRef = useRef<HTMLInputElement>(null)
    const bannerRef = useRef<HTMLInputElement>(null)
    const LIMIT = 20

    const fetchProducts = async () => {
        setLoading(true)
        const res = await fetch(`/api/admin/products?page=${page}&limit=${LIMIT}&search=${encodeURIComponent(search)}`)
        const data = await res.json()
        setProducts(data.products || [])
        setTotal(data.total || 0)
        setLoading(false)
    }

    const fetchCategories = async () => {
        const res = await fetch('/api/admin/categories').catch(() => null)
        if (res?.ok) { const data = await res.json(); setCategories(data.categories || []) }
    }

    useEffect(() => { fetchProducts(); fetchCategories() }, [page, search])

    const openCreate = () => {
        setEditingId(null);
        setForm(emptyForm);
        setImages([]);
        setOptions([]);
        setVariants([]);
        setError('');
        setShowModal(true)
    }
    const openEdit = (p: Product) => {
        setEditingId(p.id)
        setForm({
            name: p.name,
            description: '',
            price: String(p.price),
            comparePrice: p.comparePrice ? String(p.comparePrice) : '',
            hasComparePrice: !!p.comparePrice,
            stock: String(p.stock),
            bannerUrl: p.bannerUrl || '',
            active: p.active,
            categoryId: p.categoryId || '',
            weight: '', height: '', width: '', length: '',
            reserveMinutes: String(p.reserveMinutes ?? 30)
        })
        setImages(p.images || [])
        setOptions(p.options || [])
        setVariants(p.variants || [])

        fetch(`/api/admin/products/${p.id}`).then(res => res.json()).then(data => {
            setForm(f => ({
                ...f,
                description: data.description || '',
                weight: data.weight ? String(data.weight) : '',
                height: data.height ? String(data.height) : '',
                width: data.width ? String(data.width) : '',
                length: data.length ? String(data.length) : '',
                reserveMinutes: String(data.reserveMinutes ?? 30),
            }))
            if (data.options) setOptions(data.options)
            if (data.variants) setVariants(data.variants)
        })

        setError('')
        setShowModal(true)
    }

    const uploadFile = async (file: File, field: 'images' | 'banner') => {
        setUploading(true)
        const fd = new FormData(); fd.append('file', file)
        const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
        setUploading(false)
        if (!res.ok) { setError('Erro no upload.'); return }
        const data = await res.json()
        if (field === 'banner') setForm(f => ({ ...f, bannerUrl: data.url }))
        else setImages(prev => [...prev, data.url])
    }

    const addOption = () => setOptions([...options, { name: '', values: [] }])
    const removeOption = (idx: number) => setOptions(options.filter((_, i) => i !== idx))
    const updateOptionName = (idx: number, name: string) => {
        const next = [...options]; next[idx].name = name; setOptions(next)
    }
    const addOptionValue = (idx: number, val: string) => {
        if (!val.trim()) return
        const next = [...options];
        if (!next[idx].values.includes(val)) {
            next[idx].values = [...next[idx].values, val.trim()]
            setOptions(next)
        }
    }
    const removeOptionValue = (optIdx: number, valIdx: number) => {
        const next = [...options]; next[optIdx].values = next[optIdx].values.filter((_, i) => i !== valIdx); setOptions(next)
    }

    const generateVariants = () => {
        if (options.length === 0 || options.some(o => !o.name || o.values.length === 0)) {
            toast.error('Preencha as opções corretamente antes de gerar.'); return
        }

        let combinations: string[][] = [[]];
        for (const option of options) {
            const next: string[][] = [];
            for (const comb of combinations) {
                for (const value of option.values) {
                    next.push([...comb, value]);
                }
            }
            combinations = next;
        }

        const newVariants = combinations.map(c => {
            const name = c.join(' / ')
            const existing = variants.find(v => v.name === name)
            return existing || { name, price: form.price, stock: form.stock, sku: '' }
        })
        setVariants(newVariants)
    }

    const save = async () => {
        if (!form.name) { toast.error('O nome do produto é obrigatório.'); return }
        const hasVariants = (variants || []).length > 0
        if (!form.price && !hasVariants) { toast.error('O preço ou ao menos uma variante é obrigatório.'); return }

        setSaving(true)
        try {
            const safeParseFloat = (val: any) => {
                if (val === undefined || val === null || val === '') return null
                const parsed = parseFloat(String(val).replace(',', '.'))
                return isNaN(parsed) ? null : parsed
            }
            const safeParseInt = (val: any) => {
                if (val === undefined || val === null || val === '') return 0
                const parsed = parseInt(String(val))
                return isNaN(parsed) ? 0 : parsed
            }

            const body = {
                ...form,
                price: safeParseFloat(form.price) || 0,
                comparePrice: safeParseFloat(form.comparePrice),
                stock: safeParseInt(form.stock),
                weight: safeParseFloat(form.weight),
                height: safeParseFloat(form.height),
                width: safeParseFloat(form.width),
                length: safeParseFloat(form.length),
                reserveMinutes: Math.max(1, parseInt(form.reserveMinutes) || 30),
                images,
                options: (options || []).filter(o => o.name && o.name.trim() !== ''),
                variants: (variants || []).map(v => ({
                    ...v,
                    price: safeParseFloat(v.price),
                    stock: safeParseInt(v.stock),
                    image: v.image || null
                }))
            }
            const res = await fetch(editingId ? `/api/admin/products/${editingId}` : '/api/admin/products', {
                method: editingId ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })

            const text = await res.text()
            let data: any = {}
            try { data = JSON.parse(text) } catch (e) { }

            if (!res.ok) {
                throw new Error(data.error || `Erro ${res.status}: ${text.slice(0, 100)}`)
            }

            toast.success('Produto salvo com sucesso!')
            setShowModal(false)
            fetchProducts()
        } catch (err: any) {
            console.error('Save error:', err)
            toast.error(err.message || 'Erro inesperado ao salvar')
        } finally {
            setSaving(false)
        }
    }

    const deleteProduct = async (id: string) => {
        await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
        setDeleteConfirm(null); fetchProducts()
    }

    const pages = Math.ceil(total / LIMIT)

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Produtos</h1>
                <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Novo Produto</button>
            </div>

            {/* Search */}
            <div className="card" style={{ marginBottom: 20, padding: '14px 18px' }}>
                <div style={{ position: 'relative', maxWidth: 360 }}>
                    <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="input" placeholder="Buscar produtos..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} style={{ paddingLeft: 36 }} />
                </div>
            </div>

            {/* Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}><Loader2 size={24} style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }} /></div>
                ) : products.length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Nenhum produto encontrado.</div>
                ) : (
                    <div className="table-responsive">
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'var(--bg-card2)', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                    {['Produto', 'Preço', 'Estoque', 'Categoria', 'Status', 'Ações'].map(h => (
                                        <th key={h} style={{ textAlign: 'left', padding: '12px 16px' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(p => (
                                    <tr key={p.id} style={{ borderTop: '1px solid var(--border)', fontSize: '0.88rem' }}>
                                        <td style={{ padding: '12px 16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                {p.images[0] ? (
                                                    <img src={p.images[0]} alt="" style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--border)' }} />
                                                ) : (
                                                    <div style={{ width: 44, height: 44, borderRadius: 8, background: 'var(--bg-card2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <ImagePlus size={18} color="var(--text-muted)" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p style={{ fontWeight: 600 }}>{p.name}</p>
                                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>/{p.slug}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <p style={{ fontWeight: 700, color: 'var(--primary)' }}>R$ {p.price.toFixed(2).replace('.', ',')}</p>
                                            {p.comparePrice && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>R$ {p.comparePrice.toFixed(2).replace('.', ',')}</p>}
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <span className={`badge ${p.stock > 0 ? 'badge-green' : 'badge-red'}`}>{p.stock} un.</span>
                                        </td>
                                        <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>{p.category?.name || '—'}</td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <span className={`badge ${p.active ? 'badge-green' : 'badge-yellow'}`}>{p.active ? 'Ativo' : 'Inativo'}</span>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button onClick={() => openEdit(p)} style={{ padding: '6px 10px', background: 'var(--bg-card2)', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', color: 'var(--text-muted)' }} title="Editar">
                                                    <Pencil size={14} />
                                                </button>
                                                <button onClick={() => setDeleteConfirm(p.id)} style={{ padding: '6px 10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 6, cursor: 'pointer', color: 'var(--error)' }} title="Excluir">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {pages > 1 && (
                    <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'flex-end' }}>
                        <button className="btn btn-secondary" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '6px 14px' }}>Anterior</button>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{page} / {pages}</span>
                        <button className="btn btn-secondary" onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} style={{ padding: '6px 14px' }}>Próxima</button>
                    </div>
                )}
            </div>

            {/* Delete confirm */}
            {deleteConfirm && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div className="card" style={{ maxWidth: 380, width: '90%', textAlign: 'center' }}>
                        <Trash2 size={36} color="var(--error)" style={{ marginBottom: 12 }} />
                        <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Excluir produto?</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: 20 }}>Esta ação não pode ser desfeita.</p>
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                            <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancelar</button>
                            <button className="btn btn-danger" onClick={() => deleteProduct(deleteConfirm)}>Excluir</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px 16px' }}>
                    <div className="card" style={{ width: '100%', maxWidth: 720, maxHeight: '92vh', display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.2s ease', padding: 0, overflow: 'hidden' }}>
                        {/* Header */}
                        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-card)' }}>
                            <h2 style={{ fontWeight: 700, fontSize: '1.1rem' }}>{editingId ? 'Editar Produto' : 'Novo Produto'}</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
                        </div>

                        {/* Body */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div className="form-group">
                                    <label className="form-label">Nome *</label>
                                    <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Camiseta Premium" />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Descrição</label>
                                    <textarea className="input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Descrição do produto..." rows={3} style={{ resize: 'vertical' }} />
                                </div>

                                {/* Preço */}
                                <div style={{ background: 'var(--bg-card2)', borderRadius: 10, padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label">Preço de venda (R$) *</label>
                                        <input className="input" type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0,00" />
                                    </div>

                                    {/* Toggle ancoragem */}
                                    <div>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
                                            <button type="button" onClick={() => setForm(f => ({ ...f, hasComparePrice: !f.hasComparePrice, comparePrice: !f.hasComparePrice ? f.comparePrice : '' }))}
                                                style={{ width: 40, height: 22, borderRadius: 11, background: form.hasComparePrice ? 'var(--primary)' : 'var(--border)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                                                <span style={{ position: 'absolute', top: 3, left: form.hasComparePrice ? 20 : 3, width: 16, height: 16, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
                                            </button>
                                            <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Mostrar preço original riscado</span>
                                        </label>
                                    </div>

                                    {form.hasComparePrice && (
                                        <div className="form-group fade-in" style={{ marginBottom: 0 }}>
                                            <label className="form-label">Preço original / De (R$)</label>
                                            <input className="input" type="number" step="0.01" value={form.comparePrice} onChange={e => setForm(f => ({ ...f, comparePrice: e.target.value }))} placeholder="Ex: 99,90" />
                                        </div>
                                    )}
                                </div>

                                <div className="grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Estoque Total</label>
                                        <input className="input" type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Categoria</label>
                                        <select className="input" value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}>
                                            <option value="">Sem categoria</option>
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Reserva de Estoque no Carrinho (minutos)</label>
                                    <input className="input" type="number" min="1" max="1440" value={form.reserveMinutes} onChange={e => setForm(f => ({ ...f, reserveMinutes: e.target.value }))} />
                                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>Tempo que o item fica reservado ao ser adicionado ao carrinho. Padrão: 30 minutos.</span>
                                </div>

                                {/* Envio */}
                                <div style={{ padding: '20px 0', borderTop: '1px solid var(--border)', marginTop: 8 }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>Envio</h3>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 12 }}>Deixe em branco para usar os valores padrão das configurações da loja.</p>
                                    <div className="grid-2" style={{ marginBottom: 12 }}>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label">Peso (kg)</label>
                                            <input className="input" type="number" step="0.01" placeholder="Ex: 0.5" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label">Comprimento (cm)</label>
                                            <input className="input" type="number" step="1" placeholder="Ex: 20" value={form.length} onChange={e => setForm(f => ({ ...f, length: e.target.value }))} />
                                        </div>
                                    </div>
                                    <div className="grid-2">
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label">Altura (cm)</label>
                                            <input className="input" type="number" step="1" placeholder="Ex: 10" value={form.height} onChange={e => setForm(f => ({ ...f, height: e.target.value }))} />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label">Largura (cm)</label>
                                            <input className="input" type="number" step="1" placeholder="Ex: 15" value={form.width} onChange={e => setForm(f => ({ ...f, width: e.target.value }))} />
                                        </div>
                                    </div>
                                </div>

                                {/* Variações */}
                                <div style={{ padding: '20px 0', borderTop: '1px solid var(--border)', marginTop: 8 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                                        <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Variações</h3>
                                        <button className="btn btn-secondary" onClick={addOption} style={{ padding: '6px 12px', fontSize: '0.85rem' }}><Plus size={14} /> Atributo Personalizado</button>
                                    </div>

                                    {options.length > 0 && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 24 }}>
                                            {options.map((opt, optIdx) => (
                                                <div key={optIdx} className="card" style={{ background: 'var(--bg-card2)', padding: 16 }}>
                                                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
                                                        <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                                                            <label className="form-label">Nome do Atributo (ex: Tamanho, Cor, Material)</label>
                                                            <input className="input" placeholder="Atributo..." value={opt.name} onChange={e => updateOptionName(optIdx, e.target.value)} />
                                                        </div>
                                                        <button onClick={() => removeOption(optIdx)} style={{ marginTop: 28, background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}><Trash2 size={18} /></button>
                                                    </div>
                                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                                        <label className="form-label">Opções Disponíveis</label>
                                                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                                                            {opt.values.map((v, vIdx) => (
                                                                <span key={vIdx} className="badge" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                                                                    {v}
                                                                    <button onClick={() => removeOptionValue(optIdx, vIdx)} style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer', color: 'var(--text-muted)' }}><X size={12} /></button>
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <input className="input" placeholder="Adicionar opção e aperte Enter..." onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addOptionValue(optIdx, (e.target as HTMLInputElement).value); (e.target as HTMLInputElement).value = '' } }} />
                                                    </div>
                                                </div>
                                            ))}
                                            <button className="btn btn-primary" onClick={generateVariants} style={{ alignSelf: 'center' }}>Gerar Combinações</button>
                                        </div>
                                    )}

                                    {variants.length > 0 && (
                                        <div>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 10 }}>Foto da variante: 800x800px (1:1 quadrado). Máx. 5MB. Formatos: JPG, PNG, WEBP.</p>
                                            <div className="table-responsive">
                                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                                <thead>
                                                    <tr style={{ background: 'var(--bg-card2)', color: 'var(--text-muted)' }}>
                                                        <th style={{ textAlign: 'left', padding: '10px' }}>Foto</th>
                                                        <th style={{ textAlign: 'left', padding: '10px' }}>Variante</th>
                                                        <th style={{ textAlign: 'left', padding: '10px' }}>Preço (Opcional)</th>
                                                        <th style={{ textAlign: 'left', padding: '10px' }}>Estoque</th>
                                                        <th style={{ textAlign: 'left', padding: '10px', width: 40 }}></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {variants.map((v, i) => (
                                                        <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                                                            <td style={{ padding: '10px' }}>
                                                                <label style={{ cursor: 'pointer', display: 'block' }}>
                                                                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={async e => {
                                                                        const file = e.target.files?.[0]
                                                                        if (!file) return
                                                                        setUploading(true)
                                                                        const fd = new FormData(); fd.append('file', file)
                                                                        const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
                                                                        setUploading(false)
                                                                        if (!res.ok) { toast.error('Erro no upload.'); return }
                                                                        const data = await res.json()
                                                                        const next = [...variants]; next[i].image = data.url; setVariants(next)
                                                                    }} />
                                                                    {v.image ? (
                                                                        <div style={{ position: 'relative', width: 48, height: 48 }}>
                                                                            <img src={v.image} alt="" style={{ width: 48, height: 48, borderRadius: 6, objectFit: 'cover', border: '1px solid var(--border)' }} />
                                                                            <button type="button" onClick={e => { e.preventDefault(); e.stopPropagation(); const next = [...variants]; next[i].image = undefined; setVariants(next) }}
                                                                                style={{ position: 'absolute', top: -4, right: -4, background: 'var(--error)', border: 'none', borderRadius: '50%', width: 16, height: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                                                                <X size={10} />
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <div style={{ width: 48, height: 48, borderRadius: 6, border: '1px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-card2)' }}>
                                                                            <ImagePlus size={16} color="var(--text-muted)" />
                                                                        </div>
                                                                    )}
                                                                </label>
                                                            </td>
                                                            <td style={{ padding: '10px', fontWeight: 600 }}>{v.name}</td>
                                                            <td style={{ padding: '10px' }}>
                                                                <input className="input" type="number" step="0.01" value={v.price} onChange={e => { const next = [...variants]; next[i].price = e.target.value; setVariants(next) }} placeholder={form.price} style={{ height: 32, padding: '0 8px' }} />
                                                            </td>
                                                            <td style={{ padding: '10px' }}>
                                                                <input className="input" type="number" value={v.stock} onChange={e => { const next = [...variants]; next[i].stock = e.target.value; setVariants(next) }} style={{ height: 32, padding: '0 8px' }} />
                                                            </td>
                                                            <td style={{ padding: '10px' }}>
                                                                <button onClick={() => setVariants(variants.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={16} /></button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Banner */}
                                <div className="form-group">
                                    <label className="form-label" style={{ marginBottom: 4 }}>Banner do Produto</label>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: 12 }}>Tamanho ideal: 1200x400px (Formato horizontal).</span>
                                    {form.bannerUrl && (
                                        <div style={{ position: 'relative', marginBottom: 8, borderRadius: 8, overflow: 'hidden', maxHeight: 120 }}>
                                            <img src={form.bannerUrl} alt="" style={{ width: '100%', height: 120, objectFit: 'cover' }} />
                                            <button onClick={() => setForm(f => ({ ...f, bannerUrl: '' }))} style={{ position: 'absolute', top: 6, right: 6, background: '#000a', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}><X size={14} /></button>
                                        </div>
                                    )}
                                    <input type="file" accept="image/*" ref={bannerRef} style={{ display: 'none' }} onChange={e => e.target.files?.[0] && uploadFile(e.target.files[0], 'banner')} />
                                    <button className="btn btn-secondary" onClick={() => bannerRef.current?.click()} style={{ justifyContent: 'flex-start' }}>{uploading ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <ImagePlus size={15} />} {form.bannerUrl ? 'Trocar banner' : 'Upload banner'}</button>
                                </div>

                                {/* Images */}
                                <div className="form-group">
                                    <label className="form-label" style={{ marginBottom: 4 }}>Galeria de Imagens</label>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: 12 }}>Tamanho ideal: 800x800px (Formato quadrado 1:1).</span>
                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                                        {images.map((img, i) => (
                                            <div key={i} style={{ position: 'relative', width: 80, height: 80, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
                                                <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                <button onClick={() => setImages(imgs => imgs.filter((_, j) => j !== i))} style={{ position: 'absolute', top: 2, right: 2, background: '#000a', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}><X size={11} /></button>
                                            </div>
                                        ))}
                                    </div>
                                    <input type="file" accept="image/*" multiple ref={fileRef} style={{ display: 'none' }} onChange={async e => { for (const f of Array.from(e.target.files || [])) await uploadFile(f, 'images') }} />
                                    <button className="btn btn-secondary" onClick={() => fileRef.current?.click()} style={{ justifyContent: 'flex-start' }}>{uploading ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <ImagePlus size={15} />} Adicionar imagens</button>
                                </div>

                                {/* Active */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <button onClick={() => setForm(f => ({ ...f, active: !f.active }))} style={{ width: 44, height: 24, borderRadius: 12, background: form.active ? 'var(--primary)' : 'var(--border)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
                                        <span style={{ position: 'absolute', top: 3, left: form.active ? 22 : 3, width: 18, height: 18, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
                                    </button>
                                    <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{form.active ? 'Produto ativo' : 'Produto inativo'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 12, justifyContent: 'flex-end', background: 'var(--bg-card)', zIndex: 10 }}>
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                            <button className="btn btn-primary" onClick={save} disabled={saving}>
                                {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={16} />} Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
