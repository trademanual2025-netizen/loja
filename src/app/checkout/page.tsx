'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useCart } from '@/lib/cart'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { fbTrackInitiateCheckout } from '@/components/tracking/FacebookPixel'
import { gtagBeginCheckout } from '@/components/tracking/GoogleAds'
import { MapPin, CreditCard, Truck } from 'lucide-react'
import { MercadoPagoBrick } from '@/components/checkout/MercadoPagoBrick'
import { StripeCheckoutForm } from '@/components/checkout/StripeCheckoutForm'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import Cookies from 'js-cookie'
import { dictionaries, Locale, defaultLocale } from '@/lib/i18n'

type Step = 'address' | 'shipping' | 'payment'

interface AddressForm {
    zipCode: string; street: string; number: string; complement: string
    neighborhood: string; city: string; state: string
}

interface ShippingOption { label: string; value: number; days?: number }

export default function CheckoutPage() {
    const { items, total } = useCart()
    const router = useRouter()
    const [step, setStep] = useState<Step>('address')
    const [shipping, setShipping] = useState<ShippingOption>({ label: '', value: 0 })
    const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([])
    const [paymentGateway, setPaymentGateway] = useState<'mp' | 'stripe'>('mp')
    const [address, setAddress] = useState<AddressForm | null>(null)
    const [loading, setLoading] = useState(false)
    const [configs, setConfigs] = useState<any>(null)
    const [adsConfig, setAdsConfig] = useState<{ adsId: string; adsLabel: string } | null>(null)

    // Stripe State
    const [stripePromise, setStripePromise] = useState<any>(null)
    const [clientSecret, setClientSecret] = useState<string>('')
    const [stripeOrderId, setStripeOrderId] = useState<string>('')
    const [locale, setLocale] = useState<Locale>(defaultLocale)
    const dict = dictionaries[locale]

    const [mounted, setMounted] = useState(false)
    const [cepLoading, setCepLoading] = useState(false)
    const lastCepLookedUp = useRef('')
    const addressForm = useForm<AddressForm>()

    useEffect(() => {
        addressForm.register('zipCode', { required: true })
    }, [addressForm])

    useEffect(() => {
        setMounted(true)
        const saved = Cookies.get('NEXT_LOCALE') as Locale
        if (saved && dictionaries[saved]) setLocale(saved)

        if (items.length > 0) {
            fbTrackInitiateCheckout(total(), items.length)
            gtagBeginCheckout(total(), items.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })))
        }

        fetch('/api/admin/settings').then(r => r.json()).then(s => {
            setConfigs(s)
            if (s.google_ads_id && s.google_ads_label) {
                setAdsConfig({ adsId: s.google_ads_id, adsLabel: s.google_ads_label })
            }
            if (s.stripe_public_key) {
                setStripePromise(loadStripe(s.stripe_public_key))
            }
            if (!s.mp_public_key && s.stripe_public_key) setPaymentGateway('stripe')
        }).catch(() => { })
    }, [])

    async function handleAddressSubmit(data: AddressForm) {
        setLoading(true)
        const fallbackOptions: ShippingOption[] = [
            { label: 'PAC (8 dias úteis)', value: 24.90, days: 8 },
            { label: 'SEDEX (4 dias úteis)', value: 42.90, days: 4 },
        ]
        try {
            const res = await fetch('/api/shipping', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    state: data.state,
                    subtotal: total(),
                    zipCode: data.zipCode.replace(/\D/g, ''),
                    items: items.map(i => ({ id: i.id, quantity: i.quantity })),
                }),
            })
            const json = await res.json()
            const opts = json.options && json.options.length > 0 ? json.options : fallbackOptions
            setAddress(data)
            setShippingOptions(opts)
            setShipping(opts[0])
            setStep('shipping')
        } catch {
            setAddress(data)
            setShippingOptions(fallbackOptions)
            setShipping(fallbackOptions[0])
            setStep('shipping')
        } finally {
            setLoading(false)
        }
    }

    const lookupCep = useCallback(async (raw: string) => {
        const clean = raw.replace(/\D/g, '')
        if (clean.length !== 8) return
        if (clean === lastCepLookedUp.current) return
        lastCepLookedUp.current = clean
        setCepLoading(true)
        try {
            const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`)
            const data = await res.json()
            if (!data.erro) {
                if (data.logradouro) addressForm.setValue('street', data.logradouro)
                if (data.bairro) addressForm.setValue('neighborhood', data.bairro)
                if (data.localidade) addressForm.setValue('city', data.localidade)
                if (data.uf) addressForm.setValue('state', data.uf)
            }
        } catch { } finally {
            setCepLoading(false)
        }
    }, [addressForm])

    async function continueToPayment() {
        setStep('payment')

        // Se Stripe for o gateway atual (ou único), já criamos o PaymentIntent
        if (paymentGateway === 'stripe' || (!configs?.mp_public_key && configs?.stripe_public_key)) {
            initStripeIntent()
        }
    }

    async function initStripeIntent() {
        if (!address) return
        try {
            const res = await fetch('/api/checkout/stripe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: items.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity, variantId: i.variantId })),
                    address,
                    shippingCost: shipping.value,
                }),
            })
            const { clientSecret, orderId } = await res.json()
            if (clientSecret) {
                setClientSecret(clientSecret)
                setStripeOrderId(orderId)
            } else {
                toast.error('Erro ao iniciar Stripe')
            }
        } catch {
            toast.error('Erro de conexão com Checkout Stripe')
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
                        <div className="form-group">
                            <label className="form-label">{dict.checkout.cepPlaceholder} *</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    className="input"
                                    placeholder="00000-000"
                                    maxLength={9}
                                    value={addressForm.watch('zipCode') || ''}
                                    onChange={(e) => {
                                        const digits = e.target.value.replace(/\D/g, '').substring(0, 8)
                                        const formatted = digits.length > 5 ? digits.substring(0, 5) + '-' + digits.substring(5) : digits
                                        addressForm.setValue('zipCode', formatted, { shouldValidate: true })
                                        if (digits.length === 8) lookupCep(digits)
                                    }}
                                    onPaste={(e) => {
                                        e.preventDefault()
                                        const pasted = e.clipboardData.getData('text')
                                        const digits = pasted.replace(/\D/g, '').substring(0, 8)
                                        const formatted = digits.length > 5 ? digits.substring(0, 5) + '-' + digits.substring(5) : digits
                                        addressForm.setValue('zipCode', formatted, { shouldValidate: true })
                                        if (digits.length === 8) lookupCep(digits)
                                    }}
                                    onBlur={(e) => lookupCep(e.target.value)}
                                    style={{ paddingRight: cepLoading ? 40 : undefined }}
                                />
                                {cepLoading && (
                                    <span className="spinner" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18 }} />
                                )}
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">{dict.checkout.address} *</label>
                            <input className="input" {...addressForm.register('street', { required: true })} />
                        </div>
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
                        <div className="form-group">
                            <label className="form-label">{dict.checkout.neighborhood} *</label>
                            <input className="input" {...addressForm.register('neighborhood', { required: true })} />
                        </div>
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">{dict.checkout.city} *</label>
                                <input className="input" {...addressForm.register('city', { required: true })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">{dict.checkout.state} *</label>
                                <input className="input" maxLength={2} placeholder="SP" {...addressForm.register('state', { required: true })} />
                            </div>
                        </div>
                        <button className="btn btn-primary" disabled={loading}>
                            {loading ? <span className="spinner" /> : `${dict.checkout.calculateShipping} →`}
                        </button>
                    </form>
                </div>
            )}

            {/* Step 2: Frete */}
            {step === 'shipping' && (
                <div className="card fade-in">
                    <h2 style={{ fontWeight: 700, marginBottom: 20 }}>{dict.checkout.shipping}</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                        {shippingOptions.map((opt) => (
                            <label key={opt.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, background: 'var(--bg-card2)', borderRadius: 8, border: `1px solid ${shipping.label === opt.label ? 'var(--primary)' : 'var(--border)'}`, cursor: 'pointer' }}>
                                <input type="radio" name="shipping" checked={shipping.label === opt.label} onChange={() => setShipping(opt)} />
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 600 }}>{opt.label}</p>
                                    {opt.days ? <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>Prazo: {opt.days} dias úteis</p> : null}
                                </div>
                                <span style={{ fontWeight: 700, color: opt.value === 0 ? '#22c55e' : 'var(--text)' }}>
                                    {opt.value === 0 ? 'GRÁTIS' : `R$ ${opt.value.toFixed(2).replace('.', ',')}`}
                                </span>
                            </label>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button onClick={() => setStep('address')} className="btn btn-secondary">
                            ← {dict.cart.continueShopping === 'Continuar Comprando' ? 'Voltar' : 'Back'}
                        </button>
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
                            <span>{dict.cart.subtotal}</span><span>R$ {total().toFixed(2).replace('.', ',')}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: 8 }}>
                            <span>{dict.checkout.shipping} ({shipping.label})</span>
                            <span>{shipping.value === 0 ? 'GRÁTIS' : `R$ ${shipping.value.toFixed(2).replace('.', ',')}`}</span>
                        </div>
                        <hr className="divider" />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem' }}>
                            <span>Total</span><span style={{ color: 'var(--primary)' }}>R$ {(total() + shipping.value).toFixed(2).replace('.', ',')}</span>
                        </div>
                    </div>

                    {/* Gateway Selector (if both configured) */}
                    {configs?.mp_public_key && configs?.stripe_public_key && (
                        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                            <button className={`btn ${paymentGateway === 'mp' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1 }} onClick={() => setPaymentGateway('mp')}>
                                Mercado Pago
                            </button>
                            <button className={`btn ${paymentGateway === 'stripe' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1 }} onClick={() => {
                                setPaymentGateway('stripe')
                                if (!clientSecret) initStripeIntent()
                            }}>
                                {dict.checkout.creditCard}
                            </button>
                        </div>
                    )}

                    {/* Mercado Pago Render */}
                    {paymentGateway === 'mp' && configs?.mp_public_key && (
                        <MercadoPagoBrick
                            publicKey={configs.mp_public_key}
                            totalAmount={total() + shipping.value}
                            items={items.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity, variantId: i.variantId }))}
                            address={address}
                            shippingCost={shipping.value}
                            adsConfig={adsConfig}
                        />
                    )}

                    {/* Stripe Render */}
                    {paymentGateway === 'stripe' && clientSecret && stripePromise && (
                        <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                            <StripeCheckoutForm
                                orderIdStr={stripeOrderId}
                                totalAmount={total() + shipping.value}
                                items={items.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity, variantId: i.variantId }))}
                                adsConfig={adsConfig}
                            />
                        </Elements>
                    )}

                    {paymentGateway === 'stripe' && !clientSecret && (
                        <div style={{ padding: 40, textAlign: 'center' }}><span className="spinner" style={{ borderColor: 'var(--primary)', borderRightColor: 'transparent' }} /> Iniciando conexão segura...</div>
                    )}

                    {/* Voltar */}
                    <div style={{ marginTop: 24 }}>
                        <button onClick={() => setStep('shipping')} className="btn btn-secondary">← {dict.cart.continueShopping === 'Continuar Comprando' ? 'Voltar para Frete' : 'Back to Shipping'}</button>
                    </div>
                </div>
            )}
        </div>
    )
}
