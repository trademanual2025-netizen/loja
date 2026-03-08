export default function HomeLoading() {
    return (
        <div style={{ minHeight: '100vh' }}>
            <div className="skeleton" style={{ height: '70vh', width: '100%' }} />
            <div style={{ maxWidth: 1200, margin: '60px auto', padding: '0 16px' }}>
                <div className="skeleton" style={{ height: 36, width: '50%', margin: '0 auto 24px', borderRadius: 8 }} />
                <div className="skeleton" style={{ height: 18, width: '70%', margin: '0 auto 48px', borderRadius: 6 }} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 }}>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i}>
                            <div className="skeleton" style={{ aspectRatio: '1', borderRadius: 12, marginBottom: 12 }} />
                            <div className="skeleton" style={{ height: 18, width: '60%', borderRadius: 6, marginBottom: 8 }} />
                            <div className="skeleton" style={{ height: 22, width: '35%', borderRadius: 6 }} />
                        </div>
                    ))}
                </div>
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
