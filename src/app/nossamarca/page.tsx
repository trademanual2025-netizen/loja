import Image from 'next/image'
import { getSettings, SETTINGS_KEYS } from '@/lib/config'
import { getAuthUser } from '@/lib/auth'
import { StoreHeader } from '@/components/store/StoreHeader'
import { StoreFooter } from '@/components/store/StoreFooter'
import { cookies } from 'next/headers'
import { dictionaries, defaultLocale, Locale } from '@/lib/i18n'

export async function generateMetadata() {
    const cookieStore = await cookies()
    const localeCookie = cookieStore.get('NEXT_LOCALE')?.value as Locale
    const currentLocale = (localeCookie && dictionaries[localeCookie]) ? localeCookie : defaultLocale

    const titles: Record<Locale, string> = {
        pt: 'Nossa Marca — A História por Trás das Joias',
        en: 'Our Brand — The Story Behind the Jewelry',
        es: 'Nuestra Marca — La Historia Detrás de las Joyas',
    }
    const descriptions: Record<Locale, string> = {
        pt: 'Conheça a história de Giovana Dias e a essência por trás de cada joia artesanal.',
        en: 'Discover the story of Giovana Dias and the essence behind each handcrafted jewel.',
        es: 'Conoce la historia de Giovana Dias y la esencia detrás de cada joya artesanal.',
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://giovanadiasjewelry.com.br'

    return {
        title: titles[currentLocale],
        description: descriptions[currentLocale],
        alternates: { canonical: `${baseUrl}/nossamarca` },
        openGraph: {
            title: titles[currentLocale],
            description: descriptions[currentLocale],
            type: 'website',
            url: `${baseUrl}/nossamarca`,
        },
        twitter: {
            card: 'summary_large_image',
            title: titles[currentLocale],
            description: descriptions[currentLocale],
        },
    }
}

export default async function NossaMarcaPage() {
    const [storeSettings, user, cookieStore] = await Promise.all([
        getSettings([SETTINGS_KEYS.STORE_NAME, SETTINGS_KEYS.STORE_LOGO, SETTINGS_KEYS.STORE_FOOTER_TEXT]),
        getAuthUser(),
        cookies(),
    ])

    const localeCookie = cookieStore.get('NEXT_LOCALE')?.value as Locale
    const currentLocale = (localeCookie && dictionaries[localeCookie]) ? localeCookie : defaultLocale
    const dict = dictionaries[currentLocale]
    const b = dict.brand

    const storeName = storeSettings[SETTINGS_KEYS.STORE_NAME] || 'Velour'
    const logoUrl = storeSettings[SETTINGS_KEYS.STORE_LOGO] || null

    return (
        <>
            <StoreHeader storeName={storeName} logoUrl={logoUrl} user={user} dict={dict} />

            <style>{`
                /* ── Hero split ── */
                .marca-hero {
                    display: grid;
                    grid-template-columns: 44% 56%;
                    height: calc(100svh - 64px);
                    min-height: 520px;
                    max-height: 860px;
                    background: #0d0a06;
                }
                .marca-hero-left {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    padding: 64px clamp(32px, 5vw, 72px);
                    position: relative;
                    z-index: 1;
                }
                .marca-hero-right {
                    position: relative;
                    background: #0d0a06;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .marca-hero-right img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                    object-position: center bottom;
                    display: block;
                }
                /* fade esquerda (para painel de texto) */
                .marca-hero-right::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; bottom: 0;
                    width: 220px;
                    background: linear-gradient(to right, #0d0a06 0%, rgba(13,10,6,0.6) 60%, transparent 100%);
                    z-index: 2;
                    pointer-events: none;
                }
                /* fades: topo, direita e base */
                .marca-hero-right::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background:
                        linear-gradient(to bottom, #0d0a06 0%, transparent 22%),
                        linear-gradient(to left,   #0d0a06 0%, transparent 28%),
                        linear-gradient(to top,    #0d0a06 0%, transparent 14%);
                    z-index: 2;
                    pointer-events: none;
                }

                /* ── About: joias à esquerda, texto à direita ── */
                .marca-about {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    min-height: 500px;
                    background: var(--bg);
                }
                .marca-about-img {
                    position: relative;
                    overflow: hidden;
                }
                .marca-about-img img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    object-position: center 35%;
                    display: block;
                }
                /* fades: topo, base e direita (para o painel de texto) */
                .marca-about-img::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background:
                        linear-gradient(to bottom, var(--bg) 0%, transparent 18%),
                        linear-gradient(to top,    var(--bg) 0%, transparent 14%);
                    z-index: 2;
                    pointer-events: none;
                }
                .marca-about-img::after {
                    content: '';
                    position: absolute;
                    top: 0; right: 0; bottom: 0;
                    width: 180px;
                    background: linear-gradient(to left, var(--bg) 0%, rgba(13,10,6,0.5) 55%, transparent 100%);
                    z-index: 2;
                    pointer-events: none;
                }
                .marca-about-text {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    padding: clamp(48px, 6vw, 80px) clamp(32px, 5vw, 72px);
                }

                /* ── Processo ── */
                .marca-process {
                    background: var(--bg-card);
                    border-top: 1px solid var(--border);
                    border-bottom: 1px solid var(--border);
                    padding: clamp(64px, 9vw, 104px) clamp(24px, 5vw, 80px);
                    text-align: center;
                }

                /* ── Citação ── */
                .marca-quote {
                    background: #080604;
                    padding: clamp(80px, 10vw, 130px) clamp(24px, 6vw, 80px);
                    text-align: center;
                    position: relative;
                }

                /* ── Mobile ── */
                @media (max-width: 1024px) {
                    .marca-hero {
                        grid-template-columns: 1fr;
                        height: auto;
                        min-height: unset;
                        max-height: unset;
                    }
                    .marca-hero-right {
                        height: 55svh;
                        order: -1;
                    }
                    .marca-hero-right img {
                        object-fit: cover;
                        object-position: center 15%;
                    }
                    .marca-hero-right::before {
                        width: unset;
                        height: 100px;
                        top: unset;
                        right: 0;
                        bottom: 0;
                        background: linear-gradient(to top, #0d0a06, transparent);
                    }
                    .marca-hero-right::after {
                        background:
                            linear-gradient(to bottom, #0d0a06 0%, transparent 20%);
                    }
                    .marca-hero-left {
                        padding: 36px 24px 48px;
                    }
                    .marca-about {
                        grid-template-columns: 1fr;
                        min-height: unset;
                    }
                    .marca-about-img {
                        height: 300px;
                    }
                    .marca-about-img::after { display: none; }
                    .marca-about-text {
                        padding: 36px 24px 48px;
                    }
                }
            `}</style>

            <main style={{ background: 'var(--bg)', color: 'var(--text)' }}>

                {/* ── HERO ── */}
                <section className="marca-hero">
                    <div className="marca-hero-left">
                        <p style={{
                            fontSize: '0.65rem',
                            letterSpacing: '0.3em',
                            textTransform: 'uppercase',
                            color: 'rgba(200,160,80,0.9)',
                            fontWeight: 600,
                            marginBottom: 28,
                        }}>
                            {b.tagline}
                        </p>

                        <h1 style={{
                            fontSize: 'clamp(2.8rem, 4.5vw, 5.5rem)',
                            fontWeight: 200,
                            fontStyle: 'italic',
                            color: '#fff',
                            lineHeight: 0.95,
                            letterSpacing: '-0.02em',
                            marginBottom: 0,
                        }}>
                            Giovana
                        </h1>
                        <h1 style={{
                            fontSize: 'clamp(2.8rem, 4.5vw, 5.5rem)',
                            fontWeight: 700,
                            color: '#fff',
                            lineHeight: 1.1,
                            letterSpacing: '-0.02em',
                            marginBottom: 28,
                        }}>
                            Dias
                        </h1>

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            marginBottom: 28,
                        }}>
                            <div style={{ width: 36, height: 1, background: 'rgba(200,160,80,0.55)' }} />
                            <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(200,160,80,0.7)', flexShrink: 0 }} />
                            <div style={{ width: 36, height: 1, background: 'rgba(200,160,80,0.55)' }} />
                        </div>

                        <p style={{
                            fontSize: 'clamp(0.9rem, 1.3vw, 1.05rem)',
                            lineHeight: 1.85,
                            color: 'rgba(255,240,210,0.65)',
                            fontStyle: 'italic',
                            fontWeight: 300,
                            maxWidth: 380,
                        }}>
                            {b.subtitle}
                        </p>
                    </div>

                    <div className="marca-hero-right">
                        <Image src="/marca-giovana.jpg" alt="Giovana Dias" fill style={{ objectFit: 'contain', objectPosition: 'center bottom' }} />
                    </div>
                </section>

                {/* ── ABOUT ── */}
                <section className="marca-about">
                    <div className="marca-about-img">
                        <Image src="/marca-joias.jpg" alt="Joias autorais Giovana Dias" fill style={{ objectFit: 'cover', objectPosition: 'center 35%' }} />
                    </div>
                    <div className="marca-about-text">
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 14,
                            marginBottom: 28,
                        }}>
                            <div style={{ width: 3, height: 36, background: 'var(--primary)', borderRadius: 2, flexShrink: 0 }} />
                            <span style={{
                                fontSize: '0.65rem',
                                letterSpacing: '0.26em',
                                textTransform: 'uppercase',
                                color: 'var(--text-muted)',
                                fontWeight: 600,
                            }}>
                                {b.historyLabel}
                            </span>
                        </div>

                        <p style={{
                            fontSize: 'clamp(0.95rem, 1.4vw, 1.06rem)',
                            lineHeight: 1.95,
                            color: 'var(--text)',
                            marginBottom: 18,
                        }}>
                            {b.historyP1}
                        </p>
                        <p style={{
                            fontSize: 'clamp(0.95rem, 1.4vw, 1.06rem)',
                            lineHeight: 1.95,
                            color: 'var(--text)',
                        }}>
                            {b.historyP2}
                        </p>
                    </div>
                </section>

                {/* ── PROCESSO ── */}
                <section className="marca-process">
                    <div style={{ maxWidth: 680, margin: '0 auto' }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 12,
                            marginBottom: 28,
                        }}>
                            <div style={{ width: 28, height: 1, background: 'rgba(200,160,80,0.45)' }} />
                            <span style={{
                                fontSize: '0.65rem',
                                letterSpacing: '0.26em',
                                textTransform: 'uppercase',
                                color: 'var(--text-muted)',
                                fontWeight: 600,
                            }}>
                                {b.processLabel}
                            </span>
                            <div style={{ width: 28, height: 1, background: 'rgba(200,160,80,0.45)' }} />
                        </div>

                        <p style={{
                            fontSize: 'clamp(1rem, 1.7vw, 1.18rem)',
                            lineHeight: 2,
                            color: 'var(--text)',
                        }}>
                            {b.processText}{' '}
                            <em style={{ color: 'var(--primary)', fontStyle: 'italic' }}>{b.processHighlight}</em>
                            {b.processSuffix}
                        </p>
                    </div>
                </section>

                {/* ── CITAÇÃO ── */}
                <section className="marca-quote">
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'radial-gradient(ellipse at 50% 40%, rgba(180,130,40,0.08) 0%, transparent 65%)',
                        pointerEvents: 'none',
                    }} />
                    <div style={{
                        position: 'absolute',
                        top: 0, left: '50%', transform: 'translateX(-50%)',
                        width: '50%', height: 1,
                        background: 'linear-gradient(to right, transparent, rgba(200,160,80,0.28), transparent)',
                    }} />
                    <div style={{
                        position: 'absolute',
                        bottom: 0, left: '50%', transform: 'translateX(-50%)',
                        width: '50%', height: 1,
                        background: 'linear-gradient(to right, transparent, rgba(200,160,80,0.28), transparent)',
                    }} />

                    <div style={{ position: 'relative', zIndex: 1, maxWidth: 680, margin: '0 auto' }}>
                        <div style={{
                            fontSize: 'clamp(4rem, 8vw, 7rem)',
                            color: 'rgba(200,160,80,0.18)',
                            lineHeight: 0.7,
                            marginBottom: 20,
                            fontFamily: 'Georgia, serif',
                            userSelect: 'none',
                        }}>
                            &ldquo;
                        </div>
                        <blockquote style={{
                            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                            fontStyle: 'italic',
                            fontWeight: 300,
                            color: 'rgba(255,245,220,0.85)',
                            lineHeight: 2,
                            margin: 0,
                        }}>
                            {b.quoteText}
                        </blockquote>
                        <div style={{
                            marginTop: 40,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 16,
                        }}>
                            <span style={{ width: 36, height: 1, background: 'rgba(200,160,80,0.38)', display: 'block' }} />
                            <span style={{
                                fontSize: '0.68rem',
                                letterSpacing: '0.24em',
                                color: 'rgba(200,160,80,0.65)',
                                textTransform: 'uppercase',
                                fontWeight: 500,
                            }}>
                                Giovana Dias
                            </span>
                            <span style={{ width: 36, height: 1, background: 'rgba(200,160,80,0.38)', display: 'block' }} />
                        </div>
                    </div>
                </section>

            </main>

            <StoreFooter storeName={storeName} dict={dict} footerText={storeSettings[SETTINGS_KEYS.STORE_FOOTER_TEXT] || undefined} logoUrl={logoUrl} />
        </>
    )
}
