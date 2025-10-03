import Image from 'next/image'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Logo({ size = 'md', className = '' }: LogoProps) {
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

  return (
    <Image
      src="/ostin-logo.png"
      alt="Ostin Logo"
      width={dimensions[size].width}
      height={dimensions[size].height}
      className={`${sizeClasses[size]} ${className} font-light`}
      priority
    />
  )
}
