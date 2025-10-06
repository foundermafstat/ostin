'use client'

import { LeaderboardEntry } from '@/lib/contracts'
import { formatAddress, formatPercentage } from '@/lib/utils'
import Link from 'next/link'

interface LeaderboardTableProps {
  entries: LeaderboardEntry[]
}

export function LeaderboardTable({ entries }: LeaderboardTableProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🏆</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No Coaches Yet
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Be the first to mint a coach and appear on the leaderboard
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {entries.map((entry, index) => {
        const isStaked = entry.staked_amount > 0
        const hasPerformance = entry.performance_score > 0
        
        return (
          <Link
            key={entry.coach_id}
            href={`/coach/${entry.coach_id}`}
            className="block p-4 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold ${
                  index === 0 ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300' : 
                  index === 1 ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' :
                  index === 2 ? 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300' :
                  'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
                }`}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                </div>
                <div>
                  <div className="font-semibold dark:text-white">Coach #{entry.coach_id}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {formatAddress(entry.owner)}
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    {isStaked ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                        Inactive
                      </span>
                    )}
                    {hasPerformance && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                        Scored
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-8">
                <div className="text-right">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Performance</div>
                  <div className={`font-semibold ${
                    hasPerformance ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'
                  }`}>
                    {hasPerformance ? entry.performance_score.toLocaleString() : 'Not scored'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Staked</div>
                  <div className="font-semibold dark:text-white">
                    {isStaked ? `${(entry.staked_amount / 100000000).toFixed(2)} APT` : 'Not staked'}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
