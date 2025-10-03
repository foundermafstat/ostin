import { NextResponse } from 'next/server'
import { getAllCoaches } from '@/lib/contracts'

export async function GET() {
  try {
    const coaches = await getAllCoaches()
    return NextResponse.json(coaches)
  } catch (error) {
    console.error('Error fetching all coaches:', error)
    return NextResponse.json(
      { error: 'Failed to fetch coaches' },
      { status: 500 }
    )
  }
}
