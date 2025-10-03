'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Coach } from '@/lib/contracts'
import { CoachDetails } from '@/components/CoachDetails'

export default function CoachPage() {
  const params = useParams()
  const coachId = params.id as string
  const [coach, setCoach] = useState<Coach | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCoach() {
      try {
        const response = await fetch(`/api/performance?coachId=${coachId}`)
        const data = await response.json()
        setCoach(data)
      } catch (error) {
        console.error('Error fetching coach:', error)
      } finally {
        setLoading(false)
      }
    }

    if (coachId) {
      fetchCoach()
    }
  }, [coachId])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!coach) {
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
        <h1 className="text-3xl font-bold text-gray-900">
          Coach #{coachId}
        </h1>
        <p className="text-gray-600 mt-2">
          AI Portfolio Management Agent
        </p>
      </div>

      <CoachDetails coach={coach} />
    </div>
  )
}
