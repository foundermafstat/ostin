'use client'

import { useWallet } from '@/components/WalletProvider'
import { useEffect, useState } from 'react'
import { CoachCard } from '@/components/CoachCard'
import { MintCoachForm } from '@/components/MintCoachForm'
import { Coach } from '@/lib/contracts'

export default function DashboardPage() {
  const { connected, account } = useWallet()
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserCoaches = async () => {
      if (connected && account) {
        setLoading(true)
        try {
          const response = await fetch(`/api/user-coaches?address=${account.address}`)
          const data = await response.json()
          
          if (response.ok) {
            setCoaches(data)
          } else {
            console.error('Failed to fetch user coaches:', data.error)
          }
        } catch (error) {
          console.error('Error fetching user coaches:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchUserCoaches()
  }, [connected, account])

  if (!connected) {
    return (
      <div className="text-center py-12">
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
          <h2 className="text-xl font-semibold mb-4">My Coaches</h2>
          
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
                No Coaches Yet
              </h3>
              <p className="text-gray-600 mb-4">
                Mint your first AI portfolio coach to get started
              </p>
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
    </div>
  )
}
