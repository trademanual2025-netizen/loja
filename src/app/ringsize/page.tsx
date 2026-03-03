import { getSettings, SETTINGS_KEYS } from '@/lib/config'
import { getAuthUser } from '@/lib/auth'
import { StoreHeader } from '@/components/store/StoreHeader'
import { StoreFooter } from '@/components/store/StoreFooter'
import { cookies } from 'next/headers'
import { dictionaries, defaultLocale, Locale } from '@/lib/i18n'

export const metadata = {
    title: 'Guia de Tamanhos de Anel',
    description: 'Descubra seu tamanho de anel com o guia oficial da Giovana Dias. Medição simples por circunferência do dedo.',
}

const SIZES = [
    { cm: '5,0 cm', size: 10 },
    { cm: '5,10 cm', size: 11 },
    { cm: '5,20 cm', size: 12 },
    { cm: '5,30 cm', size: 13 },
    { cm: '5,40 cm', size: 14 },
    { cm: '5,50 cm', size: 15 },
    { cm: '5,60 cm', size: 16 },
    { cm: '5,70 cm', size: 17 },
    { cm: '5,80 cm', size: 18 },
    { cm: '5,90 cm', size: 19 },
    { cm: '6,0 cm', size: 20 },
    { cm: '6,10 cm', size: 21 },
    { cm: '6,20 cm', size: 22 },
    { cm: '6,30 cm', size: 23 },
    { cm: '6,40 cm', size: 24 },
    { cm: '6,50 cm', size: 25 },
    { cm: '6,60 cm', size: 26 },
    { cm: '6,70 cm', size: 27 },
    { cm: '6,80 cm', size: 28 },
    { cm: '6,90 cm', size: 29 },
    { cm: '7,0 cm', size: 30 },
    { cm: '7,10 cm', size: 31 },
    { cm: '7,20 cm', size: 33 },
]

