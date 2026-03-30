'use client'

import { useState, useEffect } from 'react'
import { Copy, Check, ExternalLink, Globe, ShoppingBag, RefreshCw, Package, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://giovanadiasjewelry.com.br'
const GOOGLE_FEED_URL = `${BASE_URL}/api/feed/google`
const FACEBOOK_FEED_URL = `${BASE_URL}/api/feed/facebook`

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false)
    function handleCopy() {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        })
    }
    return (
        <button onClick={handleCopy} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
            background: copied ? 'rgba(34,197,94,0.15)' : 'var(--bg-card2)',
            border: `1px solid ${copied ? 'rgba(34,197,94,0.4)' : 'var(--border)'}`,
            borderRadius: 8, cursor: 'pointer', color: copied ? '#4ade80' : 'var(--text)',
            fontSize: '0.82rem', fontWeight: 600, transition: 'all 0.2s', flexShrink: 0,
        }}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copiado!' : 'Copiar'}
        </button>
    )
}

function FeedUrlBox({ url, label }: { url: string; label: string }) {
    return (
        <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', marginBottom: 16 }}>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 8 }}>{label}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <code style={{
                    flex: 1, fontSize: '0.8rem', color: 'var(--primary)', background: 'rgba(91,94,244,0.08)',
                    padding: '8px 12px', borderRadius: 6, wordBreak: 'break-all',
                    border: '1px solid rgba(91,94,244,0.2)',
                }}>
                    {url}
                </code>
                <CopyButton text={url} />
            </div>
        </div>
    )
}

function Step({ n, title, desc, link, linkLabel }: { n: number; title: string; desc: string; link?: string; linkLabel?: string }) {
    return (
        <div style={{ display: 'flex', gap: 14, marginBottom: 20, alignItems: 'flex-start' }}>
            <div style={{
                width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, var(--primary), #a855f7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 800, color: 'white',
            }}>{n}</div>
            <div style={{ flex: 1, paddingTop: 4 }}>
                <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 4 }}>{title}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', lineHeight: 1.6 }}>{desc}</p>
                {link && (
                    <a href={link} target="_blank" rel="noopener noreferrer" style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 8,
                        color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none',
                    }}>
                        {linkLabel || 'Acessar'} <ExternalLink size={12} />
                    </a>
                )}
            </div>
        </div>
    )
}

function FeedStatus({ url, label }: { url: string; label: string }) {
    const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
    const [count, setCount] = useState<number | null>(null)

    async function checkFeed() {
        setStatus('loading')
        try {
            const res = await fetch(url)
            if (!res.ok) throw new Error('bad')
            const text = await res.text()
            const matches = text.match(/<item>/g)
            setCount(matches ? matches.length : 0)
            setStatus('ok')
        } catch {
            setStatus('error')
        }
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            <button onClick={checkFeed} disabled={status === 'loading'} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
                background: 'var(--bg-card2)', border: '1px solid var(--border)', borderRadius: 8,
                cursor: status === 'loading' ? 'not-allowed' : 'pointer', color: 'var(--text)',
                fontSize: '0.82rem', fontWeight: 600,
            }}>
                <RefreshCw size={13} style={{ animation: status === 'loading' ? 'spin 1s linear infinite' : 'none' }} />
                Verificar {label}
            </button>
            {status === 'ok' && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#4ade80', fontSize: '0.82rem', fontWeight: 600 }}>
                    <CheckCircle2 size={14} /> Feed OK — {count} {count === 1 ? 'produto' : 'produtos'} encontrados
                </span>
            )}
            {status === 'error' && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#f87171', fontSize: '0.82rem', fontWeight: 600 }}>
                    <AlertCircle size={14} /> Erro ao acessar o feed
                </span>
            )}
            <style>{`@keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }`}</style>
        </div>
    )
}

