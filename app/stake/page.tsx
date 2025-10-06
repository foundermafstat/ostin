'use client'

import { useEffect, useState } from 'react'
import { useWallet } from '@/components/WalletProvider'
import { StakeForm } from '@/components/StakeForm'
import { Coach } from '@/lib/contracts'
import { formatAddress } from '@/lib/utils'
import Link from 'next/link'
import { Logo } from '@/components/Logo'

export default function StakePage() {
  const { account, connected } = useWallet()
  const [userCoaches, setUserCoaches] = useState<Coach[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUserCoaches() {
      if (!connected || !account) {
        setLoading(false)
        return
      }

      try {
        setError(null)
        const response = await fetch(`/api/user-coaches?address=${account.address.toString()}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        console.log('Stake page - user coaches received:', data)
        console.log('Stake page - user coaches length:', data.length)
        setUserCoaches(data)
      } catch (error) {
        console.error('Error fetching user coaches:', error)
        setError(error instanceof Error ? error.message : 'Failed to fetch coaches')
      } finally {
        setLoading(false)
      }
    }

    fetchUserCoaches()
  }, [connected, account])

  const inactiveCoaches = userCoaches.filter(coach => !coach.active)
  const activeCoaches = userCoaches.filter(coach => coach.active)

  if (!connected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Logo size="lg" className="mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900">Stake Tokens</h1>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔗</span>
            </div>
            <h2 className="text-xl font-semibold text-yellow-800 mb-2">
              Connect Your Wallet
            </h2>
            <p className="text-yellow-700 mb-4">
              Please connect your wallet to view and stake tokens on your coaches.
            </p>
            <Link 
              href="/"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Logo size="lg" className="mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Stake Tokens</h1>
          <p className="text-gray-600">
            Stake APT tokens to activate your AI portfolio coaches and make them eligible for rewards.
          </p>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-semibold text-red-800 mb-2">
              Error Loading Coaches
            </h2>
            <p className="text-red-700 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Inactive Coaches Section */}
            {inactiveCoaches.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  Inactive Coaches ({inactiveCoaches.length})
                </h2>
                <p className="text-gray-600 mb-6">
                  These coaches need to be staked to become active and eligible for rewards.
                </p>
                
                <div className="grid gap-6">
                  {inactiveCoaches.map((coach) => (
                    <div key={coach.id} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">Coach #{coach.id}</h3>
                          <p className="text-sm text-gray-500">
                            Owner: {formatAddress(coach.owner)}
                          </p>
                          <div className="mt-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Inactive
                            </span>
                          </div>
                        </div>
                        <Link 
                          href={`/coach/${coach.id}`}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          View Details →
                        </Link>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Trading Rules</h4>
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {coach.rules}
                        </p>
                      </div>
                      
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
                  ))}
                </div>
              </div>
            )}

            {/* Active Coaches Section */}
            {activeCoaches.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  Active Coaches ({activeCoaches.length})
                </h2>
                <p className="text-gray-600 mb-6">
                  These coaches are already active and earning rewards.
                </p>
                
                <div className="grid gap-6">
                  {activeCoaches.map((coach) => (
                    <div key={coach.id} className="bg-white border border-green-200 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">Coach #{coach.id}</h3>
                          <p className="text-sm text-gray-500">
                            Owner: {formatAddress(coach.owner)}
                          </p>
                          <div className="mt-2 space-x-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                            {parseInt(coach.performance_score) > 0 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Scored: {(parseInt(coach.performance_score) / 100).toFixed(2)}%
                              </span>
                            )}
                          </div>
                        </div>
                        <Link 
                          href={`/coach/${coach.id}`}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          View Details →
                        </Link>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Trading Rules</h4>
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {coach.rules}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h4 className="font-medium text-blue-900 mb-1">Staked Amount</h4>
                          <p className="text-2xl font-bold text-blue-600">
                            {(parseInt(coach.staked_amount) / 100000000).toFixed(4)} APT
                          </p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                          <h4 className="font-medium text-green-900 mb-1">Performance</h4>
                          <p className="text-2xl font-bold text-green-600">
                            {parseInt(coach.performance_score) > 0 
                              ? `${(parseInt(coach.performance_score) / 100).toFixed(2)}%`
                              : 'Not scored'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Coaches */}
            {userCoaches.length === 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🤖</span>
                </div>
                <h2 className="text-xl font-semibold text-blue-800 mb-2">
                  No Coaches Found
                </h2>
                <p className="text-blue-700 mb-4">
                  You haven't created any coaches yet. Create your first AI portfolio coach to get started.
                </p>
                <Link 
                  href="/"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Coach
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
