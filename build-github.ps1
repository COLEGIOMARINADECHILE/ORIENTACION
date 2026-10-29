# Genera index.html (raíz del repositorio) para publicar la plataforma en GitHub Pages.
# La página es la misma interfaz, pero se conecta por internet con Apps Script (doPost),
# donde se guardan todos los datos. Las imágenes van incluidas dentro del archivo.
# Uso:  powershell -ExecutionPolicy Bypass -File dev/build-github.ps1 [-Api "https://script.google.com/macros/s/.../exec"]
param([string]$Api = 'https://script.google.com/macros/s/AKfycbwL47EUXV9RSNDJFbRrsVPZmcQr0nUvQqzcx-9ZlFzfxudH-VUMgy9hbWGttsKpAFIq/exec')
$raiz = Split-Path -Parent $PSScriptRoot
$src = Join-Path $raiz 'src'
$utf8 = New-Object System.Text.UTF8Encoding($false)
function Leer($n) { [IO.File]::ReadAllText((Join-Path $src $n), $utf8) }
function DataUri($archivo, $mime) {
  # Usa la versión liviana de assets/optimizadas si existe (ver dev/optimizar-imagenes.ps1).
  $liviana = Join-Path $raiz ('assets\optimizadas\' + [IO.Path]::GetFileNameWithoutExtension($archivo) + '.jpg')
  if (Test-Path $liviana) { return 'data:image/jpeg;base64,' + [Convert]::ToBase64String([IO.File]::ReadAllBytes($liviana)) }
  'data:' + $mime + ';base64,' + [Convert]::ToBase64String([IO.File]::ReadAllBytes((Join-Path $raiz "assets\$archivo")))
}

$html = Leer 'Index.html'
$config = "<script>`n// Dirección de la API en Apps Script (implementación web). Si cambia, reemplácela aquí.`n" +
  "window.API_URL = '" + $Api + "';`n" +
  "window.IMAGENES_LOCALES = { logo: '" + (DataUri 'insignia.jpg' 'image/jpeg') + "', portada: '" + (DataUri 'estudiantes.webp' 'image/webp') + "', colegio: '" + (DataUri 'colegio.webp' 'image/webp') + "' };`n</script>"
$html = $html.Replace("<?!= include('Styles') ?>", (Leer 'Styles.html'))
$html = $html.Replace("<?!= include('Ilustraciones') ?>", (Leer 'Ilustraciones.html'))
$html = $html.Replace("<?!= include('App') ?>", $config + "`n" + (Leer 'App.html'))
# Título solo en la cabecera (la primera aparición; App.html usa otra para imprimir).
$meta = '<meta charset="utf-8">'
$html = $html.Insert($html.IndexOf($meta) + $meta.Length, '<title>Mi Proyecto de Vida &middot; Colegio Marina de Chile</title>')
if ($html -match '<\?') { throw 'Quedaron etiquetas de Apps Script sin reemplazar.' }
[IO.File]::WriteAllText((Join-Path $raiz 'index.html'), $html, $utf8)
Write-Host ("Listo: index.html ({0:N0} KB) conectado a {1}" -f ((Get-Item (Join-Path $raiz 'index.html')).Length / 1KB), $Api)
