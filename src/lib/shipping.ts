import { getSetting, getSettings, SETTINGS_KEYS } from './config'
import { getCountry, SHIPPING_RATES } from './countries'

export interface ShippingOption {
    label: string
    value: number
    days?: number
    daysText?: string
}

const SEDEX_CODE = '04014'
const PAC_CODE = '04510'

const REGION_MAP: Record<string, string> = {
    AC: 'norte', AP: 'norte', AM: 'norte', PA: 'norte', RO: 'norte', RR: 'norte', TO: 'norte',
    MA: 'nordeste', PI: 'nordeste', CE: 'nordeste', RN: 'nordeste', PB: 'nordeste',
    PE: 'nordeste', AL: 'nordeste', SE: 'nordeste', BA: 'nordeste',
    MG: 'sudeste', ES: 'sudeste', RJ: 'sudeste', SP: 'sudeste',
    PR: 'sul', SC: 'sul', RS: 'sul',
    MS: 'centro-oeste', MT: 'centro-oeste', GO: 'centro-oeste', DF: 'centro-oeste',
}

const REGION_BASE_PRICES: Record<string, Record<string, { pac: number; sedex: number; pacDays: number; sedexDays: number }>> = {
    'sudeste': {
        'sudeste': { pac: 18.90, sedex: 32.90, pacDays: 5, sedexDays: 2 },
        'sul': { pac: 22.90, sedex: 38.90, pacDays: 7, sedexDays: 3 },
        'centro-oeste': { pac: 24.90, sedex: 42.90, pacDays: 8, sedexDays: 4 },
        'nordeste': { pac: 28.90, sedex: 48.90, pacDays: 10, sedexDays: 5 },
        'norte': { pac: 34.90, sedex: 56.90, pacDays: 12, sedexDays: 6 },
    },
    'sul': {
        'sul': { pac: 18.90, sedex: 32.90, pacDays: 5, sedexDays: 2 },
        'sudeste': { pac: 22.90, sedex: 38.90, pacDays: 7, sedexDays: 3 },
        'centro-oeste': { pac: 26.90, sedex: 44.90, pacDays: 8, sedexDays: 4 },
        'nordeste': { pac: 32.90, sedex: 52.90, pacDays: 11, sedexDays: 5 },
        'norte': { pac: 38.90, sedex: 62.90, pacDays: 13, sedexDays: 7 },
    },
    'centro-oeste': {
        'centro-oeste': { pac: 18.90, sedex: 32.90, pacDays: 5, sedexDays: 2 },
        'sudeste': { pac: 24.90, sedex: 42.90, pacDays: 7, sedexDays: 3 },
        'sul': { pac: 26.90, sedex: 44.90, pacDays: 8, sedexDays: 4 },
        'nordeste': { pac: 28.90, sedex: 46.90, pacDays: 9, sedexDays: 4 },
        'norte': { pac: 30.90, sedex: 50.90, pacDays: 10, sedexDays: 5 },
    },
    'nordeste': {
        'nordeste': { pac: 18.90, sedex: 32.90, pacDays: 5, sedexDays: 2 },
        'sudeste': { pac: 28.90, sedex: 48.90, pacDays: 10, sedexDays: 5 },
        'centro-oeste': { pac: 28.90, sedex: 46.90, pacDays: 9, sedexDays: 4 },
        'sul': { pac: 32.90, sedex: 52.90, pacDays: 11, sedexDays: 5 },
        'norte': { pac: 26.90, sedex: 42.90, pacDays: 8, sedexDays: 4 },
    },
    'norte': {
        'norte': { pac: 18.90, sedex: 32.90, pacDays: 5, sedexDays: 2 },
        'centro-oeste': { pac: 30.90, sedex: 50.90, pacDays: 10, sedexDays: 5 },
        'nordeste': { pac: 26.90, sedex: 42.90, pacDays: 8, sedexDays: 4 },
        'sudeste': { pac: 34.90, sedex: 56.90, pacDays: 12, sedexDays: 6 },
        'sul': { pac: 38.90, sedex: 62.90, pacDays: 13, sedexDays: 7 },
    },
}

