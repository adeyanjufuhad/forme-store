$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$apiDirectory = Join-Path $projectRoot 'services/api'
$apiEnv = Join-Path $apiDirectory '.env'
$env:API_HOST = '127.0.0.1'
$env:WEB_ORIGIN = 'http://127.0.0.1:3000'
if (Test-Path $apiEnv) {
  Get-Content -LiteralPath $apiEnv | ForEach-Object {
    if ($_ -match '^([^#=]+)=(.*)$') { [Environment]::SetEnvironmentVariable($matches[1], $matches[2], 'Process') }
  }
} else {
  $env:DEMO_MODE = 'true'
  $env:PORT = '8080'
}
if (-not $env:PORT) { $env:PORT = '8080' }
$env:API_INTERNAL_URL = "http://127.0.0.1:$($env:PORT)"
$apiProcess = Start-Process -FilePath 'go' -ArgumentList @('run','./cmd/server') -WorkingDirectory $apiDirectory -WindowStyle Hidden -PassThru
try {
  Set-Location $projectRoot
  npm run dev
} finally {
  # Stop the process tree started by this launcher, including the compiled Go child.
  if (-not $apiProcess.HasExited) { taskkill /PID $apiProcess.Id /T /F | Out-Null }
}
