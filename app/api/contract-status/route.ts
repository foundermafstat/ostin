import { NextRequest, NextResponse } from 'next/server'
import { checkContractStatus } from '@/lib/contracts'

export async function GET(request: NextRequest) {
  try {
    const status = await checkContractStatus()
    
    return NextResponse.json({
      success: true,
      ...status
    })
  } catch (error) {
    console.error('Error checking contract status:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        message: 'Failed to check contract status'
      },
      { status: 500 }
    )
  }
}
