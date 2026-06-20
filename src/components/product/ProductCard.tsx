'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Heart } from 'lucide-react'
import { formatCLP, discountPercent, cn } from '@/lib/utils'
import { useCartStore } from '@/lib/cart-store'
import type { Product } from '@/types'
import { useState } from 'react'

interface ProductCardProps {
  product: Product
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem)
  const [added, setAdded] = useState(false)

  const defaultVariant = product.variants.find((v) => v.isDefault) ?? product.variants[0]
  const primaryImage = product.images.find((i) => i.isPrimary) ?? product.images[0]
  const discount = defaultVariant?.comparePrice
    ? discountPercent(defaultVariant.price, defaultVariant.comparePrice)
    : 0
  const rating = product._avg?.rating ?? 0
  const reviewCount = product._count?.reviews ?? 0

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    if (!defaultVariant) return
    addItem(product, defaultVariant)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <Link href={`/product/${product.slug}`} className={cn('card-hover group flex flex-col', className)}>
      {/* Image */}
      <div className="relative overflow-hidden rounded-t-xl bg-gray-50 aspect-square">
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt ?? product.name}
            fill
            className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-300">
            <span className="text-5xl">🔧</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discount > 0 && (
            <span className="badge-orange text-xs font-bold">-{discount}%</span>
          )}
          {product.isOnOffer && (
            <span className="badge bg-red-500 text-white text-xs">Oferta</span>
          )}
          {defaultVariant?.stock === 0 && (
            <span className="badge bg-gray-200 text-gray-600 text-xs">Sin stock</span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => e.preventDefault()}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 text-gray-400 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
          aria-label="Agregar a favoritos"
        >
          <Heart size={15} />
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-3">
        <p className="text-xs font-semibold text-brand-orange uppercase tracking-wide mb-0.5">
          {product.brand.name}
        </p>
        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug flex-1 mb-2">
          {product.name}
        </h3>

        {/* Stars */}
        {reviewCount > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <span className="stars text-xs">{'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}</span>
            <span className="text-gray-400 text-xs">({reviewCount})</span>
          </div>
        )}

        {/* Pricing */}
        {defaultVariant && (
          <div className="mb-2">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-brand-blue font-bold text-lg">
                {formatCLP(defaultVariant.price)}
              </span>
              {defaultVariant.comparePrice && (
                <span className="text-gray-400 text-xs line-through">
                  {formatCLP(defaultVariant.comparePrice)}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Stock indicator */}
        {defaultVariant && defaultVariant.stock > 0 && defaultVariant.stock <= 5 && (
          <p className="text-orange-600 text-xs mb-2">⚠ Solo {defaultVariant.stock} disponibles</p>
        )}
        {defaultVariant && defaultVariant.stock > 5 && (
          <p className="text-green-600 text-xs mb-2">✓ En stock</p>
        )}

        {/* Add to cart */}
        <button
          onClick={handleAddToCart}
          disabled={!defaultVariant || defaultVariant.stock === 0}
          className={cn(
            'btn w-full text-xs gap-1.5 mt-auto',
            added ? 'bg-green-600 text-white' : 'btn-secondary'
          )}
        >
          <ShoppingCart size={14} />
          {added ? '¡Agregado!' : defaultVariant?.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
        </button>
      </div>
    </Link>
  )
}
