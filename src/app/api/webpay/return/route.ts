// src/app/api/webpay/return/route.ts
// Transbank calls this URL after the user completes payment

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const body = await req.formData()
  const token = body.get('token_ws') as string

  if (!token) {
    return NextResponse.redirect(new URL('/checkout?error=cancelled', req.url))
  }

  try {
    // In production with @transbank/transbank-sdk:
    // const { WebpayPlus } = require('@transbank/transbank-sdk')
    // const tx = new WebpayPlus.Transaction()
    // const result = await tx.commit(token)
    //
    // if (result.response_code === 0) {
    //   await prisma.order.update({
    //     where: { paymentToken: token },
    //     data: { paymentStatus: 'PAID', status: 'CONFIRMED' },
    //   })
    //   return NextResponse.redirect(new URL(`/orders/${result.buy_order}?success=1`, req.url))
    // } else {
    //   return NextResponse.redirect(new URL('/checkout?error=payment_failed', req.url))
    // }

    // Dev placeholder:
    const order = await prisma.order.findFirst({ where: { paymentToken: token } })
    if (order) {
      await prisma.order.update({
        where: { id: order.id },
        data:  { paymentStatus: 'PAID', status: 'CONFIRMED' },
      })
      return NextResponse.redirect(new URL(`/orders/${order.orderNumber}?success=1`, req.url))
    }

    return NextResponse.redirect(new URL('/checkout?error=not_found', req.url))
  } catch (error) {
    console.error('Webpay error:', error)
    return NextResponse.redirect(new URL('/checkout?error=gateway_error', req.url))
  }
}

// Transbank also hits GET for cancelled transactions
export async function GET(req: NextRequest) {
  return NextResponse.redirect(new URL('/checkout?error=cancelled', req.url))
}
