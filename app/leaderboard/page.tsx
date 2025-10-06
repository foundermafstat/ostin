'use client'

import { useEffect, useState } from 'react'
import { LeaderboardTable } from '@/components/LeaderboardTable'
import { LeaderboardEntry } from '@/lib/contracts'
import { Logo } from '@/components/Logo'

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Calculate statistics
  const totalCoaches = leaderboard.length
  const activeCoaches = leaderboard.filter(entry => parseInt(entry.staked_amount) > 0).length
  const scoredCoaches = leaderboard.filter(entry => parseInt(entry.performance_score) > 0).length
  const totalStaked = leaderboard.reduce((sum, entry) => sum + parseInt(entry.staked_amount), 0)

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        setError(null)
        const response = await fetch('/api/leaderboard')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setLeaderboard(data)
      } catch (error) {
        console.error('Error fetching leaderboard:', error)
        setError(error instanceof Error ? error.message : 'Failed to fetch leaderboard')
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  return (
    <div className="space-y-8">
      <div className="text-center">
        <Logo size="lg" className="mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Leaderboard
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
          Top performing AI portfolio coaches
        </p>
        
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-600">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalCoaches}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Total Coaches</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-600">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{activeCoaches}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Active Coaches</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-600">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{scoredCoaches}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Scored Coaches</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-600">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalStaked}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Total Staked (APT)</div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-600">
        <div className="p-6 border-b dark:border-gray-600">
          <h2 className="text-xl font-semibold dark:text-white">Performance Rankings</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Ranked by performance score and total staked amount
          </p>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Error Loading Leaderboard
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <LeaderboardTable entries={leaderboard} />
          )}
        </div>
      </div>
    </div>
  )
}
