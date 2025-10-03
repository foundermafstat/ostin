'use client'

import { useState, useRef, useEffect } from 'react'
import { useWallet } from './WalletProvider'
import { formatAddress, formatNumber } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { ChevronDown, Copy, ExternalLink, LogOut } from 'lucide-react'

export function WalletDropdown() {
  const { account, wallet, balance, disconnect } = useWallet()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Debug logging
  useEffect(() => {
    console.log('WalletDropdown - account:', account)
    console.log('WalletDropdown - wallet:', wallet)
    console.log('WalletDropdown - balance:', balance)
  }, [account, wallet, balance])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleCopyAddress = async () => {
    if (account?.address) {
      try {
        await navigator.clipboard.writeText(account.address)
        // Could add success notification for copying
      } catch (error) {
        console.error('Failed to copy address:', error)
      }
    }
  }

  const handleViewOnExplorer = () => {
    if (account?.address) {
      window.open(`https://explorer.aptoslabs.com/account/${account.address}?network=testnet`, '_blank')
    }
  }

  if (!account || !wallet) return null

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="flex items-center space-x-2"
      >
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="text-sm">
          {formatAddress(account.address)}
        </span>
        <ChevronDown className="w-4 h-4" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Wallet Connected</h3>
              <Button
                onClick={disconnect}
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Disconnect
              </Button>
            </div>

            {/* Wallet Information */}
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-500">Wallet</label>
                <p className="font-medium">{wallet.name}</p>
              </div>

              <div>
                <label className="text-sm text-gray-500">Address</label>
                <div className="flex items-center space-x-2">
                  <p className="font-mono text-sm break-all">{account.address}</p>
                  <Button
                    onClick={handleCopyAddress}
                    size="sm"
                    variant="outline"
                    className="p-1"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* Balance */}
              {balance && (
                <div>
                  <label className="text-sm text-gray-500">Balance</label>
                  <p className="font-medium text-lg">
                    {formatNumber(balance)} APT
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="pt-3 border-t">
                <Button
                  onClick={handleViewOnExplorer}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on Explorer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
