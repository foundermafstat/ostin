import { Suspense } from 'react'
import { WalletConnect } from '@/components/WalletConnect'
import { LeaderboardPreview } from '@/components/LeaderboardPreview'
import { Hero } from '@/components/Hero'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { 
  Brain, 
  TrendingUp, 
  Trophy, 
  Shield, 
  Zap, 
  Users, 
  BarChart3, 
  Lock,
  Globe,
  Target,
  Award,
  ChevronRight
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <Hero />
      
      {/* Problem & Solution */}
      <section className="py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            The Future of 
            <span className="text-blue-600 dark:text-blue-400"> AI Portfolio Management</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Traditional portfolio management is complex, time-consuming, and often inaccessible. 
            Ostin revolutionizes this with gamified AI coaches that compete, learn, and optimize your investments 24/7.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Market Complexity</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Cryptocurrency markets operate 24/7 with extreme volatility. Manual trading requires constant attention and expertise that most investors lack.
            </p>
            
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Accessibility Barriers</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Professional portfolio management services are expensive and often require significant minimum investments, excluding most retail investors.
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-2xl p-8 border dark:border-gray-700">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">AI-Powered Solutions</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Our AI coaches never sleep, continuously analyzing market conditions and executing optimized trading strategies tailored to your risk profile.
              </p>
              
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Gamified Experience</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Turn portfolio management into an engaging competition. Watch your coaches climb the leaderboard and earn rewards based on performance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="p-10 bg-gray-50 dark:bg-gray-900 rounded-2xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Powerful Features
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Everything you need to create, manage, and optimize your AI portfolio coaches
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border dark:border-gray-700 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
              <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">AI Coach Minting</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Create unique AI portfolio management agents with custom trading strategies and risk parameters.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border dark:border-gray-700 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Token Staking</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Stake APT tokens to activate your coaches and earn performance-based rewards.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border dark:border-gray-700 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Performance Tracking</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Real-time performance monitoring, scoring, and detailed analytics for all your coaches.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border dark:border-gray-700 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mb-4">
              <Trophy className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Public Leaderboard</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Compete with other users on a transparent, public ranking system based on performance.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border dark:border-gray-700 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Blockchain Security</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Built on Aptos blockchain with Move smart contracts ensuring security and transparency.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border dark:border-gray-700 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900 rounded-lg flex items-center justify-center mb-4">
              <Award className="w-6 h-6 text-pink-600 dark:text-pink-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Reward System</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Earn rewards based on your coaches' performance and climb the competitive rankings.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Get started with Ostin in just a few simple steps
          </p>
        </div>
        
        <div className="grid md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">1</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Connect Wallet</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Connect your Aptos wallet to access the platform and manage your portfolio.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">2</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Mint Coach</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Create your AI portfolio coach with custom trading strategies and rules.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">3</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Stake Tokens</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Stake APT tokens to activate your coach and make it eligible for rewards.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">4</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Earn & Compete</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Watch your coach perform, earn rewards, and climb the leaderboard rankings.
            </p>
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-2xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Built on Cutting-Edge Technology
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Leveraging the latest in blockchain technology and AI innovation
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12 p-10">
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Blockchain Infrastructure</h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-gray-700 dark:text-gray-300">Aptos Testnet - High-performance blockchain</span>
              </div>
              <div className="flex items-center space-x-3">
                <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-gray-700 dark:text-gray-300">Move Smart Contracts - Resource-oriented security</span>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-gray-700 dark:text-gray-300">Decentralized Architecture - No single point of failure</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Modern Web Stack</h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="text-gray-700 dark:text-gray-300">Next.js 15 - Latest React framework</span>
              </div>
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="text-gray-700 dark:text-gray-300">TypeScript - Type-safe development</span>
              </div>
              <div className="flex items-center space-x-3">
                <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="text-gray-700 dark:text-gray-300">Tailwind CSS - Modern styling system</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 text-center">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Start Your AI Portfolio Journey?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join the future of decentralized portfolio management. Create your first AI coach today and start competing on the leaderboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700">
                Get Started
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/leaderboard">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                View Leaderboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Jump right into the action with these quick tools
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Connect Your Wallet
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Connect your Aptos wallet to start minting and managing AI portfolio coaches
            </p>
            <WalletConnect />
          </div>
          
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Manage Portfolio
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Stake tokens and manage your AI coaches
            </p>
            <div className="space-y-4">
              <Link href="/stake" className="block">
                <Button className="w-full">
                  Stake Tokens
                </Button>
              </Link>
              <Link href="/dashboard" className="block">
                <Button variant="outline" className="w-full">
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Top Performers
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              See the best performing AI coaches on the platform
            </p>
            <Suspense fallback={<div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-64 rounded-lg" />}>
              <LeaderboardPreview />
            </Suspense>
          </div>
        </div>
      </section>
    </div>
  )
}
