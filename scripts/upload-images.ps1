# upload-images.ps1
# Script PowerShell para injetar imagens nos produtos via API do Next.js

$BASE = "http://localhost:3000"
$BRAIN = "C:\Users\leona\.gemini\antigravity\brain\8f4e12de-b551-42d5-bacd-1c0bbc8e3f49"

$PRODUCTS = @(
    @{ Name = "Bolsa Mini Crossbody";   File = "$BRAIN\bolsa_mini_crossbody_banner_1771893426583.png" },
    @{ Name = "Óculos Retrô Vintage";   File = "$BRAIN\oculos_retro_vintage_banner_1771893442460.png" },
    @{ Name = "Casaco Oversize Bege";   File = "$BRAIN\casaco_oversize_bege_banner_1771893458126.png" },
    @{ Name = "Jaqueta Bomber Classic"; File = "$BRAIN\jaqueta_bomber_classic_banner_1771893472088.png" },
    @{ Name = "Vestido Midi Elegance";  File = "$BRAIN\vestido_midi_elegance_banner_1771893502565.png" },
    @{ Name = "Vestido Floral Verão";   File = "$BRAIN\vestido_floral_verao_banner_1771893516511.png" }
)

# Criar sessão para manter cookies
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

# 1. Buscar lista de produtos (o admin já está logado, mas precisamos do cookie)
Write-Host "📦 Buscando produtos..."
try {
    $res = Invoke-WebRequest -Uri "$BASE/api/admin/products?limit=50" -WebSession $session -UseBasicParsing
    $products = ($res.Content | ConvertFrom-Json).products
    Write-Host "✅ $($products.Count) produtos encontrados`n"
} catch {
    Write-Host "❌ Erro ao buscar produtos: $_"
    exit 1
}

foreach ($item in $PRODUCTS) {
    $product = $products | Where-Object { $_.name -eq $item.Name } | Select-Object -First 1
    if (-not $product) {
        Write-Host "❌ Produto não encontrado: $($item.Name)"
        continue
    }

    if (-not (Test-Path $item.File)) {
        Write-Host "❌ Arquivo não encontrado: $($item.File)"
        continue
    }

    Write-Host "📤 Processando: $($item.Name)..."

    # Ler arquivo e converter para base64
    $bytes = [System.IO.File]::ReadAllBytes($item.File)
    $b64 = [System.Convert]::ToBase64String($bytes)
    $dataUrl = "data:image/png;base64,$b64"

    # Montar payload — usa banner como único item na galeria se galeria estiver vazia
    $existingImages = if ($product.images -and $product.images.Count -gt 0) { $product.images } else { @($dataUrl) }
    # Só adiciona à galeria se não tiver imagens ainda
    $galleryImages = if ($product.images.Count -eq 0) { @($dataUrl) } else { $product.images }

    $body = @{
        bannerUrl = $dataUrl
        images    = $galleryImages
    } | ConvertTo-Json -Depth 5

    try {
        $updateRes = Invoke-WebRequest -Uri "$BASE/api/admin/products/$($product.id)" `
            -Method PATCH `
            -Body $body `
            -ContentType "application/json" `
            -WebSession $session `
            -UseBasicParsing

        if ($updateRes.StatusCode -eq 200) {
            Write-Host "  ✅ Sucesso: $($item.Name)"
        } else {
            Write-Host "  ⚠️  Status $($updateRes.StatusCode): $($item.Name)"
        }
    } catch {
        Write-Host "  ❌ Erro: $_"
    }

    Start-Sleep -Milliseconds 500
}

Write-Host "`n🎉 Processo concluído!"
