'use client'

import Link from 'next/link'
import { useWallet } from './WalletProvider'
import { Button } from '@/components/ui/Button'
import { WalletModal } from './WalletModal'
import { WalletDropdown } from './WalletDropdown'

export function Navigation() {
  const { 
    connected, 
    account, 
    showWalletModal, 
    setShowWalletModal 
  } = useWallet()

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-primary-600">
            Ostin
          </Link>
          
          <div className="flex items-center space-x-6">
            <Link href="/leaderboard" className="text-gray-600 hover:text-gray-900">
              Leaderboard
            </Link>
            
            {connected && account && (
              <>
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                  Dashboard
                </Link>
                <Link href="/stake" className="text-gray-600 hover:text-gray-900">
                  Stake
                </Link>
              </>
            )}
            
            <div className="flex items-center space-x-2">
              {connected && account ? (
                <WalletDropdown />
              ) : (
                <Button 
                  size="sm"
                  onClick={() => setShowWalletModal(true)}
                >
                  Connect Wallet
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <WalletModal 
        isOpen={showWalletModal} 
        onClose={() => setShowWalletModal(false)} 
      />
    </nav>
  )
}
