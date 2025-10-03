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
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🏆</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Coaches Yet
        </h3>
        <p className="text-gray-600">
          Be the first to mint a coach and appear on the leaderboard
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {entries.map((entry, index) => {
        const isStaked = parseInt(entry.staked_amount) > 0
        const hasPerformance = parseInt(entry.performance_score) > 0
        
        return (
          <Link
            key={entry.coach_id}
            href={`/coach/${entry.coach_id}`}
            className="block p-4 rounded-lg border hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold ${
                  index === 0 ? 'bg-yellow-100 text-yellow-600' : 
                  index === 1 ? 'bg-gray-100 text-gray-600' :
                  index === 2 ? 'bg-orange-100 text-orange-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                </div>
                <div>
                  <div className="font-semibold">Coach #{entry.coach_id}</div>
                  <div className="text-sm text-gray-500">
                    {formatAddress(entry.owner)}
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    {isStaked ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Inactive
                      </span>
                    )}
                    {hasPerformance && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Scored
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-8">
                <div className="text-right">
                  <div className="text-sm text-gray-500">Performance</div>
                  <div className={`font-semibold ${
                    hasPerformance ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {hasPerformance ? formatPercentage(entry.performance_score) : 'Not scored'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Staked</div>
                  <div className="font-semibold">
                    {isStaked ? `${entry.staked_amount} APT` : 'Not staked'}
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
