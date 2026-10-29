# Servidor estático mínimo para revisar dev/preview.html en http://localhost:8765/dev/preview.html
param([int]$Puerto = 8765)
$raiz = Split-Path -Parent $PSScriptRoot
$l = New-Object System.Net.HttpListener
$l.Prefixes.Add("http://localhost:$Puerto/")
$l.Start()
Write-Host "Sirviendo $raiz en http://localhost:$Puerto/"
$tipos = @{ '.html' = 'text/html; charset=utf-8'; '.js' = 'text/javascript'; '.css' = 'text/css'; '.jpg' = 'image/jpeg'; '.webp' = 'image/webp'; '.png' = 'image/png'; '.svg' = 'image/svg+xml' }
while ($l.IsListening) {
  $c = $l.GetContext()
  $ruta = [Uri]::UnescapeDataString($c.Request.Url.AbsolutePath.TrimStart('/'))
  if (-not $ruta) { $ruta = 'dev/preview.html' }
  $f = Join-Path $raiz $ruta
  if ((Test-Path $f -PathType Leaf) -and ([IO.Path]::GetFullPath($f)).StartsWith($raiz)) {
    $b = [IO.File]::ReadAllBytes($f)
    $ext = [IO.Path]::GetExtension($f).ToLower()
    $c.Response.ContentType = if ($tipos.ContainsKey($ext)) { $tipos[$ext] } else { 'application/octet-stream' }
    $c.Response.OutputStream.Write($b, 0, $b.Length)
  } else { $c.Response.StatusCode = 404 }
  $c.Response.Close()
}