export default function IntegracoesPage() {
    const [tab, setTab] = useState<'google' | 'facebook'>('google')
    const [productCount, setProductCount] = useState<number | null>(null)

    useEffect(() => {
        fetch('/api/admin/products?limit=1')
            .then(r => r.json())
            .then(d => setProductCount(d.total ?? null))
            .catch(() => {})
    }, [])

    const tabStyle = (t: typeof tab) => ({
        padding: '10px 22px', borderRadius: 8, fontWeight: 700, fontSize: '0.88rem',
        border: 'none', cursor: 'pointer', transition: 'all 0.15s',
        background: tab === t ? 'var(--primary)' : 'var(--bg-card2)',
        color: tab === t ? 'white' : 'var(--text-muted)',
    })

    return (
        <div style={{ padding: '32px 28px', maxWidth: 860, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: 12,
                        background: 'linear-gradient(135deg, var(--primary), #a855f7)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                        <Globe size={20} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>Integrações</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                            Conecte sua loja ao Google Merchant Center e Facebook Commerce
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats banner */}
            <div style={{
                display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap',
            }}>
                <div style={{
                    flex: 1, minWidth: 180, background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 12, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12,
                }}>
                    <Package size={20} color="var(--primary)" />
                    <div>
                        <p style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, lineHeight: 1 }}>
                            {productCount ?? '—'}
                        </p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: 0, marginTop: 2 }}>
                            produtos no catálogo
                        </p>
                    </div>
                </div>
                <div style={{
                    flex: 1, minWidth: 180, background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 12, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12,
                }}>
                    <RefreshCw size={20} color="#4ade80" />
                    <div>
                        <p style={{ fontSize: '1rem', fontWeight: 700, margin: 0, lineHeight: 1 }}>Automático</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: 0, marginTop: 2 }}>
                            atualizado a cada 1 hora
                        </p>
                    </div>
                </div>
                <div style={{
                    flex: 1, minWidth: 180, background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 12, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12,
                }}>
                    <ShoppingBag size={20} color="#f59e0b" />
                    <div>
                        <p style={{ fontSize: '1rem', fontWeight: 700, margin: 0, lineHeight: 1 }}>Variantes</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: 0, marginTop: 2 }}>
                            tamanhos exportados separados
                        </p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                <button style={tabStyle('google')} onClick={() => setTab('google')}>
                    Google Merchant Center
                </button>
                <button style={tabStyle('facebook')} onClick={() => setTab('facebook')}>
                    Facebook Commerce
                </button>
            </div>

            {/* ── GOOGLE TAB ── */}
            {tab === 'google' && (
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                        <svg width="28" height="28" viewBox="0 0 48 48">
                            <path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.3 33.1 29.8 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l6-6C34.3 5.6 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.2-2.7-.5-4h.3z" />
                            <path fill="#34A853" d="M6.3 14.7l7 5.1C15.1 16.1 19.2 13 24 13c3 0 5.8 1.1 7.9 3l6-6C34.3 5.6 29.4 4 24 4 16.3 4 9.7 8.4 6.3 14.7z" />
                            <path fill="#FBBC04" d="M24 44c5.7 0 10.5-1.9 14.1-5.1l-6.5-5.5C29.7 35 27 36 24 36c-5.8 0-10.2-3.7-11.8-8.8L5.2 33.1C8.6 39.5 15.7 44 24 44z" />
                            <path fill="#EA4335" d="M44.5 20H24v8.5h11.7c-.8 2.2-2.2 4.1-4.1 5.4l6.5 5.5C41.3 36.2 44 30.6 44 24c0-1.3-.2-2.7-.5-4h1z" />
                        </svg>
                        <div>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Google Merchant Center</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>
                                Exiba produtos no Google Shopping, pesquisa orgânica e Performance Max
                            </p>
                        </div>
                    </div>

                    <FeedUrlBox url={GOOGLE_FEED_URL} label="URL do Feed — Google Merchant Center" />
                    <FeedStatus url={GOOGLE_FEED_URL} label="Feed Google" />

                    <div style={{ height: 1, background: 'var(--border)', margin: '20px 0' }} />

                    <p style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 16 }}>Como configurar passo a passo:</p>

                    <Step n={1}
                        title="Crie ou acesse o Google Merchant Center"
                        desc="Acesse o Google Merchant Center com a conta Google da Giovana. Se ainda não tem conta, clique em 'Começar' e siga o cadastro da loja."
                        link="https://merchants.google.com"
                        linkLabel="Acessar Google Merchant Center"
                    />
                    <Step n={2}
                        title="Verifique e reivindique o site"
                        desc='No menu lateral, vá em "Configurações da empresa" → "Sites" → insira giovanadiasjewelry.com.br e verifique pelo método de meta tag HTML ou Google Analytics. O site já tem o sitemap correto configurado.'
                    />
                    <Step n={3}
                        title="Adicione uma fonte de dados (Feed)"
                        desc='Vá em "Produtos" → "Feeds" → clique no "+" para adicionar. Escolha "Busca programada de arquivos", informe a URL acima. Configure a frequência como "Diariamente" e o horário de sua preferência.'
                    />
                    <Step n={4}
                        title="Execute o feed pela primeira vez"
                        desc='Após salvar, clique em "Buscar agora" para que o Google processe os produtos imediatamente. O status ficará "Processando" por alguns minutos.'
                    />
                    <Step n={5}
                        title="Corrija possíveis avisos"
                        desc='O Google pode apontar avisos de GTIN (código de barras) ausente para joias artesanais — isso é normal e não impede a aprovação. Verifique se todos os produtos foram aprovados em "Produtos" → "Todos os produtos".'
                    />
                    <Step n={6}
                        title="Ative as listagens gratuitas"
                        desc='Em "Crescimento" → "Gerenciar programas" → ative "Listagens gratuitas". Seus produtos aparecerão na aba Shopping do Google sem custo.'
                        link="https://merchants.google.com/mc/programs"
                        linkLabel="Ativar listagens gratuitas"
                    />

                    <div style={{
                        background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.25)',
                        borderRadius: 10, padding: '14px 16px', marginTop: 8,
                        display: 'flex', gap: 10, alignItems: 'flex-start',
                    }}>
                        <AlertCircle size={16} color="#60a5fa" style={{ flexShrink: 0, marginTop: 2 }} />
                        <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
                            O feed é atualizado automaticamente a cada 1 hora. Preços com desconto e estoque são refletidos em tempo real. Produtos removidos da loja desaparecem do catálogo na próxima atualização.
                        </p>
                    </div>
                </div>
            )}

            {/* ── FACEBOOK TAB ── */}
            {tab === 'facebook' && (
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                        <svg width="28" height="28" viewBox="0 0 48 48">
                            <linearGradient id="fbGrad" x1="6.228" y1="4.896" x2="42.077" y2="43.432" gradientUnits="userSpaceOnUse">
                                <stop offset="0" stopColor="#0062e0" />
                                <stop offset="1" stopColor="#19afff" />
                            </linearGradient>
                            <path fill="url(#fbGrad)" d="M42 24c0-9.9-8.1-18-18-18S6 14.1 6 24c0 8.6 6.1 15.9 14.3 17.7v-12.8H16V24h4.3v-3.6c0-4.2 2.5-6.5 6.4-6.5 1.8 0 3.8.3 3.8.3v4.2h-2.1c-2.1 0-2.7 1.3-2.7 2.6V24h4.6l-.7 4.9h-3.9v12.8C35.9 39.9 42 32.6 42 24z" />
                        </svg>
                        <div>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Facebook & Instagram Commerce</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>
                                Venda diretamente no Instagram Shopping, Facebook Shop e Meta Ads
                            </p>
                        </div>
                    </div>

                    <FeedUrlBox url={FACEBOOK_FEED_URL} label="URL do Feed — Meta Commerce Manager" />
                    <FeedStatus url={FACEBOOK_FEED_URL} label="Feed Facebook" />

                    <div style={{ height: 1, background: 'var(--border)', margin: '20px 0' }} />

                    <p style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 16 }}>Como configurar passo a passo:</p>

                    <Step n={1}
                        title="Acesse o Meta Commerce Manager"
                        desc="Entre com a conta do Facebook vinculada ao perfil comercial da Giovana Dias. Você precisará de uma Conta Comercial no Meta Business Suite."
                        link="https://business.facebook.com/commerce"
                        linkLabel="Acessar Meta Commerce Manager"
                    />
                    <Step n={2}
                        title="Crie um catálogo de produtos"
                        desc='Clique em "Adicionar catálogo" → escolha "E-commerce" → dê um nome (ex.: "Giovana Dias Joias"). O catálogo será a base para todos os produtos no Instagram e Facebook.'
                    />
                    <Step n={3}
                        title="Adicione uma fonte de dados via URL"
                        desc='Dentro do catálogo, vá em "Fontes de dados" → "Adicionar itens" → "Feed de dados" → "Utilizar uma URL". Cole a URL do feed acima e configure a frequência de atualização como "Diariamente".'
                    />
                    <Step n={4}
                        title="Aguarde o processamento inicial"
                        desc='Clique em "Importar agora". O Meta vai processar todos os produtos (pode levar 10–30 minutos dependendo da quantidade). Você verá os produtos em "Itens do catálogo" quando estiver pronto.'
                    />
                    <Step n={5}
                        title="Conecte ao Instagram Shopping"
                        desc='Vá em "Canais de vendas" → "Instagram" → selecione a conta @giovanadiasjewelry e conecte o catálogo. Após aprovação do Meta, o botão "Ver loja" aparecerá no perfil do Instagram.'
                    />
                    <Step n={6}
                        title="Conecte ao Facebook Shop"
                        desc='Em "Canais de vendas" → "Facebook" → associe a Página do Facebook ao catálogo. O Shop ficará visível na aba "Loja" da Página.'
                        link="https://business.facebook.com/commerce"
                        linkLabel="Gerenciar canais de venda"
                    />

                    <div style={{
                        background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.25)',
                        borderRadius: 10, padding: '14px 16px', marginTop: 8,
                        display: 'flex', gap: 10, alignItems: 'flex-start',
                    }}>
                        <AlertCircle size={16} color="#60a5fa" style={{ flexShrink: 0, marginTop: 2 }} />
                        <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
                            O Meta pode levar 24–72 horas para revisar e aprovar o catálogo na primeira vez. Após aprovação, novos produtos e alterações de preço são sincronizados automaticamente com o feed diário.
                        </p>
                    </div>
                </div>
            )}

            {/* Bottom tip */}
            <div style={{
                marginTop: 20, background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 12, padding: '16px 18px',
                display: 'flex', gap: 12, alignItems: 'flex-start',
            }}>
                <CheckCircle2 size={18} color="#4ade80" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                    <p style={{ fontWeight: 700, fontSize: '0.88rem', margin: '0 0 4px' }}>Feed sempre atualizado automaticamente</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0, lineHeight: 1.6 }}>
                        Qualquer alteração feita na loja — novo produto, mudança de preço, produto esgotado ou desativado — é refletida automaticamente no Google e Facebook na próxima atualização do feed (máx. 1 hora). Não é necessário nenhuma ação manual.
                    </p>
                </div>
            </div>
        </div>
    )
}
