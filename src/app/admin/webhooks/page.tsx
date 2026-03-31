'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import WebhooksTab from '@/components/admin/WebhooksTab'

export default function WebhooksPage() {
    const [settings, setSettings] = useState<Record<string, string>>({})
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetch('/api/admin/settings').then(r => r.json()).then(setSettings)
    }, [])

    function set(key: string, value: string) {
        setSettings(p => ({ ...p, [key]: value }))
    }

    async function save(keys: string[]) {
        setSaving(true)
        const body: Record<string, string> = {}
        keys.forEach(k => { body[k] = settings[k] || '' })
        await fetch('/api/admin/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        })
        setSaving(false)
        toast.success('Configurações salvas!')
    }

    async function testWebhook(type: 'lead' | 'buyer') {
        const url = type === 'lead' ? settings.webhook_lead_url : settings.webhook_buyer_url
        if (!url) { toast.error('Configure a URL primeiro.'); return }
        try {
            const token = document.cookie.split('; ').find(c => c.startsWith('admin_token='))?.split('=')[1]
            const res = await fetch('/api/admin/webhooks/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                body: JSON.stringify({ type }),
            })
            const data = await res.json()
            if (data.success) {
                toast.success(`Webhook disparado com sucesso! Status: ${data.status}`)
            } else {
                toast.error(data.error || `Webhook falhou (status ${data.status})`)
            }
        } catch { toast.error('Erro ao disparar webhook de teste.') }
    }

    return (
        <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 28 }}>Webhooks</h1>
            <div style={{ maxWidth: 700 }}>
                <WebhooksTab settings={settings} set={set} save={save} saving={saving} testWebhook={testWebhook} />
            </div>
        </div>
    )
}
