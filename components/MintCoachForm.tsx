'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { addToast } from '@/components/Toaster'
import { useWallet } from '@/components/WalletProvider'
import { mintCoach } from '@/lib/contracts'

export function MintCoachForm() {
  const [rules, setRules] = useState('')
  const [loading, setLoading] = useState(false)
  const { connected, account } = useWallet()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!connected || !account) {
      addToast('Please connect your wallet first', 'error')
      return
    }
    
    if (!rules.trim()) {
      addToast('Please enter trading rules', 'error')
      return
    }

    setLoading(true)
    
    try {
      const transactionHash = await mintCoach(account, rules)
      
      addToast(`Coach minted successfully! Transaction: ${transactionHash}`, 'success')
      setRules('')
    } catch (error) {
      console.error('Error minting coach:', error)
      addToast('Failed to mint coach. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-semibold mb-4">Mint New Coach</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="rules" className="block text-sm font-medium text-gray-700 mb-2">
            Trading Rules & Strategy
          </label>
          <textarea
            id="rules"
            value={rules}
            onChange={(e) => setRules(e.target.value)}
            placeholder="Enter your AI coach's trading rules and strategy..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            rows={4}
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Describe the trading strategy, risk management rules, and investment approach for your AI coach.
          </p>
        </div>
        
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Minting...' : 'Mint Coach'}
        </Button>
      </form>
    </div>
  )
}
