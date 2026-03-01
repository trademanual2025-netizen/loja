'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { ProductCard } from './ProductCard'
import { Search } from 'lucide-react'
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
    categories: Category[]
    dict: any
    locale: Locale
    initialSearch?: string
    initialCategory?: string
}

export function ProductFilter({ initialProducts, categories, dict, locale, initialSearch = '', initialCategory = '' }: Props) {
    const [products, setProducts] = useState<Product[]>(initialProducts)
    const [search, setSearch] = useState(initialSearch)
    const [category, setCategory] = useState(initialCategory)
    const [loading, setLoading] = useState(false)
    const abortRef = useRef<AbortController | null>(null)

    const fetchProducts = useCallback(async (searchVal: string, categoryVal: string) => {
        if (abortRef.current) abortRef.current.abort()
        const controller = new AbortController()
        abortRef.current = controller

        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (searchVal) params.set('search', searchVal)
            if (categoryVal) params.set('category', categoryVal)
            params.set('limit', '48')

            const res = await fetch(`/api/products?${params.toString()}`, { signal: controller.signal })
            if (!res.ok) return
            const data = await res.json()
            setProducts(data.products)
        } catch (e: any) {
            if (e?.name === 'AbortError') return
        } finally {
            setLoading(false)
        }
    }, [])

    const handleCategoryChange = useCallback((newCategory: string) => {
        setCategory(newCategory)
        fetchProducts(search, newCategory)
    }, [search, fetchProducts])

    const handleSearch = useCallback(() => {
        fetchProducts(search, category)
    }, [search, category, fetchProducts])

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleSearch()
        }
    }, [handleSearch])

    return (
        <>
            <div style={{ display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap' }}>
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
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                    <span className="spinner" />
                </div>
            ) : products.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '60px 0' }}>
                    <p style={{ fontSize: '1.2rem' }}>{dict.store.noProducts}</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 'clamp(12px, 2vw, 24px)' }}>
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} dict={dict.product} locale={locale} />
                    ))}
                </div>
            )}
        </>
    )
}
