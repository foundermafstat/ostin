import { NextRequest, NextResponse } from 'next/server'
import { getAccountBalance } from '@/lib/contracts'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')
    
    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      )
    }

    console.log('Fetching balance for address:', address)
    
    const balance = await getAccountBalance(address)
    
    console.log('Account balance:', balance)
    
    return NextResponse.json({
      balance,
      formattedBalance: (parseInt(balance) / 100000000).toFixed(4) // Convert octas to APT
    })
  } catch (error) {
    console.error('Error fetching account balance:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch account balance',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
