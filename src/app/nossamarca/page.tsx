import { getSettings, SETTINGS_KEYS } from '@/lib/config'
import { getAuthUser } from '@/lib/auth'
import { StoreHeader } from '@/components/store/StoreHeader'
import { StoreFooter } from '@/components/store/StoreFooter'
import { cookies } from 'next/headers'
import { dictionaries, defaultLocale, Locale } from '@/lib/i18n'

export const metadata = {
    title: 'Nossa Marca',
    description: 'Conheça a história de Giovana Dias e a essência por trás de cada joia artesanal.',
}

export default async function NossaMarcaPage() {
    const [storeSettings, user, cookieStore] = await Promise.all([
        getSettings([SETTINGS_KEYS.STORE_NAME, SETTINGS_KEYS.STORE_LOGO]),
        getAuthUser(),
        cookies(),
    ])

    const localeCookie = cookieStore.get('NEXT_LOCALE')?.value as Locale
    const currentLocale = (localeCookie && dictionaries[localeCookie]) ? localeCookie : defaultLocale
    const dict = dictionaries[currentLocale]

    const storeName = storeSettings[SETTINGS_KEYS.STORE_NAME] || 'Velour'
    const logoUrl = storeSettings[SETTINGS_KEYS.STORE_LOGO] || null

    return (
        <>
            <StoreHeader storeName={storeName} logoUrl={logoUrl} user={user} dict={dict} />

            <style>{`
                /* ── Hero: foto full-width com overlay de texto à esquerda ── */
                .marca-hero {
                    position: relative;
                    width: 100%;
                    height: calc(100svh - 64px);
                    min-height: 520px;
                    max-height: 900px;
                    overflow: hidden;
                    display: flex;
                    align-items: flex-start;
                }
                .marca-hero-bg {
                    position: absolute;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    object-position: 72% 12%;
                }
                .marca-hero-overlay {
                    position: absolute;
                    inset: 0;
                    background:
                        linear-gradient(to right, rgba(5,3,1,0.97) 0%, rgba(5,3,1,0.88) 30%, rgba(5,3,1,0.45) 52%, transparent 72%),
                        linear-gradient(to top, rgba(5,3,1,0.55) 0%, transparent 35%);
                }
                .marca-hero-content {
                    position: relative;
                    z-index: 2;
                    padding: clamp(48px, 8vh, 100px) clamp(28px, 6vw, 96px) 0;
                    max-width: 560px;
                }

                /* ── About: dois painéis lado a lado ── */
                .marca-about {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    min-height: 560px;
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
                    object-position: center 30%;
                    display: block;
                }
                .marca-about-img::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(to left, var(--bg) 0%, transparent 25%);
                    pointer-events: none;
                }
                .marca-about-text {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    padding: clamp(48px, 6vw, 88px) clamp(32px, 5vw, 72px);
                }

                /* ── Process ── */
                .marca-process {
                    background: var(--bg-card);
                    border-top: 1px solid var(--border);
                    border-bottom: 1px solid var(--border);
                    padding: clamp(64px, 9vw, 112px) clamp(24px, 5vw, 80px);
                }

                /* ── Quote ── */
                .marca-quote {
                    background: #080604;
                    padding: clamp(80px, 11vw, 140px) clamp(24px, 6vw, 80px);
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                }

                /* ── Mobile ── */
                @media (max-width: 768px) {
                    .marca-hero-bg {
                        object-position: 80% center;
                    }
                    .marca-hero-overlay {
                        background:
                            linear-gradient(to top, rgba(5,3,1,0.92) 0%, rgba(5,3,1,0.6) 40%, rgba(5,3,1,0.2) 70%, transparent 100%),
                            linear-gradient(to bottom, rgba(5,3,1,0.5) 0%, transparent 30%);
                    }
                    .marca-hero-content {
                        padding: clamp(36px, 6vh, 64px) 24px 0;
                        max-width: 100%;
                    }
                    .marca-about {
                        grid-template-columns: 1fr;
                        min-height: unset;
                    }
                    .marca-about-img {
                        height: 320px;
                    }
                    .marca-about-img::after {
                        background: linear-gradient(to top, var(--bg) 0%, transparent 30%);
                    }
                    .marca-about-text {
                        padding: 36px 24px 48px;
                    }
                }
            `}</style>

            <main style={{ background: 'var(--bg)', color: 'var(--text)' }}>

                {/* ── HERO ── */}
                <section className="marca-hero">
                    <img
                        className="marca-hero-bg"
                        src="/marca-giovana.jpg"
                        alt="Giovana Dias"
                    />
                    <div className="marca-hero-overlay" />

                    <div className="marca-hero-content">
                        <p style={{
                            fontSize: '0.65rem',
                            letterSpacing: '0.32em',
                            textTransform: 'uppercase',
                            color: 'rgba(200,160,80,0.9)',
                            fontWeight: 600,
                            marginBottom: 24,
                        }}>
                            ✦ Artesã &amp; Ouriveira
                        </p>

                        <h1 style={{
                            fontSize: 'clamp(3.2rem, 6vw, 7rem)',
                            fontWeight: 200,
                            fontStyle: 'italic',
                            color: '#fff',
                            lineHeight: 0.95,
                            letterSpacing: '-0.02em',
                            marginBottom: 4,
                        }}>
                            Giovana
                        </h1>
                        <h1 style={{
                            fontSize: 'clamp(3.2rem, 6vw, 7rem)',
                            fontWeight: 700,
                            color: '#fff',
                            lineHeight: 1.05,
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
                            <div style={{ width: 36, height: 1, background: 'rgba(200,160,80,0.6)' }} />
                            <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(200,160,80,0.7)', flexShrink: 0 }} />
                            <div style={{ width: 36, height: 1, background: 'rgba(200,160,80,0.6)' }} />
                        </div>

                        <p style={{
                            fontSize: 'clamp(0.9rem, 1.3vw, 1.05rem)',
                            lineHeight: 1.8,
                            color: 'rgba(255,240,210,0.7)',
                            fontStyle: 'italic',
                            fontWeight: 300,
                        }}>
                            Criadora de joias autorais desde a primeira faísca até o brilho final.
                        </p>
                    </div>
                </section>

                {/* ── ABOUT ── */}
                <section className="marca-about">
                    <div className="marca-about-img">
                        <img src="/marca-joias.jpg" alt="Joias autorais Giovana Dias" />
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
                                Nossa História
                            </span>
                        </div>

                        <p style={{
                            fontSize: 'clamp(0.95rem, 1.4vw, 1.06rem)',
                            lineHeight: 1.95,
                            color: 'var(--text)',
                            marginBottom: 18,
                        }}>
                            Giovana Dias é o meu nome, sou eu quem cria todas as peças dessa marca, do início ao fim do processo, sou apaixonada por todas as etapas da ourivesaria, amo começar um desenho para um projeto novo...
                        </p>
                        <p style={{
                            fontSize: 'clamp(0.95rem, 1.4vw, 1.06rem)',
                            lineHeight: 1.95,
                            color: 'var(--text)',
                        }}>
                            Me inspiro nas texturas da natureza, da terra, das profundezas do oceano, na pele dos animais, na textura dos ossos... Amo criar novas coleções pois normalmente significam uma nova fase da minha vida, momentos marcantes em que me reconectei com meu eu interior e com a natureza divina e senti de ressignificar isso através de jóias autorais.
                        </p>
                    </div>
                </section>

                {/* ── PROCESS ── */}
                <section className="marca-process">
                    <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
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
                                O processo
                            </span>
                            <div style={{ width: 28, height: 1, background: 'rgba(200,160,80,0.45)' }} />
                        </div>

                        <p style={{
                            fontSize: 'clamp(1rem, 1.7vw, 1.18rem)',
                            lineHeight: 2,
                            color: 'var(--text)',
                        }}>
                            O trabalho com metais preciosos, pedras, cristais, pérolas... todos juntos, vai muito além de criar uma jóia, é um processo de alquimia entre o fogo, a terra e o ar. Quando feito com muito amor e autenticidade tem como resultado uma{' '}
                            <em style={{ color: 'var(--primary)', fontStyle: 'italic' }}>joia rara</em>.
                            {' '}Espero passar isso através da minha marca para você!
                        </p>
                    </div>
                </section>

                {/* ── QUOTE ── */}
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
                        background: 'linear-gradient(to right, transparent, rgba(200,160,80,0.3), transparent)',
                    }} />
                    <div style={{
                        position: 'absolute',
                        bottom: 0, left: '50%', transform: 'translateX(-50%)',
                        width: '50%', height: 1,
                        background: 'linear-gradient(to right, transparent, rgba(200,160,80,0.3), transparent)',
                    }} />

                    <div style={{ position: 'relative', zIndex: 1, maxWidth: 680, margin: '0 auto' }}>
                        <div style={{
                            fontSize: 'clamp(4rem, 8vw, 7rem)',
                            color: 'rgba(200,160,80,0.2)',
                            lineHeight: 0.7,
                            marginBottom: 20,
                            fontFamily: 'Georgia, serif',
                            userSelect: 'none',
                        }}>
                            "
                        </div>
                        <blockquote style={{
                            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                            fontStyle: 'italic',
                            fontWeight: 300,
                            color: 'rgba(255,245,220,0.85)',
                            lineHeight: 2,
                            margin: 0,
                        }}>
                            Assim como os cristais, a prata e o ouro espero que você brilhe cada dia mais e se reconecte com sua força interior e lembre-se sempre que até o cristal mais lindo, mais brilhante vem de um processo longo e necessário.
                        </blockquote>
                        <div style={{
                            marginTop: 40,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 16,
                        }}>
                            <span style={{ width: 36, height: 1, background: 'rgba(200,160,80,0.4)', display: 'block' }} />
                            <span style={{
                                fontSize: '0.68rem',
                                letterSpacing: '0.24em',
                                color: 'rgba(200,160,80,0.7)',
                                textTransform: 'uppercase',
                                fontWeight: 500,
                            }}>
                                Giovana Dias
                            </span>
                            <span style={{ width: 36, height: 1, background: 'rgba(200,160,80,0.4)', display: 'block' }} />
                        </div>
                    </div>
                </section>

            </main>

            <StoreFooter storeName={storeName} dict={dict} />
        </>
    )
}
