export default function ContatoLoading() {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-main, #0d0a06)' }}>
            <div style={{ height: 64, background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(200,160,80,0.15)' }} />
            <div style={{ maxWidth: 600, margin: '60px auto', padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div className="sk" style={{ height: 36, width: '45%', borderRadius: 6, margin: '0 auto 16px' }} />
                {[1, 2, 3, 4].map(i => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div className="sk" style={{ height: 14, width: '25%', borderRadius: 4 }} />
                        <div className="sk" style={{ height: 44, borderRadius: 8 }} />
                    </div>
                ))}
                <div className="sk" style={{ height: 48, borderRadius: 8, marginTop: 8 }} />
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
