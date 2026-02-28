$BASE = "http://localhost:3000"

$body = @{
    store_name            = "Velour"
    store_primary_color   = "#1a1a1a"
    seo_meta_title        = "Velour | Moda Elegante & Essencial"
    seo_meta_description  = "Descubra a coleção de moda essencial e elegante da Velour. Peças atemporais."
    store_banner_title    = "Coleções Essenciais Primavera"
    store_banner_subtitle = "Silhuetas atemporais e tecidos refinados para o seu dia a dia."
    store_banner_url      = "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1920&auto=format&fit=crop"
} | ConvertTo-Json

Write-Host "Aplicando configurações de exemplo..."
try {
    Invoke-RestMethod -Uri "$BASE/api/admin/settings" -Method POST -Body $body -ContentType "application/json" | Out-Null
    Write-Host "✅ Configurações aplicadas com sucesso!"
}
catch {
    Write-Host "❌ Erro: $_"
}
