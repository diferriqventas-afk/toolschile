// src/app/api/orders/route.ts
// POST /api/orders — crear pedido y redirigir a pasarela de pago

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const orderSchema = z.object({
  firstName:     z.string(),
  lastName:      z.string(),
  rut:           z.string(),
  email:         z.string().email(),
  phone:         z.string(),
  region:        z.string(),
  comuna:        z.string(),
  address:       z.string(),
  apartment:     z.string().optional(),
  paymentMethod: z.enum(['WEBPAY', 'MERCADO_PAGO', 'BANK_TRANSFER']),
  couponCode:    z.string().optional(),
  notes:         z.string().optional(),
  items:         z.array(z.object({
    product: z.object({ id: z.string(), name: z.string() }),
    variant: z.object({ id: z.string(), price: z.number() }),
    quantity: z.number(),
  })),
  subtotal: z.number(),
  shipping: z.number(),
  discount: z.number(),
  total:    z.number(),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  const body = await req.json()
  const data = orderSchema.parse(body)

  // Upsert address
  const userId = session?.user?.id ?? (await getOrCreateGuestUser(data.email, data.firstName + ' ' + data.lastName))

  const address = await prisma.address.create({
    data: {
      userId,
      firstName: data.firstName,
      lastName:  data.lastName,
      phone:     data.phone,
      region:    data.region,
      comuna:    data.comuna,
      address:   data.address,
      apartment: data.apartment,
    },
  })

  // Generate order number
  const orderNumber = `TC-${Date.now().toString().slice(-8)}`

  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId,
      addressId:     address.id,
      paymentMethod: data.paymentMethod as any,
      subtotal:      data.subtotal,
      shipping:      data.shipping,
      discount:      data.discount,
      total:         data.total,
      couponCode:    data.couponCode,
      notes:         data.notes,
      items: {
        create: data.items.map((item) => ({
          productId: item.product.id,
          variantId: item.variant.id,
          name:      item.product.name,
          price:     item.variant.price,
          quantity:  item.quantity,
        })),
      },
    },
  })

  // Increment coupon usage
  if (data.couponCode) {
    await prisma.coupon.updateMany({
      where: { code: data.couponCode },
      data:  { usedCount: { increment: 1 } },
    })
  }

  // Payment gateway redirect
  if (data.paymentMethod === 'WEBPAY') {
    const webpayUrl = await initiateWebpay(order.id, order.total, orderNumber)
    return NextResponse.json({ orderNumber, webpayUrl })
  }
  if (data.paymentMethod === 'MERCADO_PAGO') {
    const mpUrl = await initiateMercadoPago(order.id, order.total, data.items)
    return NextResponse.json({ orderNumber, mpUrl })
  }

  return NextResponse.json({ orderNumber })
}

// ─── Webpay Plus (Transbank SDK) ─────────────────────────────────────────────
async function initiateWebpay(orderId: string, amount: number, orderNumber: string) {
  // In production: use @transbank/transbank-sdk
  // const { WebpayPlus } = require('@transbank/transbank-sdk')
  // const tx = new WebpayPlus.Transaction()
  // const response = await tx.create(orderNumber, `${process.env.NEXT_PUBLIC_URL}/api/webpay/return`, amount)
  // await prisma.order.update({ where: { id: orderId }, data: { paymentToken: response.token } })
  // return response.url + '?token_ws=' + response.token

  // Dev placeholder:
  return `${process.env.NEXT_PUBLIC_URL}/orders/${orderNumber}?payment=webpay_dev`
}

// ─── MercadoPago ─────────────────────────────────────────────────────────────
async function initiateMercadoPago(orderId: string, total: number, items: any[]) {
  // In production: use mercadopago SDK
  // const mp = new MercadoPago(process.env.MP_ACCESS_TOKEN)
  // const preference = await mp.preferences.create({ items: [...], back_urls: { success: '...' } })
  // return preference.init_point

  return `${process.env.NEXT_PUBLIC_URL}/orders/pending?method=mp`
}

async function getOrCreateGuestUser(email: string, name: string) {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return existing.id
  const user = await prisma.user.create({ data: { email, name } })
  return user.id
}
