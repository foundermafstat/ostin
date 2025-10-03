'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

let toasts: Toast[] = []
let listeners: ((toasts: Toast[]) => void)[] = []

export function addToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  const id = Math.random().toString(36).substr(2, 9)
  const toast = { id, message, type }
  toasts = [...toasts, toast]
  listeners.forEach(listener => listener(toasts))
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    toasts = toasts.filter(t => t.id !== id)
    listeners.forEach(listener => listener(toasts))
  }, 5000)
}

export function Toaster() {
  const [toastList, setToastList] = useState<Toast[]>([])

  useEffect(() => {
    listeners.push(setToastList)
    return () => {
      listeners = listeners.filter(l => l !== setToastList)
    }
  }, [])

  return (
    <div className="fixed bottom-4 left-4 z-50 space-y-2">
      {toastList.map(toast => (
        <div
          key={toast.id}
          className={cn(
            'p-4 rounded-lg shadow-lg max-w-sm',
            {
              'bg-green-50 border border-green-200 text-green-800': toast.type === 'success',
              'bg-red-50 border border-red-200 text-red-800': toast.type === 'error',
              'bg-blue-50 border border-blue-200 text-blue-800': toast.type === 'info',
            }
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{toast.message}</span>
            <button
              onClick={() => {
                toasts = toasts.filter(t => t.id !== toast.id)
                listeners.forEach(listener => listener(toasts))
              }}
              className="ml-2 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
