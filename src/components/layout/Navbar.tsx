'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ShoppingCart, Search, Menu, X, User, Heart, Phone } from 'lucide-react'
import { useCartStore } from '@/lib/cart-store'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { label: 'Inicio',     href: '/' },
  { label: 'Catálogo',  href: '/catalog' },
  { label: 'Ofertas',   href: '/catalog?onOffer=true' },
  { label: 'Marcas',    href: '/brands' },
  { label: 'Blog',      href: '/blog' },
  { label: 'Contacto',  href: '/contact' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [search, setSearch] = useState('')
  const itemCount = useCartStore((s) => s.itemCount)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 4)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <>
      {/* Top bar */}
      <div className="bg-brand-blue-dark text-white text-xs py-1.5 px-4 flex justify-between items-center">
        <span className="flex items-center gap-1.5">
          <Phone size={11} /> +56 9 1234 5678 — Lun–Vie 9:00–18:00
        </span>
        <span>Envío gratis sobre $50.000</span>
      </div>

      {/* Main nav */}
      <header
        className={cn(
          'sticky top-0 z-50 bg-brand-blue transition-shadow',
          scrolled && 'shadow-lg'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 text-white font-display text-xl font-bold">
            Tools<span className="text-brand-orange">Chile</span>
          </Link>

          {/* Search — desktop */}
          <form
            className="hidden md:flex flex-1 max-w-xl"
            onSubmit={(e) => {
              e.preventDefault()
              if (search.trim()) window.location.href = `/catalog?search=${encodeURIComponent(search)}`
            }}
          >
            <div className="flex w-full rounded-lg overflow-hidden border-2 border-white/20 focus-within:border-brand-orange transition">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre, marca, SKU..."
                className="flex-1 bg-white/10 text-white placeholder-white/50 px-3.5 py-2 text-sm outline-none"
              />
              <button
                type="submit"
                className="bg-brand-orange px-4 flex items-center text-white hover:bg-orange-700 transition"
                aria-label="Buscar"
              >
                <Search size={17} />
              </button>
            </div>
          </form>

          {/* Nav links — desktop */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-white/80 hover:text-white text-sm px-3 py-1 rounded-md hover:bg-white/10 transition"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="ml-auto flex items-center gap-1">
            <Link href="/wishlist" className="btn-ghost text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-md" aria-label="Favoritos">
              <Heart size={20} />
            </Link>
            <Link href="/account" className="btn-ghost text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-md" aria-label="Mi cuenta">
              <User size={20} />
            </Link>
            <Link
              href="/cart"
              className="relative flex items-center gap-2 bg-brand-orange text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-orange-700 transition ml-1"
            >
              <ShoppingCart size={18} />
              <span className="hidden sm:inline">Carrito</span>
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-white text-brand-orange text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>
            <button
              className="lg:hidden text-white/80 hover:text-white p-2 ml-1"
              onClick={() => setOpen(true)}
              aria-label="Menú"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>

        {/* Category bar */}
        <div className="hidden md:block bg-brand-blue-dark">
          <div className="max-w-7xl mx-auto px-4 flex gap-0">
            {['Taladros','Atornilladores','Esmeriles','Sierras','Compresores','Jardinería','Manuales','Accesorios'].map((cat) => (
              <Link
                key={cat}
                href={`/catalog?category=${cat.toLowerCase()}`}
                className="text-white/70 hover:text-white text-xs px-4 py-2 hover:bg-white/10 transition whitespace-nowrap"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-brand-blue shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <span className="text-white font-display font-bold text-lg">Tools<span className="text-brand-orange">Chile</span></span>
              <button onClick={() => setOpen(false)} className="text-white/70"><X size={22} /></button>
            </div>
            <nav className="flex-1 overflow-y-auto py-4">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block text-white/80 hover:text-white hover:bg-white/10 px-5 py-3 text-sm transition"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t border-white/10 text-white/50 text-xs">
              +56 9 1234 5678
            </div>
          </div>
        </div>
      )}
    </>
  )
}
