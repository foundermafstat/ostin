'use client'

import { Coach } from '@/lib/contracts'
import { formatAddress, formatPercentage } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { StakeForm } from '@/components/StakeForm'
import { useWallet } from '@/components/WalletProvider'

interface CoachDetailsProps {
  coach: Coach
}

export function CoachDetails({ coach }: CoachDetailsProps) {
  const { account, isConnected } = useWallet()
  
  const isOwner = isConnected && account?.accountAddress.toString() === coach.owner
  const hasExistingStake = parseInt(coach.staked_amount) > 0

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Performance Metrics</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {formatPercentage(coach.performance_score)}
              </div>
              <div className="text-sm text-gray-600">Performance Score</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {(parseInt(coach.staked_amount) / 100000000).toFixed(4)}
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
            {coach.active && (
              <Button className="w-full">
                Claim Rewards
              </Button>
            )}
            
            {isOwner && hasExistingStake && (
              <Button variant="outline" className="w-full">
                Stake More Tokens
              </Button>
            )}
            
            {isOwner && (
              <Button variant="outline" className="w-full">
                Update Performance
              </Button>
            )}
            
            {!isOwner && (
              <div className="text-center text-gray-500 text-sm">
                Only the coach owner can perform actions
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
              {coach.rules}
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
                {coach.owner}
              </dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Created</dt>
              <dd className="text-sm text-gray-900">
                {new Date().toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}
