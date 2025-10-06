'use client'

import { useState } from 'react'
import { Coach, stakeTokens, claimRewards } from '@/lib/contracts'
import { formatAddress, formatPercentage } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { useWallet } from '@/components/WalletProvider'
import { addToast } from '@/components/Toaster'
import Link from 'next/link'

interface CoachCardProps {
  coach: Coach
}

export function CoachCard({ coach }: CoachCardProps) {
  const [stakingAmount, setStakingAmount] = useState('')
  const [stakingLoading, setStakingLoading] = useState(false)
  const [claimingLoading, setClaimingLoading] = useState(false)
  const { connected, account, signAndSubmitTransaction } = useWallet()

  const handleStake = async () => {
    if (!connected || !account) {
      addToast('Please connect your wallet first', 'error')
      return
    }

    if (!signAndSubmitTransaction) {
      addToast('Wallet transaction function is not available. Please reconnect your wallet.', 'error')
      return
    }

    if (!stakingAmount || parseFloat(stakingAmount) <= 0) {
      addToast('Please enter a valid staking amount', 'error')
      return
    }

    setStakingLoading(true)
    
    try {
      console.log('CoachCard - signAndSubmitTransaction:', signAndSubmitTransaction)
      console.log('CoachCard - signAndSubmitTransaction type:', typeof signAndSubmitTransaction)
      
      if (!signAndSubmitTransaction) {
        throw new Error('Wallet transaction function is not available. Please reconnect your wallet.')
      }
      
      if (typeof signAndSubmitTransaction !== 'function') {
        throw new Error('Wallet transaction function is invalid. Please reconnect your wallet.')
      }
      
      const amount = parseFloat(stakingAmount) * 100000000 // Convert APT to octas (1 APT = 10^8 octas)
      const result = await stakeTokens(account.address, coach.id, amount, signAndSubmitTransaction)
      addToast(`Tokens staked successfully for Coach #${result.coachId}! Transaction: ${result.hash}`, 'success')
      setStakingAmount('')
    } catch (error) {
      console.error('Error staking tokens:', error)
      addToast('Failed to stake tokens. Please try again.', 'error')
    } finally {
      setStakingLoading(false)
    }
  }

  const handleClaimRewards = async () => {
    if (!connected || !account) {
      addToast('Please connect your wallet first', 'error')
      return
    }

    console.log('CoachCard claimRewards - signAndSubmitTransaction:', signAndSubmitTransaction)
    console.log('CoachCard claimRewards - signAndSubmitTransaction type:', typeof signAndSubmitTransaction)

    if (!signAndSubmitTransaction) {
      addToast('Wallet transaction function is not available. Please reconnect your wallet.', 'error')
      return
    }
    
    if (typeof signAndSubmitTransaction !== 'function') {
      addToast('Wallet transaction function is invalid. Please reconnect your wallet.', 'error')
      return
    }

    setClaimingLoading(true)
    
    try {
      const transactionHash = await claimRewards(account, coach.id, signAndSubmitTransaction)
      addToast(`Rewards claimed successfully! Transaction: ${transactionHash}`, 'success')
    } catch (error) {
      console.error('Error claiming rewards:', error)
      addToast('Failed to claim rewards. Please try again.', 'error')
    } finally {
      setClaimingLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">Coach #{coach.id}</h3>
          <p className="text-sm text-gray-500">
            Owner: {formatAddress(coach.owner)}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${coach.active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          <span className="text-sm text-gray-600">
            {coach.active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500">Performance Score</p>
          <p className="text-lg font-semibold text-green-600">
            {coach.performance_score.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Staked Amount</p>
          <p className="text-lg font-semibold">
            {(coach.staked_amount / 100000000).toFixed(2)} APT
          </p>
        </div>
      </div>

      {/* Staking Section */}
      {connected && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Stake tokens to activate this coach:</p>
          <div className="flex space-x-2">
            <input
              type="number"
              value={stakingAmount}
              onChange={(e) => setStakingAmount(e.target.value)}
              placeholder="Amount in APT"
              className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              step="0.01"
              min="0"
            />
            <Button 
              onClick={handleStake} 
              disabled={stakingLoading}
              size="sm"
            >
              {stakingLoading ? 'Staking...' : 'Stake'}
            </Button>
          </div>
        </div>
      )}

      <div className="flex space-x-2">
        <Link href={`/coach/${coach.id}`}>
          <Button variant="outline" size="sm">
            View Details
          </Button>
        </Link>
        {coach.active && connected && (
          <Button 
            onClick={handleClaimRewards}
            disabled={claimingLoading}
            size="sm"
          >
            {claimingLoading ? 'Claiming...' : 'Claim Rewards'}
          </Button>
        )}
      </div>
    </div>
  )
}
