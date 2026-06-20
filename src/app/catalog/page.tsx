import { Suspense } from 'react'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { ProductCard } from '@/components/product/ProductCard'
import { CatalogFilters } from '@/components/product/CatalogFilters'
import { CatalogSort } from '@/components/product/CatalogSort'
import type { ProductFilters } from '@/types'

export const metadata: Metadata = {
  title: 'Catálogo de Herramientas',
  description: 'Explora nuestro catálogo completo de herramientas eléctricas, manuales y accesorios con los mejores precios en Chile.',
}

async function getProducts(filters: ProductFilters) {
  const where: any = { isActive: true }

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { sku:  { contains: filters.search, mode: 'insensitive' } },
      { brand: { name: { contains: filters.search, mode: 'insensitive' } } },
    ]
  }
  if (filters.categorySlug) where.category = { slug: filters.categorySlug }
  if (filters.brandId)      where.brandId = filters.brandId
  if (filters.onOffer)      where.isOnOffer = true
  if (filters.inStock)      where.variants = { some: { stock: { gt: 0 } } }
  if (filters.minPrice || filters.maxPrice) {
    where.variants = {
      ...(where.variants ?? {}),
      some: {
        price: {
          ...(filters.minPrice ? { gte: filters.minPrice } : {}),
          ...(filters.maxPrice ? { lte: filters.maxPrice } : {}),
        },
      },
    }
  }

  const orderBy: any =
    filters.sortBy === 'price_asc'   ? { variants: { _min: { price: 'asc' } } }
    : filters.sortBy === 'price_desc' ? { variants: { _max: { price: 'desc' } } }
    : filters.sortBy === 'best_rated' ? { reviews: { _avg: { rating: 'desc' } } }
    : { createdAt: 'desc' }

  const page  = filters.page  ?? 1
  const limit = filters.limit ?? 24
  const skip  = (page - 1) * limit

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        category: true,
        brand:    true,
        images:   { orderBy: { sortOrder: 'asc' }, take: 1 },
        variants: { where: { isDefault: true }, take: 1 },
        _count:   { select: { reviews: true } },
        _avg:     { select: { reviews: { select: { rating: true } } } } as any,
      },
    }),
    prisma.product.count({ where }),
  ])

  return { products, total, page, limit }
}

async function getFiltersData() {
  const [categories, brands] = await Promise.all([
    prisma.category.findMany({ where: { isActive: true, parentId: null }, include: { children: true } }),
    prisma.brand.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
  ])
  return { categories, brands }
}

interface PageProps {
  searchParams: {
    search?: string
    category?: string
    brand?: string
    minPrice?: string
    maxPrice?: string
    inStock?: string
    onOffer?: string
    sort?: string
    page?: string
  }
}

export default async function CatalogPage({ searchParams }: PageProps) {
  const filters: ProductFilters = {
    search:       searchParams.search,
    categorySlug: searchParams.category,
    brandId:      searchParams.brand,
    minPrice:     searchParams.minPrice ? Number(searchParams.minPrice) : undefined,
    maxPrice:     searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
    inStock:      searchParams.inStock === 'true',
    onOffer:      searchParams.onOffer === 'true',
    sortBy:       (searchParams.sort as any) ?? 'newest',
    page:         searchParams.page ? Number(searchParams.page) : 1,
    limit:        24,
  }

  const [{ products, total }, filtersData] = await Promise.all([
    getProducts(filters),
    getFiltersData(),
  ])

  const totalPages = Math.ceil(total / 24)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex gap-8">
        {/* Sidebar filters */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <CatalogFilters
            categories={filtersData.categories}
            brands={filtersData.brands}
            currentFilters={filters}
          />
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display text-xl font-bold text-gray-900">
                {searchParams.search ? `Resultados para "${searchParams.search}"` : 'Catálogo'}
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">{total} productos encontrados</p>
            </div>
            <CatalogSort currentSort={filters.sortBy!} />
          </div>

          {products.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-5xl mb-4">🔍</p>
              <h2 className="font-display text-xl font-bold text-gray-700 mb-2">Sin resultados</h2>
              <p className="text-gray-500">Intenta con otros filtros o busca por nombre de producto.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p as any} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <a
                      key={p}
                      href={`?${new URLSearchParams({ ...searchParams, page: String(p) })}`}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium transition ${
                        p === filters.page
                          ? 'bg-brand-blue text-white'
                          : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {p}
                    </a>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
