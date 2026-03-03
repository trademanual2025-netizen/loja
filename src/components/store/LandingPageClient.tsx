'use client'

import Link from 'next/link'
import { ShoppingCart, User, Instagram, Mail, Phone, MessageCircle, ChevronRight, Menu, X } from 'lucide-react'
import { useCart } from '@/lib/cart'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Dictionary } from '@/lib/i18n'

interface Props {
    storeName: string
    logoUrl: string | null
    user: { name: string; email: string; avatarUrl?: string | null } | null | undefined
    dict: Dictionary
    heroImage: string
    heroTitle: string
    heroSubtitle: string
    ctaText: string
    whatsapp: string
    instagram: string
    email: string
    phone: string
    customBannerImage: string
    customBannerTitle: string
    customBannerText: string
    aboutText: string
}

export function LandingPageClient({
    storeName, logoUrl, user, dict,
    heroImage, heroTitle, heroSubtitle, ctaText,
    whatsapp, instagram, email, phone,
    customBannerImage, customBannerTitle, customBannerText,
    aboutText,
}: Props) {
    const itemCount = useCart((s) => s.itemCount())
    const clearCart = useCart((s) => s.clearCart)
    const router = useRouter()
    const [mounted, setMounted] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    useEffect(() => { setMounted(true) }, [])

    async function handleLogout() {
        await fetch('/api/auth/logout', { method: 'POST' })
        clearCart()
        router.refresh()
    }

    const whatsappLink = whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g, '')}` : ''
    const instagramLink = instagram ? (instagram.startsWith('http') ? instagram : `https://instagram.com/${instagram.replace('@', '')}`) : ''

    const navLinks = [
        { label: 'Início', href: '/' },
        { label: 'Loja', href: '/loja' },
        { label: 'Nossa Marca', href: '/nossamarca' },
        ...(aboutText ? [{ label: 'Sobre', href: '#sobre' }] : []),
        ...(whatsapp || email ? [{ label: 'Contato', href: '#contato' }] : []),
    ]

    return (
        <div style={{ background: '#0a0a0a', color: '#fff', minHeight: '100vh' }}>
            <header style={{
                position: 'sticky', top: 0, zIndex: 50,
                background: 'rgba(10,10,10,0.9)',
                backdropFilter: 'blur(16px)',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 70 }}>
                    <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', gap: 10 }}>
                        {logoUrl ? (
                            <img src={logoUrl} alt={storeName} style={{ height: 44, maxWidth: 180, objectFit: 'contain' }} />
                        ) : (
                            <span style={{ fontWeight: 800, fontSize: '1.3rem', color: '#fff', letterSpacing: '-0.02em' }}>{storeName}</span>
                        )}
                    </Link>

                    <nav className="landing-nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                        {navLinks.map((link) => (
                            <Link key={link.href} href={link.href} style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, transition: 'color 0.2s' }}
                                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}>
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {user ? (
                            <Link href="/minha-conta" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <User size={16} />
                                <span className="landing-hide-mobile">{user.name.split(' ')[0]}</span>
                            </Link>
                        ) : (
                            <Link href="/auth" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <User size={16} />
                                <span className="landing-hide-mobile">Entrar</span>
                            </Link>
                        )}
                        <Link href="/carrinho" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', position: 'relative', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}>
                            <ShoppingCart size={16} />
                            {mounted && itemCount > 0 && (
                                <span style={{ position: 'absolute', top: -8, right: -8, background: '#c0392b', color: '#fff', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700 }}>
                                    {itemCount > 9 ? '9+' : itemCount}
                                </span>
                            )}
                        </Link>
                        <button
                            className="landing-menu-btn"
                            onClick={() => setMenuOpen(!menuOpen)}
                            style={{ display: 'none', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 4 }}
                        >
                            {menuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {menuOpen && (
                    <div className="landing-mobile-menu" style={{ background: 'rgba(10,10,10,0.98)', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '16px 20px' }}>
                        {navLinks.map((link) => (
                            <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
                                style={{ display: 'block', color: 'rgba(255,255,255,0.8)', textDecoration: 'none', padding: '12px 0', fontSize: '1rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                {link.label}
                            </Link>
                        ))}
                    </div>
                )}

                {phone && (
                    <div style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '6px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Phone size={12} /> {phone}
                        </span>
                        <span>Enviamos para todo Brasil.</span>
                        {instagramLink && (
                            <a href={instagramLink} target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.5)' }}>
                                <Instagram size={16} />
                            </a>
                        )}
                    </div>
                )}
            </header>

            <style>{`
                @keyframes heroKenBurns {
                    0%   { transform: scale(1)    translateX(0)     translateY(0); }
                    50%  { transform: scale(1.06) translateX(-1%)   translateY(-1%); }
                    100% { transform: scale(1)    translateX(0)     translateY(0); }
                }
                @keyframes heroShimmer {
                    0%   { transform: translateX(-120%) skewX(-20deg); opacity: 0; }
                    10%  { opacity: 1; }
                    90%  { opacity: 1; }
                    100% { transform: translateX(220%)  skewX(-20deg); opacity: 0; }
                }
                @keyframes heroGoldPulse {
                    0%, 100% { text-shadow: 0 2px 24px rgba(0,0,0,0.5), 0 0 40px rgba(200,160,80,0.18); }
                    50%      { text-shadow: 0 2px 24px rgba(0,0,0,0.5), 0 0 70px rgba(200,160,80,0.38); }
                }
                @keyframes heroSparkle {
                    0%, 100% { opacity: 0; transform: scale(0.6); }
                    50%      { opacity: 1; transform: scale(1.2); }
                }
                @keyframes heroBorderGlow {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(200,160,80,0); border-color: rgba(255,255,255,0.3); }
                    50%      { box-shadow: 0 0 20px 4px rgba(200,160,80,0.25); border-color: rgba(200,160,80,0.7); }
                }
                .hero-img-wrap { position: absolute; inset: 0; overflow: hidden; }
                .hero-img-wrap img { width: 100%; height: 100%; object-fit: cover; object-position: center; animation: heroKenBurns 14s ease-in-out infinite; transform-origin: center center; }
                .hero-shimmer { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
                .hero-shimmer::after {
                    content: '';
                    position: absolute;
                    top: -50%; left: 0;
                    width: 40%; height: 200%;
                    background: linear-gradient(90deg, transparent 0%, rgba(255,230,150,0.09) 50%, transparent 100%);
                    animation: heroShimmer 5s ease-in-out infinite;
                    animation-delay: 2s;
                }
                .hero-sparkle {
                    position: absolute;
                    width: 5px; height: 5px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(255,230,160,0.9) 0%, transparent 70%);
                    animation: heroSparkle ease-in-out infinite;
                }
                .hero-cta-btn {
                    display: inline-flex; align-items: center; gap: 8px;
                    background: rgba(200,160,60,0.15);
                    border: 1px solid rgba(255,255,255,0.3);
                    color: #fff;
                    padding: 14px 40px;
                    border-radius: 6px;
                    text-decoration: none;
                    font-size: 1rem;
                    font-weight: 600;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    transition: all 0.35s;
                    backdrop-filter: blur(10px);
                    animation: heroBorderGlow 3s ease-in-out infinite;
                }
                .hero-cta-btn:hover {
                    background: rgba(200,160,60,0.32);
                    transform: translateY(-3px);
                    box-shadow: 0 8px 32px rgba(200,160,80,0.3);
                    border-color: rgba(200,160,80,0.8);
                }
                .hero-section {
                    position: relative;
                    min-height: clamp(480px, 75vh, 780px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                }
                @media (max-width: 640px) {
                    .hero-section {
                        min-height: 0;
                        height: 92svh;
                        max-height: 620px;
                    }
                }
                .hero-title {
                    font-size: clamp(2rem, 6vw, 4rem);
                    font-weight: 300;
                    color: #fff;
                    line-height: 1.2;
                    margin-bottom: 24px;
                    font-style: italic;
                    animation: heroGoldPulse 4s ease-in-out infinite;
                }
            `}</style>

            <section className="hero-section">
                <div className="hero-img-wrap">
                    <img src={heroImage || '/hero-ring.jpg'} alt={heroTitle} />
                </div>

                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(10,6,2,0.38) 0%, rgba(30,18,8,0.62) 60%, rgba(10,6,2,0.82) 100%)' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 70% 40%, rgba(180,110,30,0.18) 0%, transparent 65%)' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 0% 100%, rgba(0,0,0,0.6) 0%, transparent 50%), radial-gradient(ellipse at 100% 0%, rgba(0,0,0,0.4) 0%, transparent 50%)' }} />

                <div className="hero-shimmer" />

                <span className="hero-sparkle" style={{ top: '22%', left: '18%', animationDuration: '2.8s', animationDelay: '0s' }} />
                <span className="hero-sparkle" style={{ top: '35%', left: '75%', animationDuration: '3.5s', animationDelay: '0.9s' }} />
                <span className="hero-sparkle" style={{ top: '65%', left: '30%', animationDuration: '2.4s', animationDelay: '1.6s' }} />
                <span className="hero-sparkle" style={{ top: '55%', left: '62%', animationDuration: '3.1s', animationDelay: '0.4s' }} />
                <span className="hero-sparkle" style={{ top: '78%', left: '82%', animationDuration: '2.6s', animationDelay: '2.1s', width: 3, height: 3 }} />
                <span className="hero-sparkle" style={{ top: '14%', left: '55%', animationDuration: '3.8s', animationDelay: '1.2s', width: 3, height: 3 }} />

                <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '40px 20px', maxWidth: 820 }}>
                    <div style={{ marginBottom: 12, fontSize: '0.75rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#fff', fontWeight: 600, textShadow: '0 0 12px rgba(200,160,80,0.8), 0 1px 4px rgba(0,0,0,0.6)' }}>
                        ✦ Coleção Exclusiva ✦
                    </div>
                    <h1 className="hero-title">
                        {heroTitle}
                    </h1>
                    <p style={{
                        fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
                        color: 'rgba(255,240,200,0.82)',
                        marginBottom: 44,
                        fontStyle: 'italic',
                        fontWeight: 300,
                        letterSpacing: '0.03em',
                    }}>
                        {heroSubtitle}
                    </p>
                    <Link href="/loja" className="hero-cta-btn">
                        {ctaText} <ChevronRight size={18} />
                    </Link>
                </div>
            </section>

            <section style={{ maxWidth: 1000, margin: '0 auto', padding: '60px 20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
                    {whatsappLink && (
                        <a href={whatsappLink} target="_blank" rel="noopener noreferrer"
                            style={{
                                position: 'relative', borderRadius: 12, overflow: 'hidden', textDecoration: 'none',
                                background: customBannerImage ? 'transparent' : 'linear-gradient(135deg, #1a1a2e, #2d2d44)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                minHeight: 180, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'transform 0.3s, box-shadow 0.3s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.4)' }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
                        >
                            {customBannerImage && (
                                <>
                                    <img src={customBannerImage} alt={customBannerTitle || 'Joias Customizadas'} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />
                                </>
                            )}
                            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: 24 }}>
                                <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                    <MessageCircle size={24} color="#fff" />
                                </div>
                                <h3 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 700, marginBottom: 8 }}>
                                    {customBannerTitle || 'Joias Customizadas'}
                                </h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
                                    {customBannerText || 'Entre em contato para discutir joias personalizadas.'}
                                </p>
                            </div>
                        </a>
                    )}

                    <Link href="/loja"
                        style={{
                            position: 'relative', borderRadius: 12, overflow: 'hidden', textDecoration: 'none',
                            background: 'linear-gradient(135deg, #2d2d44, #1a1a2e)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            minHeight: 180, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'transform 0.3s, box-shadow 0.3s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.4)' }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
                    >
                        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: 24 }}>
                            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                <ShoppingCart size={24} color="#fff" />
                            </div>
                            <h3 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 700, marginBottom: 8 }}>Loja</h3>
                            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
                                Acesse aqui <ChevronRight size={14} />
                            </p>
                        </div>
                    </Link>
                </div>
            </section>

            {aboutText && (
                <section id="sobre" style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px 60px', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 300, color: '#fff', marginBottom: 20, fontStyle: 'italic' }}>
                        História da Marca
                    </h2>
                    <div style={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, fontSize: '0.95rem' }}
                        dangerouslySetInnerHTML={{ __html: aboutText }} />
                </section>
            )}

            <footer id="contato" style={{ background: '#050505', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '50px 20px 30px' }}>
                <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, marginBottom: 40 }}>
                    {(phone || whatsapp || email) && (
                        <div>
                            <h4 style={{ color: '#c0392b', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Atendimento</h4>
                            {(phone || whatsapp) && (
                                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginBottom: 6 }}>
                                    Telefone/WhatsApp: {phone || whatsapp}
                                </p>
                            )}
                            {email && (
                                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginBottom: 6 }}>{email}</p>
                            )}
                            {whatsappLink && (
                                <a href={whatsappLink} target="_blank" rel="noopener noreferrer"
                                    style={{ color: '#c0392b', fontSize: '0.85rem', textDecoration: 'none' }}>
                                    Fale Conosco
                                </a>
                            )}
                        </div>
                    )}

                    <div>
                        <h4 style={{ color: '#c0392b', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Institucional</h4>
                        {aboutText && (
                            <a href="#sobre" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', textDecoration: 'none', display: 'block', marginBottom: 6 }}>Quem Somos</a>
                        )}
                        <Link href="/loja" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', textDecoration: 'none', display: 'block' }}>Loja Virtual</Link>
                    </div>

                    {(instagramLink || whatsappLink) && (
                        <div>
                            <h4 style={{ color: '#c0392b', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Redes Sociais</h4>
                            <div style={{ display: 'flex', gap: 12 }}>
                                {instagramLink && (
                                    <a href={instagramLink} target="_blank" rel="noopener noreferrer"
                                        style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.6)', transition: 'all 0.2s' }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#fff'; e.currentTarget.style.color = '#fff' }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}>
                                        <Instagram size={16} />
                                    </a>
                                )}
                                {whatsappLink && (
                                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer"
                                        style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.6)', transition: 'all 0.2s' }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#fff'; e.currentTarget.style.color = '#fff' }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}>
                                        <MessageCircle size={16} />
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                    <div>
                        <h4 style={{ color: '#c0392b', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Acesse sua Conta</h4>
                        <Link href="/minha-conta" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', textDecoration: 'none', display: 'block', marginBottom: 6 }}>Meus Dados</Link>
                        <Link href="/minha-conta" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', textDecoration: 'none', display: 'block', marginBottom: 6 }}>Meus Pedidos</Link>
                    </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 24, textAlign: 'center' }}>
                    {logoUrl && (
                        <img src={logoUrl} alt={storeName} style={{ height: 40, margin: '0 auto 16px', opacity: 0.7, display: 'block' }} />
                    )}
                    <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem' }}>
                        &copy; {new Date().getFullYear()} {storeName}. Todos os direitos reservados.
                    </p>
                </div>
            </footer>

            <style>{`
                .landing-nav-desktop { display: flex !important; }
                .landing-menu-btn { display: none !important; }
                .landing-hide-mobile { display: inline; }
                @media (max-width: 768px) {
                    .landing-nav-desktop { display: none !important; }
                    .landing-menu-btn { display: flex !important; }
                    .landing-hide-mobile { display: none !important; }
                }
            `}</style>
        </div>
    )
}
