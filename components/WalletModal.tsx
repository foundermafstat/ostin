'use client'

import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { Button } from '@/components/ui/Button'

interface WalletModalProps {
  isOpen: boolean
  onClose: () => void
}

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { wallets, connect } = useWallet()

  if (!isOpen) return null

  const handleWalletSelect = async (walletName: string) => {
    try {
      await connect(walletName)
      onClose()
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Connect Wallet</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-3">
          {wallets.map((wallet) => (
            <Button
              key={wallet.name}
              onClick={() => handleWalletSelect(wallet.name)}
              className="w-full justify-start p-4 h-auto"
              variant="outline"
            >
              <div className="flex items-center space-x-3">
                {wallet.icon && (
                  <img 
                    src={wallet.icon} 
                    alt={wallet.name} 
                    className="w-8 h-8"
                  />
                )}
                <div className="text-left">
                  <div className="font-medium">{wallet.name}</div>
                  <div className="text-sm text-gray-500">
                    {wallet.readyState === 'Installed' ? 'Installed' : 'Not Installed'}
                  </div>
                </div>
              </div>
            </Button>
          ))}
        </div>
        
        {wallets.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No wallets available</p>
            <p className="text-sm mt-2">
              Please install a compatible Aptos wallet like Petra or Martian
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
