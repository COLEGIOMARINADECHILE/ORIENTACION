# Genera dev/preview.html: la interfaz completa con datos ficticios (sin Apps Script).
# Uso:  powershell -ExecutionPolicy Bypass -File dev/build-preview.ps1
$raiz = Split-Path -Parent $PSScriptRoot
$src = Join-Path $raiz 'src'
$utf8 = New-Object System.Text.UTF8Encoding($false)
$html = [IO.File]::ReadAllText((Join-Path $src 'Index.html'), $utf8)
$estilos = [IO.File]::ReadAllText((Join-Path $src 'Styles.html'), $utf8)
$app = [IO.File]::ReadAllText((Join-Path $src 'App.html'), $utf8)
$mock = [IO.File]::ReadAllText((Join-Path $PSScriptRoot 'mock.js'), $utf8)
$img = "<script>window.MOCK_IMG={logo:'/assets/insignia.jpg',portada:'/assets/estudiantes.webp',colegio:'/assets/colegio.webp'};</script>"
$html = $html.Replace("<?!= include('Styles') ?>", $estilos)
$ilus = [IO.File]::ReadAllText((Join-Path $src 'Ilustraciones.html'), $utf8)
$html = $html.Replace("<?!= include('Ilustraciones') ?>", $ilus)
$html = $html.Replace("<?!= include('App') ?>", $img + "<script>" + $mock + "</script>" + $app)
[IO.File]::WriteAllText((Join-Path $PSScriptRoot 'preview.html'), $html, $utf8)
Write-Host "Listo: dev/preview.html"
