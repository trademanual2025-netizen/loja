export default function ProductLoading() {
    return (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 16px 60px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }}>
                <div>
                    <div className="skeleton" style={{ aspectRatio: '1', borderRadius: 12 }} />
                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} className="skeleton" style={{ width: 70, height: 70, borderRadius: 8 }} />
                        ))}
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div className="skeleton" style={{ height: 36, width: '80%', borderRadius: 8 }} />
                    <div className="skeleton" style={{ height: 40, width: '40%', borderRadius: 8 }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div className="skeleton" style={{ height: 16, width: '100%', borderRadius: 6 }} />
                        <div className="skeleton" style={{ height: 16, width: '90%', borderRadius: 6 }} />
                        <div className="skeleton" style={{ height: 16, width: '70%', borderRadius: 6 }} />
                    </div>
                    <div className="skeleton" style={{ height: 48, borderRadius: 8 }} />
                </div>
            </div>
            <style>{`
                .skeleton {
                    background: linear-gradient(90deg, var(--bg-card) 25%, var(--bg-card2) 50%, var(--bg-card) 75%);
                    background-size: 200% 100%;
                    animation: shimmer 1.5s infinite;
                }
                @keyframes shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
                @media(max-width:1024px) {
                    div[style*='grid-template-columns: 1fr 1fr'] { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    )
}
