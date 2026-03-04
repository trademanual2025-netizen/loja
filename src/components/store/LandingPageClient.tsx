'use client'

import Link from 'next/link'
import { Instagram, ChevronRight } from 'lucide-react'
import { Dictionary } from '@/lib/i18n'
import { StoreHeader } from '@/components/store/StoreHeader'

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
    const whatsappLink = whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g, '')}` : ''
    const instagramLink = instagram ? (instagram.startsWith('http') ? instagram : `https://instagram.com/${instagram.replace('@', '')}`) : ''
    const t = dict.landing

    return (
        <>
            <StoreHeader storeName={storeName} logoUrl={logoUrl} user={user} dict={dict} />

            <div style={{ background: '#0a0a0a', color: '#fff', minHeight: '100vh' }}>
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
                            {t.exclusiveCollection}
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

                {whatsappLink && (
                    <section style={{ maxWidth: 1000, margin: '0 auto', padding: '0 20px 60px' }}>
                        <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'stretch',
                                borderRadius: 14,
                                overflow: 'hidden',
                                textDecoration: 'none',
                                minHeight: 200,
                                background: '#0d0a06',
                                border: '1px solid rgba(200,160,80,0.18)',
                                boxShadow: '0 4px 32px rgba(0,0,0,0.5)',
                                transition: 'box-shadow 0.35s, transform 0.35s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 48px rgba(0,0,0,0.7)'; e.currentTarget.style.transform = 'translateY(-3px)' }}
                            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 32px rgba(0,0,0,0.5)'; e.currentTarget.style.transform = 'translateY(0)' }}
                        >
                            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '28px 36px', flex: '0 0 auto', maxWidth: 340, background: 'linear-gradient(90deg, #0d0a06 60%, transparent 100%)' }}>
                                <div style={{ width: 28, height: 1, background: 'rgba(200,160,80,0.7)', marginBottom: 14 }} />
                                <h3 style={{
                                    color: '#fff',
                                    fontSize: 'clamp(1.3rem, 3.5vw, 2rem)',
                                    fontWeight: 200,
                                    letterSpacing: '0.08em',
                                    textTransform: 'uppercase',
                                    margin: 0,
                                    lineHeight: 1.2,
                                }}>
                                    {customBannerTitle || t.customBannerTitle}
                                </h3>
                                <p style={{ color: 'rgba(200,160,80,0.75)', fontSize: '0.75rem', marginTop: 10, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500 }}>
                                    {customBannerText || t.customBannerText}
                                </p>
                                <div style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 10, marginTop: 20,
                                    background: 'rgba(37,211,102,0.12)',
                                    border: '1px solid rgba(37,211,102,0.35)',
                                    borderRadius: 50,
                                    padding: '10px 22px',
                                    alignSelf: 'flex-start',
                                }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                                        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.532 5.856L.072 23.928l6.228-1.433A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.693-.516-5.228-1.414l-.374-.222-3.896.896.93-3.791-.244-.39A9.959 9.959 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                                    </svg>
                                    <span style={{ color: '#fff', fontSize: '0.82rem', fontWeight: 600, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                                        {t.talkToUs}
                                    </span>
                                </div>
                            </div>

                            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(2, 1fr)', gap: 3, minHeight: 220, overflow: 'hidden' }}>
                                {[
                                    { src: '/produtos/colar-placa.png', pos: 'center' },
                                    { src: '/produtos/brinco-sol.png', pos: 'center' },
                                    { src: '/produtos/anel-sementes.png', pos: 'center' },
                                    { src: '/produtos/anel-martelado.png', pos: 'center top' },
                                    { src: '/produtos/brinco-coral.png', pos: 'center' },
                                    { src: '/produtos/colar-dente.png', pos: 'center' },
                                ].map((img, i) => (
                                    <div key={i} style={{ overflow: 'hidden', position: 'relative' }}>
                                        <img
                                            src={img.src}
                                            alt=""
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: img.pos, display: 'block', transition: 'transform 0.5s' }}
                                            onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.08)' }}
                                            onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)' }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </a>
                    </section>
                )}

                {aboutText && (
                    <section id="sobre" style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px 60px', textAlign: 'center' }}>
                        <h2 style={{ fontSize: '1.6rem', fontWeight: 300, color: '#fff', marginBottom: 20, fontStyle: 'italic' }}>
                            {t.brandHistory}
                        </h2>
                        <div style={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, fontSize: '0.95rem' }}
                            dangerouslySetInnerHTML={{ __html: aboutText }} />
                    </section>
                )}

                <footer id="contato" style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)', padding: '50px 20px 30px' }}>
                    <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, marginBottom: 40 }}>
                        {(phone || whatsapp || email) && (
                            <div>
                                <h4 style={{ color: 'rgba(200,160,80,0.8)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>{t.contact}</h4>
                                {(phone || whatsapp) && (
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 6 }}>
                                        {t.phoneWhatsapp}: {phone || whatsapp}
                                    </p>
                                )}
                                {email && (
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 6 }}>{email}</p>
                                )}
                                {whatsappLink && (
                                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer"
                                        style={{ color: 'rgba(200,160,80,0.8)', fontSize: '0.85rem', textDecoration: 'none' }}>
                                        {t.talkToUs}
                                    </a>
                                )}
                            </div>
                        )}

                        <div>
                            <h4 style={{ color: 'rgba(200,160,80,0.8)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>{t.institutional}</h4>
                            <Link href="/loja" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none', display: 'block', marginBottom: 6 }}>{t.virtualStore}</Link>
                            <Link href="/nossamarca" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none', display: 'block', marginBottom: 6 }}>{dict.nav?.ourBrand}</Link>
                            <Link href="/ringsize" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none', display: 'block', marginBottom: 6 }}>{dict.nav?.ringSize}</Link>
                            <Link href="/contato" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none', display: 'block', marginBottom: 6 }}>{dict.nav?.contact}</Link>
                            {aboutText && (
                                <a href="#sobre" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none', display: 'block' }}>{t.whoWeAre}</a>
                            )}
                        </div>

                        {(instagramLink || whatsappLink) && (
                            <div>
                                <h4 style={{ color: 'rgba(200,160,80,0.8)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>{t.socialMedia}</h4>
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
                            <h4 style={{ color: 'rgba(200,160,80,0.8)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>{t.account}</h4>
                            <Link href="/minha-conta" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none', display: 'block', marginBottom: 6 }}>{t.myData}</Link>
                            <Link href="/minha-conta#pedidos" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none', display: 'block', marginBottom: 6 }}>{t.myOrders}</Link>
                            <Link href="/carrinho" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none', display: 'block', marginBottom: 6 }}>{dict.store.cart}</Link>
                        </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24, textAlign: 'center' }}>
                        {logoUrl && (
                            <img src={logoUrl} alt={storeName} className="store-logo-img" style={{ height: 40, margin: '0 auto 16px', opacity: 0.7, display: 'block' }} />
                        )}
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                            &copy; {new Date().getFullYear()} {storeName}. {dict.footer?.rights}
                        </p>
                    </div>
                </footer>
            </div>
        </>
    )
}
