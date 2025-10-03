'use client'

import { claimRewards, updatePerformance } from '@/lib/contracts'
import { formatAddress, formatPercentage } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { StakeForm } from '@/components/StakeForm'
import { useWallet } from '@/components/WalletProvider'
import { addToast, Toaster } from '@/components/Toaster'
import { useState } from 'react'

interface CoachDetailsProps {
  coachData: {
    coach: any
    staking: any
    rewards: any
    contract: any
    performance: any
    owner: any
  }
}

export function CoachDetails({ coachData }: CoachDetailsProps) {
  const { account, connected, signAndSubmitTransaction } = useWallet()
  const [claimingLoading, setClaimingLoading] = useState(false)
  const [updatingLoading, setUpdatingLoading] = useState(false)
  
  // Проверяем, что данные загружены
  if (!coachData) {
    return (
      <div className="text-center py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4 mx-auto"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }
  
  const { coach, staking, rewards, contract, performance, owner } = coachData
  const isOwner = connected && account?.address === coach?.owner
  const hasExistingStake = staking?.is_staked || false

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
      const transactionHash = await claimRewards(account, coach?.id || 0, signAndSubmitTransaction)
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
        coach?.id || 0, 
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
    <div className="space-y-8">
      {/* Header with Status */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Coach Overview</h2>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              coach?.status_color === 'green' ? 'bg-green-500' :
              coach?.status_color === 'blue' ? 'bg-blue-500' :
              coach?.status_color === 'yellow' ? 'bg-yellow-500' :
              coach?.status_color === 'orange' ? 'bg-orange-500' :
              'bg-gray-500'
            }`}></div>
            <span className={`text-sm font-medium ${
              coach?.status_color === 'green' ? 'text-green-600' :
              coach?.status_color === 'blue' ? 'text-blue-600' :
              coach?.status_color === 'yellow' ? 'text-yellow-600' :
              coach?.status_color === 'orange' ? 'text-orange-600' :
              'text-gray-600'
            }`}>
              {coach?.status || 'Unknown'}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {performance?.score_formatted || '0'}
            </div>
            <div className="text-sm text-gray-600">Performance Score</div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {staking?.amount_apt?.toFixed(4) || '0.0000'}
            </div>
            <div className="text-sm text-gray-600">Staked APT</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {rewards?.claimed_apt?.toFixed(4) || '0.0000'}
            </div>
            <div className="text-sm text-gray-600">Rewards Claimed</div>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {staking?.percentage_of_total?.toFixed(2) || '0.00'}%
            </div>
            <div className="text-sm text-gray-600">Of Total Staked</div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Staking Information */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Staking Information</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Staked Amount</span>
                <span className="text-sm font-mono">{staking?.amount_apt?.toFixed(4) || '0.0000'} APT</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Percentage of Total</span>
                <span className="text-sm">{staking?.percentage_of_total?.toFixed(2) || '0.00'}%</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Status</span>
                <span className={`text-sm font-medium ${staking?.is_staked ? 'text-green-600' : 'text-gray-500'}`}>
                  {staking?.is_staked ? 'Active' : 'Not Staked'}
                </span>
              </div>
              
              {staking?.is_staked && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Days Since Staking</span>
                  <span className="text-sm">{coach?.days_since_creation || 0} days</span>
                </div>
              )}
            </div>
          </div>

          {/* Rewards Information */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Rewards Information</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Claimed Rewards</span>
                <span className="text-sm font-mono">{rewards?.claimed_apt?.toFixed(4) || '0.0000'} APT</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Potential Rewards</span>
                <span className="text-sm font-mono">{rewards?.potential_apt?.toFixed(4) || '0.0000'} APT</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Total Rewards Pool</span>
                <span className="text-sm font-mono">{rewards?.total_pool_apt?.toFixed(4) || '0.0000'} APT</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Risk Adjusted Return</span>
                <span className="text-sm">{rewards?.risk_adjusted_return_percent?.toFixed(2) || '0.00'}%</span>
              </div>
            </div>
          </div>

          {/* Staking Actions */}
          {isOwner && !hasExistingStake && (
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Stake Tokens</h2>
              <StakeForm 
                coachId={coach?.id || 0}
                coachOwner={coach?.owner || ''}
                currentStake={coach?.staked_amount || 0}
                onSuccess={() => {
                  window.location.reload()
                }}
              />
            </div>
          )}

          {/* Actions */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            
            <div className="space-y-3">
              {coach?.active && isOwner && (
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
              
              {isOwner && coach?.active && (
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
              
              {isOwner && !coach?.active && (
                <div className="text-center text-gray-500 text-sm">
                  Stake tokens to activate this coach and enable actions
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Owner Information */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Owner Information</h2>
            
            <div className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Owner Address</dt>
                <dd className="text-sm text-gray-900 font-mono break-all">
                  {owner?.address || 'Unknown'}
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Short Address</dt>
                <dd className="text-sm text-gray-900 font-mono">
                  {owner?.address_short || 'Unknown'}
                </dd>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isOwner ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="text-sm text-gray-600">
                  {isOwner ? 'You are the owner' : 'You are not the owner'}
                </span>
              </div>
            </div>
          </div>

          {/* Performance Details */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Performance Details</h2>
            
            <div className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Performance Score</dt>
                <dd className="text-sm text-gray-900">{performance?.score_formatted || '0'}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Risk Adjusted Return</dt>
                <dd className="text-sm text-gray-900">{performance?.risk_adjusted_return_percent?.toFixed(2) || '0.00'}%</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Update</dt>
                <dd className="text-sm text-gray-900">
                  {performance?.last_update_formatted || 'Never'}
                </dd>
              </div>
              
              {performance?.days_since_update !== null && performance?.days_since_update !== undefined && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Days Since Update</dt>
                  <dd className="text-sm text-gray-900">{performance?.days_since_update || 0} days</dd>
                </div>
              )}
            </div>
          </div>

          {/* Contract Information */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Contract Information</h2>
            
            <div className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Total Staked</dt>
                <dd className="text-sm text-gray-900 font-mono">{contract?.total_staked_apt?.toFixed(4) || '0.0000'} APT</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Total Rewards Pool</dt>
                <dd className="text-sm text-gray-900 font-mono">{contract?.total_rewards_pool_apt?.toFixed(4) || '0.0000'} APT</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Contract Status</dt>
                <dd className="text-sm text-gray-900">{contract?.health_status || 'Unknown'}</dd>
              </div>
            </div>
          </div>

          {/* Trading Rules */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Trading Rules & Strategy</h2>
            
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                {coach?.rules || 'No rules defined'}
              </pre>
            </div>
          </div>

          {/* Coach Details */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Coach Details</h2>
            
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Coach ID</dt>
                <dd className="text-sm text-gray-900">{coach?.id || 'Unknown'}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="text-sm text-gray-900">
                  {coach?.created_at_formatted || 'Unknown'}
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Days Since Creation</dt>
                <dd className="text-sm text-gray-900">{coach?.days_since_creation || 0} days</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="text-sm text-gray-900">{coach?.status || 'Unknown'}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
      
      <Toaster />
    </div>
  )
}
