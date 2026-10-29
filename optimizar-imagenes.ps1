# Crea versiones livianas (JPEG) de las imágenes institucionales en assets/optimizadas,
# usadas por build-github.ps1 y recomendadas para subir en Configuración.
# Uso:  powershell -ExecutionPolicy Bypass -File dev/optimizar-imagenes.ps1
Add-Type -AssemblyName PresentationCore
$raiz = Split-Path -Parent $PSScriptRoot
$salida = Join-Path $raiz 'assets\optimizadas'
New-Item -ItemType Directory -Force $salida | Out-Null
$trabajos = @(
  @{ origen = 'insignia.jpg';     destino = 'insignia.jpg';     max = 320;  calidad = 85 },
  @{ origen = 'estudiantes.webp'; destino = 'estudiantes.jpg';  max = 720;  calidad = 82 },
  @{ origen = 'colegio.webp';     destino = 'colegio.jpg';      max = 1000; calidad = 60 }
)
foreach ($t in $trabajos) {
  $ruta = Join-Path $raiz ('assets\' + $t.origen)
  $fs = [IO.File]::OpenRead($ruta)
  try {
    $dec = [System.Windows.Media.Imaging.BitmapDecoder]::Create($fs, [System.Windows.Media.Imaging.BitmapCreateOptions]::None, [System.Windows.Media.Imaging.BitmapCacheOption]::OnLoad)
    $img = $dec.Frames[0]
    $k = [Math]::Min(1.0, $t.max / [Math]::Max($img.PixelWidth, $img.PixelHeight))
    $esc = New-Object System.Windows.Media.Imaging.TransformedBitmap($img, (New-Object System.Windows.Media.ScaleTransform($k, $k)))
    # Fondo blanco para imágenes con transparencia (el JPEG no la admite).
    $vis = New-Object System.Windows.Media.DrawingVisual
    $dc = $vis.RenderOpen()
    $dc.DrawRectangle([System.Windows.Media.Brushes]::White, $null, (New-Object System.Windows.Rect(0, 0, $esc.PixelWidth, $esc.PixelHeight)))
    $dc.DrawImage($esc, (New-Object System.Windows.Rect(0, 0, $esc.PixelWidth, $esc.PixelHeight)))
    $dc.Close()
    $rtb = New-Object System.Windows.Media.Imaging.RenderTargetBitmap($esc.PixelWidth, $esc.PixelHeight, 96, 96, [System.Windows.Media.PixelFormats]::Pbgra32)
    $rtb.Render($vis)
    $enc = New-Object System.Windows.Media.Imaging.JpegBitmapEncoder
    $enc.QualityLevel = $t.calidad
    $enc.Frames.Add([System.Windows.Media.Imaging.BitmapFrame]::Create($rtb))
    $out = [IO.File]::Create((Join-Path $salida $t.destino))
    $enc.Save($out); $out.Close()
    Write-Host ("{0}: {1:N0} KB" -f $t.destino, ((Get-Item (Join-Path $salida $t.destino)).Length / 1KB))
  } finally { $fs.Close() }
}
