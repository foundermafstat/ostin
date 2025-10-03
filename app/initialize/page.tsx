'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@/components/WalletProvider'
import { Button } from '@/components/ui/Button'
import { addToast } from '@/components/Toaster'
import { checkContractStatus } from '@/lib/contracts'
import { Logo } from '@/components/Logo'

interface ContractStatus {
  status: 'initialized' | 'not_initialized' | 'error' | 'loading'
  message: string
  address: string
  error?: string
}

export default function InitializePage() {
  const { connected, account } = useWallet()
  const [loading, setLoading] = useState(false)
  const [contractStatus, setContractStatus] = useState<ContractStatus>({
    status: 'loading',
    message: 'Checking contract status...',
    address: ''
  })

  const checkStatus = async () => {
    setLoading(true)
    setContractStatus({
      status: 'loading',
      message: 'Checking contract status...',
      address: ''
    })
    
    try {
      const status = await checkContractStatus()
      setContractStatus(status)
      
      if (status.status === 'initialized') {
        addToast('Contract is ready to use!', 'success')
      } else if (status.status === 'not_initialized') {
        addToast('Contract is not initialized. Contact the deployer to initialize it.', 'warning')
      } else {
        addToast(`Contract error: ${status.message}`, 'error')
      }
    } catch (error) {
      console.error('Error checking contract status:', error)
      setContractStatus({
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        address: ''
      })
      addToast(`Failed to check contract: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkStatus()
  }, [])

  if (!connected) {
    return (
      <div className="text-center py-12">
        <div className="mb-8">
          <Logo size="lg" className="mx-auto" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Connect Your Wallet
        </h1>
        <p className="text-gray-600">
          Please connect your wallet to check the contract status
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="bg-white rounded-lg border p-8">
        <div className="text-center mb-8">
          <Logo size="md" className="mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">
            Contract Status
          </h1>
        </div>
        
        <p className="text-gray-600 mb-6">
          This page shows the current status of the Portfolio Coach contract on Aptos testnet.
        </p>

        {/* Contract Status Display */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Contract Status</h3>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              contractStatus.status === 'initialized' ? 'bg-green-100 text-green-800' :
              contractStatus.status === 'not_initialized' ? 'bg-yellow-100 text-yellow-800' :
              contractStatus.status === 'error' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {contractStatus.status === 'initialized' ? 'Ready' :
               contractStatus.status === 'not_initialized' ? 'Not Initialized' :
               contractStatus.status === 'error' ? 'Error' : 'Checking...'}
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Address:</span>
              <span className="font-mono text-xs">
                {contractStatus.address ? 
                  `${contractStatus.address.slice(0, 6)}...${contractStatus.address.slice(-4)}` : 
                  'Loading...'
                }
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Network:</span>
              <span>Aptos Testnet</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={contractStatus.status === 'initialized' ? 'text-green-600' : 
                             contractStatus.status === 'not_initialized' ? 'text-yellow-600' :
                             contractStatus.status === 'error' ? 'text-red-600' : 'text-gray-600'}>
                {contractStatus.message}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button 
            onClick={checkStatus} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Checking Status...' : 'Refresh Status'}
          </Button>
          
          {contractStatus.status === 'initialized' && (
            <div className="text-center">
              <p className="text-green-600 text-sm mb-2">✅ Contract is ready to use!</p>
              <a 
                href="/dashboard" 
                className="text-blue-600 hover:text-blue-800 underline text-sm"
              >
                Go to Dashboard →
              </a>
            </div>
          )}
          
          {contractStatus.status === 'not_initialized' && (
            <div className="text-center">
              <p className="text-yellow-600 text-sm mb-2">⚠️ Contract needs to be initialized by the deployer</p>
              <p className="text-gray-500 text-xs">
                Contact the contract deployer to initialize the contract before you can mint coaches.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
