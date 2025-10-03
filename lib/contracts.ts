import { aptosClient, CONTRACT_MODULE } from './aptosClient'
import { Account } from '@aptos-labs/ts-sdk'

export interface Coach {
  id: number
  owner: string
  rules: string
  staked_amount: number
  performance_score: number
  active: boolean
  created_at: number
  last_performance_update: number
  total_rewards_claimed: number
  risk_adjusted_return: number
}

export interface LeaderboardEntry {
  coach_id: number
  owner: string
  performance_score: number
  staked_amount: number
}

export async function mintCoach(account: { address: string }, rules: string, signAndSubmitTransaction: any): Promise<string> {
  // Validate inputs
  if (!account) {
    throw new Error('Account is required')
  }
  
  if (!account.address) {
    throw new Error('Account address is not available')
  }
  
  if (!rules || typeof rules !== 'string') {
    throw new Error('Rules must be a non-empty string')
  }
  
  if (rules.length > 1000) {
    throw new Error('Rules must be less than 1000 characters')
  }

  // Convert string to Uint8Array for vector<u8>
  const rulesBytes = new Uint8Array(Buffer.from(rules, 'utf8'))
  
  console.log('Minting coach with rules:', rules)
  console.log('Rules bytes length:', rulesBytes.length)
  console.log('Account address:', account.address)
  console.log('Contract module:', CONTRACT_MODULE)
  console.log('signAndSubmitTransaction type:', typeof signAndSubmitTransaction)
  
  try {
    // Build the transaction
    const transaction = await aptosClient.transaction.build.simple({
      sender: account.address,
      data: {
        function: `${CONTRACT_MODULE}::mint_coach`,
        typeArguments: [],
        functionArguments: [rulesBytes],
      },
    })

    console.log('Transaction built successfully:', transaction)

    // Check if signAndSubmitTransaction is available and is a function
    if (!signAndSubmitTransaction || typeof signAndSubmitTransaction !== 'function') {
      throw new Error('Wallet transaction function is not available. Please reconnect your wallet.')
    }

    // Submit the transaction
    const committedTransaction = await signAndSubmitTransaction(transaction)

    console.log('Transaction submitted:', committedTransaction.hash)

    // Wait for transaction confirmation
    await aptosClient.waitForTransaction({
      transactionHash: committedTransaction.hash,
    })

    console.log('Transaction confirmed:', committedTransaction.hash)
    return committedTransaction.hash
  } catch (error) {
    console.error('Error in mintCoach transaction:', error)
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Resource not found')) {
        throw new Error('Contract not found. Please make sure the contract is deployed and initialized.')
      } else if (error.message.includes('insufficient balance')) {
        throw new Error('Insufficient balance. Please make sure you have enough APT tokens.')
      } else if (error.message.includes('rejected')) {
        throw new Error('Transaction was rejected by the user.')
      } else if (error.message.includes('timeout')) {
        throw new Error('Transaction timed out. Please try again.')
      } else if (error.message.includes('Cannot use \'in\' operator')) {
        throw new Error('Wallet connection issue. Please reconnect your wallet.')
      }
    }
    
    throw error
  }
}

// Alternative mint function that doesn't require signAndSubmitTransaction
export async function mintCoachSimple(account: { address: string }, rules: string): Promise<string> {
  // Validate inputs
  if (!account) {
    throw new Error('Account is required')
  }
  
  if (!account.address) {
    throw new Error('Account address is not available')
  }
  
  if (!rules || typeof rules !== 'string') {
    throw new Error('Rules must be a non-empty string')
  }
  
  if (rules.length > 1000) {
    throw new Error('Rules must be less than 1000 characters')
  }

  // Convert string to Uint8Array for vector<u8>
  const rulesBytes = new Uint8Array(Buffer.from(rules, 'utf8'))
  
  console.log('Minting coach with simple method...')
  console.log('Rules:', rules)
  console.log('Account address:', account.address)
  console.log('Contract module:', CONTRACT_MODULE)
  
  try {
    // Build the transaction
    const transaction = await aptosClient.transaction.build.simple({
      sender: account.address,
      data: {
        function: `${CONTRACT_MODULE}::mint_coach`,
        typeArguments: [],
        functionArguments: [rulesBytes],
      },
    })

    console.log('Transaction built successfully:', transaction)

    // For now, we'll return a mock transaction hash
    // In a real implementation, this would need to be signed by the wallet
    const mockTransactionHash = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    console.log('Mock transaction hash:', mockTransactionHash)
    
    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    return mockTransactionHash
  } catch (error) {
    console.error('Error in mintCoachSimple:', error)
    throw error
  }
}

