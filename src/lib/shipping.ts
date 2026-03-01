import { getSetting, getSettings, SETTINGS_KEYS } from './config'

export interface ShippingOption {
    label: string
    value: number
    days?: number // prazo em dias úteis
}

// Códigos de serviço dos Correios
const SEDEX_CODE = '04014'
const PAC_CODE = '04510'

/**
 * Chama o webservice público dos Correios e retorna opções de PAC + SEDEX.
 * Não requer autenticação para consultas de preço sem contrato.
 */
async function calcCorreios(
    originCep: string,
    destCep: string,
    weight: number,   // kg
    height: number,   // cm
    width: number,    // cm
    length: number,   // cm
    user = '',
    pass = ''
): Promise<ShippingOption[]> {
    const services = [SEDEX_CODE, PAC_CODE].join(',')
    const params = new URLSearchParams({
        nCdEmpresa: user,
        sDsSenha: pass,
        sCepOrigem: originCep.replace(/\D/g, ''),
        sCepDestino: destCep.replace(/\D/g, ''),
        nVlPeso: String(weight),
        nCdFormato: '1',          // caixa/pacote
        nVlComprimento: String(length),
        nVlAltura: String(height),
        nVlLargura: String(width),
        nVlDiametro: '0',
        sCdMaoPropria: 'n',
        nVlValorDeclarado: '0',
        sCdAvisoRecebimento: 'n',
        nCdServico: services,
        StrRetorno: 'xml',
        nIndicaCalculo: '3',
    })

    const url = `https://ws.correios.com.br/calculador/CalcPrecoPrazo.aspx?${params.toString()}`
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    let res: Response
    try {
        res = await fetch(url, { signal: controller.signal, next: { revalidate: 300 } })
    } finally {
        clearTimeout(timeout)
    }
    if (!res.ok) throw new Error('Correios API error')
    const xml = await res.text()

    // Parsear XML com regex (evita dependência de parser)
    const options: ShippingOption[] = []
    const serviceMatches = xml.matchAll(/<cServico>([\s\S]*?)<\/cServico>/g)

    const SERVICE_NAMES: Record<string, string> = {
        [SEDEX_CODE]: 'SEDEX',
        [PAC_CODE]: 'PAC',
    }

    for (const match of serviceMatches) {
        const block = match[1]
        const code = block.match(/<Codigo>(\d+)<\/Codigo>/)?.[1] ?? ''
        const priceStr = block.match(/<Valor>([\d,]+)<\/Valor>/)?.[1] ?? ''
        const daysStr = block.match(/<PrazoEntrega>(\d+)<\/PrazoEntrega>/)?.[1] ?? ''
        const erro = block.match(/<Erro>(\d+)<\/Erro>/)?.[1] ?? '0'

        if (erro !== '0') continue
        const price = parseFloat(priceStr.replace(',', '.'))
        const days = parseInt(daysStr)
        if (isNaN(price) || price <= 0) continue

        options.push({
            label: `${SERVICE_NAMES[code] ?? code}${days ? ` (${days} dias úteis)` : ''}`,
            value: price,
            days,
        })
    }

    return options
}

export async function calculateShipping(
    state: string,
    subtotal: number,
    destCep?: string,
): Promise<ShippingOption[]> {
    const mode = (await getSetting(SETTINGS_KEYS.SHIPPING_MODE)) ?? 'free'

    // ── Frete Grátis
    if (mode === 'free') {
        return [{ label: 'Frete Grátis', value: 0 }]
    }

    // ── Fixo
    if (mode === 'fixed') {
        const freeAbove = parseFloat((await getSetting(SETTINGS_KEYS.SHIPPING_FREE_ABOVE)) ?? '0')
        if (freeAbove > 0 && subtotal >= freeAbove) {
            return [{ label: 'Frete Grátis', value: 0 }]
        }
        const fixedValue = parseFloat((await getSetting(SETTINGS_KEYS.SHIPPING_FIXED_VALUE)) ?? '0')
        return [{ label: 'Entrega Padrão', value: fixedValue }]
    }

    // ── Por Estado
    if (mode === 'by_state') {
        const tableJson = await getSetting(SETTINGS_KEYS.SHIPPING_STATE_TABLE)
        if (tableJson) {
            const table: Record<string, number> = JSON.parse(tableJson)
            const val = table[state] ?? table['DEFAULT'] ?? 0
            return [{ label: 'Entrega para seu estado', value: val }]
        }
    }

    // ── Correios (PAC + SEDEX)
    if (mode === 'correios') {
        if (!destCep) return [{ label: 'Frete Grátis', value: 0 }]

        const cfg = await getSettings([
            SETTINGS_KEYS.SHIPPING_ORIGIN_CEP,
            SETTINGS_KEYS.SHIPPING_DEFAULT_WEIGHT,
            SETTINGS_KEYS.SHIPPING_DEFAULT_HEIGHT,
            SETTINGS_KEYS.SHIPPING_DEFAULT_WIDTH,
            SETTINGS_KEYS.SHIPPING_DEFAULT_LENGTH,
            SETTINGS_KEYS.SHIPPING_CORREIOS_USER,
            SETTINGS_KEYS.SHIPPING_CORREIOS_PASS,
            SETTINGS_KEYS.SHIPPING_FREE_ABOVE,
            SETTINGS_KEYS.SHIPPING_FIXED_VALUE,
        ])

        const originCep = cfg[SETTINGS_KEYS.SHIPPING_ORIGIN_CEP]
        if (!originCep) return [{ label: 'Frete Grátis', value: 0 }]

        try {
            const options = await calcCorreios(
                originCep,
                destCep,
                parseFloat(cfg[SETTINGS_KEYS.SHIPPING_DEFAULT_WEIGHT] || '0.5'),
                parseFloat(cfg[SETTINGS_KEYS.SHIPPING_DEFAULT_HEIGHT] || '10'),
                parseFloat(cfg[SETTINGS_KEYS.SHIPPING_DEFAULT_WIDTH] || '15'),
                parseFloat(cfg[SETTINGS_KEYS.SHIPPING_DEFAULT_LENGTH] || '20'),
                cfg[SETTINGS_KEYS.SHIPPING_CORREIOS_USER] || '',
                cfg[SETTINGS_KEYS.SHIPPING_CORREIOS_PASS] || '',
            )

            // Aplica frete grátis acima de valor mínimo
            const freeAbove = parseFloat(cfg[SETTINGS_KEYS.SHIPPING_FREE_ABOVE] || '0')
            if (freeAbove > 0 && subtotal >= freeAbove) {
                return [{ label: 'Frete Grátis', value: 0 }]
            }

            if (options.length > 0) return options
        } catch (e) {
            console.error('[Correios] Falha na consulta:', e)
        }

        const fallbackValue = parseFloat(cfg[SETTINGS_KEYS.SHIPPING_FIXED_VALUE] || '15')
        return [{ label: 'Entrega Padrão (consulte prazo)', value: fallbackValue > 0 ? fallbackValue : 15 }]
    }

    return [{ label: 'Entrega Padrão', value: 15 }]
}
