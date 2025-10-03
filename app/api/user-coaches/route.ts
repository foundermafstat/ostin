import { NextRequest, NextResponse } from 'next/server'
import { getUserCoaches } from '@/lib/contracts'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userAddress = searchParams.get('address')
    
    if (!userAddress) {
      return NextResponse.json(
        { error: 'User address is required' },
        { status: 400 }
      )
    }

    console.log('Fetching coaches for user:', userAddress)
    
    const coaches = await getUserCoaches(userAddress)
    
    console.log('User coaches:', coaches)
    
    return NextResponse.json(coaches)
  } catch (error) {
    console.error('Error fetching user coaches:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch user coaches',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}