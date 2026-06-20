import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { ProductCard } from '@/components/product/ProductCard'
import { OfferCountdown } from '@/components/ui/OfferCountdown'
import { Shield, Truck, CreditCard, Headphones, ChevronRight, Star } from 'lucide-react'

export const metadata: Metadata = {
  title: 'ToolsChile — Herramientas Profesionales para Todo Chile',
}

const CATEGORIES = [
  { name: 'Taladros',        slug: 'taladros',       emoji: '🔧' },
  { name: 'Atornilladores',  slug: 'atornilladores', emoji: '⚙️' },
  { name: 'Esmeriles',       slug: 'esmeriles',      emoji: '🔩' },
  { name: 'Sierras',         slug: 'sierras',        emoji: '🪚' },
  { name: 'Podadoras',       slug: 'podadoras',      emoji: '🌿' },
  { name: 'Generadores',     slug: 'generadores',    emoji: '⚡' },
  { name: 'Compresores',     slug: 'compresores',    emoji: '💨' },
  { name: 'Manuales',        slug: 'manuales',       emoji: '🧰' },
  { name: 'Accesorios',      slug: 'accesorios',     emoji: '📦' },
  { name: 'Jardinería',      slug: 'jardineria',     emoji: '🌱' },
]

const BRANDS = [
  { name: 'Makita',    color: '#00b7e0', count: 142 },
  { name: 'DeWalt',    color: '#f5a200', count: 98  },
  { name: 'Bosch',     color: '#e2231a', count: 115 },
  { name: 'Milwaukee', color: '#cc0000', count: 76  },
  { name: 'Stanley',   color: '#0057a8', count: 63  },
  { name: 'Total',     color: '#333333', count: 51  },
]

const TESTIMONIALS = [
  { name: 'Carlos Pizarro',    city: 'Concepción',  rating: 5, text: 'Compré un taladro Makita y llegó en 2 días. Embalaje perfecto y precio imbatible. Sin duda vuelvo a comprar.' },
  { name: 'María Valenzuela',  city: 'Santiago',    rating: 5, text: 'Excelente atención, me ayudaron a elegir el esmeril ideal para mi taller. El envío llegó antes de lo prometido.' },
  { name: 'Jorge Molina',      city: 'Valparaíso',  rating: 4, text: 'Buena variedad de productos. El soporte técnico resolvió mis dudas rápido por WhatsApp. Muy recomendado.' },
  { name: 'Roberto Guerrero',  city: 'Antofagasta', rating: 5, text: 'Encontré el compresor que buscaba a buen precio. Llegó a Antofagasta sin problemas. ToolsChile es lo mejor.' },
]

const TRUST_ITEMS = [
  { icon: Truck,        label: 'Envíos a todo Chile', desc: 'Despacho en 24–72 hrs' },
  { icon: Shield,       label: 'Garantía Oficial',    desc: '12 meses en todos los productos' },
  { icon: CreditCard,   label: 'Pago Seguro',         desc: 'Webpay · MercadoPago · Transferencia' },
  { icon: Headphones,   label: 'Soporte Especializado', desc: 'Lun–Vie 9:00–18:00' },
]

async function getFeaturedProducts() {
  return prisma.product.findMany({
    where:   { isActive: true, isFeatured: true },
    take:    8,
    orderBy: { createdAt: 'desc' },
    include: {
      category: true,
      brand:    true,
      images:   { where: { isPrimary: true }, take: 1 },
      variants: { where: { isDefault: true }, take: 1 },
      _count:   { select: { reviews: true } },
    },
  })
}

async function getOfferProducts() {
  return prisma.product.findMany({
    where:   { isActive: true, isOnOffer: true },
    take:    4,
    orderBy: { updatedAt: 'desc' },
    include: {
      brand:    true,
      images:   { where: { isPrimary: true }, take: 1 },
      variants: { where: { isDefault: true }, take: 1 },
    },
  })
}

