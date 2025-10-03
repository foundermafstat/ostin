#!/usr/bin/env node

/**
 * Script to initialize the Portfolio Coach contract
 * Run this script with: node scripts/initialize-contract.js
 * 
 * Make sure you have:
 * 1. Aptos CLI installed and configured
 * 2. Your account funded with APT tokens
 * 3. The contract already deployed
 */

const { execSync } = require('child_process');
const path = require('path');

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0xb072ec1cffe2cf7888420e00bdcbef08eea61ce639924246218b3a3d84623217';
const MODULE_NAME = 'portfolio_coach';

console.log('🚀 Initializing Portfolio Coach Contract...');
console.log(`Contract Address: ${CONTRACT_ADDRESS}`);
console.log(`Module: ${MODULE_NAME}`);

try {
  // Check if contract is already initialized
  console.log('\n📋 Checking if contract is already initialized...');
  
  try {
    const checkCommand = `aptos account list --account ${CONTRACT_ADDRESS} --query resources`;
    execSync(checkCommand, { stdio: 'pipe' });
    console.log('✅ Contract appears to be initialized');
    process.exit(0);
  } catch (error) {
    console.log('ℹ️  Contract not initialized, proceeding with initialization...');
  }

  // Initialize the contract
  console.log('\n🔧 Initializing contract...');
  
  const initCommand = `aptos move run --function-id ${CONTRACT_ADDRESS}::${MODULE_NAME}::initialize`;
  
  console.log(`Running: ${initCommand}`);
  
  const result = execSync(initCommand, { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..', 'move')
  });
  
  console.log('\n✅ Contract initialized successfully!');
  console.log('🎉 You can now mint coaches on the dashboard');
  
} catch (error) {
  console.error('\n❌ Error initializing contract:');
  console.error(error.message);
  
  if (error.message.includes('already_exists')) {
    console.log('\n💡 The contract is already initialized. You can proceed to use the application.');
  } else if (error.message.includes('insufficient balance')) {
    console.log('\n💡 Make sure your account has enough APT tokens for the transaction.');
  } else if (error.message.includes('not found')) {
    console.log('\n💡 Make sure the contract is deployed and the address is correct.');
  }
  
  process.exit(1);
}
