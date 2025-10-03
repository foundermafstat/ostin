import { NextResponse } from 'next/server'
import { getLeaderboard, getAllCoaches } from '@/lib/contracts'

export async function GET() {
  try {
    console.log('=== LEADERBOARD API CALLED ===')
    
    // Try both methods to see which one works
    const leaderboard = await getLeaderboard()
    console.log('getLeaderboard result:', leaderboard)
    
    const allCoaches = await getAllCoaches()
    console.log('getAllCoaches result:', allCoaches)
    
    // Convert coaches to leaderboard entries
    const coachesAsLeaderboard = allCoaches.map(coach => ({
      coach_id: coach.id,
      owner: coach.owner,
      performance_score: coach.performance_score,
      staked_amount: coach.staked_amount,
    }))
    
    // Use coaches if leaderboard is empty
    const result = leaderboard.length > 0 ? leaderboard : coachesAsLeaderboard
    
    console.log('Final result:', result)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
