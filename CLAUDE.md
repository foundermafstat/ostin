You are an expert fullstack blockchain developer.  
Your task is to create a complete working project called "Ostin - Gamified AI Portfolio Coaches".  
The project consists of a frontend and backend built with Next.js 15 (TypeScript) and smart contracts written in Move, deployed on the Aptos testnet.  

# Project Goal
- Users can mint and activate AI-driven "coach agents" that manage portfolios.
- Coaches are represented as on-chain objects (NFT-like).
- Users stake tokens to activate a coach.
- Performance rewards are distributed based on risk-adjusted returns.
- A public leaderboard shows coaches ranked by performance.
- Each trade includes a natural-language explanation retrievable by the frontend.

# Tech Requirements

## Frontend/Backend (Next.js 15)
- Use App Router with server actions.
- Integrate with Aptos SDK (TypeScript).
- Authentication via wallet connect (Petra, Martian).
- API routes:
  - /api/leaderboard → fetch leaderboard from Move contract
  - /api/mint → mint a new coach
  - /api/stake → stake tokens to activate a coach
  - /api/performance → fetch coach performance
- UI Pages:
  - / → Landing with leaderboard preview + connect wallet
  - /dashboard → User’s minted coaches + stats
  - /leaderboard → Full leaderboard
  - /coach/[id] → Detailed coach page (rules, performance, explanations)
- Store explanations:
  - Either on-chain (event logs) or off-chain (Postgres + Prisma) with hash stored on-chain.

## Smart Contract (Move, Aptos)
Module: portfolio_coach.move

1. Coach struct:
   struct Coach has key, store {
       id: u64,
       owner: address,
       rules: vector<u8>, // JSON-encoded rules/prompts
       staked_amount: u64,
       performance_score: u64,
       active: bool
   }

2. Functions:
   - mint_coach(account: &signer, rules: vector<u8>)
   - stake_tokens(account: &signer, coach_id: u64, amount: u64)
   - update_performance(account: &signer, coach_id: u64, new_score: u64)
   - claim_rewards(account: &signer, coach_id: u64)
   - view functions: get_coach(coach_id: u64), get_leaderboard()

3. Events:
   - PerformanceUpdated { coach_id, score, explanation_hash }
   - CoachMinted { coach_id, owner }
   - TokensStaked { coach_id, amount }

4. Rewards:
   - Rewards distributed to top performers based on staked tokens.

## Deliverables
1. Full Next.js 15 project with wallet connect, API integration, and UI.
2. Move smart contract with unit tests, deployable to Aptos testnet.
3. Deployment scripts (aptos move publish).
4. Documentation with setup instructions.


Структура проекта
Frontend (Next.js 15 + TS)
/app
  page.tsx                -> Landing page
  /dashboard/page.tsx     -> User dashboard
  /leaderboard/page.tsx   -> Leaderboard
  /coach/[id]/page.tsx    -> Coach details page

/components
  WalletConnect.tsx
  LeaderboardTable.tsx
  CoachCard.tsx

/lib
  aptosClient.ts          -> Aptos SDK setup
  contracts.ts            -> Contract interaction functions

/api
  /leaderboard/route.ts   -> Fetch leaderboard
  /mint/route.ts          -> Mint coach
  /stake/route.ts         -> Stake coach
  /performance/route.ts   -> Fetch performance

/prisma
  schema.prisma           -> DB schema for explanations (if off-chain)


Smart Contract (Move, Aptos)
/move
  /sources
    portfolio_coach.move  -> Main contract
  /tests
    portfolio_coach_test.move
  Move.toml


  Transaction submitted: https://explorer.aptoslabs.com/txn/0x962fae81522fc5f96d87da6405d442052f3616012699b63ff2c38b9e7ce7b9b4?network=testnet
{
  "Result": {
    "transaction_hash": "0x962fae81522fc5f96d87da6405d442052f3616012699b63ff2c38b9e7ce7b9b4",
    "gas_used": 4497,
    "gas_unit_price": 100,
    "sender": "b072ec1cffe2cf7888420e00bdcbef08eea61ce639924246218b3a3d84623217",
    "sequence_number": 0,
    "replay_protector": {
      "SequenceNumber": 0
    },
    "success": true,
    "timestamp_us": 1759493622556236,
    "version": 6893241025,
    "vm_status": "Executed successfully"
  }
}
