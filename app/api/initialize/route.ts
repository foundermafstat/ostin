import { NextRequest, NextResponse } from 'next/server'
import { initializeContract } from '@/lib/contracts'

export async function POST(request: NextRequest) {
  try {
    const { account } = await request.json()
    
    if (!account) {
      return NextResponse.json(
        { error: 'Account is required' },
        { status: 400 }
      )
    }

    // Note: This should be called with a proper Account object from the wallet
    // For now, we'll return instructions for client-side initialization
    return NextResponse.json({ 
      success: true,
      message: 'Contract initialization requires wallet signature. Please call initializeContract from the client side.',
      requiresWalletSignature: true,
      functionName: 'initialize',
      functionArguments: []
    })
  } catch (error) {
    console.error('Error preparing contract initialization:', error)
    return NextResponse.json(
      { error: 'Failed to prepare contract initialization' },
      { status: 500 }
    )
  }
}
