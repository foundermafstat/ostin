import { NextRequest, NextResponse } from 'next/server'
import { stakeTokens } from '@/lib/contracts'
import { Account } from '@aptos-labs/ts-sdk'

export async function POST(request: NextRequest) {
  try {
    const { coachId, amount, account } = await request.json()
    
    console.log('Stake API called with:', { coachId, amount })
    
    if (!coachId || !amount || !account) {
      return NextResponse.json(
        { error: 'Missing required parameters: coachId, amount, account' },
        { status: 400 }
      )
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Stake amount must be greater than 0' },
        { status: 400 }
      )
    }

    // Create Account instance from address
    const aptosAccount = Account.fromPrivateKey({ privateKey: new Uint8Array(32) }) // This won't work for actual transactions
    // For now, we'll need to get the account from the wallet context
    // This is a limitation - we need the actual Account instance from the wallet
    
    console.log('Staking tokens for coach:', coachId, 'amount:', amount)
    
    const transactionHash = await stakeTokens(aptosAccount, parseInt(coachId), parseInt(amount))
    
    console.log('Stake transaction successful:', transactionHash)
    
    return NextResponse.json({
      success: true,
      transactionHash,
      message: `Successfully staked ${amount} APT tokens for coach ${coachId}`
    })
  } catch (error) {
    console.error('Error in stake API:', error)
    return NextResponse.json(
      { 
        error: 'Failed to stake tokens',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}