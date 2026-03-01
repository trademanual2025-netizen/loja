'use client'

import { useEffect, useState } from 'react'
import { useCart } from '@/lib/cart'
import { fbTrackViewContent, fbTrackAddToCart } from '@/components/tracking/FacebookPixel'
import { gtagViewItem, gtagAddToCart } from '@/components/tracking/GoogleAds'
import { ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'
import Cookies from 'js-cookie'
import { dictionaries, Locale, defaultLocale, translateDb } from '@/lib/i18n'

interface ProductOption { name: string; values: string[] }
interface ProductVariant { id: string; name: string; price: number | null; stock: number; sku: string | null }

interface Product {
    id: string; name: string; slug: string; description: string | null
    price: number; comparePrice: number | null; images: string[]; stock: number
    options?: ProductOption[]
    variants?: ProductVariant[]
}

export function ProductPageClient({ product, dict }: { product: Product; dict: any }) {
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

    // Encontra a variante selecionada baseada nas opções
    const selectedVariantName = product.options?.map(o => selectedOptions[o.name]).join(' / ')
    const selectedVariant = product.variants?.find(v => v.name === selectedVariantName)

    // Preço e estoque exibidos (da variante ou do produto)
    const displayPrice = selectedVariant?.price ? Number(selectedVariant.price) : product.price
    const displayStock = selectedVariant ? selectedVariant.stock : product.stock

    function handleAdd() {
        const cartItem = {
            id: product.id,
            name: product.name,
            price: displayPrice,
            comparePrice: product.comparePrice,
            image: product.images[0],
            slug: product.slug,
            variantId: selectedVariant?.id,
            variantName: selectedVariant?.name
        }
        addItem(cartItem)
        fbTrackAddToCart({ id: product.id, name: product.name, price: displayPrice })
        gtagAddToCart({ id: product.id, name: product.name, price: displayPrice })
        toast.success(locale === 'pt' ? 'Adicionado ao carrinho!' : locale === 'en' ? 'Added to cart!' : 'Añadido al carrito!')
    }

    const discount = product.comparePrice ? Math.round((1 - displayPrice / product.comparePrice) * 100) : 0

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }}>
            {/* Galeria */}
            <div>
                <div style={{ position: 'relative', aspectRatio: '1', background: 'var(--bg-card)', borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}>
                    {product.images.length > 0 ? (
                        <>
                            <Image src={product.images[mainImage]} alt={product.name} fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover' }} priority />
                            {product.images.length > 1 && (
                                <>
                                    <button onClick={() => setMainImage((p) => (p - 1 + product.images.length) % product.images.length)}
                                        style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
                                        <ChevronLeft size={18} />
                                    </button>
                                    <button onClick={() => setMainImage((p) => (p + 1) % product.images.length)}
                                        style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
                                        <ChevronRight size={18} />
                                    </button>
                                </>
                            )}
                        </>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>Sem imagem</div>
                    )}
                </div>
                {product.images.length > 1 && (
                    <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
                        {product.images.map((img, i) => (
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
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 16, color: 'var(--text-title)' }}>{product.name}</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary)' }}>
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
                        {translateDb(product.description, locale)}
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
                        {displayStock === 0
                            ? (locale === 'pt' ? 'Produto Esgotado' : locale === 'en' ? 'Out of Stock' : 'Agotado')
                            : dict.addToCart}
                    </button>
                    {displayStock > 0 && displayStock <= 5 && (
                        <p style={{ color: '#eab308', fontSize: '0.85rem' }}>⚠️ Apenas {displayStock} em estoque!</p>
                    )}
                </div>
            </div>

            <style>{`@media(max-width:768px){div[style*='grid-template-columns: 1fr 1fr']{grid-template-columns:1fr!important}}`}</style>
        </div>
    )
}
