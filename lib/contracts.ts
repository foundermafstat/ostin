import { aptosClient, CONTRACT_MODULE } from './aptosClient'
import { Account, AccountAddress } from '@aptos-labs/ts-sdk'

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

export async function mintCoach(
  walletAddress: string,
  rules: string,
  signAndSubmitTransaction?: any
): Promise<{ hash: string; coachId: number }> {
  console.log('🚀 === STARTING COACH MINT PROCESS ===')
  
  // Validate inputs
  console.log('📋 Validating inputs...')
  console.log('  - walletAddress:', walletAddress, typeof walletAddress)
  console.log('  - rules:', rules, typeof rules, 'length:', rules?.length)
  console.log('  - signAndSubmitTransaction:', typeof signAndSubmitTransaction)
  
  if (!walletAddress) {
    console.error('❌ Wallet address validation failed')
    throw new Error('Wallet address is required')
  }
  
  if (!rules || typeof rules !== 'string') {
    console.error('❌ Rules validation failed')
    throw new Error('Rules must be a non-empty string')
  }
  
  if (rules.length > 1000) {
    console.error('❌ Rules length validation failed')
    throw new Error('Rules must be less than 1000 characters')
  }

  if (!signAndSubmitTransaction) {
    console.warn('⚠️ signAndSubmitTransaction not provided, will try direct approach')
  } else if (typeof signAndSubmitTransaction !== 'function') {
    console.error('❌ signAndSubmitTransaction validation failed - not a function')
    throw new Error('Wallet transaction function is invalid. Please reconnect your wallet.')
  }

  console.log('✅ Input validation passed')

  // Convert string to Uint8Array for vector<u8>
  console.log('🔄 Converting rules to bytes...')
  const rulesBytes = new Uint8Array(Buffer.from(rules, 'utf8'))
  
  console.log('📊 Mint details:')
  console.log('  - Wallet address:', walletAddress)
  console.log('  - Rules:', rules)
  console.log('  - Rules bytes length:', rulesBytes.length)
  console.log('  - Rules bytes array:', Array.from(rulesBytes))
  console.log('  - Contract module:', CONTRACT_MODULE)
  console.log('  - Contract address:', CONTRACT_MODULE.split('::')[0])
  
  try {
    console.log('🔨 Building mint transaction...')

    // Build transaction with proper sender
    const transactionPayload = {
      function: `${CONTRACT_MODULE}::mint_coach` as any,
      typeArguments: [],
      functionArguments: [rulesBytes],
    }
    
    console.log('📦 Transaction payload:', JSON.stringify(transactionPayload, null, 2))

    // Try building transaction in the old format that wallet adapter expects
    console.log('🔄 Building transaction in legacy format...')
    const legacyTransaction = {
      type: 'entry_function_payload',
      function: transactionPayload.function,
      type_arguments: transactionPayload.typeArguments,
      arguments: transactionPayload.functionArguments,
    }
    console.log('✅ Legacy transaction created')

    // Log legacy transaction structure for debugging
    console.log('📋 Legacy transaction structure analysis:')
    console.log('  - Legacy transaction type:', typeof legacyTransaction)
    console.log('  - Legacy transaction keys:', Object.keys(legacyTransaction))
    console.log('  - Legacy transaction:', legacyTransaction)

    console.log('✅ Legacy transaction built successfully')
    console.log('📄 Legacy transaction details:', {
      legacyTransaction: legacyTransaction
    })

    // Submit transaction using window.aptos (proven working approach)
    console.log('✍️ Submitting transaction using window.aptos...')
    
    let response
    
    try {
      if (typeof window !== 'undefined' && (window as any).aptos) {
        console.log('🔄 Using window.aptos directly...')
        const windowAptos = (window as any).aptos
        console.log('🔄 window.aptos available:', !!windowAptos)
        
        if (windowAptos.signAndSubmitTransaction) {
          response = await windowAptos.signAndSubmitTransaction(legacyTransaction)
          console.log('✅ Success with window.aptos!')
        } else {
          throw new Error('window.aptos.signAndSubmitTransaction not available')
        }
      } else {
        throw new Error('window.aptos not available')
      }
    } catch (windowError) {
      console.error('❌ Failed with window.aptos:', windowError)
      throw new Error('Wallet not available. Please make sure Petra wallet is installed and connected.')
    }
    
    console.log('✅ Transaction submitted successfully!')
    
    console.log('📨 Final response:', response)
    console.log('📨 Response type:', typeof response)
    console.log('📨 Response constructor:', response?.constructor?.name)
    
    console.log('✅ Transaction submitted successfully')
    console.log('📤 Transaction response:', {
      hash: response?.hash,
      success: response?.success,
      vm_status: response?.vm_status,
      gas_used: response?.gas_used,
      gas_unit_price: response?.gas_unit_price,
      type: response?.type
    })

    // Wait for transaction confirmation
    console.log('⏳ Waiting for transaction confirmation...')
    console.log('  - Transaction hash:', response?.hash)
    
    if (!response?.hash) {
      throw new Error('Transaction response does not contain a hash')
    }
    
    const result = await aptosClient.waitForTransaction({
      transactionHash: response.hash,
    })

    console.log('✅ Transaction confirmed')
    console.log('📋 Transaction result:', {
      hash: result?.hash,
      success: result?.success,
      vm_status: result?.vm_status,
      gas_used: result?.gas_used,
      events_count: (result && 'events' in result && result.events) ? result.events.length : 0,
      version: result?.version,
      type: result?.type
    })

    // Get the coach ID from transaction events
    console.log('🔍 Searching for CoachMinted event...')
    let coachId = 0
    
    if (result && 'events' in result && result.events) {
      console.log('📅 Found', result.events.length, 'events in transaction')
      
      for (let i = 0; i < result.events.length; i++) {
        const event = result.events[i]
        console.log(`  Event ${i}:`, {
          type: event.type,
          data: event.data
        })
        
        if (event.type === `${CONTRACT_MODULE}::CoachMinted`) {
          const eventData = event.data as any
          coachId = parseInt(eventData.coach_id)
          console.log('🎉 Found CoachMinted event!')
          console.log('  - Coach ID:', coachId)
          console.log('  - Event data:', eventData)
          break
        }
      }
      
      if (coachId === 0) {
        console.warn('⚠️ CoachMinted event not found in transaction events')
        console.log('Available event types:', result.events ? result.events.map(e => e.type) : 'No events')
      }
    } else {
      console.warn('⚠️ No events found in transaction result')
    }

    console.log('🎊 Coach minted successfully!')
    console.log('📊 Final result:', {
      hash: response.hash,
      coachId: coachId
    })

    return {
      hash: response.hash,
      coachId: coachId
    }
  } catch (error) {
    console.error('💥 Error in mintCoach transaction:')
    console.error('  - Error type:', typeof error)
    console.error('  - Error constructor:', error?.constructor?.name)
    console.error('  - Error message:', error instanceof Error ? error.message : String(error))
    console.error('  - Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    if (error instanceof Error) {
      console.error('  - Error details:', {
        name: error.name,
        message: error.message
      })
      
      // Provide more specific error messages
      if (error.message.includes('Resource not found')) {
        console.error('❌ Contract resource not found')
        throw new Error('Contract not found. Please make sure the contract is deployed and initialized.')
      } else if (error.message.includes('insufficient balance')) {
        console.error('❌ Insufficient balance')
        throw new Error('Insufficient balance. Please make sure you have enough APT tokens.')
      } else if (error.message.includes('rejected')) {
        console.error('❌ Transaction rejected by user')
        throw new Error('Transaction was rejected by the user.')
      } else if (error.message.includes('timeout')) {
        console.error('❌ Transaction timeout')
        throw new Error('Transaction timed out. Please try again.')
      } else if (error.message.includes('E_INVALID_RULES')) {
        console.error('❌ Invalid rules format')
        throw new Error('Invalid rules format. Please check your trading rules.')
      } else if (error.message.includes('E_CONTRACT_NOT_INITIALIZED')) {
        console.error('❌ Contract not initialized')
        throw new Error('Contract is not initialized. Please initialize the contract first.')
      }
    }
    
    console.error('🚨 Re-throwing original error for user to see')
    throw error
  }
}


