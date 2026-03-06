'use client'

import { useState, useEffect, useCallback } from 'react'
import {
    MessageSquare, Plus, Edit2, Trash2, Send, RefreshCw,
    Clock, Wifi, WifiOff, Loader2, Check, X, ChevronDown, ChevronUp,
    History, Zap, AlertCircle, RotateCcw
} from 'lucide-react'
import { toast } from 'sonner'

const TRIGGER_LABELS: Record<string, string> = {
    order_pix_pending: '💠 Pix gerado',
    order_boleto_pending: '📄 Boleto gerado',
    order_paid: '✅ Pagamento confirmado',
    order_shipped: '🚚 Pedido enviado',
    order_delivered: '📦 Pedido entregue',
    order_cancelled: '❌ Pedido cancelado',
    new_lead: '👤 Novo lead / cadastro',
    refund_approved: '↩️ Reembolso aprovado',
    refund_rejected: '🚫 Reembolso recusado',
    manual: '🖊️ Envio manual',
}

const TRIGGER_OPTIONS = Object.entries(TRIGGER_LABELS).filter(([k]) => k !== 'manual')

const VARIABLES_HELP = [
    { v: '{{nome}}', desc: 'Nome do cliente' },
    { v: '{{pedido}}', desc: 'Número do pedido' },
    { v: '{{total}}', desc: 'Valor total (ex: 150,00)' },
    { v: '{{produto}}', desc: 'Nome do primeiro produto' },
    { v: '{{rastreio}}', desc: 'Código de rastreio' },
    { v: '{{link_pedido}}', desc: 'Link para o pedido' },
]

interface Template {
    id: string
    name: string
    trigger: string
    delayMinutes: number
    message: string
    active: boolean
}

interface LogEntry {
    id: string
    phone: string
    trigger: string
    message: string
    status: string
    error?: string | null
    orderId?: string | null
    createdAt: string
}

const emptyTpl = (): Partial<Template> => ({
    name: '', trigger: 'order_paid', delayMinutes: 0, message: '', active: true,
})

function highlightTags(text: string) {
    const parts = text.split(/({{[^}]+}})/)
    return parts.map((part, i) =>
        part.startsWith('{{') && part.endsWith('}}')
            ? <mark key={i} style={{ background: 'rgba(200,160,80,0.18)', color: 'rgba(200,160,80,1)', borderRadius: 3, padding: '1px 3px', fontWeight: 700, fontFamily: 'monospace', fontSize: '0.9em' }}>{part}</mark>
            : <span key={i}>{part}</span>
    )
}

