import { Logo } from './Logo'

export function Hero() {
  return (
    <div className="text-center py-16">
      <div className="mb-8">
        <Logo size="lg" className="mx-auto" />
      </div>
      <h1 className="text-5xl font-bold text-gray-900 mb-6">
        Gamified AI Portfolio Coaches
      </h1>
      <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
        Mint and activate AI-driven portfolio management agents on Aptos blockchain. 
        Stake tokens, earn rewards, and compete on the leaderboard.
      </p>
      
      <div className="grid md:grid-cols-3 gap-8 mt-12">
        <div className="p-6 bg-white rounded-lg shadow-sm border">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
            <span className="text-2xl">🤖</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">AI Coaches</h3>
          <p className="text-gray-600">
            Mint unique AI agents with custom trading strategies and risk management rules.
          </p>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow-sm border">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
            <span className="text-2xl">💰</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">Stake & Earn</h3>
          <p className="text-gray-600">
            Stake tokens to activate your coaches and earn rewards based on performance.
          </p>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow-sm border">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
            <span className="text-2xl">🏆</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">Compete</h3>
          <p className="text-gray-600">
            Climb the leaderboard and showcase your AI coaches' trading performance.
          </p>
        </div>
      </div>
    </div>
  )
}
