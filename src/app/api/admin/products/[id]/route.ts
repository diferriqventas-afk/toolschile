// src/app/api/admin/products/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'

async function requireAdmin() {
  const session = await auth()
  if (!session || (session.user as any).role !== 'ADMIN') throw new Error('Unauthorized')
}

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        brand: true,
        variants: { orderBy: { isDefault: 'desc' } },
        images:   { orderBy: { sortOrder: 'asc' } },
        specs:    { orderBy: { sortOrder: 'asc' } },
        reviews:  { include: { user: { select: { name: true } } }, orderBy: { createdAt: 'desc' } },
      },
    })
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(product)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 401 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()
    const body = await req.json()

    // Update product core fields
    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        name:        body.name,
        slug:        slugify(body.name),
        sku:         body.sku,
        description: body.description,
        shortDesc:   body.shortDesc,
        categoryId:  body.categoryId,
        brandId:     body.brandId,
        isFeatured:  body.isFeatured,
        isOnOffer:   body.isOnOffer,
        isActive:    body.isActive ?? true,
      },
    })

    // Replace variants: delete old, create new
    if (body.variants) {
      await prisma.productVariant.deleteMany({ where: { productId: params.id } })
      await prisma.productVariant.createMany({
        data: body.variants.map((v: any) => ({ ...v, productId: params.id })),
      })
    }

    // Replace specs
    if (body.specs) {
      await prisma.productSpec.deleteMany({ where: { productId: params.id } })
      await prisma.productSpec.createMany({
        data: body.specs.map((s: any, idx: number) => ({ ...s, productId: params.id, sortOrder: idx })),
      })
    }

    return NextResponse.json(product)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()
    // Soft delete — just deactivate
    await prisma.product.update({
      where: { id: params.id },
      data:  { isActive: false },
    })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
