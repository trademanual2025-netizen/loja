export default function NossaMarcaLoading() {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-main, #0d0a06)' }}>
            <div style={{ height: 64, background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(200,160,80,0.15)' }} />
            <div style={{ maxWidth: 800, margin: '60px auto', padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div className="sk" style={{ height: 40, width: '50%', borderRadius: 6, margin: '0 auto' }} />
                <div className="sk" style={{ height: 300, borderRadius: 12 }} />
                {[90, 70, 80, 60].map((w, i) => (
                    <div key={i} className="sk" style={{ height: 16, width: `${w}%`, borderRadius: 4 }} />
                ))}
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
