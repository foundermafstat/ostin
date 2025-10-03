import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { account, rules } = await request.json()
    
    if (!account) {
      return NextResponse.json(
        { error: 'Account is required' },
        { status: 400 }
      )
    }

    if (!rules || typeof rules !== 'string') {
      return NextResponse.json(
        { error: 'Rules are required and must be a string' },
        { status: 400 }
      )
    }

    if (rules.length > 1000) {
      return NextResponse.json(
        { error: 'Rules must be less than 1000 characters' },
        { status: 400 }
      )
    }

    // Minting must be done client-side with wallet connection
    // This API endpoint is for validation only
    return NextResponse.json(
      { 
        success: true,
        message: 'Validation passed. Please use wallet connection to mint coach.',
        requiresWallet: true
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error in mint API:', error)
    return NextResponse.json(
      { error: 'Failed to process mint request' },
      { status: 500 }
    )
  }
}