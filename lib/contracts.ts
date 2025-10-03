import { aptosClient, CONTRACT_MODULE } from './aptosClient'
import { Account } from '@aptos-labs/ts-sdk'

export interface Coach {
  id: string
  owner: string
  rules: string
  staked_amount: string
  performance_score: string
  active: boolean
}

export interface LeaderboardEntry {
  coach_id: string
  owner: string
  performance_score: string
  staked_amount: string
}

export async function mintCoach(account: Account, rules: string): Promise<string> {
  // Convert string to Uint8Array for vector<u8>
  const rulesBytes = new Uint8Array(Buffer.from(rules, 'utf8'))
  
  console.log('Minting coach with rules:', rules)
  console.log('Rules bytes:', rulesBytes)
  console.log('Account address:', account.accountAddress)
  console.log('Contract module:', CONTRACT_MODULE)
  
  try {
    const transaction = await aptosClient.transaction.build.simple({
      sender: account.accountAddress,
      data: {
        function: `${CONTRACT_MODULE}::mint_coach`,
        typeArguments: [],
        functionArguments: [rulesBytes],
      },
    })

    console.log('Transaction built successfully:', transaction)

    const committedTransaction = await aptosClient.signAndSubmitTransaction({
      signer: account,
      transaction,
    })

    console.log('Transaction submitted:', committedTransaction.hash)

    await aptosClient.waitForTransaction({
      transactionHash: committedTransaction.hash,
    })

    console.log('Transaction confirmed:', committedTransaction.hash)
    return committedTransaction.hash
  } catch (error) {
    console.error('Error in mintCoach transaction:', error)
    throw error
  }
}

export async function stakeTokens(account: Account, coachId: number, amount: number): Promise<string> {
  try {
    const transaction = await aptosClient.transaction.build.simple({
      sender: account.accountAddress,
      data: {
        function: `${CONTRACT_MODULE}::stake_tokens`,
        typeArguments: [],
        functionArguments: [coachId, amount],
      },
    })

    const committedTransaction = await aptosClient.signAndSubmitTransaction({
      signer: account,
      transaction,
    })

    await aptosClient.waitForTransaction({
      transactionHash: committedTransaction.hash,
    })

    return committedTransaction.hash
  } catch (error) {
    console.error('Error in stakeTokens transaction:', error)
    throw error
  }
}

export async function updatePerformance(account: Account, coachId: number, newScore: number, riskAdjustedReturn: number, explanationHash: string): Promise<string> {
  // Convert string to Uint8Array for vector<u8>
  const explanationHashBytes = new Uint8Array(Buffer.from(explanationHash, 'utf8'))
  
  try {
    const transaction = await aptosClient.transaction.build.simple({
      sender: account.accountAddress,
      data: {
        function: `${CONTRACT_MODULE}::update_performance`,
        typeArguments: [],
        functionArguments: [coachId, newScore, riskAdjustedReturn, explanationHashBytes],
      },
    })

    const committedTransaction = await aptosClient.signAndSubmitTransaction({
      signer: account,
      transaction,
    })

    await aptosClient.waitForTransaction({
      transactionHash: committedTransaction.hash,
    })

    return committedTransaction.hash
  } catch (error) {
    console.error('Error in updatePerformance transaction:', error)
    throw error
  }
}

