'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    useEffect(() => {
        console.error('[App Error]', error)
    }, [error])

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: 40, textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16 }}>Algo deu errado</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
                Ocorreu um erro inesperado. Tente novamente.
            </p>
            <button onClick={reset} style={{ padding: '10px 24px', borderRadius: 8, background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                Tentar novamente
            </button>
        </div>
    )
}
