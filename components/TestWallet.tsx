'use client'

import { useWallet } from '@/components/WalletProvider'
import { mintCoach, stakeTokens, checkContractStatus } from '@/lib/contracts'
import { Button } from '@/components/ui/Button'
import { addToast } from '@/components/Toaster'

export function TestWallet() {
  const { connected, account, signAndSubmitTransaction } = useWallet()

  const testMint = async () => {
    if (!connected || !account || !signAndSubmitTransaction) {
      addToast('Please connect your wallet first', 'error')
      return
    }

    try {
      const testRules = 'Test rules for debugging: Buy low, sell high. Risk management: 2% per trade.'
      console.log('Testing mint with:', { account, signAndSubmitTransaction })
      
      const result = await mintCoach(account.address, testRules, signAndSubmitTransaction)
      addToast(`Test mint successful! Coach #${result.coachId}, Hash: ${result.hash}`, 'success')
    } catch (error) {
      console.error('Test mint error:', error)
      addToast(`Test mint failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')
    }
  }

  const testStake = async () => {
    if (!connected || !account || !signAndSubmitTransaction) {
      addToast('Please connect your wallet first', 'error')
      return
    }

    try {
      // Assuming coach ID 1 exists
      const coachId = 1
      const amount = 100000000 // 1 APT in octas
      
      console.log('Testing stake with:', { account, coachId, amount, signAndSubmitTransaction })
      
      const result = await stakeTokens(account.address, coachId, amount, signAndSubmitTransaction)
      addToast(`Test stake successful! Coach #${result.coachId}, Hash: ${result.hash}`, 'success')
    } catch (error) {
      console.error('Test stake error:', error)
      addToast(`Test stake failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')
    }
  }

  const testContractStatus = async () => {
    try {
      console.log('Checking contract status...')
      const status = await checkContractStatus()
      console.log('Contract status:', status)
      
      if (status.isInitialized) {
        addToast(`Contract is initialized! Address: ${status.contractAddress}`, 'success')
      } else {
        addToast(`Contract not initialized: ${status.error}`, 'error')
      }
    } catch (error) {
      console.error('Contract status error:', error)
      addToast(`Contract status check failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')
    }
  }

  return (
    <div className="bg-white rounded-lg border p-6 space-y-4 no-hover">
      <h3 className="text-lg font-semibold">Wallet Test Panel</h3>
      
      <div className="space-y-2">
        <p><strong>Connected:</strong> {connected ? 'Yes' : 'No'}</p>
        <p><strong>Account:</strong> {account?.address || 'None'}</p>
        <p><strong>signAndSubmitTransaction:</strong> {signAndSubmitTransaction ? 'Available' : 'Not available'}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={testContractStatus}>
          Check Contract Status
        </Button>
        <Button onClick={testMint} disabled={!connected || !signAndSubmitTransaction}>
          Test Mint
        </Button>
        <Button onClick={testStake} disabled={!connected || !signAndSubmitTransaction}>
          Test Stake
        </Button>
      </div>
    </div>
  )
}
