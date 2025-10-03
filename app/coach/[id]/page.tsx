'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { CoachDetails } from '@/components/CoachDetails'

interface CoachDetailsData {
  coach: any
  staking: any
  rewards: any
  contract: any
  performance: any
  owner: any
}

export default function CoachPage() {
  const params = useParams()
  const coachId = parseInt(params.id as string)
  const [coachData, setCoachData] = useState<CoachDetailsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCoachDetails() {
      // Проверяем, что мы в браузере
      if (typeof window === 'undefined') {
        setLoading(false)
        return
      }

      try {
        console.log(`=== Fetching coach ${coachId} details ===`)
        
        // Используем новый API endpoint для получения данных коуча
        const response = await fetch(`/api/coaches/${coachId}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setCoachData(null)
            setError(null)
            return
          }
          throw new Error(`API error: ${response.status}`)
        }
        
        const data = await response.json()
        console.log(`Coach ${coachId} data received:`, data)
        
        setCoachData(data)
        setError(null)
      } catch (error) {
        console.error('Error fetching coach details from contract:', error)
        setError(error instanceof Error ? error.message : 'Failed to fetch coach details')
        setCoachData(null)
      } finally {
        setLoading(false)
      }
    }

    if (coachId) {
      fetchCoachDetails()
    }
  }, [coachId])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Coach Data</h2>
          <p className="text-gray-600">Connecting to Aptos contract...</p>
          <p className="text-sm text-gray-500 mt-1">This may take a few seconds</p>
        </div>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold text-red-600 mb-4">
          Error Loading Coach
        </h1>
        <p className="text-gray-600 mb-4">
          {error}
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!coachData) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Coach Not Found
        </h1>
        <p className="text-gray-600">
          The requested coach could not be found
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Coach #{coachId}
            </h1>
            <p className="text-gray-600 mt-2">
              AI Portfolio Management Agent
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Live from Contract</span>
          </div>
        </div>
      </div>

      <CoachDetails coachData={coachData} />
    </div>
  )
}
