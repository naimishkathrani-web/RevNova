# Script to add sidebar navigation to Phase 2-5 requirements pages

$sidebarHTML = @'
  <header>
    <div class="container header-container">
      <div class="nav-left">
        <a href="../index.html" class="logo"><div class="logo-box">RevNova</div></a>
        <nav class="main-nav">
          <ul>
            <li><a href="../about-revnova.html">About RevNova</a></li>
            <li><a href="../features.html">Features</a></li>
            <li><a href="../pricing.html">Pricing</a></li>
            <li><a href="requirements-home.html" class="active">RevNova Requirements</a></li>
            <li><a href="../contact.html">Contact</a></li>
          </ul>
        </nav>
      </div>
      <div class="header-right">
        <div class="country-selector"><span class="fi fi-us"></span></div>
        <a href="../login.html" class="btn btn-login">Login</a>
      </div>
    </div>
  </header>

  <div class="requirements-layout">
    <aside class="sidebar">
      <h3>Platform Vision</h3>
      <ul>
        <li><a href="requirements-home.html">RevNova Vision & Strategy</a></li>
        <li><a href="business-requirements.html">High Level Business Requirements</a></li>
        <li><a href="high-level-functional.html">High Level Functional Design</a></li>
        <li><a href="requirements-mapping.html">Complete Field Mapping</a></li>
      </ul>
      <h3>Phase 1 - Product Catalog (WS1)</h3>
      <ul>
        <li><a href="#">Phase 1 Requirements</a>
          <ul>
            <li><a href="requirements-phase1-functional.html">Functional Requirements</a></li>
            <li><a href="requirements-phase1-technical.html">Technical Requirements</a></li>
          </ul>
        </li>
      </ul>
      <h3>Phase 2 - Quotes & Pricing (WS2)</h3>
      <ul>
        <li><a href="#">Phase 2 Requirements</a>
          <ul>
            <li><a href="requirements-phase2-functional.html">Functional Requirements</a></li>
            <li><a href="requirements-phase2-technical.html">Technical Requirements</a></li>
          </ul>
        </li>
      </ul>
      <h3>Phase 3 - Contracts & Assets (WS3)</h3>
      <ul>
        <li><a href="#">Phase 3 Requirements</a>
          <ul>
            <li><a href="requirements-phase3-functional.html">Functional Requirements</a></li>
            <li><a href="requirements-phase3-technical.html">Technical Requirements</a></li>
          </ul>
        </li>
      </ul>
      <h3>Phase 4 - Billing & Invoicing (WS4)</h3>
      <ul>
        <li><a href="#">Phase 4 Requirements</a>
          <ul>
            <li><a href="requirements-phase4-functional.html">Functional Requirements</a></li>
            <li><a href="requirements-phase4-technical.html">Technical Requirements</a></li>
          </ul>
        </li>
      </ul>
      <h3>Phase 5 - Revenue Cloud Advanced (WS5)</h3>
      <ul>
        <li><a href="#">Phase 5 Requirements</a>
          <ul>
            <li><a href="requirements-phase5-functional.html">Functional Requirements</a></li>
            <li><a href="requirements-phase5-technical.html">Technical Requirements</a></li>
          </ul>
        </li>
      </ul>
    </aside>

    <main class="main-content">
'@

$styleCSS = @'
    .requirements-layout{display:flex;min-height:calc(100vh - 80px);margin-top:80px}
    .sidebar{width:280px;background:#f8f9fa;border-right:1px solid #e0e0e0;padding:2rem 0;position:fixed;height:calc(100vh - 80px);overflow-y:auto}
    .sidebar h3{padding:0 1.5rem;font-size:0.85rem;color:#666;text-transform:uppercase;letter-spacing:0.5px;margin:1.5rem 0 0.5rem}
    .sidebar h3:first-child{margin-top:0}
    .sidebar ul{list-style:none;padding:0;margin:0}
    .sidebar ul li a{display:block;padding:0.6rem 1.5rem;color:#333;text-decoration:none;font-size:0.95rem;transition:all 0.2s}
    .sidebar ul li a:hover{background:#e9ecef;color:#11998e}
    .sidebar ul li a.active{background:#11998e;color:#fff;font-weight:500}
    .sidebar ul ul{padding-left:0}
    .sidebar ul ul li a{padding-left:2.5rem;font-size:0.9rem}
    .main-content{flex:1;margin-left:280px;padding:3rem;background:#fff}
    @media (max-width:768px){.sidebar{position:relative;width:100%;height:auto}.main-content{margin-left:0}.requirements-layout{flex-direction:column}}
'@

$footer = @'
    </main>
  </div>

  <footer style="background:#2c3e50;color:#ecf0f1;padding:2rem 0;text-align:center;margin-top:3rem">
    <div class="container"><p>&copy; 2025 RevNova. System Transformation as a Service.</p></div>
  </footer>
'@

$files = @(
    "requirements-phase2-functional.html",
    "requirements-phase2-technical.html",
    "requirements-phase3-functional.html",
    "requirements-phase3-technical.html",
    "requirements-phase4-functional.html",
    "requirements-phase4-technical.html",
    "requirements-phase5-functional.html",
    "requirements-phase5-technical.html"
)

$basePath = "c:\Dev\RevNovaRepository\docs\RevNovaRequirements"

foreach ($file in $files) {
    $filePath = Join-Path $basePath $file
    Write-Host "Processing $file..." -ForegroundColor Green
    
    # Read the content
    $content = Get-Content $filePath -Raw
    
    # Add responsive CSS to existing <style> block
    $content = $content -replace '(<style>)', "`$1`n$styleCSS"
    
    # Replace <body> with header + sidebar structure
    $content = $content -replace '<body>\s*<div class="container">', "<body>`n$sidebarHTML"
    
    # Replace closing </div></body> with proper footer
    $content = $content -replace '</div>\s*</body>', "$footer`n</body>"
    
    # Write back
    Set-Content $filePath $content -NoNewline
    
    Write-Host "  ✓ Updated $file" -ForegroundColor Cyan
}

Write-Host "`n✓ All files updated successfully!" -ForegroundColor Green