export async function stakeTokens(
  walletAddress: string, 
  coachId: number, 
  amount: number, 
  signAndSubmitTransaction: any
): Promise<{ hash: string; coachId: number; stakedAmount: number }> {
  // Validate inputs
  if (!walletAddress) {
    throw new Error('Wallet address is required')
  }
  
  if (!coachId || coachId <= 0) {
    throw new Error('Valid coach ID is required')
  }
  
  if (!amount || amount <= 0) {
    throw new Error('Valid stake amount is required')
  }

  // Enhanced validation for signAndSubmitTransaction
  if (!signAndSubmitTransaction) {
    throw new Error('Wallet transaction function is not available. Please reconnect your wallet.')
  }
  
  if (typeof signAndSubmitTransaction !== 'function') {
    throw new Error('Wallet transaction function is invalid. Please reconnect your wallet.')
  }

  console.log('=== STAKING TOKENS ===')
  console.log('Wallet address:', walletAddress)
  console.log('Coach ID:', coachId)
  console.log('Stake amount (octas):', amount)
  console.log('Stake amount (APT):', amount / 100000000)
  console.log('Contract module:', CONTRACT_MODULE)
  console.log('Contract address:', CONTRACT_MODULE.split('::')[0])

  try {
    console.log('Building stake transaction...')

    // Build transaction payload in legacy format
    const transactionPayload = {
      function: `${CONTRACT_MODULE}::stake_tokens` as any,
      typeArguments: [],
      functionArguments: [coachId, amount],
    }

    // Create legacy transaction format
    const legacyTransaction = {
      type: 'entry_function_payload',
      function: transactionPayload.function,
      type_arguments: transactionPayload.typeArguments,
      arguments: transactionPayload.functionArguments,
    }

    console.log('Stake transaction built successfully:', legacyTransaction)

    // Sign and submit the transaction using window.aptos
    console.log('Signing and submitting stake transaction using window.aptos...')
    
    let response
    
    try {
      if (typeof window !== 'undefined' && (window as any).aptos) {
        const windowAptos = (window as any).aptos
        if (windowAptos.signAndSubmitTransaction) {
          response = await windowAptos.signAndSubmitTransaction(legacyTransaction)
          console.log('✅ Stake transaction submitted successfully!')
        } else {
          throw new Error('window.aptos.signAndSubmitTransaction not available')
        }
      } else {
        throw new Error('window.aptos not available')
      }
    } catch (windowError) {
      console.error('❌ Failed with window.aptos for stake:', windowError)
      throw new Error('Wallet not available. Please make sure Petra wallet is installed and connected.')
    }
    
    console.log('Stake transaction response:', response)

    // Wait for transaction confirmation
    console.log('Waiting for stake transaction confirmation...')
    const result = await aptosClient.waitForTransaction({
      transactionHash: response.hash,
    })

    console.log('Stake transaction confirmed:', result)
    console.log(`Successfully staked ${amount / 100000000} APT for coach ${coachId}`)

    return {
      hash: response.hash,
      coachId: coachId,
      stakedAmount: amount
    }
  } catch (error) {
    console.error('Error in stakeTokens transaction:', error)
    
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
      } else if (error.message.includes('E_COACH_NOT_FOUND')) {
        throw new Error('Coach not found. Please check the coach ID.')
      } else if (error.message.includes('E_UNAUTHORIZED')) {
        throw new Error('You are not authorized to stake for this coach.')
      } else if (error.message.includes('E_COACH_ALREADY_ACTIVE')) {
        throw new Error('This coach is already active and staked.')
      } else if (error.message.includes('E_INVALID_AMOUNT')) {
        throw new Error('Invalid stake amount.')
      } else if (error.message.includes('E_CONTRACT_NOT_INITIALIZED')) {
        throw new Error('Contract is not initialized. Please initialize the contract first.')
      }
    }
    
    throw error
  }
}

