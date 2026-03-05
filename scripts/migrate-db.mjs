import pg from 'pg'
const { Client } = pg

const OLD_URL = 'postgresql://neondb_owner:npg_hxj7qgkZuoI5@ep-nameless-wind-ac3q998i-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require'
const NEW_URL = 'postgresql://neondb_owner:npg_BHoNiM2s0hPG@ep-polished-resonance-aiplvsp0-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require'

// Ordem respeita dependências de foreign keys
const TABLES = [
    'AdminUser',
    'Settings',
    'Category',
    'User',
    'Lead',
    'ContactMessage',
    'Product',
    'ProductOption',
    'ProductVariant',
    'StockReservation',
    'Order',
    'OrderItem',
    'RefundRequest',
    'RefundMessage',
    'WebhookLog',
]

async function copyTable(oldDb, newDb, table) {
    const { rows } = await oldDb.query(`SELECT * FROM "${table}"`)
    if (rows.length === 0) {
        console.log(`  ${table}: vazio, pulando`)
        return
    }

    const cols = Object.keys(rows[0])
    const colsSql = cols.map(c => `"${c}"`).join(', ')

    // Insere em lotes de 100 para não estourar o limite de parâmetros
    const BATCH = 100
    let total = 0
    for (let i = 0; i < rows.length; i += BATCH) {
        const batch = rows.slice(i, i + BATCH)
        const placeholders = batch.map((_, ri) =>
            `(${cols.map((_, ci) => `$${ri * cols.length + ci + 1}`).join(', ')})`
        ).join(', ')
        const values = batch.flatMap(row => cols.map(c => row[c]))
        await newDb.query(
            `INSERT INTO "${table}" (${colsSql}) VALUES ${placeholders} ON CONFLICT DO NOTHING`,
            values
        )
        total += batch.length
    }
    console.log(`  ✓ ${table}: ${total} registro(s) copiado(s)`)
}

async function migrate() {
    const oldDb = new Client({ connectionString: OLD_URL })
    const newDb = new Client({ connectionString: NEW_URL })

    await oldDb.connect()
    await newDb.connect()
    console.log('✓ Conectado aos dois bancos\n')

    for (const table of TABLES) {
        try {
            await copyTable(oldDb, newDb, table)
        } catch (err) {
            console.warn(`  ⚠ ${table}: ${err.message}`)
        }
    }

    await oldDb.end()
    await newDb.end()
    console.log('\n✅ Migração concluída!')
}

migrate().catch(err => {
    console.error('Erro fatal:', err.message)
    process.exit(1)
})
