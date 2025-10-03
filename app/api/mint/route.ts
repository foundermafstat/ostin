import { NextRequest, NextResponse } from 'next/server'
import { mintCoach } from '@/lib/contracts'

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

    // For now, we'll return an error since we can't sign transactions on the server
    // This is just a placeholder for the alternative method
    return NextResponse.json(
      { 
        error: 'Server-side minting not implemented. Please use wallet connection method.',
        requiresWallet: true
      },
      { status: 501 }
    )

  } catch (error) {
    console.error('Error in mint API:', error)
    return NextResponse.json(
      { error: 'Failed to process mint request' },
      { status: 500 }
    )
  }
}