export async function updatePerformance(account: { address: string }, coachId: number, newScore: number, riskAdjustedReturn: number, explanationHash: string, signAndSubmitTransaction: any): Promise<string> {
  // Validate inputs
  if (!account) {
    throw new Error('Account is required')
  }
  
  if (!account.address) {
    throw new Error('Account address is not available')
  }
  
  if (!coachId || coachId <= 0) {
    throw new Error('Valid coach ID is required')
  }
  
  if (newScore < 0 || newScore > 1000000) {
    throw new Error('Score must be between 0 and 1,000,000')
  }
  
  if (riskAdjustedReturn < 0 || riskAdjustedReturn > 1000000) {
    throw new Error('Risk adjusted return must be between 0 and 1,000,000 basis points')
  }

  if (!signAndSubmitTransaction || typeof signAndSubmitTransaction !== 'function') {
    throw new Error('Wallet transaction function is not available. Please reconnect your wallet.')
  }

  // Convert string to Uint8Array for vector<u8>
  const explanationHashBytes = new Uint8Array(Buffer.from(explanationHash, 'utf8'))
  
  console.log('Updating performance for coach:', coachId, 'score:', newScore, 'risk:', riskAdjustedReturn)
  console.log('Account address:', account.address)
  console.log('Contract module:', CONTRACT_MODULE)

  try {
    const transaction = await aptosClient.transaction.build.simple({
      sender: account.address,
      data: {
        function: `${CONTRACT_MODULE}::update_performance` as any,
        typeArguments: [],
        functionArguments: [coachId, newScore, riskAdjustedReturn, explanationHashBytes],
      },
    })

    console.log('Update performance transaction built successfully')

    const committedTransaction = await signAndSubmitTransaction(transaction)

    console.log('Update performance transaction submitted:', committedTransaction.hash)

    await aptosClient.waitForTransaction({
      transactionHash: committedTransaction.hash,
    })

    console.log('Update performance transaction confirmed:', committedTransaction.hash)
    return committedTransaction.hash
  } catch (error) {
    console.error('Error in updatePerformance transaction:', error)
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Resource not found')) {
        throw new Error('Contract not found. Please make sure the contract is deployed and initialized.')
      } else if (error.message.includes('rejected')) {
        throw new Error('Transaction was rejected by the user.')
      } else if (error.message.includes('timeout')) {
        throw new Error('Transaction timed out. Please try again.')
      } else if (error.message.includes('E_COACH_NOT_FOUND')) {
        throw new Error('Coach not found. Please check the coach ID.')
      } else if (error.message.includes('E_UNAUTHORIZED')) {
        throw new Error('You are not authorized to update this coach.')
      } else if (error.message.includes('E_COACH_NOT_ACTIVE')) {
        throw new Error('Coach is not active. Please stake tokens first.')
      } else if (error.message.includes('E_INVALID_SCORE')) {
        throw new Error('Invalid score. Score must be between 0 and 1,000,000.')
      }
    }
    
    throw error
  }
}

