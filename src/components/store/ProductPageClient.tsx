'use client'

import { useEffect, useState } from 'react'
import { useCart } from '@/lib/cart'
import { fbTrackViewContent, fbTrackAddToCart } from '@/components/tracking/FacebookPixel'
import { gtagViewItem, gtagAddToCart } from '@/components/tracking/GoogleAds'
import { ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import Cookies from 'js-cookie'
import { triggerCartNotification } from './CartNotification'
import { dictionaries, Locale, defaultLocale } from '@/lib/i18n'

interface ProductOption { name: string; values: string[] }
interface ProductVariant { id: string; name: string; price: number | null; stock: number; sku: string | null; image: string | null }

interface RelatedProduct {
    id: string; name: string; slug: string; price: number; comparePrice: number | null; image: string
}

interface Product {
    id: string; name: string; slug: string; description: string | null
    price: number; comparePrice: number | null; images: string[]; stock: number
    options?: ProductOption[]
    variants?: ProductVariant[]
}

export function ProductPageClient({ product, dict, relatedProducts = [], installments = 0, installmentsMinValue = 0 }: { product: Product; dict: any; relatedProducts?: RelatedProduct[]; installments?: number; installmentsMinValue?: number }) {
    const [mainImage, setMainImage] = useState(0)
    const [locale, setLocale] = useState<Locale>(defaultLocale)
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
    const addItem = useCart((s) => s.addItem)

    useEffect(() => {
        const saved = Cookies.get('NEXT_LOCALE') as Locale
        if (saved && dictionaries[saved]) setLocale(saved)

        // Inicializa com as primeiras opções se houver variações
        if (product.options && product.options.length > 0) {
            const initial: Record<string, string> = {}
            product.options.forEach(opt => {
                if (opt.values.length > 0) initial[opt.name] = opt.values[0]
            })
            setSelectedOptions(initial)
        }

        fbTrackViewContent({ id: product.id, name: product.name, price: product.price })
        gtagViewItem({ id: product.id, name: product.name, price: product.price })
    }, [product.id])

    const selectedVariantName = product.options?.map(o => selectedOptions[o.name]).join(' / ')
    const selectedVariant = product.variants?.find(v => v.name === selectedVariantName)

    const allImages = (() => {
        const base = product.images || []
        if (selectedVariant?.image) {
            const idx = base.indexOf(selectedVariant.image)
            if (idx >= 0) return base
            return [selectedVariant.image, ...base]
        }
        return base
    })()

    useEffect(() => {
        if (selectedVariant?.image) {
            const imgs = selectedVariant.image && !product.images.includes(selectedVariant.image)
                ? [selectedVariant.image, ...product.images]
                : product.images
            const idx = imgs.indexOf(selectedVariant.image)
            if (idx >= 0) setMainImage(idx)
        } else {
            setMainImage(0)
        }
    }, [selectedVariantName, selectedVariant?.image])

    const displayPrice = selectedVariant?.price ? Number(selectedVariant.price) : product.price
    const displayStock = selectedVariant ? selectedVariant.stock : product.stock

    function handleAdd() {
        const variantImage = selectedVariant?.image || product.images[0] || ''
        const cartItem = {
            id: product.id,
            name: product.name,
            price: displayPrice,
            comparePrice: product.comparePrice,
            image: variantImage,
            slug: product.slug,
            variantId: selectedVariant?.id,
            variantName: selectedVariant?.name
        }
        addItem(cartItem)
        fbTrackAddToCart({ id: product.id, name: product.name, price: displayPrice })
        gtagAddToCart({ id: product.id, name: product.name, price: displayPrice })
        triggerCartNotification({
            name: product.name,
            image: variantImage,
            price: displayPrice,
        })
    }

    const discount = product.comparePrice ? Math.round((1 - displayPrice / product.comparePrice) * 100) : 0

    return (
        <div className="product-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }}>
            {/* Galeria */}
            <div>
                <div style={{ position: 'relative', aspectRatio: '1', background: 'var(--bg-card)', borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}>
                    {allImages.length > 0 ? (
                        <>
                            <Image src={allImages[mainImage] || allImages[0]} alt={product.name} fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover' }} priority />
                            {allImages.length > 1 && (
                                <>
                                    <button onClick={() => setMainImage((p) => (p - 1 + allImages.length) % allImages.length)}
                                        style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
                                        <ChevronLeft size={18} />
                                    </button>
                                    <button onClick={() => setMainImage((p) => (p + 1) % allImages.length)}
                                        style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
                                        <ChevronRight size={18} />
                                    </button>
                                </>
                            )}
                        </>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>{dict.noImage}</div>
                    )}
                </div>
                {allImages.length > 1 && (
                    <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
                        {allImages.map((img, i) => (
                            <button key={i} onClick={() => setMainImage(i)}
                                style={{ width: 70, height: 70, borderRadius: 8, overflow: 'hidden', border: `2px solid ${i === mainImage ? 'var(--primary)' : 'var(--border)'}`, flexShrink: 0, cursor: 'pointer', padding: 0, position: 'relative', background: 'var(--bg-card2)' }}>
                                <Image src={img} alt="" fill sizes="70px" style={{ objectFit: 'cover' }} />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div>
                    <h1 className="product-detail-title" style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 16, color: 'var(--text-title)' }}>{product.name}</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <span className="product-detail-price" style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary)' }}>
                            R$ {displayPrice.toFixed(2).replace('.', ',')}
                        </span>
                        {product.comparePrice && (
                            <>
                                <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                                    R$ {product.comparePrice.toFixed(2).replace('.', ',')}
                                </span>
                                <span className="badge badge-red">-{discount}%</span>
                            </>
                        )}
                    </div>
                    {installments > 1 && displayPrice >= installmentsMinValue && (
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: 8 }}>
                            {dict.installmentPrefix} {installments}{dict.installmentOf}{' '}
                            <span style={{ fontWeight: 600, color: 'var(--text-body)' }}>R$ {(displayPrice / installments).toFixed(2).replace('.', ',')}</span>
                            {' '}{dict.interestFree}
                        </p>
                    )}
                </div>

                {/* Variações */}
                {product.options && product.options.map((option, idx) => (
                    <div key={idx}>
                        <p style={{ fontWeight: 600, marginBottom: 12, fontSize: '0.9rem' }}>{option.name}: <span style={{ color: 'var(--primary)' }}>{selectedOptions[option.name]}</span></p>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {option.values.map(val => (
                                <button
                                    key={val}
                                    onClick={() => setSelectedOptions(prev => ({ ...prev, [option.name]: val }))}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: 8,
                                        border: `1px solid ${selectedOptions[option.name] === val ? 'var(--primary)' : 'var(--border)'}`,
                                        background: selectedOptions[option.name] === val ? 'var(--primary)' : 'var(--bg-card)',
                                        color: selectedOptions[option.name] === val ? 'white' : 'var(--text-body)',
                                        cursor: 'pointer',
                                        fontSize: '0.88rem',
                                        fontWeight: 600,
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {val}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                {product.description && (
                    <div style={{ color: 'var(--text-muted)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                        {product.description}
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <button
                        className="btn btn-primary"
                        style={{ padding: '14px 24px', fontSize: '1rem', background: 'var(--btn-buy)', borderColor: 'var(--btn-buy)' }}
                        onClick={handleAdd}
                        disabled={displayStock === 0}
                    >
                        <ShoppingCart size={20} />
                        {displayStock === 0 ? dict.outOfStock : dict.addToCart}
                    </button>
                    {displayStock > 0 && displayStock <= 5 && (
                        <p style={{ color: '#eab308', fontSize: '0.85rem' }}>⚠️ {dict.onlyLeft} {displayStock} {dict.stockWarning}!</p>
                    )}
                </div>
            </div>


            {relatedProducts.length > 0 && (
                <div style={{ gridColumn: '1 / -1', marginTop: 48, borderTop: '1px solid var(--border)', paddingTop: 40 }}>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 24, color: 'var(--text-title)' }}>
                        {dict.relatedTitle}
                    </h2>
                    <div className="related-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'clamp(10px, 2vw, 20px)' }}>
                        {relatedProducts.slice(0, 8).map(rp => {
                            const rpDiscount = rp.comparePrice ? Math.round((1 - rp.price / rp.comparePrice) * 100) : 0
                            return (
                                <a key={rp.id} href={`/produto/${rp.slug}`} className="related-card-link">
                                    <div className="related-card"
                                        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)' }}
                                        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = '' }}
                                    >
                                        <div className="related-card-image">
                                            {rp.image ? (
                                                <Image src={rp.image} alt={rp.name} fill sizes="(max-width: 768px) 50vw, 25vw" style={{ objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{dict.noImage}</div>
                                            )}
                                            {rpDiscount > 0 && (
                                                <span style={{ position: 'absolute', top: 8, left: 8, background: 'var(--error)', color: 'white', padding: '2px 8px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700, zIndex: 1 }}>-{rpDiscount}%</span>
                                            )}
                                        </div>
                                        <div className="related-card-info">
                                            <p className="related-card-name">{rp.name}</p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                                <span className="related-card-price">R$ {rp.price.toFixed(2).replace('.', ',')}</span>
                                                {rp.comparePrice && (
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>R$ {rp.comparePrice.toFixed(2).replace('.', ',')}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </a>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
