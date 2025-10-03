'use client'

import { ReactNode, createContext, useContext, useState, useEffect } from 'react'
import { AptosWalletAdapterProvider, useWallet as useAptosWallet } from '@aptos-labs/wallet-adapter-react'
import { PetraWallet } from 'petra-plugin-wallet-adapter'
import { MartianWallet } from '@martianwallet/aptos-wallet-adapter'
import { aptosClient } from '@/lib/aptosClient'

interface WalletContextType {
  connected: boolean
  account: { address: string } | null
  wallet: { name: string } | null
  balance: string | null
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  showWalletModal: boolean
  setShowWalletModal: (show: boolean) => void
  signAndSubmitTransaction?: any
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

interface WalletProviderProps {
  children: ReactNode
}

const wallets = [new PetraWallet(), new MartianWallet()]

export function WalletProvider({ children }: WalletProviderProps) {
  return (
    <AptosWalletAdapterProvider plugins={wallets} autoConnect={true}>
      <WalletContextProvider>{children}</WalletContextProvider>
    </AptosWalletAdapterProvider>
  )
}

function WalletContextProvider({ children }: WalletProviderProps) {
  const { connected, account, wallet, connect, disconnect, balance, signAndSubmitTransaction } = useWalletAdapter()
  const [showWalletModal, setShowWalletModal] = useState(false)

  return (
    <WalletContext.Provider value={{ 
      connected, 
      account, 
      wallet, 
      balance,
      connect, 
      disconnect, 
      showWalletModal, 
      setShowWalletModal,
      signAndSubmitTransaction
    }}>
      {children}
    </WalletContext.Provider>
  )
}

function useWalletAdapter() {
  const { connected, account, wallet, connect, disconnect, signAndSubmitTransaction } = useAptosWallet()
  const [balance, setBalance] = useState<string | null>(null)

  // Get balance when wallet connects
  useEffect(() => {
    const fetchBalance = async () => {
      if (connected && account?.address) {
        try {
          const accountResource = await aptosClient.getAccountAPTAmount({
            accountAddress: account.address,
          })
          setBalance((accountResource / 100000000).toFixed(4)) // Convert from octas to APT
        } catch (error) {
          console.error('Failed to fetch balance:', error)
          setBalance(null)
        }
      } else {
        setBalance(null)
      }
    }

    fetchBalance()
  }, [connected, account?.address])

  return {
    connected,
    account: account ? { address: String(account.address || '') } : null,
    wallet: wallet ? { name: wallet.name } : null,
    balance,
    signAndSubmitTransaction,
    connect: async () => {
      try {
        await connect()
      } catch (error) {
        console.error('Failed to connect wallet:', error)
      }
    },
    disconnect: async () => {
      try {
        await disconnect()
        setBalance(null)
      } catch (error) {
        console.error('Failed to disconnect wallet:', error)
      }
    },
  }
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}
