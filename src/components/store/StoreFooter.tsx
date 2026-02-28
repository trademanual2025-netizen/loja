import { Dictionary } from '@/lib/i18n'

export function StoreFooter({ storeName, dict }: { storeName: string; dict: Dictionary }) {
    return (
        <footer style={{
            background: 'var(--bg-card)',
            borderTop: '1px solid var(--border)',
            padding: '30px 16px',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
        }}>
            <p>© {new Date().getFullYear()} {storeName}. {dict.footer?.rights || 'Todos os direitos reservados.'}</p>
            <p style={{ marginTop: 8 }}>{dict.footer?.payments || 'Pagamentos processados de forma segura.'}</p>
        </footer>
    )
}
