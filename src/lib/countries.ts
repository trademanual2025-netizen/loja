export type Continent = 'south-america' | 'north-america' | 'europe' | 'asia' | 'africa' | 'oceania' | 'middle-east' | 'central-america'

export interface AddressFormat {
    postalCodeLabel: string
    postalCodeHint: string
    postalCodePattern?: RegExp
    postalCodeLen?: number
    hasNeighborhood: boolean
    hasNumber: boolean
    stateLabel: string
    showState: boolean
    lookup?: 'viacep' | 'zippopotam'
    zippopotamCode?: string
}

export interface Country {
    code: string
    namePT: string
    nameEN: string
    nameES: string
    flag: string
    continent: Continent
    fmt: AddressFormat
}

const generic: AddressFormat = {
    postalCodeLabel: 'Código Postal / Postal Code',
    postalCodeHint: '',
    hasNeighborhood: false,
    hasNumber: false,
    stateLabel: 'Estado / Region',
    showState: true,
}

export const COUNTRIES: Country[] = [
    {
        code: 'BR', namePT: 'Brasil', nameEN: 'Brazil', nameES: 'Brasil', flag: '🇧🇷', continent: 'south-america',
        fmt: { postalCodeLabel: 'CEP', postalCodeHint: '00000-000', postalCodePattern: /^\d{5}-?\d{3}$/, postalCodeLen: 8, hasNeighborhood: true, hasNumber: true, stateLabel: 'Estado (UF)', showState: true, lookup: 'viacep' },
    },
    {
        code: 'US', namePT: 'Estados Unidos', nameEN: 'United States', nameES: 'Estados Unidos', flag: '🇺🇸', continent: 'north-america',
        fmt: { postalCodeLabel: 'ZIP Code', postalCodeHint: '00000', postalCodePattern: /^\d{5}(-\d{4})?$/, postalCodeLen: 5, hasNeighborhood: false, hasNumber: false, stateLabel: 'State', showState: true, lookup: 'zippopotam', zippopotamCode: 'us' },
    },
    {
        code: 'CA', namePT: 'Canadá', nameEN: 'Canada', nameES: 'Canadá', flag: '🇨🇦', continent: 'north-america',
        fmt: { postalCodeLabel: 'Postal Code', postalCodeHint: 'A1A 1A1', postalCodeLen: 6, hasNeighborhood: false, hasNumber: false, stateLabel: 'Province', showState: true, lookup: 'zippopotam', zippopotamCode: 'ca' },
    },
    {
        code: 'MX', namePT: 'México', nameEN: 'Mexico', nameES: 'México', flag: '🇲🇽', continent: 'central-america',
        fmt: { postalCodeLabel: 'Código Postal', postalCodeHint: '00000', postalCodeLen: 5, hasNeighborhood: false, hasNumber: false, stateLabel: 'Estado', showState: true, lookup: 'zippopotam', zippopotamCode: 'mx' },
    },
    {
        code: 'AR', namePT: 'Argentina', nameEN: 'Argentina', nameES: 'Argentina', flag: '🇦🇷', continent: 'south-america',
        fmt: { postalCodeLabel: 'Código Postal', postalCodeHint: 'A0000AAA', postalCodeLen: 8, hasNeighborhood: false, hasNumber: true, stateLabel: 'Provincia', showState: true },
    },
    {
        code: 'CL', namePT: 'Chile', nameEN: 'Chile', nameES: 'Chile', flag: '🇨🇱', continent: 'south-america',
        fmt: { postalCodeLabel: 'Código Postal', postalCodeHint: '000-0000', postalCodeLen: 7, hasNeighborhood: false, hasNumber: true, stateLabel: 'Región', showState: true },
    },
    {
        code: 'CO', namePT: 'Colômbia', nameEN: 'Colombia', nameES: 'Colombia', flag: '🇨🇴', continent: 'south-america',
        fmt: { postalCodeLabel: 'Código Postal', postalCodeHint: '000000', postalCodeLen: 6, hasNeighborhood: false, hasNumber: true, stateLabel: 'Departamento', showState: true },
    },
    {
        code: 'PE', namePT: 'Peru', nameEN: 'Peru', nameES: 'Perú', flag: '🇵🇪', continent: 'south-america',
        fmt: { postalCodeLabel: 'Código Postal', postalCodeHint: '00000', postalCodeLen: 5, hasNeighborhood: false, hasNumber: true, stateLabel: 'Departamento', showState: true },
    },
    {
        code: 'UY', namePT: 'Uruguai', nameEN: 'Uruguay', nameES: 'Uruguay', flag: '🇺🇾', continent: 'south-america',
        fmt: { postalCodeLabel: 'Código Postal', postalCodeHint: '00000', postalCodeLen: 5, hasNeighborhood: false, hasNumber: true, stateLabel: 'Departamento', showState: true },
    },
    {
        code: 'PY', namePT: 'Paraguai', nameEN: 'Paraguay', nameES: 'Paraguay', flag: '🇵🇾', continent: 'south-america',
        fmt: { postalCodeLabel: 'Código Postal', postalCodeHint: '0000', postalCodeLen: 4, hasNeighborhood: false, hasNumber: true, stateLabel: 'Departamento', showState: true },
    },
    {
        code: 'BO', namePT: 'Bolívia', nameEN: 'Bolivia', nameES: 'Bolivia', flag: '🇧🇴', continent: 'south-america',
        fmt: { postalCodeLabel: 'Código Postal', postalCodeHint: '', hasNeighborhood: false, hasNumber: true, stateLabel: 'Departamento', showState: true },
    },
    {
        code: 'EC', namePT: 'Equador', nameEN: 'Ecuador', nameES: 'Ecuador', flag: '🇪🇨', continent: 'south-america',
        fmt: { postalCodeLabel: 'Código Postal', postalCodeHint: '000000', postalCodeLen: 6, hasNeighborhood: false, hasNumber: true, stateLabel: 'Provincia', showState: true },
    },
    {
        code: 'VE', namePT: 'Venezuela', nameEN: 'Venezuela', nameES: 'Venezuela', flag: '🇻🇪', continent: 'south-america',
        fmt: { postalCodeLabel: 'Código Postal', postalCodeHint: '0000', postalCodeLen: 4, hasNeighborhood: false, hasNumber: true, stateLabel: 'Estado', showState: true },
    },
    {
        code: 'GB', namePT: 'Reino Unido', nameEN: 'United Kingdom', nameES: 'Reino Unido', flag: '🇬🇧', continent: 'europe',
        fmt: { postalCodeLabel: 'Postcode', postalCodeHint: 'SW1A 1AA', postalCodeLen: 6, hasNeighborhood: false, hasNumber: false, stateLabel: 'County', showState: true, lookup: 'zippopotam', zippopotamCode: 'gb' },
    },
    {
        code: 'DE', namePT: 'Alemanha', nameEN: 'Germany', nameES: 'Alemania', flag: '🇩🇪', continent: 'europe',
        fmt: { postalCodeLabel: 'Postleitzahl (PLZ)', postalCodeHint: '00000', postalCodeLen: 5, hasNeighborhood: false, hasNumber: false, stateLabel: 'Bundesland', showState: true, lookup: 'zippopotam', zippopotamCode: 'de' },
    },
    {
        code: 'FR', namePT: 'França', nameEN: 'France', nameES: 'Francia', flag: '🇫🇷', continent: 'europe',
        fmt: { postalCodeLabel: 'Code Postal', postalCodeHint: '75000', postalCodeLen: 5, hasNeighborhood: false, hasNumber: false, stateLabel: 'Région', showState: true, lookup: 'zippopotam', zippopotamCode: 'fr' },
    },
    {
        code: 'ES', namePT: 'Espanha', nameEN: 'Spain', nameES: 'España', flag: '🇪🇸', continent: 'europe',
        fmt: { postalCodeLabel: 'Código Postal', postalCodeHint: '00000', postalCodeLen: 5, hasNeighborhood: false, hasNumber: false, stateLabel: 'Provincia', showState: true, lookup: 'zippopotam', zippopotamCode: 'es' },
    },
    {
        code: 'IT', namePT: 'Itália', nameEN: 'Italy', nameES: 'Italia', flag: '🇮🇹', continent: 'europe',
        fmt: { postalCodeLabel: 'CAP', postalCodeHint: '00100', postalCodeLen: 5, hasNeighborhood: false, hasNumber: false, stateLabel: 'Provincia', showState: true, lookup: 'zippopotam', zippopotamCode: 'it' },
    },
    {
        code: 'PT', namePT: 'Portugal', nameEN: 'Portugal', nameES: 'Portugal', flag: '🇵🇹', continent: 'europe',
        fmt: { postalCodeLabel: 'Código Postal', postalCodeHint: '0000-000', postalCodeLen: 7, hasNeighborhood: false, hasNumber: false, stateLabel: 'Distrito', showState: true, lookup: 'zippopotam', zippopotamCode: 'pt' },
    },
    {
        code: 'NL', namePT: 'Países Baixos', nameEN: 'Netherlands', nameES: 'Países Bajos', flag: '🇳🇱', continent: 'europe',
        fmt: { postalCodeLabel: 'Postcode', postalCodeHint: '1234 AB', postalCodeLen: 6, hasNeighborhood: false, hasNumber: false, stateLabel: 'Provincie', showState: true, lookup: 'zippopotam', zippopotamCode: 'nl' },
    },
    {
        code: 'BE', namePT: 'Bélgica', nameEN: 'Belgium', nameES: 'Bélgica', flag: '🇧🇪', continent: 'europe',
        fmt: { postalCodeLabel: 'Code Postal', postalCodeHint: '0000', postalCodeLen: 4, hasNeighborhood: false, hasNumber: false, stateLabel: 'Province', showState: true, lookup: 'zippopotam', zippopotamCode: 'be' },
    },
    {
        code: 'CH', namePT: 'Suíça', nameEN: 'Switzerland', nameES: 'Suiza', flag: '🇨🇭', continent: 'europe',
        fmt: { postalCodeLabel: 'PLZ', postalCodeHint: '0000', postalCodeLen: 4, hasNeighborhood: false, hasNumber: false, stateLabel: 'Kanton', showState: true, lookup: 'zippopotam', zippopotamCode: 'ch' },
    },
    {
        code: 'AT', namePT: 'Áustria', nameEN: 'Austria', nameES: 'Austria', flag: '🇦🇹', continent: 'europe',
        fmt: { postalCodeLabel: 'Postleitzahl', postalCodeHint: '0000', postalCodeLen: 4, hasNeighborhood: false, hasNumber: false, stateLabel: 'Bundesland', showState: true, lookup: 'zippopotam', zippopotamCode: 'at' },
    },
    {
        code: 'SE', namePT: 'Suécia', nameEN: 'Sweden', nameES: 'Suecia', flag: '🇸🇪', continent: 'europe',
        fmt: { postalCodeLabel: 'Postnummer', postalCodeHint: '000 00', postalCodeLen: 5, hasNeighborhood: false, hasNumber: false, stateLabel: 'Landskap', showState: true, lookup: 'zippopotam', zippopotamCode: 'se' },
    },
    {
        code: 'NO', namePT: 'Noruega', nameEN: 'Norway', nameES: 'Noruega', flag: '🇳🇴', continent: 'europe',
        fmt: { postalCodeLabel: 'Postnummer', postalCodeHint: '0000', postalCodeLen: 4, hasNeighborhood: false, hasNumber: false, stateLabel: 'Fylke', showState: true, lookup: 'zippopotam', zippopotamCode: 'no' },
    },
    {
        code: 'DK', namePT: 'Dinamarca', nameEN: 'Denmark', nameES: 'Dinamarca', flag: '🇩🇰', continent: 'europe',
        fmt: { postalCodeLabel: 'Postnummer', postalCodeHint: '0000', postalCodeLen: 4, hasNeighborhood: false, hasNumber: false, stateLabel: 'Region', showState: true, lookup: 'zippopotam', zippopotamCode: 'dk' },
    },
    {
        code: 'FI', namePT: 'Finlândia', nameEN: 'Finland', nameES: 'Finlandia', flag: '🇫🇮', continent: 'europe',
        fmt: { postalCodeLabel: 'Postinumero', postalCodeHint: '00000', postalCodeLen: 5, hasNeighborhood: false, hasNumber: false, stateLabel: 'Maakunta', showState: true, lookup: 'zippopotam', zippopotamCode: 'fi' },
    },
    {
        code: 'PL', namePT: 'Polônia', nameEN: 'Poland', nameES: 'Polonia', flag: '🇵🇱', continent: 'europe',
        fmt: { postalCodeLabel: 'Kod pocztowy', postalCodeHint: '00-000', postalCodeLen: 5, hasNeighborhood: false, hasNumber: false, stateLabel: 'Województwo', showState: true, lookup: 'zippopotam', zippopotamCode: 'pl' },
    },
    {
        code: 'RU', namePT: 'Rússia', nameEN: 'Russia', nameES: 'Rusia', flag: '🇷🇺', continent: 'europe',
        fmt: { postalCodeLabel: 'Почтовый индекс', postalCodeHint: '000000', postalCodeLen: 6, hasNeighborhood: false, hasNumber: false, stateLabel: 'Oblast / Region', showState: true },
    },
    {
        code: 'JP', namePT: 'Japão', nameEN: 'Japan', nameES: 'Japón', flag: '🇯🇵', continent: 'asia',
        fmt: { postalCodeLabel: '郵便番号 (Postal Code)', postalCodeHint: '000-0000', postalCodeLen: 7, hasNeighborhood: false, hasNumber: false, stateLabel: 'Prefecture', showState: true, lookup: 'zippopotam', zippopotamCode: 'jp' },
    },
    {
        code: 'CN', namePT: 'China', nameEN: 'China', nameES: 'China', flag: '🇨🇳', continent: 'asia',
        fmt: { postalCodeLabel: '邮政编码 (Postal Code)', postalCodeHint: '000000', postalCodeLen: 6, hasNeighborhood: false, hasNumber: false, stateLabel: 'Province', showState: true },
    },
    {
        code: 'KR', namePT: 'Coreia do Sul', nameEN: 'South Korea', nameES: 'Corea del Sur', flag: '🇰🇷', continent: 'asia',
        fmt: { postalCodeLabel: '우편번호 (Postal Code)', postalCodeHint: '00000', postalCodeLen: 5, hasNeighborhood: false, hasNumber: false, stateLabel: 'Province', showState: true, lookup: 'zippopotam', zippopotamCode: 'kr' },
    },
    {
        code: 'IN', namePT: 'Índia', nameEN: 'India', nameES: 'India', flag: '🇮🇳', continent: 'asia',
        fmt: { postalCodeLabel: 'PIN Code', postalCodeHint: '000000', postalCodeLen: 6, hasNeighborhood: false, hasNumber: false, stateLabel: 'State', showState: true, lookup: 'zippopotam', zippopotamCode: 'in' },
    },
    {
        code: 'SG', namePT: 'Singapura', nameEN: 'Singapore', nameES: 'Singapur', flag: '🇸🇬', continent: 'asia',
        fmt: { postalCodeLabel: 'Postal Code', postalCodeHint: '000000', postalCodeLen: 6, hasNeighborhood: false, hasNumber: false, stateLabel: 'District', showState: false, lookup: 'zippopotam', zippopotamCode: 'sg' },
    },
    {
        code: 'AU', namePT: 'Austrália', nameEN: 'Australia', nameES: 'Australia', flag: '🇦🇺', continent: 'oceania',
        fmt: { postalCodeLabel: 'Postcode', postalCodeHint: '0000', postalCodeLen: 4, hasNeighborhood: false, hasNumber: false, stateLabel: 'State / Territory', showState: true, lookup: 'zippopotam', zippopotamCode: 'au' },
    },
    {
        code: 'NZ', namePT: 'Nova Zelândia', nameEN: 'New Zealand', nameES: 'Nueva Zelanda', flag: '🇳🇿', continent: 'oceania',
        fmt: { postalCodeLabel: 'Postcode', postalCodeHint: '0000', postalCodeLen: 4, hasNeighborhood: false, hasNumber: false, stateLabel: 'Region', showState: true, lookup: 'zippopotam', zippopotamCode: 'nz' },
    },
    {
        code: 'AE', namePT: 'Emirados Árabes', nameEN: 'United Arab Emirates', nameES: 'Emiratos Árabes', flag: '🇦🇪', continent: 'middle-east',
        fmt: { postalCodeLabel: 'Postal Code', postalCodeHint: '00000', hasNeighborhood: false, hasNumber: false, stateLabel: 'Emirate', showState: true },
    },
    {
        code: 'SA', namePT: 'Arábia Saudita', nameEN: 'Saudi Arabia', nameES: 'Arabia Saudí', flag: '🇸🇦', continent: 'middle-east',
        fmt: { postalCodeLabel: 'Postal Code', postalCodeHint: '00000', postalCodeLen: 5, hasNeighborhood: false, hasNumber: false, stateLabel: 'Region', showState: true },
    },
    {
        code: 'IL', namePT: 'Israel', nameEN: 'Israel', nameES: 'Israel', flag: '🇮🇱', continent: 'middle-east',
        fmt: { postalCodeLabel: 'Postal Code', postalCodeHint: '0000000', postalCodeLen: 7, hasNeighborhood: false, hasNumber: false, stateLabel: 'District', showState: true, lookup: 'zippopotam', zippopotamCode: 'il' },
    },
    {
        code: 'ZA', namePT: 'África do Sul', nameEN: 'South Africa', nameES: 'Sudáfrica', flag: '🇿🇦', continent: 'africa',
        fmt: { postalCodeLabel: 'Postal Code', postalCodeHint: '0000', postalCodeLen: 4, hasNeighborhood: false, hasNumber: false, stateLabel: 'Province', showState: true, lookup: 'zippopotam', zippopotamCode: 'za' },
    },
    {
        code: 'NG', namePT: 'Nigéria', nameEN: 'Nigeria', nameES: 'Nigeria', flag: '🇳🇬', continent: 'africa',
        fmt: { ...generic, stateLabel: 'State' },
    },
    {
        code: 'GH', namePT: 'Gana', nameEN: 'Ghana', nameES: 'Ghana', flag: '🇬🇭', continent: 'africa',
        fmt: { ...generic, stateLabel: 'Region' },
    },
    {
        code: 'KE', namePT: 'Quênia', nameEN: 'Kenya', nameES: 'Kenia', flag: '🇰🇪', continent: 'africa',
        fmt: { postalCodeLabel: 'Postal Code', postalCodeHint: '00000', postalCodeLen: 5, hasNeighborhood: false, hasNumber: false, stateLabel: 'County', showState: true },
    },
    {
        code: 'OTHER', namePT: 'Outro país', nameEN: 'Other country', nameES: 'Otro país', flag: '🌍', continent: 'africa',
        fmt: { ...generic },
    },
]

