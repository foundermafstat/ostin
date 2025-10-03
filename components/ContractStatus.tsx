'use client'

import { useState, useEffect } from 'react'
import { getContractStatusReport } from '@/lib/contracts'

export function ContractStatus() {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStatus() {
      try {
        const response = await fetch('/api/debug')
        const data = await response.json()
        setStatus(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-lg border p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
          <span className="text-sm font-medium text-red-800">Contract Error</span>
        </div>
        <p className="text-xs text-red-600 mt-1">{error}</p>
      </div>
    )
  }

  const diagnostics = status?.diagnostics
  const isHealthy = diagnostics?.healthStatus === 'healthy'
  const isInitialized = diagnostics?.isInitialized

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm font-medium text-gray-800">Contract Status</span>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${
          isHealthy ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {isHealthy ? 'Healthy' : 'Unhealthy'}
        </span>
      </div>
      
      <div className="space-y-1 text-xs text-gray-600">
        <div className="flex justify-between">
          <span>Initialized:</span>
          <span className={isInitialized ? 'text-green-600' : 'text-red-600'}>
            {isInitialized ? 'Yes' : 'No'}
          </span>
        </div>
        
        {diagnostics?.contractAddress && (
          <div className="flex justify-between">
            <span>Address:</span>
            <span className="font-mono text-xs">
              {diagnostics.contractAddress.slice(0, 6)}...{diagnostics.contractAddress.slice(-4)}
            </span>
          </div>
        )}
        
        {status?.coaches && (
          <div className="flex justify-between">
            <span>Total Coaches:</span>
            <span>{status.coaches.length}</span>
          </div>
        )}
      </div>
      
      {!isInitialized && (
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
          <p className="font-medium">Contract not initialized</p>
          <p>Please visit the Initialize page to set up the contract.</p>
        </div>
      )}
    </div>
  )
}
