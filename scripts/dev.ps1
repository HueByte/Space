# Space Blog - Development Script (PowerShell)

Write-Host "Starting Space Blog in development mode..." -ForegroundColor Cyan

# Start API
Write-Host "Starting API..." -ForegroundColor Yellow
$apiJob = Start-Job -ScriptBlock {
    Set-Location "$using:PSScriptRoot\..\src\Api\Space.Api"
    dotnet run
}

# Wait for API to start
Start-Sleep -Seconds 5

# Start Client
Write-Host "Starting Client..." -ForegroundColor Yellow
$clientJob = Start-Job -ScriptBlock {
    Set-Location "$using:PSScriptRoot\..\src\Client"
    npm run dev
}

Write-Host ""
Write-Host "API running on http://localhost:5000" -ForegroundColor Green
Write-Host "Client running on http://localhost:5173" -ForegroundColor Green
Write-Host "Swagger UI available at http://localhost:5000/swagger" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop both services" -ForegroundColor Gray

try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
}
finally {
    Write-Host "`nStopping services..." -ForegroundColor Yellow
    Stop-Job $apiJob, $clientJob
    Remove-Job $apiJob, $clientJob
    Write-Host "Services stopped." -ForegroundColor Green
}
