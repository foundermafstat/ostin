'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { addToast } from '@/components/Toaster'
import { useWallet } from '@/components/WalletProvider'
import { mintCoach } from '@/lib/contracts'

export function MintCoachForm() {
  const [rules, setRules] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const { connected, account, signAndSubmitTransaction } = useWallet()


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
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('🎯 MintCoachForm: Form submitted')
    
    if (!validateForm()) {
      console.log('❌ MintCoachForm: Form validation failed')
      return
    }

    console.log('✅ MintCoachForm: Form validation passed')
    setLoading(true)
    setErrors({})
    
    try {
      console.log('📋 MintCoachForm: Starting mint process...')
      console.log('  - connected:', connected)
      console.log('  - account:', account)
      console.log('  - account.address:', account?.address)
      console.log('  - rules:', rules.trim())
      console.log('  - signAndSubmitTransaction:', signAndSubmitTransaction)
      console.log('  - signAndSubmitTransaction type:', typeof signAndSubmitTransaction)
      
      if (!account) {
        console.error('❌ MintCoachForm: Account not available')
        throw new Error('Account is not available. Please reconnect your wallet.')
      }
      
      if (!account.address) {
        console.error('❌ MintCoachForm: Account address not available')
        throw new Error('Account address is not available. Please reconnect your wallet.')
      }
      
      if (!signAndSubmitTransaction) {
        console.error('❌ MintCoachForm: signAndSubmitTransaction not available')
        throw new Error('Wallet transaction function is not available. Please reconnect your wallet.')
      }
      
      console.log('🚀 MintCoachForm: Calling mintCoach function...')
      const result = await mintCoach(account.address, rules.trim(), signAndSubmitTransaction)
      
      console.log('🎉 MintCoachForm: Mint successful!')
      console.log('  - Result:', result)
      
      addToast(`Coach #${result.coachId} minted successfully! Transaction: ${result.hash}`, 'success')
      
      setRules('')
      
      // Refresh the page to show the new coach
      console.log('🔄 MintCoachForm: Scheduling page refresh...')
      setTimeout(() => {
        console.log('🔄 MintCoachForm: Refreshing page...')
        window.location.reload()
      }, 2000)
    } catch (error) {
      console.error('💥 MintCoachForm: Error occurred:')
      console.error('  - Error type:', typeof error)
      console.error('  - Error message:', error instanceof Error ? error.message : String(error))
      console.error('  - Error stack:', error instanceof Error ? error.stack : 'No stack trace')
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.log('📢 MintCoachForm: Showing error toast:', errorMessage)
      
      addToast(`Failed to mint coach: ${errorMessage}`, 'error')
      setErrors({ submit: errorMessage })
    } finally {
      console.log('🏁 MintCoachForm: Process completed, setting loading to false')
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border p-6 no-hover">
      <h3 className="text-lg font-semibold mb-4">Mint New Coach</h3>
      
      {/* Wallet Status */}
      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {connected ? 'Wallet Connected' : 'Wallet Not Connected'}
          </span>
        </div>
        {connected && account?.address && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">
            {account.address.toString().slice(0, 6)}...{account.address.toString().slice(-4)}
          </p>
        )}
      </div>
      
      {errors.wallet && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-600 dark:text-red-400">{errors.wallet}</p>
        </div>
      )}


      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="rules" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ${
              errors.rules ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
            }`}
            rows={4}
            required
          />
          <div className="mt-1 flex justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Describe the trading strategy, risk management rules, and investment approach for your AI coach.
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {rules.length}/1000
            </p>
          </div>
          
          {/* Example rules */}
          <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md">
            <p className="text-xs text-blue-800 dark:text-blue-200 font-medium mb-2">💡 Quick examples:</p>
            <div className="flex flex-wrap gap-2 mb-2">
              <button
                type="button"
                onClick={() => fillExample(0)}
                className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
              >
                Simple Strategy
              </button>
              <button
                type="button"
                onClick={() => fillExample(1)}
                className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
              >
                Advanced Strategy
              </button>
              <button
                type="button"
                onClick={() => fillExample(2)}
                className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
              >
                Conservative Strategy
              </button>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-300">
              Click any button above to fill the textarea with example rules
            </p>
          </div>
          {errors.rules && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.rules}</p>
          )}
        </div>
        
        {errors.submit && (
          <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
          </div>
        )}
        
        <Button 
          type="submit" 
          disabled={loading || !connected || !account?.address} 
          className="w-full"
        >
          {loading ? 'Minting...' : 'Mint Coach'}
        </Button>
      </form>
    </div>
  )
}
