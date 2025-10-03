import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { rules } = await request.json()
    
    if (!rules) {
      return NextResponse.json(
        { error: 'Rules are required' },
        { status: 400 }
      )
    }

    // Return instructions for client-side transaction signing
    return NextResponse.json({ 
      success: true,
      message: 'Ready to mint coach. Please sign the transaction in your wallet.',
      requiresWalletSignature: true,
      functionName: 'mint_coach',
      functionArguments: [rules]
    })
  } catch (error) {
    console.error('Error preparing mint transaction:', error)
    return NextResponse.json(
      { error: 'Failed to prepare mint transaction' },
      { status: 500 }
    )
  }
}
