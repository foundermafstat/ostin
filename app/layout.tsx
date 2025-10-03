import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { WalletProvider } from '@/components/WalletProvider'
import { Navigation } from '@/components/Navigation'
import { Toaster } from '@/components/Toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Ostin - Gamified AI Portfolio Coaches',
  description: 'AI-driven portfolio management with gamified coaching agents on Aptos blockchain',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <WalletProvider>
          <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
            <Navigation />
            <main className="container mx-auto px-4 py-8">
              {children}
            </main>
          </div>
          <Toaster />
        </WalletProvider>
      </body>
    </html>
  )
}
