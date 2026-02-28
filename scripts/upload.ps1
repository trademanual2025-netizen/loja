$BASE = "http://localhost:3000"
$BRAIN = "C:\Users\leona\.gemini\antigravity\brain\8f4e12de-b551-42d5-bacd-1c0bbc8e3f49"

$slugs = @("bolsa-mini-crossbody","oculos-retro-vintage","casaco-oversize-bege","jaqueta-bomber-classic","vestido-midi-elegance","vestido-floral-verao")
$files = @(
    "bolsa_mini_crossbody_banner_1771893426583.png",
    "oculos_retro_vintage_banner_1771893442460.png",
    "casaco_oversize_bege_banner_1771893458126.png",
    "jaqueta_bomber_classic_banner_1771893472088.png",
    "vestido_midi_elegance_banner_1771893502565.png",
    "vestido_floral_verao_banner_1771893516511.png"
)

Write-Host "Buscando produtos..."
$resp = Invoke-RestMethod -Uri "$BASE/api/admin/products?limit=50" -Method GET
$prods = $resp.products
Write-Host "Encontrados: $($prods.Count) produtos"

for ($i = 0; $i -lt $slugs.Length; $i++) {
    $slug = $slugs[$i]
    $p = $prods | Where-Object { $_.slug -eq $slug } | Select-Object -First 1
    if (-not $p) { Write-Host "Skip (nao encontrado): $slug"; continue }

    $filepath = Join-Path $BRAIN $files[$i]
    if (-not (Test-Path $filepath)) { Write-Host "Skip (sem arquivo): $filepath"; continue }

    Write-Host "Processando: $($p.name) [id=$($p.id)]"

    $bytes = [System.IO.File]::ReadAllBytes($filepath)
    $b64 = [System.Convert]::ToBase64String($bytes)
    $dataUrl = "data:image/png;base64,$b64"

    $existingImages = @($p.images)
    $gallery = if ($existingImages.Count -eq 0) { @($dataUrl) } else { $existingImages }

    $bodyObj = @{ bannerUrl = $dataUrl; images = $gallery }
    $bodyJson = $bodyObj | ConvertTo-Json -Depth 4

    try {
        Invoke-RestMethod -Uri "$BASE/api/admin/products/$($p.id)" -Method PATCH -Body $bodyJson -ContentType "application/json" | Out-Null
        Write-Host "  OK"
    } catch {
        Write-Host "  ERRO: $_"
    }

    Start-Sleep -Milliseconds 400
}

Write-Host "Concluido!"
