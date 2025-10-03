'use client'

import { Coach, claimRewards, updatePerformance } from '@/lib/contracts'
import { formatAddress, formatPercentage } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { StakeForm } from '@/components/StakeForm'
import { useWallet } from '@/components/WalletProvider'
import { addToast, Toaster } from '@/components/Toaster'
import { useState } from 'react'

interface CoachDetailsProps {
  coach: Coach
}

export function CoachDetails({ coach }: CoachDetailsProps) {
  const { account, connected, signAndSubmitTransaction } = useWallet()
  const [claimingLoading, setClaimingLoading] = useState(false)
  const [updatingLoading, setUpdatingLoading] = useState(false)
  
  const isOwner = connected && account?.address === coach.owner
  const hasExistingStake = coach.staked_amount > 0

  const handleClaimRewards = async () => {
    if (!connected || !account) {
      addToast('Please connect your wallet first', 'error')
      return
    }

    console.log('CoachDetails claimRewards - signAndSubmitTransaction:', signAndSubmitTransaction)
    console.log('CoachDetails claimRewards - signAndSubmitTransaction type:', typeof signAndSubmitTransaction)

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
      // Refresh the page to update data
      setTimeout(() => window.location.reload(), 2000)
    } catch (error) {
      console.error('Error claiming rewards:', error)
      addToast('Failed to claim rewards. Please try again.', 'error')
    } finally {
      setClaimingLoading(false)
    }
  }

  const handleUpdatePerformance = async () => {
    if (!connected || !account || !signAndSubmitTransaction) {
      addToast('Please connect your wallet first', 'error')
      return
    }

    // For now, we'll use mock data. In a real app, this would be a form
    const newScore = Math.floor(Math.random() * 1000000) // Random score between 0 and 1,000,000
    const riskAdjustedReturn = Math.floor(Math.random() * 100000) // Random risk between 0 and 100,000 basis points
    const explanationHash = `Performance update at ${new Date().toISOString()}`

    setUpdatingLoading(true)
    
    try {
      const transactionHash = await updatePerformance(
        account, 
        coach.id, 
        newScore, 
        riskAdjustedReturn, 
        explanationHash, 
        signAndSubmitTransaction
      )
      addToast(`Performance updated successfully! Transaction: ${transactionHash}`, 'success')
      // Refresh the page to update data
      setTimeout(() => window.location.reload(), 2000)
    } catch (error) {
      console.error('Error updating performance:', error)
      addToast('Failed to update performance. Please try again.', 'error')
    } finally {
      setUpdatingLoading(false)
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Performance Metrics</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {coach.performance_score?.toLocaleString() ?? 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Performance Score</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {coach.staked_amount ? (coach.staked_amount / 100000000).toFixed(4) : '0.0000'}
              </div>
              <div className="text-sm text-gray-600">Staked APT</div>
            </div>
          </div>
          
          <div className="mt-4 flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${coach.active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span className="text-sm text-gray-600">
              Status: {coach.active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* Staking Section */}
        {isOwner && !hasExistingStake && (
          <div className="bg-white rounded-lg border p-6">
            <StakeForm 
              coachId={coach.id}
              coachOwner={coach.owner}
              currentStake={coach.staked_amount}
              onSuccess={() => {
                // Refresh the page to update coach status
                window.location.reload()
              }}
            />
          </div>
        )}

        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          
          <div className="space-y-3">
            {coach.active && isOwner && (
              <Button 
                onClick={handleClaimRewards}
                disabled={claimingLoading}
                className="w-full"
              >
                {claimingLoading ? 'Claiming...' : 'Claim Rewards'}
              </Button>
            )}
            
            {isOwner && hasExistingStake && (
              <Button variant="outline" className="w-full" disabled>
                Stake More Tokens (Coming Soon)
              </Button>
            )}
            
            {isOwner && coach.active && (
              <Button 
                onClick={handleUpdatePerformance}
                disabled={updatingLoading}
                variant="outline" 
                className="w-full"
              >
                {updatingLoading ? 'Updating...' : 'Update Performance'}
              </Button>
            )}
            
            {!isOwner && (
              <div className="text-center text-gray-500 text-sm">
                Only the coach owner can perform actions
              </div>
            )}
            
            {isOwner && !coach.active && (
              <div className="text-center text-gray-500 text-sm">
                Stake tokens to activate this coach and enable actions
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Trading Rules & Strategy</h2>
          
          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
              {coach.rules || 'No rules defined'}
            </pre>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Coach Information</h2>
          
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Coach ID</dt>
              <dd className="text-sm text-gray-900">{coach.id}</dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Owner</dt>
              <dd className="text-sm text-gray-900 font-mono">
                {coach.owner ? formatAddress(coach.owner) : 'Unknown'}
              </dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Created</dt>
              <dd className="text-sm text-gray-900">
                {coach.created_at ? new Date(coach.created_at * 1000).toLocaleDateString() : 'Unknown'}
              </dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Last Performance Update</dt>
              <dd className="text-sm text-gray-900">
                {coach.last_performance_update ? new Date(coach.last_performance_update * 1000).toLocaleDateString() : 'Never'}
              </dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Total Rewards Claimed</dt>
              <dd className="text-sm text-gray-900">
                {coach.total_rewards_claimed ? (coach.total_rewards_claimed / 100000000).toFixed(4) : '0.0000'} APT
              </dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Risk Adjusted Return</dt>
              <dd className="text-sm text-gray-900">
                {coach.risk_adjusted_return ? formatPercentage(coach.risk_adjusted_return / 100) : '0.00%'}
              </dd>
            </div>
          </dl>
        </div>
      </div>
      
      <Toaster />
    </div>
  )
}