export async function claimRewards(account: { address: string }, coachId: number, signAndSubmitTransaction: any): Promise<string> {
  // Validate inputs
  if (!account) {
    throw new Error('Account is required')
  }
  
  if (!account.address) {
    throw new Error('Account address is not available')
  }
  
  if (!coachId || coachId <= 0) {
    throw new Error('Valid coach ID is required')
  }

  // Enhanced validation for signAndSubmitTransaction
  if (!signAndSubmitTransaction) {
    throw new Error('Wallet transaction function is not available. Please reconnect your wallet.')
  }
  
  if (typeof signAndSubmitTransaction !== 'function') {
    throw new Error('Wallet transaction function is invalid. Please reconnect your wallet.')
  }

  console.log('Claiming rewards for coach:', coachId)
  console.log('Account address:', account.address)
  console.log('Contract module:', CONTRACT_MODULE)

  try {
    const transaction = await aptosClient.transaction.build.simple({
      sender: account.address,
      data: {
        function: `${CONTRACT_MODULE}::claim_rewards` as any,
        typeArguments: [],
        functionArguments: [coachId],
      },
    })

    console.log('Claim rewards transaction built successfully')

    const committedTransaction = await signAndSubmitTransaction(transaction)

    console.log('Claim rewards transaction submitted:', committedTransaction.hash)

    await aptosClient.waitForTransaction({
      transactionHash: committedTransaction.hash,
    })

    console.log('Claim rewards transaction confirmed:', committedTransaction.hash)
    return committedTransaction.hash
  } catch (error) {
    console.error('Error in claimRewards transaction:', error)
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Resource not found')) {
        throw new Error('Contract not found. Please make sure the contract is deployed and initialized.')
      } else if (error.message.includes('rejected')) {
        throw new Error('Transaction was rejected by the user.')
      } else if (error.message.includes('timeout')) {
        throw new Error('Transaction timed out. Please try again.')
      } else if (error.message.includes('E_COACH_NOT_FOUND')) {
        throw new Error('Coach not found. Please check the coach ID.')
      } else if (error.message.includes('E_UNAUTHORIZED')) {
        throw new Error('You are not authorized to claim rewards for this coach.')
      } else if (error.message.includes('E_COACH_NOT_ACTIVE')) {
        throw new Error('Coach is not active. Please stake tokens first.')
      }
    }
    
    throw error
  }
}

