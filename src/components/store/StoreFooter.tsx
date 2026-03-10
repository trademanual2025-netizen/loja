'use client'

import Link from 'next/link'
import { Instagram } from 'lucide-react'
import { Dictionary } from '@/lib/i18n'
import { useState, useEffect } from 'react'

interface Props {
    storeName: string
    dict: Dictionary
    footerText?: string
    logoUrl?: string | null
}

export function StoreFooter({ storeName, dict, footerText, logoUrl }: Props) {
    const [year, setYear] = useState<number | null>(null)
    const [contactData, setContactData] = useState<{
        whatsapp: string
        instagram: string
        email: string
        phone: string
    }>({ whatsapp: '', instagram: '', email: '', phone: '' })

    useEffect(() => {
        setYear(new Date().getFullYear())
        fetch('/api/footer')
            .then(r => r.json())
            .then((s: { whatsapp: string; instagram: string; email: string; phone: string }) => {
                setContactData(s)
            })
            .catch(() => {})
    }, [])

    const { whatsapp, instagram, email, phone } = contactData
    const whatsappLink = whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g, '')}` : ''
    const instagramLink = instagram ? (instagram.startsWith('http') ? instagram : `https://instagram.com/${instagram.replace('@', '')}`) : ''
    const t = dict.landing
    const hasContact = phone || whatsapp || email
    const hasSocial = instagramLink || whatsappLink

    const headingStyle: React.CSSProperties = { color: 'var(--footer-heading)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }
    const linkStyle: React.CSSProperties = { color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none', display: 'block', marginBottom: 6 }

    return (
        <footer style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)', padding: '50px 20px 30px' }}>
            <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, marginBottom: 40 }}>
                {hasContact && (
                    <div>
                        <h4 style={headingStyle}>{t.contact}</h4>
                        {(phone || whatsapp) && (
                            <a href={whatsappLink || `tel:${(phone || whatsapp).replace(/\D/g, '')}`} target={whatsappLink ? '_blank' : undefined} rel="noopener noreferrer" style={linkStyle}>
                                {t.phoneWhatsapp}: {phone || whatsapp}
                            </a>
                        )}
                        {email && (
                            <a href={`mailto:${email}`} style={linkStyle}>{email}</a>
                        )}
                        {whatsappLink && (
                            <a href={whatsappLink} target="_blank" rel="noopener noreferrer"
                                style={{ color: 'var(--footer-accent)', fontSize: '0.85rem', textDecoration: 'none' }}>
                                {t.talkToUs}
                            </a>
                        )}
                    </div>
                )}

                <div>
                    <h4 style={headingStyle}>{t.institutional}</h4>
                    <Link href="/loja" style={linkStyle}>{t.virtualStore}</Link>
                    <Link href="/nossamarca" style={linkStyle}>{dict.nav?.ourBrand}</Link>
                    <Link href="/ringsize" style={linkStyle}>{dict.nav?.ringSize}</Link>
                    <Link href="/contato" style={linkStyle}>{dict.nav?.contact}</Link>
                </div>

                {hasSocial && (
                    <div>
                        <h4 style={headingStyle}>{t.socialMedia}</h4>
                        <div style={{ display: 'flex', gap: 12 }}>
                            {instagramLink && (
                                <a href={instagramLink} target="_blank" rel="noopener noreferrer"
                                    style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', transition: 'all 0.2s' }}>
                                    <Instagram size={16} />
                                </a>
                            )}
                            {whatsappLink && (
                                <a href={whatsappLink} target="_blank" rel="noopener noreferrer"
                                    style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', transition: 'all 0.2s' }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.532 5.856L.072 23.928l6.228-1.433A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.693-.516-5.228-1.414l-.374-.222-3.896.896.93-3.791-.244-.39A9.959 9.959 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                                    </svg>
                                </a>
                            )}
                        </div>
                    </div>
                )}

                <div>
                    <h4 style={headingStyle}>{t.account}</h4>
                    <Link href="/minha-conta" style={linkStyle}>{t.myData}</Link>
                    <Link href="/minha-conta#pedidos" style={linkStyle}>{t.myOrders}</Link>
                    <Link href="/carrinho" style={linkStyle}>{dict.store.cart}</Link>
                </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24, textAlign: 'center' }}>
                {logoUrl && (
                    <img src={logoUrl} alt={storeName} className="store-logo-img" style={{ height: 40, margin: '0 auto 16px', opacity: 0.7, display: 'block' }} />
                )}
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {footerText || `© ${year ?? ''} ${storeName}. ${dict.footer?.rights || 'Todos os direitos reservados.'}`}
                </p>
            </div>
        </footer>
    )
}
