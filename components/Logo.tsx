'use client'

import Image from 'next/image'
import { useTheme } from './ThemeProvider'
import { useEffect, useState } from 'react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Logo({ size = 'md', className = '' }: LogoProps) {
  const { theme } = useTheme()
  const [isDark, setIsDark] = useState(false)
  
  const sizeClasses = {
    sm: 'h-6 w-auto',
    md: 'h-8 w-auto', 
    lg: 'h-16 w-auto'
  }

  const dimensions = {
    sm: { width: 90, height: 30 },
    md: { width: 120, height: 40 },
    lg: { width: 200, height: 67 }
  }

  useEffect(() => {
    const updateTheme = () => {
      if (theme === 'system') {
        // Проверяем системную тему
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        setIsDark(systemTheme)
      } else {
        // Используем выбранную тему
        setIsDark(theme === 'dark')
      }
    }

    updateTheme()

    // Слушаем изменения системной темы
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (theme === 'system') {
        updateTheme()
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  // Определяем какой логотип использовать в зависимости от фактической темы
  const logoSrc = isDark ? '/ostin-logo-dark.png' : '/ostin-logo.png'

  return (
    <Image
      src={logoSrc}
      alt="Ostin Logo"
      width={dimensions[size].width}
      height={dimensions[size].height}
      className={`${sizeClasses[size]} ${className} font-light transition-opacity duration-200`}
      priority
    />
  )
}
