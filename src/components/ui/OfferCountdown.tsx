'use client'

import { useEffect, useState } from 'react'

export function OfferCountdown() {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 })

  useEffect(() => {
    function calc() {
      const now = new Date()
      // Count down to midnight
      const end = new Date(now)
      end.setHours(23, 59, 59, 0)
      const diff = Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000))
      setTime({
        h: Math.floor(diff / 3600),
        m: Math.floor((diff % 3600) / 60),
        s: diff % 60,
      })
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [])

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div className="flex items-center gap-2">
      {[
        { value: pad(time.h), label: 'Hrs'  },
        { value: pad(time.m), label: 'Min'  },
        { value: pad(time.s), label: 'Seg'  },
      ].map(({ value, label }, i) => (
        <div key={label} className="flex items-center gap-2">
          <div className="bg-white/10 rounded-lg px-3 py-2 text-center min-w-[52px]">
            <div className="text-white font-bold text-xl font-variant-numeric tabular-nums">{value}</div>
            <div className="text-white/50 text-[10px] uppercase tracking-wider">{label}</div>
          </div>
          {i < 2 && <span className="text-white/60 font-bold text-lg">:</span>}
        </div>
      ))}
    </div>
  )
}
