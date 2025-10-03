module portfolio_coach::portfolio_coach {
    use std::signer;
    use std::vector;
    use std::table::{Self, Table};
    use std::option::{Self, Option};
    use std::error;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::account;
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::timestamp;

    // Error codes
    const E_NOT_INITIALIZED: u64 = 1;
    const E_ALREADY_INITIALIZED: u64 = 2;
    const E_COACH_NOT_FOUND: u64 = 3;
    const E_COACH_NOT_ACTIVE: u64 = 4;
    const E_INSUFFICIENT_BALANCE: u64 = 5;
    const E_INVALID_AMOUNT: u64 = 6;
    const E_UNAUTHORIZED: u64 = 7;
    const E_COACH_ALREADY_ACTIVE: u64 = 8;
    const E_INVALID_SCORE: u64 = 9;

    // Score pair for leaderboard sorting
    struct ScorePair has copy, drop, store {
        score: u64,
        coach_id: u64,
    }

    // Coach struct
    struct Coach has key, store, copy {
        id: u64,
        owner: address,
        rules: vector<u8>, // JSON-encoded rules/prompts
        staked_amount: u64,
        performance_score: u64,
        active: bool,
        created_at: u64,
        last_performance_update: u64,
        total_rewards_claimed: u64,
        risk_adjusted_return: u64, // in basis points (10000 = 100%)
    }

    // User's coach collection
    struct UserCoaches has key {
        coaches: vector<u64>,
    }

    // Global state
    struct PortfolioCoach has key {
        coaches: Table<u64, Coach>,
        next_coach_id: u64,
        total_staked: u64,
        total_rewards_pool: u64,
        leaderboard: Table<u64, u64>, // rank -> coach_id
        leaderboard_length: u64,
        coach_scores: Table<u64, u64>, // coach_id -> score
        events: EventHandle<PerformanceUpdatedEvent>,
        coach_events: EventHandle<CoachMintedEvent>,
        stake_events: EventHandle<TokensStakedEvent>,
        reward_events: EventHandle<RewardsClaimedEvent>,
    }

    // Events
    #[event]
    struct PerformanceUpdatedEvent has drop, store {
        coach_id: u64,
        score: u64,
        explanation_hash: vector<u8>,
    }

    #[event]
    struct CoachMintedEvent has drop, store {
        coach_id: u64,
        owner: address,
    }

    #[event]
    struct TokensStakedEvent has drop, store {
        coach_id: u64,
        amount: u64,
    }

    #[event]
    struct RewardsClaimedEvent has drop, store {
        coach_id: u64,
        amount: u64,
        owner: address,
    }

    // Initialize the module
    public entry fun initialize(account: &signer) {
        let account_addr = signer::address_of(account);
        assert!(!exists<PortfolioCoach>(account_addr), error::already_exists(E_ALREADY_INITIALIZED));

        move_to(account, PortfolioCoach {
            coaches: table::new(),
            next_coach_id: 1,
            total_staked: 0,
            total_rewards_pool: 0,
            leaderboard: table::new(),
            leaderboard_length: 0,
            coach_scores: table::new(),
            events: account::new_event_handle<PerformanceUpdatedEvent>(account),
            coach_events: account::new_event_handle<CoachMintedEvent>(account),
            stake_events: account::new_event_handle<TokensStakedEvent>(account),
            reward_events: account::new_event_handle<RewardsClaimedEvent>(account),
        });
    }

    // Mint a new coach
    public entry fun mint_coach(account: &signer, rules: vector<u8>) {
        let account_addr = signer::address_of(account);
        let portfolio_coach = borrow_global_mut<PortfolioCoach>(@portfolio_coach);
        
        let coach_id = portfolio_coach.next_coach_id;
        let current_time = timestamp::now_seconds();

        let coach = Coach {
            id: coach_id,
            owner: account_addr,
            rules,
            staked_amount: 0,
            performance_score: 0,
            active: false,
            created_at: current_time,
            last_performance_update: current_time,
            total_rewards_claimed: 0,
            risk_adjusted_return: 0,
        };

        table::add(&mut portfolio_coach.coaches, coach_id, coach);
        portfolio_coach.next_coach_id = coach_id + 1;

        // Add to user's coach collection
        if (!exists<UserCoaches>(account_addr)) {
            move_to(account, UserCoaches {
                coaches: vector::empty<u64>(),
            });
        };
        let user_coaches = borrow_global_mut<UserCoaches>(account_addr);
        vector::push_back(&mut user_coaches.coaches, coach_id);

        event::emit(CoachMintedEvent {
            coach_id,
            owner: account_addr,
        });
    }

    // Stake tokens to activate a coach
    public entry fun stake_tokens(account: &signer, coach_id: u64, amount: u64) {
        let account_addr = signer::address_of(account);
        let portfolio_coach = borrow_global_mut<PortfolioCoach>(@portfolio_coach);
        
        assert!(table::contains(&portfolio_coach.coaches, coach_id), error::not_found(E_COACH_NOT_FOUND));
        
        let coach = table::borrow_mut(&mut portfolio_coach.coaches, coach_id);
        assert!(coach.owner == account_addr, error::permission_denied(E_UNAUTHORIZED));
        assert!(amount > 0, error::invalid_argument(E_INVALID_AMOUNT));
        assert!(!coach.active, error::invalid_state(E_COACH_ALREADY_ACTIVE));

        // Transfer APT tokens to the contract
        let coin = coin::withdraw<AptosCoin>(account, amount);
        coin::deposit(@portfolio_coach, coin);

        coach.staked_amount = coach.staked_amount + amount;
        coach.active = true;
        portfolio_coach.total_staked = portfolio_coach.total_staked + amount;

        // Update leaderboard
        update_leaderboard(portfolio_coach, coach_id, coach.performance_score);

        event::emit(TokensStakedEvent {
            coach_id,
            amount,
        });
    }

    // Update coach performance
    public entry fun update_performance(account: &signer, coach_id: u64, new_score: u64, risk_adjusted_return: u64, explanation_hash: vector<u8>) {
        let account_addr = signer::address_of(account);
        let portfolio_coach = borrow_global_mut<PortfolioCoach>(@portfolio_coach);
        
        assert!(table::contains(&portfolio_coach.coaches, coach_id), error::not_found(E_COACH_NOT_FOUND));
        
        let coach = table::borrow_mut(&mut portfolio_coach.coaches, coach_id);
        assert!(coach.owner == account_addr, error::permission_denied(E_UNAUTHORIZED));
        assert!(coach.active, error::invalid_state(E_COACH_NOT_ACTIVE));
        assert!(new_score <= 1000000, error::invalid_argument(E_INVALID_SCORE)); // Max score 1,000,000
        assert!(risk_adjusted_return <= 1000000, error::invalid_argument(E_INVALID_SCORE)); // Max 10000% (1000000 basis points)

        let current_time = timestamp::now_seconds();
        coach.performance_score = new_score;
        coach.risk_adjusted_return = risk_adjusted_return;
        coach.last_performance_update = current_time;
        
        // Update leaderboard
        update_leaderboard(portfolio_coach, coach_id, new_score);

        event::emit(PerformanceUpdatedEvent {
            coach_id,
            score: new_score,
            explanation_hash,
        });
    }

    // Claim rewards based on performance
    public entry fun claim_rewards(account: &signer, coach_id: u64) {
        let account_addr = signer::address_of(account);
        let portfolio_coach = borrow_global_mut<PortfolioCoach>(@portfolio_coach);
        
        assert!(table::contains(&portfolio_coach.coaches, coach_id), error::not_found(E_COACH_NOT_FOUND));
        
        let coach = table::borrow_mut(&mut portfolio_coach.coaches, coach_id);
        assert!(coach.owner == account_addr, error::permission_denied(E_UNAUTHORIZED));
        assert!(coach.active, error::invalid_state(E_COACH_NOT_ACTIVE));

        // Calculate rewards based on performance score and staked amount
        let reward_amount = calculate_rewards(coach.performance_score, coach.staked_amount, portfolio_coach.total_staked);
        
        if (reward_amount > 0) {
            // Transfer rewards from contract to user
            coin::transfer<AptosCoin>(account, account_addr, reward_amount);
            
            coach.total_rewards_claimed = coach.total_rewards_claimed + reward_amount;
            portfolio_coach.total_rewards_pool = portfolio_coach.total_rewards_pool - reward_amount;

            event::emit(RewardsClaimedEvent {
                coach_id,
                amount: reward_amount,
                owner: account_addr,
            });
        };
    }

    // Add rewards to the pool (admin function)
    public entry fun add_rewards_pool(account: &signer, amount: u64) {
        let account_addr = signer::address_of(account);
        assert!(account_addr == @portfolio_coach, error::permission_denied(E_UNAUTHORIZED));
        
        let coin = coin::withdraw<AptosCoin>(account, amount);
        coin::deposit(@portfolio_coach, coin);
        
        let portfolio_coach = borrow_global_mut<PortfolioCoach>(@portfolio_coach);
        portfolio_coach.total_rewards_pool = portfolio_coach.total_rewards_pool + amount;
    }

    // View functions
    public fun get_coach(coach_id: u64): Option<Coach> {
        let portfolio_coach = borrow_global<PortfolioCoach>(@portfolio_coach);
        if (table::contains(&portfolio_coach.coaches, coach_id)) {
            option::some(*table::borrow(&portfolio_coach.coaches, coach_id))
        } else {
            option::none()
        }
    }

    public fun get_leaderboard(): vector<u64> {
        let portfolio_coach = borrow_global<PortfolioCoach>(@portfolio_coach);
        let result = vector::empty<u64>();
        let i = 1;
        while (i <= portfolio_coach.leaderboard_length) {
            let coach_id = *table::borrow(&portfolio_coach.leaderboard, i);
            vector::push_back(&mut result, coach_id);
            i = i + 1;
        };
        result
    }

    public fun get_total_staked(): u64 {
        let portfolio_coach = borrow_global<PortfolioCoach>(@portfolio_coach);
        portfolio_coach.total_staked
    }

    public fun get_total_rewards_pool(): u64 {
        let portfolio_coach = borrow_global<PortfolioCoach>(@portfolio_coach);
        portfolio_coach.total_rewards_pool
    }

    public fun get_user_coaches(owner: address): vector<u64> {
        if (exists<UserCoaches>(owner)) {
            *&borrow_global<UserCoaches>(owner).coaches
        } else {
            vector::empty<u64>()
        }
    }

    // Calculate rewards based on performance and staked amount
    fun calculate_rewards(performance_score: u64, staked_amount: u64, total_staked: u64): u64 {
        if (total_staked == 0) {
            return 0
        };
        
        // Base reward is proportional to staked amount
        let base_reward = (staked_amount * 100) / total_staked; // 1% of total pool per 1% stake
        
        // Performance multiplier (0.1x to 2x based on score)
        let performance_multiplier = (performance_score * 200) / 1000000; // Convert to 0-200 range
        if (performance_multiplier < 10) {
            performance_multiplier = 10; // Minimum 0.1x
        };
        
        (base_reward * performance_multiplier) / 100
    }

    // Helper function to update leaderboard
    fun update_leaderboard(portfolio_coach: &mut PortfolioCoach, coach_id: u64, score: u64) {
        // Store the score
        table::upsert(&mut portfolio_coach.coach_scores, coach_id, score);

        // Simple leaderboard implementation - in production, this would use a more efficient data structure
        // For now, we'll rebuild the leaderboard by sorting all coaches by score
        let coach_scores_vec = vector::empty<ScorePair>();
        let i = 1;
        while (i <= portfolio_coach.leaderboard_length) {
            let existing_coach_id = *table::borrow(&portfolio_coach.leaderboard, i);
            if (table::contains(&portfolio_coach.coach_scores, existing_coach_id)) {
                let existing_score = *table::borrow(&portfolio_coach.coach_scores, existing_coach_id);
                vector::push_back(&mut coach_scores_vec, ScorePair { score: existing_score, coach_id: existing_coach_id });
            };
            i = i + 1;
        };

        // Add the current coach if not already in leaderboard
        let found = false;
        let i = 0;
        while (i < vector::length(&coach_scores_vec)) {
            let existing_pair = *vector::borrow(&coach_scores_vec, i);
            let existing_coach_id = existing_pair.coach_id;
            if (existing_coach_id == coach_id) {
                found = true;
                break
            };
            i = i + 1;
        };

        if (!found) {
            vector::push_back(&mut coach_scores_vec, ScorePair { score, coach_id });
        };

        // Clear and rebuild leaderboard (simplified sorting)
        let leaderboard_length = portfolio_coach.leaderboard_length;
        let i = 1;
        while (i <= leaderboard_length) {
            table::remove(&mut portfolio_coach.leaderboard, i);
            i = i + 1;
        };
        portfolio_coach.leaderboard_length = 0;

        // Add coaches back in order (simplified - in production would use proper sorting)
        let i = 0;
        while (i < vector::length(&coach_scores_vec)) {
            let pair_to_add = *vector::borrow(&coach_scores_vec, i);
            let coach_id_to_add = pair_to_add.coach_id;
            table::add(&mut portfolio_coach.leaderboard, i + 1, coach_id_to_add);
            i = i + 1;
        };
        portfolio_coach.leaderboard_length = vector::length(&coach_scores_vec);
    }

    // Test functions
    #[test_only]
    public fun setup_test(account: &signer) {
        initialize(account);
    }

    #[test]
    public fun test_mint_coach() {
        let account = @0x1;
        setup_test(&account);
        
        let rules = b"Test trading rules";
        mint_coach(&account, rules);
        
        let coach_opt = get_coach(1);
        assert!(option::is_some(&coach_opt), 0);
        
        let coach = option::extract(&mut coach_opt);
        assert!(coach.id == 1, 1);
        assert!(coach.owner == account, 2);
        assert!(coach.staked_amount == 0, 3);
        assert!(!coach.active, 4);
        assert!(coach.performance_score == 0, 5);
        assert!(coach.total_rewards_claimed == 0, 6);
    }

    #[test]
    public fun test_multiple_coaches() {
        let account = @0x1;
        setup_test(&account);
        
        // Mint multiple coaches
        mint_coach(&account, b"Rules 1");
        mint_coach(&account, b"Rules 2");
        
        // Check coach IDs
        let coach1_opt = get_coach(1);
        let coach2_opt = get_coach(2);
        
        assert!(option::is_some(&coach1_opt), 0);
        assert!(option::is_some(&coach2_opt), 1);
        
        // Check ownership
        let coach1 = option::extract(&mut coach1_opt);
        let coach2 = option::extract(&mut coach2_opt);
        
        assert!(coach1.owner == account, 2);
        assert!(coach2.owner == account, 3);
        
        // Check user collection
        let user_coaches = get_user_coaches(account);
        assert!(vector::length(&user_coaches) == 2, 4);
    }

    #[test]
    public fun test_leaderboard_empty() {
        let account = @0x1;
        setup_test(&account);
        
        let leaderboard = get_leaderboard();
        assert!(vector::length(&leaderboard) == 0, 0);
        
        // Mint a coach but don't stake
        mint_coach(&account, b"Rules");
        
        let leaderboard = get_leaderboard();
        assert!(vector::length(&leaderboard) == 0, 1);
    }
}