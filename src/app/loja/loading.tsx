export default function LojaLoading() {
    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 16px 60px' }}>
            <div className="skeleton" style={{ height: 'clamp(200px, 40vw, 360px)', borderRadius: 16, marginBottom: 32 }} />
            <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="skeleton" style={{ height: 38, width: 90, borderRadius: 20 }} />
                ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                    <div key={i}>
                        <div className="skeleton" style={{ aspectRatio: '1', borderRadius: 12, marginBottom: 12 }} />
                        <div className="skeleton" style={{ height: 18, width: '70%', borderRadius: 6, marginBottom: 8 }} />
                        <div className="skeleton" style={{ height: 22, width: '40%', borderRadius: 6 }} />
                    </div>
                ))}
            </div>
            <style>{`
                .skeleton {
                    background: linear-gradient(90deg, var(--bg-card) 25%, var(--bg-card2, rgba(255,255,255,0.05)) 50%, var(--bg-card) 75%);
                    background-size: 200% 100%;
                    animation: shimmer 1.5s infinite;
                }
                @keyframes shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `}</style>
        </div>
    )
}
