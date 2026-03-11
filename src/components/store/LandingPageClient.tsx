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

            <div style={{ background: 'var(--landing-bg)', color: 'var(--landing-text)', minHeight: '100vh' }}>
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
                    0%, 100% { text-shadow: 0 2px 16px rgba(0,0,0,0.9), 0 4px 32px rgba(0,0,0,0.7), 0 0 40px rgba(200,160,80,0.18); }
                    50%      { text-shadow: 0 2px 16px rgba(0,0,0,0.9), 0 4px 32px rgba(0,0,0,0.7), 0 0 70px rgba(200,160,80,0.38); }
                }
                @keyframes heroSparkle {
                    0%, 100% { opacity: 0; transform: scale(0.6); }
                    50%      { opacity: 1; transform: scale(1.2); }
                }
                @keyframes heroBorderGlow {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(200,160,80,0); border-color: rgba(200,160,80,0.35); }
                    50%      { box-shadow: 0 0 24px 6px rgba(200,160,80,0.22); border-color: rgba(200,160,80,0.8); }
                }
                @keyframes heroLineExpand {
                    from { width: 0; opacity: 0; }
                    to   { width: 48px; opacity: 1; }
                }
                .hero-img-wrap { position: absolute; inset: 0; overflow: hidden; }
                .hero-img-wrap img { width: 100%; height: 100%; object-fit: cover; object-position: center; animation: heroKenBurns 14s ease-in-out infinite; transform-origin: center center; }
                .hero-shimmer { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
                .hero-shimmer::after {
                    content: '';
                    position: absolute;
                    top: -50%; left: 0;
                    width: 40%; height: 200%;
                    background: linear-gradient(90deg, transparent 0%, rgba(255,230,150,0.07) 50%, transparent 100%);
                    animation: heroShimmer 6s ease-in-out infinite;
                    animation-delay: 2s;
                }
                .hero-grain {
                    position: absolute; inset: 0; pointer-events: none; opacity: 0.04;
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
                    background-size: 200px 200px;
                }
                .hero-sparkle {
                    position: absolute;
                    width: 5px; height: 5px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(255,230,160,0.9) 0%, transparent 70%);
                    animation: heroSparkle ease-in-out infinite;
                }
                .hero-eyebrow {
                    display: flex; align-items: center; justify-content: center;
                    gap: 14px; margin-bottom: 20px;
                }
                .hero-eyebrow-line {
                    height: 1px; background: linear-gradient(90deg, transparent, rgba(200,160,80,0.8), transparent);
                    animation: heroLineExpand 1.2s ease forwards;
                }
                .hero-eyebrow-text {
                    font-size: 0.7rem; letter-spacing: 0.3em; text-transform: uppercase;
                    color: rgba(200,160,80,0.9); font-weight: 600;
                    text-shadow: 0 1px 8px rgba(0,0,0,0.9), 0 0 12px rgba(200,160,80,0.5);
                    white-space: nowrap;
                }
                .hero-cta-btn {
                    display: inline-flex; align-items: center; gap: 10px;
                    background: transparent;
                    border: 1px solid rgba(200,160,80,0.5);
                    color: #fff;
                    padding: 15px 44px;
                    border-radius: 2px;
                    text-decoration: none;
                    font-size: 0.85rem;
                    font-weight: 600;
                    letter-spacing: 0.14em;
                    text-transform: uppercase;
                    transition: all 0.4s;
                    position: relative;
                    overflow: hidden;
                    animation: heroBorderGlow 3.5s ease-in-out infinite;
                }
                .hero-cta-btn::before {
                    content: '';
                    position: absolute; inset: 0;
                    background: linear-gradient(135deg, rgba(200,160,80,0.12), transparent 60%);
                    opacity: 0; transition: opacity 0.4s;
                }
                .hero-cta-btn:hover { background: rgba(200,160,80,0.1); transform: translateY(-2px); border-color: rgba(200,160,80,0.9); letter-spacing: 0.18em; }
                .hero-cta-btn:hover::before { opacity: 1; }
                .hero-section {
                    position: relative;
                    min-height: clamp(480px, 80vh, 860px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                }
                @media (max-width: 640px) {
                    .hero-section { min-height: 0; height: 88svh; max-height: 680px; }
                    .hero-scroll-indicator { display: none; }
                    .hero-cta-btn { padding: 13px 28px; font-size: 0.8rem; letter-spacing: 0.12em; }
                    .hero-eyebrow { gap: 10px; margin-bottom: 16px; }
                    .hero-eyebrow-line { width: 28px !important; }
                    .hero-title { font-size: clamp(1.9rem, 7.5vw, 2.8rem) !important; margin-bottom: 14px; }
                    .hero-subtitle-line { margin-bottom: 10px; }
                }
                .hero-title {
                    font-size: clamp(2.2rem, 6vw, 4.4rem);
                    font-weight: 200;
                    color: #fff;
                    line-height: 1.18;
                    margin-bottom: 20px;
                    font-style: italic;
                    letter-spacing: 0.01em;
                    animation: heroGoldPulse 4s ease-in-out infinite;
                }
                .hero-subtitle-line {
                    width: 40px; height: 1px;
                    background: rgba(200,160,80,0.6);
                    margin: 0 auto 16px;
                }
                .custom-banner { display: flex; align-items: stretch; min-height: 220px; }
                .custom-banner-text {
                    flex: 0 0 auto; max-width: 340px; width: 100%;
                    background: linear-gradient(90deg, #0d0a06 65%, rgba(13,10,6,0.85) 100%);
                    padding: 28px 36px; position: relative; z-index: 1;
                    display: flex; flex-direction: column; justify-content: center;
                }
                .custom-banner-grid {
                    flex: 1; display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    grid-template-rows: repeat(2, 1fr);
                    gap: 3px; overflow: hidden;
                    position: relative; z-index: 2;
                }
                @media (max-width: 1024px) {
                    .custom-banner { flex-direction: column; border-radius: 12px; }
                    .custom-banner-text { max-width: 100%; padding: 22px 20px 18px; background: linear-gradient(180deg, #0d0a06 70%, rgba(13,10,6,0.95) 100%); }
                    .custom-banner-grid { grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(2, 110px); }
                    .custom-banner-section { padding: 20px 14px 48px !important; }
                }
            `}</style>

                <section className="hero-section">
                    <div className="hero-img-wrap">
                        <img src={heroImage || '/hero-ring.jpg'} alt={heroTitle} />
                    </div>

                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(5,3,1,0.35) 0%, rgba(10,6,2,0.55) 40%, rgba(5,3,1,0.9) 100%)' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 75% 55% at 50% 52%, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.1) 65%, transparent 100%)' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 0% 50%, rgba(0,0,0,0.6) 0%, transparent 45%), radial-gradient(ellipse at 100% 50%, rgba(0,0,0,0.6) 0%, transparent 45%)' }} />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 160, background: 'linear-gradient(to bottom, transparent, rgba(5,3,1,0.95))' }} />

                    <div className="hero-shimmer" />
                    <div className="hero-grain" />

                    <span className="hero-sparkle" style={{ top: '22%', left: '18%', animationDuration: '2.8s', animationDelay: '0s' }} />
                    <span className="hero-sparkle" style={{ top: '35%', left: '75%', animationDuration: '3.5s', animationDelay: '0.9s' }} />
                    <span className="hero-sparkle" style={{ top: '65%', left: '30%', animationDuration: '2.4s', animationDelay: '1.6s' }} />
                    <span className="hero-sparkle" style={{ top: '55%', left: '62%', animationDuration: '3.1s', animationDelay: '0.4s' }} />
                    <span className="hero-sparkle" style={{ top: '78%', left: '82%', animationDuration: '2.6s', animationDelay: '2.1s', width: 3, height: 3 }} />
                    <span className="hero-sparkle" style={{ top: '14%', left: '55%', animationDuration: '3.8s', animationDelay: '1.2s', width: 3, height: 3 }} />

                    <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: 'clamp(20px, 5vw, 40px) 20px', maxWidth: 860 }}>
                        <div className="hero-eyebrow">
                            <span className="hero-eyebrow-line" style={{ width: 48 }} />
                            <span className="hero-eyebrow-text">{t.exclusiveCollection}</span>
                            <span className="hero-eyebrow-line" style={{ width: 48 }} />
                        </div>
                        <h1 className="hero-title">
                            {heroTitle}
                        </h1>
                        <div className="hero-subtitle-line" />
                        <p style={{
                            fontSize: 'clamp(0.88rem, 2.2vw, 1.2rem)',
                            color: 'rgba(255,240,210,0.8)',
                            marginBottom: 'clamp(28px, 6vw, 48px)',
                            fontStyle: 'italic',
                            fontWeight: 300,
                            letterSpacing: '0.05em',
                            textShadow: '0 1px 10px rgba(0,0,0,0.95), 0 2px 20px rgba(0,0,0,0.8)',
                        }}>
                            {heroSubtitle}
                        </p>
                        <Link href="/loja" className="hero-cta-btn">
                            {ctaText} <ChevronRight size={16} />
                        </Link>
                    </div>

                    <div className="hero-scroll-indicator" style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, opacity: 0.4 }}>
                        <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, rgba(200,160,80,0.8), transparent)' }} />
                    </div>
                </section>

                {whatsappLink && (
                    <section className="custom-banner-section" style={{ maxWidth: 1000, margin: '0 auto', padding: '28px 20px 60px' }}>
                        <div
                            className="custom-banner"
                            style={{
                                position: 'relative',
                                borderRadius: 14,
                                overflow: 'hidden',
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border)',
                                boxShadow: '0 4px 32px rgba(0,0,0,0.15)',
                            }}
                        >
                            <div className="custom-banner-text">
                                <div style={{ width: 28, height: 1, background: 'var(--footer-heading)', marginBottom: 14 }} />
                                <h3 style={{
                                    color: 'var(--text-title)',
                                    fontSize: 'clamp(1.3rem, 3.5vw, 2rem)',
                                    fontWeight: 200,
                                    letterSpacing: '0.08em',
                                    textTransform: 'uppercase',
                                    margin: 0,
                                    lineHeight: 1.2,
                                }}>
                                    {customBannerTitle || t.customBannerTitle}
                                </h3>
                                <p style={{ color: 'var(--footer-heading)', fontSize: '0.75rem', marginTop: 10, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500 }}>
                                    {customBannerText || t.customBannerText}
                                </p>
                                <a
                                    href={whatsappLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 10, marginTop: 20,
                                        background: 'rgba(37,211,102,0.12)',
                                        border: '1px solid rgba(37,211,102,0.35)',
                                        borderRadius: 50,
                                        padding: '10px 22px',
                                        alignSelf: 'flex-start',
                                        textDecoration: 'none',
                                        transition: 'background 0.3s, transform 0.3s',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(37,211,102,0.25)'; e.currentTarget.style.transform = 'scale(1.05)' }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(37,211,102,0.12)'; e.currentTarget.style.transform = 'scale(1)' }}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                                        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.532 5.856L.072 23.928l6.228-1.433A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.693-.516-5.228-1.414l-.374-.222-3.896.896.93-3.791-.244-.39A9.959 9.959 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                                    </svg>
                                    <span style={{ color: 'var(--text-title)', fontSize: '0.82rem', fontWeight: 600, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                                        {t.talkToUs}
                                    </span>
                                </a>
                            </div>

                            <div className="custom-banner-grid">
                                {[
                                    { src: '/produtos/colar-placa.png', pos: 'center', slug: 'choker-amuleto-dente-de-javali' },
                                    { src: '/produtos/brinco-sol.png', pos: 'center', slug: 'brinco-concha-expressiva-brinco-memoria-do-mar' },
                                    { src: '/produtos/anel-sementes.png', pos: 'center', slug: 'anel-coral' },
                                    { src: '/produtos/anel-martelado.png', pos: 'center top', slug: 'anel-quadrado-textura-coral-anel-falesia' },
                                    { src: '/produtos/brinco-coral.png', pos: 'center', slug: 'brinco-coral-com-rubi-cravado-brinco-jardim-silencioso' },
                                    { src: '/produtos/colar-dente.png', pos: 'center', slug: 'colar-amuleto-dente-de-crocodilo' },
                                ].map((img, i) => (
                                    <a key={i} href={`/produto/${img.slug}`} style={{ overflow: 'hidden', position: 'relative', display: 'block', cursor: 'pointer', pointerEvents: 'auto' }}>
                                        <img
                                            src={img.src}
                                            alt=""
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: img.pos, display: 'block', transition: 'transform 0.5s' }}
                                            onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.08)' }}
                                            onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)' }}
                                        />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {aboutText && (
                    <section id="sobre" style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px 60px', textAlign: 'center' }}>
                        <h2 style={{ fontSize: '1.6rem', fontWeight: 300, color: 'var(--text-title)', marginBottom: 20, fontStyle: 'italic' }}>
                            {t.brandHistory}
                        </h2>
                        <div style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: '0.95rem' }}
                            dangerouslySetInnerHTML={{ __html: aboutText }} />
                    </section>
                )}

                <footer id="contato" style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)', padding: '50px 20px 30px' }}>
                    <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, marginBottom: 40 }}>
                        {(phone || whatsapp || email) && (
                            <div>
                                <h4 style={{ color: 'var(--footer-heading)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>{t.contact}</h4>
                                {(phone || whatsapp) && (
                                    <a href={whatsappLink || `tel:${(phone || whatsapp).replace(/\D/g, '')}`} target={whatsappLink ? '_blank' : undefined} rel="noopener noreferrer" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 6, display: 'block', textDecoration: 'none' }}>
                                        {t.phoneWhatsapp}: {phone || whatsapp}
                                    </a>
                                )}
                                {email && (
                                    <a href={`mailto:${email}`} style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 6, display: 'block', textDecoration: 'none' }}>{email}</a>
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
                            <h4 style={{ color: 'var(--footer-heading)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>{t.institutional}</h4>
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
                                <h4 style={{ color: 'var(--footer-heading)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>{t.socialMedia}</h4>
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
                            <h4 style={{ color: 'var(--footer-heading)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>{t.account}</h4>
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
