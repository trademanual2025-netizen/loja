'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useCart } from '@/lib/cart'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { fbTrackInitiateCheckout } from '@/components/tracking/FacebookPixel'
import { gtagBeginCheckout } from '@/components/tracking/GoogleAds'
import type { TrackingUserData } from '@/lib/tracking'
import type { GtagUserData } from '@/components/tracking/GoogleAds'
import { MapPin, CreditCard, Truck, Globe } from 'lucide-react'
import { MercadoPagoBrick } from '@/components/checkout/MercadoPagoBrick'
import { StripeCheckoutForm } from '@/components/checkout/StripeCheckoutForm'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import Cookies from 'js-cookie'
import { COUNTRIES, getCountry, type Country } from '@/lib/countries'
import { dictionaries, Locale, defaultLocale } from '@/lib/i18n'

function getCepState(cep: string): string | null {
    const prefix = parseInt(cep.substring(0, 3), 10)
    if (prefix >= 10 && prefix <= 19) return 'SP'
    if (prefix >= 20 && prefix <= 28) return 'RJ'
    if (prefix >= 29 && prefix <= 29) return 'ES'
    if (prefix >= 30 && prefix <= 39) return 'MG'
    if (prefix >= 40 && prefix <= 48) return 'BA'
    if (prefix >= 49 && prefix <= 49) return 'SE'
    if (prefix >= 50 && prefix <= 56) return 'PE'
    if (prefix >= 57 && prefix <= 57) return 'AL'
    if (prefix >= 58 && prefix <= 58) return 'PB'
    if (prefix >= 59 && prefix <= 59) return 'RN'
    if (prefix >= 60 && prefix <= 63) return 'CE'
    if (prefix >= 64 && prefix <= 64) return 'PI'
    if (prefix >= 65 && prefix <= 65) return 'MA'
    if (prefix >= 66 && prefix <= 68) return 'PA'
    if (prefix >= 69 && prefix <= 69) return 'AM'
    if (prefix >= 70 && prefix <= 73) return 'DF'
    if (prefix >= 74 && prefix <= 76) return 'GO'
    if (prefix >= 77 && prefix <= 77) return 'TO'
    if (prefix >= 78 && prefix <= 78) return 'MT'
    if (prefix >= 79 && prefix <= 79) return 'MS'
    if (prefix >= 80 && prefix <= 87) return 'PR'
    if (prefix >= 88 && prefix <= 89) return 'SC'
    if (prefix >= 90 && prefix <= 99) return 'RS'
    if (prefix >= 1 && prefix <= 9) return 'SP'
    return null
}

type Step = 'address' | 'shipping' | 'payment'

interface AddressForm {
    zipCode: string
    street: string
    number: string
    complement: string
    neighborhood: string
    city: string
    state: string
}

interface ShippingOption { label: string; value: number; days?: number; daysText?: string }

