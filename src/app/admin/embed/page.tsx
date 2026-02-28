'use client'

import { useState } from 'react'
import { Copy, Check, Code2 } from 'lucide-react'

export default function AdminEmbedPage() {
    const [width, setWidth] = useState('100%')
    const [height, setHeight] = useState('700px')
    const [theme, setTheme] = useState('dark')
    const [copied, setCopied] = useState(false)
    const [baseUrl, setBaseUrl] = useState(
        typeof window !== 'undefined' ? window.location.origin : 'https://sualoja.com'
    )

    const code = `<iframe
  src="${baseUrl}/embed"
  width="${width}"
  height="${height}"
  frameborder="0"
  scrolling="auto"
  allow="payment"
  style="border: none; border-radius: 12px;"
></iframe>`

    function handleCopy() {
        navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 8 }}>Embed / iFrame</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: 28 }}>Incorpore sua loja em qualquer site ou landing page.</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
                {/* Configurações */}
                <div className="card">
                    <h2 style={{ fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Code2 size={20} /> Configurações
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div className="form-group">
                            <label className="form-label">URL da Loja</label>
                            <input className="input" value={baseUrl} onChange={e => setBaseUrl(e.target.value)} placeholder="https://sualoja.com" />
                        </div>
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Largura</label>
                                <input className="input" value={width} onChange={e => setWidth(e.target.value)} placeholder="100%" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Altura</label>
                                <input className="input" value={height} onChange={e => setHeight(e.target.value)} placeholder="700px" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Código */}
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <h2 style={{ fontWeight: 700 }}>Código para copiar</h2>
                        <button onClick={handleCopy} className="btn btn-primary" style={{ padding: '6px 14px' }}>
                            {copied ? <><Check size={14} /> Copiado!</> : <><Copy size={14} /> Copiar</>}
                        </button>
                    </div>
                    <pre style={{ background: 'var(--bg-card2)', borderRadius: 8, padding: 16, overflow: 'auto', fontSize: '0.82rem', color: '#a3e635', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                        {code}
                    </pre>
                </div>
            </div>

            {/* Preview  */}
            <div className="card" style={{ marginTop: 24 }}>
                <h2 style={{ fontWeight: 700, marginBottom: 16 }}>Preview</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 16 }}>
                    Abaixo está uma prévia de como a loja aparecerá incorporada. Certifique-se de que sua loja está deployada antes de usar em produção.
                </p>
                <iframe
                    src={`${baseUrl}/embed`}
                    width={width}
                    height={height}
                    style={{ border: '1px solid var(--border)', borderRadius: 12, background: 'var(--bg-card2)', display: 'block' }}
                    title="Preview da loja embed"
                />
            </div>
        </div>
    )
}
