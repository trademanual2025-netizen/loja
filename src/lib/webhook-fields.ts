export interface FieldDef {
    key: string
    label: string
    defaultName: string
    group: 'meta' | 'data' | 'address'
}

export interface FieldMapping {
    [originalKey: string]: { enabled: boolean; customName: string }
}

export const LEAD_FIELDS: FieldDef[] = [
    { key: 'event', label: 'Evento', defaultName: 'event', group: 'meta' },
    { key: 'timestamp', label: 'Data/hora', defaultName: 'timestamp', group: 'meta' },
    { key: 'id', label: 'ID do lead', defaultName: 'id', group: 'data' },
    { key: 'name', label: 'Nome completo', defaultName: 'name', group: 'data' },
    { key: 'email', label: 'E-mail', defaultName: 'email', group: 'data' },
    { key: 'phone', label: 'Telefone', defaultName: 'phone', group: 'data' },
    { key: 'cpf', label: 'CPF', defaultName: 'cpf', group: 'data' },
    { key: 'source', label: 'Origem', defaultName: 'source', group: 'data' },
    { key: 'created_at', label: 'Data de cadastro', defaultName: 'created_at', group: 'data' },
]

export const BUYER_FIELDS: FieldDef[] = [
    { key: 'event', label: 'Evento', defaultName: 'event', group: 'meta' },
    { key: 'timestamp', label: 'Data/hora', defaultName: 'timestamp', group: 'meta' },
    { key: 'order_id', label: 'ID do pedido', defaultName: 'order_id', group: 'data' },
    { key: 'gateway_id', label: 'ID da transacao', defaultName: 'gateway_id', group: 'data' },
    { key: 'name', label: 'Nome do comprador', defaultName: 'name', group: 'data' },
    { key: 'email', label: 'E-mail', defaultName: 'email', group: 'data' },
    { key: 'phone', label: 'Telefone', defaultName: 'phone', group: 'data' },
    { key: 'cpf', label: 'CPF', defaultName: 'cpf', group: 'data' },
    { key: 'street', label: 'Rua', defaultName: 'street', group: 'address' },
    { key: 'number', label: 'Numero', defaultName: 'number', group: 'address' },
    { key: 'complement', label: 'Complemento', defaultName: 'complement', group: 'address' },
    { key: 'neighborhood', label: 'Bairro', defaultName: 'neighborhood', group: 'address' },
    { key: 'city', label: 'Cidade', defaultName: 'city', group: 'address' },
    { key: 'state', label: 'Estado (UF)', defaultName: 'state', group: 'address' },
    { key: 'zip', label: 'CEP', defaultName: 'zip', group: 'address' },
    { key: 'subtotal', label: 'Subtotal (R$)', defaultName: 'subtotal', group: 'data' },
    { key: 'shipping', label: 'Frete (R$)', defaultName: 'shipping', group: 'data' },
    { key: 'total', label: 'Total pago (R$)', defaultName: 'total', group: 'data' },
    { key: 'currency', label: 'Moeda', defaultName: 'currency', group: 'data' },
    { key: 'gateway', label: 'Gateway', defaultName: 'gateway', group: 'data' },
    { key: 'products', label: 'Produtos', defaultName: 'products', group: 'data' },
]
