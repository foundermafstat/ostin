import { NextRequest, NextResponse } from 'next/server'

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

    if (isNaN(parseInt(coachId))) {
      return NextResponse.json(
        { error: 'Coach ID must be a valid number' },
        { status: 400 }
      )
    }

    if (isNaN(parseInt(amount))) {
      return NextResponse.json(
        { error: 'Amount must be a valid number' },
        { status: 400 }
      )
    }

    // Staking must be done client-side with wallet connection
    // This API endpoint is for validation only
    return NextResponse.json({
      success: true,
      message: 'Validation passed. Please use wallet connection to stake tokens.',
      requiresWallet: true
    })
  } catch (error) {
    console.error('Error in stake API:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process stake request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}