export async function stakeTokens(account: { address: string }, coachId: number, amount: number, signAndSubmitTransaction: any): Promise<string> {
  try {
    const transaction = await aptosClient.transaction.build.simple({
      sender: account.address,
      data: {
        function: `${CONTRACT_MODULE}::stake_tokens`,
        typeArguments: [],
        functionArguments: [coachId, amount],
      },
    })

    const committedTransaction = await signAndSubmitTransaction(transaction)

    await aptosClient.waitForTransaction({
      transactionHash: committedTransaction.hash,
    })

    return committedTransaction.hash
  } catch (error) {
    console.error('Error in stakeTokens transaction:', error)
    throw error
  }
}

export async function updatePerformance(account: { address: string }, coachId: number, newScore: number, riskAdjustedReturn: number, explanationHash: string, signAndSubmitTransaction: any): Promise<string> {
  // Convert string to Uint8Array for vector<u8>
  const explanationHashBytes = new Uint8Array(Buffer.from(explanationHash, 'utf8'))
  
  try {
    const transaction = await aptosClient.transaction.build.simple({
      sender: account.address,
      data: {
        function: `${CONTRACT_MODULE}::update_performance`,
        typeArguments: [],
        functionArguments: [coachId, newScore, riskAdjustedReturn, explanationHashBytes],
      },
    })

    const committedTransaction = await signAndSubmitTransaction(transaction)

    await aptosClient.waitForTransaction({
      transactionHash: committedTransaction.hash,
    })

    return committedTransaction.hash
  } catch (error) {
    console.error('Error in updatePerformance transaction:', error)
    throw error
  }
}

export async function claimRewards(account: { address: string }, coachId: number, signAndSubmitTransaction: any): Promise<string> {
  try {
    const transaction = await aptosClient.transaction.build.simple({
      sender: account.address,
      data: {
        function: `${CONTRACT_MODULE}::claim_rewards`,
        typeArguments: [],
        functionArguments: [coachId],
      },
    })

    const committedTransaction = await signAndSubmitTransaction(transaction)

    await aptosClient.waitForTransaction({
      transactionHash: committedTransaction.hash,
    })

    return committedTransaction.hash
  } catch (error) {
    console.error('Error in claimRewards transaction:', error)
    throw error
  }
}

export async function getCoach(coachId: number): Promise<Coach | null> {
  try {
    if (!CONTRACT_MODULE.split('::')[0]) {
      console.warn('Contract address not set')
      return null
    }

    const resource = await aptosClient.getAccountResource({
      accountAddress: CONTRACT_MODULE.split('::')[0],
      resourceType: `${CONTRACT_MODULE}::PortfolioCoach`,
    })

    if (!resource || !resource.data) {
      console.warn('Contract not initialized or resource not found')
      return null
    }

    // Get the coaches table handle
    const coachesHandle = resource.data.coaches.handle
    
    // Get the specific coach from the table
    const coachData = await aptosClient.getTableItem({
      handle: coachesHandle,
      data: {
        key_type: 'u64',
        value_type: `${CONTRACT_MODULE}::Coach`,
        key: coachId.toString(),
      },
    })
    
    if (!coachData) {
      return null
    }

    return {
      id: coachData.id,
      owner: coachData.owner,
      rules: new TextDecoder().decode(new Uint8Array(coachData.rules)),
      staked_amount: coachData.staked_amount,
      performance_score: coachData.performance_score,
      active: coachData.active,
      created_at: coachData.created_at,
      last_performance_update: coachData.last_performance_update,
      total_rewards_claimed: coachData.total_rewards_claimed,
      risk_adjusted_return: coachData.risk_adjusted_return,
    }
  } catch (error) {
    console.error('Error fetching coach:', error)
    return null
  }
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    if (!CONTRACT_MODULE.split('::')[0]) {
      console.warn('Contract address not set')
      return []
    }

    console.log('Fetching leaderboard from:', CONTRACT_MODULE)
    
    const resource = await aptosClient.getAccountResource({
      accountAddress: CONTRACT_MODULE.split('::')[0],
      resourceType: `${CONTRACT_MODULE}::PortfolioCoach`,
    })
    
    console.log('Resource fetched:', resource)
    
    // Check if the contract is initialized
    const resourceData = resource?.data || resource
    if (!resource || !resourceData) {
      console.warn('Contract not initialized or resource not found')
      return []
    }

    // Get leaderboard data
    const leaderboard = resourceData.leaderboard as any
    const coaches = resourceData.coaches as any
    const leaderboardLength = parseInt(resourceData.leaderboard_length as string)
    const nextCoachId = parseInt(resourceData.next_coach_id as string)
    
    if (!leaderboard || !coaches || isNaN(leaderboardLength) || isNaN(nextCoachId)) {
      console.warn('Leaderboard or coaches data not found, or contract not initialized')
      return []
    }
    
    const leaderboardEntries: LeaderboardEntry[] = []
    
    console.log(`Leaderboard length: ${leaderboardLength}, Next coach ID: ${nextCoachId}`)
    console.log('Coaches table handle:', coaches)
    
    // Always get all coaches first, then sort them
    console.log('Fetching all coaches...')
    
    // Get all coaches from the coaches table
    for (let coachId = 1; coachId < nextCoachId; coachId++) {
      try {
        console.log(`Fetching coach ${coachId} from table...`)
        const coach = await aptosClient.getTableItem({
          handle: coaches.handle,
          data: {
            key_type: 'u64',
            value_type: `${CONTRACT_MODULE}::Coach`,
            key: coachId.toString(),
          },
        })
        
        console.log(`Coach ${coachId} data:`, coach)
        
        if (coach) {
          console.log(`Found coach ${coachId}:`, {
            owner: coach.owner,
            performance_score: coach.performance_score,
            staked_amount: coach.staked_amount,
            active: coach.active
          })
          
          leaderboardEntries.push({
            coach_id: coachId,
            owner: coach.owner,
            performance_score: coach.performance_score,
            staked_amount: coach.staked_amount,
          })
        }
      } catch (error) {
        console.warn(`Error fetching coach ${coachId}:`, error)
        // Continue with next coach
      }
    }
    
    // Sort by performance score (descending), then by staked amount (descending)
    leaderboardEntries.sort((a, b) => {
      const scoreA = parseInt(a.performance_score)
      const scoreB = parseInt(b.performance_score)
      const stakeA = parseInt(a.staked_amount)
      const stakeB = parseInt(b.staked_amount)
      
      // First sort by performance score
      if (scoreA !== scoreB) {
        return scoreB - scoreA
      }
      
      // Then by staked amount
      return stakeB - stakeA
    })
    
    console.log(`Returning ${leaderboardEntries.length} coaches sorted by performance`)
    
    return leaderboardEntries
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    if (error instanceof Error && error.message.includes('Resource not found')) {
      console.warn('Contract resource not found. Make sure the contract is deployed.')
    }
    return []
  }
}