function calcByRegion(originState: string, destState: string): ShippingOption[] {
    const originRegion = REGION_MAP[originState.toUpperCase()] || 'sudeste'
    const destRegion = REGION_MAP[destState.toUpperCase()] || 'sudeste'

    const prices = REGION_BASE_PRICES[originRegion]?.[destRegion]
        || REGION_BASE_PRICES['sudeste']?.[destRegion]
        || { pac: 24.90, sedex: 42.90, pacDays: 8, sedexDays: 4 }

    return [
        { label: `PAC (${prices.pacDays} dias úteis)`, value: prices.pac, days: prices.pacDays },
        { label: `SEDEX (${prices.sedexDays} dias úteis)`, value: prices.sedex, days: prices.sedexDays },
    ]
}

async function calcCorreios(
    originCep: string,
    destCep: string,
    weight: number,
    height: number,
    width: number,
    length: number,
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
        nCdFormato: '1',
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
            label: `${SERVICE_NAMES[code] ?? code} (${days} dias úteis)`,
            value: price,
            days,
        })
    }

    return options
}

function cepToState(cep: string): string {
    const num = parseInt(cep.replace(/\D/g, '').substring(0, 5))
    if (num >= 1000 && num <= 19999) return 'SP'
    if (num >= 20000 && num <= 28999) return 'RJ'
    if (num >= 29000 && num <= 29999) return 'ES'
    if (num >= 30000 && num <= 39999) return 'MG'
    if (num >= 40000 && num <= 48999) return 'BA'
    if (num >= 49000 && num <= 49999) return 'SE'
    if (num >= 50000 && num <= 56999) return 'PE'
    if (num >= 57000 && num <= 57999) return 'AL'
    if (num >= 58000 && num <= 58999) return 'PB'
    if (num >= 59000 && num <= 59999) return 'RN'
    if (num >= 60000 && num <= 63999) return 'CE'
    if (num >= 64000 && num <= 64999) return 'PI'
    if (num >= 65000 && num <= 65999) return 'MA'
    if (num >= 66000 && num <= 68899) return 'PA'
    if (num >= 68900 && num <= 68999) return 'AP'
    if (num >= 69000 && num <= 69299) return 'AM'
    if (num >= 69300 && num <= 69399) return 'RR'
    if (num >= 69400 && num <= 69899) return 'AM'
    if (num >= 69900 && num <= 69999) return 'AC'
    if (num >= 70000 && num <= 72799) return 'DF'
    if (num >= 72800 && num <= 72999) return 'GO'
    if (num >= 73000 && num <= 73699) return 'GO'
    if (num >= 73700 && num <= 76799) return 'GO'
    if (num >= 76800 && num <= 76999) return 'RO'
    if (num >= 77000 && num <= 77999) return 'TO'
    if (num >= 78000 && num <= 78899) return 'MT'
    if (num >= 79000 && num <= 79999) return 'MS'
    if (num >= 80000 && num <= 87999) return 'PR'
    if (num >= 88000 && num <= 89999) return 'SC'
    if (num >= 90000 && num <= 99999) return 'RS'
    return 'SP'
}

export function calculateInternationalShipping(country: string, locale?: string): ShippingOption[] {
    const c = getCountry(country)
    const rates = SHIPPING_RATES[c.continent]
    const lang = locale || 'pt'
    return rates.map(r => ({
        label: lang === 'en' ? r.labelEN : lang === 'es' ? r.labelES : r.label,
        value: r.value,
        daysText: lang === 'en' ? r.daysEN : lang === 'es' ? r.daysES : r.days,
    }))
}

