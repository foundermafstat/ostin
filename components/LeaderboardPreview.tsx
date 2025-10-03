'use client'

import { useEffect, useState } from 'react'
import { getLeaderboard, LeaderboardEntry, getAllCoaches, Coach } from '@/lib/contracts'
import { formatAddress, formatPercentage } from '@/lib/utils'

export function LeaderboardPreview() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        setError(null)
        const data = await getLeaderboard()
        
        // If leaderboard is empty, try to get all coaches
        if (data.length === 0) {
          const allCoaches = await getAllCoaches()
          // Convert coaches to leaderboard entries
          const coachEntries: LeaderboardEntry[] = allCoaches.map(coach => ({
            coach_id: coach.id,
            owner: coach.owner,
            performance_score: coach.performance_score,
            staked_amount: coach.staked_amount,
          }))
          setLeaderboard(coachEntries.slice(0, 5)) // Show top 5
        } else {
          setLeaderboard(data.slice(0, 5)) // Show top 5
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error)
        setError('Failed to load leaderboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex justify-between items-center p-3 bg-gray-100 rounded-lg">
              <div className="w-24 h-4 bg-gray-200 rounded"></div>
              <div className="w-16 h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-2">⚠️ {error}</div>
        <div className="text-sm text-gray-500 mb-4">
          Make sure the contract is deployed and initialized
        </div>
        <div className="text-xs text-gray-400">
          Run: <code className="bg-gray-100 px-2 py-1 rounded">.\scripts\deploy.ps1</code> (Windows) or <code className="bg-gray-100 px-2 py-1 rounded">./scripts/deploy.sh</code> (Linux/macOS)
        </div>
      </div>
    )
  }

  if (leaderboard.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 mb-2">📊 No coaches yet</div>
        <div className="text-sm text-gray-400">
          Be the first to mint a coach and start competing!
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {leaderboard.map((entry, index) => (
        <div key={entry.coach_id} className="flex justify-between items-center p-3 bg-white rounded-lg border">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center text-sm font-semibold text-primary-600">
              {index + 1}
            </div>
            <div>
              <div className="font-medium">Coach #{entry.coach_id}</div>
              <div className="text-sm text-gray-500">
                {formatAddress(entry.owner)}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-semibold text-green-600">
              {formatPercentage(entry.performance_score)}
            </div>
            <div className="text-sm text-gray-500">
              {entry.staked_amount} APT
            </div>
          </div>
        </div>
      ))}
      
      <div className="text-center pt-4">
        <a 
          href="/leaderboard" 
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          View Full Leaderboard →
        </a>
      </div>
    </div>
  )
}
