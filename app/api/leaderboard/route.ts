import { NextResponse } from 'next/server'
import { getAllCoaches } from '@/lib/contracts'

export async function GET() {
  try {
    console.log('=== LEADERBOARD API CALLED ===')
    
    // Get all coaches directly
    const allCoaches = await getAllCoaches()
    console.log('getAllCoaches result:', allCoaches)
    
    // Convert coaches to leaderboard entries
    const coachesAsLeaderboard = allCoaches.map(coach => ({
      coach_id: coach.id,
      owner: coach.owner,
      performance_score: coach.performance_score,
      staked_amount: coach.staked_amount,
    }))
    
    console.log('Final result:', coachesAsLeaderboard)
    return NextResponse.json(coachesAsLeaderboard)
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
