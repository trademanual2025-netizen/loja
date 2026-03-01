'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/lib/cart'
import { useRouter } from 'next/navigation'
import { fbTrackAddToCart } from '@/components/tracking/FacebookPixel'
import { gtagAddToCart } from '@/components/tracking/GoogleAds'
import { toast } from 'sonner'
import { translateDb, Locale } from '@/lib/i18n'

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

export function ProductCard({ product, dict, locale = 'pt' }: { product: Product, dict?: any, locale?: Locale }) {
    const addItem = useCart((s) => s.addItem)
    const router = useRouter()
    const hasVariants = product.variants && product.variants.length > 0

    function handleAdd(e: React.MouseEvent) {
        e.preventDefault()
        if (hasVariants) {
            router.push(`/produto/${product.slug}`)
            toast.info(locale === 'pt' ? 'Selecione as opções do produto' : locale === 'en' ? 'Select product options' : 'Seleccione las opciones')
            return
        }
        addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            comparePrice: product.comparePrice,
            image: product.images[0],
            slug: product.slug,
        })
        fbTrackAddToCart({ id: product.id, name: product.name, price: product.price })
        gtagAddToCart({ id: product.id, name: product.name, price: product.price })
        toast.success(dict ? `${translateDb(product.name, locale)} adicionado!` : `${translateDb(product.name, locale)} adicionado ao carrinho!`)
    }

    const discount = product.comparePrice
        ? Math.round((1 - product.price / product.comparePrice) * 100)
        : 0

    return (
        <Link href={`/produto/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="card fade-in" style={{ padding: 0, overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 30px rgba(99,102,241,0.2)' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = '' }}
            >
                {/* Imagem */}
                <div style={{ position: 'relative', aspectRatio: '1', background: 'var(--bg-card2)', overflow: 'hidden' }}>
                    {product.images[0] ? (
                        <Image src={product.images[0]} alt={product.name} fill sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw" style={{ objectFit: 'cover' }} />
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            Sem imagem
                        </div>
                    )}
                    {discount > 0 && (
                        <span style={{ position: 'absolute', top: 10, left: 10, background: '#ef4444', color: 'white', padding: '3px 8px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700 }}>
                            -{discount}%
                        </span>
                    )}
                </div>

                {/* Info */}
                <div style={{ padding: '16px' }}>
                    <h3 style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 8, lineHeight: 1.4, minHeight: 'calc(0.95rem * 1.4 * 2)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {translateDb(product.name, locale)}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--primary)' }}>
                            R$ {product.price.toFixed(2).replace('.', ',')}
                        </span>
                        {product.comparePrice && (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                                R$ {product.comparePrice.toFixed(2).replace('.', ',')}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={handleAdd}
                        className="btn btn-primary btn-full"
                        style={{ gap: 8 }}
                        disabled={product.stock === 0}
                    >
                        <ShoppingCart size={16} />
                        {product.stock === 0 ? 'Esgotado' : hasVariants ? (locale === 'pt' ? 'Ver Opções' : locale === 'en' ? 'View Options' : 'Ver Opciones') : (dict ? dict.addToCart : 'Adicionar ao Carrinho')}
                    </button>
                </div>
            </div>
        </Link>
    )
}
