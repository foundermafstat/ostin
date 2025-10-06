'use client'

import Link from 'next/link'
import { useWallet } from './WalletProvider'
import { Button } from '@/components/ui/Button'
import { WalletModal } from './WalletModal'
import { WalletDropdown } from './WalletDropdown'
import { ThemeSwitcher } from './ThemeSwitcher'
import { Logo } from './Logo'

export function Navigation() {
  const { 
    connected, 
    account, 
    showWalletModal, 
    setShowWalletModal 
  } = useWallet()

  return (
    <nav className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-blue-800 transition-colors">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center">
            <Logo size="md" />
          </Link>
          
          <div className="flex items-center space-x-6">
            <Link href="/leaderboard" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-slate-700 transition-colors px-3 py-2 rounded-md">
              Leaderboard
            </Link>
            
            
            {connected && account && (
              <>
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-slate-700 transition-colors px-3 py-2 rounded-md">
                  Dashboard
                </Link>
                <Link href="/stake" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-slate-700 transition-colors px-3 py-2 rounded-md">
                  Stake
                </Link>
                
              </>
            )}
            
            <div className="flex items-center space-x-2">
              <ThemeSwitcher />
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
