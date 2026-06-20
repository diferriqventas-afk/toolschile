// src/app/api/coupons/validate/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code     = searchParams.get('code')?.toUpperCase()
  const subtotal = Number(searchParams.get('subtotal') ?? 0)

  if (!code) return NextResponse.json({ valid: false, error: 'Código requerido' })

  const coupon = await prisma.coupon.findUnique({ where: { code } })

  if (!coupon || !coupon.isActive) {
    return NextResponse.json({ valid: false, error: 'Cupón inválido' })
  }

  const now = new Date()
  if (coupon.startsAt && coupon.startsAt > now) {
    return NextResponse.json({ valid: false, error: 'Cupón aún no vigente' })
  }
  if (coupon.expiresAt && coupon.expiresAt < now) {
    return NextResponse.json({ valid: false, error: 'Cupón expirado' })
  }
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    return NextResponse.json({ valid: false, error: 'Cupón agotado' })
  }
  if (coupon.minOrder && subtotal < coupon.minOrder) {
    return NextResponse.json({
      valid: false,
      error: `Mínimo de compra: $${coupon.minOrder.toLocaleString('es-CL')}`,
    })
  }

  const discountAmount =
    coupon.type === 'PERCENTAGE'
      ? Math.round(subtotal * (coupon.value / 100))
      : coupon.value

  return NextResponse.json({
    valid: true,
    code,
    type:           coupon.type,
    value:          coupon.value,
    discountAmount: Math.min(discountAmount, subtotal), // never exceed subtotal
  })
}
