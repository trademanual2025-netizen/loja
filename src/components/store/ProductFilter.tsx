'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { ProductCard } from './ProductCard'
import { Search, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react'
import { Locale, translateDb } from '@/lib/i18n'

interface Category {
    id: string
    name: string
    slug: string
}

interface Product {
    id: string
    name: any
    slug: string
    price: number
    comparePrice?: number | null
    images: string[]
    stock: number
    variants?: { id: string }[]
}

interface Props {
    initialProducts: Product[]
    initialTotal?: number
    initialPages?: number
    categories: Category[]
    dict: any
    locale: Locale
    initialSearch?: string
    initialCategory?: string
    productsPerPage?: number
    installments?: number
    installmentsMinValue?: number
}

const sortLabels = {
    pt: { newest: 'Mais recentes', price_asc: 'Menor preço', price_desc: 'Maior preço', name_asc: 'A → Z', name_desc: 'Z → A' },
    en: { newest: 'Newest', price_asc: 'Price: Low to High', price_desc: 'Price: High to Low', name_asc: 'A → Z', name_desc: 'Z → A' },
    es: { newest: 'Más recientes', price_asc: 'Menor precio', price_desc: 'Mayor precio', name_asc: 'A → Z', name_desc: 'Z → A' },
}

export function ProductFilter({ initialProducts, initialTotal, initialPages, categories, dict, locale, initialSearch = '', initialCategory = '', productsPerPage = 24, installments = 0, installmentsMinValue = 0 }: Props) {
    const [products, setProducts] = useState<Product[]>(initialProducts)
    const [search, setSearch] = useState(initialSearch)
    const [category, setCategory] = useState(initialCategory)
    const [sort, setSort] = useState('newest')
    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(initialPages || 1)
    const [totalProducts, setTotalProducts] = useState(initialTotal || initialProducts.length)
    const abortRef = useRef<AbortController | null>(null)
    const gridRef = useRef<HTMLDivElement>(null)

    const labels = sortLabels[locale] || sortLabels.pt

    const fetchProducts = useCallback(async (searchVal: string, categoryVal: string, sortVal: string, pageVal: number) => {
        if (abortRef.current) abortRef.current.abort()
        const controller = new AbortController()
        abortRef.current = controller

        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (searchVal) params.set('search', searchVal)
            if (categoryVal) params.set('category', categoryVal)
            params.set('sort', sortVal)
            params.set('page', String(pageVal))
            params.set('limit', String(productsPerPage))

            const res = await fetch(`/api/products?${params.toString()}`, { signal: controller.signal })
            if (!res.ok) return
            const data = await res.json()
            setProducts(data.products)
            setTotalPages(data.pages || 1)
            setTotalProducts(data.total || 0)
        } catch (e: any) {
            if (e?.name === 'AbortError') return
        } finally {
            setLoading(false)
        }
    }, [productsPerPage])

    const handleCategoryChange = useCallback((newCategory: string) => {
        setCategory(newCategory)
        setPage(1)
        fetchProducts(search, newCategory, sort, 1)
    }, [search, sort, fetchProducts])

    const handleSortChange = useCallback((newSort: string) => {
        setSort(newSort)
        setPage(1)
        fetchProducts(search, category, newSort, 1)
    }, [search, category, fetchProducts])

    const handleSearch = useCallback(() => {
        setPage(1)
        fetchProducts(search, category, sort, 1)
    }, [search, category, sort, fetchProducts])

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleSearch()
        }
    }, [handleSearch])

    const goToPage = useCallback((newPage: number) => {
        if (newPage < 1 || newPage > totalPages) return
        setPage(newPage)
        fetchProducts(search, category, sort, newPage)
        if (gridRef.current) {
            gridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
    }, [search, category, sort, totalPages, fetchProducts])

    const paginationRange = () => {
        const range: number[] = []
        const delta = 2
        const left = Math.max(2, page - delta)
        const right = Math.min(totalPages - 1, page + delta)

        range.push(1)
        if (left > 2) range.push(-1)
        for (let i = left; i <= right; i++) range.push(i)
        if (right < totalPages - 1) range.push(-1)
        if (totalPages > 1) range.push(totalPages)
        return range
    }

    return (
        <>
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ flex: '2 1 250px', display: 'flex', gap: 0 }}>
                    <input
                        type="text"
                        placeholder={dict.store.search}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="input"
                        style={{ flex: 1, borderTopRightRadius: 0, borderBottomRightRadius: 0, borderRight: 'none' }}
                    />
                    <button
                        onClick={handleSearch}
                        className="btn btn-primary"
                        style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0, padding: '0 20px' }}
                    >
                        <Search size={18} />
                    </button>
                </div>
                <select
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="input"
                    style={{ flex: '1 1 150px', maxWidth: 'unset' }}
                >
                    <option value="">{dict.store.categoryAll}</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.slug}>{translateDb(c.name, locale)}</option>
                    ))}
                </select>
                <select
                    value={sort}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="input"
                    style={{ flex: '0 1 180px', maxWidth: 'unset' }}
                >
                    <option value="newest">{labels.newest}</option>
                    <option value="price_asc">{labels.price_asc}</option>
                    <option value="price_desc">{labels.price_desc}</option>
                    <option value="name_asc">{labels.name_asc}</option>
                    <option value="name_desc">{labels.name_desc}</option>
                </select>
            </div>

            {totalProducts > 0 && (
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                    {totalProducts} {totalProducts === 1 ? dict.store.products : dict.store.productsPlural}
                    {totalPages > 1 && ` — ${dict.store.page} ${page} ${dict.store.of} ${totalPages}`}
                </p>
            )}

            <div ref={gridRef}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px 0' }}>
                        <span className="spinner" />
                    </div>
                ) : products.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '60px 0' }}>
                        <p style={{ fontSize: '1.2rem' }}>{dict.store.noProducts}</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'clamp(12px, 2vw, 24px)' }}>
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} dict={dict.product} locale={locale} installments={installments} installmentsMinValue={installmentsMinValue} />
                        ))}
                    </div>
                )}
            </div>

            {totalPages > 1 && !loading && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 32, flexWrap: 'wrap' }}>
                    <button
                        onClick={() => goToPage(page - 1)}
                        disabled={page === 1}
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: 36, height: 36, borderRadius: 8,
                            border: '1px solid var(--border)', background: 'var(--bg-card)',
                            cursor: page === 1 ? 'not-allowed' : 'pointer',
                            opacity: page === 1 ? 0.4 : 1, color: 'var(--text-body)'
                        }}
                    >
                        <ChevronLeft size={16} />
                    </button>
                    {paginationRange().map((p, i) =>
                        p === -1 ? (
                            <span key={`dots-${i}`} style={{ padding: '0 4px', color: 'var(--text-muted)' }}>...</span>
                        ) : (
                            <button
                                key={p}
                                onClick={() => goToPage(p)}
                                style={{
                                    minWidth: 36, height: 36, borderRadius: 8,
                                    border: `1px solid ${p === page ? 'var(--primary)' : 'var(--border)'}`,
                                    background: p === page ? 'var(--primary)' : 'var(--bg-card)',
                                    color: p === page ? 'white' : 'var(--text-body)',
                                    cursor: 'pointer', fontWeight: p === page ? 700 : 500,
                                    fontSize: '0.85rem', padding: '0 8px',
                                    transition: 'all 0.15s'
                                }}
                            >
                                {p}
                            </button>
                        )
                    )}
                    <button
                        onClick={() => goToPage(page + 1)}
                        disabled={page === totalPages}
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: 36, height: 36, borderRadius: 8,
                            border: '1px solid var(--border)', background: 'var(--bg-card)',
                            cursor: page === totalPages ? 'not-allowed' : 'pointer',
                            opacity: page === totalPages ? 0.4 : 1, color: 'var(--text-body)'
                        }}
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}
        </>
    )
}
