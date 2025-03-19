# HTML File Analyzer - Creates a report of all HTML files in the front directory

# Base directory for analysis
$baseDir = ".\front"
$outputFile = "html_analysis_report.md"

# Clear existing report if it exists
if (Test-Path $outputFile) {
    Remove-Item $outputFile
}

# Create report header
"# HTML Files Analysis Report" | Out-File -FilePath $outputFile
"Generated on: $(Get-Date)" | Out-File -FilePath $outputFile -Append
"`n" | Out-File -FilePath $outputFile -Append

# Function to extract title from HTML
function Get-HtmlTitle {
    param (
        [string]$HtmlContent
    )
    
    if ($HtmlContent -match '<title>(.*?)</title>') {
        return $matches[1]
    }
    return "No Title Found"
}

# Function to extract meta description
function Get-MetaDescription {
    param (
        [string]$HtmlContent
    )
    
    if ($HtmlContent -match '<meta\s+name="description"\s+content="([^"]*)"') {
        return $matches[1]
    }
    
    return "No meta description found"
}

# Function to extract main content purpose
function Get-ContentPurpose {
    param (
        [string]$HtmlContent,
        [string]$FileName
    )
    
    $purpose = "Unknown purpose"
    
    # Check for common patterns to identify page purpose
    if ($FileName -match "index|home") {
        $purpose = "Main page/Landing page"
    }
    elseif ($FileName -match "login") {
        $purpose = "User login page"
    }
    elseif ($FileName -match "register|signup") {
        $purpose = "User registration page"
    }
    elseif ($FileName -match "dashboard") {
        $purpose = "User dashboard"
    }
    elseif ($FileName -match "profile") {
        $purpose = "User profile management"
    }
    elseif ($FileName -match "withdraw|payment") {
        $purpose = "Payment/Withdrawal functionality"
    }
    elseif ($FileName -match "drive") {
        $purpose = "Data drive functionality"
    }
    elseif ($HtmlContent -match '<form[^>]*>') {
        $purpose = "Form submission page"
    }
    
    # Look for h1 headings for additional clues
    if ($HtmlContent -match '<h1[^>]*>(.*?)</h1>') {
        $h1Content = $matches[1] -replace '<[^>]+>', '' # Remove any HTML tags inside h1
        $purpose += " (Main heading: $h1Content)"
    }
    
    return $purpose
}

# Function to extract JS and CSS dependencies
function Get-Dependencies {
    param (
        [string]$HtmlContent
    )
    
    $js = @()
    $css = @()
    
    # Extract JS files
    $jsMatches = [regex]::Matches($HtmlContent, '<script[^>]*\s+src="([^"]*)"')
    foreach ($match in $jsMatches) {
        $js += $match.Groups[1].Value
    }
    
    # Extract CSS files
    $cssMatches = [regex]::Matches($HtmlContent, '<link[^>]*\s+rel="stylesheet"[^>]*\s+href="([^"]*)"')
    foreach ($match in $cssMatches) {
        $css += $match.Groups[1].Value
    }
    
    return @{
        JS = $js
        CSS = $css
    }
}

# Function to identify forms
function Get-Forms {
    param (
        [string]$HtmlContent
    )
    
    $forms = @()
    $formMatches = [regex]::Matches($HtmlContent, '<form[^>]*\s+id="([^"]*)"')
    
    foreach ($match in $formMatches) {
        $formId = $match.Groups[1].Value
        $formAction = "Unknown"
        
        # Try to find the action attribute
        if ($HtmlContent -match "<form[^>]*\s+id=""$formId""[^>]*\s+action=""([^""]*)""") {
            $formAction = $matches[1]
        }
        
        $forms += @{
            ID = $formId
            Action = $formAction
        }
    }
    
    return $forms
}

# Function to get page structure information
function Get-PageStructure {
    param (
        [string]$HtmlContent
    )
    
    $structure = @()
    
    # Check for main structural elements
    $hasHeader = $HtmlContent -match '<header|class="[^"]*header|id="[^"]*header'
    $hasFooter = $HtmlContent -match '<footer|class="[^"]*footer|id="[^"]*footer'
    $hasNavbar = $HtmlContent -match '<nav|class="[^"]*nav|id="[^"]*nav'
    $hasSidebar = $HtmlContent -match 'class="[^"]*sidebar|id="[^"]*sidebar'
    $hasMain = $HtmlContent -match '<main|class="[^"]*main-content|id="[^"]*main'
    
    if ($hasHeader) { $structure += "Header section" }
    if ($hasNavbar) { $structure += "Navigation bar" }
    if ($hasSidebar) { $structure += "Sidebar" }
    if ($hasMain) { $structure += "Main content area" }
    if ($hasFooter) { $structure += "Footer section" }
    
    return $structure
}

# Get all HTML files
$htmlFiles = Get-ChildItem -Path $baseDir -Filter "*.html" -Recurse

"Found $($htmlFiles.Count) HTML files to analyze.`n" | Out-File -FilePath $outputFile -Append

# Process each file
foreach ($file in $htmlFiles) {
    $relativePath = $file.FullName.Replace("$((Get-Location).Path)\", "")
    $content = Get-Content -Path $file.FullName -Raw
    
    "## File: $relativePath" | Out-File -FilePath $outputFile -Append
    "- **Title**: $(Get-HtmlTitle -HtmlContent $content)" | Out-File -FilePath $outputFile -Append
    "- **Purpose**: $(Get-ContentPurpose -HtmlContent $content -FileName $file.BaseName)" | Out-File -FilePath $outputFile -Append
    "- **Meta Description**: $(Get-MetaDescription -HtmlContent $content)" | Out-File -FilePath $outputFile -Append
    
    # Add page structure
    $structure = Get-PageStructure -HtmlContent $content
    if ($structure.Count -gt 0) {
        "- **Page Structure**:" | Out-File -FilePath $outputFile -Append
        foreach ($item in $structure) {
            "  - $item" | Out-File -FilePath $outputFile -Append
        }
    }
    
    # Add forms information
    $forms = Get-Forms -HtmlContent $content
    if ($forms.Count -gt 0) {
        "- **Forms**:" | Out-File -FilePath $outputFile -Append
        foreach ($form in $forms) {
            "  - Form ID: $($form.ID), Action: $($form.Action)" | Out-File -FilePath $outputFile -Append
        }
    }
    
    # Add dependencies
    $dependencies = Get-Dependencies -HtmlContent $content
    if ($dependencies.JS.Count -gt 0) {
        "- **JavaScript Dependencies**:" | Out-File -FilePath $outputFile -Append
        foreach ($js in $dependencies.JS) {
            "  - $js" | Out-File -FilePath $outputFile -Append
        }
    }
    
    if ($dependencies.CSS.Count -gt 0) {
        "- **CSS Dependencies**:" | Out-File -FilePath $outputFile -Append
        foreach ($css in $dependencies.CSS) {
            "  - $css" | Out-File -FilePath $outputFile -Append
        }
    }
    
    "- **Last Modified**: $($file.LastWriteTime)`n" | Out-File -FilePath $outputFile -Append
    "`n---`n" | Out-File -FilePath $outputFile -Append
}

# Add summary
"## Summary" | Out-File -FilePath $outputFile -Append
"Total HTML files analyzed: $($htmlFiles.Count)" | Out-File -FilePath $outputFile -Append

Write-Host "Analysis complete! Report generated at $outputFile"
Write-Host "Run 'notepad $outputFile' to view the report"