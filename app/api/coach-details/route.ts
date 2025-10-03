import { NextRequest, NextResponse } from 'next/server'
import { getAllCoaches, getTotalStaked, getTotalRewardsPool, getContractHealth } from '@/lib/contracts'

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

    // Получаем все коучи из контракта
    const allCoaches = await getAllCoaches()
    
    console.log('API: All coaches from contract:', allCoaches)
    console.log('API: Looking for coach ID:', coachId)
    
    // Находим конкретного коуча по ID
    let coach = allCoaches.find(c => c.id === parseInt(coachId))
    
    // Если коуч не найден в списке всех коучей, используем прямой вызов
    if (!coach) {
      console.log('Coach not found in getAllCoaches, trying direct getCoach')
      const { getCoach } = await import('@/lib/contracts')
      coach = await getCoach(parseInt(coachId))
    }
    
    if (!coach) {
      return NextResponse.json(
        { error: 'Coach not found' },
        { status: 404 }
      )
    }

    // Получаем дополнительную информацию о контракте
    const [totalStaked, totalRewardsPool, contractHealth] = await Promise.all([
      getTotalStaked(),
      getTotalRewardsPool(),
      getContractHealth()
    ])

    // Вычисляем дополнительные метрики
    const stakedAmountAPT = coach.staked_amount / 100000000
    const totalStakedAPT = parseInt(totalStaked) / 100000000
    const totalRewardsPoolAPT = parseInt(totalRewardsPool) / 100000000
    const rewardsClaimedAPT = coach.total_rewards_claimed / 100000000
    
    // Вычисляем долю в общем стейкинге
    const stakePercentage = totalStakedAPT > 0 ? (stakedAmountAPT / totalStakedAPT) * 100 : 0
    
    // Вычисляем потенциальные награды (упрощенная формула)
    const potentialRewards = totalRewardsPoolAPT > 0 ? (stakePercentage / 100) * totalRewardsPoolAPT : 0

    // Форматируем даты
    const createdAt = coach.created_at ? new Date(coach.created_at * 1000) : null
    const lastUpdate = coach.last_performance_update ? new Date(coach.last_performance_update * 1000) : null

    // Определяем статус коуча
    let status = 'Inactive'
    let statusColor = 'gray'
    if (coach.active) {
      if (coach.performance_score > 800000) {
        status = 'Excellent'
        statusColor = 'green'
      } else if (coach.performance_score > 600000) {
        status = 'Good'
        statusColor = 'blue'
      } else if (coach.performance_score > 400000) {
        status = 'Average'
        statusColor = 'yellow'
      } else if (coach.performance_score > 0) {
        status = 'Poor'
        statusColor = 'orange'
      } else {
        status = 'New'
        statusColor = 'gray'
      }
    }

    // Вычисляем позицию в рейтинге среди всех коучей
    const sortedCoaches = allCoaches
      .filter(c => c.active) // Только активные коучи
      .sort((a, b) => {
        // Сначала по performance_score, потом по staked_amount
        if (b.performance_score !== a.performance_score) {
          return b.performance_score - a.performance_score
        }
        return b.staked_amount - a.staked_amount
      })
    
    const rank = sortedCoaches.findIndex(c => c.id === coach.id) + 1

    const coachDetails = {
      // Основная информация о коуче
      coach: {
        ...coach,
        staked_amount_apt: stakedAmountAPT || 0,
        rewards_claimed_apt: rewardsClaimedAPT || 0,
        status: status || 'Unknown',
        status_color: statusColor || 'gray',
        created_at_formatted: createdAt?.toLocaleString() || 'Unknown',
        last_performance_update_formatted: lastUpdate?.toLocaleString() || 'Never',
        days_since_creation: createdAt ? Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)) : 0,
        days_since_last_update: lastUpdate ? Math.floor((Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24)) : null,
        rank: rank || 0, // Позиция в рейтинге
        total_coaches: allCoaches.length, // Общее количество коучей
        active_coaches: allCoaches.filter(c => c.active).length, // Количество активных коучей
      },
      
      // Информация о стейкинге
      staking: {
        amount_apt: stakedAmountAPT || 0,
        amount_octas: coach.staked_amount || 0,
        percentage_of_total: stakePercentage || 0,
        is_staked: (coach.staked_amount || 0) > 0,
        can_stake: !coach.active && (coach.staked_amount || 0) === 0,
      },
      
      // Информация о наградах
      rewards: {
        claimed_apt: rewardsClaimedAPT || 0,
        claimed_octas: coach.total_rewards_claimed || 0,
        potential_apt: potentialRewards || 0,
        total_pool_apt: totalRewardsPoolAPT || 0,
        risk_adjusted_return_percent: (coach.risk_adjusted_return || 0) / 100,
      },
      
      // Информация о контракте
      contract: {
        total_staked_apt: totalStakedAPT || 0,
        total_staked_octas: totalStaked || '0',
        total_rewards_pool_apt: totalRewardsPoolAPT || 0,
        total_rewards_pool_octas: totalRewardsPool || '0',
        health_status: contractHealth?.status || 'unknown',
        health_message: contractHealth?.message || 'Unknown status',
      },
      
      // Производительность
      performance: {
        score: coach.performance_score || 0,
        score_formatted: (coach.performance_score || 0).toLocaleString(),
        risk_adjusted_return: coach.risk_adjusted_return || 0,
        risk_adjusted_return_percent: (coach.risk_adjusted_return || 0) / 100,
        last_update: lastUpdate || null,
        last_update_formatted: lastUpdate?.toLocaleString() || 'Never',
        days_since_update: lastUpdate ? Math.floor((Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24)) : null,
      },
      
      // Владелец
      owner: {
        address: coach.owner || 'Unknown',
        address_short: coach.owner ? `${coach.owner.slice(0, 6)}...${coach.owner.slice(-4)}` : 'Unknown',
        is_owner: false, // Будет установлено на клиенте
      },

      // Дополнительная статистика
      statistics: {
        total_coaches: allCoaches.length,
        active_coaches: allCoaches.filter(c => c.active).length,
        rank: rank || 0,
        percentile: allCoaches.length > 0 ? Math.round(((allCoaches.length - rank) / allCoaches.length) * 100) : 0,
        average_performance: allCoaches.length > 0 
          ? Math.round(allCoaches.reduce((sum, c) => sum + c.performance_score, 0) / allCoaches.length)
          : 0,
        average_staked: allCoaches.length > 0 
          ? Math.round(allCoaches.reduce((sum, c) => sum + c.staked_amount, 0) / allCoaches.length / 100000000 * 100) / 100
          : 0,
      }
    }

    return NextResponse.json(coachDetails)
  } catch (error) {
    console.error('Error fetching coach details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch coach details' },
      { status: 500 }
    )
  }
}