export async function getUserCoaches(userAddress: string): Promise<Coach[]> {
  try {
    if (!CONTRACT_MODULE.split('::')[0]) {
      console.warn('Contract address not set')
      return []
    }

    // Get user's coach IDs from UserCoaches resource
    const userCoachesResource = await aptosClient.getAccountResource({
      accountAddress: userAddress,
      resourceType: `${CONTRACT_MODULE}::UserCoaches`,
    })

    if (!userCoachesResource || !userCoachesResource.data) {
      console.warn('User coaches resource not found - user has no coaches yet')
      return []
    }

    const coachIds = userCoachesResource.data.coaches as string[]
    
    // Get each coach from the main contract
    const coaches: Coach[] = []
    for (const coachId of coachIds) {
      const coach = await getCoach(parseInt(coachId))
      if (coach) {
        coaches.push(coach)
      }
    }
    
    return coaches
  } catch (error) {
    console.error('Error fetching user coaches:', error)
    // If resource not found, return empty array (user has no coaches)
    if (error instanceof Error && error.message.includes('Resource not found')) {
      console.warn('User has no coaches yet')
      return []
    }
    return []
  }
}

export async function initializeContract(account: { address: string }, signAndSubmitTransaction?: any): Promise<string> {
  // Validate inputs
  if (!account) {
    throw new Error('Account is required')
  }
  
  if (!account.address) {
    throw new Error('Account address is not available')
  }
  
  console.log('Checking contract status with account:', account.address)
  console.log('Contract module:', CONTRACT_MODULE)
  console.log('signAndSubmitTransaction type:', typeof signAndSubmitTransaction)
  console.log('signAndSubmitTransaction:', signAndSubmitTransaction)
  
  try {
    // First, check if contract is already initialized
    const isInitialized = await isContractInitialized()
    
    if (isInitialized) {
      console.log('Contract is already initialized')
      return 'Contract is already initialized and ready to use'
    }
    
    // If not initialized, try to initialize it
    console.log('Contract not initialized, attempting to initialize...')
    
    if (!signAndSubmitTransaction) {
      throw new Error('Wallet signAndSubmitTransaction is required. Please ensure your wallet is properly connected.')
    }
    
    if (typeof signAndSubmitTransaction !== 'function') {
      throw new Error(`signAndSubmitTransaction must be a function, got ${typeof signAndSubmitTransaction}`)
    }
    
    console.log('Building initialization transaction...')
    const transaction = await aptosClient.transaction.build.simple({
      sender: account.address,
      data: {
        function: `${CONTRACT_MODULE}::initialize`,
        typeArguments: [],
        functionArguments: [],
      },
    })
    
    console.log('Transaction built successfully:', transaction)

    console.log('Using wallet adapter signAndSubmitTransaction')
    const committedTransaction = await signAndSubmitTransaction(transaction)

    await aptosClient.waitForTransaction({
      transactionHash: committedTransaction.hash,
    })

    console.log('Contract initialized successfully!')
    return committedTransaction.hash
  } catch (error) {
    console.error('Error in initializeContract:', error)
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Resource not found')) {
        throw new Error('Contract not found. Please make sure the contract is deployed.')
      } else if (error.message.includes('insufficient balance')) {
        throw new Error('Insufficient balance. Please make sure you have enough APT tokens.')
      } else if (error.message.includes('rejected')) {
        throw new Error('Transaction was rejected by the user.')
      } else if (error.message.includes('timeout')) {
        throw new Error('Transaction timed out. Please try again.')
      } else if (error.message.includes('already initialized')) {
        throw new Error('Contract is already initialized and ready to use.')
      }
    }
    
    throw error
  }
}

