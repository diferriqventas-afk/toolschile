import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { formatCLP, ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from '@/lib/utils'
import {
  DollarSign, ShoppingBag, Package, Users,
  TrendingUp, TrendingDown, ArrowRight
} from 'lucide-react'
import Link from 'next/link'

async function getDashboardStats() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const [
    totalRevenue, lastMonthRevenue,
    totalOrders, lastMonthOrders,
    totalProducts, totalCustomers,
    recentOrders, topProducts,
  ] = await Promise.all([
    prisma.order.aggregate({ where: { paymentStatus: 'PAID' }, _sum: { total: true } }),
    prisma.order.aggregate({ where: { paymentStatus: 'PAID', createdAt: { gte: startOfLastMonth, lt: startOfMonth } }, _sum: { total: true } }),
    prisma.order.count(),
    prisma.order.count({ where: { createdAt: { gte: startOfLastMonth, lt: startOfMonth } } }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.order.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    }),
  ])

  return {
    totalRevenue: totalRevenue._sum.total ?? 0,
    lastMonthRevenue: lastMonthRevenue._sum.total ?? 0,
    totalOrders,
    lastMonthOrders,
    totalProducts,
    totalCustomers,
    recentOrders,
    topProducts,
  }
}

function StatCard({
  label, value, icon: Icon, change, prefix = '', color,
}: {
  label: string
  value: string | number
  icon: any
  change?: number
  prefix?: string
  color: string
}) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-lg ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium ${change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {change >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <p className="text-gray-500 text-xs mb-1">{label}</p>
      <p className="font-display font-bold text-2xl text-gray-900">
        {prefix}{typeof value === 'number' ? value.toLocaleString('es-CL') : value}
      </p>
    </div>
  )
}

export default async function AdminDashboard() {
  const session = await auth()
  if (!session || (session.user as any).role !== 'ADMIN') redirect('/')

  const stats = await getDashboardStats()

  const revenueChange = stats.lastMonthRevenue
    ? Math.round(((stats.totalRevenue - stats.lastMonthRevenue) / stats.lastMonthRevenue) * 100)
    : 0

  return (
    <div className="p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm">Bienvenido al panel de administración de ToolsChile</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/products/new" className="btn-primary btn text-sm">
            + Agregar producto
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Ingresos totales"
          value={formatCLP(stats.totalRevenue)}
          icon={DollarSign}
          color="bg-brand-blue"
          change={revenueChange}
        />
        <StatCard
          label="Pedidos"
          value={stats.totalOrders}
          icon={ShoppingBag}
          color="bg-brand-orange"
          change={stats.lastMonthOrders}
        />
        <StatCard
          label="Productos activos"
          value={stats.totalProducts}
          icon={Package}
          color="bg-purple-500"
        />
        <StatCard
          label="Clientes"
          value={stats.totalCustomers}
          icon={Users}
          color="bg-teal-500"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="font-display font-bold text-base">Últimos pedidos</h2>
            <Link href="/admin/orders" className="text-brand-blue text-sm font-medium flex items-center gap-1 hover:underline">
              Ver todos <ArrowRight size={14} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500 text-xs">
                  <th className="text-left px-5 py-3 font-medium">Pedido</th>
                  <th className="text-left px-3 py-3 font-medium">Cliente</th>
                  <th className="text-left px-3 py-3 font-medium">Estado</th>
                  <th className="text-right px-5 py-3 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order: any) => (
                  <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-5 py-3">
                      <Link href={`/admin/orders/${order.id}`} className="font-medium text-brand-blue hover:underline">
                        #{order.orderNumber}
                      </Link>
                      <p className="text-gray-400 text-xs mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString('es-CL')}
                      </p>
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-medium">{order.user.name ?? '—'}</p>
                      <p className="text-gray-400 text-xs">{order.user.email}</p>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`badge text-xs ${ORDER_STATUS_COLOR[order.status]}`}>
                        {ORDER_STATUS_LABEL[order.status]}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-semibold">
                      {formatCLP(order.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick actions */}
        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="font-display font-bold text-base mb-4">Acciones rápidas</h2>
            <div className="space-y-2">
              {[
                { label: 'Agregar producto',    href: '/admin/products/new',  color: 'text-brand-blue' },
                { label: 'Ver pedidos',         href: '/admin/orders',         color: 'text-brand-orange' },
                { label: 'Gestionar cupones',   href: '/admin/coupons',        color: 'text-purple-600' },
                { label: 'Editar banners',      href: '/admin/banners',        color: 'text-teal-600' },
                { label: 'Ver clientes',        href: '/admin/customers',      color: 'text-gray-700' },
                { label: 'Gestionar categorías',href: '/admin/categories',     color: 'text-gray-700' },
              ].map((a) => (
                <Link
                  key={a.href}
                  href={a.href}
                  className={`flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition group ${a.color}`}
                >
                  <span className="font-medium text-sm">{a.label}</span>
                  <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition" />
                </Link>
              ))}
            </div>
          </div>

          <div className="card p-5 bg-brand-blue text-white">
            <h3 className="font-display font-bold mb-1">Soporte técnico</h3>
            <p className="text-blue-200 text-xs mb-3">¿Necesitas ayuda con la configuración?</p>
            <a href="mailto:soporte@toolschile.cl" className="btn bg-white text-brand-blue hover:bg-blue-50 text-sm px-4 py-2 rounded-lg font-semibold">
              Contactar soporte
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
