import { getSettings, SETTINGS_KEYS } from '@/lib/config'
import { getAuthUser } from '@/lib/auth'
import { StoreHeader } from '@/components/store/StoreHeader'
import { StoreFooter } from '@/components/store/StoreFooter'
import { ContactFormClient } from '@/components/store/ContactFormClient'
import { cookies } from 'next/headers'
import { dictionaries, defaultLocale, Locale } from '@/lib/i18n'

export async function generateMetadata() {
    const cookieStore = await cookies()
    const localeCookie = cookieStore.get('NEXT_LOCALE')?.value as Locale
    const currentLocale = (localeCookie && dictionaries[localeCookie]) ? localeCookie : defaultLocale
    const dict = dictionaries[currentLocale]
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://giovanadiasjewelry.com.br'

    return {
        title: dict.contactPage.title,
        description: dict.contactPage.subtitle,
        alternates: { canonical: `${baseUrl}/contato` },
        openGraph: {
            title: dict.contactPage.title,
            description: dict.contactPage.subtitle,
            type: 'website',
            url: `${baseUrl}/contato`,
        },
        twitter: {
            card: 'summary_large_image',
            title: dict.contactPage.title,
            description: dict.contactPage.subtitle,
        },
    }
}

export default async function ContatoPage() {
    const [storeSettings, user, cookieStore] = await Promise.all([
        getSettings([
            SETTINGS_KEYS.STORE_NAME,
            SETTINGS_KEYS.STORE_LOGO,
            SETTINGS_KEYS.STORE_FOOTER_TEXT,
            SETTINGS_KEYS.LANDING_WHATSAPP,
            SETTINGS_KEYS.LANDING_PHONE,
            SETTINGS_KEYS.LANDING_EMAIL,
        ]),
        getAuthUser(),
        cookies(),
    ])

    const localeCookie = cookieStore.get('NEXT_LOCALE')?.value as Locale
    const currentLocale = (localeCookie && dictionaries[localeCookie]) ? localeCookie : defaultLocale
    const dict = dictionaries[currentLocale]
    const c = dict.contactPage

    const storeName = storeSettings[SETTINGS_KEYS.STORE_NAME] || 'Giovana Dias'
    const logoUrl = storeSettings[SETTINGS_KEYS.STORE_LOGO] || null
    const phone = storeSettings[SETTINGS_KEYS.LANDING_PHONE] || null
    const whatsapp = storeSettings[SETTINGS_KEYS.LANDING_WHATSAPP] || null
    const email = storeSettings[SETTINGS_KEYS.LANDING_EMAIL] || null
    const whatsappLink = whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g, '')}` : null

    const features = [c.feat1, c.feat2, c.feat3, c.feat4]

    return (
        <>
            <StoreHeader storeName={storeName} logoUrl={logoUrl} user={user} dict={dict} />

            <main style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: 80 }}>

                {/* Hero — fundo escuro fixo sobre foto */}
                <div style={{
                    position: 'relative',
                    height: 340,
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'flex-end',
                }}>
                    <img
                        src="/contato-banner.png"
                        alt={c.title}
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 15%', filter: 'grayscale(40%) brightness(0.45)' }}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(8,5,2,0.95) 0%, rgba(8,5,2,0.4) 50%, rgba(8,5,2,0.2) 100%)' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(8,5,2,0.6) 0%, transparent 60%)' }} />

                    <div style={{ position: 'relative', zIndex: 1, padding: '0 40px 44px', maxWidth: 700 }}>
                        <p style={{ fontSize: '0.68rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(200,160,80,0.7)', marginBottom: 12, fontWeight: 600 }}>
                            ✦ Giovana Dias Joias ✦
                        </p>
                        <h1 style={{ fontSize: 'clamp(2.4rem, 6vw, 4rem)', fontWeight: 200, color: '#fff', letterSpacing: '0.08em', margin: '0 0 14px', textTransform: 'uppercase', lineHeight: 1.1 }}>
                            {c.title}
                        </h1>
                        <div style={{ width: 32, height: 1, background: 'rgba(200,160,80,0.6)', marginBottom: 14 }} />
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', fontWeight: 300, lineHeight: 1.6 }}>
                            {c.subtitle}
                        </p>
                    </div>
                </div>

                {/* Conteúdo — adapta ao tema */}
                <div style={{ maxWidth: 1040, margin: '0 auto', padding: '64px 20px 0' }}>
                    <div className="responsive-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 64, alignItems: 'start' }}>

                        <div>
                            <h2 style={{ fontSize: '0.68rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(200,160,80,0.8)', marginBottom: 24, fontWeight: 600 }}>
                                {c.sectionTitle}
                            </h2>
                            <p style={{ color: 'var(--text-title)', fontSize: '1.05rem', fontWeight: 400, lineHeight: 1.8, marginBottom: 20 }}>
                                {c.intro1}
                            </p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 400, lineHeight: 1.8, marginBottom: 36 }}>
                                {c.intro2}
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 40 }}>
                                {features.map((text) => (
                                    <div key={text} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                                        <span style={{ color: 'rgba(200,160,80,0.7)', fontSize: '0.7rem', marginTop: 4, flexShrink: 0 }}>✦</span>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6 }}>{text}</span>
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 32, borderTop: '1px solid var(--border)' }}>
                                {(phone || whatsapp) && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                        <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(200,160,80,0.08)', border: '1px solid rgba(200,160,80,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(200,160,80,0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 01.27 2.18 2 2 0 012.24 0h3a2 2 0 012 1.72c.13 1.01.36 2 .71 2.94a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.18 6.18l1.14-1.14a2 2 0 012.11-.45c.94.35 1.93.58 2.94.71A2 2 0 0122 16.92z" /></svg>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.68rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(200,160,80,0.7)', marginBottom: 2 }}>{c.phoneLabel}</p>
                                            <p style={{ color: 'var(--text-title)', fontWeight: 500, fontSize: '0.95rem' }}>{phone || whatsapp}</p>
                                        </div>
                                    </div>
                                )}

                                {email && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                        <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(200,160,80,0.08)', border: '1px solid rgba(200,160,80,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(200,160,80,0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.68rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(200,160,80,0.7)', marginBottom: 2 }}>{c.emailLabel}</p>
                                            <p style={{ color: 'var(--text-title)', fontWeight: 500, fontSize: '0.95rem' }}>{email}</p>
                                        </div>
                                    </div>
                                )}

                                {whatsappLink && (
                                    <a
                                        href={whatsappLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            display: 'inline-flex', alignItems: 'center', gap: 10, marginTop: 8,
                                            background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.25)',
                                            borderRadius: 8, padding: '12px 20px', color: '#25D366', textDecoration: 'none', fontSize: '0.83rem', fontWeight: 600,
                                            transition: 'background 0.2s',
                                        }}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.532 5.856L.072 23.928l6.228-1.433A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.693-.516-5.228-1.414l-.374-.222-3.896.896.93-3.791-.244-.39A9.959 9.959 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                                        {c.whatsappBtn}
                                    </a>
                                )}
                            </div>
                        </div>

                        <div style={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border)',
                            borderRadius: 16,
                            padding: '40px 36px',
                        }}>
                            <h3 style={{ fontSize: '0.68rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(200,160,80,0.8)', marginBottom: 8, fontWeight: 600 }}>
                                {c.formTitle}
                            </h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: 28 }}>
                                {c.formSubtitle}
                            </p>
                            <ContactFormClient whatsappLink={whatsappLink} phone={phone} email={email} dict={dict} />
                        </div>
                    </div>
                </div>
            </main>

            <StoreFooter storeName={storeName} dict={dict} footerText={storeSettings[SETTINGS_KEYS.STORE_FOOTER_TEXT] || undefined} logoUrl={logoUrl} />

            <style>{`
                @media (max-width: 1024px) {
                    div[style*="grid-template-columns: 1fr 1.2fr"] {
                        grid-template-columns: 1fr !important;
                        gap: 40px !important;
                    }
                    div[style*="padding: '0 40px 44px'"] {
                        padding: 0 20px 36px !important;
                    }
                }
            `}</style>
        </>
    )
}
