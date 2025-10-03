import { NextResponse } from 'next/server'
import { getAllCoaches, getCoach } from '@/lib/contracts'

export async function GET() {
  try {
    console.log('=== DEBUG COACHES API ===')
    
    // Получаем все коучи
    const allCoaches = await getAllCoaches()
    console.log('All coaches:', allCoaches)
    
    // Пробуем получить коуча с ID 1 напрямую
    const coach1 = await getCoach(1)
    console.log('Coach 1 direct:', coach1)
    
    return NextResponse.json({
      allCoaches,
      coach1,
      totalCoaches: allCoaches.length,
      coach1Found: !!coach1,
      coach1InAllCoaches: allCoaches.find(c => c.id === 1)
    })
  } catch (error) {
    console.error('Debug coaches error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
