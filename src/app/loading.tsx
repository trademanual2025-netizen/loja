export default function HomeLoading() {
    return (
        <div style={{ minHeight: '100vh', background: '#0d0a06' }}>
            <div style={{ height: 64, background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(200,160,80,0.15)' }} />
            <div className="sk" style={{ height: '80vh', width: '100%' }} />
            <style>{`
                .sk {
                    background: linear-gradient(90deg,rgba(200,160,80,0.04) 25%,rgba(200,160,80,0.09) 50%,rgba(200,160,80,0.04) 75%);
                    background-size: 200% 100%;
                    animation: sh 1.8s infinite;
                }
                @keyframes sh { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
            `}</style>
        </div>
    )
}
