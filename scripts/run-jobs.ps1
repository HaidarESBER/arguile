<#
.SYNOPSIS
  Runs the Nuage background jobs locally (Option A — no Vercel crons).

.DESCRIPTION
  These jobs cannot all run on Vercel (Playwright scraping won't launch
  serverless, and the Hobby plan caps crons). Instead this script runs them
  on your machine on a schedule. They write to the SAME Supabase database
  the live site reads from, so there is nothing to "upload" afterwards —
  results appear on the site automatically.

  What it does:
    1. Reads CRON_SECRET from .env.local
    2. Starts the Next.js app on a private port (3939)
    3. Calls each job endpoint with the bearer token
    4. Logs the JSON result to scripts/logs/
    5. Shuts the server down

  REQUIREMENTS in .env.local (production values, not placeholders):
    - NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY
    - CRON_SECRET            (any long random string; used to authorize the jobs)
    - SCRAPE_URLS            (comma-separated AliExpress product URLs to scrape)
    - OPENROUTER_API_KEY     (AI translation of products/reviews)
    - BREVO_API_KEY          (only needed if you run the email job)

.PARAMETER Jobs
  Which jobs to run. Default: scrape, curate, translate-reviews.
  Add 'email-campaigns' to also send the weekly marketing email.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File scripts\run-jobs.ps1
  powershell -ExecutionPolicy Bypass -File scripts\run-jobs.ps1 -Jobs scrape,curate
#>

param(
  [string[]] $Jobs = @("scrape", "curate", "translate-reviews")
)

# Normalize: `powershell -File ... -Jobs a,b,c` arrives as one string, while
# `-Jobs a,b` arrives as an array. Split on commas either way and flatten.
$Jobs = $Jobs | ForEach-Object { $_ -split ',' } | ForEach-Object { $_.Trim() } | Where-Object { $_ }

$ErrorActionPreference = "Stop"
# Use the standard dev port. Next.js 16 allows only one dev server per project,
# so if one is already running we reuse it instead of starting a second.
$port = 3000
$baseUrl = "http://localhost:$port"

# --- Locate project root (parent of this script's folder) -------------------
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

# --- Logging ----------------------------------------------------------------
$logDir = Join-Path $projectRoot "scripts\logs"
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir | Out-Null }
$logFile = Join-Path $logDir ("jobs-" + (Get-Date -Format "yyyy-MM-dd") + ".log")

function Log($msg) {
  $line = "[" + (Get-Date -Format "yyyy-MM-dd HH:mm:ss") + "] $msg"
  Write-Host $line
  Add-Content -Path $logFile -Value $line -Encoding utf8
}

# --- Read CRON_SECRET from .env.local ---------------------------------------
$envFile = Join-Path $projectRoot ".env.local"
if (-not (Test-Path $envFile)) {
  Log "ERROR: .env.local not found. Create it with production keys first."
  exit 1
}
$cronSecret = $null
foreach ($l in (Get-Content $envFile)) {
  if ($l -match '^\s*CRON_SECRET\s*=\s*(.+?)\s*$') { $cronSecret = $matches[1].Trim('"').Trim("'") }
}
if ([string]::IsNullOrWhiteSpace($cronSecret)) {
  Log "ERROR: CRON_SECRET is not set in .env.local."
  exit 1
}

Log "===== Job run starting (jobs: $($Jobs -join ', ')) ====="

# --- Reuse an existing server, or start one ---------------------------------
function Test-ServerUp {
  try {
    Invoke-WebRequest -Uri $baseUrl -UseBasicParsing -TimeoutSec 5 | Out-Null
    return $true
  } catch { return $false }
}

$server = $null
$startedByUs = $false

if (Test-ServerUp) {
  Log "Reusing the server already running on port $port."
} else {
  # Route through cmd.exe: npm is npm.cmd on Windows and Start-Process can't
  # launch it directly.
  Log "Starting app on port $port ..."
  $server = Start-Process -FilePath "cmd.exe" `
    -ArgumentList @("/c", "npm run dev -- -p $port") `
    -WorkingDirectory $projectRoot `
    -WindowStyle Hidden -PassThru
  $startedByUs = $true

  $ready = $false
  $deadline = (Get-Date).AddSeconds(120)
  while ((Get-Date) -lt $deadline) {
    Start-Sleep -Seconds 2
    if (Test-ServerUp) { $ready = $true; break }
  }
  if (-not $ready) {
    Log "ERROR: server did not become ready in time. Aborting."
    if ($server -and -not $server.HasExited) {
      try { taskkill /PID $server.Id /T /F | Out-Null } catch { }
    }
    exit 1
  }
  Log "Server is up."
}

# --- Run each job -----------------------------------------------------------
$headers = @{ Authorization = "Bearer $cronSecret" }
foreach ($job in $Jobs) {
  $url = "$baseUrl/api/cron/$job"
  Log "Running job: $job ..."
  try {
    # Scraping can take minutes; allow up to 10 min per job.
    $resp = Invoke-WebRequest -Uri $url -Headers $headers -Method GET `
      -UseBasicParsing -TimeoutSec 600
    Log "  $job OK ($($resp.StatusCode)): $($resp.Content)"
  } catch {
    $status = ""
    if ($_.Exception.Response) { $status = $_.Exception.Response.StatusCode.value__ }
    Log "  $job FAILED ($status): $($_.Exception.Message)"
  }
}

# --- Tear down --------------------------------------------------------------
# Only stop the server if WE started it (don't kill a dev server you're using).
if ($startedByUs -and $server -and -not $server.HasExited) {
  Log "Stopping server ..."
  try { taskkill /PID $server.Id /T /F | Out-Null } catch { }
} else {
  Log "Leaving the pre-existing server running."
}
Log "===== Job run finished ====="
