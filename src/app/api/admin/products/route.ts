// src/app/api/admin/products/route.ts
// GET /api/admin/products  — list all products
// POST /api/admin/products — create product

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'
import { z } from 'zod'

const productSchema = z.object({
  name:        z.string().min(3),
  sku:         z.string().min(1),
  categoryId:  z.string(),
  brandId:     z.string(),
  description: z.string().optional(),
  shortDesc:   z.string().optional(),
  isFeatured:  z.boolean().default(false),
  isOnOffer:   z.boolean().default(false),
  variants: z.array(z.object({
    name:         z.string(),
    price:        z.number(),
    comparePrice: z.number().optional(),
    stock:        z.number().min(0),
    sku:          z.string().optional(),
    isDefault:    z.boolean(),
  })),
  specs: z.array(z.object({
    label: z.string(),
    value: z.string(),
    sortOrder: z.number().default(0),
  })).default([]),
})

async function requireAdmin() {
  const session = await auth()
  if (!session || (session.user as any).role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }
  return session
}

export async function GET(req: NextRequest) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(req.url)
    const page  = Number(searchParams.get('page')  ?? 1)
    const limit = Number(searchParams.get('limit') ?? 20)
    const search = searchParams.get('search') ?? ''

    const where: any = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku:  { contains: search, mode: 'insensitive' } },
      ]
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip:    (page - 1) * limit,
        take:    limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { name: true } },
          brand:    { select: { name: true } },
          variants: { select: { price: true, stock: true, isDefault: true } },
          images:   { select: { url: true, isPrimary: true }, take: 1 },
        },
      }),
      prisma.product.count({ where }),
    ])

    return NextResponse.json({ products, total, page, limit, totalPages: Math.ceil(total / limit) })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.message === 'Unauthorized' ? 401 : 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
    const body = await req.json()
    const data = productSchema.parse(body)

    const slug = slugify(data.name)

    const product = await prisma.product.create({
      data: {
        name:        data.name,
        sku:         data.sku,
        slug,
        description: data.description,
        shortDesc:   data.shortDesc,
        categoryId:  data.categoryId,
        brandId:     data.brandId,
        isFeatured:  data.isFeatured,
        isOnOffer:   data.isOnOffer,
        variants: { create: data.variants },
        specs:    { create: data.specs },
      },
      include: { variants: true, specs: true },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (e: any) {
    if (e.code === 'P2002') {
      return NextResponse.json({ error: 'SKU o nombre ya existe' }, { status: 409 })
    }
    return NextResponse.json({ error: e.message }, { status: e.message === 'Unauthorized' ? 401 : 400 })
  }
}