function CountrySelector({ value, onChange, searchPlaceholder }: { value: string; onChange: (code: string) => void; searchPlaceholder: string }) {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')
    const ref = useRef<HTMLDivElement>(null)
    const current = getCountry(value)

    useEffect(() => {
        function handle(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener('mousedown', handle)
        return () => document.removeEventListener('mousedown', handle)
    }, [])

    const filtered = COUNTRIES.filter(c =>
        c.code !== 'OTHER' && (
            c.namePT.toLowerCase().includes(search.toLowerCase()) ||
            c.nameEN.toLowerCase().includes(search.toLowerCase()) ||
            c.code.toLowerCase().includes(search.toLowerCase())
        )
    )

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="input"
                style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', textAlign: 'left', width: '100%' }}
            >
                <span style={{ fontSize: '1.3rem' }}>{current.flag}</span>
                <span style={{ flex: 1 }}>{current.namePT}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>▼</span>
            </button>

            {open && (
                <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 999,
                    background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)', marginTop: 4, overflow: 'hidden',
                }}>
                    <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>
                        <input
                            autoFocus
                            className="input"
                            placeholder={searchPlaceholder}
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ margin: 0 }}
                        />
                    </div>
                    <div style={{ maxHeight: 240, overflowY: 'auto' }}>
                        {filtered.map(c => (
                            <button
                                key={c.code}
                                type="button"
                                onClick={() => { onChange(c.code); setOpen(false); setSearch('') }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                                    padding: '9px 14px', background: c.code === value ? 'rgba(200,160,80,0.1)' : 'transparent',
                                    border: 'none', cursor: 'pointer', color: 'var(--text)', textAlign: 'left',
                                    fontSize: '0.9rem',
                                }}
                                onMouseEnter={e => { if (c.code !== value) (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-card2)' }}
                                onMouseLeave={e => { if (c.code !== value) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
                            >
                                <span style={{ fontSize: '1.15rem' }}>{c.flag}</span>
                                <span>{c.namePT}</span>
                                <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--text-muted)' }}>{c.code}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default function CheckoutPage() {
    const { items, total } = useCart()
    const router = useRouter()
    const [step, setStep] = useState<Step>('address')
    const [shipping, setShipping] = useState<ShippingOption>({ label: '', value: 0 })
    const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([])
    const [paymentGateway, setPaymentGateway] = useState<'mp' | 'stripe'>('mp')
    const [address, setAddress] = useState<(AddressForm & { country: string }) | null>(null)
    const [loading, setLoading] = useState(false)
    const [configs, setConfigs] = useState<any>(null)
    const [adsConfig, setAdsConfig] = useState<{ adsId: string; adsLabel: string } | null>(null)

    const [stripePromise, setStripePromise] = useState<any>(null)
    const [trackingUser, setTrackingUser] = useState<TrackingUserData | undefined>(undefined)
    const [clientSecret, setClientSecret] = useState<string>('')
    const [stripeOrderId, setStripeOrderId] = useState<string>('')
    const [locale, setLocale] = useState<Locale>(defaultLocale)
    const dict = dictionaries[locale]

    const [mounted, setMounted] = useState(false)
    const [postalLoading, setPostalLoading] = useState(false)
    const [gatewayMode, setGatewayMode] = useState<string>('manual')
    const [detectedCountry, setDetectedCountry] = useState<string | null>(null)
    const [selectedCountry, setSelectedCountry] = useState<string>('BR')
    const [locationDetecting, setLocationDetecting] = useState(true)
    const [pixDiscount, setPixDiscount] = useState(false)
    const [isDark, setIsDark] = useState(false)
    const [installments, setInstallments] = useState(1)
    const lastPostalLookedUp = useRef('')
    const addressForm = useForm<AddressForm>()

    const countryData = getCountry(selectedCountry)
    const isBrazil = selectedCountry === 'BR'
    const isInternational = !isBrazil

    const pixDiscountEnabled = configs?.pix_discount_enabled === 'true'
    const pixDiscountRate = parseFloat(configs?.pix_discount_rate || '5')
    const pixDiscountScope = configs?.pix_discount_scope || 'all'
    const pixDiscountProductIds = (configs?.pix_discount_products || '').split(',').filter(Boolean)
    const pixDiscountEligible = pixDiscountEnabled && isBrazil && (
        pixDiscountScope === 'all' ||
        items.every(i => pixDiscountProductIds.includes(i.id))
    )

    useEffect(() => {
        setMounted(true)
        setIsDark(document.documentElement.getAttribute('data-theme') === 'dark')
        const themeObserver = new MutationObserver(() => {
            setIsDark(document.documentElement.getAttribute('data-theme') === 'dark')
        })
        themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

        const saved = Cookies.get('NEXT_LOCALE') as Locale
        if (saved && dictionaries[saved]) setLocale(saved)

        fetch('/api/user/profile').then(r => r.ok ? r.json() : null).then(profile => {
            if (profile) {
                const nameParts = (profile.name || '').split(' ')
                const tu: TrackingUserData = {
                    email: profile.email,
                    phone: profile.phone || undefined,
                    firstName: nameParts[0] || undefined,
                    lastName: nameParts.slice(1).join(' ') || undefined,
                    country: 'br',
                    externalId: profile.id,
                }
                setTrackingUser(tu)
                if (items.length > 0) {
                    fbTrackInitiateCheckout(total(), items.length, tu)
                    const gtu: GtagUserData = { email: tu.email, phone: tu.phone, firstName: tu.firstName, lastName: tu.lastName, country: 'BR' }
                    gtagBeginCheckout(total(), items.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })), gtu)
                }
            } else if (items.length > 0) {
                fbTrackInitiateCheckout(total(), items.length)
                gtagBeginCheckout(total(), items.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })))
            }
        }).catch(() => {
            if (items.length > 0) {
                fbTrackInitiateCheckout(total(), items.length)
                gtagBeginCheckout(total(), items.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })))
            }
        })

        fetch('/api/admin/settings').then(r => r.json()).then(s => {
            setConfigs(s)
            const mode = s.payment_gateway_mode || 'manual'
            setGatewayMode(mode)
            if (s.google_ads_id && s.google_ads_label) {
                setAdsConfig({ adsId: s.google_ads_id, adsLabel: s.google_ads_label })
            }
            if (s.stripe_public_key) {
                setStripePromise(loadStripe(s.stripe_public_key))
            }

            detectCountry().then(country => {
                setDetectedCountry(country)
                setSelectedCountry(country)
                setLocationDetecting(false)
                if (mode === 'mp_only') {
                    setPaymentGateway('mp')
                } else if (mode === 'stripe_only') {
                    setPaymentGateway('stripe')
                } else if (mode === 'auto' || country !== 'BR') {
                    if (country === 'BR' && s.mp_public_key) {
                        setPaymentGateway('mp')
                    } else if (s.stripe_public_key) {
                        setPaymentGateway('stripe')
                    } else {
                        setPaymentGateway('mp')
                    }
                } else {
                    if (!s.mp_public_key && s.stripe_public_key) setPaymentGateway('stripe')
                }
            })
        }).catch(() => { setLocationDetecting(false) })
        return () => themeObserver.disconnect()
    }, [])

    function handleCountryChange(code: string) {
        setSelectedCountry(code)
        addressForm.reset()
        lastPostalLookedUp.current = ''
        if (code !== 'BR' && configs) {
            if (configs.stripe_public_key) setPaymentGateway('stripe')
        } else if (code === 'BR' && configs?.mp_public_key && gatewayMode !== 'stripe_only') {
            setPaymentGateway('mp')
        }
    }

    async function detectCountry(): Promise<string> {
        try {
            const res = await fetch('/api/geo', { signal: AbortSignal.timeout(5000) })
            const data = await res.json()
            return data.country || 'BR'
        } catch {
            try {
                const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(4000) })
                const data = await res.json()
                return data.country_code || 'BR'
            } catch {
                return 'BR'
            }
        }
    }

    async function handleAddressSubmit(data: AddressForm) {
        setLoading(true)
        const fallbackOptions: ShippingOption[] = isBrazil
            ? [
                { label: dict.checkout.pacLabel, value: 24.90, days: 8 },
                { label: dict.checkout.sedexLabel, value: 42.90, days: 4 },
            ]
            : [
                { label: dict.checkout.intlShipping, value: 150, daysText: '20–40 dias úteis' },
            ]

        const fullAddress = {
            ...data,
            country: selectedCountry,
            neighborhood: data.neighborhood || '',
            number: data.number || '',
            state: data.state || '',
        }

        setTrackingUser(prev => prev ? {
            ...prev,
            city: data.city,
            state: data.state,
            zipCode: data.zipCode.replace(/\D/g, ''),
            country: selectedCountry.toLowerCase(),
        } : prev)

        try {
            const res = await fetch('/api/shipping', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    state: data.state || '',
                    subtotal: total(),
                    zipCode: data.zipCode.replace(/\D/g, ''),
                    items: items.map(i => ({ id: i.id, quantity: i.quantity })),
                    country: selectedCountry,
                    locale,
                }),
            })
            const json = await res.json()
            const opts = json.options && json.options.length > 0 ? json.options : fallbackOptions
            setAddress(fullAddress)
            setShippingOptions(opts)
            setShipping(opts[0])
            setStep('shipping')
        } catch {
            setAddress(fullAddress)
            setShippingOptions(fallbackOptions)
            setShipping(fallbackOptions[0])
            setStep('shipping')
        } finally {
            setLoading(false)
        }
    }

    const lookupPostal = useCallback(async (raw: string, countryCode: string) => {
        const clean = raw.replace(/\D/g, '')
        if (clean === lastPostalLookedUp.current) return
        const fmt = getCountry(countryCode).fmt

        if (countryCode === 'BR') {
            if (clean.length !== 8) return
            lastPostalLookedUp.current = clean
            setPostalLoading(true)
            try {
                const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`)
                const data = await res.json()
                if (!data.erro) {
                    if (data.logradouro) addressForm.setValue('street', data.logradouro)
                    if (data.bairro) addressForm.setValue('neighborhood', data.bairro)
                    if (data.localidade) addressForm.setValue('city', data.localidade)
                    if (data.uf) addressForm.setValue('state', data.uf)
                    toast.success(dict.checkout.addressFound)
                } else {
                    const stateFromCep = getCepState(clean)
                    if (stateFromCep) {
                        addressForm.setValue('state', stateFromCep)
                        toast.info(dict.checkout.genericCep)
                    } else {
                        toast.warning(dict.checkout.cepNotFound)
                    }
                }
            } catch {
                const stateFromCep = getCepState(clean)
                if (stateFromCep) addressForm.setValue('state', stateFromCep)
                toast.warning(dict.checkout.cepError)
            } finally {
                setPostalLoading(false)
            }
            return
        }

        if (fmt.lookup === 'zippopotam' && fmt.zippopotamCode && fmt.postalCodeLen && clean.length >= fmt.postalCodeLen) {
            lastPostalLookedUp.current = clean
            setPostalLoading(true)
            try {
                const res = await fetch(`https://api.zippopotam.us/${fmt.zippopotamCode}/${encodeURIComponent(raw.trim())}`, {
                    signal: AbortSignal.timeout(5000)
                })
                if (res.ok) {
                    const data = await res.json()
                    const place = data.places?.[0]
                    if (place) {
                        if (place['place name']) addressForm.setValue('city', place['place name'])
                        if (place['state']) addressForm.setValue('state', place['state abbreviation'] || place['state'])
                        toast.success(dict.checkout.postalLookupFound)
                    }
                }
            } catch {
                toast.info(dict.checkout.postalLookupError)
            } finally {
                setPostalLoading(false)
            }
        }
    }, [addressForm, dict])

    async function continueToPayment() {
        setStep('payment')
        if (paymentGateway === 'stripe' && configs?.stripe_public_key) {
            initStripeIntent(pixDiscount)
        }
    }

    async function initStripeIntent(withPixDiscount = false) {
        if (!address) return
        setClientSecret('')
        try {
            const res = await fetch('/api/checkout/stripe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: items.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity, variantId: i.variantId })),
                    address,
                    shippingCost: shipping.value,
                    payWithPix: withPixDiscount,
                }),
            })
            const json = await res.json()
            if (json.clientSecret) {
                setClientSecret(json.clientSecret)
                setStripeOrderId(json.orderId || '')
            } else {
                toast.error(dict.checkout.stripeError)
            }
        } catch {
            toast.error(dict.checkout.stripeConnError)
        }
    }

    function togglePixDiscount(enabled: boolean) {
        setPixDiscount(enabled)
        if (enabled) {
            setPaymentGateway('mp')
            setClientSecret('')
            setStripeOrderId('')
        } else if (paymentGateway === 'stripe' && step === 'payment' && !clientSecret) {
            initStripeIntent(false)
        }
    }

    const stepIcon = (s: Step) => ({ address: <MapPin size={18} />, shipping: <Truck size={18} />, payment: <CreditCard size={18} /> }[s])
    const steps: Step[] = ['address', 'shipping', 'payment']
    const stepLabel = {
        address: dict.checkout.address,
        shipping: dict.checkout.shipping,
        payment: dict.checkout.payment
    }

    if (!mounted) {
        return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><span className="spinner" /></div>
    }

    if (items.length === 0 && step === 'address') {
        return <div style={{ padding: 100, textAlign: 'center' }}>{dictionaries[locale].store.emptyCart}</div>
    }

    return (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 16px' }}>
            <h1 style={{ fontWeight: 800, fontSize: '1.8rem', marginBottom: 32 }}>{dictionaries[locale].store.checkout}</h1>

            {/* Stepper */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32, gap: 0 }}>
                {steps.map((s, i) => (
                    <div key={s} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                            <div style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: step === s ? 'var(--primary)' : steps.indexOf(step) > i ? '#22c55e' : 'var(--bg-card2)', border: '2px solid var(--border)', marginBottom: 6 }}>
                                {stepIcon(s)}
                            </div>
                            <span style={{ fontSize: '0.75rem', color: step === s ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 600 }}>{stepLabel[s]}</span>
                        </div>
                        {i < steps.length - 1 && <div style={{ height: 2, flex: 0.5, background: steps.indexOf(step) > i ? '#22c55e' : 'var(--border)' }} />}
                    </div>
                ))}
            </div>

            {/* Step 1: Endereço */}
            {step === 'address' && (
                <div className="card fade-in">
                    <h2 style={{ fontWeight: 700, marginBottom: 20 }}>{dict.checkout.address}</h2>
                    <form onSubmit={addressForm.handleSubmit(handleAddressSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                        {/* Seletor de País */}
                        <div className="form-group">
                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Globe size={14} /> {dict.checkout.countryLabel} *
                            </label>
                            {locationDetecting ? (
                                <div className="input" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                    <span className="spinner" style={{ width: 14, height: 14, flexShrink: 0 }} />
                                    {dict.checkout.detectingLocation}
                                </div>
                            ) : (
                                <CountrySelector
                                    value={selectedCountry}
                                    onChange={handleCountryChange}
                                    searchPlaceholder={dict.checkout.searchCountry}
                                />
                            )}
                        </div>

                        {/* Aviso internacional */}
                        {isInternational && (
                            <div style={{ padding: '12px 16px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8, fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                                🌍 {dict.checkout.intlNote}
                                <br />
                                <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{dict.checkout.brlNote}</span>
                            </div>
                        )}

                        {/* Código Postal */}
                        <div className="form-group">
                            <label className="form-label">{countryData.fmt.postalCodeLabel} *</label>
                            <div style={{ position: 'relative' }}>
                                {isBrazil ? (
                                    <input
                                        className="input"
                                        placeholder="00000-000"
                                        maxLength={9}
                                        value={addressForm.watch('zipCode') || ''}
                                        onChange={(e) => {
                                            const digits = e.target.value.replace(/\D/g, '').substring(0, 8)
                                            const formatted = digits.length > 5 ? digits.substring(0, 5) + '-' + digits.substring(5) : digits
                                            addressForm.setValue('zipCode', formatted, { shouldValidate: true })
                                            if (digits.length === 8) lookupPostal(digits, 'BR')
                                        }}
                                        onPaste={(e) => {
                                            e.preventDefault()
                                            const pasted = e.clipboardData.getData('text')
                                            const digits = pasted.replace(/\D/g, '').substring(0, 8)
                                            const formatted = digits.length > 5 ? digits.substring(0, 5) + '-' + digits.substring(5) : digits
                                            addressForm.setValue('zipCode', formatted, { shouldValidate: true })
                                            if (digits.length === 8) lookupPostal(digits, 'BR')
                                        }}
                                        onBlur={(e) => lookupPostal(e.target.value, 'BR')}
                                        style={{ paddingRight: postalLoading ? 40 : undefined }}
                                    />
                                ) : (
                                    <input
                                        className="input"
                                        placeholder={countryData.fmt.postalCodeHint || ''}
                                        {...addressForm.register('zipCode', { required: true })}
                                        onBlur={(e) => lookupPostal(e.target.value, selectedCountry)}
                                        style={{ paddingRight: postalLoading ? 40 : undefined }}
                                    />
                                )}
                                {postalLoading && (
                                    <span className="spinner" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18 }} />
                                )}
                            </div>
                        </div>

                        {/* Logradouro */}
                        <div className="form-group">
                            <label className="form-label">
                                {isBrazil ? dict.checkout.address : dict.checkout.streetLabel} *
                            </label>
                            <input className="input" {...addressForm.register('street', { required: true })} />
                        </div>

                        {/* Número + Complemento (Brasil) ou só Complemento/Apto (internacional) */}
                        {isBrazil ? (
                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">{dict.checkout.number} *</label>
                                    <input className="input" {...addressForm.register('number', { required: true })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">{dict.checkout.complement}</label>
                                    <input className="input" {...addressForm.register('complement')} />
                                </div>
                            </div>
                        ) : countryData.fmt.hasNumber ? (
                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">{dict.checkout.number}</label>
                                    <input className="input" {...addressForm.register('number')} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">{dict.checkout.aptLabel}</label>
                                    <input className="input" {...addressForm.register('complement')} />
                                </div>
                            </div>
                        ) : (
                            <div className="form-group">
                                <label className="form-label">{dict.checkout.aptLabel}</label>
                                <input className="input" {...addressForm.register('complement')} />
                            </div>
                        )}

                        {/* Bairro (só Brasil) */}
                        {countryData.fmt.hasNeighborhood && (
                            <div className="form-group">
                                <label className="form-label">{dict.checkout.neighborhood} *</label>
                                <input className="input" {...addressForm.register('neighborhood', { required: isBrazil })} />
                            </div>
                        )}

                        {/* Cidade + Estado/Região */}
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">{dict.checkout.city} *</label>
                                <input className="input" {...addressForm.register('city', { required: true })} />
                            </div>
                            {countryData.fmt.showState && (
                                <div className="form-group">
                                    <label className="form-label">
                                        {isBrazil ? dict.checkout.state : (countryData.fmt.stateLabel || dict.checkout.regionLabel)} {isBrazil ? '*' : ''}
                                    </label>
                                    <input
                                        className="input"
                                        maxLength={isBrazil ? 2 : undefined}
                                        placeholder={isBrazil ? 'SP' : ''}
                                        {...addressForm.register('state', { required: isBrazil })}
                                    />
                                </div>
                            )}
                        </div>

                        <button className="btn btn-primary" disabled={loading} type="submit">
                            {loading ? <span className="spinner" /> : `${dict.checkout.calculateShipping} →`}
                        </button>
                    </form>
                </div>
            )}

            {/* Step 2: Frete */}
            {step === 'shipping' && (
                <div className="card fade-in">
                    <h2 style={{ fontWeight: 700, marginBottom: 4 }}>{dict.checkout.shipping}</h2>
                    {isInternational && (
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                            🌍 {dict.checkout.intlNote}
                        </p>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24, marginTop: 16 }}>
                        {shippingOptions.map((opt) => (
                            <label key={opt.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, background: 'var(--bg-card2)', borderRadius: 8, border: `1px solid ${shipping.label === opt.label ? 'var(--primary)' : 'var(--border)'}`, cursor: 'pointer' }}>
                                <input type="radio" name="shipping" checked={shipping.label === opt.label} onChange={() => setShipping(opt)} />
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 600 }}>{opt.label}</p>
                                    {(opt.daysText || opt.days) && (
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                                            {dict.checkout.deadline} {opt.daysText || `${opt.days} ${dict.checkout.businessDays}`}
                                        </p>
                                    )}
                                </div>
                                <span style={{ fontWeight: 700, color: opt.value === 0 ? '#22c55e' : 'var(--text)' }}>
                                    {opt.value === 0 ? dict.checkout.freeShipping : `R$ ${opt.value.toFixed(2).replace('.', ',')}`}
                                </span>
                            </label>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button onClick={() => setStep('address')} className="btn btn-secondary">← {dict.checkout.back}</button>
                        <button onClick={continueToPayment} className="btn btn-primary" style={{ flex: 1 }}>
                            {dict.store.checkout} →
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Pagamento */}
            {step === 'payment' && (
                <div className="card fade-in">
                    <h2 style={{ fontWeight: 700, marginBottom: 20 }}>{dict.checkout.payment}</h2>

                    {/* Resumo */}
                    <div style={{ background: 'var(--bg-card2)', padding: 16, borderRadius: 8, marginBottom: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: 8 }}>
                            <span>{dict.cart.subtotal}</span>
                            <span>R$ {total().toFixed(2).replace('.', ',')}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: 8 }}>
                            <span>{dict.checkout.shipping} ({shipping.label})</span>
                            <span>{shipping.value === 0 ? dict.checkout.freeShipping : `R$ ${shipping.value.toFixed(2).replace('.', ',')}`}</span>
                        </div>
                        {pixDiscount && pixDiscountEligible && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#22c55e', marginBottom: 8, fontWeight: 600 }}>
                                <span>Desconto PIX ({pixDiscountRate}%)</span>
                                <span>- R$ {(Math.round((total() + shipping.value) * (pixDiscountRate / 100) * 100) / 100).toFixed(2).replace('.', ',')}</span>
                            </div>
                        )}
                        <hr className="divider" />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem' }}>
                            <span>{dict.checkout.total}</span>
                            <span style={{ color: 'var(--primary)' }}>
                                R$ {(pixDiscount && pixDiscountEligible
                                    ? Math.round((total() + shipping.value) * (1 - pixDiscountRate / 100) * 100) / 100
                                    : total() + shipping.value
                                ).toFixed(2).replace('.', ',')}
                            </span>
                        </div>
                        {isInternational && (
                            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 8 }}>{dict.checkout.brlNote}</p>
                        )}
                    </div>

                    {/* Toggle desconto PIX — só aparece quando habilitado no admin, produtos elegíveis
                        e, no caso do Stripe, apenas antes do formulário carregar (PaymentIntent ainda não criado) */}
                    {pixDiscountEligible && !(paymentGateway === 'stripe' && !!clientSecret) && (
                        <div
                            onClick={() => togglePixDiscount(!pixDiscount)}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '14px 16px', marginBottom: 20, borderRadius: 10, cursor: 'pointer',
                                background: pixDiscount ? 'rgba(34,197,94,0.08)' : 'var(--bg-card2)',
                                border: `1.5px solid ${pixDiscount ? '#22c55e' : 'var(--border)'}`,
                                transition: 'all 0.2s',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span style={{ fontSize: '1.3rem' }}>⚡</span>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Pagar com PIX</div>
                                    <div style={{ fontSize: '0.78rem', color: '#22c55e', fontWeight: 600 }}>{pixDiscountRate}% de desconto instantâneo</div>
                                </div>
                            </div>
                            <div style={{
                                width: 44, height: 24, borderRadius: 12, position: 'relative',
                                background: pixDiscount ? '#22c55e' : 'var(--border)', transition: 'background 0.2s', flexShrink: 0,
                            }}>
                                <div style={{
                                    width: 18, height: 18, borderRadius: '50%', background: '#fff',
                                    position: 'absolute', top: 3, left: pixDiscount ? 23 : 3, transition: 'left 0.2s',
                                }} />
                            </div>
                        </div>
                    )}

                    {/* Aviso de localização / gateway */}
                    {gatewayMode === 'auto' && detectedCountry && (
                        <div style={{ padding: '10px 14px', background: 'rgba(99,102,241,0.08)', borderRadius: 8, border: '1px solid rgba(99,102,241,0.15)', marginBottom: 16, fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
                            🌍 {detectedCountry === 'BR' ? dict.checkout.brazilDetected : dict.checkout.internationalDetected}
                        </div>
                    )}

                    {/* Recomendação Stripe para internacional */}
                    {isInternational && configs?.stripe_public_key && (
                        <div style={{ padding: '10px 14px', background: 'rgba(99,102,241,0.06)', borderRadius: 8, border: '1px solid rgba(99,102,241,0.15)', marginBottom: 16, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            💳 {dict.checkout.stripeRecommended}
                        </div>
                    )}

                    {/* Gateway Selector */}
                    {!pixDiscount && configs?.mp_public_key && configs?.stripe_public_key && (gatewayMode === 'manual' || !gatewayMode) && (
                        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                            <button className={`btn ${paymentGateway === 'mp' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1 }} onClick={() => setPaymentGateway('mp')}>
                                Mercado Pago
                            </button>
                            <button className={`btn ${paymentGateway === 'stripe' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1 }} onClick={() => {
                                setPaymentGateway('stripe')
                                if (!clientSecret) initStripeIntent(pixDiscount)
                            }}>
                                {dict.checkout.creditCard}
                            </button>
                        </div>
                    )}

                    {/* Mercado Pago Render */}
                    {paymentGateway === 'mp' && configs?.mp_public_key && (
                        <MercadoPagoBrick
                            publicKey={configs.mp_public_key}
                            totalAmount={pixDiscount && pixDiscountEligible
                                ? Math.round((total() + shipping.value) * (1 - pixDiscountRate / 100) * 100) / 100
                                : total() + shipping.value}
                            items={items.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity, variantId: i.variantId }))}
                            address={address}
                            shippingCost={shipping.value}
                            payWithPix={pixDiscount}
                            adsConfig={adsConfig}
                            trackingUser={trackingUser}
                            installments={installments}
                            onInstallmentsChange={setInstallments}
                        />
                    )}

                    {/* Stripe Render */}
                    {paymentGateway === 'stripe' && clientSecret && stripePromise && (
                        <Elements stripe={stripePromise} options={{
                            clientSecret,
                            appearance: isDark ? {
                                theme: 'night',
                                variables: {
                                    colorPrimary: '#5b5ef4',
                                    colorBackground: '#0f0f1a',
                                    colorText: '#e8e8f5',
                                    colorTextSecondary: '#a0a0c0',
                                    colorTextPlaceholder: '#7878a0',
                                    colorDanger: '#f87171',
                                    borderRadius: '8px',
                                },
                                rules: {
                                    '.Input': {
                                        backgroundColor: '#17172a',
                                        color: '#e8e8f5',
                                        borderColor: '#252538',
                                    },
                                    '.Input::placeholder': { color: '#7878a0' },
                                    '.Label': { color: '#a0a0c0' },
                                },
                            } : {
                                theme: 'stripe',
                                variables: {
                                    colorPrimary: '#5b5ef4',
                                    borderRadius: '8px',
                                },
                            },
                        }}>
                            <StripeCheckoutForm
                                orderIdStr={stripeOrderId}
                                totalAmount={total() + shipping.value}
                                items={items.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity, variantId: i.variantId }))}
                                adsConfig={adsConfig}
                                trackingUser={trackingUser}
                                installments={installments}
                                paymentIntentId={clientSecret ? clientSecret.split('_secret_')[0] : ''}
                                onInstallmentsChange={setInstallments}
                            />
                        </Elements>
                    )}

                    {paymentGateway === 'stripe' && !clientSecret && (
                        <div style={{ padding: 40, textAlign: 'center' }}>
                            <span className="spinner" style={{ borderColor: 'var(--primary)', borderRightColor: 'transparent' }} />
                            {' '}{dict.checkout.connectingSecure}
                        </div>
                    )}

                    <div style={{ marginTop: 24 }}>
                        <button onClick={() => setStep('shipping')} className="btn btn-secondary">← {dict.checkout.backToShipping}</button>
                    </div>
                </div>
            )}
        </div>
    )
}