export default function ComunicacaoPage() {
    const [tab, setTab] = useState<'modelos' | 'historico' | 'envio'>('modelos')
    const [templates, setTemplates] = useState<Template[]>([])
    const [loading, setLoading] = useState(true)
    const [connState, setConnState] = useState<string>('loading')
    const [editing, setEditing] = useState<Partial<Template> | null>(null)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const [showVars, setShowVars] = useState(false)
    const [logs, setLogs] = useState<LogEntry[]>([])
    const [logsPage, setLogsPage] = useState(1)
    const [logsTotal, setLogsTotal] = useState(0)
    const [logsLoading, setLogsLoading] = useState(false)
    const [processing, setProcessing] = useState(false)
    const [resetting, setResetting] = useState(false)
    const [manualPhone, setManualPhone] = useState('')
    const [manualMsg, setManualMsg] = useState('')
    const [sending, setSending] = useState(false)

    const loadTemplates = useCallback(async () => {
        setLoading(true)
        try {
            const r = await fetch('/api/admin/comunicacao/templates')
            setTemplates(await r.json())
        } catch { toast.error('Erro ao carregar modelos') }
        setLoading(false)
    }, [])

    const checkStatus = useCallback(async () => {
        try {
            const r = await fetch('/api/admin/whatsapp/status')
            const d = await r.json()
            setConnState(d.state)
        } catch { setConnState('error') }
    }, [])

    const loadLogs = useCallback(async (page = 1) => {
        setLogsLoading(true)
        try {
            const r = await fetch(`/api/admin/comunicacao/logs?page=${page}`)
            const d = await r.json()
            setLogs(d.logs || [])
            setLogsTotal(d.total || 0)
            setLogsPage(d.page || 1)
        } catch { toast.error('Erro ao carregar histórico') }
        setLogsLoading(false)
    }, [])

    useEffect(() => {
        loadTemplates()
        checkStatus()
    }, [loadTemplates, checkStatus])

    useEffect(() => {
        if (tab === 'historico') loadLogs(1)
    }, [tab, loadLogs])

    async function toggleActive(tpl: Template) {
        const updated = { ...tpl, active: !tpl.active }
        setTemplates(p => p.map(t => t.id === tpl.id ? updated : t))
        await fetch(`/api/admin/comunicacao/templates/${tpl.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ active: !tpl.active }),
        })
    }

    async function deleteTemplate(id: string) {
        if (!confirm('Excluir este modelo?')) return
        setTemplates(p => p.filter(t => t.id !== id))
        await fetch(`/api/admin/comunicacao/templates/${id}`, { method: 'DELETE' })
        toast.success('Modelo excluído.')
    }

    async function saveTemplate() {
        if (!editing?.name?.trim() || !editing?.message?.trim()) {
            toast.error('Nome e mensagem são obrigatórios.')
            return
        }
        setSaving(true)
        try {
            if (editingId) {
                const r = await fetch(`/api/admin/comunicacao/templates/${editingId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(editing),
                })
                const updated = await r.json()
                setTemplates(p => p.map(t => t.id === editingId ? updated : t))
            } else {
                const r = await fetch('/api/admin/comunicacao/templates', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(editing),
                })
                const created = await r.json()
                setTemplates(p => [...p, created])
            }
            setEditing(null)
            setEditingId(null)
            toast.success('Modelo salvo!')
        } catch { toast.error('Erro ao salvar modelo.') }
        setSaving(false)
    }

    async function processQueue() {
        setProcessing(true)
        try {
            const r = await fetch('/api/admin/comunicacao/process-queue', { method: 'POST' })
            const d = await r.json()
            toast.success(`Fila processada: ${d.processed} enviadas, ${d.failed} falhas.`)
            if (tab === 'historico') loadLogs(1)
        } catch { toast.error('Erro ao processar fila.') }
        setProcessing(false)
    }

    async function resetTemplates() {
        if (!confirm('Isso vai apagar TODOS os modelos atuais e restaurar os padrões. Confirmar?')) return
        setResetting(true)
        try {
            const r = await fetch('/api/admin/comunicacao/templates/reset', { method: 'POST' })
            const data = await r.json()
            setTemplates(data)
            toast.success('Modelos restaurados com sucesso!')
        } catch { toast.error('Erro ao restaurar modelos.') }
        setResetting(false)
    }

    async function sendManual() {
        if (!manualPhone.trim() || !manualMsg.trim()) {
            toast.error('Preencha o telefone e a mensagem.')
            return
        }
        setSending(true)
        try {
            const r = await fetch('/api/admin/comunicacao/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: manualPhone, message: manualMsg }),
            })
            const d = await r.json()
            if (!r.ok) { toast.error(d.error || 'Erro ao enviar.'); return }
            toast.success('Mensagem enviada!')
            setManualPhone('')
            setManualMsg('')
        } catch { toast.error('Erro ao enviar.') }
        setSending(false)
    }

    const stateInfo = {
        open: { label: 'Conectado', color: '#22c55e', icon: <Wifi size={14} /> },
        close: { label: 'Desconectado', color: '#ef4444', icon: <WifiOff size={14} /> },
        connecting: { label: 'Conectando...', color: '#eab308', icon: <Loader2 size={14} /> },
        error: { label: 'Erro', color: '#ef4444', icon: <WifiOff size={14} /> },
        loading: { label: 'Verificando...', color: 'var(--text-muted)', icon: <Loader2 size={14} /> },
        unconfigured: { label: 'Não configurado', color: 'var(--text-muted)', icon: <AlertCircle size={14} /> },
    } as Record<string, { label: string; color: string; icon: React.ReactNode }>

    const si = stateInfo[connState] ?? stateInfo.error

    const groupedTemplates = templates.reduce<Record<string, Template[]>>((acc, t) => {
        if (!acc[t.trigger]) acc[t.trigger] = []
        acc[t.trigger].push(t)
        return acc
    }, {})

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <MessageSquare size={22} color="#25d366" />
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Comunicação WhatsApp</h1>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', borderRadius: 20, border: `1px solid ${si.color}40`, background: `${si.color}10`, fontSize: '0.82rem', fontWeight: 600, color: si.color }}>
                    {si.icon}
                    <span>{si.label}</span>
                    <button onClick={checkStatus} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex', alignItems: 'center', opacity: 0.7 }}>
                        <RefreshCw size={12} />
                    </button>
                </div>
            </div>

            {connState === 'unconfigured' && (
                <div style={{ marginBottom: 20, padding: '12px 16px', background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.25)', borderRadius: 10, fontSize: '0.88rem', color: '#eab308' }}>
                    ⚠️ WhatsApp não configurado. Acesse <strong>Configurações → WhatsApp</strong> para conectar a Evolution API e escanear o QR Code.
                </div>
            )}

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
                {([['modelos', 'Modelos', Zap], ['historico', 'Histórico', History], ['envio', 'Envio Manual', Send]] as const).map(([key, label, Icon]) => (
                    <button key={key} onClick={() => setTab(key)} style={{
                        padding: '9px 16px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
                        borderBottom: tab === key ? '2px solid var(--primary)' : '2px solid transparent',
                        background: 'transparent', color: tab === key ? 'var(--primary)' : 'var(--text-muted)',
                        display: 'flex', alignItems: 'center', gap: 6, marginBottom: -1,
                    }}>
                        <Icon size={15} />{label}
                    </button>
                ))}
            </div>

            {/* MODELOS TAB */}
            {tab === 'modelos' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                            Configure as mensagens automáticas enviadas para clientes a cada evento.<br />
                            Use as <strong style={{ color: 'rgba(200,160,80,1)' }}>{'{{tags}}'}</strong> para inserir dados reais do pedido e cliente.
                        </p>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <button onClick={processQueue} disabled={processing} className="btn" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'var(--bg-card2)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: '0.82rem' }}>
                                {processing ? <Loader2 size={14} /> : <Clock size={14} />}
                                Processar fila
                            </button>
                            <button onClick={resetTemplates} disabled={resetting} className="btn" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'var(--bg-card2)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                {resetting ? <Loader2 size={14} /> : <RotateCcw size={14} />}
                                Restaurar padrão
                            </button>
                            <button onClick={() => { setEditing(emptyTpl()); setEditingId(null) }} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Plus size={15} /> Novo Modelo
                            </button>
                        </div>
                    </div>

                    {/* Variables help */}
                    <div style={{ marginBottom: 20 }}>
                        <button onClick={() => setShowVars(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid var(--border)', padding: '7px 12px', borderRadius: 8, cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                            {showVars ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            Tags disponíveis nas mensagens
                        </button>
                        {showVars && (
                            <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {VARIABLES_HELP.map(({ v, desc }) => (
                                    <div key={v} style={{ padding: '6px 12px', background: 'var(--bg-card2)', borderRadius: 8, border: '1px solid var(--border)', fontSize: '0.82rem', display: 'flex', gap: 8, alignItems: 'center' }}>
                                        <code style={{ color: 'rgba(200,160,80,1)', fontWeight: 700, background: 'rgba(200,160,80,0.12)', padding: '1px 5px', borderRadius: 4 }}>{v}</code>
                                        <span style={{ color: 'var(--text-muted)' }}>{desc}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}><Loader2 size={24} /></div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                            {Object.entries(TRIGGER_LABELS).filter(([k]) => k !== 'manual').map(([trigger, triggerLabel]) => {
                                const tpls = groupedTemplates[trigger] || []
                                return (
                                    <div key={trigger}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                                            <p style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                                {triggerLabel}
                                            </p>
                                            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tpls.length} modelo{tpls.length !== 1 ? 's' : ''}</span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            {tpls.map(tpl => (
                                                <TemplateCard
                                                    key={tpl.id}
                                                    tpl={tpl}
                                                    onToggle={() => toggleActive(tpl)}
                                                    onEdit={() => { setEditing({ ...tpl }); setEditingId(tpl.id) }}
                                                    onDelete={() => deleteTemplate(tpl.id)}
                                                />
                                            ))}
                                            {tpls.length === 0 && (
                                                <div style={{ padding: '12px 16px', background: 'var(--bg-card2)', borderRadius: 8, fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic', border: '1px dashed var(--border)' }}>
                                                    Nenhum modelo para este gatilho.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* HISTÓRICO TAB */}
            {tab === 'historico' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{logsTotal} mensagens no histórico</p>
                        <button onClick={() => loadLogs(logsPage)} style={{ background: 'none', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            <RefreshCw size={13} /> Atualizar
                        </button>
                    </div>

                    {logsLoading ? (
                        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}><Loader2 size={24} /></div>
                    ) : logs.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Nenhuma mensagem enviada ainda.</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {logs.map(log => (
                                <div key={log.id} className="card" style={{ padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                    <div style={{ flexShrink: 0, marginTop: 2 }}>
                                        {log.status === 'sent' ? <Check size={16} color="#22c55e" /> : <X size={16} color="#ef4444" />}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 4 }}>
                                            <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{log.phone}</span>
                                            <span style={{ padding: '2px 8px', borderRadius: 4, background: 'var(--bg-card2)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                {TRIGGER_LABELS[log.trigger] || log.trigger}
                                            </span>
                                            {log.orderId && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>#{log.orderId.slice(-8).toUpperCase()}</span>}
                                        </div>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{log.message.substring(0, 140)}{log.message.length > 140 ? '…' : ''}</p>
                                        {log.error && <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: 4 }}>{log.error}</p>}
                                    </div>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', flexShrink: 0, whiteSpace: 'nowrap' }}>
                                        {new Date(log.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {logsTotal > 50 && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
                            <button disabled={logsPage <= 1} onClick={() => loadLogs(logsPage - 1)} className="btn" style={{ padding: '8px 16px' }}>Anterior</button>
                            <span style={{ padding: '8px 16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{logsPage} / {Math.ceil(logsTotal / 50)}</span>
                            <button disabled={logsPage >= Math.ceil(logsTotal / 50)} onClick={() => loadLogs(logsPage + 1)} className="btn" style={{ padding: '8px 16px' }}>Próxima</button>
                        </div>
                    )}
                </div>
            )}

            {/* ENVIO MANUAL TAB */}
            {tab === 'envio' && (
                <div style={{ maxWidth: 560 }}>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.6 }}>
                        Envie uma mensagem diretamente para qualquer número. Use para suporte pontual ou testes de template.
                    </p>
                    <div className="form-group">
                        <label className="form-label">Telefone (com DDD)</label>
                        <input
                            className="input"
                            placeholder="11999999999 ou +55 11 99999-9999"
                            value={manualPhone}
                            onChange={e => setManualPhone(e.target.value)}
                        />
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>O código do país (+55) é adicionado automaticamente.</p>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Mensagem</label>
                        <textarea
                            className="input"
                            rows={7}
                            placeholder="Digite a mensagem... Use *negrito*, _itálico_ e `monoespaçado`"
                            value={manualMsg}
                            onChange={e => setManualMsg(e.target.value)}
                            style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: '0.88rem' }}
                        />
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>{manualMsg.length} caracteres</p>
                    </div>
                    <button onClick={sendManual} disabled={sending} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {sending ? <Loader2 size={16} /> : <Send size={16} />}
                        {sending ? 'Enviando...' : 'Enviar Mensagem'}
                    </button>
                </div>
            )}

            {/* Modal editor de template */}
            {editing && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                    <div className="card" style={{ width: '100%', maxWidth: 620, maxHeight: '92vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h2 style={{ fontWeight: 700, fontSize: '1.1rem' }}>{editingId ? 'Editar Modelo' : 'Novo Modelo'}</h2>
                            <button onClick={() => { setEditing(null); setEditingId(null) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div className="form-group">
                                <label className="form-label">Nome do modelo</label>
                                <input className="input" placeholder="ex: Confirmação de pagamento" value={editing.name || ''} onChange={e => setEditing(p => ({ ...p, name: e.target.value }))} />
                            </div>

                            <div style={{ display: 'flex', gap: 12 }}>
                                <div className="form-group" style={{ flex: 2 }}>
                                    <label className="form-label">Gatilho (quando enviar)</label>
                                    <select className="input" value={editing.trigger || 'order_paid'} onChange={e => setEditing(p => ({ ...p, trigger: e.target.value }))}>
                                        {TRIGGER_OPTIONS.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                    </select>
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Atraso (minutos)</label>
                                    <input className="input" type="number" min={0} max={10080} placeholder="0 = imediato" value={editing.delayMinutes ?? 0} onChange={e => setEditing(p => ({ ...p, delayMinutes: parseInt(e.target.value) || 0 }))} />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Mensagem</label>
                                <textarea
                                    className="input"
                                    rows={10}
                                    value={editing.message || ''}
                                    onChange={e => setEditing(p => ({ ...p, message: e.target.value }))}
                                    style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: 1.6 }}
                                    placeholder="Escreva a mensagem aqui. Use *negrito*, _itálico_ e as tags abaixo."
                                />
                                <div style={{ marginTop: 8 }}>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 5 }}>Clique para inserir uma tag:</p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                                        {VARIABLES_HELP.map(({ v, desc }) => (
                                            <button key={v} title={desc} onClick={() => setEditing(p => p ? ({ ...p, message: (p.message || '') + v }) : p)}
                                                style={{ padding: '3px 9px', background: 'rgba(200,160,80,0.1)', border: '1px solid rgba(200,160,80,0.3)', borderRadius: 5, cursor: 'pointer', fontSize: '0.78rem', color: 'rgba(200,160,80,1)', fontFamily: 'monospace', fontWeight: 700 }}>
                                                {v}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Preview */}
                            {editing.message && (
                                <div>
                                    <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Prévia da mensagem</p>
                                    <div style={{ padding: '12px 14px', background: 'rgba(37,211,102,0.06)', border: '1px solid rgba(37,211,102,0.2)', borderRadius: 10, fontSize: '0.84rem', lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                        {highlightTags(editing.message)}
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <input type="checkbox" id="active-chk" checked={editing.active !== false} onChange={e => setEditing(p => ({ ...p, active: e.target.checked }))} style={{ width: 16, height: 16, cursor: 'pointer' }} />
                                <label htmlFor="active-chk" style={{ fontSize: '0.88rem', cursor: 'pointer' }}>Ativo — será enviado automaticamente</label>
                            </div>

                            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                                <button onClick={() => { setEditing(null); setEditingId(null) }} className="btn" style={{ padding: '10px 20px', background: 'transparent', border: '1px solid var(--border)', cursor: 'pointer' }}>
                                    Cancelar
                                </button>
                                <button onClick={saveTemplate} disabled={saving} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    {saving ? <Loader2 size={15} /> : <Check size={15} />}
                                    {saving ? 'Salvando...' : 'Salvar Modelo'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function TemplateCard({ tpl, onToggle, onEdit, onDelete }: { tpl: Template; onToggle: () => void; onEdit: () => void; onDelete: () => void }) {
    const [expanded, setExpanded] = useState(false)

    return (
        <div className="card" style={{ padding: '14px 16px', opacity: tpl.active ? 1 : 0.5, transition: 'opacity 0.2s' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                {/* Toggle */}
                <button onClick={onToggle} title={tpl.active ? 'Desativar' : 'Ativar'} style={{
                    width: 38, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer', flexShrink: 0, marginTop: 2,
                    background: tpl.active ? '#25d366' : 'var(--bg)',
                    transition: 'background 0.2s', position: 'relative',
                }}>
                    <div style={{
                        position: 'absolute', top: 3, width: 16, height: 16, borderRadius: '50%',
                        background: 'white', transition: 'left 0.2s',
                        left: tpl.active ? 19 : 3,
                    }} />
                </button>

                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{tpl.name}</span>
                        {tpl.delayMinutes > 0 && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '2px 7px', borderRadius: 4, background: 'rgba(234,179,8,0.12)', color: '#eab308', fontSize: '0.72rem', fontWeight: 600 }}>
                                <Clock size={11} /> +{tpl.delayMinutes >= 60 ? `${Math.floor(tpl.delayMinutes / 60)}h${tpl.delayMinutes % 60 > 0 ? ` ${tpl.delayMinutes % 60}min` : ''}` : `${tpl.delayMinutes}min`}
                            </span>
                        )}
                        {!tpl.active && (
                            <span style={{ padding: '2px 7px', borderRadius: 4, background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: '0.72rem', fontWeight: 600 }}>inativo</span>
                        )}
                    </div>
                    {/* Tags used preview */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 4 }}>
                        {Array.from(tpl.message.matchAll(/{{(\w+)}}/g)).map(m => m[1]).filter((v, i, a) => a.indexOf(v) === i).map(tag => (
                            <span key={tag} style={{ fontSize: '0.7rem', padding: '1px 5px', background: 'rgba(200,160,80,0.1)', color: 'rgba(200,160,80,0.85)', borderRadius: 3, fontFamily: 'monospace', fontWeight: 600 }}>{`{{${tag}}}`}</span>
                        ))}
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {tpl.message.replace(/\n/g, ' ').substring(0, 90)}{tpl.message.length > 90 ? '…' : ''}
                    </p>
                </div>

                <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                    <button onClick={() => setExpanded(v => !v)} title="Ver mensagem" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 6, borderRadius: 6 }}>
                        {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                    <button onClick={onEdit} title="Editar" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 6, borderRadius: 6 }}>
                        <Edit2 size={15} />
                    </button>
                    <button onClick={onDelete} title="Excluir" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 6, borderRadius: 6 }}>
                        <Trash2 size={15} />
                    </button>
                </div>
            </div>

            {expanded && (
                <div style={{ marginTop: 14, padding: '12px 14px', background: 'var(--bg-card2)', borderRadius: 10, fontSize: '0.83rem', lineHeight: 1.7, borderLeft: '3px solid #25d366', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {highlightTags(tpl.message)}
                </div>
            )}
        </div>
    )
}
