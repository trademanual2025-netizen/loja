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
                /* ── Hero ── */
                .marca-hero {
                    display: grid;
                    grid-template-columns: 42% 58%;
                    min-height: calc(100svh - 64px);
                    background: #0d0a06;
                }
                .marca-hero-text {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: flex-start;
                    padding: clamp(48px, 6vw, 100px) clamp(32px, 5vw, 80px);
                    position: relative;
                    overflow: hidden;
                    gap: 0;
                }
                .marca-hero-text::after {
                    content: '';
                    position: absolute;
                    bottom: 0; left: 0; right: 0;
                    height: 1px;
                    background: linear-gradient(to right, transparent, rgba(200,160,80,0.3), transparent);
                }
                .marca-glow {
                    position: absolute;
                    width: 340px; height: 340px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(200,140,30,0.12) 0%, transparent 70%);
                    top: 10%; right: -80px;
                    pointer-events: none;
                }
                .marca-hero-img {
                    position: relative;
                    overflow: hidden;
                }
                .marca-hero-img img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    object-position: center 20%;
                    display: block;
                }
                .marca-hero-img::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(to right, #0d0a06 0%, transparent 18%);
                    z-index: 1;
                    pointer-events: none;
                }
                .marca-hero-img::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(to top, rgba(13,10,6,0.5) 0%, transparent 35%);
                    z-index: 1;
                    pointer-events: none;
                }

                /* ── About ── */
                .marca-about {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    align-items: center;
                    background: var(--bg);
                }
                .marca-about-text {
                    padding: clamp(56px, 7vw, 100px) clamp(32px, 5vw, 80px);
                }
                .marca-about-photo {
                    position: relative;
                    overflow: hidden;
                    min-height: 520px;
                    align-self: stretch;
                }
                .marca-about-photo img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    object-position: center;
                    display: block;
                }
                .marca-about-photo::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(to right, var(--bg) 0%, transparent 20%);
                    z-index: 1;
                    pointer-events: none;
                }

                /* ── Process ── */
                .marca-process {
                    background: var(--bg-card);
                    border-top: 1px solid var(--border);
                    border-bottom: 1px solid var(--border);
                    padding: clamp(56px, 8vw, 104px) clamp(24px, 5vw, 80px);
                }
                .marca-process-inner {
                    max-width: 680px;
                    margin: 0 auto;
                    text-align: center;
                }

                /* ── Quote ── */
                .marca-quote {
                    background: #0d0a06;
                    padding: clamp(80px, 11vw, 140px) clamp(24px, 6vw, 80px);
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                }

                /* ── Mobile ── */
                @media (max-width: 768px) {
                    .marca-hero {
                        grid-template-columns: 1fr;
                        min-height: unset;
                    }
                    .marca-hero-img {
                        height: 65svh;
                        order: -1;
                    }
                    .marca-hero-img::before {
                        background: linear-gradient(to bottom, transparent 60%, #0d0a06 100%);
                    }
                    .marca-hero-text {
                        padding: 36px 24px 48px;
                        align-items: center;
                        text-align: center;
                    }
                    .marca-hero-text::after { display: none; }
                    .marca-about {
                        grid-template-columns: 1fr;
                    }
                    .marca-about-photo {
                        min-height: 300px;
                    }
                    .marca-about-photo::before { display: none; }
                    .marca-about-text {
                        padding: 40px 24px;
                    }
                }
            `}</style>

            <main style={{ background: 'var(--bg)', color: 'var(--text)' }}>

                {/* ── HERO ── */}
                <section className="marca-hero">
                    <div className="marca-hero-text">
                        <div className="marca-glow" />

                        <p style={{
                            fontSize: '0.65rem',
                            letterSpacing: '0.32em',
                            textTransform: 'uppercase',
                            color: 'rgba(200,160,80,0.85)',
                            fontWeight: 600,
                            marginBottom: 28,
                        }}>
                            ✦ Artesã &amp; Ouriveira
                        </p>

                        <h1 style={{
                            fontSize: 'clamp(3rem, 4.5vw, 6rem)',
                            fontWeight: 200,
                            fontStyle: 'italic',
                            color: '#fff',
                            lineHeight: 1,
                            marginBottom: 0,
                            letterSpacing: '-0.02em',
                        }}>
                            Giovana
                        </h1>
                        <h1 style={{
                            fontSize: 'clamp(3rem, 4.5vw, 6rem)',
                            fontWeight: 600,
                            fontStyle: 'normal',
                            color: '#fff',
                            lineHeight: 1.1,
                            marginBottom: 28,
                            letterSpacing: '-0.02em',
                        }}>
                            Dias
                        </h1>

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            marginBottom: 32,
                        }}>
                            <div style={{ width: 40, height: 1, background: 'rgba(200,160,80,0.7)' }} />
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(200,160,80,0.7)' }} />
                            <div style={{ width: 40, height: 1, background: 'rgba(200,160,80,0.7)' }} />
                        </div>

                        <p style={{
                            fontSize: 'clamp(0.9rem, 1.3vw, 1.05rem)',
                            lineHeight: 1.85,
                            color: 'rgba(255,240,210,0.65)',
                            fontStyle: 'italic',
                            fontWeight: 300,
                            maxWidth: 380,
                        }}>
                            Criadora de joias autorais desde a primeira faísca até o brilho final.
                        </p>
                    </div>

                    <div className="marca-hero-img">
                        <img src="/marca-giovana.jpg" alt="Giovana Dias" />
                    </div>
                </section>

                {/* ── ABOUT ── */}
                <section className="marca-about">
                    <div className="marca-about-text">
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 14,
                            marginBottom: 32,
                        }}>
                            <div style={{ width: 3, height: 40, background: 'var(--primary)', borderRadius: 2, flexShrink: 0 }} />
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
                            fontSize: 'clamp(0.95rem, 1.5vw, 1.08rem)',
                            lineHeight: 1.95,
                            color: 'var(--text)',
                            marginBottom: 20,
                        }}>
                            Giovana Dias é o meu nome, sou eu quem cria todas as peças dessa marca, do início ao fim do processo, sou apaixonada por todas as etapas da ourivesaria, amo começar um desenho para um projeto novo...
                        </p>
                        <p style={{
                            fontSize: 'clamp(0.95rem, 1.5vw, 1.08rem)',
                            lineHeight: 1.95,
                            color: 'var(--text)',
                        }}>
                            Me inspiro nas texturas da natureza, da terra, das profundezas do oceano, na pele dos animais, na textura dos ossos... Amo criar novas coleções pois normalmente significam uma nova fase da minha vida, momentos marcantes em que me reconectei com meu eu interior e com a natureza divina e senti de ressignificar isso através de jóias autorais.
                        </p>
                    </div>

                    <div className="marca-about-photo">
                        <img src="/marca-joias.jpg" alt="Joias autorais" />
                    </div>
                </section>

                {/* ── PROCESS ── */}
                <section className="marca-process">
                    <div className="marca-process-inner">
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 12,
                            marginBottom: 28,
                        }}>
                            <div style={{ width: 28, height: 1, background: 'rgba(200,160,80,0.5)' }} />
                            <span style={{
                                fontSize: '0.65rem',
                                letterSpacing: '0.26em',
                                textTransform: 'uppercase',
                                color: 'var(--text-muted)',
                                fontWeight: 600,
                            }}>
                                O processo
                            </span>
                            <div style={{ width: 28, height: 1, background: 'rgba(200,160,80,0.5)' }} />
                        </div>

                        <p style={{
                            fontSize: 'clamp(1rem, 1.8vw, 1.18rem)',
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
                        background: 'radial-gradient(ellipse at 50% 40%, rgba(180,130,40,0.09) 0%, transparent 65%)',
                        pointerEvents: 'none',
                    }} />
                    <div style={{
                        position: 'absolute',
                        top: 0, left: '50%', transform: 'translateX(-50%)',
                        width: '40%', height: 1,
                        background: 'linear-gradient(to right, transparent, rgba(200,160,80,0.35), transparent)',
                    }} />
                    <div style={{
                        position: 'absolute',
                        bottom: 0, left: '50%', transform: 'translateX(-50%)',
                        width: '40%', height: 1,
                        background: 'linear-gradient(to right, transparent, rgba(200,160,80,0.35), transparent)',
                    }} />

                    <div style={{ position: 'relative', zIndex: 1, maxWidth: 680, margin: '0 auto' }}>
                        <div style={{
                            fontSize: 'clamp(4rem, 8vw, 7rem)',
                            color: 'rgba(200,160,80,0.22)',
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
                            <span style={{ width: 40, height: 1, background: 'rgba(200,160,80,0.4)', display: 'block' }} />
                            <span style={{
                                fontSize: '0.68rem',
                                letterSpacing: '0.24em',
                                color: 'rgba(200,160,80,0.7)',
                                textTransform: 'uppercase',
                                fontWeight: 500,
                            }}>
                                Giovana Dias
                            </span>
                            <span style={{ width: 40, height: 1, background: 'rgba(200,160,80,0.4)', display: 'block' }} />
                        </div>
                    </div>
                </section>

            </main>

            <StoreFooter storeName={storeName} dict={dict} />
        </>
    )
}
