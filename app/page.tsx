import { Suspense } from 'react'
import { WalletConnect } from '@/components/WalletConnect'
import { LeaderboardPreview } from '@/components/LeaderboardPreview'
import { Hero } from '@/components/Hero'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function HomePage() {
  return (
    <div className="space-y-12">
      <Hero />
      
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">
            Connect Your Wallet
          </h2>
          <p className="text-lg text-gray-600">
            Connect your Aptos wallet to start minting and managing AI portfolio coaches
          </p>
          <WalletConnect />
        </div>
        
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">
            Quick Actions
          </h2>
          <p className="text-lg text-gray-600">
            Manage your coaches and stake tokens
          </p>
          <div className="space-y-4">
            <Link href="/stake" className="block">
              <Button className="w-full">
                Stake Tokens
              </Button>
            </Link>
            <Link href="/leaderboard" className="block">
              <Button variant="outline" className="w-full">
                View Leaderboard
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">
            Top Performers
          </h2>
          <p className="text-lg text-gray-600">
            See the best performing AI coaches on the platform
          </p>
          <Suspense fallback={<div className="animate-pulse bg-gray-200 h-64 rounded-lg" />}>
            <LeaderboardPreview />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
