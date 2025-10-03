'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/Logo'
import { MintCoachForm } from '@/components/MintCoachForm'
import { useWallet } from '@/components/WalletProvider'

export default function TestContractPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const { connected, account } = useWallet()

  const testContractStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/contract-status')
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-12">
      <div className="bg-white rounded-lg border p-8">
        <div className="text-center mb-8">
          <Logo size="md" className="mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">
            Test Contract Status
          </h1>
        </div>
        
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">API Test</h2>
            <Button 
              onClick={testContractStatus}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Testing...' : 'Test Contract Status'}
            </Button>
            
            {result && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
                <h3 className="text-lg font-semibold mb-2">API Result:</h3>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Wallet Status</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p><strong>Connected:</strong> {String(connected)}</p>
              <p><strong>Account:</strong> {account ? 'Yes' : 'No'}</p>
              <p><strong>Account Address:</strong> {account?.accountAddress || 'N/A'}</p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Mint Coach Form Test</h2>
            <MintCoachForm />
          </div>
        </div>
      </div>
    </div>
  )
}