export async function calculateShipping(
    state: string,
    subtotal: number,
    destCep?: string,
    pkgWeight?: number,
    pkgHeight?: number,
    pkgWidth?: number,
    pkgLength?: number,
    country?: string,
    locale?: string,
): Promise<ShippingOption[]> {
    if (country && country !== 'BR') {
        return calculateInternationalShipping(country, locale)
    }
    try {
        const mode = (await getSetting(SETTINGS_KEYS.SHIPPING_MODE)) ?? 'free'

        if (mode === 'free') {
            return [{ label: 'Frete Grátis', value: 0 }]
        }

        const freeAbove = parseFloat((await getSetting(SETTINGS_KEYS.SHIPPING_FREE_ABOVE)) ?? '0')
        if (freeAbove > 0 && subtotal >= freeAbove) {
            return [{ label: 'Frete Grátis', value: 0 }]
        }

        if (mode === 'fixed') {
            const fixedValue = parseFloat((await getSetting(SETTINGS_KEYS.SHIPPING_FIXED_VALUE)) ?? '0')
            return [{ label: 'Entrega Padrão', value: fixedValue }]
        }

        if (mode === 'by_state') {
            const tableJson = await getSetting(SETTINGS_KEYS.SHIPPING_STATE_TABLE)
            if (tableJson) {
                try {
                    const table: Record<string, number> = JSON.parse(tableJson)
                    const val = table[state] ?? table['DEFAULT'] ?? 0
                    return [{ label: 'Entrega para seu estado', value: val }]
                } catch {
                    return calcByRegion('SP', state)
                }
            }
        }

        if (mode === 'correios') {
            const cfg = await getSettings([
                SETTINGS_KEYS.SHIPPING_ORIGIN_CEP,
                SETTINGS_KEYS.SHIPPING_DEFAULT_WEIGHT,
                SETTINGS_KEYS.SHIPPING_DEFAULT_HEIGHT,
                SETTINGS_KEYS.SHIPPING_DEFAULT_WIDTH,
                SETTINGS_KEYS.SHIPPING_DEFAULT_LENGTH,
                SETTINGS_KEYS.SHIPPING_CORREIOS_USER,
                SETTINGS_KEYS.SHIPPING_CORREIOS_PASS,
            ])

            const originCep = cfg[SETTINGS_KEYS.SHIPPING_ORIGIN_CEP] || ''
            const originState = originCep ? cepToState(originCep) : 'SP'

            const defaultWeight = parseFloat(cfg[SETTINGS_KEYS.SHIPPING_DEFAULT_WEIGHT] || '0.5')
            const defaultHeight = parseFloat(cfg[SETTINGS_KEYS.SHIPPING_DEFAULT_HEIGHT] || '10')
            const defaultWidth = parseFloat(cfg[SETTINGS_KEYS.SHIPPING_DEFAULT_WIDTH] || '15')
            const defaultLength = parseFloat(cfg[SETTINGS_KEYS.SHIPPING_DEFAULT_LENGTH] || '20')

            const finalWeight = Math.max(pkgWeight || defaultWeight, 0.3)
            const finalHeight = Math.max(pkgHeight || defaultHeight, 2)
            const finalWidth = Math.max(pkgWidth || defaultWidth, 11)
            const finalLength = Math.max(pkgLength || defaultLength, 16)

            if (destCep && originCep) {
                try {
                    const options = await calcCorreios(
                        originCep,
                        destCep,
                        finalWeight,
                        finalHeight,
                        finalWidth,
                        finalLength,
                        cfg[SETTINGS_KEYS.SHIPPING_CORREIOS_USER] || '',
                        cfg[SETTINGS_KEYS.SHIPPING_CORREIOS_PASS] || '',
                    )
                    if (options.length > 0) return options
                } catch (e) {
                    console.warn('[Correios] Indisponível, usando cálculo por região:', (e as Error).message)
                }
            }

            return calcByRegion(originState, state)
        }

        return calcByRegion('SP', state)
    } catch (e) {
        console.error('[Shipping] Erro inesperado, usando fallback por região:', e)
        return calcByRegion('SP', state)
    }
}