export function getCountry(code: string): Country {
    return COUNTRIES.find(c => c.code === code) ?? COUNTRIES.find(c => c.code === 'OTHER')!
}

export function getCountryName(code: string, locale: string): string {
    const c = getCountry(code)
    if (locale === 'en') return c.nameEN
    if (locale === 'es') return c.nameES
    return c.namePT
}

export const SHIPPING_RATES: Record<Continent, { label: string; labelEN: string; labelES: string; value: number; days: string; daysEN: string; daysES: string }[]> = {
    'south-america': [
        { label: 'Econômico (Correios Intl)', labelEN: 'Economy (International Post)', labelES: 'Económico (Correo Internacional)', value: 75, days: '20–40 dias úteis', daysEN: '20–40 business days', daysES: '20–40 días hábiles' },
        { label: 'EMS Express', labelEN: 'EMS Express', labelES: 'EMS Express', value: 180, days: '8–15 dias úteis', daysEN: '8–15 business days', daysES: '8–15 días hábiles' },
    ],
    'central-america': [
        { label: 'Econômico (Correios Intl)', labelEN: 'Economy (International Post)', labelES: 'Económico (Correo Internacional)', value: 95, days: '25–45 dias úteis', daysEN: '25–45 business days', daysES: '25–45 días hábiles' },
        { label: 'EMS Express', labelEN: 'EMS Express', labelES: 'EMS Express', value: 220, days: '10–18 dias úteis', daysEN: '10–18 business days', daysES: '10–18 días hábiles' },
    ],
    'north-america': [
        { label: 'Econômico (Correios Intl)', labelEN: 'Economy (International Post)', labelES: 'Económico (Correo Internacional)', value: 110, days: '20–35 dias úteis', daysEN: '20–35 business days', daysES: '20–35 días hábiles' },
        { label: 'EMS Express', labelEN: 'EMS Express', labelES: 'EMS Express', value: 250, days: '7–12 dias úteis', daysEN: '7–12 business days', daysES: '7–12 días hábiles' },
    ],
    'europe': [
        { label: 'Econômico (Correios Intl)', labelEN: 'Economy (International Post)', labelES: 'Económico (Correo Internacional)', value: 130, days: '20–40 dias úteis', daysEN: '20–40 business days', daysES: '20–40 días hábiles' },
        { label: 'EMS Express', labelEN: 'EMS Express', labelES: 'EMS Express', value: 280, days: '8–14 dias úteis', daysEN: '8–14 business days', daysES: '8–14 días hábiles' },
    ],
    'asia': [
        { label: 'Econômico (Correios Intl)', labelEN: 'Economy (International Post)', labelES: 'Económico (Correo Internacional)', value: 150, days: '25–45 dias úteis', daysEN: '25–45 business days', daysES: '25–45 días hábiles' },
        { label: 'EMS Express', labelEN: 'EMS Express', labelES: 'EMS Express', value: 320, days: '10–18 dias úteis', daysEN: '10–18 business days', daysES: '10–18 días hábiles' },
    ],
    'oceania': [
        { label: 'Econômico (Correios Intl)', labelEN: 'Economy (International Post)', labelES: 'Económico (Correo Internacional)', value: 160, days: '25–50 dias úteis', daysEN: '25–50 business days', daysES: '25–50 días hábiles' },
        { label: 'EMS Express', labelEN: 'EMS Express', labelES: 'EMS Express', value: 350, days: '10–18 dias úteis', daysEN: '10–18 business days', daysES: '10–18 días hábiles' },
    ],
    'middle-east': [
        { label: 'Econômico (Correios Intl)', labelEN: 'Economy (International Post)', labelES: 'Económico (Correo Internacional)', value: 140, days: '25–50 dias úteis', daysEN: '25–50 business days', daysES: '25–50 días hábiles' },
        { label: 'EMS Express', labelEN: 'EMS Express', labelES: 'EMS Express', value: 300, days: '10–18 dias úteis', daysEN: '10–18 business days', daysES: '10–18 días hábiles' },
    ],
    'africa': [
        { label: 'Econômico (Correios Intl)', labelEN: 'Economy (International Post)', labelES: 'Económico (Correo Internacional)', value: 160, days: '30–60 dias úteis', daysEN: '30–60 business days', daysES: '30–60 días hábiles' },
        { label: 'EMS Express', labelEN: 'EMS Express', labelES: 'EMS Express', value: 360, days: '14–25 dias úteis', daysEN: '14–25 business days', daysES: '14–25 días hábiles' },
    ],
}
