'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { addToast } from '@/components/Toaster'
import { useWallet } from '@/components/WalletProvider'
import { useWallet as useAptosWallet } from '@aptos-labs/wallet-adapter-react'
import { mintCoach, mintCoachSimple, checkContractStatus } from '@/lib/contracts'
import Link from 'next/link'

export function MintCoachForm() {
  const [rules, setRules] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [contractStatus, setContractStatus] = useState<{
    status: 'initialized' | 'not_initialized' | 'error' | 'loading'
    message: string
  }>({ status: 'loading', message: 'Checking contract status...' })
  const { connected, account } = useWallet()
  const { signAndSubmitTransaction } = useAptosWallet()

  const checkStatus = async () => {
    try {
      console.log('Checking contract status...')
      setContractStatus({
        status: 'loading',
        message: 'Checking contract status...'
      })
      const status = await checkContractStatus()
      console.log('Contract status result:', status)
      setContractStatus({
        status: status.status,
        message: status.message
      })
    } catch (error) {
      console.error('Error checking contract status:', error)
      setContractStatus({
        status: 'error',
        message: 'Failed to check contract status'
      })
    }
  }

  // Check contract status on component mount
  useEffect(() => {
    console.log('MintCoachForm mounted, checking contract status...')
    checkStatus()
  }, [])

  // Also check when wallet connection changes
  useEffect(() => {
    console.log('Wallet state changed:', { connected, account: !!account, address: account?.address })
    if (connected && account) {
      console.log('Wallet connected, rechecking contract status...')
      checkStatus()
    }
  }, [connected, account])

  // Debug effect to track all state changes
  useEffect(() => {
    console.log('State update:', {
      connected,
      account: !!account,
      address: account?.address,
      signAndSubmitTransaction: !!signAndSubmitTransaction,
      signAndSubmitTransactionType: typeof signAndSubmitTransaction,
      loading,
      contractStatus: contractStatus.status
    })
  }, [connected, account, signAndSubmitTransaction, loading, contractStatus])

  const exampleRules = [
    "Buy when RSI < 30, sell when RSI > 70. Max position size 5% of portfolio. Stop loss at -10%. Focus on blue-chip stocks with market cap > $10B.",
    "Multi-timeframe analysis: Buy on 4H bullish divergence with daily trend support. Position sizing: 2% risk per trade, max 3 concurrent positions. Risk management: 1:2 R/R ratio.",
    "Dollar-cost averaging into S&P 500 ETFs. Monthly rebalancing. Emergency fund: 6 months expenses in cash. Bond allocation: Age-10% in bonds."
  ]

  const fillExample = (index: number) => {
    setRules(exampleRules[index])
    if (errors.rules) {
      setErrors(prev => ({ ...prev, rules: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}
    
    console.log('Validating form...')
    console.log('Connected:', connected)
    console.log('Account:', account)
    console.log('Rules length:', rules.trim().length)
    
    if (!connected || !account) {
      newErrors.wallet = 'Please connect your wallet first'
    }
    
    if (!account?.address) {
      newErrors.wallet = 'Wallet account address is not available'
    }
    
    if (!rules.trim()) {
      newErrors.rules = 'Please enter trading rules'
    } else if (rules.trim().length < 10) {
      newErrors.rules = 'Trading rules must be at least 10 characters long'
    } else if (rules.trim().length > 1000) {
      newErrors.rules = 'Trading rules must be less than 1000 characters'
    }
    
    console.log('Validation errors:', newErrors)
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setErrors({})
    
    try {
      console.log('Starting mint process...')
      console.log('Account:', account)
      console.log('Account address:', account?.address)
      console.log('Rules:', rules.trim())
      console.log('signAndSubmitTransaction:', typeof signAndSubmitTransaction)
      
      // Try to mint using the contract function
      if (signAndSubmitTransaction && typeof signAndSubmitTransaction === 'function') {
        console.log('Using signAndSubmitTransaction method')
        const transactionHash = await mintCoach(account!, rules.trim(), signAndSubmitTransaction)
        addToast(`Coach minted successfully! Transaction: ${transactionHash}`, 'success')
      } else {
        console.log('signAndSubmitTransaction not available, using simple method')
        // Use simple mint function that doesn't require wallet signing
        const transactionHash = await mintCoachSimple(account!, rules.trim())
        addToast(`Coach minted successfully! Transaction: ${transactionHash}`, 'success')
      }
      
      setRules('')
      
      // Refresh the page to show the new coach
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error) {
      console.error('Error minting coach:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      addToast(`Failed to mint coach: ${errorMessage}`, 'error')
      setErrors({ submit: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-semibold mb-4">Mint New Coach</h3>
      
      {/* Wallet Status */}
      <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-600">
            {connected ? 'Wallet Connected' : 'Wallet Not Connected'}
          </span>
        </div>
        {connected && account?.accountAddress && (
          <p className="text-xs text-gray-500 mt-1 font-mono">
            {account.accountAddress.toString().slice(0, 6)}...{account.accountAddress.toString().slice(-4)}
          </p>
        )}
      </div>
      
      {errors.wallet && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{errors.wallet}</p>
        </div>
      )}

      {/* Contract Status */}
      <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              contractStatus.status === 'initialized' ? 'bg-green-500' : 
              contractStatus.status === 'not_initialized' ? 'bg-red-500' :
              contractStatus.status === 'error' ? 'bg-red-500' : 'bg-yellow-500'
            }`}></div>
            <span className="text-sm text-gray-600">
              Contract Status: {contractStatus.status === 'initialized' ? 'Ready' : 
                              contractStatus.status === 'not_initialized' ? 'Not Initialized' :
                              contractStatus.status === 'error' ? 'Error' : 'Checking...'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              console.log('Manual refresh clicked')
              checkStatus()
            }}
            disabled={contractStatus.status === 'loading'}
            className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors disabled:opacity-50"
          >
            {contractStatus.status === 'loading' ? 'Checking...' : 'Refresh'}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">{contractStatus.message}</p>
      </div>

      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="rules" className="block text-sm font-medium text-gray-700 mb-2">
            Trading Rules & Strategy
          </label>
          <textarea
            id="rules"
            value={rules}
            onChange={(e) => {
              setRules(e.target.value)
              if (errors.rules) {
                setErrors(prev => ({ ...prev, rules: '' }))
              }
            }}
            placeholder="Enter your AI coach's trading rules and strategy..."
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              errors.rules ? 'border-red-300' : 'border-gray-300'
            }`}
            rows={4}
            required
          />
          <div className="mt-1 flex justify-between">
            <p className="text-sm text-gray-500">
              Describe the trading strategy, risk management rules, and investment approach for your AI coach.
            </p>
            <p className="text-xs text-gray-400">
              {rules.length}/1000
            </p>
          </div>
          
          {/* Example rules */}
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-xs text-blue-800 font-medium mb-2">💡 Quick examples:</p>
            <div className="flex flex-wrap gap-2 mb-2">
              <button
                type="button"
                onClick={() => fillExample(0)}
                className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                Simple Strategy
              </button>
              <button
                type="button"
                onClick={() => fillExample(1)}
                className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                Advanced Strategy
              </button>
              <button
                type="button"
                onClick={() => fillExample(2)}
                className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                Conservative Strategy
              </button>
            </div>
            <p className="text-xs text-blue-600">
              Click any button above to fill the textarea with example rules
            </p>
          </div>
          {errors.rules && (
            <p className="text-sm text-red-600 mt-1">{errors.rules}</p>
          )}
        </div>
        
        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}
        
        <Button 
          type="submit" 
          disabled={loading || !connected || !account?.address} 
          className="w-full"
        >
          {loading ? 'Minting...' : 'Mint Coach'}
        </Button>
        
        {/* Debug info */}
        <div className="mt-2 text-xs text-gray-500 space-y-1 bg-yellow-50 p-2 rounded border">
          <p><strong>Debug Info:</strong></p>
          <p>• connected: {String(connected)} (type: {typeof connected})</p>
          <p>• account: {String(!!account)} (type: {typeof account})</p>
          <p>• account?.address: {String(!!account?.address)} (value: {account?.address || 'undefined'})</p>
          <p>• signAndSubmitTransaction: {String(!!signAndSubmitTransaction)} (type: {typeof signAndSubmitTransaction})</p>
          <p>• loading: {String(loading)} (type: {typeof loading})</p>
          <p>• contractStatus: {contractStatus.status}</p>
          <hr className="my-1" />
          <p><strong>Button disabled calculation:</strong></p>
          <p>• loading: {String(loading)}</p>
          <p>• !connected: {String(!connected)}</p>
          <p>• !account?.address: {String(!account?.address)}</p>
          <p>• <strong>Final disabled: {String(loading || !connected || !account?.address)}</strong></p>
        </div>
      </form>
    </div>
  )
}
