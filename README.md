# Ostin - Gamified AI Portfolio Coaches

A decentralized platform for AI-driven portfolio management on Aptos blockchain. Users can mint, stake, and manage AI portfolio coaches that compete on a public leaderboard.

## 🚀 Features

- **AI Coach Minting**: Create unique AI portfolio management agents with custom trading strategies
- **Token Staking**: Stake APT tokens to activate coaches and earn rewards
- **Performance Tracking**: Real-time performance monitoring and scoring
- **Leaderboard**: Public ranking system for all coaches
- **Blockchain Integration**: Built on Aptos testnet with Move smart contracts
- **Modern UI**: Responsive Next.js 15 frontend with Tailwind CSS

## 🏗️ Technical Architecture

### Frontend/Backend (Next.js 15)
- **Framework**: Next.js 15 with App Router and Server Actions
- **Language**: TypeScript with strict type checking
- **Styling**: Tailwind CSS v4 with custom design system
- **Wallet Integration**: Aptos wallet adapters (Petra, Martian) with React context
- **Database**: PostgreSQL with Prisma ORM for data persistence
- **State Management**: React hooks and context for global state
- **API Layer**: RESTful API routes with server-side validation

### Smart Contracts (Move)
- **Platform**: Aptos testnet with Move VM
- **Language**: Move with resource-oriented programming
- **Features**: Coach management, staking, performance tracking, rewards
- **Security**: Resource-based access control and error handling
- **Events**: Comprehensive event logging for frontend integration

## 🔧 Technical Implementation Details

### Database Schema
The application uses PostgreSQL with the following core entities:
- **Coach**: Stores AI coach configurations, performance metrics, and ownership
- **Explanation**: Links performance updates to human-readable explanations
- **PerformanceUpdate**: Tracks historical performance data
- **LeaderboardEntry**: Caches leaderboard rankings for efficient queries

### Smart Contract Architecture
The Move contract implements a resource-oriented design with:
- **Global State**: Centralized storage for all coaches and system state
- **User Resources**: Individual user coach collections
- **Event System**: Comprehensive event emission for frontend synchronization
- **Access Control**: Role-based permissions for admin functions

### API Design
RESTful API endpoints with the following structure:
- `GET /api/leaderboard` - Retrieve current rankings
- `POST /api/mint` - Create new AI coach
- `POST /api/stake` - Stake tokens to activate coach
- `GET /api/performance` - Fetch performance data
- `POST /api/claim-rewards` - Claim performance rewards

### Frontend Architecture
- **Component Structure**: Modular React components with TypeScript
- **Routing**: Next.js App Router with dynamic routes
- **Styling**: Tailwind CSS with custom utility classes
- **State Management**: React Context for wallet and global state
- **Error Handling**: Comprehensive error boundaries and user feedback

### Security Considerations
- **Wallet Integration**: Secure wallet connection with proper error handling
- **Smart Contract Security**: Resource-based access control and input validation
- **API Security**: Server-side validation and rate limiting
- **Data Privacy**: Encrypted sensitive data and secure storage

### Performance Optimizations
- **Database Indexing**: Optimized queries for leaderboard and performance data
- **Caching**: Strategic caching of frequently accessed data
- **Code Splitting**: Lazy loading of components for better performance
- **Image Optimization**: Next.js Image component for efficient asset delivery

## 📁 Project Structure

```
ostin/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # User dashboard
│   ├── leaderboard/       # Public leaderboard
│   └── coach/[id]/        # Individual coach pages
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── ...               # Feature components
├── lib/                  # Utilities and configurations
│   ├── aptosClient.ts    # Aptos SDK setup
│   └── contracts.ts      # Contract interaction functions
├── move/                 # Move smart contracts
│   ├── sources/          # Contract source code
│   └── tests/            # Contract tests
├── prisma/               # Database schema
└── scripts/              # Deployment and setup scripts
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Aptos CLI

### 1. Clone and Install
```bash
git clone <repository-url>
cd ostin
chmod +x scripts/setup.sh
./scripts/setup.sh
```

**Note:** If you encounter errors with Aptos wallet adapter packages, run:
```bash
npm install @aptos-labs/ts-sdk@^5.1.0 @aptos-labs/wallet-adapter-react@^7.1.0 @aptos-labs/wallet-adapter-core@^7.4.0 petra-plugin-wallet-adapter@^0.4.5 @martianwallet/aptos-wallet-adapter@^0.0.5
```

### 2. Environment Configuration
Update `.env` file with your configuration:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/ostin_db"
NEXT_PUBLIC_CONTRACT_ADDRESS="0x123"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Database Setup
```bash
npm run db:push
npm run db:generate
```

### 4. Deploy Smart Contract

#### 4.1. Compile and Deploy

**Windows (PowerShell):**
```powershell
.\scripts\deploy.ps1
```

**Linux/macOS:**
```bash
./scripts/deploy.sh
```

**Manual deployment:**
```bash
cd move
aptos move compile
aptos move publish --profile default
aptos move run --profile default --function-id <deployed-address>::portfolio_coach::initialize
```

#### 4.2. Update Environment
After deployment, update your `.env` file with the deployed contract address:
```env
NEXT_PUBLIC_CONTRACT_ADDRESS="<deployed-address>"
```

### 5. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 🎯 Usage

### For Users
1. **Connect Wallet**: Use Petra or Martian wallet to connect
2. **Mint Coach**: Create an AI coach with custom trading rules
3. **Stake Tokens**: Stake APT to activate your coach
4. **Monitor Performance**: Track your coach's performance on the dashboard
5. **Compete**: Climb the leaderboard and earn rewards

### For Developers
- **API Endpoints**: `/api/leaderboard`, `/api/mint`, `/api/stake`, `/api/performance`
- **Contract Functions**: `mint_coach`, `stake_tokens`, `update_performance`, `claim_rewards`
- **Database Models**: Coach, Explanation, PerformanceUpdate, LeaderboardEntry

## 🔧 Development

### Frontend Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
```

