# Generate favicon.ico from src/assets/leaf.png using ImageMagick
# Usage: Open PowerShell in this folder and run: ./generate-favicon.ps1
# Requires ImageMagick installed and 'magick' available in PATH.

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
$projectRoot = Resolve-Path "$scriptRoot\.."
$src = Join-Path $projectRoot "src\assets\leaf.png"
$dest = Join-Path $projectRoot "favicon.ico"  # place at UI root so dev servers serve /favicon.ico

if (-Not (Test-Path $src)) {
    Write-Error "Source image not found: $src"
    exit 1
}

Write-Host "Generating favicon.ico from $src -> $dest"

# Generate multiple resolutions inside the .ico using ImageMagick's auto-resize feature
# This avoids PowerShell parsing issues and produces a multi-size .ico in one call.
$magick = "magick"
$define = "icon:auto-resize=64,32,16"

# Find ImageMagick executable
$magickCmd = $null
try {
    $magickCmd = (Get-Command magick -ErrorAction Stop).Source
} catch {
    $magickCmd = $null
}

if (-not $magickCmd) {
    Write-Error "ImageMagick 'magick' not found in PATH. Please install ImageMagick and ensure 'magick' is available in your PATH."
    Write-Host "Suggested installation (PowerShell / Windows):"
    Write-Host "  1) Using winget: winget install --id ImageMagick.ImageMagick -e"
    Write-Host "  2) Using Chocolatey: choco install imagemagick -y"
    Write-Host "Or download from: https://imagemagick.org/script/download.php"
    exit 3
}

Write-Host "Running: $magickCmd convert \"$src\" -define $define \"$dest\""
& $magickCmd convert "$src" -define $define "$dest"

if ($LASTEXITCODE -eq 0 -and (Test-Path $dest)) {
    Write-Host "favicon.ico created at: $dest"
    exit 0
} else {
    Write-Error "Failed to create favicon.ico. Ensure ImageMagick is installed and 'magick' is available in PATH."
    exit 2
}