export async function getCoach(coachId: number): Promise<Coach | null> {
  try {
    console.log(`=== getCoach called for ID: ${coachId} ===`)
    
    if (!CONTRACT_MODULE.split('::')[0]) {
      console.warn('Contract address not set')
      return null
    }

    console.log('Contract address:', CONTRACT_MODULE.split('::')[0])
    console.log('Contract module:', CONTRACT_MODULE)

    const resource = await aptosClient.getAccountResource({
      accountAddress: CONTRACT_MODULE.split('::')[0],
      resourceType: `${CONTRACT_MODULE}::PortfolioCoach` as any,
    })

    console.log('Resource response:', resource)

    // В Next.js 15 resource.data может быть undefined, но сам resource содержит данные
    const resourceData = resource?.data || resource
    if (!resource || !resourceData) {
      console.warn('Contract not initialized or resource not found')
      return null
    }

    // Get the coaches table handle
    const coachesHandle = resourceData.coaches.handle
    console.log('Coaches table handle:', coachesHandle)
    console.log('Next coach ID:', resourceData.next_coach_id)
    console.log('Leaderboard length:', resourceData.leaderboard_length)
    
    // Проверяем, что запрашиваемый ID существует
    const nextCoachId = parseInt(resourceData.next_coach_id as string)
    if (coachId >= nextCoachId) {
      console.log(`Coach ${coachId} does not exist (next_coach_id: ${nextCoachId})`)
      return null
    }
    
    // Get the specific coach from the table
    console.log(`Fetching coach ${coachId} from table...`)
    const coachData = await aptosClient.getTableItem({
      handle: coachesHandle,
      data: {
        key_type: 'u64',
        value_type: `${CONTRACT_MODULE}::Coach`,
        key: coachId.toString(),
      },
    })
    
    console.log(`Coach ${coachId} raw data:`, coachData)
    console.log(`Coach ${coachId} raw data type:`, typeof coachData)
    console.log(`Coach ${coachId} raw data keys:`, coachData ? Object.keys(coachData) : 'null')
    
    if (!coachData) {
      console.log(`Coach ${coachId} not found in table`)
      return null
    }

    // Decode rules from hex string or Uint8Array
    let rulesText = ''
    try {
      if (typeof (coachData as any).rules === 'string' && (coachData as any).rules.startsWith('0x')) {
        // Remove 0x prefix and convert hex to bytes
        const hexString = (coachData as any).rules.slice(2)
        const bytes = new Uint8Array(hexString.length / 2)
        for (let i = 0; i < hexString.length; i += 2) {
          bytes[i / 2] = parseInt(hexString.substr(i, 2), 16)
        }
        rulesText = new TextDecoder().decode(bytes)
      } else if ((coachData as any).rules) {
        // If it's already a Uint8Array
        rulesText = new TextDecoder().decode(new Uint8Array((coachData as any).rules))
      }
    } catch (error) {
      console.warn(`Error decoding rules for coach ${coachId}:`, error)
      rulesText = 'Error decoding rules'
    }

    const coach = {
      id: (coachData as any).id || 0,
      owner: (coachData as any).owner || '',
      rules: rulesText,
      staked_amount: (coachData as any).staked_amount || 0,
      performance_score: (coachData as any).performance_score || 0,
      active: (coachData as any).active || false,
      created_at: (coachData as any).created_at || 0,
      last_performance_update: (coachData as any).last_performance_update || 0,
      total_rewards_claimed: (coachData as any).total_rewards_claimed || 0,
      risk_adjusted_return: (coachData as any).risk_adjusted_return || 0,
    }

    console.log(`Processed coach ${coachId}:`, coach)
    return coach
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
      resourceType: `${CONTRACT_MODULE}::PortfolioCoach` as any,
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
            owner: (coach as any).owner,
            performance_score: (coach as any).performance_score,
            staked_amount: (coach as any).staked_amount,
            active: (coach as any).active
          })
          
          leaderboardEntries.push({
            coach_id: coachId,
            owner: (coach as any).owner || '',
            performance_score: (coach as any).performance_score || 0,
            staked_amount: (coach as any).staked_amount || 0,
          })
        }
      } catch (error) {
        console.warn(`Error fetching coach ${coachId}:`, error)
        // Continue with next coach
      }
    }
    
    // Sort by performance score (descending), then by staked amount (descending)
    leaderboardEntries.sort((a, b) => {
      const scoreA = parseInt((a.performance_score || '0') as string)
      const scoreB = parseInt((b.performance_score || '0') as string)
      const stakeA = parseInt((a.staked_amount || '0') as string)
      const stakeB = parseInt((b.staked_amount || '0') as string)
      
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

    console.log('Getting user coaches for address:', userAddress)

    // Get user's coach IDs from UserCoaches resource
    const userCoachesResource = await aptosClient.getAccountResource({
      accountAddress: userAddress,
      resourceType: `${CONTRACT_MODULE}::UserCoaches` as any,
    })

    console.log('User coaches resource:', userCoachesResource)

    if (!userCoachesResource || !userCoachesResource.data) {
      console.warn('User coaches resource not found - user has no coaches yet')
      return []
    }

    const coachIds = userCoachesResource.data.coaches as string[]
    console.log('User coach IDs:', coachIds)
    
    // Get each coach from the main contract
    const coaches: Coach[] = []
    for (const coachId of coachIds) {
      const coach = await getCoach(parseInt(coachId))
      if (coach) {
        coaches.push(coach)
      }
    }
    
    console.log('User coaches found:', coaches.length)
    return coaches
  } catch (error) {
    console.error('Error fetching user coaches:', error)
    
    // Handle resource not found error - user has no coaches yet
    if (error instanceof Error && (
      error.message.includes('Resource not found') ||
      error.message.includes('resource_not_found') ||
      error.message.includes('not found') ||
      error.message.includes('AptosApiError')
    )) {
      console.warn('User has no coaches yet - UserCoaches resource does not exist')
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
        function: `${CONTRACT_MODULE}::initialize` as any,
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
      resourceType: `${CONTRACT_MODULE}::PortfolioCoach` as any,
    })

    if (!resource || !resource.data) {
      console.warn('Contract not initialized or resource not found')
      return '0'
    }

    return (resource.data.total_staked || 0).toString()
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
      resourceType: `${CONTRACT_MODULE}::PortfolioCoach` as any,
    })

    if (!resource || !resource.data) {
      console.warn('Contract not initialized or resource not found')
      return '0'
    }

    return (resource.data.total_rewards_pool || 0).toString()
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
      resourceType: `${CONTRACT_MODULE}::PortfolioCoach` as any,
    })

    if (!resource || !resource.data) {
      console.warn('Contract not initialized or resource not found')
      return 0
    }

    return parseInt((resource.data.leaderboard_length || '0') as string)
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
      resourceType: `${CONTRACT_MODULE}::PortfolioCoach` as any,
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
      resourceType: `${CONTRACT_MODULE}::PortfolioCoach` as any,
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
      resourceType: `${CONTRACT_MODULE}::PortfolioCoach` as any,
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
      resourceType: `${CONTRACT_MODULE}::PortfolioCoach` as any,
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
      resourceType: `${CONTRACT_MODULE}::PortfolioCoach` as any,
    })

    if (!resource || !resource.data) {
      throw new Error('Contract not initialized or resource not found')
    }

    const leaderboard = resource.data.leaderboard as any
    const coaches = resource.data.coaches as any
    const leaderboardLength = parseInt((resource.data.leaderboard_length || '0') as string)
    const nextCoachId = parseInt((resource.data.next_coach_id || '1') as string)

    let totalCoaches = 0
    let totalPerformance = 0

    // If leaderboard is empty but there are coaches, get all coaches
    if (leaderboardLength === 0 && nextCoachId > 1) {
      // Get all coaches from the coaches table
      for (let coachId = 1; coachId < nextCoachId; coachId++) {
        try {
          const coach = await aptosClient.getTableItem({
            handle: coaches.handle,
            data: {
              key: coachId.toString(),
              key_type: 'u64',
              value_type: `${CONTRACT_MODULE}::Coach`,
            },
          })
          
          if (coach) {
            totalCoaches++
            totalPerformance += parseInt((coach as any).performance_score || '0')
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
            handle: leaderboardHandle,
            data: {
              key: i.toString(),
              key_type: 'u64',
              value_type: 'u64',
            },
          })
          
          if (coachId) {
            // Get coach data from coaches table
            const coach = await aptosClient.getTableItem({
              handle: coaches.handle,
              data: {
                key: coachId.toString(),
                key_type: 'u64',
                value_type: `${CONTRACT_MODULE}::Coach`,
              },
            })
            
            if (coach) {
              totalCoaches++
              totalPerformance += parseInt((coach as any).performance_score || '0')
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
      totalStaked: (resource.data.total_staked || 0).toString(),
      totalRewardsPool: (resource.data.total_rewards_pool || 0).toString(),
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

export async function checkContractStatus(): Promise<{
  contractAddress: string
  isInitialized: boolean
  error?: string
  details?: any
}> {
  try {
    console.log('=== CHECKING CONTRACT STATUS ===')
    console.log('Contract address:', CONTRACT_MODULE.split('::')[0])
    console.log('Contract module:', CONTRACT_MODULE)
    
    // Try to get the PortfolioCoach resource
    const resource = await aptosClient.getAccountResource({
      accountAddress: CONTRACT_MODULE.split('::')[0],
      resourceType: `${CONTRACT_MODULE}::PortfolioCoach` as any,
    })
    
    console.log('Resource found:', !!resource)
    console.log('Resource data:', resource?.data)
    
    if (resource?.data) {
      const resourceData = resource.data
      console.log('next_coach_id:', resourceData.next_coach_id)
      console.log('total_staked:', resourceData.total_staked)
      console.log('leaderboard_length:', resourceData.leaderboard_length)
      
      return {
        contractAddress: CONTRACT_MODULE.split('::')[0],
        isInitialized: true,
        details: {
          nextCoachId: resourceData.next_coach_id,
          totalStaked: resourceData.total_staked,
          leaderboardLength: resourceData.leaderboard_length
        }
      }
    } else {
      return {
        contractAddress: CONTRACT_MODULE.split('::')[0],
        isInitialized: false,
        error: 'Resource not found or empty'
      }
    }
  } catch (error) {
    console.error('Error checking contract status:', error)
    return {
      contractAddress: CONTRACT_MODULE.split('::')[0],
      isInitialized: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function debugContract(): Promise<any> {
  try {
    console.log('=== DEBUG CONTRACT ===')
    console.log('CONTRACT_MODULE:', CONTRACT_MODULE)
    console.log('Contract address:', CONTRACT_MODULE.split('::')[0])
    
    // Check if contract is initialized
    const resource = await aptosClient.getAccountResource({
      accountAddress: CONTRACT_MODULE.split('::')[0],
      resourceType: `${CONTRACT_MODULE}::PortfolioCoach` as any,
    })
    
    console.log('Resource found:', !!resource)
    console.log('Resource data:', resource?.data)
    
    if (resource?.data) {
      const resourceData = resource.data
      console.log('next_coach_id:', resourceData.next_coach_id)
      console.log('total_staked:', resourceData.total_staked)
      console.log('leaderboard_length:', resourceData.leaderboard_length)
      
      // Try to get a specific coach
      const coaches = resourceData.coaches as any
      if (coaches?.handle) {
        console.log('Coaches table handle:', coaches.handle)
        
        // Try to get coach with ID 1
        try {
          const coach1 = await aptosClient.getTableItem({
            handle: coaches.handle,
            data: {
              key_type: 'u64',
              value_type: `${CONTRACT_MODULE}::Coach`,
              key: '1',
            },
          })
          console.log('Coach 1 data:', coach1)
        } catch (error) {
          console.log('Error fetching coach 1:', error)
        }
        
        // Try to get all coaches by checking IDs from 1 to next_coach_id
        const nextCoachId = parseInt(resourceData.next_coach_id as string)
        console.log('Checking for coaches from 1 to', nextCoachId - 1)
        
        for (let i = 1; i < nextCoachId; i++) {
          try {
            const coach = await aptosClient.getTableItem({
              handle: coaches.handle,
              data: {
                key_type: 'u64',
                value_type: `${CONTRACT_MODULE}::Coach`,
                key: i.toString(),
              },
            })
            console.log(`Coach ${i} found:`, coach)
          } catch (error) {
            console.log(`Coach ${i} not found:`, error instanceof Error ? error.message : 'Unknown error')
          }
        }
      }
    }
    
    return {
      contractModule: CONTRACT_MODULE,
      contractAddress: CONTRACT_MODULE.split('::')[0],
      resourceFound: !!resource,
      resourceData: resource?.data,
      nextCoachId: resource?.data?.next_coach_id,
      totalStaked: resource?.data?.total_staked,
      leaderboardLength: resource?.data?.leaderboard_length
    }
  } catch (error) {
    console.error('Debug contract error:', error)
    return {
      error: error instanceof Error ? error.message : 'Unknown error'
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
      resourceType: `${CONTRACT_MODULE}::PortfolioCoach` as any,
    })

    console.log('Resource response:', resource)
    console.log('Resource data:', resource?.data)

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
        console.log(`Coach ${coachId} ID field:`, (coach as any)?.id)
        console.log(`Coach ${coachId} ID type:`, typeof (coach as any)?.id)
        
        if (coach) {
          // Decode rules from hex string
          let rulesText = ''
          try {
            if (typeof (coach as any).rules === 'string' && (coach as any).rules.startsWith('0x')) {
              // Remove 0x prefix and convert hex to bytes
              const hexString = (coach as any).rules.slice(2)
              const bytes = new Uint8Array(hexString.length / 2)
              for (let i = 0; i < hexString.length; i += 2) {
                bytes[i / 2] = parseInt(hexString.substr(i, 2), 16)
              }
              rulesText = new TextDecoder().decode(bytes)
            } else {
              // If it's already a Uint8Array
              rulesText = new TextDecoder().decode(new Uint8Array((coach as any).rules))
            }
          } catch (error) {
            console.warn(`Error decoding rules for coach ${coachId}:`, error)
            rulesText = 'Error decoding rules'
          }

          const coachData = {
            id: (coach as any).id || 0,
            owner: (coach as any).owner || '',
            rules: rulesText,
            staked_amount: (coach as any).staked_amount || 0,
            performance_score: (coach as any).performance_score || 0,
            active: (coach as any).active || false,
            created_at: (coach as any).created_at || 0,
            last_performance_update: (coach as any).last_performance_update || 0,
            total_rewards_claimed: (coach as any).total_rewards_claimed || 0,
            risk_adjusted_return: (coach as any).risk_adjusted_return || 0,
          }
          console.log(`Processed coach ${coachId}:`, coachData)
          console.log(`Coach ${coachId} final ID:`, coachData.id, 'type:', typeof coachData.id)
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