### Smart Contract Development
```bash
cd move
aptos move compile   # Compile contracts
aptos move test      # Run tests
aptos move publish   # Deploy to testnet
```

### Database Management
```bash
npm run db:push      # Push schema changes
npm run db:generate  # Generate Prisma client
npm run db:studio    # Open Prisma Studio
```

## 📊 Smart Contract Technical Details

### Core Functions
- `mint_coach(rules)`: Create a new AI coach with custom trading rules
- `stake_tokens(coach_id, amount)`: Stake APT tokens to activate coach
- `update_performance(coach_id, score, risk_return, explanation_hash)`: Update coach performance metrics
- `claim_rewards(coach_id)`: Claim performance-based rewards
- `add_rewards_pool(amount)`: Admin function to add rewards to the pool

### Data Structures
- **Coach**: Contains ID, owner, rules (JSON), staked amount, performance score, active status, timestamps
- **UserCoaches**: Tracks user's coach collection
- **PortfolioCoach**: Global state with coaches table, leaderboard, and event handles

### Events
- `CoachMintedEvent`: Emitted when a coach is minted with coach ID and owner
- `TokensStakedEvent`: Emitted when tokens are staked with amount and coach ID
- `PerformanceUpdatedEvent`: Emitted when performance is updated with score and risk metrics
- `RewardsClaimedEvent`: Emitted when rewards are claimed with amount and coach ID

### Error Handling
- Comprehensive error codes for all failure scenarios
- Resource-based access control preventing unauthorized operations
- Input validation for all function parameters
- Graceful handling of edge cases and boundary conditions

## 🧪 Testing

### Frontend Tests
```bash
npm run test
```

### Smart Contract Tests
```bash
cd move
aptos move test
```

## 🚀 Deployment

### Frontend (Vercel)
1. Connect repository to Vercel
2. Set environment variables
3. Deploy automatically on push

### Smart Contract (Aptos Testnet)
```bash
./scripts/deploy.sh
```

## 📝 API Documentation

### GET /api/leaderboard
Returns the current leaderboard rankings with pagination support.
**Response:**
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "coachId": "1",
      "score": 9500,
      "owner": "0x123...",
      "stakedAmount": "1000000000"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

### POST /api/mint
Mint a new AI coach with custom trading rules.
**Request:**
```json
{
  "rules": "Trading strategy and rules",
  "riskTolerance": "moderate",
  "investmentHorizon": "long-term"
}
```
**Response:**
```json
{
  "success": true,
  "coachId": "123",
  "transactionHash": "0xabc...",
  "gasUsed": "50000"
}
```

### POST /api/stake
Stake APT tokens to activate a coach.
**Request:**
```json
{
  "coachId": "1",
  "amount": "1000000000"
}
```
**Response:**
```json
{
  "success": true,
  "transactionHash": "0xdef...",
  "newStakedAmount": "1000000000"
}
```

### GET /api/performance?coachId=1
Get comprehensive performance data for a specific coach.
**Response:**
```json
{
  "coachId": "1",
  "performanceScore": 8500,
  "riskAdjustedReturn": 1200,
  "totalStaked": "1000000000",
  "rewardsEarned": "50000000",
  "lastUpdate": "2024-01-15T10:30:00Z",
  "history": [
    {
      "timestamp": "2024-01-15T10:30:00Z",
      "score": 8500,
      "explanation": "Portfolio rebalanced based on market volatility"
    }
  ]
}
```

### POST /api/claim-rewards
Claim performance rewards for a coach.
**Request:**
```json
{
  "coachId": "1"
}
```
**Response:**
```json
{
  "success": true,
  "amountClaimed": "50000000",
  "transactionHash": "0xghi..."
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🔧 Troubleshooting

### Common Issues

#### "Cannot read properties of undefined (reading 'leaderboard')"
This error occurs when the contract is not deployed or not initialized. Follow these steps:

1. **Deploy the contract** (Windows):
   ```powershell
   .\scripts\deploy.ps1
   ```

   Or manually:
   ```bash
   cd move
   aptos move compile
   aptos move publish --profile default
   aptos move run --profile default --function-id <deployed-address>::portfolio_coach::initialize
   ```

2. **Update environment variables**:
   ```env
   NEXT_PUBLIC_CONTRACT_ADDRESS="<deployed-address>"
   ```

3. **Restart the development server**:
   ```bash
   npm run dev
   ```

#### "Resource not found" Error
- Ensure the contract is deployed and initialized
- Check that the contract address in `.env` is correct
- Verify you're connected to the correct network (testnet)

#### Wallet Connection Issues
- Make sure you have Petra or Martian wallet installed
- Check that you're connected to Aptos testnet
- Try refreshing the page and reconnecting

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Join our Discord community
- Check the documentation

---

Built with ❤️ using Next.js, Aptos, and Move.
