'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
}

// Simple global event bus
const listeners: ((toast: Toast) => void)[] = []

export function toast(message: string, type: ToastType = 'success') {
  const t: Toast = { id: Date.now().toString(), message, type }
  listeners.forEach((fn) => fn(t))
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const handler = (t: Toast) => {
      setToasts((prev) => [...prev, t])
      setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== t.id)), 3500)
    }
    listeners.push(handler)
    return () => { const i = listeners.indexOf(handler); if (i > -1) listeners.splice(i, 1) }
  }, [])

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-white text-sm font-medium animate-slide-up pointer-events-auto ${
            t.type === 'success' ? 'bg-green-600' :
            t.type === 'error'   ? 'bg-red-600'   : 'bg-brand-blue'
          }`}
        >
          {t.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
          {t.message}
        </div>
      ))}
    </div>
  )
}
