# Portfolio Coach Smart Contract

This is the smart contract for the "Ostin - Gamified AI Portfolio Coaches" platform on the Aptos blockchain.

## Description

The contract allows users to:
- Mint AI coaches for portfolio management
- Stake tokens to activate coaches
- Update coach performance
- Claim rewards based on performance
- View the leaderboard of coaches

## Structure

### Core Structures:
- `Coach` - Coach structure with rules, stake, and performance
- `UserCoaches` - User's coach collection
- `PortfolioCoach` - Global contract state

### Events:
- `CoachMintedEvent` - Coach created
- `TokensStakedEvent` - Tokens staked
- `PerformanceUpdatedEvent` - Performance updated
- `RewardsClaimedEvent` - Rewards claimed

## Functions

### Entry Functions:
- `mint_coach(account, rules)` - Create new coach
- `stake_tokens(account, coach_id, amount)` - Stake tokens
- `update_performance(account, coach_id, score, risk_return, explanation_hash)` - Update performance
- `claim_rewards(account, coach_id)` - Claim rewards
- `add_rewards_pool(account, amount)` - Add rewards to pool (admin)

### View Functions:
- `get_coach(coach_id)` - Get coach
- `get_leaderboard()` - Get leaderboard
- `get_total_staked()` - Total staked
- `get_total_rewards_pool()` - Total rewards pool
- `get_user_coaches(owner)` - User's coaches

## Deployment

1. Install Aptos CLI:
```bash
curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3
```

2. Initialize account:
```bash
aptos init --profile default
```

3. Compile contract:
```bash
aptos move compile
```

4. Run tests:
```bash
aptos move test
```

5. Deploy to testnet:
```bash
aptos move publish --profile default
aptos move run --profile default --function-id <deployed-address>::portfolio_coach::initialize
```

## Usage

After deployment, the contract will be available at your account address. Use functions through Aptos CLI or integrate with frontend via TypeScript SDK.

## Testing

The contract includes basic tests for core functions. For comprehensive testing, use Aptos CLI or TypeScript SDK.