export async function claimRewards(account: Account, coachId: number): Promise<string> {
  try {
    const transaction = await aptosClient.transaction.build.simple({
      sender: account.accountAddress,
      data: {
        function: `${CONTRACT_MODULE}::claim_rewards`,
        typeArguments: [],
        functionArguments: [coachId],
      },
    })

    const committedTransaction = await aptosClient.signAndSubmitTransaction({
      signer: account,
      transaction,
    })

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
      tableHandle: coachesHandle,
      data: {
        key: coachId,
        keyType: 'u64',
        valueType: `${CONTRACT_MODULE}::Coach`,
      },
    })
    
    if (!coachData) {
      return null
    }

    return {
      id: coachData.id.toString(),
      owner: coachData.owner,
      rules: new TextDecoder().decode(new Uint8Array(coachData.rules)),
      staked_amount: coachData.staked_amount.toString(),
      performance_score: coachData.performance_score.toString(),
      active: coachData.active,
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
    if (!resource || !resource.data) {
      console.warn('Contract not initialized or resource not found')
      return []
    }

    // Get leaderboard data
    const leaderboard = resource.data.leaderboard as any
    const coaches = resource.data.coaches as any
    const leaderboardLength = parseInt(resource.data.leaderboard_length as string)
    const nextCoachId = parseInt(resource.data.next_coach_id as string)
    
    if (!leaderboard || !coaches || isNaN(leaderboardLength) || isNaN(nextCoachId)) {
      console.warn('Leaderboard or coaches data not found, or contract not initialized')
      return []
    }
    
    const leaderboardEntries: LeaderboardEntry[] = []
    
    console.log(`Leaderboard length: ${leaderboardLength}, Next coach ID: ${nextCoachId}`)
    
    // Always get all coaches first, then sort them
    console.log('Fetching all coaches...')
    
    // Get all coaches from the coaches table
    for (let coachId = 1; coachId < nextCoachId; coachId++) {
      try {
        const coach = await aptosClient.getTableItem({
          tableHandle: coaches.handle,
          data: {
            key: coachId,
            keyType: 'u64',
            valueType: `${CONTRACT_MODULE}::Coach`,
          },
        })
        
        if (coach) {
          console.log(`Found coach ${coachId}:`, {
            owner: coach.owner,
            performance_score: coach.performance_score,
            staked_amount: coach.staked_amount,
            active: coach.active
          })
          
          leaderboardEntries.push({
            coach_id: coachId.toString(),
            owner: coach.owner,
            performance_score: coach.performance_score.toString(),
            staked_amount: coach.staked_amount.toString(),
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

export async function initializeContract(account: Account): Promise<string> {
  try {
    const transaction = await aptosClient.transaction.build.simple({
      sender: account.accountAddress,
      data: {
        function: `${CONTRACT_MODULE}::initialize`,
        typeArguments: [],
        functionArguments: [],
      },
    })

    const committedTransaction = await aptosClient.signAndSubmitTransaction({
      signer: account,
      transaction,
    })

    await aptosClient.waitForTransaction({
      transactionHash: committedTransaction.hash,
    })

    return committedTransaction.hash
  } catch (error) {
    console.error('Error in initializeContract transaction:', error)
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

    return !!(resource && resource.data)
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

    return {
      initialized: !!(resource && resource.data),
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

    if (!resource || !resource.data) {
      return {
        status: 'unhealthy',
        message: 'Contract not initialized or resource not found'
      }
    }

    return {
      status: 'healthy',
      message: 'Contract is properly initialized and accessible',
      details: {
        address: CONTRACT_MODULE.split('::')[0],
        module: CONTRACT_MODULE,
        leaderboardLength: parseInt(resource.data.leaderboard_length as string),
        totalStaked: resource.data.total_staked,
        totalRewardsPool: resource.data.total_rewards_pool
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

    if (!resource || !resource.data) {
      console.warn('Contract not initialized or resource not found')
      return []
    }

    const coaches = resource.data.coaches as any
    const nextCoachId = parseInt(resource.data.next_coach_id as string)
    
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
        console.log(`Fetching coach ${coachId}...`)
        const coach = await aptosClient.getTableItem({
          tableHandle: coaches.handle,
          data: {
            key: coachId,
            keyType: 'u64',
            valueType: `${CONTRACT_MODULE}::Coach`,
          },
        })
        
        console.log(`Coach ${coachId} data:`, coach)
        
        if (coach) {
          const coachData = {
            id: coach.id.toString(),
            owner: coach.owner,
            rules: new TextDecoder().decode(new Uint8Array(coach.rules)),
            staked_amount: coach.staked_amount.toString(),
            performance_score: coach.performance_score.toString(),
            active: coach.active,
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
    return allCoaches
  } catch (error) {
    console.error('Error fetching all coaches:', error)
    return []
  }
}
