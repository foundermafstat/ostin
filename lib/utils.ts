import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatAddress(address: string | undefined | null, start = 6, end = 4): string {
  if (!address || typeof address !== 'string') return ''
  if (address.length <= start + end) return address
  return `${address.slice(0, start)}...${address.slice(-end)}`
}

export function formatNumber(num: number | string, decimals = 2): string {
  const n = typeof num === 'string' ? parseFloat(num) : num
  return n.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function formatPercentage(num: number | string, decimals = 1): string {
  const n = typeof num === 'string' ? parseFloat(num) : num
  return `${n.toFixed(decimals)}%`
}
