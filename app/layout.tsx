import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import './globals.css'
import { WalletProvider } from '@/components/WalletProvider'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Navigation } from '@/components/Navigation'
import { Toaster } from '@/components/Toaster'

const montserrat = Montserrat({ 
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-montserrat'
})

export const metadata: Metadata = {
  title: 'Ostin - Gamified AI Portfolio Coaches',
  description: 'AI-driven portfolio management with gamified coaching agents on Aptos blockchain',
  icons: {
    icon: '/ostin.png',
    shortcut: '/ostin.png',
    apple: '/ostin.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${montserrat.variable} font-montserrat`}>
        <ThemeProvider
          defaultTheme="system"
          storageKey="ostin-ui-theme"
        >
          <WalletProvider>
            <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-slate-950 dark:to-blue-950 transition-colors no-hover">
              <Navigation />
              <main className="container mx-auto px-4 py-8 no-hover">
                {children}
              </main>
            </div>
            <Toaster />
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
