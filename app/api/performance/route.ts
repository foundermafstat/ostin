import { NextRequest, NextResponse } from 'next/server'
import { getCoach } from '@/lib/contracts'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const coachId = searchParams.get('coachId')
    
    if (!coachId) {
      return NextResponse.json(
        { error: 'Coach ID is required' },
        { status: 400 }
      )
    }

    const coach = await getCoach(coachId)
    
    if (!coach) {
      return NextResponse.json(
        { error: 'Coach not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(coach)
  } catch (error) {
    console.error('Error fetching coach performance:', error)
    return NextResponse.json(
      { error: 'Failed to fetch coach performance' },
      { status: 500 }
    )
  }
}
