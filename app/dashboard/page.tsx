'use client'

import { useWallet } from '@/components/WalletProvider'
import { useEffect, useState } from 'react'
import { CoachCard } from '@/components/CoachCard'
import { MintCoachForm } from '@/components/MintCoachForm'
import { Coach, getUserCoaches, getAllCoaches } from '@/lib/contracts'
import { Logo } from '@/components/Logo'
import { Toaster } from '@/components/Toaster'

export default function DashboardPage() {
  const { connected, account } = useWallet()
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [loading, setLoading] = useState(true)
  const [showAllCoaches, setShowAllCoaches] = useState(false)

  useEffect(() => {
    const fetchCoaches = async () => {
      setLoading(true)
      try {
        if (connected && account?.address && !showAllCoaches) {
          // Try to get user's coaches first
          console.log('Fetching user coaches from contract...', account.address.toString())
          const userCoaches = await getUserCoaches(account.address.toString())
          console.log('User coaches received:', userCoaches)
          console.log('User coaches length:', userCoaches.length)
          setCoaches(userCoaches)
        } else if (showAllCoaches) {
          // Show all coaches
          console.log('Fetching all coaches from contract...')
          const allCoaches = await getAllCoaches()
          console.log('All coaches received:', allCoaches)
          setCoaches(allCoaches)
        }
      } catch (error) {
        console.error('Error fetching coaches:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCoaches()
  }, [connected, account?.address, showAllCoaches])

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
          Please connect your wallet to view your dashboard
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          My Dashboard
        </h1>
        <MintCoachForm />
      </div>

      <div className="grid gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {showAllCoaches ? 'All Coaches' : 'My Coaches'}
            </h2>
            {connected && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowAllCoaches(false)}
                  className={`px-3 py-1 text-sm rounded ${
                    !showAllCoaches 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  My Coaches
                </button>
                <button
                  onClick={() => setShowAllCoaches(true)}
                  className={`px-3 py-1 text-sm rounded ${
                    showAllCoaches 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  All Coaches
                </button>
              </div>
            )}
          </div>
          
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-24 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : coaches.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {showAllCoaches ? 'No Coaches in System' : 'No Coaches Yet'}
              </h3>
              <p className="text-gray-600 mb-4">
                {showAllCoaches 
                  ? 'No coaches have been minted in the system yet'
                  : 'Mint your first AI portfolio coach to get started'
                }
              </p>
              {!showAllCoaches && (
                <button
                  onClick={() => setShowAllCoaches(true)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  View all coaches in system
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {coaches.map((coach) => (
                <CoachCard key={coach.id} coach={coach} />
              ))}
            </div>
          )}
        </div>
      </div>
      
      <Toaster />
    </div>
  )
}
