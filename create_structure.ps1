# Create Project Directory Structure for Digistore Affiliate Program

# Base directory - assuming script is run from project root
$baseDir = "."

# Main directories
$dirs = @(
    "frontend",
    "frontend\assets",
    "frontend\assets\css",
    "frontend\assets\js",
    "frontend\assets\js\services",
    "frontend\assets\js\components",
    "frontend\assets\js\utils",
    "frontend\assets\images",
    "frontend\pages",
    "frontend\templates",
    
    "admin",
    "admin\assets",
    "admin\assets\css",
    "admin\assets\js",
    "admin\assets\js\services",
    "admin\assets\js\modules",
    "admin\assets\images",
    "admin\pages",
    "admin\templates",
    
    "server",
    "server\config",
    "server\controllers",
    "server\models",
    "server\routes",
    "server\services",
    "server\middleware",
    "server\utils",
    "server\migrations",
    "server\seeds",
    
    "public",
    
    "docs",
    "docs\api",
    "docs\guides"
)

# Create directories
foreach ($dir in $dirs) {
    $path = Join-Path -Path $baseDir -ChildPath $dir
    if (!(Test-Path -Path $path)) {
        Write-Host "Creating directory: $path"
        New-Item -ItemType Directory -Path $path -Force | Out-Null
    } else {
        Write-Host "Directory already exists: $path"
    }
}

# Create placeholder files to preserve directory structure
$placeholderFiles = @(
    "frontend\pages\.gitkeep",
    "frontend\assets\css\.gitkeep",
    "frontend\assets\js\.gitkeep",
    "frontend\assets\images\.gitkeep",
    "frontend\templates\.gitkeep",
    
    "admin\pages\.gitkeep",
    "admin\assets\css\.gitkeep",
    "admin\assets\js\.gitkeep",
    "admin\assets\images\.gitkeep",
    "admin\templates\.gitkeep",
    
    "server\config\.gitkeep",
    "server\controllers\.gitkeep",
    "server\models\.gitkeep",
    "server\routes\.gitkeep",
    "server\services\.gitkeep",
    "server\middleware\.gitkeep",
    "server\utils\.gitkeep",
    "server\migrations\.gitkeep",
    "server\seeds\.gitkeep",
    
    "public\.gitkeep",
    "docs\api\.gitkeep",
    "docs\guides\.gitkeep"
)

foreach ($file in $placeholderFiles) {
    $path = Join-Path -Path $baseDir -ChildPath $file
    if (!(Test-Path -Path $path)) {
        Write-Host "Creating placeholder: $path"
        New-Item -ItemType File -Path $path -Force | Out-Null
    }
}

# Handle existing files that need to be moved
$filesToMove = @{
    "front\index.html" = "frontend\pages\index.html"
    "admin\login.html" = "admin\pages\login.html"
    # Add other files that need to be moved here
}

foreach ($source in $filesToMove.Keys) {
    $sourcePath = Join-Path -Path $baseDir -ChildPath $source
    $destPath = Join-Path -Path $baseDir -ChildPath $filesToMove[$source]
    
    if (Test-Path -Path $sourcePath) {
        $destDir = Split-Path -Path $destPath -Parent
        if (!(Test-Path -Path $destDir)) {
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        }
        
        if (!(Test-Path -Path $destPath)) {
            Write-Host "Moving file: $sourcePath -> $destPath"
            Move-Item -Path $sourcePath -Destination $destPath
        } else {
            Write-Host "Destination file already exists: $destPath"
        }
    } else {
        Write-Host "Source file not found: $sourcePath"
    }
}

Write-Host "`nDirectory structure created successfully."
Write-Host "Next steps:"
Write-Host "1. Update existing file references to match new paths"
Write-Host "2. Begin implementing core server files"
Write-Host "3. Set up database models as outlined in roadmap.md"