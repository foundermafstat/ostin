'use client'

import { useState } from 'react'
import { useWallet } from '@/components/WalletProvider'
import { useWallet as useAptosWallet } from '@aptos-labs/wallet-adapter-react'
import { Button } from '@/components/ui/Button'
import { addToast } from '@/components/Toaster'
import { initializeContract } from '@/lib/contracts'

export default function InitializePage() {
  const { connected, account } = useWallet()
  const { signAndSubmitTransaction } = useAptosWallet()
  const [loading, setLoading] = useState(false)

  const handleInitialize = async () => {
    if (!connected || !account) {
      addToast('Please connect your wallet first', 'error')
      return
    }

    console.log('handleInitialize - connected:', connected)
    console.log('handleInitialize - account:', account)
    console.log('handleInitialize - account.address:', account?.address)
    console.log('handleInitialize - signAndSubmitTransaction:', signAndSubmitTransaction)
    console.log('handleInitialize - signAndSubmitTransaction type:', typeof signAndSubmitTransaction)

    setLoading(true)
    
    try {
      const transactionHash = await initializeContract(account, signAndSubmitTransaction)
      
      addToast(`Contract initialized successfully! Transaction: ${transactionHash}`, 'success')
    } catch (error) {
      console.error('Error initializing contract:', error)
      addToast(`Failed to initialize contract: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  if (!connected) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Connect Your Wallet
        </h1>
        <p className="text-gray-600">
          Please connect your wallet to initialize the contract
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="bg-white rounded-lg border p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Initialize Contract
        </h1>
        
        <p className="text-gray-600 mb-6">
          This will initialize the Portfolio Coach contract on the Aptos testnet. 
          This only needs to be done once by the contract deployer.
        </p>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-yellow-800 mb-2">Important:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• This action requires gas fees</li>
            <li>• Only the contract deployer can initialize</li>
            <li>• This only needs to be done once</li>
          </ul>
        </div>

        <Button 
          onClick={handleInitialize} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Initializing...' : 'Initialize Contract'}
        </Button>
      </div>
    </div>
  )
}
