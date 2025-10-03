# Script to initialize the Portfolio Coach contract
# Run this script with: .\scripts\initialize-contract.ps1
# 
# Make sure you have:
# 1. Aptos CLI installed and configured
# 2. Your account funded with APT tokens
# 3. The contract already deployed

$CONTRACT_ADDRESS = if ($env:NEXT_PUBLIC_CONTRACT_ADDRESS) { $env:NEXT_PUBLIC_CONTRACT_ADDRESS } else { "0xb072ec1cffe2cf7888420e00bdcbef08eea61ce639924246218b3a3d84623217" }
$MODULE_NAME = "portfolio_coach"

Write-Host "🚀 Initializing Portfolio Coach Contract..." -ForegroundColor Green
Write-Host "Contract Address: $CONTRACT_ADDRESS" -ForegroundColor Yellow
Write-Host "Module: $MODULE_NAME" -ForegroundColor Yellow

try {
    # Check if contract is already initialized
    Write-Host "`n📋 Checking if contract is already initialized..." -ForegroundColor Cyan
    
    try {
        $checkCommand = "aptos account list --account $CONTRACT_ADDRESS --query resources"
        Invoke-Expression $checkCommand | Out-Null
        Write-Host "✅ Contract appears to be initialized" -ForegroundColor Green
        exit 0
    } catch {
        Write-Host "ℹ️  Contract not initialized, proceeding with initialization..." -ForegroundColor Yellow
    }

    # Initialize the contract
    Write-Host "`n🔧 Initializing contract..." -ForegroundColor Cyan
    
    $initCommand = "aptos move run --function-id ${CONTRACT_ADDRESS}::${MODULE_NAME}::initialize"
    
    Write-Host "Running: $initCommand" -ForegroundColor Gray
    
    Set-Location -Path (Join-Path $PSScriptRoot ".." "move")
    Invoke-Expression $initCommand
    
    Write-Host "`n✅ Contract initialized successfully!" -ForegroundColor Green
    Write-Host "🎉 You can now mint coaches on the dashboard" -ForegroundColor Green
    
} catch {
    Write-Host "`n❌ Error initializing contract:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Message -like "*already_exists*") {
        Write-Host "`n💡 The contract is already initialized. You can proceed to use the application." -ForegroundColor Yellow
    } elseif ($_.Exception.Message -like "*insufficient balance*") {
        Write-Host "`n💡 Make sure your account has enough APT tokens for the transaction." -ForegroundColor Yellow
    } elseif ($_.Exception.Message -like "*not found*") {
        Write-Host "`n💡 Make sure the contract is deployed and the address is correct." -ForegroundColor Yellow
    }
    
    exit 1
}
