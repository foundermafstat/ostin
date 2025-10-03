'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@/components/WalletProvider'
import { Button } from '@/components/ui/Button'
import { Toaster } from '@/components/Toaster'
import { stakeTokens } from '@/lib/contracts'
import { useWallet as useAptosWallet } from '@aptos-labs/wallet-adapter-react'

interface StakeFormProps {
  coachId: number
  coachOwner: string
  currentStake?: number
  onSuccess?: () => void
}

export function StakeForm({ coachId, coachOwner, currentStake = 0, onSuccess }: StakeFormProps) {
  const { account, connected } = useWallet()
  const { signAndSubmitTransaction } = useAptosWallet()
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [balance, setBalance] = useState<string>('0')

  // Fetch user balance
  useEffect(() => {
    async function fetchBalance() {
      if (!account) return
      
      try {
        const response = await fetch(`/api/balance?address=${account.accountAddress}`)
        const data = await response.json()
        if (response.ok) {
          setBalance(data.formattedBalance)
        }
      } catch (error) {
        console.error('Error fetching balance:', error)
      }
    }

    fetchBalance()
  }, [account])

  const handleStake = async () => {
    if (!connected || !account || !signAndSubmitTransaction) {
      setError('Please connect your wallet first')
      return
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid stake amount')
      return
    }

    if (parseFloat(amount) > parseFloat(balance)) {
      setError('Insufficient balance. Please check your available APT tokens.')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Import aptosClient here to avoid circular imports
      const { aptosClient, CONTRACT_MODULE } = await import('@/lib/aptosClient')
      
      const stakeAmount = Math.floor(parseFloat(amount) * 100000000) // Convert to octas
      
      const transaction = await aptosClient.transaction.build.simple({
        sender: account.address,
        data: {
          function: `${CONTRACT_MODULE}::stake_tokens`,
          typeArguments: [],
          functionArguments: [coachId, stakeAmount],
        },
      })

      const committedTransaction = await signAndSubmitTransaction(transaction)

      setSuccess(`Successfully staked ${amount} APT! Transaction: ${committedTransaction.hash}`)
      setAmount('')
      
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error('Stake error:', error)
      setError(error instanceof Error ? error.message : 'Failed to stake tokens')
    } finally {
      setLoading(false)
    }
  }

  const isOwner = connected && account?.accountAddress === coachOwner
  const hasExistingStake = currentStake > 0

  if (!connected) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">
          Please connect your wallet to stake tokens on this coach.
        </p>
      </div>
    )
  }

  if (!isOwner) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800">
          Only the coach owner can stake tokens to activate it.
        </p>
        <p className="text-sm text-blue-600 mt-1">
          Owner: {coachOwner.slice(0, 6)}...{coachOwner.slice(-4)}
        </p>
      </div>
    )
  }

  if (hasExistingStake) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-green-800 font-medium">
          Coach is already active with {(currentStake / 100000000).toFixed(4)} APT staked.
        </p>
        <p className="text-sm text-green-600 mt-1">
          Additional staking is not currently supported.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Stake Tokens to Activate Coach</h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Stake Amount (APT)
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount to stake"
              min="0"
              step="0.001"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            />
            <p className="text-sm text-gray-500 mt-1">
              Minimum stake: 0.001 APT | Available: {balance} APT
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="font-medium text-blue-900 mb-2">What happens when you stake?</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Coach becomes active and can be scored</li>
              <li>• Tokens are locked until coach is deactivated</li>
              <li>• Coach becomes eligible for rewards based on performance</li>
              <li>• Coach appears in leaderboard rankings</li>
            </ul>
          </div>

          <Button
            onClick={handleStake}
            disabled={loading || !amount || parseFloat(amount) <= 0}
            className="w-full"
          >
            {loading ? 'Staking...' : `Stake ${amount || '0'} APT`}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">{success}</p>
        </div>
      )}

      <Toaster />
    </div>
  )
}
