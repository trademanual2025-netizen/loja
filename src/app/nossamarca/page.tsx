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
                .marca-hero {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    min-height: calc(100svh - 64px);
                }
                .marca-hero-text {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    padding: clamp(40px, 6vw, 96px) clamp(28px, 5vw, 72px);
                    background: #0d0a06;
                    position: relative;
                    overflow: hidden;
                }
                .marca-hero-text::before {
                    content: '';
                    position: absolute;
                    top: -20%;
                    right: -10%;
                    width: 60%;
                    height: 60%;
                    background: radial-gradient(ellipse, rgba(180,120,30,0.1) 0%, transparent 70%);
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
                    object-position: center top;
                    display: block;
                }
                .marca-story {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 0;
                    align-items: stretch;
                }
                .marca-story-text {
                    padding: clamp(48px, 7vw, 96px) clamp(28px, 5vw, 72px);
                    background: var(--bg);
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }
                .marca-story-img {
                    position: relative;
                    min-height: 460px;
                    overflow: hidden;
                }
                .marca-story-img img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    object-position: center;
                    display: block;
                }
                @media (max-width: 768px) {
                    .marca-hero {
                        grid-template-columns: 1fr;
                        min-height: unset;
                    }
                    .marca-hero-img {
                        height: 60svh;
                        order: -1;
                    }
                    .marca-hero-text {
                        padding: 40px 24px;
                    }
                    .marca-story {
                        grid-template-columns: 1fr;
                    }
                    .marca-story-img {
                        min-height: 320px;
                        order: -1;
                    }
                    .marca-story-text {
                        padding: 40px 24px;
                    }
                }
            `}</style>

            <main style={{ background: 'var(--bg)', color: 'var(--text)' }}>

                <section className="marca-hero">
                    <div className="marca-hero-text">
                        <p style={{
                            fontSize: '0.68rem',
                            letterSpacing: '0.3em',
                            textTransform: 'uppercase',
                            color: 'rgba(200,160,80,0.9)',
                            fontWeight: 600,
                            marginBottom: 20,
                        }}>
                            ✦ Artesã &amp; Ouriveira
                        </p>
                        <h1 style={{
                            fontSize: 'clamp(2.8rem, 5vw, 5.5rem)',
                            fontWeight: 200,
                            fontStyle: 'italic',
                            color: '#fff',
                            lineHeight: 1.05,
                            marginBottom: 20,
                            letterSpacing: '-0.01em',
                        }}>
                            Giovana<br />Dias
                        </h1>
                        <div style={{
                            width: 48,
                            height: 1,
                            background: 'rgba(200,160,80,0.6)',
                            marginBottom: 24,
                        }} />
                        <p style={{
                            fontSize: 'clamp(0.95rem, 1.4vw, 1.1rem)',
                            lineHeight: 1.8,
                            color: 'rgba(255,240,210,0.72)',
                            fontStyle: 'italic',
                            fontWeight: 300,
                            maxWidth: 440,
                        }}>
                            Criadora de joias autorais desde a primeira faísca até o brilho final.
                        </p>
                        <p style={{
                            marginTop: 'auto',
                            paddingTop: 40,
                            fontSize: '0.72rem',
                            letterSpacing: '0.15em',
                            color: 'rgba(255,255,255,0.2)',
                            textTransform: 'uppercase',
                        }}>
                            Nossa História
                        </p>
                    </div>
                    <div className="marca-hero-img">
                        <img src="/marca-giovana.jpg" alt="Giovana Dias" />
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(to right, rgba(13,10,6,0.3) 0%, transparent 40%)',
                            pointerEvents: 'none',
                        }} />
                    </div>
                </section>

                <section className="marca-story">
                    <div className="marca-story-text">
                        <span style={{
                            fontSize: '0.68rem',
                            letterSpacing: '0.22em',
                            textTransform: 'uppercase',
                            color: 'var(--primary)',
                            fontWeight: 600,
                            display: 'block',
                            marginBottom: 24,
                        }}>
                            A criadora
                        </span>
                        <p style={{
                            fontSize: 'clamp(0.98rem, 1.6vw, 1.12rem)',
                            lineHeight: 1.9,
                            color: 'var(--text)',
                            marginBottom: 22,
                        }}>
                            Giovana Dias é o meu nome, sou eu quem cria todas as peças dessa marca, do início ao fim do processo, sou apaixonada por todas as etapas da ourivesaria, amo começar um desenho para um projeto novo...
                        </p>
                        <p style={{
                            fontSize: 'clamp(0.98rem, 1.6vw, 1.12rem)',
                            lineHeight: 1.9,
                            color: 'var(--text)',
                        }}>
                            Me inspiro nas texturas da natureza, da terra, das profundezas do oceano, na pele dos animais, na textura dos ossos... Amo criar novas coleções pois normalmente significam uma nova fase da minha vida, momentos marcantes em que me reconectei com meu eu interior e com a natureza divina e senti de ressignificar isso através de jóias autorais.
                        </p>
                    </div>
                    <div className="marca-story-img">
                        <img src="/marca-joias.jpg" alt="Joias autorais Giovana Dias" />
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(to left, transparent 60%, var(--bg) 100%)',
                            pointerEvents: 'none',
                        }} />
                    </div>
                </section>

                <section style={{
                    background: 'var(--bg-card)',
                    borderTop: '1px solid var(--border)',
                    borderBottom: '1px solid var(--border)',
                }}>
                    <div style={{
                        maxWidth: 760,
                        margin: '0 auto',
                        padding: 'clamp(48px, 8vw, 96px) clamp(24px, 5vw, 48px)',
                        textAlign: 'center',
                    }}>
                        <span style={{
                            fontSize: '0.68rem',
                            letterSpacing: '0.22em',
                            textTransform: 'uppercase',
                            color: 'var(--primary)',
                            fontWeight: 600,
                            display: 'block',
                            marginBottom: 24,
                        }}>
                            O processo
                        </span>
                        <p style={{
                            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
                            lineHeight: 1.95,
                            color: 'var(--text)',
                        }}>
                            O trabalho com metais preciosos, pedras, cristais, pérolas... todos juntos, vai muito além de criar uma jóia, é um processo de alquimia entre o fogo, a terra e o ar. Quando feito com muito amor e autenticidade tem como resultado uma <strong>joia rara</strong>. Espero passar isso através da minha marca para você!
                        </p>
                    </div>
                </section>

                <section style={{
                    background: '#0d0a06',
                    padding: 'clamp(72px, 10vw, 128px) clamp(24px, 6vw, 80px)',
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                }}>
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'radial-gradient(ellipse at 50% 50%, rgba(180,130,40,0.1) 0%, transparent 65%)',
                        pointerEvents: 'none',
                    }} />
                    <div style={{ position: 'relative', zIndex: 1, maxWidth: 720, margin: '0 auto' }}>
                        <div style={{
                            fontSize: 'clamp(3rem, 6vw, 5rem)',
                            color: 'rgba(200,160,80,0.35)',
                            lineHeight: 0.8,
                            marginBottom: 24,
                            fontFamily: 'Georgia, serif',
                            userSelect: 'none',
                        }}>
                            "
                        </div>
                        <blockquote style={{
                            fontSize: 'clamp(1rem, 2.2vw, 1.3rem)',
                            fontStyle: 'italic',
                            fontWeight: 300,
                            color: 'rgba(255,245,220,0.88)',
                            lineHeight: 1.95,
                            margin: 0,
                        }}>
                            Assim como os cristais, a prata e o ouro espero que você brilhe cada dia mais e se reconecte com sua força interior e lembre-se sempre que até o cristal mais lindo, mais brilhante vem de um processo longo e necessário.
                        </blockquote>
                        <div style={{
                            marginTop: 36,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 14,
                        }}>
                            <span style={{ width: 36, height: 1, background: 'rgba(200,160,80,0.4)', display: 'block' }} />
                            <span style={{ fontSize: '0.72rem', letterSpacing: '0.22em', color: 'rgba(200,160,80,0.75)', textTransform: 'uppercase', fontWeight: 500 }}>Giovana Dias</span>
                            <span style={{ width: 36, height: 1, background: 'rgba(200,160,80,0.4)', display: 'block' }} />
                        </div>
                    </div>
                </section>

            </main>

            <StoreFooter storeName={storeName} dict={dict} />
        </>
    )
}
