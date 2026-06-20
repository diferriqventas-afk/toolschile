'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, CartState, Product, ProductVariant } from '@/types'

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product: Product, variant: ProductVariant, qty = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.variant.id === variant.id)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.variant.id === variant.id
                  ? { ...i, quantity: Math.min(i.quantity + qty, variant.stock) }
                  : i
              ),
            }
          }
          const newItem: CartItem = {
            id: `${product.id}-${variant.id}`,
            product,
            variant,
            quantity: qty,
          }
          return { items: [...state.items, newItem] }
        })
      },

      removeItem: (variantId: string) => {
        set((state) => ({
          items: state.items.filter((i) => i.variant.id !== variantId),
        }))
      },

      updateQuantity: (variantId: string, qty: number) => {
        set((state) => ({
          items:
            qty <= 0
              ? state.items.filter((i) => i.variant.id !== variantId)
              : state.items.map((i) =>
                  i.variant.id === variantId ? { ...i, quantity: qty } : i
                ),
        }))
      },

      clearCart: () => set({ items: [] }),

      get subtotal() {
        return get().items.reduce(
          (acc, i) => acc + i.variant.price * i.quantity,
          0
        )
      },

      get total() {
        const subtotal = get().subtotal
        const shipping = subtotal >= 50000 ? 0 : 4990
        return subtotal + shipping
      },

      get itemCount() {
        return get().items.reduce((acc, i) => acc + i.quantity, 0)
      },
    }),
    { name: 'toolschile-cart' }
  )
)
