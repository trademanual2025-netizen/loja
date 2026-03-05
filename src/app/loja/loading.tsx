export default function LojaLoading() {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-main, #0d0a06)' }}>
            <div style={{ height: 64, background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(200,160,80,0.15)' }} />
            <div style={{ height: 320, background: 'rgba(255,255,255,0.02)', marginBottom: 48 }} />
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px 60px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 24 }}>
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div className="sk" style={{ aspectRatio: '1', borderRadius: 8 }} />
                            <div className="sk" style={{ height: 18, width: '75%', borderRadius: 4 }} />
                            <div className="sk" style={{ height: 16, width: '40%', borderRadius: 4 }} />
                        </div>
                    ))}
                </div>
            </div>
            <style>{`
                .sk {
                    background: linear-gradient(90deg,rgba(200,160,80,0.06) 25%,rgba(200,160,80,0.12) 50%,rgba(200,160,80,0.06) 75%);
                    background-size: 200% 100%;
                    animation: sh 1.5s infinite;
                }
                @keyframes sh { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
            `}</style>
        </div>
    )
}