export default async function RingSizePage() {
    const [storeSettings, user, cookieStore] = await Promise.all([
        getSettings([SETTINGS_KEYS.STORE_NAME, SETTINGS_KEYS.STORE_LOGO, SETTINGS_KEYS.STORE_FOOTER_TEXT]),
        getAuthUser(),
        cookies(),
    ])

    const localeCookie = cookieStore.get('NEXT_LOCALE')?.value as Locale
    const currentLocale = (localeCookie && dictionaries[localeCookie]) ? localeCookie : defaultLocale
    const dict = dictionaries[currentLocale]

    const storeName = storeSettings[SETTINGS_KEYS.STORE_NAME] || 'Giovana Dias'
    const logoUrl = storeSettings[SETTINGS_KEYS.STORE_LOGO] || null

    return (
        <>
            <StoreHeader storeName={storeName} logoUrl={logoUrl} user={user} dict={dict} />

            <main style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: 80 }}>

                <div style={{
                    position: 'relative',
                    background: 'linear-gradient(135deg, #0d0a06 0%, #1a1208 50%, #0d0a06 100%)',
                    borderBottom: '1px solid rgba(200,160,80,0.15)',
                    padding: '64px 20px 56px',
                    textAlign: 'center',
                    overflow: 'hidden',
                }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(200,160,80,0.08) 0%, transparent 65%)' }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <p style={{ fontSize: '0.7rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(200,160,80,0.7)', marginBottom: 16, fontWeight: 600 }}>
                            ✦ Giovana Dias Joias ✦
                        </p>
                        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 200, color: '#fff', letterSpacing: '0.06em', margin: '0 0 16px', textTransform: 'uppercase' }}>
                            Guia de Tamanhos
                        </h1>
                        <div style={{ width: 40, height: 1, background: 'rgba(200,160,80,0.6)', margin: '0 auto 20px' }} />
                        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1rem', fontWeight: 300, maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
                            Encontre o tamanho perfeito para os seus anéis antes de finalizar sua compra.
                        </p>
                    </div>
                </div>

                <div style={{ maxWidth: 860, margin: '0 auto', padding: '60px 20px 0' }}>

                    <section style={{ marginBottom: 64 }}>
                        <h2 style={{ fontSize: '0.7rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(200,160,80,0.8)', marginBottom: 32, fontWeight: 600 }}>
                            Como medir seu dedo
                        </h2>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 32 }}>
                            {[
                                {
                                    step: '01',
                                    icon: (
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(200,160,80,0.85)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 2C8.5 2 7 4.5 7 7v6l-2 2v2h14v-2l-2-2V7c0-2.5-1.5-5-5-5z" />
                                            <circle cx="12" cy="20" r="2" />
                                        </svg>
                                    ),
                                    title: 'Prepare um fio',
                                    desc: 'Use um barbante fino, linha ou tira de papel estreita.',
                                },
                                {
                                    step: '02',
                                    icon: (
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(200,160,80,0.85)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="9" />
                                            <path d="M12 7v5l3 3" />
                                        </svg>
                                    ),
                                    title: 'Envolva o dedo',
                                    desc: 'Dê uma volta completa no dedo — nem apertado, nem folgado.',
                                },
                                {
                                    step: '03',
                                    icon: (
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(200,160,80,0.85)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M3 12h18M3 6h18M3 18h12" />
                                        </svg>
                                    ),
                                    title: 'Meça na régua',
                                    desc: 'Estenda o fio sobre uma régua e anote o comprimento em centímetros.',
                                },
                                {
                                    step: '04',
                                    icon: (
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(200,160,80,0.85)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="3" width="18" height="18" rx="2" />
                                            <path d="M8 12l3 3 5-5" />
                                        </svg>
                                    ),
                                    title: 'Consulte a tabela',
                                    desc: 'Localize a medida correspondente na tabela abaixo para encontrar seu número.',
                                },
                            ].map(({ step, icon, title, desc }) => (
                                <div key={step} style={{
                                    background: 'var(--bg-card)',
                                    border: '1px solid rgba(200,160,80,0.12)',
                                    borderRadius: 12,
                                    padding: '28px 24px',
                                    position: 'relative',
                                }}>
                                    <span style={{ position: 'absolute', top: 18, right: 20, fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', color: 'rgba(200,160,80,0.3)' }}>{step}</span>
                                    <div style={{ marginBottom: 16 }}>{icon}</div>
                                    <p style={{ fontWeight: 600, color: 'var(--text-title)', marginBottom: 8, fontSize: '0.95rem' }}>{title}</p>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.83rem', lineHeight: 1.6 }}>{desc}</p>
                                </div>
                            ))}
                        </div>

                        <div style={{
                            background: 'rgba(200,160,80,0.05)',
                            border: '1px solid rgba(200,160,80,0.15)',
                            borderLeft: '3px solid rgba(200,160,80,0.6)',
                            borderRadius: '0 8px 8px 0',
                            padding: '16px 20px',
                            fontSize: '0.83rem',
                            color: 'rgba(255,255,255,0.6)',
                            lineHeight: 1.7,
                        }}>
                            💡 <strong style={{ color: 'rgba(200,160,80,0.9)' }}>Dica:</strong> Meça ao final do dia, quando os dedos tendem a estar um pouco maiores. Para anéis mais largos, recomendamos escolher meio número acima.
                        </div>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '0.7rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(200,160,80,0.8)', marginBottom: 24, fontWeight: 600 }}>
                            Tabela de tamanhos — circunferência
                        </h2>

                        <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(200,160,80,0.14)' }}>
                            <div style={{
                                display: 'grid', gridTemplateColumns: '1fr 1fr',
                                background: 'rgba(200,160,80,0.1)',
                                borderBottom: '1px solid rgba(200,160,80,0.2)',
                                padding: '14px 32px',
                            }}>
                                <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(200,160,80,0.9)' }}>Circunferência (cm)</span>
                                <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(200,160,80,0.9)', textAlign: 'center' }}>Tamanho do anel</span>
                            </div>

                            {SIZES.map(({ cm, size }, i) => (
                                <div key={size} style={{
                                    display: 'grid', gridTemplateColumns: '1fr 1fr',
                                    padding: '13px 32px',
                                    background: i % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-card2)',
                                    borderBottom: i < SIZES.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                                    transition: 'background 0.15s',
                                }}>
                                    <span style={{ color: 'var(--text-body)', fontSize: '0.9rem', fontVariantNumeric: 'tabular-nums', fontWeight: 400 }}>{cm}</span>
                                    <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', textAlign: 'center', letterSpacing: '0.05em' }}>{size}</span>
                                </div>
                            ))}
                        </div>

                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 20, lineHeight: 1.6 }}>
                            Dúvidas? Entre em contato conosco antes de finalizar seu pedido.
                        </p>
                    </section>
                </div>
            </main>

            <StoreFooter storeName={storeName} dict={dict} footerText={storeSettings[SETTINGS_KEYS.STORE_FOOTER_TEXT] || undefined} />

            <style>{`
                @media (max-width: 600px) {
                    div[style*="repeat(auto-fit, minmax(220px"] {
                        grid-template-columns: 1fr 1fr !important;
                    }
                    div[style*="padding: '13px 32px'"] {
                        padding: 12px 16px !important;
                    }
                }
            `}</style>
        </>
    )
}