export async function getAccountBalance(address: string): Promise<string> {
  try {
    const resources = await aptosClient.getAccountResources({
      accountAddress: address,
    })
    
    const aptosCoinResource = resources.find(
      (resource) => resource.type === '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>'
    )
    
    if (aptosCoinResource) {
      return (aptosCoinResource.data as any).coin.value
    }
    
    return '0'
  } catch (error) {
    console.error('Error fetching account balance:', error)
    return '0'
  }
}

export async function getTotalStaked(): Promise<string> {
  try {
    if (!CONTRACT_MODULE.split('::')[0]) {
      console.warn('Contract address not set')
      return '0'
    }

    const resource = await aptosClient.getAccountResource({
      accountAddress: CONTRACT_MODULE.split('::')[0],
      resourceType: `${CONTRACT_MODULE}::PortfolioCoach`,
    })

    if (!resource || !resource.data) {
      console.warn('Contract not initialized or resource not found')
      return '0'
    }

    return resource.data.total_staked.toString()
  } catch (error) {
    console.error('Error fetching total staked:', error)
    return '0'
  }
}

export async function getTotalRewardsPool(): Promise<string> {
  try {
    if (!CONTRACT_MODULE.split('::')[0]) {
      console.warn('Contract address not set')
      return '0'
    }

    const resource = await aptosClient.getAccountResource({
      accountAddress: CONTRACT_MODULE.split('::')[0],
      resourceType: `${CONTRACT_MODULE}::PortfolioCoach`,
    })

    if (!resource || !resource.data) {
      console.warn('Contract not initialized or resource not found')
      return '0'
    }

    return resource.data.total_rewards_pool.toString()
  } catch (error) {
    console.error('Error fetching total rewards pool:', error)
    return '0'
  }
}

export async function getLeaderboardLength(): Promise<number> {
  try {
    if (!CONTRACT_MODULE.split('::')[0]) {
      console.warn('Contract address not set')
      return 0
    }

    const resource = await aptosClient.getAccountResource({
      accountAddress: CONTRACT_MODULE.split('::')[0],
      resourceType: `${CONTRACT_MODULE}::PortfolioCoach`,
    })

    if (!resource || !resource.data) {
      console.warn('Contract not initialized or resource not found')
      return 0
    }

    return parseInt(resource.data.leaderboard_length as string)
  } catch (error) {
    console.error('Error fetching leaderboard length:', error)
    return 0
  }
}

export async function isContractInitialized(): Promise<boolean> {
  try {
    if (!CONTRACT_MODULE.split('::')[0]) {
      return false
    }

    const resource = await aptosClient.getAccountResource({
      accountAddress: CONTRACT_MODULE.split('::')[0],
      resourceType: `${CONTRACT_MODULE}::PortfolioCoach`,
    })

    // Check if resource exists and has the expected structure
    // In newer Aptos SDK, data is directly in resource, not resource.data
    const resourceData = resource?.data || resource;
    
    if (resource && resourceData && typeof resourceData === 'object') {
      // Check for key fields that indicate initialization
      return resourceData.hasOwnProperty('next_coach_id') || 
             resourceData.hasOwnProperty('coaches') ||
             resourceData.hasOwnProperty('leaderboard')
    }

    return false
  } catch (error) {
    console.error('Error checking contract initialization:', error)
    return false
  }
}

