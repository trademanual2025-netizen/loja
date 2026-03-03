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

            <main style={{ background: 'var(--bg)', color: 'var(--text)' }}>

                <section style={{
                    position: 'relative',
                    height: 'clamp(420px, 70vh, 680px)',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'flex-end',
                }}>
                    <img
                        src="/marca-giovana.jpg"
                        alt="Giovana Dias"
                        style={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: 'center 15%',
                        }}
                    />
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.1) 100%)',
                    }} />
                    <div style={{
                        position: 'relative',
                        zIndex: 1,
                        padding: 'clamp(24px, 6vw, 60px)',
                        maxWidth: 800,
                    }}>
                        <p style={{
                            fontSize: '0.72rem',
                            letterSpacing: '0.28em',
                            textTransform: 'uppercase',
                            color: 'rgba(200,160,80,0.95)',
                            fontWeight: 600,
                            marginBottom: 12,
                            textShadow: '0 1px 4px rgba(0,0,0,0.6)',
                        }}>
                            ✦ Artesã & Ouriveira
                        </p>
                        <h1 style={{
                            fontSize: 'clamp(2.4rem, 7vw, 5rem)',
                            fontWeight: 300,
                            fontStyle: 'italic',
                            color: '#fff',
                            lineHeight: 1.1,
                            textShadow: '0 2px 24px rgba(0,0,0,0.5)',
                            marginBottom: 8,
                        }}>
                            Giovana Dias
                        </h1>
                        <p style={{
                            fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
                            color: 'rgba(255,245,220,0.8)',
                            fontStyle: 'italic',
                            fontWeight: 300,
                        }}>
                            Criadora de joias autorais desde a primeira faísca até o brilho final.
                        </p>
                    </div>
                </section>

                <section style={{
                    maxWidth: 1100,
                    margin: '0 auto',
                    padding: 'clamp(48px, 8vw, 100px) clamp(20px, 5vw, 48px)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: 'clamp(32px, 6vw, 72px)',
                    alignItems: 'center',
                }}>
                    <div>
                        <span style={{
                            display: 'inline-block',
                            fontSize: '0.7rem',
                            letterSpacing: '0.22em',
                            textTransform: 'uppercase',
                            color: 'var(--primary)',
                            fontWeight: 600,
                            marginBottom: 20,
                        }}>
                            Nossa História
                        </span>
                        <p style={{
                            fontSize: 'clamp(1rem, 1.8vw, 1.15rem)',
                            lineHeight: 1.85,
                            color: 'var(--text)',
                            marginBottom: 24,
                        }}>
                            Giovana Dias é o meu nome, sou eu quem cria todas as peças dessa marca, do início ao fim do processo, sou apaixonada por todas as etapas da ourivesaria, amo começar um desenho para um projeto novo...
                        </p>
                        <p style={{
                            fontSize: 'clamp(1rem, 1.8vw, 1.15rem)',
                            lineHeight: 1.85,
                            color: 'var(--text)',
                        }}>
                            Me inspiro nas texturas da natureza, da terra, das profundezas do oceano, na pele dos animais, na textura dos ossos... Amo criar novas coleções pois normalmente significam uma nova fase da minha vida, momentos marcantes em que me reconectei com meu eu interior e com a natureza divina e senti de ressignificar isso através de jóias autorais.
                        </p>
                    </div>

                    <div style={{ position: 'relative' }}>
                        <div style={{
                            position: 'absolute',
                            inset: '-12px -12px 12px 12px',
                            borderRadius: 20,
                            border: '1px solid',
                            borderColor: 'var(--border)',
                            opacity: 0.5,
                            zIndex: 0,
                        }} />
                        <img
                            src="/marca-joias.jpg"
                            alt="Joias autorais Giovana Dias"
                            style={{
                                position: 'relative',
                                zIndex: 1,
                                width: '100%',
                                borderRadius: 16,
                                objectFit: 'cover',
                                aspectRatio: '4/5',
                                display: 'block',
                                boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
                            }}
                        />
                    </div>
                </section>

                <section style={{
                    background: 'var(--bg-card)',
                    borderTop: '1px solid var(--border)',
                    borderBottom: '1px solid var(--border)',
                }}>
                    <div style={{
                        maxWidth: 860,
                        margin: '0 auto',
                        padding: 'clamp(48px, 8vw, 96px) clamp(20px, 5vw, 48px)',
                        textAlign: 'center',
                    }}>
                        <p style={{
                            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                            lineHeight: 1.9,
                            color: 'var(--text)',
                            marginBottom: 0,
                        }}>
                            O trabalho com metais preciosos, pedras, cristais, pérolas... todos juntos, vai muito além de criar uma jóia, é um processo de alquimia entre o fogo, a terra e o ar. Quando feito com muito amor e autenticidade tem como resultado uma <strong>joia rara</strong>. Espero passar isso através da minha marca para você!
                        </p>
                    </div>
                </section>

                <section style={{
                    position: 'relative',
                    overflow: 'hidden',
                    background: '#0d0a06',
                    padding: 'clamp(64px, 10vw, 120px) clamp(20px, 6vw, 80px)',
                    textAlign: 'center',
                }}>
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'radial-gradient(ellipse at 50% 50%, rgba(180,130,40,0.12) 0%, transparent 65%)',
                        pointerEvents: 'none',
                    }} />
                    <div style={{ position: 'relative', zIndex: 1, maxWidth: 760, margin: '0 auto' }}>
                        <div style={{
                            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                            color: 'rgba(200,160,80,0.4)',
                            lineHeight: 1,
                            marginBottom: 16,
                            fontFamily: 'Georgia, serif',
                        }}>
                            "
                        </div>
                        <blockquote style={{
                            fontSize: 'clamp(1rem, 2.2vw, 1.3rem)',
                            fontStyle: 'italic',
                            fontWeight: 300,
                            color: 'rgba(255,245,220,0.9)',
                            lineHeight: 1.9,
                            margin: 0,
                            textShadow: '0 1px 6px rgba(0,0,0,0.4)',
                        }}>
                            Assim como os cristais, a prata e o ouro espero que você brilhe cada dia mais e se reconecte com sua força interior e lembre-se sempre que até o cristal mais lindo, mais brilhante vem de um processo longo e necessário.
                        </blockquote>
                        <div style={{
                            marginTop: 32,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 10,
                        }}>
                            <span style={{ width: 32, height: 1, background: 'rgba(200,160,80,0.5)', display: 'block' }} />
                            <span style={{ fontSize: '0.8rem', letterSpacing: '0.18em', color: 'rgba(200,160,80,0.8)', textTransform: 'uppercase' }}>Giovana Dias</span>
                            <span style={{ width: 32, height: 1, background: 'rgba(200,160,80,0.5)', display: 'block' }} />
                        </div>
                    </div>
                </section>

            </main>

            <StoreFooter storeName={storeName} dict={dict} />
        </>
    )
}