export default async function HomePage() {
  const [featured, offers] = await Promise.all([getFeaturedProducts(), getOfferProducts()])

  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-blue via-brand-blue-dark to-[#1a1a2e] py-16 px-4">
        {/* decorative circles */}
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-brand-orange/10 pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-72 h-72 rounded-full bg-white/5 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-block text-brand-orange text-xs font-semibold tracking-widest uppercase mb-4">
              Herramientas Profesionales
            </span>
            <h1 className="font-display text-4xl lg:text-5xl font-bold text-white leading-tight mb-5">
              Todo para tus proyectos,<br />
              <span className="text-brand-orange">envíos a todo Chile</span>
            </h1>
            <p className="text-white/70 text-lg mb-8 leading-relaxed max-w-lg">
              Makita, DeWalt, Bosch y más. Precios directos de distribuidor con garantía oficial y soporte técnico especializado.
            </p>
            <div className="flex flex-wrap gap-3 mb-10">
              <Link href="/catalog" className="btn-primary btn btn-lg">
                Comprar Ahora
              </Link>
              <Link href="/catalog?onOffer=true" className="btn btn-lg border-2 border-white/30 text-white hover:bg-white/10 transition">
                Ver Ofertas
              </Link>
            </div>
            {/* Trust badges */}
            <div className="flex flex-wrap gap-5">
              {['✓ Envíos a todo Chile', '✓ Garantía Oficial', '✓ Pago Seguro', '✓ Soporte Especializado'].map((b) => (
                <span key={b} className="text-white/75 text-sm flex items-center gap-1">{b}</span>
              ))}
            </div>
          </div>

          {/* Hero image placeholder — replace with real product image */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="w-80 h-80 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-9xl">
              🔧
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ─────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {TRUST_ITEMS.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="p-2.5 bg-brand-blue/10 rounded-lg flex-shrink-0">
                <Icon size={20} className="text-brand-blue" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{label}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CATEGORIES ────────────────────────────────────────────── */}
      <section className="section-alt py-14 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="section-title">Categorías <span>Destacadas</span></h2>
            <Link href="/catalog" className="text-brand-blue text-sm font-medium hover:underline flex items-center gap-1">
              Ver todas <ChevronRight size={15} />
            </Link>
          </div>
          <div className="grid grid-cols-5 lg:grid-cols-10 gap-3">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/catalog?category=${cat.slug}`}
                className="group flex flex-col items-center gap-2 p-3 bg-white rounded-xl border border-gray-100 hover:border-brand-orange hover:shadow-md transition-all duration-150 text-center"
              >
                <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center text-2xl group-hover:bg-brand-orange/20 transition">
                  {cat.emoji}
                </div>
                <span className="text-xs font-semibold text-gray-600 group-hover:text-brand-orange transition leading-tight">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ─────────────────────────────────────── */}
      <section className="py-14 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="section-title">Productos <span>Destacados</span></h2>
            <Link href="/catalog?featured=true" className="text-brand-blue text-sm font-medium hover:underline flex items-center gap-1">
              Ver todos <ChevronRight size={15} />
            </Link>
          </div>
          {featured.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {featured.map((p) => <ProductCard key={p.id} product={p as any} />)}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">📦</p>
              <p>Pronto habrá productos aquí. Agrega productos desde el panel de admin.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── OFFERS OF THE WEEK ────────────────────────────────────── */}
      <section className="py-14 px-4 section-alt">
        <div className="max-w-7xl mx-auto">
          {/* Banner with countdown */}
          <div className="rounded-2xl bg-gradient-to-r from-[#1a1a2e] to-brand-blue-dark p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-brand-orange text-xs font-bold uppercase tracking-widest">🔥 Tiempo limitado</span>
              <h2 className="font-display text-2xl font-bold text-white mt-1">Ofertas de la Semana</h2>
              <p className="text-white/60 text-sm mt-1">Descuentos exclusivos que terminan pronto</p>
            </div>
            <OfferCountdown />
          </div>
          {offers.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {offers.map((p) => <ProductCard key={p.id} product={p as any} className="border-2 border-brand-orange/30" />)}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <p>No hay ofertas activas. Actívalas desde el panel de admin.</p>
            </div>
          )}
          <div className="text-center mt-8">
            <Link href="/catalog?onOffer=true" className="btn-primary btn">
              Ver todas las ofertas
            </Link>
          </div>
        </div>
      </section>

      {/* ── BRANDS ────────────────────────────────────────────────── */}
      <section className="py-14 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="section-title text-center mb-10">Marcas <span>Oficiales</span></h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {BRANDS.map((brand) => (
              <Link
                key={brand.name}
                href={`/catalog?brand=${brand.name.toLowerCase()}`}
                className="group flex flex-col items-center gap-2 p-5 bg-white rounded-xl border border-gray-100 hover:border-brand-blue hover:shadow-md transition-all"
              >
                <span className="font-display text-base font-black" style={{ color: brand.color }}>
                  {brand.name}
                </span>
                <span className="text-xs text-gray-400">{brand.count} productos</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── BANNER CTA ────────────────────────────────────────────── */}
      <section className="py-14 px-4 bg-brand-orange">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="font-display text-3xl font-bold mb-3">¿Buscas herramientas para tu empresa?</h2>
          <p className="text-white/85 mb-7">Tenemos precios especiales para compras corporativas y proyectos de construcción en todo Chile.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="https://wa.me/56912345678" className="btn bg-white text-brand-orange hover:bg-orange-50 btn-lg font-bold">
              Cotizar por WhatsApp
            </a>
            <Link href="/contact" className="btn border-2 border-white text-white hover:bg-white/10 btn-lg">
              Contactar ventas
            </Link>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────── */}
      <section className="py-14 px-4 section-alt">
        <div className="max-w-7xl mx-auto">
          <h2 className="section-title text-center mb-10">Lo que dicen nuestros <span>Clientes</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="card p-5">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < t.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}
                    />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-4">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand-blue text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {t.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ────────────────────────────────────────────── */}
      <section className="py-14 px-4 bg-brand-blue">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="font-display text-2xl font-bold text-white mb-2">Ofertas exclusivas en tu correo</h2>
          <p className="text-white/70 mb-6 text-sm">Suscríbete y recibe un 10% de descuento en tu primera compra.</p>
          <form className="flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              placeholder="tu@email.com"
              className="input flex-1 bg-white/10 border-white/20 text-white placeholder-white/50 focus:ring-brand-orange"
            />
            <button type="submit" className="btn-primary btn whitespace-nowrap">
              Suscribirse
            </button>
          </form>
        </div>
      </section>
    </>
  )
}