export async function getContractStatus(): Promise<{
  initialized: boolean
  address: string
  error?: string
}> {
  try {
    if (!CONTRACT_MODULE.split('::')[0]) {
      return {
        initialized: false,
        address: '',
        error: 'Contract address not set'
      }
    }

    const resource = await aptosClient.getAccountResource({
      accountAddress: CONTRACT_MODULE.split('::')[0],
      resourceType: `${CONTRACT_MODULE}::PortfolioCoach`,
    })

    // Check if resource exists and has the expected structure
    // In newer Aptos SDK, data is directly in resource, not resource.data
    const resourceData = resource?.data || resource;
    let initialized = false
    
    if (resource && resourceData && typeof resourceData === 'object') {
      // Check for key fields that indicate initialization
      initialized = resourceData.hasOwnProperty('next_coach_id') || 
                   resourceData.hasOwnProperty('coaches') ||
                   resourceData.hasOwnProperty('leaderboard')
    }

    return {
      initialized,
      address: CONTRACT_MODULE.split('::')[0]
    }
  } catch (error) {
    console.error('Error checking contract status:', error)
    return {
      initialized: false,
      address: CONTRACT_MODULE.split('::')[0],
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function checkContractStatus(): Promise<{
  status: 'initialized' | 'not_initialized' | 'error'
  message: string
  address: string
  error?: string
}> {
  try {
    console.log('=== checkContractStatus ===')
    console.log('Contract address:', CONTRACT_MODULE.split('::')[0])
    console.log('Full module:', CONTRACT_MODULE)
    
    // Try to get the PortfolioCoach resource
    const resource = await aptosClient.getAccountResource({
      accountAddress: CONTRACT_MODULE.split('::')[0],
      resourceType: `${CONTRACT_MODULE}::PortfolioCoach`,
    })
    
    console.log('Resource response:', resource)
    console.log('Resource found:', !!resource)
    console.log('Resource data exists:', !!resource?.data)
    console.log('Resource data:', resource?.data)
    
    // Check if resource exists and has the expected structure
    // In newer Aptos SDK, data is directly in resource, not resource.data
    const resourceData = resource?.data || resource;
    
    if (resource && resourceData && typeof resourceData === 'object') {
      // Check for key fields that indicate initialization
      const hasNextCoachId = resourceData.hasOwnProperty('next_coach_id')
      const hasCoaches = resourceData.hasOwnProperty('coaches')
      const hasLeaderboard = resourceData.hasOwnProperty('leaderboard')
      const hasRequiredFields = hasNextCoachId || hasCoaches || hasLeaderboard
      
      console.log('Field checks:', {
        hasNextCoachId,
        hasCoaches,
        hasLeaderboard,
        hasRequiredFields
      })
      console.log('Resource data keys:', Object.keys(resourceData))
      console.log('next_coach_id value:', resourceData.next_coach_id)
      console.log('coaches value:', resourceData.coaches)
      console.log('leaderboard value:', resourceData.leaderboard)
      
      if (hasRequiredFields) {
        return {
          status: 'initialized',
          message: 'Contract is initialized and ready to use',
          address: CONTRACT_MODULE.split('::')[0]
        }
      }
    }
    
    // If we get here, the resource exists but doesn't have the expected structure
    // This means the contract is deployed but not properly initialized
    return {
      status: 'not_initialized',
      message: 'Contract is deployed but not properly initialized. The contract needs to be initialized by the deployer.',
      address: CONTRACT_MODULE.split('::')[0]
    }
  } catch (error) {
    console.error('Error checking contract status:', error)
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    
    // Check if it's a "Resource not found" error
    if (error instanceof Error && (
      error.message.includes('Resource not found') ||
      error.message.includes('not found') ||
      error.message.includes('404')
    )) {
      return {
        status: 'not_initialized',
        message: 'Contract is not deployed or not initialized. The contract needs to be deployed and initialized by the deployer.',
        address: CONTRACT_MODULE.split('::')[0]
      }
    }
    
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      address: CONTRACT_MODULE.split('::')[0] || '',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function getContractInfo(): Promise<{
  address: string
  module: string
  initialized: boolean
  error?: string
}> {
  try {
    if (!CONTRACT_MODULE.split('::')[0]) {
      return {
        address: '',
        module: '',
        initialized: false,
        error: 'Contract address not set'
      }
    }

    const resource = await aptosClient.getAccountResource({
      accountAddress: CONTRACT_MODULE.split('::')[0],
      resourceType: `${CONTRACT_MODULE}::PortfolioCoach`,
    })

    return {
      address: CONTRACT_MODULE.split('::')[0],
      module: CONTRACT_MODULE,
      initialized: !!(resource && resource.data)
    }
  } catch (error) {
    console.error('Error checking contract info:', error)
    return {
      address: CONTRACT_MODULE.split('::')[0],
      module: CONTRACT_MODULE,
      initialized: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function getContractHealth(): Promise<{
  status: 'healthy' | 'unhealthy' | 'unknown'
  message: string
  details?: any
}> {
  try {
    if (!CONTRACT_MODULE.split('::')[0]) {
      return {
        status: 'unhealthy',
        message: 'Contract address not set'
      }
    }

    const resource = await aptosClient.getAccountResource({
      accountAddress: CONTRACT_MODULE.split('::')[0],
      resourceType: `${CONTRACT_MODULE}::PortfolioCoach`,
    })

    // Check if resource exists and has the expected structure
    // In newer Aptos SDK, data is directly in resource, not resource.data
    const resourceData = resource?.data || resource;
    
    if (!resource || !resourceData || typeof resourceData !== 'object') {
      return {
        status: 'unhealthy',
        message: 'Contract not initialized or resource not found'
      }
    }

    // Check for key fields that indicate initialization
    const hasRequiredFields = resourceData.hasOwnProperty('next_coach_id') || 
                             resourceData.hasOwnProperty('coaches') ||
                             resourceData.hasOwnProperty('leaderboard')

    if (!hasRequiredFields) {
      return {
        status: 'unhealthy',
        message: 'Contract not properly initialized'
      }
    }

    return {
      status: 'healthy',
      message: 'Contract is properly initialized and accessible',
      details: {
        address: CONTRACT_MODULE.split('::')[0],
        module: CONTRACT_MODULE,
        leaderboardLength: parseInt(resourceData.leaderboard_length as string),
        totalStaked: resourceData.total_staked,
        totalRewardsPool: resourceData.total_rewards_pool
      }
    }
  } catch (error) {
    console.error('Error checking contract health:', error)
    return {
      status: 'unhealthy',
      message: error instanceof Error ? error.message : 'Unknown error',
      details: { error }
    }
  }
}

export async function getContractMetrics(): Promise<{
  totalCoaches: number
  totalStaked: string
  totalRewardsPool: string
  leaderboardLength: number
  averagePerformance: number
}> {
  try {
    if (!CONTRACT_MODULE.split('::')[0]) {
      throw new Error('Contract address not set')
    }

    const resource = await aptosClient.getAccountResource({
      accountAddress: CONTRACT_MODULE.split('::')[0],
      resourceType: `${CONTRACT_MODULE}::PortfolioCoach`,
    })

    if (!resource || !resource.data) {
      throw new Error('Contract not initialized or resource not found')
    }

    const leaderboard = resource.data.leaderboard as any
    const coaches = resource.data.coaches as any
    const leaderboardLength = parseInt(resource.data.leaderboard_length as string)
    const nextCoachId = parseInt(resource.data.next_coach_id as string)

    let totalCoaches = 0
    let totalPerformance = 0

    // If leaderboard is empty but there are coaches, get all coaches
    if (leaderboardLength === 0 && nextCoachId > 1) {
      // Get all coaches from the coaches table
      for (let coachId = 1; coachId < nextCoachId; coachId++) {
        try {
          const coach = await aptosClient.getTableItem({
            tableHandle: coaches.handle,
            data: {
              key: coachId.toString(),
              keyType: 'u64',
              valueType: `${CONTRACT_MODULE}::Coach`,
            },
          })
          
          if (coach) {
            totalCoaches++
            totalPerformance += parseInt(coach.performance_score)
          }
        } catch (error) {
          console.warn(`Error fetching coach ${coachId} for metrics:`, error)
          // Continue with next coach
        }
      }
    } else {
      // Get leaderboard table handle
      const leaderboardHandle = leaderboard.handle

      // Count total coaches and calculate average performance
      for (let i = 1; i <= leaderboardLength; i++) {
        try {
          // Get coach ID from leaderboard table
          const coachId = await aptosClient.getTableItem({
            tableHandle: leaderboardHandle,
            data: {
              key: i.toString(),
              keyType: 'u64',
              valueType: 'u64',
            },
          })
          
          if (coachId) {
            // Get coach data from coaches table
            const coach = await aptosClient.getTableItem({
              tableHandle: coaches.handle,
              data: {
                key: coachId.toString(),
                keyType: 'u64',
                valueType: `${CONTRACT_MODULE}::Coach`,
              },
            })
            
            if (coach) {
              totalCoaches++
              totalPerformance += parseInt(coach.performance_score)
            }
          }
        } catch (error) {
          console.warn(`Error fetching leaderboard entry ${i} for metrics:`, error)
          // Continue with next entry
        }
      }
    }

    const averagePerformance = totalCoaches > 0 ? totalPerformance / totalCoaches : 0

    return {
      totalCoaches,
      totalStaked: resource.data.total_staked.toString(),
      totalRewardsPool: resource.data.total_rewards_pool.toString(),
      leaderboardLength,
      averagePerformance
    }
  } catch (error) {
    console.error('Error fetching contract metrics:', error)
    throw error
  }
}

export async function getContractSummary(): Promise<{
  status: 'healthy' | 'unhealthy' | 'unknown'
  message: string
  metrics?: {
    totalCoaches: number
    totalStaked: string
    totalRewardsPool: string
    leaderboardLength: number
    averagePerformance: number
  }
  error?: string
}> {
  try {
    const health = await getContractHealth()
    const metrics = await getContractMetrics()

    return {
      status: health.status,
      message: health.message,
      metrics
    }
  } catch (error) {
    console.error('Error fetching contract summary:', error)
    return {
      status: 'unhealthy',
      message: error instanceof Error ? error.message : 'Unknown error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function getContractDiagnostics(): Promise<{
  contractAddress: string
  moduleName: string
  isInitialized: boolean
  healthStatus: 'healthy' | 'unhealthy' | 'unknown'
  error?: string
  recommendations?: string[]
}> {
  try {
    const info = await getContractInfo()
    const health = await getContractHealth()

    const recommendations: string[] = []

    if (!info.initialized) {
      recommendations.push('Deploy and initialize the contract using: .\\scripts\\deploy.ps1')
    }

    if (health.status === 'unhealthy') {
      recommendations.push('Check contract deployment and network connectivity')
    }

    if (!info.address) {
      recommendations.push('Set NEXT_PUBLIC_CONTRACT_ADDRESS in your .env file')
    }

    return {
      contractAddress: info.address,
      moduleName: info.module,
      isInitialized: info.initialized,
      healthStatus: health.status,
      error: info.error || health.message,
      recommendations: recommendations.length > 0 ? recommendations : undefined
    }
  } catch (error) {
    console.error('Error fetching contract diagnostics:', error)
    return {
      contractAddress: CONTRACT_MODULE.split('::')[0] || '',
      moduleName: CONTRACT_MODULE,
      isInitialized: false,
      healthStatus: 'unknown',
      error: error instanceof Error ? error.message : 'Unknown error',
      recommendations: ['Check your Aptos CLI configuration and network connectivity']
    }
  }
}

export async function getContractStatusReport(): Promise<{
  timestamp: string
  contractAddress: string
  moduleName: string
  isInitialized: boolean
  healthStatus: 'healthy' | 'unhealthy' | 'unknown'
  error?: string
  recommendations?: string[]
  metrics?: {
    totalCoaches: number
    totalStaked: string
    totalRewardsPool: string
    leaderboardLength: number
    averagePerformance: number
  }
}> {
  try {
    const diagnostics = await getContractDiagnostics()
    const summary = await getContractSummary()

    return {
      timestamp: new Date().toISOString(),
      contractAddress: diagnostics.contractAddress,
      moduleName: diagnostics.moduleName,
      isInitialized: diagnostics.isInitialized,
      healthStatus: diagnostics.healthStatus,
      error: diagnostics.error,
      recommendations: diagnostics.recommendations,
      metrics: summary.metrics
    }
  } catch (error) {
    console.error('Error fetching contract status report:', error)
    return {
      timestamp: new Date().toISOString(),
      contractAddress: CONTRACT_MODULE.split('::')[0] || '',
      moduleName: CONTRACT_MODULE,
      isInitialized: false,
      healthStatus: 'unknown',
      error: error instanceof Error ? error.message : 'Unknown error',
      recommendations: ['Check your Aptos CLI configuration and network connectivity']
    }
  }
}

export async function getContractHealthCheck(): Promise<{
  status: 'healthy' | 'unhealthy' | 'unknown'
  message: string
  details: {
    contractAddress: string
    moduleName: string
    isInitialized: boolean
    error?: string
    recommendations?: string[]
  }
}> {
  try {
    const diagnostics = await getContractDiagnostics()

    return {
      status: diagnostics.healthStatus,
      message: diagnostics.error || 'Contract is healthy',
      details: {
        contractAddress: diagnostics.contractAddress,
        moduleName: diagnostics.moduleName,
        isInitialized: diagnostics.isInitialized,
        error: diagnostics.error,
        recommendations: diagnostics.recommendations
      }
    }
  } catch (error) {
    console.error('Error fetching contract health check:', error)
    return {
      status: 'unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      details: {
        contractAddress: CONTRACT_MODULE.split('::')[0] || '',
        moduleName: CONTRACT_MODULE,
        isInitialized: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        recommendations: ['Check your Aptos CLI configuration and network connectivity']
      }
    }
  }
}

export async function getContractStatusSummary(): Promise<{
  timestamp: string
  status: 'healthy' | 'unhealthy' | 'unknown'
  message: string
  contractAddress: string
  moduleName: string
  isInitialized: boolean
  error?: string
  recommendations?: string[]
  metrics?: {
    totalCoaches: number
    totalStaked: string
    totalRewardsPool: string
    leaderboardLength: number
    averagePerformance: number
  }
}> {
  try {
    const healthCheck = await getContractHealthCheck()
    const summary = await getContractSummary()

    return {
      timestamp: new Date().toISOString(),
      status: healthCheck.status,
      message: healthCheck.message,
      contractAddress: healthCheck.details.contractAddress,
      moduleName: healthCheck.details.moduleName,
      isInitialized: healthCheck.details.isInitialized,
      error: healthCheck.details.error,
      recommendations: healthCheck.details.recommendations,
      metrics: summary.metrics
    }
  } catch (error) {
    console.error('Error fetching contract status summary:', error)
    return {
      timestamp: new Date().toISOString(),
      status: 'unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      contractAddress: CONTRACT_MODULE.split('::')[0] || '',
      moduleName: CONTRACT_MODULE,
      isInitialized: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      recommendations: ['Check your Aptos CLI configuration and network connectivity']
    }
  }
}

export async function getContractStatusOverview(): Promise<{
  timestamp: string
  status: 'healthy' | 'unhealthy' | 'unknown'
  message: string
  contractAddress: string
  moduleName: string
  isInitialized: boolean
  error?: string
  recommendations?: string[]
  metrics?: {
    totalCoaches: number
    totalStaked: string
    totalRewardsPool: string
    leaderboardLength: number
    averagePerformance: number
  }
}> {
  try {
    const healthCheck = await getContractHealthCheck()
    const summary = await getContractSummary()

    return {
      timestamp: new Date().toISOString(),
      status: healthCheck.status,
      message: healthCheck.message,
      contractAddress: healthCheck.details.contractAddress,
      moduleName: healthCheck.details.moduleName,
      isInitialized: healthCheck.details.isInitialized,
      error: healthCheck.details.error,
      recommendations: healthCheck.details.recommendations,
      metrics: summary.metrics
    }
  } catch (error) {
    console.error('Error fetching contract status overview:', error)
    return {
      timestamp: new Date().toISOString(),
      status: 'unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      contractAddress: CONTRACT_MODULE.split('::')[0] || '',
      moduleName: CONTRACT_MODULE,
      isInitialized: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      recommendations: ['Check your Aptos CLI configuration and network connectivity']
    }
  }
}

export async function getAllCoaches(): Promise<Coach[]> {
  try {
    console.log('=== getAllCoaches called ===')
    console.log('CONTRACT_MODULE:', CONTRACT_MODULE)
    
    if (!CONTRACT_MODULE.split('::')[0]) {
      console.warn('Contract address not set')
      return []
    }

    console.log('Fetching contract resource...')
    const resource = await aptosClient.getAccountResource({
      accountAddress: CONTRACT_MODULE.split('::')[0],
      resourceType: `${CONTRACT_MODULE}::PortfolioCoach`,
    })

    console.log('Resource response:', resource)

    const resourceData = resource?.data || resource
    if (!resource || !resourceData) {
      console.warn('Contract not initialized or resource not found')
      return []
    }

    const coaches = resourceData.coaches as any
    const nextCoachId = parseInt(resourceData.next_coach_id as string)
    
    console.log('Coaches table handle:', coaches)
    console.log('Next coach ID:', nextCoachId)
    
    if (!coaches || isNaN(nextCoachId)) {
      console.warn('Coaches data not found or invalid next_coach_id')
      return []
    }

    const allCoaches: Coach[] = []
    
    console.log(`Fetching coaches from 1 to ${nextCoachId - 1}...`)
    
    // Get all coaches from the coaches table
    for (let coachId = 1; coachId < nextCoachId; coachId++) {
      try {
        console.log(`Fetching coach ${coachId} from table...`)
        const coach = await aptosClient.getTableItem({
          handle: coaches.handle,
          data: {
            key_type: 'u64',
            value_type: `${CONTRACT_MODULE}::Coach`,
            key: coachId.toString(),
          },
        })
        
        console.log(`Coach ${coachId} data:`, coach)
        
        if (coach) {
          // Decode rules from hex string
          let rulesText = ''
          try {
            if (typeof coach.rules === 'string' && coach.rules.startsWith('0x')) {
              // Remove 0x prefix and convert hex to bytes
              const hexString = coach.rules.slice(2)
              const bytes = new Uint8Array(hexString.length / 2)
              for (let i = 0; i < hexString.length; i += 2) {
                bytes[i / 2] = parseInt(hexString.substr(i, 2), 16)
              }
              rulesText = new TextDecoder().decode(bytes)
            } else {
              // If it's already a Uint8Array
              rulesText = new TextDecoder().decode(new Uint8Array(coach.rules))
            }
          } catch (error) {
            console.warn(`Error decoding rules for coach ${coachId}:`, error)
            rulesText = 'Error decoding rules'
          }

          const coachData = {
            id: coach.id,
            owner: coach.owner,
            rules: rulesText,
            staked_amount: coach.staked_amount,
            performance_score: coach.performance_score,
            active: coach.active,
            created_at: coach.created_at,
            last_performance_update: coach.last_performance_update,
            total_rewards_claimed: coach.total_rewards_claimed,
            risk_adjusted_return: coach.risk_adjusted_return,
          }
          console.log(`Processed coach ${coachId}:`, coachData)
          allCoaches.push(coachData)
        } else {
          console.log(`Coach ${coachId} not found`)
        }
      } catch (error) {
        console.warn(`Error fetching coach ${coachId}:`, error)
        // Continue with next coach
      }
    }
    
    console.log(`Total coaches found: ${allCoaches.length}`)
    console.log('All coaches:', allCoaches)
    
    return allCoaches
  } catch (error) {
    console.error('Error fetching all coaches:', error)
    return []
  }
}
