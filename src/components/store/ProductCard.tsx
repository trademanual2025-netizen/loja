'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '@/lib/cart'
import { useRouter } from 'next/navigation'
import { fbTrackAddToCart } from '@/components/tracking/FacebookPixel'
import { gtagAddToCart } from '@/components/tracking/GoogleAds'
import { toast } from 'sonner'
import { translateDb, Locale } from '@/lib/i18n'
import { triggerCartNotification } from './CartNotification'

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

const labels = {
    pt: { buy: 'Comprar', sold: 'Esgotado', added: 'adicionado ao carrinho!', select: 'Selecione as opções do produto', noImage: 'Sem imagem', installmentPrefix: 'ou', installmentOf: 'x de', interestFree: 'sem juros' },
    en: { buy: 'Buy Now', sold: 'Sold Out', added: 'added to cart!', select: 'Select product options', noImage: 'No image', installmentPrefix: 'or', installmentOf: 'x of', interestFree: 'interest-free' },
    es: { buy: 'Comprar', sold: 'Agotado', added: 'agregado al carrito!', select: 'Seleccione las opciones', noImage: 'Sin imagen', installmentPrefix: 'o', installmentOf: 'x de', interestFree: 'sin intereses' },
}

export function ProductCard({ product, dict, locale = 'pt', installments = 0, installmentsMinValue = 0 }: { product: Product, dict?: any, locale?: Locale, installments?: number, installmentsMinValue?: number }) {
    const addItem = useCart((s) => s.addItem)
    const router = useRouter()
    const hasVariants = product.variants && product.variants.length > 0
    const l = labels[locale] || labels.pt

    function handleAdd(e: React.MouseEvent) {
        e.preventDefault()
        e.stopPropagation()
        if (product.stock === 0) return
        if (hasVariants) {
            router.push(`/produto/${product.slug}`)
            toast.info(l.select)
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
        triggerCartNotification({
            name: translateDb(product.name, locale),
            image: product.images[0],
            price: product.price,
        })
    }

    const discount = product.comparePrice
        ? Math.round((1 - product.price / product.comparePrice) * 100)
        : 0

    const isSoldOut = product.stock === 0

    return (
        <Link href={`/produto/${product.slug}`} className="product-card-link">
            <div className="product-card fade-in">
                <div className="product-card-image">
                    {product.images[0] ? (
                        <Image src={product.images[0]} alt={translateDb(product.name, locale)} fill sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw" style={{ objectFit: 'cover', transition: 'transform 0.4s ease' }} />
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            {l.noImage}
                        </div>
                    )}
                    {discount > 0 && (
                        <span className="product-card-badge">-{discount}%</span>
                    )}
                    {isSoldOut && (
                        <div className="product-card-overlay">
                            <span className="product-card-sold">{l.sold}</span>
                        </div>
                    )}
                </div>

                <div className="product-card-info">
                    <h3 className="product-card-name">
                        {translateDb(product.name, locale)}
                    </h3>
                    <div className="product-card-pricing">
                        <span className="product-card-price">
                            R$ {product.price.toFixed(2).replace('.', ',')}
                        </span>
                        {product.comparePrice && (
                            <span className="product-card-compare">
                                R$ {product.comparePrice.toFixed(2).replace('.', ',')}
                            </span>
                        )}
                    </div>
                    {installments > 1 && product.price >= installmentsMinValue && (
                        <p className="product-card-installments">
                            {l.installmentPrefix} {installments}{l.installmentOf} R$ {(product.price / installments).toFixed(2).replace('.', ',')}
                        </p>
                    )}
                    <button
                        onClick={handleAdd}
                        className={`product-card-btn${isSoldOut ? ' sold-out' : ''}`}
                        disabled={isSoldOut}
                    >
                        <ShoppingBag size={15} />
                        {isSoldOut ? l.sold : l.buy}
                    </button>
                </div>
            </div>
        </Link>
    )
}
