'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const variantSchema = z.object({
  name:         z.string().min(1),
  price:        z.number().min(1),
  comparePrice: z.number().optional(),
  stock:        z.number().min(0),
  sku:          z.string().optional(),
  isDefault:    z.boolean(),
})

const specSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
})

const productSchema = z.object({
  name:        z.string().min(3, 'Nombre requerido'),
  sku:         z.string().min(1, 'SKU requerido'),
  categoryId:  z.string().min(1, 'Categoría requerida'),
  brandId:     z.string().min(1, 'Marca requerida'),
  description: z.string().optional(),
  shortDesc:   z.string().optional(),
  isFeatured:  z.boolean(),
  isOnOffer:   z.boolean(),
  variants:    z.array(variantSchema).min(1, 'Al menos una variante'),
  specs:       z.array(specSchema),
})

type ProductForm = z.infer<typeof productSchema>

interface ProductFormProps {
  categories: { id: string; name: string }[]
  brands: { id: string; name: string }[]
  product?: any  // for edit mode
}

export function AdminProductForm({ categories, brands, product }: ProductFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const isEdit = !!product

  const { register, control, handleSubmit, formState: { errors } } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: product ?? {
      isFeatured: false,
      isOnOffer: false,
      variants: [{ name: 'Estándar', price: 0, stock: 0, isDefault: true }],
      specs: [],
    },
  })

  const { fields: variants, append: addVariant, remove: removeVariant } = useFieldArray({ control, name: 'variants' })
  const { fields: specs,    append: addSpec,    remove: removeSpec    } = useFieldArray({ control, name: 'specs' })

  async function onSubmit(data: ProductForm) {
    setSaving(true)
    try {
      const url = isEdit ? `/api/admin/products/${product.id}` : '/api/admin/products'
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error()
      router.push('/admin/products')
      router.refresh()
    } catch {
      alert('Error al guardar el producto')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/products" className="btn-ghost btn p-2">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-display text-xl font-bold">
            {isEdit ? 'Editar producto' : 'Nuevo producto'}
          </h1>
          <p className="text-gray-500 text-sm">{isEdit ? `SKU: ${product.sku}` : 'Completa los datos del producto'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic info */}
        <div className="card p-6">
          <h2 className="font-semibold mb-4">Información básica</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Nombre del producto *</label>
              <input {...register('name')} className="input" placeholder="Taladro Percutor 750W..." />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="label">SKU *</label>
              <input {...register('sku')} className="input" placeholder="MK-HP2071F" />
              {errors.sku && <p className="text-red-500 text-xs mt-1">{errors.sku.message}</p>}
            </div>
            <div>
              <label className="label">Categoría *</label>
              <select {...register('categoryId')} className="input">
                <option value="">Seleccionar...</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId.message}</p>}
            </div>
            <div>
              <label className="label">Marca *</label>
              <select {...register('brandId')} className="input">
                <option value="">Seleccionar...</option>
                {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              {errors.brandId && <p className="text-red-500 text-xs mt-1">{errors.brandId.message}</p>}
            </div>
            <div className="flex items-center gap-4 col-span-2 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register('isFeatured')} className="w-4 h-4 accent-brand-blue" />
                <span className="text-sm font-medium">Producto destacado</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register('isOnOffer')} className="w-4 h-4 accent-brand-orange" />
                <span className="text-sm font-medium">En oferta</span>
              </label>
            </div>
            <div className="col-span-2">
              <label className="label">Descripción corta</label>
              <textarea {...register('shortDesc')} className="input h-20 resize-none" placeholder="Resumen para lista de productos..." />
            </div>
            <div className="col-span-2">
              <label className="label">Descripción completa</label>
              <textarea {...register('description')} className="input h-32 resize-none" placeholder="Descripción detallada del producto..." />
            </div>
          </div>
        </div>

        {/* Variants */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Variantes y precios</h2>
            <button
              type="button"
              onClick={() => addVariant({ name: '', price: 0, stock: 0, isDefault: false })}
              className="btn-outline btn text-xs gap-1"
            >
              <Plus size={13} /> Agregar variante
            </button>
          </div>
          <div className="space-y-3">
            {variants.map((v, i) => (
              <div key={v.id} className="grid grid-cols-5 gap-3 p-3 bg-gray-50 rounded-lg items-end">
                <div className="col-span-2">
                  <label className="label text-xs">Nombre variante</label>
                  <input {...register(`variants.${i}.name`)} className="input text-sm" placeholder="220V, Kit 3 brocas..." />
                </div>
                <div>
                  <label className="label text-xs">Precio ($)</label>
                  <input {...register(`variants.${i}.price`, { valueAsNumber: true })} type="number" className="input text-sm" />
                </div>
                <div>
                  <label className="label text-xs">Precio comparar</label>
                  <input {...register(`variants.${i}.comparePrice`, { valueAsNumber: true })} type="number" className="input text-sm" placeholder="Opcional" />
                </div>
                <div>
                  <label className="label text-xs">Stock</label>
                  <input {...register(`variants.${i}.stock`, { valueAsNumber: true })} type="number" min="0" className="input text-sm" />
                </div>
                <div>
                  <label className="label text-xs">SKU variante</label>
                  <input {...register(`variants.${i}.sku`)} className="input text-sm" placeholder="Opcional" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" {...register(`variants.${i}.isDefault`)} className="accent-brand-blue" />
                  <span className="text-xs text-gray-600">Principal</span>
                </div>
                {variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariant(i)}
                    className="text-red-400 hover:text-red-600 transition p-1"
                    aria-label="Eliminar variante"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Specs */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Ficha técnica</h2>
            <button
              type="button"
              onClick={() => addSpec({ label: '', value: '' })}
              className="btn-outline btn text-xs gap-1"
            >
              <Plus size={13} /> Agregar especificación
            </button>
          </div>
          <div className="space-y-2">
            {specs.map((s, i) => (
              <div key={s.id} className="flex gap-3 items-center">
                <input {...register(`specs.${i}.label`)} className="input text-sm flex-1" placeholder="Potencia" />
                <input {...register(`specs.${i}.value`)} className="input text-sm flex-1" placeholder="750W" />
                <button type="button" onClick={() => removeSpec(i)} className="text-red-400 hover:text-red-600 p-1">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
            {specs.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4">No hay especificaciones. Haz clic en "Agregar" para comenzar.</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary btn gap-2">
            <Save size={16} />
            {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear producto'}
          </button>
          <Link href="/admin/products" className="btn-outline btn">Cancelar</Link>
        </div>
      </form>
    </div>
  )
}
