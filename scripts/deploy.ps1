# Deploy Ostin Smart Contract to Aptos Testnet

Write-Host "🚀 Deploying Ostin Smart Contract to Aptos Testnet..." -ForegroundColor Green

# Navigate to move directory
Set-Location move

# Compile the contract
Write-Host "📦 Compiling contract..." -ForegroundColor Yellow
aptos move compile

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Compilation failed!" -ForegroundColor Red
    exit 1
}

# Publish the contract
Write-Host "📤 Publishing contract..." -ForegroundColor Yellow
aptos move publish --profile default

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Publication failed!" -ForegroundColor Red
    exit 1
}

# Get the deployed address
Write-Host "🔍 Getting deployed address..." -ForegroundColor Yellow
$deployedAddress = (aptos account list --profile default | Select-String "account_address" | Select-Object -First 1).Line.Split('"')[3]

if ([string]::IsNullOrEmpty($deployedAddress)) {
    Write-Host "❌ Could not get deployed address!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Contract deployed successfully!" -ForegroundColor Green
Write-Host "📍 Deployed address: $deployedAddress" -ForegroundColor Cyan

# Initialize the contract
Write-Host "🔧 Initializing contract..." -ForegroundColor Yellow
aptos move run --profile default --function-id ${deployedAddress}::portfolio_coach::initialize

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Initialization failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Contract initialized successfully!" -ForegroundColor Green

# Update .env file
Write-Host "📝 Updating environment variables..." -ForegroundColor Yellow
Set-Location ..

# Create .env file if it doesn't exist
if (!(Test-Path .env)) {
    Copy-Item env.example .env
}

# Update the contract address in .env
$envContent = Get-Content .env
$envContent = $envContent -replace "NEXT_PUBLIC_CONTRACT_ADDRESS=.*", "NEXT_PUBLIC_CONTRACT_ADDRESS=`"$deployedAddress`""
$envContent | Set-Content .env

Write-Host "✅ Environment variables updated!" -ForegroundColor Green
Write-Host ""
Write-Host "🎉 Deployment complete!" -ForegroundColor Green
Write-Host "📍 Contract address: $deployedAddress" -ForegroundColor Cyan
Write-Host "🔧 Please restart your development server: npm run dev" -ForegroundColor Yellow
