'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCartStore } from '@/lib/cart-store'
import { formatCLP, formatRut, validateRut, calculateShipping, CHILE_REGIONS } from '@/lib/utils'
import { CreditCard, Building2, Smartphone, Truck, Shield, Lock } from 'lucide-react'

const checkoutSchema = z.object({
  firstName: z.string().min(2, 'Ingresa tu nombre'),
  lastName:  z.string().min(2, 'Ingresa tu apellido'),
  rut:       z.string().refine(validateRut, 'RUT inválido'),
  email:     z.string().email('Correo inválido'),
  phone:     z.string().regex(/^\+?56\s?9\s?\d{4}\s?\d{4}$/, 'Teléfono inválido (+56 9 XXXX XXXX)'),
  region:    z.string().min(1, 'Selecciona una región'),
  comuna:    z.string().min(2, 'Ingresa tu comuna'),
  address:   z.string().min(5, 'Ingresa tu dirección'),
  apartment: z.string().optional(),
  paymentMethod: z.enum(['WEBPAY', 'MERCADO_PAGO', 'BANK_TRANSFER']),
  couponCode: z.string().optional(),
  notes: z.string().optional(),
})

type CheckoutForm = z.infer<typeof checkoutSchema>

const PAYMENT_OPTIONS = [
  {
    id: 'WEBPAY',
    label: 'Webpay Plus',
    desc: 'Tarjeta de crédito o débito',
    icon: CreditCard,
    badge: 'Recomendado',
  },
  {
    id: 'MERCADO_PAGO',
    label: 'Mercado Pago',
    desc: 'Cuotas sin interés disponibles',
    icon: Smartphone,
    badge: null,
  },
  {
    id: 'BANK_TRANSFER',
    label: 'Transferencia bancaria',
    desc: '5% descuento adicional',
    icon: Building2,
    badge: '5% off',
  },
]

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCartStore()
  const [coupon, setCoupon] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const shipping = calculateShipping(subtotal)
  const total = subtotal + shipping - couponDiscount

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { paymentMethod: 'WEBPAY' },
  })

  const paymentMethod = watch('paymentMethod')

  async function onSubmit(data: CheckoutForm) {
    setSubmitting(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, items, subtotal, shipping, discount: couponDiscount, total }),
      })
      const order = await res.json()

      if (data.paymentMethod === 'WEBPAY') {
        // Redirect to Webpay
        window.location.href = order.webpayUrl
      } else if (data.paymentMethod === 'MERCADO_PAGO') {
        window.location.href = order.mpUrl
      } else {
        clearCart()
        window.location.href = `/orders/${order.orderNumber}?payment=transfer`
      }
    } catch {
      alert('Error al procesar el pedido. Intenta nuevamente.')
    } finally {
      setSubmitting(false)
    }
  }

  async function applyCoupon() {
    const res = await fetch(`/api/coupons/validate?code=${coupon}&subtotal=${subtotal}`)
    const data = await res.json()
    if (data.valid) setCouponDiscount(data.discountAmount)
    else alert('Cupón inválido o expirado')
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <p className="text-5xl mb-4">🛒</p>
        <h1 className="font-display text-2xl font-bold mb-2">Tu carrito está vacío</h1>
        <a href="/catalog" className="btn-primary btn mt-4">Ver catálogo</a>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="font-display text-2xl font-bold mb-8">Finalizar compra</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="grid lg:grid-cols-5 gap-8">
        {/* Left — form */}
        <div className="lg:col-span-3 space-y-7">

          {/* Personal data */}
          <section className="card p-6">
            <h2 className="font-display font-bold text-lg mb-5">Datos personales</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Nombre *</label>
                <input {...register('firstName')} className="input" placeholder="Juan" />
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="label">Apellido *</label>
                <input {...register('lastName')} className="input" placeholder="González" />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
              </div>
              <div>
                <label className="label">RUT *</label>
                <input
                  {...register('rut')}
                  className="input"
                  placeholder="12.345.678-9"
                  onChange={(e) => {
                    const formatted = formatRut(e.target.value)
                    setValue('rut', formatted)
                  }}
                />
                {errors.rut && <p className="text-red-500 text-xs mt-1">{errors.rut.message}</p>}
              </div>
              <div>
                <label className="label">Teléfono *</label>
                <input {...register('phone')} className="input" placeholder="+56 9 1234 5678" />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
              </div>
              <div className="col-span-2">
                <label className="label">Correo electrónico *</label>
                <input {...register('email')} type="email" className="input" placeholder="juan@email.com" />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>
            </div>
          </section>

          {/* Shipping */}
          <section className="card p-6">
            <h2 className="font-display font-bold text-lg mb-5 flex items-center gap-2">
              <Truck size={20} className="text-brand-blue" /> Dirección de envío
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Región *</label>
                <select {...register('region')} className="input">
                  <option value="">Seleccionar región</option>
                  {['Arica y Parinacota','Tarapacá','Antofagasta','Atacama','Coquimbo','Valparaíso',
                    'Metropolitana de Santiago',"O'Higgins",'Maule','Ñuble','Biobío','La Araucanía',
                    'Los Ríos','Los Lagos','Aysén','Magallanes'].map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                {errors.region && <p className="text-red-500 text-xs mt-1">{errors.region.message}</p>}
              </div>
              <div>
                <label className="label">Comuna *</label>
                <input {...register('comuna')} className="input" placeholder="Santiago" />
                {errors.comuna && <p className="text-red-500 text-xs mt-1">{errors.comuna.message}</p>}
              </div>
              <div className="col-span-2">
                <label className="label">Dirección *</label>
                <input {...register('address')} className="input" placeholder="Av. Providencia 1234" />
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
              </div>
              <div className="col-span-2">
                <label className="label">Dpto / Casa / Oficina (opcional)</label>
                <input {...register('apartment')} className="input" placeholder="Depto 502" />
              </div>
              <div className="col-span-2">
                <label className="label">Notas para el delivery (opcional)</label>
                <textarea {...register('notes')} className="input resize-none h-20" placeholder="Instrucciones especiales..." />
              </div>
            </div>
          </section>

          {/* Payment */}
          <section className="card p-6">
            <h2 className="font-display font-bold text-lg mb-5 flex items-center gap-2">
              <Lock size={20} className="text-brand-blue" /> Método de pago
            </h2>
            <div className="space-y-3">
              {PAYMENT_OPTIONS.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${
                    paymentMethod === opt.id
                      ? 'border-brand-blue bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    value={opt.id}
                    {...register('paymentMethod')}
                    className="accent-brand-blue"
                  />
                  <opt.icon size={22} className={paymentMethod === opt.id ? 'text-brand-blue' : 'text-gray-400'} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{opt.label}</span>
                      {opt.badge && (
                        <span className="badge-orange text-xs">{opt.badge}</span>
                      )}
                    </div>
                    <p className="text-gray-500 text-xs">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
              <Shield size={14} /> Pago 100% seguro con cifrado SSL
            </div>
          </section>
        </div>

        {/* Right — order summary */}
        <div className="lg:col-span-2">
          <div className="card p-6 sticky top-24">
            <h2 className="font-display font-bold text-lg mb-5">Resumen del pedido</h2>

            <div className="space-y-3 mb-5 max-h-56 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                    🔧
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium line-clamp-2 text-gray-800">{item.product.name}</p>
                    <p className="text-xs text-gray-500">Cant: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                    {formatCLP(item.variant.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            {/* Coupon */}
            <div className="border-t pt-4 mb-4">
              <div className="flex gap-2">
                <input
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                  placeholder="Código de descuento"
                  className="input text-sm flex-1"
                />
                <button type="button" onClick={applyCoupon} className="btn-outline text-xs px-3">
                  Aplicar
                </button>
              </div>
            </div>

            {/* Totals */}
            <div className="space-y-2 text-sm border-t pt-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatCLP(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Envío</span>
                <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                  {shipping === 0 ? 'Gratis' : formatCLP(shipping)}
                </span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Descuento cupón</span>
                  <span>-{formatCLP(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg border-t pt-3 mt-2">
                <span>Total</span>
                <span className="text-brand-blue">{formatCLP(total)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary btn w-full mt-5 text-base py-3 gap-2"
            >
              {submitting ? 'Procesando...' : `Pagar ${formatCLP(total)}`}
            </button>

            <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
              <Shield size={12} /> Compra protegida · Garantía oficial
            </p>
          </div>
        </div>
      </form>
    </div>
  )
}
