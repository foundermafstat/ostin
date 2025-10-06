'use client'

import { useWallet } from './WalletProvider'
import { Button } from '@/components/ui/Button'
import { WalletModal } from './WalletModal'
import { WalletDropdown } from './WalletDropdown'

export function WalletConnect() {
  const { 
    connected, 
    account, 
    showWalletModal, 
    setShowWalletModal 
  } = useWallet()

  if (connected && account) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
          <h3 className="font-semibold text-green-800 dark:text-green-200 mb-4">Wallet Connected</h3>
          <WalletDropdown />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Button 
        onClick={() => setShowWalletModal(true)} 
        className="w-full"
      >
        Connect Wallet
      </Button>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Connect your Aptos wallet to start using the platform
      </p>
      
      <WalletModal 
        isOpen={showWalletModal} 
        onClose={() => setShowWalletModal(false)} 
      />
    </div>
  )
}
