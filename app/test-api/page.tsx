'use client'

import { useState } from 'react'

export default function TestApiPage() {
  const [debugResult, setDebugResult] = useState<any>(null)
  const [leaderboardResult, setLeaderboardResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testDebugApi = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/debug')
      const data = await response.json()
      setDebugResult(data)
    } catch (error) {
      setDebugResult({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  const testLeaderboardApi = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/leaderboard')
      const data = await response.json()
      setLeaderboardResult(data)
    } catch (error) {
      setLeaderboardResult({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold">API Test Page</h1>
      
      <div className="space-y-4">
        <button
          onClick={testDebugApi}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Test Debug API
        </button>
        
        <button
          onClick={testLeaderboardApi}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          Test Leaderboard API
        </button>
      </div>

      {debugResult && (
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Debug API Result:</h2>
          <pre className="whitespace-pre-wrap text-sm">
            {JSON.stringify(debugResult, null, 2)}
          </pre>
        </div>
      )}

      {leaderboardResult && (
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Leaderboard API Result:</h2>
          <pre className="whitespace-pre-wrap text-sm">
            {JSON.stringify(leaderboardResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
