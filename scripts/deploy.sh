#!/bin/bash

echo "🚀 Deploying Ostin Smart Contract to Aptos Testnet..."

# Navigate to move directory
cd move

# Compile the contract
echo "📦 Compiling contract..."
aptos move compile

if [ $? -ne 0 ]; then
    echo "❌ Compilation failed!"
    exit 1
fi

# Publish the contract
echo "📤 Publishing contract..."
aptos move publish --profile default

if [ $? -ne 0 ]; then
    echo "❌ Publication failed!"
    exit 1
fi

# Get the deployed address
echo "🔍 Getting deployed address..."
DEPLOYED_ADDRESS=$(aptos account list --profile default | grep "account_address" | head -1 | cut -d'"' -f4)

if [ -z "$DEPLOYED_ADDRESS" ]; then
    echo "❌ Could not get deployed address!"
    exit 1
fi

echo "✅ Contract deployed successfully!"
echo "📍 Deployed address: $DEPLOYED_ADDRESS"

# Initialize the contract
echo "🔧 Initializing contract..."
aptos move run --profile default --function-id ${DEPLOYED_ADDRESS}::portfolio_coach::initialize

if [ $? -ne 0 ]; then
    echo "❌ Initialization failed!"
    exit 1
fi

echo "✅ Contract initialized successfully!"

# Update .env file
echo "📝 Updating environment variables..."
cd ..

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    cp env.example .env
fi

# Update the contract address in .env
sed -i "s/NEXT_PUBLIC_CONTRACT_ADDRESS=.*/NEXT_PUBLIC_CONTRACT_ADDRESS=\"$DEPLOYED_ADDRESS\"/" .env

echo "✅ Environment variables updated!"
echo ""
echo "🎉 Deployment complete!"
echo "📍 Contract address: $DEPLOYED_ADDRESS"
echo "🔧 Please restart your development server: npm run dev"
