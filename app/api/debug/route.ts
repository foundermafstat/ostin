import { NextResponse } from 'next/server'
import { getContractDiagnostics, getAllCoaches } from '@/lib/contracts'

export async function GET() {
  try {
    console.log('=== DEBUG API CALLED ===')
    
    // Get contract diagnostics
    const diagnostics = await getContractDiagnostics()
    console.log('Contract diagnostics:', diagnostics)
    
    // Try to get all coaches
    const coaches = await getAllCoaches()
    console.log('All coaches:', coaches)
    
    return NextResponse.json({
      diagnostics,
      coaches,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error in debug API:', error)
    return NextResponse.json(
      { 
        error: 'Debug failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
